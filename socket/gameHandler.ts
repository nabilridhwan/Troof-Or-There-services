import { Server, Socket } from "socket.io";
import prisma from "../database/prisma";
import ChatModel from "../model/chat";
import PlayerModel from "../model/player";
import RoomModel from "../model/room";
import Sequence from "../model/sequence";
import {
	Action,
	EVENTS,
	MESSAGE_EVENTS,
	PlayerIDObject,
	RoomIDObject,
	Status,
	SystemMessage,
	TRUTH_OR_DARE_GAME,
} from "../Types";
import { get_dare, get_truth } from "../utils/truthOrDareGenerator";

const gameHandler = (io: Server, socket: Socket) => {
	console.log("Registered game handler");

	const joinHandler = async (obj: RoomIDObject & PlayerIDObject) => {
		console.log(`Received joined room ${obj.room_id}`);

		// Let the socket join the room
		socket.join(obj.room_id);

		// Obtain the last log item
		const lastLogItem = prisma.log.findFirst({
			where: {
				game_room_id: obj.room_id,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		// Find the current player
		const sequenceData = await Sequence.getCurrentPlayer(obj.room_id);
		if (!sequenceData) return;
		const { current_player_id } = sequenceData;
		const player = PlayerModel.getPlayer({
			player_id: current_player_id,
		});

		// Find the player who joined
		const playerWhoJoined = PlayerModel.getPlayer({
			player_id: obj.player_id,
		});

		// Broadcast the log to the room
		console.log("Broadcasting back");

		// Get players in room
		const playersInRoom = PlayerModel.getPlayersInRoom(obj.room_id);

		Promise.all([lastLogItem, player, playersInRoom, playerWhoJoined]).then(
			([lastLogItem, player, playersInRoom, playerWhoJoinedData]) => {
				console.log(lastLogItem);
				console.log(player);
				console.log(playersInRoom);
				console.log(playerWhoJoinedData);

				// Broadcast the log to the room
				socket.emit(
					TRUTH_OR_DARE_GAME.INCOMING_DATA,
					lastLogItem!,
					player!
				);

				const systemMessageToSend: SystemMessage = {
					message: `${playerWhoJoinedData?.display_name} has joined the game`,
					room_id: obj.room_id,
					created_at: new Date(),
					type: "system",
				};

				// https://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender
				// sending to all clients in 'game' room(channel) except sender
				io.to(obj.room_id).emit(
					MESSAGE_EVENTS.MESSAGE_SYSTEM,
					systemMessageToSend
				);

				// Broadcast the players in the room
				io.to(obj.room_id).emit(EVENTS.PLAYERS_UPDATE, playersInRoom);
			}
		);
	};

	const selectTruthHandler = async (obj: RoomIDObject & PlayerIDObject) => {
		console.log(`Truth received from ${obj.player_id}`);
		// Emit a dare to the room for the player
		const truth = await get_truth();

		// Find the player
		const sequenceData = await Sequence.getCurrentPlayer(obj.room_id);

		if (!sequenceData) return;

		const { current_player_id } = sequenceData;

		console.log(`Current Player: ${current_player_id}`);

		if (!sequenceData) {
			console.log("No sequence data found. Aborting");
			return;
		}

		// Find the current player
		const player = await PlayerModel.getPlayer({
			player_id: current_player_id,
		});

		console.log("Writing to log");

		// Write to log
		const logData = await prisma.log.create({
			data: {
				game_room_id: obj.room_id,
				player_id: current_player_id,
				action: Action.Truth,
				data: truth,
			},
		});

		console.log("Emitting back new data");

		const systemMessageToSend: SystemMessage = {
			message: `${player?.display_name} selected Truth`,
			room_id: obj.room_id,
			created_at: new Date(),
			type: "system",
		};

		const dataSystemMessageToSend: SystemMessage = {
			message: `${truth}`,
			room_id: obj.room_id,
			created_at: new Date(),
			type: "system",
		};

		io.to(obj.room_id).emit(
			MESSAGE_EVENTS.MESSAGE_SYSTEM,
			systemMessageToSend
		);

		io.to(obj.room_id).emit(
			MESSAGE_EVENTS.MESSAGE_SYSTEM,
			dataSystemMessageToSend
		);

		io.to(obj.room_id).emit(
			TRUTH_OR_DARE_GAME.INCOMING_DATA,
			logData,
			player!
		);

		// Write to database
		ChatModel.pushSystemMessage(systemMessageToSend);
		ChatModel.pushSystemMessage(dataSystemMessageToSend);
	};

	const selectDareHandler = async (obj: RoomIDObject & PlayerIDObject) => {
		console.log(`Dare received from ${obj.player_id}`);

		// Emit a dare to the room for the player

		const dare = await get_dare();

		// Find the player
		const sequenceData = await Sequence.getCurrentPlayer(obj.room_id);

		if (!sequenceData) return;

		const { current_player_id } = sequenceData;

		console.log(`Current Player: ${current_player_id}`);

		if (!sequenceData) {
			console.log("No sequence data found. Aborting");
			return;
		}

		// Find the current player
		const player = await PlayerModel.getPlayer({
			player_id: current_player_id,
		});

		console.log("Writing to log");

		// Write to log
		const logData = await prisma.log.create({
			data: {
				game_room_id: obj.room_id,
				player_id: sequenceData.current_player_id,
				action: Action.Dare,
				data: dare,
			},
		});

		console.log("Emitting back new data");

		const systemMessageToSend: SystemMessage = {
			message: `${player?.display_name} selected Dare`,
			room_id: obj.room_id,
			created_at: new Date(),
			type: "system",
		};

		const dataSystemMessageToSend: SystemMessage = {
			message: `${dare}`,
			room_id: obj.room_id,
			created_at: new Date(),
			type: "system",
		};

		io.to(obj.room_id).emit(
			MESSAGE_EVENTS.MESSAGE_SYSTEM,
			systemMessageToSend
		);

		io.to(obj.room_id).emit(
			MESSAGE_EVENTS.MESSAGE_SYSTEM,
			dataSystemMessageToSend
		);

		io.to(obj.room_id).emit(
			TRUTH_OR_DARE_GAME.INCOMING_DATA,
			logData,
			player!
		);

		// Write to database
		ChatModel.pushSystemMessage(systemMessageToSend);
		ChatModel.pushSystemMessage(dataSystemMessageToSend);
	};

	const continueHandler = async (obj: RoomIDObject) => {
		console.log("Continuing to next player");

		// Find the current player in the sequence
		const sequenceData = await Sequence.getCurrentPlayer(obj.room_id);
		if (!sequenceData) return;
		// Get the current_player_id
		const { current_player_id } = sequenceData;
		console.log(`Current Player: ${current_player_id}`);
		if (!sequenceData) {
			console.log("No sequence data found. Aborting");
			return;
		}

		// Set the next player automatically (the function returns the next player)
		const nextPlayer = await Sequence.setNextPlayer(obj.room_id);
		if (!nextPlayer) return;

		// Find the current player
		const player = await PlayerModel.getPlayer({
			player_id: nextPlayer.current_player_id,
		});

		console.log("Writing to log");

		console.log("Next player set: ", nextPlayer);

		// Write to log
		const logData = await prisma.log.create({
			data: {
				game_room_id: obj.room_id,
				player_id: nextPlayer.current_player_id,
				action: Action.Waiting_For_Selection,
				data: "",
			},
			select: {
				action: true,
				data: true,
				player_id: true,
				game_room_id: true,
				created_at: true,
			},
		});

		console.log(
			`Emitting back new data: Now player ${nextPlayer.current_player_id} is waiting_for_selection`
		);

		const systemMessageToSend: SystemMessage = {
			message: `It's ${player?.display_name}'s turn`,
			room_id: obj.room_id,
			created_at: new Date(),
			type: "system",
		};

		io.to(obj.room_id).emit(
			MESSAGE_EVENTS.MESSAGE_SYSTEM,
			systemMessageToSend
		);

		io.to(obj.room_id).emit(TRUTH_OR_DARE_GAME.CONTINUE, logData!, player!);

		// Write to database
		ChatModel.pushSystemMessage(systemMessageToSend);
	};

	const leaveGameHandler = async (obj: RoomIDObject & PlayerIDObject) => {
		console.log(
			`Leave Game Handler called: Removing player ${obj.player_id} from room ${obj.room_id}`
		);

		// Get the current player
		const sequenceData = await Sequence.getCurrentPlayer(obj.room_id);

		if (!sequenceData) return;

		const { current_player_id } = sequenceData;

		// Check if the current player is also the party leader. If so, then set the next player as the party leader
		const player = await PlayerModel.getPlayer({
			player_id: obj.player_id,
		});

		const systemMessageToSend: SystemMessage = {
			message: `${player?.display_name} has left the game`,
			room_id: obj.room_id,
			created_at: new Date(),
			type: "system",
		};

		io.to(obj.room_id).emit(
			MESSAGE_EVENTS.MESSAGE_SYSTEM,
			systemMessageToSend
		);

		// Write to database
		ChatModel.pushSystemMessage(systemMessageToSend);

		// Emit to the room that the player has left, and hence the person sent back, if the ID matches, they will be redirected to home page
		console.log("Emitting EVENTS.LEFT_GAME");
		io.to(obj.room_id).emit(EVENTS.LEFT_GAME, player);

		// If the player leaving is the current player, then set the next player
		if (current_player_id === obj.player_id) {
			console.log(
				`Player ${obj.player_id} is the current player and is leaving. Skipping the user's turn.`
			);

			if (player?.is_party_leader) {
				console.log(
					"Player is the party leader. Setting the next player as the party leader"
				);

				// Set the next player as the party leader
				const nextPlayerId = await Sequence.getNextPlayerID(
					obj.room_id
				);

				if (!nextPlayerId) {
					console.log("Found no next player. Aborting");
					return;
				}

				await PlayerModel.setPlayerAsPartyLeader(nextPlayerId);
				console.log("Next player set as party leader successfully");
			}

			const remainingPlayersIfCurrentPlayerIsRemoved =
				await PlayerModel.getPlayers({
					game: {
						room_id: obj.room_id,
					},

					player_id: {
						not: obj.player_id,
					},
				});

			if (remainingPlayersIfCurrentPlayerIsRemoved.length === 0) {
				// TODO: Handle this case
				console.log(
					"No more players will be left in the room. Setting status to game_over"
				);

				// Destroy the room
				await RoomModel.updateRoomStatus(obj.room_id, Status.Game_Over);

				console.log(`Room ${obj.room_id} set to game_over`);
				return;
			}

			continueHandler(obj);

			// // Set the next player automatically (the function returns the next player)
			// const nextPlayer = await Sequence.setNextPlayer(obj.room_id);

			// if (!nextPlayer) {
			// 	console.log("No next player found. Aborting");
			// 	return;
			// }

			// console.log("Writing to log");

			// // Write to log
			// const logData = await prisma.log.create({
			// 	data: {
			// 		game_room_id: obj.room_id,
			// 		player_id: nextPlayer.current_player_id,
			// 		action: Action.Waiting_For_Selection,
			// 		data: "",
			// 	},
			// 	select: {
			// 		action: true,
			// 		data: true,
			// 		player_id: true,
			// 		game_room_id: true,
			// 		created_at: true,
			// 	},
			// });

			// // Find the current player
			// const player = await PlayerModel.getPlayer({
			// 	player_id: current_player_id,
			// });

			// socket.emit(TRUTH_OR_DARE_GAME.INCOMING_DATA, logData, player!);
		}

		try {
			// Remove player from the room
			await RoomModel.removePlayerFromRoom(obj.room_id, obj.player_id);
		} catch (error) {
			console.log(
				`Error removing player ${obj.player_id} from room: `,
				error
			);
		}

		// Get remaining players
		const remainingPlayers = await PlayerModel.getPlayersInRoom(
			obj.room_id
		);

		io.to(obj.room_id).emit(EVENTS.PLAYERS_UPDATE, remainingPlayers);
	};

	socket.on(TRUTH_OR_DARE_GAME.LEAVE_GAME, leaveGameHandler);
	socket.on(TRUTH_OR_DARE_GAME.SELECT_TRUTH, selectTruthHandler);
	socket.on(TRUTH_OR_DARE_GAME.SELECT_DARE, selectDareHandler);
	socket.on(TRUTH_OR_DARE_GAME.CONTINUE, continueHandler);
	socket.on(TRUTH_OR_DARE_GAME.JOINED, joinHandler);
};

export default gameHandler;

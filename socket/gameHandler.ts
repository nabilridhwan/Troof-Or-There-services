import { Server, Socket } from "socket.io";
import prisma from "../database/prisma";
import { getNextPlayer } from "../utils/getNextPlayer";
import { get_dare, get_truth } from "../utils/truthOrDareGenerator";
import { TRUTH_OR_DARE_GAME } from "./events.types";
import { ACTION } from "./game.types";

interface IRoomID {
	room_id: string;
}

interface IPlayer {
	player_id: string;
}

const gameHandler = (io: Server, socket: Socket) => {
	console.log("Registered game handler");

	const joinHandler = async (obj: IRoomID) => {
		console.log(`Received joined room ${obj.room_id}`);

		// Obtain the logs
		const logData = await prisma.log.findFirst({
			where: {
				game_room_id: obj.room_id,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		const sequenceData = await prisma.player_sequence.findFirst({
			where: {
				game_room_id: obj.room_id,
			},
		});

		if (!sequenceData) {
			console.log("No sequence data found. Aborting");
			return;
		}

		const { current_player_id } = sequenceData;

		// Find player with id
		const player = await prisma.player.findFirst({
			where: {
				player_id: current_player_id,
			},
		});

		// Broadcast the log to the room
		console.log("Broadcasting back");
		socket.emit(TRUTH_OR_DARE_GAME.INCOMING_DATA, {
			...logData,
			player,
		});
	};

	const selectTruthHandler = async (obj: IRoomID & IPlayer) => {
		console.log(`Truth received from ${obj.player_id}`);
		// Emit a dare to the room for the player
		const truth = get_truth();

		// Find the player
		const sequenceData = await prisma.player_sequence.findFirst({
			where: {
				game_room_id: obj.room_id,
			},
		});

		if (!sequenceData) return;

		const { sequence, current_player_id } = sequenceData;

		console.log(`Current Player: ${current_player_id}`);

		if (!sequence) return;

		if (!sequenceData) {
			console.log("No sequence data found. Aborting");
			return;
		}

		// Find player with id
		const player = await prisma.player.findFirst({
			where: {
				player_id: current_player_id,
			},
		});

		console.log("Writing to log");

		// Write to log
		const logData = await prisma.log.create({
			data: {
				game_room_id: obj.room_id,
				player_id: sequenceData.current_player_id,
				action: ACTION.TRUTH,
				data: truth,
			},
			select: {
				action: true,
				data: true,
				player_id: true,
			},
		});

		console.log("Emitting back new data");

		io.emit(TRUTH_OR_DARE_GAME.INCOMING_DATA, {
			...logData,
			player,
		});
	};

	const selectDareHandler = async (obj: IRoomID & IPlayer) => {
		console.log(`Dare received from ${obj.player_id}`);

		// Emit a dare to the room for the player
		const dare = get_dare();

		// Find the player
		const sequenceData = await prisma.player_sequence.findFirst({
			where: {
				game_room_id: obj.room_id,
			},
		});

		if (!sequenceData) return;

		const { sequence, current_player_id } = sequenceData;

		if (!sequence) return;

		// Find player with id
		const player = await prisma.player.findFirst({
			where: {
				player_id: current_player_id,
			},
		});

		// Write to log
		const logData = await prisma.log.create({
			data: {
				game_room_id: obj.room_id,
				player_id: sequenceData.current_player_id,
				action: ACTION.DARE,
				data: dare,
			},
			select: {
				action: true,
				data: true,
				player_id: true,
			},
		});

		io.emit(TRUTH_OR_DARE_GAME.INCOMING_DATA, {
			...logData,
			player,
		});
	};

	const continueHandler = async (obj: IRoomID) => {
		console.log("Continuing to next player");

		// Get the current player and find the next player, pass back the action

		// Find the current player in the sequence
		const sequenceData = await prisma.player_sequence.findFirst({
			where: {
				game_room_id: obj.room_id,
			},
		});

		if (!sequenceData) return;

		// Get the current_player_id
		const { sequence, current_player_id } = sequenceData;
		console.log(`Current Player: ${current_player_id}`);

		if (!sequence) return;

		if (!sequenceData) {
			console.log("No sequence data found. Aborting");
			return;
		}

		// Get the next player in the list
		const nextPlayerID = getNextPlayer(
			current_player_id,
			sequence as string[]
		);

		// Find the next player using the current_player_id
		const player = await prisma.player.findFirst({
			where: {
				player_id: nextPlayerID,
			},
		});

		console.log(`Next player ID: ${nextPlayerID}`);

		// Update the database with the current player being the next player
		await prisma.player_sequence.update({
			where: {
				game_room_id: obj.room_id,
			},
			data: {
				current_player_id: nextPlayerID,
			},
		});

		console.log("Writing to log");

		// Write to log
		const logData = await prisma.log.create({
			data: {
				game_room_id: obj.room_id,
				player_id: nextPlayerID,
				action: ACTION.WAITING_FOR_SELECTION,
				data: nextPlayerID,
			},
			select: {
				action: true,
				data: true,
				player_id: true,
			},
		});

		console.log(
			`Emitting back new data: Now player ${nextPlayerID} is waiting_for_selection`
		);

		io.emit(TRUTH_OR_DARE_GAME.CONTINUE, {
			...logData,
			player,
		});
	};

	socket.on(TRUTH_OR_DARE_GAME.SELECT_TRUTH, selectTruthHandler);
	socket.on(TRUTH_OR_DARE_GAME.SELECT_DARE, selectDareHandler);
	socket.on(TRUTH_OR_DARE_GAME.CONTINUE, continueHandler);
	socket.on(TRUTH_OR_DARE_GAME.JOINED, joinHandler);
};

export default gameHandler;

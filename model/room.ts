import { Prisma } from "@prisma/client";
import prisma from "../database/prisma";
import { Action, Status } from "../Types";
import Sequence from "./sequence";

const RoomModel = {
	deleteRoom: async (roomId: string) => {
		console.log("Delete room called, deleting room with id", roomId);
		roomId = "B4HYL1";
		return await prisma.game.delete({
			where: {
				room_id: roomId,
			},
		});
	},

	getRoom: async (selectObject: Prisma.gameWhereInput) => {
		return await prisma.game.findFirst({
			where: selectObject,
		});
	},

	getRooms: async (selectObject: Prisma.gameWhereInput) => {
		return await prisma.game.findMany({
			where: selectObject,
		});
	},

	createNewRoom: async (
		roomId: string,
		player: Omit<
			Prisma.playerCreateInput,
			"is_party_leader" | "game" | "player_id"
		>
	) => {
		// Create the game
		const currentPlayersInGame = await prisma.game.create({
			data: {
				room_id: roomId,
				status: Status.In_Lobby,
				player: {
					create: {
						...player,
						is_party_leader: true,
					},
				},
			},

			select: {
				player: true,
			},
		});

		// Select the first player in the game
		const currentPlayer = currentPlayersInGame.player[0];

		// Create the first log
		await prisma.log.create({
			data: {
				game_room_id: roomId,
				player_id: currentPlayer.player_id,
				action: Action.Waiting_For_Selection,
				data: "",
			},
		});

		// Set the current player of the sequence
		await Sequence.setCurrentPlayer(roomId, currentPlayer.player_id);

		return {
			room_id: roomId,
			player: currentPlayer,
		};
	},

	removePlayerFromRoom: async (roomId: string, playerId: string) => {
		const remainingPlayers = await prisma.player.delete({
			where: {
				player_id: playerId,
			},
			select: {
				game: {
					select: {
						player: true,
					},
				},
			},
		});

		return remainingPlayers.game.player;
	},

	updateRoomStatus: async (roomId: string, status: Status) => {
		const game = await prisma.game.update({
			where: {
				room_id: roomId,
			},
			data: {
				status: status,
				status_updated_at: new Date(),
			},
		});

		return game;
	},

	startGame: async (roomId: string) => {
		return await RoomModel.updateRoomStatus(roomId, Status.In_Game);
	},
};

export default RoomModel;

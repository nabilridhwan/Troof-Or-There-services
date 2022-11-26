import { Server, Socket } from "socket.io";
import prisma from "../database/prisma";
import { EVENTS } from "./events.types";
import { STATUS } from "./game.types";

interface IRoomID {
	room_id: string;
}

interface DisconnectedRoom extends IRoomID {
	player_id: string;
}

interface StatusChange extends IRoomID {
	status: STATUS;
}

const roomHandler = (io: Server, socket: Socket) => {
	console.log("Registered room handler");

	const joinRoomHandler = async (obj: IRoomID) => {
		// Make the socket join the room ID
		socket.join(obj.room_id);

		// Find all the players in the room
		const players = await prisma.player.findMany({
			where: {
				game_room_id: obj.room_id,
			},
		});

		// Fetch the game so we can broadcast the status
		const game = await prisma.game.findFirst({
			where: {
				room_id: obj.room_id,
			},
		});

		// Broadcast back the room
		io.to(obj.room_id).emit(EVENTS.ROOM_PLAYERS_UPDATE, players);

		if (game) {
			// Broadcast status
			io.to(obj.room_id).emit(EVENTS.STATUS_CHANGE, {
				status: game.status,
			});
		}
	};

	const disconnectedHandler = async (obj: DisconnectedRoom) => {
		console.log(`Disconnected received from ${obj.player_id}`);
		// Remove the player from the room

		// await prisma.player.delete({
		// 	where: {
		// 		player_id: obj.player_id,
		// 	},
		// });

		// Find all the players in the room
		const players = await prisma.player.findMany({
			where: {
				game_room_id: obj.room_id,
			},
		});

		// Broadcast back to each room the latest players
		io.to(obj.room_id).emit(EVENTS.ROOM_PLAYERS_UPDATE, players);
	};

	const statusChangeHandler = async (obj: StatusChange) => {
		console.log(
			`Status changed to ${obj.status} received for ${obj.room_id}`
		);
		// Write to database that the game has started
		const { status } = await prisma.game.update({
			where: {
				room_id: obj.room_id,
			},
			data: {
				status: obj.status,
			},

			select: {
				status: true,
			},
		});

		// Broadcast to the room that the game has started
		io.to(obj.room_id).emit(EVENTS.STATUS_CHANGE, { status });
	};

	const startGameHandler = async (obj: IRoomID) => {
		console.log(`Start game received for ${obj.room_id}`);

		console.log(`Making sequence of players for ${obj.room_id}`);

		// Create sequence from list of players
		const players = await prisma.player.findMany({
			where: {
				game_room_id: obj.room_id,
			},
		});

		if (!players) return;

		// Create the sequence in the database
		await prisma.player_sequence.upsert({
			create: {
				sequence: players.map((player) => player.player_id),
				current_player_id: players[0].player_id,
				game_room_id: obj.room_id,
			},

			update: {
				sequence: players.map((player) => player.player_id),
				current_player_id: players[0].player_id,
				game_room_id: obj.room_id,
			},

			where: {
				game_room_id: obj.room_id,
			},
		});

		console.log("Emitting server-side start game event");

		console.log(
			`Status changed to in_progress received for ${obj.room_id}`
		);
		// Write to database that the game has started
		const { status } = await prisma.game.update({
			where: {
				room_id: obj.room_id,
			},
			data: {
				status: STATUS.IN_PROGRESS,
			},

			select: {
				status: true,
			},
		});

		// Broadcast to the room that the game has started
		io.to(obj.room_id).emit(EVENTS.STATUS_CHANGE, { status });
	};

	socket.on(EVENTS.STATUS_CHANGE, statusChangeHandler);
	socket.on(EVENTS.DISCONNECTED, disconnectedHandler);
	socket.on(EVENTS.JOIN_ROOM, joinRoomHandler);
	socket.on(EVENTS.START_GAME, startGameHandler);
};

export default roomHandler;

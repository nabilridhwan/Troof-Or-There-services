import { Server, Socket } from "socket.io";
import PlayerModel from "../model/player";
import RoomModel from "../model/room";
import {
	ClientToServerEvents,
	DisconnectedRoomObject,
	EVENTS,
	RoomIDObject,
	ServerToClientEvents,
	Status,
	StatusChangeObject,
} from "../Types";

const roomHandler = (
	io: Server<ClientToServerEvents, ServerToClientEvents>,
	socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
	console.log("Registered room handler");

	const joinRoomHandler = async (obj: RoomIDObject) => {
		// Make the socket join the room ID
		socket.join(obj.room_id);

		// Find all the players in the room
		const players = await PlayerModel.getPlayersInRoom(obj.room_id);

		// Fetch the game so we can broadcast the status
		const room = await RoomModel.getRoom({ room_id: obj.room_id });

		if (!room) return;

		// Broadcast back the room, updating the players
		io.to(obj.room_id).emit(EVENTS.PLAYERS_UPDATE, players);

		// Broadcast back the room, updating the game status
		io.to(obj.room_id).emit(EVENTS.GAME_UPDATE, {
			...room,
		});
	};

	const disconnectedHandler = async (obj: DisconnectedRoomObject) => {
		console.log(
			`Disconnected received from ${obj.player_id}. Method not implemented!`
		);

		// try {
		// 	// The method below returns the remaining players in the room (after removing)
		// 	const players = await RoomModel.removePlayerFromRoom(
		// 		obj.room_id,
		// 		obj.player_id
		// 	);

		// 	// Broadcast back to each room the latest players
		// 	io.to(obj.room_id).emit(EVENTS.PLAYERS_UPDATE, players);
		// } catch (error) {
		// 	console.log(
		// 		"Cannot remove player from room. Maybe they're disconnected already!"
		// 	);
		// }
	};

	const statusChangeHandler = async (obj: StatusChangeObject) => {
		console.log(
			`Status changed to ${obj.status} received for ${obj.room_id}`
		);

		const room = await RoomModel.updateRoomStatus(obj.room_id, obj.status);

		// Broadcast to the room that the game has started
		io.to(obj.room_id).emit(EVENTS.GAME_UPDATE, {
			...room,
		});
	};

	const startGameHandler = async (obj: RoomIDObject) => {
		console.log(`Start game received for ${obj.room_id}`);

		// Update status
		const room = await RoomModel.updateRoomStatus(
			obj.room_id,
			Status.In_Game
		);

		// Broadcast to the room that the game has started
		io.to(obj.room_id).emit(EVENTS.GAME_UPDATE, {
			...room,
		});
	};

	socket.on(EVENTS.GAME_UPDATE, statusChangeHandler);
	socket.on(EVENTS.DISCONNECTED, disconnectedHandler);
	socket.on(EVENTS.JOIN_ROOM, joinRoomHandler);
	socket.on(EVENTS.START_GAME, startGameHandler);
};

export default roomHandler;

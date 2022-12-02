import { Server, Socket } from "socket.io";
import PlayerModel from "../model/player";
import { Message, MessageUpdate, MESSAGE_EVENTS, RoomIDObject } from "../Types";

const messageHandler = (io: Server, socket: Socket) => {
	console.log("Registered message handler");

	const joinMessageHandler = async (obj: RoomIDObject) => {
		socket.join(obj.room_id);
	};

	const newReactionHandler = async (obj: MessageUpdate) => {
		console.log(
			`Received new reaction (${obj.type}). Sending it to ${obj.room_id}`
		);

		// Get the player

		const playerThatMessaged = await PlayerModel.getPlayer({
			player_id: obj.player_id,
		});

		if (!playerThatMessaged) {
			console.log("Player not found. Aborting sending message");
			return;
		}

		const messageToSend: MessageUpdate = {
			...obj,
			player: playerThatMessaged,
		};

		console.log(messageToSend);

		// Emit the message to the room
		io.to(obj.room_id).emit(MESSAGE_EVENTS.MESSAGE_REACTION, messageToSend);
	};

	const newMessageHandler = async (obj: Message) => {
		console.log(
			`Received new message (${obj.type}). Sending it to ${obj.room_id}`
		);

		// Get the player

		const playerThatMessaged = await PlayerModel.getPlayer({
			player_id: obj.player_id,
		});

		if (!playerThatMessaged) {
			console.log("Player not found. Aborting sending message");
			return;
		}

		const messageToSend: MessageUpdate = {
			...obj,
			player: playerThatMessaged,
		};

		console.log(messageToSend);

		// Emit the message to the room
		io.to(obj.room_id).emit(MESSAGE_EVENTS.MESSAGE_NEW, messageToSend);
	};

	socket.on(MESSAGE_EVENTS.JOIN, joinMessageHandler);
	socket.on(MESSAGE_EVENTS.MESSAGE_NEW, newMessageHandler);
	socket.on(MESSAGE_EVENTS.MESSAGE_REACTION, newReactionHandler);
};

export default messageHandler;

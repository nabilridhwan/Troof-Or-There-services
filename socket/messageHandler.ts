import { Server, Socket } from "socket.io";
import ChatModel from "../model/chat";
import {
	BaseNewMessage,
	MessageUpdatedFromServer,
	MESSAGE_EVENTS,
	PlayerIDObject,
	RoomIDObject,
} from "../Types";

const messageHandler = (io: Server, socket: Socket) => {
	console.log("Registered message handler");

	const joinMessageHandler = async (obj: RoomIDObject) => {
		socket.join(obj.room_id);

		// Get the latest 10 chat messages
		const messages = await ChatModel.getLatestMessagesByRoomID(obj.room_id);

		// Send the messages back to the client
		socket.emit(MESSAGE_EVENTS.LATEST_MESSAGES, messages);
	};

	const newReactionHandler = async (obj: MessageUpdatedFromServer) => {
		console.log(
			`Received new reaction (${obj.type}). Sending it to ${obj.room_id}`
		);

		// Save the message to the database
		const m = await ChatModel.pushMessage(obj);

		const messageToSend: MessageUpdatedFromServer = m;

		console.log(messageToSend);
		// Emit the message to the room
		io.to(obj.room_id).emit(MESSAGE_EVENTS.MESSAGE_REACTION, m);
	};

	const newMessageHandler = async (obj: BaseNewMessage) => {
		console.log(obj);
		console.log(
			`Received new message (${obj.type}). Sending it to ${obj.room_id}`
		);

		// Get the player

		const pushedMessage = await ChatModel.pushMessage({
			...obj,
		});

		const messageToSend: MessageUpdatedFromServer = {
			...pushedMessage,
		};

		console.log(messageToSend);

		// Emit the message to the room
		io.to(obj.room_id).emit(MESSAGE_EVENTS.MESSAGE_NEW, messageToSend);
	};

	const isTypingHandler = (
		data: PlayerIDObject & RoomIDObject & { is_typing: boolean }
	) => {
		socket.broadcast.emit(MESSAGE_EVENTS.IS_TYPING, {
			...data,
		});
	};

	socket.on(MESSAGE_EVENTS.IS_TYPING, isTypingHandler);
	socket.on(MESSAGE_EVENTS.JOIN, joinMessageHandler);
	socket.on(MESSAGE_EVENTS.MESSAGE_NEW, newMessageHandler);
	socket.on(MESSAGE_EVENTS.MESSAGE_REACTION, newReactionHandler);
};

export default messageHandler;

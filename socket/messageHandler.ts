import { Server, Socket } from "socket.io";
import ChatModel from "../model/chat";
import {
	BaseNewMessage,
	MessageUpdatedFromServer,
	MESSAGE_EVENTS,
	PlayerIDObject,
	RoomIDObject,
} from "../Types";

import { v4 as generateUUIDv4 } from "uuid";

const messageHandler = (io: Server, socket: Socket) => {
	console.log("Registered message handler");

	const joinMessageHandler = async (obj: RoomIDObject) => {
		socket.join(obj.room_id);

		// Get the latest 10 chat messages
		const messages = await ChatModel.getLatestMessagesByRoomID(obj.room_id);

		// Send the messages back to the client
		socket.emit(MESSAGE_EVENTS.LATEST_MESSAGES, messages);
	};

	const newReactionHandler = async (obj: BaseNewMessage) => {
		console.log(
			`Received new reaction (${obj.type}). Sending it to ${obj.room_id}`
		);

		// 1. Generate UUID v4
		const u = generateUUIDv4();

		// 2. Update obj with the new UUID
		const new_obj: MessageUpdatedFromServer = {
			...obj,
			id: u,
		};

		// 3. Broadcast it back
		io.to(obj.room_id).emit(MESSAGE_EVENTS.MESSAGE_REACTION, new_obj);

		// 4. Save it to the database
		await ChatModel.pushMessage(new_obj);
	};

	const newMessageHandler = async (obj: BaseNewMessage) => {
		console.log(obj);
		console.log(
			`Received new message (${obj.type}). Sending it to ${obj.room_id}`
		);

		// 1. Generate UUID v4
		const u = generateUUIDv4();

		// 2. Update obj with the new UUID
		const new_obj: MessageUpdatedFromServer = {
			...obj,
			id: u,
		};

		// 3. Broadcast it back
		io.to(obj.room_id).emit(MESSAGE_EVENTS.MESSAGE_REACTION, new_obj);

		// 4. Save it to the database
		await ChatModel.pushMessage(new_obj);
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

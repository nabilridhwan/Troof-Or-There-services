import prisma from "../database/prisma";
import { MessageUpdatedFromServer, SystemMessage } from "../Types";

const ChatModel = {
	pushSystemMessage: async (message: SystemMessage) => {
		const { room_id, message: messageText, type } = message;

		return await prisma.chat.create({
			data: {
				room_id,
				message: messageText,
				type,
			},
		});
	},

	pushMessage: async (message: MessageUpdatedFromServer) => {
		const {
			room_id,
			message: messageText,
			type,
			reply_to,
			id,
			display_name,
		} = message;

		return await prisma.chat.create({
			data: {
				id,
				room_id,
				display_name,
				message: messageText,
				type,
				reply_to,
			},
		});
	},

	getLatestMessagesByRoomID: async (room_id: string) => {
		return await prisma.chat.findMany({
			where: {
				room_id,
			},
			select: {
				created_at: true,
				type: true,
				message: true,
				room_id: true,
				player_id: true,
				display_name: true,
				id: true,
				reply_to: true,
			},
			take: 50,
			orderBy: {
				created_at: "desc",
			},
		});
	},
};

export default ChatModel;

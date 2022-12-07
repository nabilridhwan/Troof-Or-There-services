import prisma from "../database/prisma";
import { BaseNewMessage, SystemMessage } from "../Types";

const ChatModel = {
	pushSystemMessage: async (message: SystemMessage) => {
		const { room_id, message: messageText, type } = message;

		return await prisma.chat.create({
			data: {
				room_id,
				message: messageText,
				type,
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
		});
	},

	pushMessage: async (message: BaseNewMessage) => {
		const { room_id, message: messageText, type } = message;

		return await prisma.chat.create({
			data: {
				room_id,
				type: type,
				display_name: message.display_name,
				reply_to: message.reply_to,
				message: messageText,
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
			take: 20,
			orderBy: {
				created_at: "desc",
			},
		});
	},
};

export default ChatModel;

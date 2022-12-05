import prisma from "../database/prisma";
import { MessageUpdate, SystemMessage } from "../Types";

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

	pushMessage: async (message: MessageUpdate) => {
		const { room_id, message: messageText, type, player_id } = message;

		return await prisma.chat.create({
			data: {
				room_id,
				player_id,
				type,
				display_name: message.display_name,
				message: messageText,
			},
		});
	},

	getLatestMessagesByRoomID: async (room_id: string) => {
		return await prisma.chat.findMany({
			where: {
				room_id,
			},
			select: {
				type: true,
				message: true,
				room_id: true,
				player_id: true,
				display_name: true,
				created_at: true,
			},
			take: 20,
			orderBy: {
				created_at: "desc",
			},
		});
	},
};

export default ChatModel;

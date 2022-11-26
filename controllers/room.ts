import type { Request, Response } from "express";
import * as nanoid from "nanoid";
import prisma from "../database/prisma";
import SuccessResponse from "../responses/SuccessResponse";
import { STATUS, TYPE } from "../socket/game.types";

const Room = {
	Join: async (
		req: Request<{}, {}, { room_id: string; display_name: string }>,
		res: Response
	) => {
		const { room_id, display_name } = req.body;

		// Check if the room exists
		const room = await prisma.game.findFirst({
			where: {
				room_id,
			},
		});

		if (!room) {
			// TODO: Use response classes
			return res.status(400).json({
				message: "Room does not exist",
			});
		}

		// Create a new player
		const { player_id } = await prisma.player.create({
			data: {
				display_name,
				game_room_id: room_id,
			},
			select: {
				player_id: true,
			},
		});

		// TODO: Use cookies to store the player ID and room ID
		// Return the room and player_id
		new SuccessResponse("Successfully joined room", {
			player_id,
			room_id,
		}).handleResponse(req, res);
	},

	Create: async (
		req: Request<{}, {}, { display_name: string }>,
		res: Response
	) => {
		// Generate a room_id
		const n = nanoid.customAlphabet(
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			6
		);

		console.log(`Created room with id ${n().toUpperCase()}`);

		const room_id = n().toUpperCase();

		// TODO: Verification of the display name
		// Get the display name
		const { display_name } = req.body;

		// Create a game and select the room ID
		const { room_id: insertedRoomID } = await prisma.game.create({
			data: {
				room_id,
				game_type: TYPE.TRUTH_OR_DARE,
				status: STATUS.IN_LOBBY,
			},
			select: {
				room_id: true,
			},
		});

		// Create a player and select the player ID
		const player = await prisma.player.create({
			data: {
				game_room_id: insertedRoomID,
				display_name,
				is_party_leader: true,
			},
			select: {
				player_id: true,
				display_name: true,
				is_party_leader: true,
			},
		});

		// TODO: Use cookies to store the player ID and room ID
		new SuccessResponse("Room Created", {
			room_id: insertedRoomID,
			room_creator: player,
		}).handleResponse(req, res);
	},
};

export default Room;

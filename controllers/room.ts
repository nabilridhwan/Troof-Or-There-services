import type { Request, Response } from "express";
import { z, ZodError, ZodIssue } from "zod";
import prisma from "../database/prisma";
import BadRequest from "../responses/BadRequest";
import SuccessResponse from "../responses/SuccessResponse";
import { STATUS, TYPE } from "../socket/game.types";
import { generateRoomID } from "../utils/generators";

const JoinRoomSchema = z.object({
	room_id: z.string(),
	display_name: z.string(),
});

const CreateRoomSchema = z.object({
	display_name: z.string(),
});

const Room = {
	Join: async (
		req: Request<{}, {}, { room_id: string; display_name: string }>,
		res: Response
	) => {
		try {
			JoinRoomSchema.parse(req.body);
		} catch (error) {
			if (error instanceof ZodError) {
				const e = error.flatten((issue: ZodIssue) => ({
					message: issue.message,
					error: issue.code,
				}));

				return new BadRequest("Invalid request", e).handleResponse(
					req,
					res
				);
			}
		}

		const { room_id, display_name } = req.body;

		// Check if the room exists
		const room = await prisma.game.findFirst({
			where: {
				room_id,
			},
		});

		if (!room) {
			return new BadRequest("Room does not exist", {}).handleResponse(
				req,
				res
			);
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
		try {
			CreateRoomSchema.parse(req.body);
		} catch (error: any | ZodError) {
			if (error instanceof ZodError) {
				const e = error.flatten((issue: ZodIssue) => ({
					message: issue.message,
					error: issue.code,
				}));

				return new BadRequest("Invalid request", e).handleResponse(
					req,
					res
				);
			}
		}

		// Generate a room_id
		console.log(`Created room with id ${generateRoomID().toUpperCase()}`);

		const room_id = generateRoomID().toUpperCase();

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

		new SuccessResponse("Room Created", {
			room_id: insertedRoomID,
			room_creator: player,
		}).handleResponse(req, res);
	},
};

export default Room;

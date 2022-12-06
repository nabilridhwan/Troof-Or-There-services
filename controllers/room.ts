import type { Request, Response } from "express";
import { z, ZodError, ZodIssue } from "zod";
import PlayerModel from "../model/player";
import RoomModel from "../model/room";
import BadRequest from "../responses/BadRequest";
import NotFoundResponse from "../responses/NotFoundResponse";
import SuccessResponse from "../responses/SuccessResponse";
import { Status } from "../Types";
import { generateRoomID } from "../utils/generators";

const GetRoomSchema = z.object({
	room_id: z.string(),
});

const JoinRoomSchema = z.object({
	room_id: z.string(),
	display_name: z.string().min(20),
});

const CreateRoomSchema = z.object({
	display_name: z.string(),
});

const Room = {
	Get: async (
		req: Request<{}, {}, {}, { room_id: string }>,
		res: Response
	) => {
		try {
			GetRoomSchema.parse(req.query);
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

		const { room_id } = req.query;

		// Check if the room exists
		const room = await RoomModel.getRoom({
			room_id,
			status: {
				not: Status.Game_Over,
			},
		});

		if (!room) {
			return new NotFoundResponse(
				"Room does not exist",
				{}
			).handleResponse(req, res);
		}

		// Return the room and player_id
		return new SuccessResponse("Successfully got room", {
			room_id,
			status: room.status,
		}).handleResponse(req, res);
	},

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
		const room = await RoomModel.getRoom({
			room_id: room_id.toLowerCase(),
			status: {
				not: Status.Game_Over,
			},
		});

		if (!room) {
			return new NotFoundResponse(
				"Room does not exist",
				{}
			).handleResponse(req, res);
		}

		// Create a new player
		const { player_id } = await PlayerModel.createPlayer({
			display_name,
			game: {
				connect: {
					room_id: room.room_id,
				},
			},
		});

		// Return the room and player_id
		new SuccessResponse("Successfully joined room", {
			player_id,
			room_id,
			status: room.status,
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

		const room_id = generateRoomID();

		// TODO: Verification of the display name
		// Get the display name
		const { display_name } = req.body;

		// Create a game and select the room ID
		const { room_id: insertedRoomID, player } =
			await RoomModel.createNewRoom(room_id, {
				display_name,
			});

		new SuccessResponse("Room Created", {
			room_id: insertedRoomID,
			room_creator: player,
		}).handleResponse(req, res);
	},
};

export default Room;

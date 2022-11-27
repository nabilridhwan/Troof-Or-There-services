import type { Request, Response } from "express";
import prisma from "../database/prisma";
import SuccessResponse from "../responses/SuccessResponse";

const Player = {
	Find: async (
		req: Request<{}, {}, {}, { player_id: string }>,
		res: Response
	) => {
		const { player_id } = req.query;

		const player = await prisma.player.findFirst({
			where: {
				player_id,
			},
		});

		if (!player) {
			return res.status(404).json({
				message: "Player not found",
				error: "PLAYER_NOT_FOUND",
			});
		}

		return new SuccessResponse("Player found", player).handleResponse(
			req,
			res
		);
	},
};

export default Player;

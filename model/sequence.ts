import prisma from "../database/prisma";

const Sequence = {
	setCurrentPlayer: async (roomId: string, playerId: string) => {
		console.log(
			`Set current player model called: Setting ${playerId} to be the current player`
		);
		return await prisma.player_sequence.upsert({
			where: {
				game_room_id: roomId,
			},

			update: {
				current_player_id: playerId,
			},

			create: {
				game_room_id: roomId,
				current_player_id: playerId,
			},
		});
	},

	getCurrentPlayer: async (roomId: string) => {
		return await prisma.player_sequence.findFirst({
			where: {
				game_room_id: roomId,
			},
		});
	},

	setNextPlayer: async (roomId: string) => {
		console.log("Set next player model called");
		const currentPlayer = await Sequence.getCurrentPlayer(roomId);

		if (!currentPlayer) {
			console.log("No current player found. Aborting setNextPlayer");
			return;
		}

		console.log("Current player: ", currentPlayer);
		const players = await prisma.player.findMany({
			where: {
				game_room_id: roomId,
			},
			select: {
				player_id: true,
			},
		});

		const currentPlayerIndex = players.findIndex(
			(player) => player.player_id === currentPlayer!.current_player_id
		);
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];

		console.log("Current player index: ", currentPlayerIndex);
		console.log("Current player: ", JSON.stringify(currentPlayer));

		console.log("Next player index: ", nextPlayerIndex);
		console.log("Next player: ", JSON.stringify(nextPlayer));

		return await Sequence.setCurrentPlayer(roomId, nextPlayer.player_id);
	},

	// TODO: Export this to external place
	getNextPlayerID: async (roomId: string) => {
		console.log("Set next player model called");
		const currentPlayer = await Sequence.getCurrentPlayer(roomId);

		if (!currentPlayer) {
			console.log("No current player found. Aborting setNextPlayer");
			return;
		}

		console.log("Current player: ", currentPlayer);
		const players = await prisma.player.findMany({
			where: {
				game_room_id: roomId,
			},
			select: {
				player_id: true,
			},
		});

		const currentPlayerIndex = players.findIndex(
			(player) => player.player_id === currentPlayer!.current_player_id
		);
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];

		console.log("Current player index: ", currentPlayerIndex);
		console.log("Current player: ", JSON.stringify(currentPlayer));

		console.log("Next player index: ", nextPlayerIndex);
		console.log("Next player: ", JSON.stringify(nextPlayer));

		return nextPlayer.player_id;
	},
};

export default Sequence;

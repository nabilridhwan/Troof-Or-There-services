export function getNextPlayer(
	currentPlayer: string,
	players: string[]
): string {
	const idx = players.findIndex((player) => player === currentPlayer);

	if (idx + 1 > players.length - 1) {
		return players[0];
	}

	return players[idx + 1];
}

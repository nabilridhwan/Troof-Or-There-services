export function getNextPlayer(
	currentPlayerID: string,
	allPlayersInSequence: string[]
): string {
	const idx = allPlayersInSequence.findIndex(
		(player) => player === currentPlayerID
	);

	if (idx + 1 > allPlayersInSequence.length - 1) {
		return allPlayersInSequence[0];
	}

	return allPlayersInSequence[idx + 1];
}

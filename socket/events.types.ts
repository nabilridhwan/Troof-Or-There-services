export enum EVENTS {
	JOIN_ROOM = "join_room",
	ROOM_PLAYERS_UPDATE = "room_players_update",
	DISCONNECTED = "disconnected",
	STATUS_CHANGE = "status_change",

	START_GAME = "start_game",
}

export enum TRUTH_OR_DARE_GAME {
	INCOMING_DATA = "incoming_data",
	SELECT_DARE = "select_dare",
	SELECT_TRUTH = "select_truth",
	JOINED = "truth_or_dare_joined",
	CONTINUE = "continue",
}

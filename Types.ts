export enum EVENTS {
	JOIN_ROOM = "join_room",
	PLAYERS_UPDATE = "event:players_update",
	DISCONNECTED = "disconnected",
	GAME_UPDATE = "event:game_update",

	START_GAME = "start_game",
}

export enum TRUTH_OR_DARE_GAME {
	INCOMING_DATA = "incoming_data",
	SELECT_DARE = "select_dare",
	SELECT_TRUTH = "select_truth",
	JOINED = "truth_or_dare_joined",
	CONTINUE = "continue",
	LEAVE_GAME = "leave_game",
}

export enum Status {
	In_Lobby = "in_lobby",
	In_Game = "in_game",
	Game_Over = "game_over",
}

export enum Action {
	Waiting_For_Selection = "waiting_for_selection",
	Truth = "truth",
	Dare = "dare",
}

export enum GameType {
	Truth_Or_Dare = 1,
}

export interface RoomIDObject {
	room_id: string;
}

export interface PlayerIDObject {
	player_id: string;
}

export type DisconnectedRoomObject = RoomIDObject & PlayerIDObject;

export interface StatusChangeObject extends RoomIDObject {
	status: Status;
}

interface Player {
	player_id: string;
	display_name: string;
	game_room_id: string;
	is_party_leader: boolean;
	joined_at: Date | null;
}

interface Room {
	room_id: string;
	status: Status | string;
	room_created_at: Date;
}

interface Log {
	player_id: string;
	game_room_id: string;
	action: Action | string;
	data: string;
	created_at: Date;
}

export interface ServerToClientEvents {
	[EVENTS.PLAYERS_UPDATE]: (players: Player[]) => void;
	[EVENTS.GAME_UPDATE]: (room: Room) => void;

	[TRUTH_OR_DARE_GAME.INCOMING_DATA]: (log: Log, player: Player) => void;

	[TRUTH_OR_DARE_GAME.LEAVE_GAME]: (room: Room) => void;
	[TRUTH_OR_DARE_GAME.SELECT_TRUTH]: (room: Room) => void;
	[TRUTH_OR_DARE_GAME.SELECT_DARE]: (room: Room) => void;
	[TRUTH_OR_DARE_GAME.CONTINUE]: (log: Log, player: Player) => void;
	[TRUTH_OR_DARE_GAME.JOINED]: (log: Log, player: Player) => void;
}

export interface ClientToServerEvents {
	[EVENTS.GAME_UPDATE]: (obj: StatusChangeObject) => void;
	[EVENTS.PLAYERS_UPDATE]: (obj: StatusChangeObject) => void;
	[EVENTS.DISCONNECTED]: (obj: DisconnectedRoomObject) => void;
	[EVENTS.JOIN_ROOM]: (obj: RoomIDObject) => void;
	[EVENTS.START_GAME]: (obj: RoomIDObject) => void;

	[TRUTH_OR_DARE_GAME.LEAVE_GAME]: (
		obj: RoomIDObject & PlayerIDObject
	) => void;

	[TRUTH_OR_DARE_GAME.SELECT_TRUTH]: (
		obj: RoomIDObject & PlayerIDObject
	) => void;

	[TRUTH_OR_DARE_GAME.SELECT_DARE]: (
		obj: RoomIDObject & PlayerIDObject
	) => void;

	[TRUTH_OR_DARE_GAME.CONTINUE]: (obj: RoomIDObject) => void;

	[TRUTH_OR_DARE_GAME.JOINED]: (obj: RoomIDObject & PlayerIDObject) => void;
}

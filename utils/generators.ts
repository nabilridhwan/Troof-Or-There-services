import * as nanoid from "nanoid";

export const generateRoomID = nanoid.customAlphabet(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
	6
);

// Generates a user ID of 10 characters
export const generateUserID = nanoid.customAlphabet(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_",
	10
);

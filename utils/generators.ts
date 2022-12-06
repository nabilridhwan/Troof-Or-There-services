import * as nanoid from "nanoid";

import randomWords from "random-words";

// randomInRange(0, 100); // 42

export const generateRoomID = () =>
	randomWords({
		exactly: 4,
		join: "-",
		maxLength: 4,
	});

// Generates a user ID of 10 characters
export const generateUserID = nanoid.customAlphabet(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_",
	10
);

// This file is for filtering bad words

import f from "bad-words";

const filterProfanity = new f({ placeHolder: "*" });

const allowedWords = [
	"bitch",
	"bitches",
	"fuck",
	"fucked",
	"fuckers",
	"fucking",
	"fucker",
	"bitched",
	"bitching",
	"ass",
	"hat",
	"hole",
	"asshole",
	"asshat",
];

filterProfanity.removeWords(...allowedWords);

export default filterProfanity;

// https://github.com/ark-maker-bot/better-tord/blob/main/index.js

// Read file from truth or dare generator
import all_dares from "../truth_or_dare_generator/output/all_dares.json";
import all_truths from "../truth_or_dare_generator/output/all_truths.json";

import { nanoid } from "nanoid";
import rand from "random-seed";

export function get_truth() {
	console.log("Getting truth...");
	const s = nanoid();
	const r = rand.create(s);
	const randomNum = r.intBetween(0, all_truths.length);

	console.log(`[TRUTH] Random number: ${randomNum} with seed ${s}`);
	return all_truths[randomNum];
}
export function get_dare() {
	console.log("Getting dare...");
	const s = nanoid();
	const r = rand.create(s);
	const randomNum = r.intBetween(0, all_dares.length);

	console.log(`[DARE] Random number: ${randomNum} with seed ${s}`);
	return all_dares[randomNum];
}

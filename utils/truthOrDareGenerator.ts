// https://github.com/ark-maker-bot/better-tord/blob/main/index.js

// Read file from truth or dare generator
import all_dares from "../truth_or_dare_generator/output/all_dares.json";
import all_truths from "../truth_or_dare_generator/output/all_truths.json";

export function get_truth() {
	console.log("Getting truth...");
	return all_truths[Math.floor(Math.random() * all_truths.length)];
}
export function get_dare() {
	console.log("Getting dare...");
	return all_dares[Math.floor(Math.random() * all_dares.length)];
}

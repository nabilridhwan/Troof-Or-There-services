// This file generates the `all_truths.json` and `all_dares.json` files. It will read each output json file and determine the last letter before .json. If it is a D, it will be dares, if it is a T, it will be truths. It will then add the contents of the file to the all_truths.json or all_dares.json file. This is done so that the user can select a random truth or dare from the entire list of truths and dares.

// Path: truth_or_dare_generator\allGenerator.ts

import fs from "fs/promises";

const dares: string[] = [];
const truths: string[] = [];

(async () => {
	console.log("Reading files in output folder...");

	const data = await fs.readdir("./output");

	const textFiles = data.filter((file) => file.endsWith(".json"));

	const textFileData = await Promise.all(
		textFiles.map(async (file) => {
			return fs.readFile(`./output/${file}`, "utf-8");
		})
	);

	let total = 0;
	const write = textFileData.map((file, index) => {
		const jsonData = JSON.parse(file);

		const fileName = textFiles[index].replace(".json", "");
		// Check the last letter if D or T
		const lastLetter = fileName[fileName.length - 1];

		if (lastLetter === "D") {
			console.log(`[DARE] ${fileName}`);
			dares.push(...jsonData);
		}

		if (lastLetter === "T") {
			console.log(`[TRUTHS] ${fileName}`);
			truths.push(...jsonData);
		}
	});

	// Wait for Promise.all to finish
	await Promise.all(write);

	// Write the files
	await fs.writeFile("./output/all_dares.json", JSON.stringify(dares), {
		encoding: "utf-8",
		flag: "w",
	});

	await fs.writeFile("./output/all_truths.json", JSON.stringify(truths), {
		encoding: "utf-8",
		flag: "w",
	});

	console.log("Done. Total: ", truths.length + dares.length);
})();

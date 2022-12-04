import fs from "fs/promises";

(async () => {
	const data = await fs.readdir("./textfiles");

	const textFiles = data.filter((file) => file.endsWith(".txt"));

	console.log("Reading files in textfiles...");

	const textFileData = await Promise.all(
		textFiles.map(async (file) => {
			return fs.readFile(`./textfiles/${file}`, "utf-8");
		})
	);

	console.log("Done reading files.");

	console.log("Removing all items in output folder");

	// Remove every file in the output folder
	await fs.readdir("./output").then(async (files) => {
		await Promise.all(
			files.map(async (file) => {
				await fs.unlink(`./output/${file}`);
			})
		);
	});

	console.log("Done removing files in output folder.");

	console.log("Writing files to output folder...");

	// Loop through the text files and split them into an array of strings
	// Then save them in /output with their original file name as json
	// Override the files
	let total = 0;
	const write = textFileData.map((file, index) => {
		console.log(textFiles[index]);
		const splitFile: string[] = file.split("\r\n");
		total += splitFile.length;

		fs.writeFile(
			`./output/${textFiles[index]}.json`
				.replace(" ", "-")
				.replace("_", "-")
				.replace(".txt", ""),
			JSON.stringify(splitFile),
			{
				encoding: "utf-8",
				flag: "w",
			}
		);

		return splitFile;
	});

	console.log("Done. Total Truths and Dares: ", total);
})();

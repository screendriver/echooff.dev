import os from "node:os";
import { writeFile, rm } from "node:fs/promises";
import { $, echo } from "zx";
import { createDevelopmentEnvironmentFileContent } from "./development-environment-file.ts";
import { startDeterministicServer } from "./deterministic-server/deterministic-server.ts";

const envFilePath = "./.env";

const listeningAddress = await startDeterministicServer();

echo("Deterministic server listening on", listeningAddress);

await writeFile(envFilePath, createDevelopmentEnvironmentFileContent(listeningAddress, os.EOL), {
	encoding: "utf-8"
});

echo("Environment variables written to", envFilePath);

async function removeFiles(): Promise<void> {
	try {
		await rm(envFilePath);
		echo("Temporary files deleted");
		process.exit();
	} catch {
		echo("Could not delete temporary files!");
		process.exit(1);
	}
}

process.on("SIGINT", () => {
	void removeFiles();
});

await $`npx astro dev --force 2>&1`.pipe(process.stdout);

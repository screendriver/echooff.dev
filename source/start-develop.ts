import os from "node:os";
import { writeFile, appendFile, rm } from "node:fs/promises";
import { $, echo } from "zx";
import { startStaticServer } from "./static-server/static-server.js";

const envFilePath = "./.env";

const listeningAddress = await startStaticServer();

echo("Static server listening on", listeningAddress);

await writeFile(envFilePath, `GITHUB_API_BASE_URL=${listeningAddress}${os.EOL}`, { encoding: "utf8" });
await appendFile(envFilePath, `GITHUB_LOGIN="foo"${os.EOL}`, { encoding: "utf8" });
await appendFile(envFilePath, `GITHUB_TOKEN="foo"${os.EOL}`, { encoding: "utf8" });
await appendFile(envFilePath, `CONTACT_FORM_URL="${listeningAddress}/contact-form"`, {
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

await $`npx astro dev 2>&1`.pipe(process.stdout);

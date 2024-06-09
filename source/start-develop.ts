import { $, echo } from "zx";
import os from "node:os";
import { writeFile, appendFile, rm } from "node:fs/promises";
import { startStaticServer } from "./static-server/static-server.js";

const githubApiTestTokenFilePath = "./github_api_test_token";
const envFilePath = "./.env";

const listeningAddress = await startStaticServer();

echo("Static server listening on", listeningAddress);

await writeFile(githubApiTestTokenFilePath, "foo", { encoding: "utf8" });

await writeFile(envFilePath, `GITHUB_API_BASE_URL=${listeningAddress}${os.EOL}`, { encoding: "utf8" });
await appendFile(envFilePath, `GITHUB_LOGIN="foo"${os.EOL}`, { encoding: "utf8" });
await appendFile(envFilePath, `GITHUB_API_TOKEN_FILE="github_api_test_token"${os.EOL}`, { encoding: "utf8" });
await appendFile(envFilePath, `CONTACT_FORM_URL="${listeningAddress}/contact-form"`, {
	encoding: "utf-8",
});

echo("Environment variables written to", envFilePath);

process.on("SIGINT", () => {
	const removePromises = [githubApiTestTokenFilePath, envFilePath].map((filePath) => {
		return rm(filePath);
	});
	Promise.all(removePromises)
		.then(() => {
			echo("Temporary filse deleted");
			process.exit();
		})
		.catch(() => {
			echo("Could not delete temporary files!");
			process.exit(1);
		});
});

await $`npx astro dev 2>&1`.pipe(process.stdout);

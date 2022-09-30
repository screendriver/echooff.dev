#! ./node_modules/.bin/ts-node-esm
import { $, echo } from "zx";
import os from "node:os";
import { writeFile, appendFile, rm } from "node:fs/promises";
import { startStaticServer } from "./static-server/static-server.js";

const envFilePath = "./.env.local";

const listeningAddress = await startStaticServer();

echo("Static server listening on", listeningAddress);

await writeFile(envFilePath, `GIT_HUB_API_BASE_URL=${listeningAddress}${os.EOL}`, { encoding: "utf-8" });
await appendFile(envFilePath, `GIT_HUB_LOGIN="foo"${os.EOL}`, { encoding: "utf-8" });
await appendFile(envFilePath, `GIT_HUB_API_TOKEN="test-token"${os.EOL}`, { encoding: "utf-8" });
await appendFile(envFilePath, `PUBLIC_CONTACT_FORM_URL="${listeningAddress}/contact-form"`, {
    encoding: "utf-8",
});

echo("Environment variables written to", envFilePath);

process.on("SIGINT", () => {
    rm(envFilePath)
        .then(() => {
            echo(envFilePath, "deleted");
            process.exit();
        })
        .catch(() => {
            echo(envFilePath, "could not be deleted!");
            process.exit(1);
        });
});

await $`npx netlify dev`;

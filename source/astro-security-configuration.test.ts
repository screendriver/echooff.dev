import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../", import.meta.url));
const astroConfigurationPath = join(repositoryRootDirectoryPath, "astro.config.js");

function removeWhitespace(source: string): string {
	return source.replaceAll(/\s+/gu, "");
}

suite("Astro security configuration", function () {
	test("checks origins and trusts only the canonical production origin", async function () {
		const astroConfigurationSource = await readFile(astroConfigurationPath, "utf8");
		const normalizedAstroConfigurationSource = removeWhitespace(astroConfigurationSource);

		assert.match(
			normalizedAstroConfigurationSource,
			/security:\{checkOrigin:true,allowedDomains:\[\{hostname:"www\.echooff\.dev",protocol:"https"\}\]\}/u
		);
		assert.doesNotMatch(normalizedAstroConfigurationSource, /allowedDomains:\[\{\}\]/u);
		assert.doesNotMatch(normalizedAstroConfigurationSource, /hostname:"\*+/u);
		assert.doesNotMatch(normalizedAstroConfigurationSource, /hostname:"localhost"/u);
		assert.doesNotMatch(normalizedAstroConfigurationSource, /checkOrigin:false/u);
	});

	test("keeps the deterministic development proxy configuration unchanged", async function () {
		const astroConfigurationSource = await readFile(astroConfigurationPath, "utf8");
		const normalizedAstroConfigurationSource = removeWhitespace(astroConfigurationSource);

		assert.match(
			normalizedAstroConfigurationSource,
			/vite:\{server:\{proxy:developmentServerProxy\.unwrapOr\(undefined\),/u
		);
	});
});

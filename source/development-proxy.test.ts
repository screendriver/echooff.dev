import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import { createDevelopmentServerProxy } from "./development-proxy.ts";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../", import.meta.url));
const astroConfigurationPath = join(repositoryRootDirectoryPath, "astro.config.js");

suite("createDevelopmentServerProxy()", function () {
	test("creates a same-path reaction proxy for the selected deterministic server", function () {
		const deterministicServerUrl = "http://127.0.0.1:45678";
		const actualProxy = createDevelopmentServerProxy({ deterministicServerUrl: just(deterministicServerUrl) });

		if (actualProxy.isNothing) {
			throw new Error("The deterministic development proxy was not created.");
		}
		assert.strictEqual(actualProxy.value["/api/reactions"].target, deterministicServerUrl);
		assert.strictEqual(actualProxy.value["/api/reactions"].changeOrigin, true);
		assert.strictEqual(
			actualProxy.value["/api/reactions"].rewrite("/api/reactions/example-post"),
			"/api/reactions/example-post"
		);
	});

	test("does not configure a proxy without an explicitly selected server", function () {
		const actualProxyWithoutUrl = createDevelopmentServerProxy({ deterministicServerUrl: nothing() });
		const actualProxyWithEmptyUrl = createDevelopmentServerProxy({ deterministicServerUrl: just("") });

		assert.strictEqual(actualProxyWithoutUrl.isNothing, true);
		assert.strictEqual(actualProxyWithEmptyUrl.isNothing, true);
	});

	test("keeps the proxy target server-only and preserves existing Vite settings", async function () {
		const astroConfigurationSource = await readFile(astroConfigurationPath, "utf8");

		assert.match(
			astroConfigurationSource,
			/server:\s*\{\s*proxy: developmentServerProxy\.unwrapOr\(undefined\)\s*\}/u
		);
		assert.match(astroConfigurationSource, /css:\s*\{\s*devSourcemap: true\s*\}/u);
		assert.match(astroConfigurationSource, /build:\s*\{\s*manifest: true\s*\}/u);
		assert.match(astroConfigurationSource, /esbuild:\s*\{\s*legalComments: "none"\s*\}/u);
		assert.doesNotMatch(astroConfigurationSource, /PUBLIC_DETERMINISTIC_SERVER_URL/u);
	});
});

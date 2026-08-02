import assert from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));

const sourcePathsThatMustStaySentryFree = [
	"source/layouts/PageShell.astro",
	"source/browser/browser-failure-bootstrap.ts",
	"source/browser/fire-and-forget-invoker.ts",
	"source/browser/report-unexpected-browser-failure.ts",
	"source/browser/reporting-blog-reaction-client.ts",
	"source/blog/reactions/BlogPostReaction.tsx",
	"source/blog/reactions/BlogPostReactionIsland.tsx",
	"source/blog/reactions/blog-reaction-http-client.ts"
] as const;

async function readRepositorySource(repositoryRelativePath: string): Promise<string> {
	return readFile(join(repositoryRootDirectoryPath, repositoryRelativePath), "utf8");
}

suite("Bugsink browser architecture", function () {
	test("keeps the browser SDK behind one real dynamic import", async function () {
		const lazyAdapterSource = await readRepositorySource("source/browser/bugsink/lazy-bugsink-browser-reporter.ts");

		assert.match(lazyAdapterSource, /import\(["']@sentry\/browser["']\)/u);
		assert.doesNotMatch(lazyAdapterSource, /^import (?!type\b)[^\n]*from ["']@sentry\/browser["']/mu);

		for (const sourcePath of sourcePathsThatMustStaySentryFree) {
			const source = await readRepositorySource(sourcePath);
			assert.doesNotMatch(source, /@sentry\/browser|@sentry\/node|Bugsink/u, sourcePath);
		}
	});

	test("installs the shared bootstrap and selects the lazy reporter", async function () {
		const pageShell = await readRepositorySource("source/layouts/PageShell.astro");
		const composition = await readRepositorySource("source/browser/browser-failure-composition.ts");

		assert.match(pageShell, /initializeBrowserFailureReporting/u);
		assert.doesNotMatch(pageShell, /initializeBugsinkBrowser|@sentry\/browser/u);
		assert.match(composition, /createLazyBugsinkBrowserReporter/u);
		assert.match(composition, /createBrowserFailureBootstrap/u);
	});

	test("does not add a CDN loader or a Bugsink proxy", async function () {
		const pageShell = await readRepositorySource("source/layouts/PageShell.astro");
		const applicationCaddyfile = await readRepositorySource("Caddyfile");

		assert.doesNotMatch(pageShell, /cdn|sentry\.io|loader/i);
		assert.doesNotMatch(applicationCaddyfile, /bugsink\.82r\.de|reverse_proxy.*bugsink/u);
	});

	test("uses a Vite manifest for non-brittle bundle inspection", async function () {
		const manifestPath = join(repositoryRootDirectoryPath, "target/client/.vite/manifest.json");

		if (existsSync(manifestPath)) {
			const manifestSource = await readFile(manifestPath, "utf8");
			const manifest = JSON.parse(manifestSource) as Record<
				string,
				{ readonly file?: string; readonly isEntry?: boolean }
			>;
			const sdkEntries = Object.values(manifest).filter(function findSdkEntry(manifestEntry) {
				return manifestEntry.file?.includes("sentry") === true;
			});

			assert.ok(sdkEntries.length > 0);
			assert.strictEqual(
				sdkEntries.some(function findEntryManifest(manifestEntry) {
					return manifestEntry.isEntry === true;
				}),
				false
			);
		}
	});
});

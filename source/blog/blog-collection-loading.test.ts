import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import assert from "node:assert";
import { suite, test } from "mocha";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));
const astroGeneratedDataStorePath = join(repositoryRootDirectoryPath, "node_modules/.astro/data-store.json");
const blogContentDirectoryPath = join(repositoryRootDirectoryPath, "source/content/blog");
const blogPostIdentifiersReservedForRoutes = ["page"];

async function readExpectedBlogPostIdentifiersFromMarkdownFiles(): Promise<string[]> {
	const blogDirectoryEntries = await readdir(blogContentDirectoryPath, { withFileTypes: true });

	return blogDirectoryEntries
		.filter((directoryEntry) => {
			return directoryEntry.isFile() && directoryEntry.name.endsWith(".md");
		})
		.map((directoryEntry) => {
			return directoryEntry.name.slice(0, -".md".length);
		})
		.toSorted((firstBlogPostIdentifier, secondBlogPostIdentifier) => {
			return firstBlogPostIdentifier.localeCompare(secondBlogPostIdentifier);
		});
}

async function readAstroGeneratedDataStoreDocument(): Promise<string> {
	return readFile(astroGeneratedDataStorePath, "utf8");
}

suite("blog content collection", function () {
	test("loads every blog markdown file into Astro's generated data store", async function () {
		const [actualAstroGeneratedDataStoreDocument, expectedBlogPostIdentifiers] = await Promise.all([
			readAstroGeneratedDataStoreDocument(),
			readExpectedBlogPostIdentifiersFromMarkdownFiles()
		]);
		const expectedBlogCollectionMarker = '"blog"';

		assert.ok(actualAstroGeneratedDataStoreDocument.includes(expectedBlogCollectionMarker));

		for (const expectedBlogPostIdentifier of expectedBlogPostIdentifiers) {
			const expectedBlogPostIdentifierMarker = `"${expectedBlogPostIdentifier}"`;

			assert.ok(actualAstroGeneratedDataStoreDocument.includes(expectedBlogPostIdentifierMarker));
		}
	});

	test("does not use blog post identifiers reserved for blog routes", async function () {
		const actualBlogPostIdentifiers = await readExpectedBlogPostIdentifiersFromMarkdownFiles();

		for (const blogPostIdentifierReservedForRoute of blogPostIdentifiersReservedForRoutes) {
			const expectedReservedBlogPostIdentifier = blogPostIdentifierReservedForRoute;

			assert.strictEqual(actualBlogPostIdentifiers.includes(expectedReservedBlogPostIdentifier), false);
		}
	});
});

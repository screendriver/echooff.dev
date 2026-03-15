import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));
const astroGeneratedDataStorePath = join(repositoryRootDirectoryPath, "node_modules/.astro/data-store.json");
const blogContentDirectoryPath = join(repositoryRootDirectoryPath, "source/content/blog");

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

describe("blog content collection", () => {
	it("loads every blog markdown file into Astro's generated data store", async () => {
		const [astroGeneratedDataStoreDocument, expectedBlogPostIdentifiers] = await Promise.all([
			readAstroGeneratedDataStoreDocument(),
			readExpectedBlogPostIdentifiersFromMarkdownFiles()
		]);

		expect(astroGeneratedDataStoreDocument).toContain('"blog"');

		for (const expectedBlogPostIdentifier of expectedBlogPostIdentifiers) {
			expect(astroGeneratedDataStoreDocument).toContain(`"${expectedBlogPostIdentifier}"`);
		}
	});
});

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import is from "@sindresorhus/is";
import { describe, expect, it } from "vitest";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));
const blogContentDirectoryPath = join(repositoryRootDirectoryPath, "source/content/blog");
const quotedFrontmatterStringPropertyNames = ["title", "description", "publishedAt", "topic"] as const;

type BlogPostFrontmatterDocument = {
	readonly markdownFileName: string;
	readonly frontmatterDocument: string;
};

type UnquotedFrontmatterStringProperty = {
	readonly markdownFileName: string;
	readonly propertyName: (typeof quotedFrontmatterStringPropertyNames)[number];
};

async function readBlogPostMarkdownFileNames(): Promise<readonly string[]> {
	const blogContentDirectoryEntries = await readdir(blogContentDirectoryPath, { withFileTypes: true });

	return blogContentDirectoryEntries
		.filter((directoryEntry) => {
			return directoryEntry.isFile() && directoryEntry.name.endsWith(".md");
		})
		.map((directoryEntry) => {
			return directoryEntry.name;
		})
		.toSorted((firstMarkdownFileName, secondMarkdownFileName) => {
			return firstMarkdownFileName.localeCompare(secondMarkdownFileName);
		});
}

function readFrontmatterDocument(markdownDocument: string): string {
	const frontmatterMatch = /^---\n(?<frontmatterDocument>[\s\S]*?)\n---/u.exec(markdownDocument);

	if (is.undefined(frontmatterMatch?.groups?.frontmatterDocument)) {
		throw new TypeError("Blog post markdown document must start with a frontmatter block.");
	}

	return frontmatterMatch.groups.frontmatterDocument;
}

async function readBlogPostFrontmatterDocuments(): Promise<readonly BlogPostFrontmatterDocument[]> {
	const markdownFileNames = await readBlogPostMarkdownFileNames();

	return Promise.all(
		markdownFileNames.map(async (markdownFileName) => {
			const markdownDocument = await readFile(join(blogContentDirectoryPath, markdownFileName), "utf8");

			return {
				markdownFileName,
				frontmatterDocument: readFrontmatterDocument(markdownDocument)
			};
		})
	);
}

function findUnquotedFrontmatterStringProperties(
	blogPostFrontmatterDocuments: readonly BlogPostFrontmatterDocument[]
): readonly UnquotedFrontmatterStringProperty[] {
	return blogPostFrontmatterDocuments.flatMap((blogPostFrontmatterDocument) => {
		return quotedFrontmatterStringPropertyNames
			.filter((propertyName) => {
				return !new RegExp(`^${propertyName}: ["']`, "mu").test(
					blogPostFrontmatterDocument.frontmatterDocument
				);
			})
			.map((propertyName) => {
				return {
					markdownFileName: blogPostFrontmatterDocument.markdownFileName,
					propertyName
				};
			});
	});
}

describe("blog frontmatter style", () => {
	it("uses quoted strings for reader-facing blog post metadata", async () => {
		const blogPostFrontmatterDocuments = await readBlogPostFrontmatterDocuments();

		expect(findUnquotedFrontmatterStringProperties(blogPostFrontmatterDocuments)).toStrictEqual([]);
	});
});

import { describe, expect, it } from "vitest";
import { createDefaultBlogArchiveMetadata, createPaginatedBlogArchiveMetadata } from "./blog-archive-metadata.ts";

describe("createDefaultBlogArchiveMetadata()", () => {
	it("creates first-page blog archive metadata", () => {
		expect(createDefaultBlogArchiveMetadata(21)).toStrictEqual({
			description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			intro: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			pageTitle: "Blog",
			terminalOutput: "21 posts available",
			title: "Software Engineering Blog | Christian Rackerseder"
		});
	});

	it("creates a singular terminal label when only one post exists", () => {
		expect(createDefaultBlogArchiveMetadata(1).terminalOutput).toBe("1 post available");
	});
});

describe("createPaginatedBlogArchiveMetadata()", () => {
	it("creates page-aware metadata for later archive pages", () => {
		expect(
			createPaginatedBlogArchiveMetadata({
				currentPage: 2,
				lastPage: 4,
				pageSize: 10,
				totalPostCount: 35
			})
		).toStrictEqual({
			description: "Older software engineering notes, page 2 of 4.",
			intro: "Older software engineering notes, page 2 of 4.",
			pageTitle: "Blog - Page 2",
			terminalOutput: "Showing 11-20 of 35 posts",
			title: "Software Engineering Blog - Page 2 | Christian Rackerseder"
		});
	});
});

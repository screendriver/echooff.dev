import { describe, expect, it } from "vitest";
import { createDefaultBlogArchiveMetadata, createPaginatedBlogArchiveMetadata } from "./blog-archive-metadata.ts";

describe("createDefaultBlogArchiveMetadata()", () => {
	it("creates first-page blog archive metadata", () => {
		const actualArchiveMetadata = createDefaultBlogArchiveMetadata(21);
		const expectedArchiveMetadata = {
			description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			intro: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			pageTitle: "Blog",
			terminalOutput: "21 posts available",
			title: "Software Engineering Blog | Christian Rackerseder"
		};

		expect(actualArchiveMetadata).toStrictEqual(expectedArchiveMetadata);
	});

	it("creates a singular terminal label when only one post exists", () => {
		const actualTerminalOutput = createDefaultBlogArchiveMetadata(1).terminalOutput;
		const expectedTerminalOutput = "1 post available";

		expect(actualTerminalOutput).toBe(expectedTerminalOutput);
	});
});

describe("createPaginatedBlogArchiveMetadata()", () => {
	it("creates page-aware metadata for later archive pages", () => {
		const actualArchiveMetadata = createPaginatedBlogArchiveMetadata({
			currentPage: 2,
			lastPage: 4,
			pageSize: 10,
			totalPostCount: 35
		});
		const expectedArchiveMetadata = {
			description: "Older software engineering notes, page 2 of 4.",
			intro: "Older software engineering notes, page 2 of 4.",
			pageTitle: "Blog - Page 2",
			terminalOutput: "Showing 10 posts",
			title: "Software Engineering Blog - Page 2 | Christian Rackerseder"
		};

		expect(actualArchiveMetadata).toStrictEqual(expectedArchiveMetadata);
	});

	it("creates a singular terminal label for a single-post final page", () => {
		const actualTerminalOutput = createPaginatedBlogArchiveMetadata({
			currentPage: 2,
			lastPage: 2,
			pageSize: 20,
			totalPostCount: 21
		}).terminalOutput;
		const expectedTerminalOutput = "Showing 1 post";

		expect(actualTerminalOutput).toBe(expectedTerminalOutput);
	});
});

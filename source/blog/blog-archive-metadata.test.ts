import assert from "node:assert";
import { suite, test } from "mocha";
import { createDefaultBlogArchiveMetadata, createPaginatedBlogArchiveMetadata } from "./blog-archive-metadata.ts";

suite("createDefaultBlogArchiveMetadata()", function () {
	test("creates first-page blog archive metadata", function () {
		const actualArchiveMetadata = createDefaultBlogArchiveMetadata(21);
		const expectedArchiveMetadata = {
			description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			intro: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			pageTitle: "Blog",
			terminalOutput: "21 posts available",
			title: "Software Engineering Blog | Christian Rackerseder"
		};

		assert.deepStrictEqual(actualArchiveMetadata, expectedArchiveMetadata);
	});

	test("creates a singular terminal label when only one post exists", function () {
		const actualTerminalOutput = createDefaultBlogArchiveMetadata(1).terminalOutput;
		const expectedTerminalOutput = "1 post available";

		assert.strictEqual(actualTerminalOutput, expectedTerminalOutput);
	});
});

suite("createPaginatedBlogArchiveMetadata()", function () {
	test("creates page-aware metadata for later archive pages", function () {
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

		assert.deepStrictEqual(actualArchiveMetadata, expectedArchiveMetadata);
	});

	test("creates a singular terminal label for a single-post final page", function () {
		const actualTerminalOutput = createPaginatedBlogArchiveMetadata({
			currentPage: 2,
			lastPage: 2,
			pageSize: 20,
			totalPostCount: 21
		}).terminalOutput;
		const expectedTerminalOutput = "Showing 1 post";

		assert.strictEqual(actualTerminalOutput, expectedTerminalOutput);
	});
});

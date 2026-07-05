import assert from "node:assert";
import { suite, test } from "mocha";
import {
	readBlogPostMarkdownDocuments,
	validateInternalBlogPostLinks
} from "../../source/blog/blog-link-validation.ts";

suite("blog content links", function () {
	test("all current internal blog post links point to existing routes and fragments", async function () {
		const blogPostMarkdownDocuments = await readBlogPostMarkdownDocuments();
		const actualValidationProblems = await validateInternalBlogPostLinks(blogPostMarkdownDocuments);
		const expectedValidationProblems: readonly unknown[] = [];

		assert.deepStrictEqual(actualValidationProblems, expectedValidationProblems);
	});
});

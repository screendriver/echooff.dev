import assert from "node:assert";
import { suite, test } from "mocha";
import { validateInternalBlogPostLinks, type BlogPostMarkdownDocument } from "./blog-link-validation.ts";

suite("validateInternalBlogPostLinks()", function () {
	test("reports a missing internal route target", async function () {
		const blogPostMarkdownDocuments: readonly BlogPostMarkdownDocument[] = [
			{
				blogPostSlug: "post-a",
				markdownDocument: "[Broken route](/blog/missing-post)"
			}
		];

		const actualValidationProblems = await validateInternalBlogPostLinks(blogPostMarkdownDocuments);
		const expectedValidationProblems = [
			{
				href: "/blog/missing-post",
				message: 'Target path "/blog/missing-post" does not exist',
				sourceBlogPostSlug: "post-a"
			}
		];

		assert.deepStrictEqual(actualValidationProblems, expectedValidationProblems);
	});

	test("reports a missing blog heading fragment", async function () {
		const blogPostMarkdownDocuments: readonly BlogPostMarkdownDocument[] = [
			{
				blogPostSlug: "post-a",
				markdownDocument: "# Alpha"
			},
			{
				blogPostSlug: "post-b",
				markdownDocument: "[Broken fragment](/blog/post-a#missing-heading)"
			}
		];

		const actualValidationProblems = await validateInternalBlogPostLinks(blogPostMarkdownDocuments);
		const expectedValidationProblems = [
			{
				href: "/blog/post-a#missing-heading",
				message: 'Fragment "missing-heading" does not exist on "/blog/post-a"',
				sourceBlogPostSlug: "post-b"
			}
		];

		assert.deepStrictEqual(actualValidationProblems, expectedValidationProblems);
	});

	test("ignores external links and markdown code examples", async function () {
		const blogPostMarkdownDocuments: readonly BlogPostMarkdownDocument[] = [
			{
				blogPostSlug: "post-a",
				markdownDocument: [
					"[External](https://example.com)",
					"",
					"`/blog/not-a-real-link`",
					"",
					"```ts",
					'const href = "/blog/also-not-a-real-link";',
					"```"
				].join("\n")
			}
		];

		const actualValidationProblems = await validateInternalBlogPostLinks(blogPostMarkdownDocuments);
		const expectedValidationProblems: readonly unknown[] = [];

		assert.deepStrictEqual(actualValidationProblems, expectedValidationProblems);
	});
});

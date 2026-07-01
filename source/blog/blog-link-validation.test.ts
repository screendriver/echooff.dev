import { describe, expect, it } from "vitest";
import {
	readBlogPostMarkdownDocuments,
	validateInternalBlogPostLinks,
	type BlogPostMarkdownDocument
} from "./blog-link-validation.ts";

const currentBlogPostLinkValidationTimeoutMilliseconds = 15_000;

describe("validateInternalBlogPostLinks()", () => {
	it(
		"accepts the current blog post links",
		async () => {
			const blogPostMarkdownDocuments = await readBlogPostMarkdownDocuments();
			const actualValidationProblems = await validateInternalBlogPostLinks(blogPostMarkdownDocuments);
			const expectedValidationProblems: readonly unknown[] = [];

			expect(actualValidationProblems).toStrictEqual(expectedValidationProblems);
		},
		currentBlogPostLinkValidationTimeoutMilliseconds
	);

	it("reports a missing internal route target", async () => {
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

		expect(actualValidationProblems).toStrictEqual(expectedValidationProblems);
	});

	it("reports a missing blog heading fragment", async () => {
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

		expect(actualValidationProblems).toStrictEqual(expectedValidationProblems);
	});

	it("ignores external links and markdown code examples", async () => {
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

		expect(actualValidationProblems).toStrictEqual(expectedValidationProblems);
	});
});

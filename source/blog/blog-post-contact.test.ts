import assert from "node:assert";
import { suite, test } from "mocha";
import { createBlogPostContactMailtoUrl } from "./blog-post-contact.ts";

suite("createBlogPostContactMailtoUrl()", function () {
	test("creates a contextual mailto URL with the article title and canonical URL", function () {
		const actualMailtoUrl = createBlogPostContactMailtoUrl(
			"Boring code is a feature",
			"https://example.com/blog/boring-code-is-a-feature"
		);
		const expectedMailtoUrl =
			"mailto:blog@echooff.de?subject=Feedback%20on%20%22Boring%20code%20is%20a%20feature%22&body=Article%3A%20https%3A%2F%2Fexample.com%2Fblog%2Fboring-code-is-a-feature";
		const parsedMailtoUrl = new URL(actualMailtoUrl);
		const actualMailtoProtocol = parsedMailtoUrl.protocol;
		const actualMailtoAddress = parsedMailtoUrl.pathname;
		const actualMailtoSubject = parsedMailtoUrl.searchParams.get("subject");
		const actualMailtoBody = parsedMailtoUrl.searchParams.get("body");

		assert.strictEqual(actualMailtoUrl, expectedMailtoUrl);
		assert.strictEqual(actualMailtoProtocol, "mailto:");
		assert.strictEqual(actualMailtoAddress, "blog@echooff.de");
		assert.strictEqual(actualMailtoSubject, 'Feedback on "Boring code is a feature"');
		assert.strictEqual(actualMailtoBody, "Article: https://example.com/blog/boring-code-is-a-feature");
	});

	test("encodes user-visible title and URL values", function () {
		const articleTitle = 'A & "quoted" title';
		const articleUrl = "https://example.com/blog/a-title?view=full&source=archive";
		const actualMailtoUrl = createBlogPostContactMailtoUrl(articleTitle, articleUrl);
		const expectedMailtoUrl =
			"mailto:blog@echooff.de?subject=Feedback%20on%20%22A%20%26%20%22quoted%22%20title%22&body=Article%3A%20https%3A%2F%2Fexample.com%2Fblog%2Fa-title%3Fview%3Dfull%26source%3Darchive";
		const parsedMailtoUrl = new URL(actualMailtoUrl);

		assert.strictEqual(actualMailtoUrl, expectedMailtoUrl);
		assert.strictEqual(parsedMailtoUrl.searchParams.get("subject"), `Feedback on "${articleTitle}"`);
		assert.strictEqual(parsedMailtoUrl.searchParams.get("body"), `Article: ${articleUrl}`);
	});
});

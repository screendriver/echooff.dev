import assert from "node:assert";
import { suite, test } from "mocha";
import { buildHeadingAnchorLinkContent } from "./heading-anchor-link-content.ts";

suite("buildHeadingAnchorLinkContent()", function () {
	test("keeps the heading anchor marker attached to the heading text", function () {
		const actualHeadingAnchorLinkContent = buildHeadingAnchorLinkContent();
		const expectedHeadingAnchorLinkContent = [{ type: "text", value: "\u{A0}#" }];

		assert.deepStrictEqual(actualHeadingAnchorLinkContent, expectedHeadingAnchorLinkContent);
	});
});

import { describe, expect, it } from "vitest";
import { buildHeadingAnchorLinkContent } from "./heading-anchor-link-content.ts";

describe("buildHeadingAnchorLinkContent()", () => {
	it("keeps the heading anchor marker attached to the heading text", () => {
		const actualHeadingAnchorLinkContent = buildHeadingAnchorLinkContent();
		const expectedHeadingAnchorLinkContent = [{ type: "text", value: "\u00A0#" }];

		expect(actualHeadingAnchorLinkContent).toStrictEqual(expectedHeadingAnchorLinkContent);
	});
});

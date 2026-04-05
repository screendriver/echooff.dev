import { describe, expect, it } from "vitest";
import { buildHeadingAnchorLinkContent } from "./heading-anchor-link-content.js";

describe("buildHeadingAnchorLinkContent()", () => {
	it("keeps the heading anchor marker attached to the heading text", () => {
		expect(buildHeadingAnchorLinkContent()).toStrictEqual([{ type: "text", value: "\u00A0#" }]);
	});
});

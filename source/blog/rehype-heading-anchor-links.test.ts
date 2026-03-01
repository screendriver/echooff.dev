import { describe, expect, it } from "vitest";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

function createMarkdownFileMetadata() {
	return {
		data: {
			astro: {}
		},
		history: ["example.md"]
	};
}

describe("Astro blog heading anchor plugins", () => {
	it("adds ids and anchor links to heading elements", () => {
		const syntaxTree = {
			type: "root",
			children: [
				{
					type: "element",
					tagName: "h2",
					properties: {},
					children: [{ type: "text", value: "Architecture decisions" }]
				}
			]
		};
		const markdownFileMetadata = createMarkdownFileMetadata();

		rehypeHeadingIds()(syntaxTree, markdownFileMetadata);
		rehypeAutolinkHeadings({
			behavior: "append",
			properties: {
				ariaLabel: "Copy link to this section",
				className: ["blog-heading-anchor-link"],
				title: "Copy link to this section"
			}
		})(syntaxTree);

		expect(syntaxTree).toStrictEqual({
			type: "root",
			children: [
				{
					type: "element",
					tagName: "h2",
					properties: {
						id: "architecture-decisions"
					},
					children: [
						{ type: "text", value: "Architecture decisions" },
						{
							type: "element",
							tagName: "a",
							properties: {
								ariaLabel: "Copy link to this section",
								className: ["blog-heading-anchor-link"],
								href: "#architecture-decisions",
								title: "Copy link to this section"
							},
							children: [
								{
									type: "element",
									tagName: "span",
									properties: {
										className: ["icon", "icon-link"]
									},
									children: []
								}
							]
						}
					]
				}
			]
		});
	});

	it("uses nested heading text and disambiguates duplicate headings", () => {
		const syntaxTree = {
			type: "root",
			children: [
				{
					type: "element",
					tagName: "h2",
					properties: {},
					children: [
						{ type: "text", value: "Why " },
						{
							type: "element",
							tagName: "em",
							properties: {},
							children: [{ type: "text", value: "now" }]
						}
					]
				},
				{
					type: "element",
					tagName: "h2",
					properties: {},
					children: [{ type: "text", value: "Why now" }]
				}
			]
		};
		const markdownFileMetadata = createMarkdownFileMetadata();

		rehypeHeadingIds()(syntaxTree, markdownFileMetadata);

		expect(syntaxTree.children[0]?.properties).toStrictEqual({ id: "why-now" });
		expect(syntaxTree.children[1]?.properties).toStrictEqual({ id: "why-now-1" });
	});
});

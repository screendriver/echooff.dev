import { describe, expect, it } from "vitest";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";
import { createBlogRssFeedOptions } from "./blog-rss-feed.ts";

describe("createBlogRssFeedOptions()", () => {
	it("creates RSS feed options from posts sorted by publication date descending", () => {
		const configuredSiteUrl = new URL("https://example.com");
		const actualRssFeedOptions = createBlogRssFeedOptions(
			[
				createBlogPostCollectionEntry({
					description: "Older post",
					id: "older-post",
					title: "Older post",
					publishedAt: "2026-01-01T10:00:00+01:00",
					topic: "Writing"
				}),
				createBlogPostCollectionEntry({
					description: "Newer post",
					id: "newer-post",
					title: "Newer post",
					publishedAt: "2026-02-01T10:00:00+01:00",
					topic: "Writing"
				})
			],
			configuredSiteUrl
		);
		const expectedRssFeedOptions = {
			title: "Christian Rackerseder | Blog",
			description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			site: configuredSiteUrl,
			trailingSlash: false,
			items: [
				{
					title: "Newer post",
					description: "Newer post",
					link: "https://example.com/blog/newer-post",
					pubDate: new Date("2026-02-01T10:00:00+01:00")
				},
				{
					title: "Older post",
					description: "Older post",
					link: "https://example.com/blog/older-post",
					pubDate: new Date("2026-01-01T10:00:00+01:00")
				}
			]
		};

		expect(actualRssFeedOptions).toStrictEqual(expectedRssFeedOptions);
	});

	it("throws when Astro.site is not configured", () => {
		const actualOperation = (): void => {
			createBlogRssFeedOptions([], undefined);
		};
		const expectedErrorMessage = "Astro.site must be configured to create absolute blog URLs";

		expect(actualOperation).toThrow(expectedErrorMessage);
	});
});

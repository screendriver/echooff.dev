import { describe, expect, it, vi } from "vitest";
import { Maybe } from "true-myth";
import {
	countHackerNewsPosts,
	countWebmentions,
	createBuildMentionTotalsRecorder,
	formatBuildMentionTotals
} from "./build-mention-totals.ts";

describe("countWebmentions()", () => {
	it("counts reactions and replies as Webmentions", () => {
		expect(
			countWebmentions({
				reactions: {
					bookmarkCount: 1,
					likeCount: 2,
					repostCount: 3
				},
				replies: [
					{
						author: {
							name: "Jane Doe",
							photoUrl: Maybe.nothing(),
							websiteUrl: Maybe.nothing()
						},
						content: Maybe.nothing(),
						sourceUrl: "https://social.example/jane",
						type: "mention",
						visiblePublishedAt: Maybe.nothing()
					}
				]
			})
		).toBe(7);
	});
});

describe("countHackerNewsPosts()", () => {
	it("counts the number of story mentions", () => {
		expect(
			countHackerNewsPosts({
				mentions: [
					{
						commentCount: 12,
						discussionUrl: "https://news.ycombinator.com/item?id=44000001",
						pointCount: 150,
						storyTitle: "Why I started this blog",
						submittedUrl: Maybe.just("https://www.echooff.dev/blog/why-i-started-this-blog"),
						visiblePublishedAt: Maybe.just("2026-04-01T10:00:00.000Z")
					},
					{
						commentCount: 5,
						discussionUrl: "https://news.ycombinator.com/item?id=44000002",
						pointCount: 90,
						storyTitle: "Why I started this blog (repost)",
						submittedUrl: Maybe.just("https://www.echooff.dev/blog/why-i-started-this-blog"),
						visiblePublishedAt: Maybe.just("2026-04-02T10:00:00.000Z")
					}
				]
			})
		).toBe(2);
	});
});

describe("formatBuildMentionTotals()", () => {
	it("formats the build summary line", () => {
		expect(
			formatBuildMentionTotals({
				totalHackerNewsPostCount: 4,
				totalWebmentionCount: 23
			})
		).toBe("Build mention totals: 23 Webmentions, 4 Hacker News posts");
	});
});

describe("createBuildMentionTotalsRecorder()", () => {
	it("accumulates totals across multiple blog posts and writes the summary once", () => {
		const writeLine = vi.fn<(message: string) => void>();
		const buildMentionTotalsRecorder = createBuildMentionTotalsRecorder({
			writeLine
		});

		buildMentionTotalsRecorder.recordHackerNewsPostCount(1);
		buildMentionTotalsRecorder.recordWebmentionCount(2);
		buildMentionTotalsRecorder.recordHackerNewsPostCount(0);
		buildMentionTotalsRecorder.recordWebmentionCount(3);

		buildMentionTotalsRecorder.flushAccumulatedMentionTotals();
		buildMentionTotalsRecorder.flushAccumulatedMentionTotals();

		expect(writeLine).toHaveBeenCalledExactlyOnceWith("Build mention totals: 5 Webmentions, 1 Hacker News posts");
	});
});

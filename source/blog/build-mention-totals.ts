import process from "node:process";
import type { HackerNewsSectionModel } from "./hacker-news-mentions.ts";
import type { WebmentionSectionModel } from "./webmentions.ts";

type BuildMentionTotals = {
	readonly totalHackerNewsPostCount: number;
	readonly totalWebmentionCount: number;
};

type BuildMentionTotalsRecorderDependencies = {
	readonly writeLine: (message: string) => void;
};

type BuildMentionTotalsRecorder = {
	readonly flushAccumulatedMentionTotals: () => void;
	readonly recordHackerNewsPostCount: (hackerNewsPostCount: number) => void;
	readonly recordWebmentionCount: (webmentionCount: number) => void;
};

const emptyBuildMentionTotals = {
	totalHackerNewsPostCount: 0,
	totalWebmentionCount: 0
} as const satisfies BuildMentionTotals;

export function countHackerNewsPosts(hackerNewsSectionModel: HackerNewsSectionModel): number {
	return hackerNewsSectionModel.mentions.length;
}

export function countWebmentions(webmentionSectionModel: WebmentionSectionModel): number {
	const { bookmarkCount, likeCount, repostCount } = webmentionSectionModel.reactions;

	return bookmarkCount + likeCount + repostCount + webmentionSectionModel.replies.length;
}

export function formatBuildMentionTotals(buildMentionTotals: BuildMentionTotals): string {
	return [
		"Build mention totals:",
		`${buildMentionTotals.totalWebmentionCount} Webmentions,`,
		`${buildMentionTotals.totalHackerNewsPostCount} Hacker News posts`
	].join(" ");
}

export function createBuildMentionTotalsRecorder(
	buildMentionTotalsRecorderDependencies: BuildMentionTotalsRecorderDependencies
): BuildMentionTotalsRecorder {
	let accumulatedBuildMentionTotals: BuildMentionTotals = emptyBuildMentionTotals;
	let hasFlushedAccumulatedMentionTotals = false;

	return {
		flushAccumulatedMentionTotals: () => {
			if (hasFlushedAccumulatedMentionTotals) {
				return;
			}

			hasFlushedAccumulatedMentionTotals = true;
			buildMentionTotalsRecorderDependencies.writeLine(formatBuildMentionTotals(accumulatedBuildMentionTotals));
		},
		recordHackerNewsPostCount: (hackerNewsPostCount) => {
			accumulatedBuildMentionTotals = {
				totalHackerNewsPostCount: accumulatedBuildMentionTotals.totalHackerNewsPostCount + hackerNewsPostCount,
				totalWebmentionCount: accumulatedBuildMentionTotals.totalWebmentionCount
			};
		},
		recordWebmentionCount: (webmentionCount) => {
			accumulatedBuildMentionTotals = {
				totalHackerNewsPostCount: accumulatedBuildMentionTotals.totalHackerNewsPostCount,
				totalWebmentionCount: accumulatedBuildMentionTotals.totalWebmentionCount + webmentionCount
			};
		}
	};
}

const buildMentionTotalsRecorder = createBuildMentionTotalsRecorder({
	writeLine: (message) => {
		process.stdout.write(`\n${message}\n`);
	}
});

let hasRegisteredBuildMentionTotalsProcessExitHook = false;

function registerBuildMentionTotalsProcessExitHook(): void {
	if (hasRegisteredBuildMentionTotalsProcessExitHook) {
		return;
	}

	hasRegisteredBuildMentionTotalsProcessExitHook = true;
	process.once("exit", () => {
		buildMentionTotalsRecorder.flushAccumulatedMentionTotals();
	});
}

export function recordBuildMentionTotalsOutput(): void {
	registerBuildMentionTotalsProcessExitHook();
}

export function recordHackerNewsBuildMentionTotals(hackerNewsSectionModel: HackerNewsSectionModel): void {
	recordBuildMentionTotalsOutput();
	buildMentionTotalsRecorder.recordHackerNewsPostCount(countHackerNewsPosts(hackerNewsSectionModel));
}

export function recordWebmentionBuildMentionTotals(webmentionSectionModel: WebmentionSectionModel): void {
	recordBuildMentionTotalsOutput();
	buildMentionTotalsRecorder.recordWebmentionCount(countWebmentions(webmentionSectionModel));
}

export function recordFailedHackerNewsBuildMentionLoad(): void {
	recordBuildMentionTotalsOutput();
	buildMentionTotalsRecorder.recordHackerNewsPostCount(0);
}

export function recordFailedWebmentionBuildMentionLoad(): void {
	recordBuildMentionTotalsOutput();
	buildMentionTotalsRecorder.recordWebmentionCount(0);
}

import { createBlogVisiblePostSummary } from "./blog-pagination.ts";

export type BlogArchiveMetadata = {
	readonly description: string;
	readonly intro: string;
	readonly pageTitle: string;
	readonly terminalOutput: string;
	readonly title: string;
};

export type CreateBlogArchiveMetadataInput = {
	readonly currentPage: number;
	readonly lastPage: number;
	readonly pageSize: number;
	readonly totalPostCount: number;
};

const defaultBlogArchiveDescription = "Notes on web technologies, engineering tradeoffs, and front-end architecture.";
const siteOwnerName = "Christian Rackerseder";

export function createDefaultBlogArchiveMetadata(totalPostCount: number): BlogArchiveMetadata {
	let terminalOutput = `${totalPostCount} posts available`;

	if (totalPostCount === 1) {
		terminalOutput = "1 post available";
	}

	return {
		description: defaultBlogArchiveDescription,
		intro: defaultBlogArchiveDescription,
		pageTitle: "Blog",
		terminalOutput,
		title: `Software Engineering Blog | ${siteOwnerName}`
	};
}

export function createPaginatedBlogArchiveMetadata(input: CreateBlogArchiveMetadataInput): BlogArchiveMetadata {
	const { currentPage, lastPage, pageSize, totalPostCount } = input;
	const description = `Older software engineering notes, page ${currentPage} of ${lastPage}.`;
	const visiblePostSummary = createBlogVisiblePostSummary({ currentPage, pageSize, totalPostCount });

	return {
		description,
		intro: description,
		pageTitle: `Blog - Page ${currentPage}`,
		terminalOutput: visiblePostSummary.visiblePostCountLabel,
		title: `Software Engineering Blog - Page ${currentPage} | ${siteOwnerName}`
	};
}

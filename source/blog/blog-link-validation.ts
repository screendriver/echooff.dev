import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import is from "@sindresorhus/is";

export type BlogPostMarkdownDocument = {
	readonly blogPostSlug: string;
	readonly markdownDocument: string;
};

export type BlogPostLinkValidationProblem = {
	readonly href: string;
	readonly message: string;
	readonly sourceBlogPostSlug: string;
};

type RenderedBlogPostDocument = {
	readonly blogPostSlug: string;
	readonly headingSlugs: ReadonlySet<string>;
	readonly renderedHtml: string;
};

const siteBaseUrl = new URL("https://www.echooff.dev");
const blogContentDirectoryPath = join(process.cwd(), "source/content/blog");
const anchorHrefPattern = /<a\b[^>]*\bhref="(?<href>[^"]+)"/gu;

function extractAnchorHrefs(renderedHtml: string): string[] {
	const anchorHrefs: string[] = [];

	for (const anchorHrefMatch of renderedHtml.matchAll(anchorHrefPattern)) {
		const href = anchorHrefMatch.groups?.href;

		if (is.string(href)) {
			anchorHrefs.push(href);
		}
	}

	return anchorHrefs;
}

function isInternalSiteUrl(url: URL): boolean {
	return url.origin === siteBaseUrl.origin;
}

function normalizePathname(pathname: string): string {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}

	return pathname;
}

function decodeFragmentIdentifier(fragmentIdentifier: string): string {
	try {
		return decodeURIComponent(fragmentIdentifier);
	} catch {
		return fragmentIdentifier;
	}
}

function findBlogPostLinkValidationProblems(input: {
	readonly headingSlugsByPathname: ReadonlyMap<string, ReadonlySet<string>>;
	readonly knownRoutePathnames: ReadonlySet<string>;
	readonly renderedBlogPostDocument: RenderedBlogPostDocument;
}): BlogPostLinkValidationProblem[] {
	const { headingSlugsByPathname, knownRoutePathnames, renderedBlogPostDocument } = input;
	const sourceBlogPostUrl = new URL(`/blog/${renderedBlogPostDocument.blogPostSlug}`, siteBaseUrl);

	return extractAnchorHrefs(renderedBlogPostDocument.renderedHtml).flatMap((href) => {
		const resolvedHrefUrl = new URL(href, sourceBlogPostUrl);

		if (!isInternalSiteUrl(resolvedHrefUrl)) {
			return [];
		}

		const normalizedPathname = normalizePathname(resolvedHrefUrl.pathname);

		if (!knownRoutePathnames.has(normalizedPathname)) {
			return [
				{
					href,
					message: `Target path "${normalizedPathname}" does not exist`,
					sourceBlogPostSlug: renderedBlogPostDocument.blogPostSlug
				}
			];
		}

		if (resolvedHrefUrl.hash.length === 0) {
			return [];
		}

		const expectedHeadingSlug = decodeFragmentIdentifier(resolvedHrefUrl.hash.slice(1));
		const knownHeadingSlugs = headingSlugsByPathname.get(normalizedPathname);
		const hasExpectedHeadingSlug = knownHeadingSlugs?.has(expectedHeadingSlug) === true;

		if (!hasExpectedHeadingSlug) {
			return [
				{
					href,
					message: `Fragment "${expectedHeadingSlug}" does not exist on "${normalizedPathname}"`,
					sourceBlogPostSlug: renderedBlogPostDocument.blogPostSlug
				}
			];
		}

		return [];
	});
}

async function renderBlogPostDocuments(
	blogPostMarkdownDocuments: readonly BlogPostMarkdownDocument[]
): Promise<RenderedBlogPostDocument[]> {
	const markdownProcessor = await createMarkdownProcessor();

	return Promise.all(
		blogPostMarkdownDocuments.map(async (blogPostMarkdownDocument) => {
			const renderedMarkdownResult = await markdownProcessor.render(blogPostMarkdownDocument.markdownDocument);

			return {
				blogPostSlug: blogPostMarkdownDocument.blogPostSlug,
				headingSlugs: new Set(
					renderedMarkdownResult.metadata.headings.map((heading) => {
						return heading.slug;
					})
				),
				renderedHtml: renderedMarkdownResult.code
			};
		})
	);
}

export async function readBlogPostMarkdownDocuments(): Promise<BlogPostMarkdownDocument[]> {
	const directoryEntries = await readdir(blogContentDirectoryPath, { withFileTypes: true });
	const markdownFileNames = directoryEntries
		.filter((directoryEntry) => {
			return directoryEntry.isFile() && directoryEntry.name.endsWith(".md");
		})
		.map((directoryEntry) => {
			return directoryEntry.name;
		})
		.toSorted((leftMarkdownFileName, rightMarkdownFileName) => {
			return leftMarkdownFileName.localeCompare(rightMarkdownFileName);
		});

	return Promise.all(
		markdownFileNames.map(async (markdownFileName) => {
			const markdownDocument = await readFile(join(blogContentDirectoryPath, markdownFileName), {
				encoding: "utf8"
			});

			return {
				blogPostSlug: markdownFileName.slice(0, -".md".length),
				markdownDocument
			};
		})
	);
}

export async function validateInternalBlogPostLinks(
	blogPostMarkdownDocuments: readonly BlogPostMarkdownDocument[]
): Promise<BlogPostLinkValidationProblem[]> {
	const renderedBlogPostDocuments = await renderBlogPostDocuments(blogPostMarkdownDocuments);
	const knownRoutePathnames = new Set([
		"/",
		"/blog",
		...renderedBlogPostDocuments.map((renderedBlogPostDocument) => {
			return `/blog/${renderedBlogPostDocument.blogPostSlug}`;
		})
	]);
	const headingSlugsByPathname = new Map(
		renderedBlogPostDocuments.map((renderedBlogPostDocument) => {
			return [`/blog/${renderedBlogPostDocument.blogPostSlug}`, renderedBlogPostDocument.headingSlugs] as const;
		})
	);

	return renderedBlogPostDocuments.flatMap((renderedBlogPostDocument) => {
		return findBlogPostLinkValidationProblems({
			headingSlugsByPathname,
			knownRoutePathnames,
			renderedBlogPostDocument
		});
	});
}

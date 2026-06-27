import { isUndefined, isPositiveInteger, isNonNegativeInteger } from "@sindresorhus/is";
import { err, isErr, ok, type Result } from "true-myth/result";
import { createBlogIndexPagePath } from "./blog-site.ts";

export const blogArchivePageSize = 20;

export type BlogPaginationLink = {
	readonly href: string;
	readonly isCurrent: boolean;
	readonly pageNumber: number;
};

export type BlogPaginationModel = {
	readonly currentPage: number;
	readonly lastPage: number;
	readonly nextPageHref: string | undefined;
	readonly pageCountLabel: string;
	readonly pageLinks: readonly BlogPaginationLink[];
	readonly previousPageHref: string | undefined;
	readonly resultsLabel: string;
};

export type BlogVisiblePostSummary = {
	readonly firstVisiblePostNumber: number;
	readonly lastVisiblePostNumber: number;
	readonly visiblePostCount: number;
	readonly visiblePostCountLabel: string;
	readonly visiblePostRangeLabel: string;
};

export type CreateBlogPaginationModelInput = {
	readonly currentPage: number;
	readonly pageSize: number;
	readonly totalPostCount: number;
};

export type CreateBlogVisiblePostSummaryInput = {
	readonly currentPage: number;
	readonly pageSize: number;
	readonly totalPostCount: number;
};

type CreateVisiblePostRangeLabelInput = {
	readonly firstVisiblePostNumber: number;
	readonly lastVisiblePostNumber: number;
	readonly totalPostCount: number;
	readonly visiblePostCount: number;
};

function createVisiblePostCountLabel(visiblePostCount: number): string {
	if (visiblePostCount === 1) {
		return "Showing 1 post";
	}

	return `Showing ${visiblePostCount} posts`;
}

function createVisiblePostRangeLabel(input: CreateVisiblePostRangeLabelInput): string {
	const { firstVisiblePostNumber, lastVisiblePostNumber, totalPostCount, visiblePostCount } = input;

	if (visiblePostCount === 1) {
		return `Post ${firstVisiblePostNumber} of ${totalPostCount}`;
	}

	return `Posts ${firstVisiblePostNumber}-${lastVisiblePostNumber} of ${totalPostCount}`;
}

export function createBlogVisiblePostSummary(input: CreateBlogVisiblePostSummaryInput): BlogVisiblePostSummary {
	const { currentPage, pageSize, totalPostCount } = input;

	if (totalPostCount === 0) {
		return {
			firstVisiblePostNumber: 0,
			lastVisiblePostNumber: 0,
			visiblePostCount: 0,
			visiblePostCountLabel: "Showing 0 posts",
			visiblePostRangeLabel: "0 posts"
		};
	}

	const firstVisiblePostNumber = (currentPage - 1) * pageSize + 1;
	const lastVisiblePostNumber = Math.min(currentPage * pageSize, totalPostCount);
	const visiblePostCount = lastVisiblePostNumber - firstVisiblePostNumber + 1;
	const visiblePostCountLabel = createVisiblePostCountLabel(visiblePostCount);
	const visiblePostRangeLabel = createVisiblePostRangeLabel({
		firstVisiblePostNumber,
		lastVisiblePostNumber,
		totalPostCount,
		visiblePostCount
	});

	return {
		firstVisiblePostNumber,
		lastVisiblePostNumber,
		visiblePostCount,
		visiblePostCountLabel,
		visiblePostRangeLabel
	};
}

function createOptionalPageHref(pageNumber: number | undefined): Result<string | undefined, RangeError> {
	if (isUndefined(pageNumber)) {
		return ok(undefined);
	}

	return createBlogIndexPagePath(pageNumber);
}

function createPageLinks(currentPage: number, lastPage: number): Result<readonly BlogPaginationLink[], RangeError> {
	const pageLinks: BlogPaginationLink[] = [];

	for (let pageNumber = 1; pageNumber <= lastPage; pageNumber += 1) {
		const pageHrefResult = createBlogIndexPagePath(pageNumber);

		if (isErr(pageHrefResult)) {
			return err(pageHrefResult.error);
		}

		pageLinks.push({
			href: pageHrefResult.value,
			isCurrent: pageNumber === currentPage,
			pageNumber
		});
	}

	return ok(pageLinks);
}

function validateInput(input: CreateBlogPaginationModelInput): Result<CreateBlogPaginationModelInput, RangeError> {
	const { currentPage, pageSize, totalPostCount } = input;

	if (!isPositiveInteger(currentPage)) {
		return err(new RangeError(`Current page must be a positive integer, received "${currentPage}"`));
	}

	if (!isPositiveInteger(pageSize)) {
		return err(new RangeError(`Page size must be a positive integer, received "${pageSize}"`));
	}

	if (!isNonNegativeInteger(totalPostCount)) {
		return err(new RangeError(`Total post count must be a non-negative integer, received "${totalPostCount}"`));
	}

	return ok(input);
}

function createPaginationWindow(
	currentPage: number,
	lastPage: number
): Result<{ nextPageHref: string | undefined; previousPageHref: string | undefined }, RangeError> {
	const previousPageHrefResult = createOptionalPageHref(currentPage > 1 ? currentPage - 1 : undefined);

	if (isErr(previousPageHrefResult)) {
		return err(previousPageHrefResult.error);
	}

	const nextPageHrefResult = createOptionalPageHref(currentPage < lastPage ? currentPage + 1 : undefined);

	if (isErr(nextPageHrefResult)) {
		return err(nextPageHrefResult.error);
	}

	return ok({
		nextPageHref: nextPageHrefResult.value,
		previousPageHref: previousPageHrefResult.value
	});
}

export function createBlogPaginationModel(
	input: CreateBlogPaginationModelInput
): Result<BlogPaginationModel, RangeError> {
	const validatedInputResult = validateInput(input);

	if (isErr(validatedInputResult)) {
		return err(validatedInputResult.error);
	}

	const { currentPage, pageSize, totalPostCount } = validatedInputResult.value;
	const lastPage = Math.max(1, Math.ceil(totalPostCount / pageSize));

	if (currentPage > lastPage) {
		return err(new RangeError(`Current page "${currentPage}" exceeds last page "${lastPage}"`));
	}

	const pageLinksResult = createPageLinks(currentPage, lastPage);

	if (isErr(pageLinksResult)) {
		return err(pageLinksResult.error);
	}

	const paginationWindowResult = createPaginationWindow(currentPage, lastPage);

	if (isErr(paginationWindowResult)) {
		return err(paginationWindowResult.error);
	}

	const visiblePostSummary = createBlogVisiblePostSummary({ currentPage, pageSize, totalPostCount });

	return ok({
		currentPage,
		lastPage,
		nextPageHref: paginationWindowResult.value.nextPageHref,
		pageCountLabel: `Page ${currentPage} of ${lastPage}`,
		pageLinks: pageLinksResult.value,
		previousPageHref: paginationWindowResult.value.previousPageHref,
		resultsLabel: visiblePostSummary.visiblePostRangeLabel
	});
}

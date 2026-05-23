import is from "@sindresorhus/is";
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

export type CreateBlogPaginationModelInput = {
	readonly currentPage: number;
	readonly pageSize: number;
	readonly totalPostCount: number;
};

function createResultsLabel(currentPage: number, pageSize: number, totalPostCount: number): string {
	if (totalPostCount === 0) {
		return "Showing 0 of 0 posts";
	}

	const firstVisiblePostNumber = (currentPage - 1) * pageSize + 1;
	const lastVisiblePostNumber = Math.min(currentPage * pageSize, totalPostCount);

	return `Showing ${firstVisiblePostNumber}-${lastVisiblePostNumber} of ${totalPostCount} posts`;
}

function createOptionalPageHref(pageNumber: number | undefined): Result<string | undefined, RangeError> {
	if (is.undefined(pageNumber)) {
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

	if (!is.positiveInteger(currentPage)) {
		return err(new RangeError(`Current page must be a positive integer, received "${currentPage}"`));
	}

	if (!is.positiveInteger(pageSize)) {
		return err(new RangeError(`Page size must be a positive integer, received "${pageSize}"`));
	}

	if (!is.nonNegativeInteger(totalPostCount)) {
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

	return ok({
		currentPage,
		lastPage,
		nextPageHref: paginationWindowResult.value.nextPageHref,
		pageCountLabel: `Page ${currentPage} of ${lastPage}`,
		pageLinks: pageLinksResult.value,
		previousPageHref: paginationWindowResult.value.previousPageHref,
		resultsLabel: createResultsLabel(currentPage, pageSize, totalPostCount)
	});
}

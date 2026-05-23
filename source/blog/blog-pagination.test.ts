import { describe, expect, it } from "vitest";
import { err, ok } from "true-myth/result";
import { blogArchivePageSize, createBlogPaginationModel } from "./blog-pagination.ts";

describe("createBlogPaginationModel()", () => {
	it("creates first-page navigation details for a multi-page archive", () => {
		expect(
			createBlogPaginationModel({
				currentPage: 1,
				pageSize: blogArchivePageSize,
				totalPostCount: 21
			})
		).toStrictEqual(
			ok({
				currentPage: 1,
				lastPage: 2,
				nextPageHref: "/blog/page/2",
				pageCountLabel: "Page 1 of 2",
				pageLinks: [
					{
						href: "/blog",
						isCurrent: true,
						pageNumber: 1
					},
					{
						href: "/blog/page/2",
						isCurrent: false,
						pageNumber: 2
					}
				],
				previousPageHref: undefined,
				resultsLabel: "Showing 1-20 of 21 posts"
			})
		);
	});

	it("creates later-page navigation details with previous and next links", () => {
		expect(
			createBlogPaginationModel({
				currentPage: 2,
				pageSize: 10,
				totalPostCount: 35
			})
		).toStrictEqual(
			ok({
				currentPage: 2,
				lastPage: 4,
				nextPageHref: "/blog/page/3",
				pageCountLabel: "Page 2 of 4",
				pageLinks: [
					{
						href: "/blog",
						isCurrent: false,
						pageNumber: 1
					},
					{
						href: "/blog/page/2",
						isCurrent: true,
						pageNumber: 2
					},
					{
						href: "/blog/page/3",
						isCurrent: false,
						pageNumber: 3
					},
					{
						href: "/blog/page/4",
						isCurrent: false,
						pageNumber: 4
					}
				],
				previousPageHref: "/blog",
				resultsLabel: "Showing 11-20 of 35 posts"
			})
		);
	});

	it("returns a Result Err when the current page exceeds the last page", () => {
		expect(
			createBlogPaginationModel({
				currentPage: 3,
				pageSize: blogArchivePageSize,
				totalPostCount: 21
			})
		).toStrictEqual(err(new RangeError('Current page "3" exceeds last page "2"')));
	});

	it("returns a Result Err when the total post count is invalid", () => {
		expect(
			createBlogPaginationModel({
				currentPage: 1,
				pageSize: blogArchivePageSize,
				totalPostCount: -1
			})
		).toStrictEqual(err(new RangeError('Total post count must be a non-negative integer, received "-1"')));
	});
});

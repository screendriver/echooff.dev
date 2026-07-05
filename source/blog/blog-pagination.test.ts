import assert from "node:assert";
import { suite, test } from "mocha";
import { err, ok } from "true-myth/result";
import { blogArchivePageSize, createBlogPaginationModel } from "./blog-pagination.ts";

suite("createBlogPaginationModel()", function () {
	test("creates first-page navigation details for a multi-page archive", function () {
		const actualPaginationModel = createBlogPaginationModel({
			currentPage: 1,
			pageSize: blogArchivePageSize,
			totalPostCount: 21
		});
		const expectedPaginationModel = ok({
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
			resultsLabel: "Posts 1-20 of 21"
		});

		assert.deepStrictEqual(actualPaginationModel, expectedPaginationModel);
	});

	test("creates later-page navigation details with previous and next links", function () {
		const actualPaginationModel = createBlogPaginationModel({
			currentPage: 2,
			pageSize: 10,
			totalPostCount: 35
		});
		const expectedPaginationModel = ok({
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
			resultsLabel: "Posts 11-20 of 35"
		});

		assert.deepStrictEqual(actualPaginationModel, expectedPaginationModel);
	});

	test("creates a singular range label for a single-post final page", function () {
		const actualPaginationModel = createBlogPaginationModel({
			currentPage: 2,
			pageSize: blogArchivePageSize,
			totalPostCount: 21
		});
		const expectedPaginationModel = ok({
			currentPage: 2,
			lastPage: 2,
			nextPageHref: undefined,
			pageCountLabel: "Page 2 of 2",
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
				}
			],
			previousPageHref: "/blog",
			resultsLabel: "Post 21 of 21"
		});

		assert.deepStrictEqual(actualPaginationModel, expectedPaginationModel);
	});

	test("returns a Result Err when the current page exceeds the last page", function () {
		const actualPaginationModel = createBlogPaginationModel({
			currentPage: 3,
			pageSize: blogArchivePageSize,
			totalPostCount: 21
		});
		const expectedPaginationModel = err(new RangeError('Current page "3" exceeds last page "2"'));

		assert.deepStrictEqual(actualPaginationModel, expectedPaginationModel);
	});

	test("returns a Result Err when the total post count is invalid", function () {
		const actualPaginationModel = createBlogPaginationModel({
			currentPage: 1,
			pageSize: blogArchivePageSize,
			totalPostCount: -1
		});
		const expectedPaginationModel = err(
			new RangeError('Total post count must be a non-negative integer, received "-1"')
		);

		assert.deepStrictEqual(actualPaginationModel, expectedPaginationModel);
	});
});

import assert from "node:assert";
import { suite, test } from "mocha";
import type {
	UnexpectedFailureContext,
	UnexpectedFailureReporter
} from "../browser/report-unexpected-browser-failure.ts";
import {
	initializeBlogSearchPage,
	type BlogSearchPageBrowserDependencies,
	type PagefindCustomElementRegistry
} from "./blog-search-page-browser.ts";
import type { PagefindInput, PagefindInputFinder } from "./focus-pagefind-input.ts";

type CreateBlogSearchPageBrowserDependenciesOptions = {
	readonly customElementRegistry: PagefindCustomElementRegistry;
	readonly findPagefindInput: PagefindInputFinder;
	readonly unexpectedFailureReporter: UnexpectedFailureReporter;
};

function createBlogSearchPageBrowserDependencies(
	options: CreateBlogSearchPageBrowserDependenciesOptions
): BlogSearchPageBrowserDependencies {
	const { customElementRegistry, findPagefindInput, unexpectedFailureReporter } = options;

	return {
		customElementRegistry,
		findPagefindInput,
		unexpectedFailureReporter
	};
}

suite("initializeBlogSearchPage()", function () {
	test("focuses the Pagefind input after its custom element is defined", async function () {
		const focusCompleted = Promise.withResolvers<boolean>();
		const pagefindInput: PagefindInput = {
			focus() {
				focusCompleted.resolve(true);
			}
		};

		const reportedFailures: unknown[] = [];
		const unexpectedFailureReporter: UnexpectedFailureReporter = {
			report(error): void {
				reportedFailures.push(error);
			}
		};
		const customElementRegistry: PagefindCustomElementRegistry = {
			async whenDefined(): Promise<void> {
				await Promise.resolve();
			}
		};
		const findPagefindInput: PagefindInputFinder = () => {
			return pagefindInput;
		};

		initializeBlogSearchPage(
			createBlogSearchPageBrowserDependencies({
				customElementRegistry,
				findPagefindInput,
				unexpectedFailureReporter
			})
		);

		const actualFocusCompleted = await focusCompleted.promise;

		assert.strictEqual(actualFocusCompleted, true);
		assert.deepStrictEqual(reportedFailures, []);
	});

	test("reports Pagefind initialization failures with search context", async function () {
		const expectedError = new Error("Pagefind failed to initialize");
		const reportedFailure = Promise.withResolvers<{
			readonly error: unknown;
			readonly context: UnexpectedFailureContext;
		}>();
		const unexpectedFailureReporter: UnexpectedFailureReporter = {
			report(error, context): void {
				reportedFailure.resolve({ context, error });
			}
		};
		const customElementRegistry: PagefindCustomElementRegistry = {
			async whenDefined(): Promise<void> {
				throw expectedError;
			}
		};
		const findPagefindInput: PagefindInputFinder = () => {
			return null;
		};

		initializeBlogSearchPage(
			createBlogSearchPageBrowserDependencies({
				customElementRegistry,
				findPagefindInput,
				unexpectedFailureReporter
			})
		);

		const actualReportedFailure = await reportedFailure.promise;
		const expectedReportedFailure = {
			context: {
				feature: "blog_search",
				operation: "blog_search.focus_input",
				runtime: "browser"
			},
			error: expectedError
		};

		assert.deepStrictEqual(actualReportedFailure, expectedReportedFailure);
	});
});

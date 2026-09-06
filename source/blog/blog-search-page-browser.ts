import { createFireAndForgetInvoker } from "../browser/fire-and-forget-invoker.ts";
import type { UnexpectedFailureReporter } from "../browser/report-unexpected-browser-failure.ts";
import { focusPagefindInput, type PagefindInputFinder } from "./focus-pagefind-input.ts";

export type BlogSearchPageBrowserDependencies = {
	readonly customElementRegistry: PagefindCustomElementRegistry;
	readonly findPagefindInput: PagefindInputFinder;
	readonly unexpectedFailureReporter: UnexpectedFailureReporter;
};

export type PagefindCustomElementRegistry = {
	readonly whenDefined: (customElementName: string) => PromiseLike<unknown>;
};

const pagefindInputCustomElementName = "pagefind-input";

export function initializeBlogSearchPage(blogSearchPageBrowserDependencies: BlogSearchPageBrowserDependencies): void {
	const { customElementRegistry, findPagefindInput, unexpectedFailureReporter } = blogSearchPageBrowserDependencies;
	const focusSearchInputFireAndForgetInvoker = createFireAndForgetInvoker({
		reportFailure(error) {
			unexpectedFailureReporter.report(error, {
				feature: "blog_search",
				operation: "blog_search.focus_input",
				runtime: "browser"
			});
		}
	});

	async function focusSearchInputWhenPagefindIsReady(): Promise<void> {
		await customElementRegistry.whenDefined(pagefindInputCustomElementName);
		focusPagefindInput(findPagefindInput());
	}

	focusSearchInputFireAndForgetInvoker.invoke(focusSearchInputWhenPagefindIsReady);
}

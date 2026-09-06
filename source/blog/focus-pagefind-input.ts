import { isHtmlElement } from "@sindresorhus/is";

export type PagefindInput = {
	readonly focus: () => void;
};

export type PagefindInputDocument = {
	readonly querySelector: (selector: string) => Element | null;
};

export type PagefindInputFinder = () => PagefindInput | null;

export function createPagefindInputFinder(pageDocument: PagefindInputDocument): PagefindInputFinder {
	return () => {
		const pagefindInput = pageDocument.querySelector("pagefind-input");

		if (isHtmlElement(pagefindInput)) {
			return pagefindInput;
		}

		return null;
	};
}

export function focusPagefindInput(pagefindInput: PagefindInput | null): void {
	if (pagefindInput !== null) {
		pagefindInput.focus();
	}
}

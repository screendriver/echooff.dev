import type { ReadingProgressSnapshot } from "./reading-progress.ts";

export type ReadingProgressEventListenerOptions = {
	readonly passive: true;
};

export type ReadingProgressBrowserDependencies = {
	readonly cancelAnimationFrame: (animationFrameIdentifier: number) => void;
	readonly readDocumentScrollHeight: () => number;
	readonly readVerticalScrollOffset: () => number;
	readonly readViewportHeight: () => number;
	readonly registerResizeListener: (listener: () => void, options: ReadingProgressEventListenerOptions) => () => void;
	readonly registerScrollListener: (listener: () => void, options: ReadingProgressEventListenerOptions) => () => void;
	readonly requestAnimationFrame: (callback: FrameRequestCallback) => number;
};

function readReadingProgressSnapshot(
	readingProgressBrowserDependencies: ReadingProgressBrowserDependencies
): ReadingProgressSnapshot {
	return {
		documentScrollHeight: readingProgressBrowserDependencies.readDocumentScrollHeight(),
		verticalScrollOffset: readingProgressBrowserDependencies.readVerticalScrollOffset(),
		viewportHeight: readingProgressBrowserDependencies.readViewportHeight()
	};
}

export function createReadingProgressBrowserDependencies(): ReadingProgressBrowserDependencies {
	const browserGlobals = globalThis;
	const browserWindow = browserGlobals.window;
	const browserDocument = browserGlobals.document;

	return {
		cancelAnimationFrame(animationFrameIdentifier) {
			browserWindow.cancelAnimationFrame(animationFrameIdentifier);
		},
		readDocumentScrollHeight() {
			return browserDocument.documentElement.scrollHeight;
		},
		readVerticalScrollOffset() {
			return browserWindow.scrollY;
		},
		readViewportHeight() {
			return browserWindow.innerHeight;
		},
		registerResizeListener(listener, options) {
			browserWindow.addEventListener("resize", listener, options);

			return function removeResizeListener(): void {
				browserWindow.removeEventListener("resize", listener);
			};
		},
		registerScrollListener(listener, options) {
			browserWindow.addEventListener("scroll", listener, options);

			return function removeScrollListener(): void {
				browserWindow.removeEventListener("scroll", listener);
			};
		},
		requestAnimationFrame(callback) {
			return browserWindow.requestAnimationFrame(callback);
		}
	};
}

export { readReadingProgressSnapshot };

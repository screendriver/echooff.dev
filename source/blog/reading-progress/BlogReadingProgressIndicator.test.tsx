import assert from "node:assert";
import { act, cleanup, render } from "@testing-library/preact";
import { setup, suite, teardown, test } from "mocha";
import { createJsdomTestEnvironment, type JsdomTestEnvironment } from "../../test-support/jsdom-test-environment.ts";
import type {
	ReadingProgressBrowserDependencies,
	ReadingProgressEventListenerOptions
} from "./reading-progress-browser-adapter.ts";
import { BlogReadingProgressIndicator } from "./BlogReadingProgressIndicator.tsx";

type TestAnimationFrame = {
	readonly callback: FrameRequestCallback;
	readonly identifier: number;
};

type TestReadingProgressDimensions = {
	readonly documentScrollHeight: number;
	readonly verticalScrollOffset: number;
	readonly viewportHeight: number;
};

type TestReadingProgressBrowser = {
	readonly dependencies: ReadingProgressBrowserDependencies;
	readonly invokeNextAnimationFrame: () => void;
	readonly setDimensions: (dimensions: TestReadingProgressDimensions) => void;
	readonly triggerResize: () => void;
	readonly triggerScroll: () => void;
	readonly getCancelledAnimationFrameIdentifiers: () => readonly number[];
	readonly getRegisteredResizeListenerOptions: () => ReadingProgressEventListenerOptions;
	readonly getRegisteredScrollListenerOptions: () => ReadingProgressEventListenerOptions;
	readonly getRegisteredResizeListenerCount: () => number;
	readonly getRegisteredScrollListenerCount: () => number;
	readonly getRemovedResizeListenerCount: () => number;
	readonly getRemovedScrollListenerCount: () => number;
	readonly getScheduledAnimationFrameCount: () => number;
};

function failWhenReadingProgressListenerIsNotRegistered(): never {
	throw new TypeError("Expected the reading progress listener to be registered.");
}

function createTestReadingProgressBrowser(): TestReadingProgressBrowser {
	let registeredResizeListener: () => void = failWhenReadingProgressListenerIsNotRegistered;
	let registeredScrollListener: () => void = failWhenReadingProgressListenerIsNotRegistered;
	let registeredResizeListenerOptions: ReadingProgressEventListenerOptions = { passive: true };
	let registeredScrollListenerOptions: ReadingProgressEventListenerOptions = { passive: true };
	let registeredResizeListenerCount = 0;
	let registeredScrollListenerCount = 0;
	let removedResizeListenerCount = 0;
	let removedScrollListenerCount = 0;
	let nextAnimationFrameIdentifier = 1;
	const animationFrames: TestAnimationFrame[] = [];
	const cancelledAnimationFrameIdentifiers: number[] = [];
	let documentScrollHeight = 2400;
	let verticalScrollOffset = 0;
	let viewportHeight = 800;

	const dependencies: ReadingProgressBrowserDependencies = {
		cancelAnimationFrame(animationFrameIdentifier) {
			cancelledAnimationFrameIdentifiers.push(animationFrameIdentifier);
		},
		readDocumentScrollHeight() {
			return documentScrollHeight;
		},
		readVerticalScrollOffset() {
			return verticalScrollOffset;
		},
		readViewportHeight() {
			return viewportHeight;
		},
		registerResizeListener(listener, options) {
			registeredResizeListener = listener;
			registeredResizeListenerOptions = options;
			registeredResizeListenerCount += 1;

			return function removeTestResizeListener(): void {
				removedResizeListenerCount += 1;
			};
		},
		registerScrollListener(listener, options) {
			registeredScrollListener = listener;
			registeredScrollListenerOptions = options;
			registeredScrollListenerCount += 1;

			return function removeTestScrollListener(): void {
				removedScrollListenerCount += 1;
			};
		},
		requestAnimationFrame(callback) {
			const identifier = nextAnimationFrameIdentifier;
			nextAnimationFrameIdentifier += 1;
			animationFrames.push({ callback, identifier });

			return identifier;
		}
	};

	return {
		dependencies,
		getCancelledAnimationFrameIdentifiers() {
			return cancelledAnimationFrameIdentifiers;
		},
		getRegisteredResizeListenerCount() {
			return registeredResizeListenerCount;
		},
		getRegisteredResizeListenerOptions() {
			return registeredResizeListenerOptions;
		},
		getRegisteredScrollListenerCount() {
			return registeredScrollListenerCount;
		},
		getRegisteredScrollListenerOptions() {
			return registeredScrollListenerOptions;
		},
		getRemovedResizeListenerCount() {
			return removedResizeListenerCount;
		},
		getRemovedScrollListenerCount() {
			return removedScrollListenerCount;
		},
		getScheduledAnimationFrameCount() {
			return animationFrames.length;
		},
		invokeNextAnimationFrame() {
			const animationFrame = animationFrames[0];

			if (animationFrame === undefined) {
				throw new Error("Expected an animation frame to be scheduled.");
			}

			animationFrame.callback(0);
		},
		triggerResize() {
			registeredResizeListener();
		},
		triggerScroll() {
			registeredScrollListener();
		},
		setDimensions(dimensions) {
			documentScrollHeight = dimensions.documentScrollHeight;
			verticalScrollOffset = dimensions.verticalScrollOffset;
			viewportHeight = dimensions.viewportHeight;
		}
	};
}

function readProgressFillElement(container: Element): HTMLElement {
	const progressFillElement = container.querySelector(':scope > [aria-hidden="true"] > div');

	if (!(progressFillElement instanceof HTMLElement)) {
		throw new TypeError("Expected the reading progress fill element to be rendered.");
	}

	return progressFillElement;
}

const jsdomTestEnvironment: JsdomTestEnvironment = createJsdomTestEnvironment();

suite("BlogReadingProgressIndicator component integration", function () {
	setup(function () {
		jsdomTestEnvironment.install();
	});

	teardown(function () {
		cleanup();
		jsdomTestEnvironment.restore();
	});

	test("renders an initial zero-width progress indicator", function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		const { container } = render(
			<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />
		);

		assert.strictEqual(readProgressFillElement(container).style.width, "0%");
	});

	test("reads and renders initial progress after mounting", function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		testReadingProgressBrowser.setDimensions({
			documentScrollHeight: 2400,
			verticalScrollOffset: 400,
			viewportHeight: 800
		});
		const { container } = render(
			<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />
		);

		assert.strictEqual(readProgressFillElement(container).style.width, "25%");
	});

	test("registers passive scroll and resize listeners exactly once", function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		render(<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />);

		assert.strictEqual(testReadingProgressBrowser.getRegisteredScrollListenerCount(), 1);
		assert.strictEqual(testReadingProgressBrowser.getRegisteredResizeListenerCount(), 1);
		assert.deepStrictEqual(testReadingProgressBrowser.getRegisteredScrollListenerOptions(), { passive: true });
		assert.deepStrictEqual(testReadingProgressBrowser.getRegisteredResizeListenerOptions(), { passive: true });
	});

	test("coalesces scroll and resize events until one animation frame", function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		render(<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />);

		testReadingProgressBrowser.triggerScroll();
		testReadingProgressBrowser.triggerScroll();
		testReadingProgressBrowser.triggerResize();

		assert.strictEqual(testReadingProgressBrowser.getScheduledAnimationFrameCount(), 1);
	});

	test("reads the latest dimensions when the scheduled frame runs", async function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		const { container } = render(
			<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />
		);

		testReadingProgressBrowser.triggerScroll();
		testReadingProgressBrowser.setDimensions({
			documentScrollHeight: 2400,
			verticalScrollOffset: 1200,
			viewportHeight: 800
		});
		await act(() => {
			testReadingProgressBrowser.invokeNextAnimationFrame();
		});

		assert.strictEqual(readProgressFillElement(container).style.width, "75%");
	});

	test("cancels a pending frame and removes both listeners on unmount", function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		const { unmount } = render(
			<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />
		);
		testReadingProgressBrowser.triggerScroll();

		unmount();

		assert.deepStrictEqual(testReadingProgressBrowser.getCancelledAnimationFrameIdentifiers(), [1]);
		assert.strictEqual(testReadingProgressBrowser.getRemovedScrollListenerCount(), 1);
		assert.strictEqual(testReadingProgressBrowser.getRemovedResizeListenerCount(), 1);
		testReadingProgressBrowser.invokeNextAnimationFrame();
	});

	test("keeps the indicator decorative", function () {
		const testReadingProgressBrowser = createTestReadingProgressBrowser();
		const { container } = render(
			<BlogReadingProgressIndicator browserDependencies={testReadingProgressBrowser.dependencies} />
		);
		const progressIndicatorElement = container.firstElementChild;

		assert.strictEqual(progressIndicatorElement?.getAttribute("aria-hidden"), "true");
	});
});

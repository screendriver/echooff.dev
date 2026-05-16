export type ReadingProgressSnapshot = {
	readonly documentScrollHeight: number;
	readonly verticalScrollOffset: number;
	readonly viewportHeight: number;
};

export type ReadingProgressIndicatorDependencies = {
	readonly readDocumentScrollHeight: () => number;
	readonly readVerticalScrollOffset: () => number;
	readonly readViewportHeight: () => number;
	readonly registerResizeListener: (listener: () => void) => void;
	readonly registerScrollListener: (listener: () => void) => void;
	readonly writeProgressPercentage: (progressPercentage: number) => void;
};

const minimumProgressPercentage = 0;
const maximumProgressPercentage = 100;

function clampProgressPercentage(progressPercentage: number): number {
	return Math.min(Math.max(progressPercentage, minimumProgressPercentage), maximumProgressPercentage);
}

export function calculateReadingProgressPercentage(readingProgressSnapshot: ReadingProgressSnapshot): number {
	const scrollableDistance = Math.max(
		readingProgressSnapshot.documentScrollHeight - readingProgressSnapshot.viewportHeight,
		0
	);

	if (scrollableDistance === 0) {
		return maximumProgressPercentage;
	}

	const rawProgressPercentage =
		(readingProgressSnapshot.verticalScrollOffset / scrollableDistance) * maximumProgressPercentage;

	return clampProgressPercentage(rawProgressPercentage);
}

export function initializeReadingProgressIndicator(
	readingProgressIndicatorDependencies: ReadingProgressIndicatorDependencies
): void {
	function updateReadingProgressIndicator(): void {
		readingProgressIndicatorDependencies.writeProgressPercentage(
			calculateReadingProgressPercentage({
				documentScrollHeight: readingProgressIndicatorDependencies.readDocumentScrollHeight(),
				verticalScrollOffset: readingProgressIndicatorDependencies.readVerticalScrollOffset(),
				viewportHeight: readingProgressIndicatorDependencies.readViewportHeight()
			})
		);
	}

	updateReadingProgressIndicator();
	readingProgressIndicatorDependencies.registerScrollListener(updateReadingProgressIndicator);
	readingProgressIndicatorDependencies.registerResizeListener(updateReadingProgressIndicator);
}

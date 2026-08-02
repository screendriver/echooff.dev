export type ReadingProgressSnapshot = {
	readonly documentScrollHeight: number;
	readonly verticalScrollOffset: number;
	readonly viewportHeight: number;
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

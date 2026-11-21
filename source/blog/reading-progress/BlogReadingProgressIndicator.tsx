import { useEffect, useState } from "preact/hooks";
import { just, nothing, type Maybe } from "true-myth/maybe";
import type { ComponentChildren } from "preact";
import { calculateReadingProgressPercentage } from "./reading-progress.ts";
import {
	createReadingProgressBrowserDependencies,
	readReadingProgressSnapshot,
	type ReadingProgressBrowserDependencies
} from "./reading-progress-browser-adapter.ts";

export type Properties = {
	readonly browserDependencies?: ReadingProgressBrowserDependencies;
};

export function BlogReadingProgressIndicator(properties: Properties): ComponentChildren {
	const [progressPercentage, setProgressPercentage] = useState(0);

	useEffect(() => {
		const readingProgressBrowserDependencies =
			properties.browserDependencies ?? createReadingProgressBrowserDependencies();
		let componentIsMounted = true;
		let pendingAnimationFrameIdentifier: Maybe<number> = nothing();

		function updateProgressPercentage(): void {
			if (!componentIsMounted) {
				return;
			}

			setProgressPercentage(
				calculateReadingProgressPercentage(readReadingProgressSnapshot(readingProgressBrowserDependencies))
			);
		}

		function scheduleProgressUpdate(): void {
			if (!componentIsMounted || pendingAnimationFrameIdentifier.isJust) {
				return;
			}

			pendingAnimationFrameIdentifier = just(
				readingProgressBrowserDependencies.requestAnimationFrame(() => {
					pendingAnimationFrameIdentifier = nothing();
					updateProgressPercentage();
				})
			);
		}

		updateProgressPercentage();
		const removeScrollListener = readingProgressBrowserDependencies.registerScrollListener(scheduleProgressUpdate);
		const removeResizeListener = readingProgressBrowserDependencies.registerResizeListener(scheduleProgressUpdate);

		return function cleanupReadingProgressEffect(): void {
			componentIsMounted = false;
			removeScrollListener();
			removeResizeListener();

			if (pendingAnimationFrameIdentifier.isJust) {
				readingProgressBrowserDependencies.cancelAnimationFrame(pendingAnimationFrameIdentifier.value);
			}
		};
	}, [properties.browserDependencies]);

	return (
		<div aria-hidden="true" className="blog-reading-progress-indicator">
			<div className="blog-reading-progress-indicator-fill" style={{ width: `${progressPercentage}%` }} />
		</div>
	);
}

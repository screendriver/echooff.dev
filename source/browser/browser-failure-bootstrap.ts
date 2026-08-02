import type { UnexpectedFailureContext, UnexpectedFailureReporter } from "./report-unexpected-browser-failure.ts";

export type BrowserFailureEventName = "error" | "unhandledrejection";

export type BrowserFailureBootstrapCapabilities = {
	readonly addEventListener: (eventName: BrowserFailureEventName, listener: (browserEvent: unknown) => void) => void;
};

export type CreateBrowserFailureBootstrapOptions = {
	readonly capabilities: BrowserFailureBootstrapCapabilities;
	readonly reporter: UnexpectedFailureReporter;
};

export type BrowserFailureBootstrap = {
	readonly install: () => boolean;
};

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null;
}

function hasBrowserEventProperty(browserEvent: unknown, propertyName: string): browserEvent is UnknownRecord {
	return isUnknownRecord(browserEvent) && Object.hasOwn(browserEvent, propertyName);
}

function createBrowserFailureContext(operation: string): UnexpectedFailureContext {
	return {
		operation,
		runtime: "browser"
	};
}

export function createBrowserFailureBootstrap(
	createBrowserFailureBootstrapOptions: CreateBrowserFailureBootstrapOptions
): BrowserFailureBootstrap {
	const { capabilities, reporter } = createBrowserFailureBootstrapOptions;
	let isInstalled = false;

	return {
		install(): boolean {
			if (isInstalled) {
				return false;
			}

			isInstalled = true;
			capabilities.addEventListener("error", function handleBrowserErrorEvent(browserEvent): void {
				if (
					!hasBrowserEventProperty(browserEvent, "error") ||
					browserEvent.error === undefined ||
					browserEvent.error === null
				) {
					return;
				}

				reporter.report(browserEvent.error, createBrowserFailureContext("window.error"));
			});
			capabilities.addEventListener(
				"unhandledrejection",
				function handleUnhandledRejectionEvent(browserEvent): void {
					if (!hasBrowserEventProperty(browserEvent, "reason")) {
						return;
					}

					reporter.report(browserEvent.reason, createBrowserFailureContext("window.unhandledrejection"));
				}
			);
			return true;
		}
	};
}

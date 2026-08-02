import { nothing } from "true-myth/maybe";
import {
	bugsinkIsProductionBuild,
	readBuildBugsinkConfiguration,
	type BugsinkConfiguration
} from "../error-reporting/bugsink-configuration.ts";
import {
	createBrowserFailureBootstrap,
	type BrowserFailureBootstrapCapabilities
} from "./browser-failure-bootstrap.ts";
import { createLazyBugsinkBrowserReporter } from "./bugsink/lazy-bugsink-browser-reporter.ts";
import type { UnexpectedFailureReporter } from "./report-unexpected-browser-failure.ts";

const buildBugsinkConfigurationResult = readBuildBugsinkConfiguration();

if (bugsinkIsProductionBuild && buildBugsinkConfigurationResult.isErr) {
	throw new TypeError("The production Bugsink browser configuration is invalid.");
}

const browserBugsinkConfiguration = buildBugsinkConfigurationResult.unwrapOr(nothing<BugsinkConfiguration>());

function createWindowBrowserFailureCapabilities(): BrowserFailureBootstrapCapabilities {
	function readBrowserWindow(): Window {
		const browserWindow = document.defaultView;

		if (browserWindow === null) {
			throw new Error("The browser window is unavailable.");
		}

		return browserWindow;
	}

	return {
		addEventListener(eventName, listener): void {
			const browserWindow = readBrowserWindow();

			browserWindow.addEventListener(eventName, listener as EventListener);
		}
	};
}

function writeBrowserFailureToTerminal(error: unknown): void {
	// eslint-disable-next-line no-console -- The fallback must stay independent from error reporting.
	console.error(error);
}

export const browserUnexpectedFailureReporter: UnexpectedFailureReporter = createLazyBugsinkBrowserReporter({
	configuration: browserBugsinkConfiguration,
	readPathname(): string {
		const browserWindow = document.defaultView;

		if (browserWindow === null) {
			throw new Error("The browser window is unavailable.");
		}

		return browserWindow.location.pathname;
	},
	terminalFallback: writeBrowserFailureToTerminal
});

const browserFailureBootstrap = createBrowserFailureBootstrap({
	capabilities: createWindowBrowserFailureCapabilities(),
	reporter: browserUnexpectedFailureReporter
});

export function initializeBrowserFailureReporting(): boolean {
	return browserFailureBootstrap.install();
}

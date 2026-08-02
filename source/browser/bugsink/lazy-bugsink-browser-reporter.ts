import type { CaptureContext, Integration } from "@sentry/core";
import type { BrowserOptions } from "@sentry/browser";
import type { Maybe } from "true-myth/maybe";
import {
	bugsinkEnvironment,
	createBugsinkDataCollection,
	createBugsinkEventTags,
	type BugsinkConfiguration
} from "../../error-reporting/bugsink-configuration.ts";
import type { UnexpectedFailureContext, UnexpectedFailureReporter } from "../report-unexpected-browser-failure.ts";

export type BrowserBugsinkSdkModule = {
	readonly captureException: (error: unknown, captureContext?: CaptureContext) => unknown;
	readonly dedupeIntegration: () => Integration;
	readonly init: (options: BrowserOptions) => unknown;
	readonly linkedErrorsIntegration: () => Integration;
};

type BrowserBugsinkOptions = BrowserOptions;
type BrowserBugsinkEvent = Parameters<NonNullable<BrowserOptions["beforeSend"]>>[0];
type BrowserBugsinkCaptureContext = CaptureContext;

export type BrowserBugsinkModuleLoader = () => Promise<BrowserBugsinkSdkModule>;

export type LazyBugsinkBrowserReporterDependencies = {
	readonly configuration: Maybe<BugsinkConfiguration>;
	readonly loadSdk?: BrowserBugsinkModuleLoader;
	readonly readPathname: () => string;
	readonly terminalFallback: (error: unknown) => void;
};

async function loadBrowserBugsinkSdk(): Promise<BrowserBugsinkSdkModule> {
	return import("@sentry/browser");
}

function filterBugsinkEvent(bugsinkEvent: BrowserBugsinkEvent): BrowserBugsinkEvent {
	const filteredEvent = { ...bugsinkEvent };

	delete filteredEvent.breadcrumbs;
	delete filteredEvent.contexts;
	delete filteredEvent.request;
	delete filteredEvent.user;

	return filteredEvent;
}

function createBugsinkBrowserOptions(
	configuration: BugsinkConfiguration,
	runtime: UnexpectedFailureContext["runtime"],
	browserBugsinkSdk: BrowserBugsinkSdkModule
): BrowserBugsinkOptions {
	return {
		beforeSend: filterBugsinkEvent,
		dataCollection: createBugsinkDataCollection(),
		defaultIntegrations: false,
		dsn: configuration.dsn,
		environment: bugsinkEnvironment,
		initialScope: {
			tags: createBugsinkEventTags(runtime, configuration.release)
		},
		integrations: [
			// The native application listeners own global error and rejection capture.
			// These integrations only preserve explicit event grouping and linked errors.
			browserBugsinkSdk.dedupeIntegration(),
			browserBugsinkSdk.linkedErrorsIntegration()
		],
		release: configuration.release,
		sendDefaultPii: false
	};
}

function createBugsinkCaptureContext(
	context: UnexpectedFailureContext,
	pathname: string,
	release: string
): BrowserBugsinkCaptureContext {
	const tags: Record<string, string> = {
		...createBugsinkEventTags(context.runtime, release)
	};

	if (context.feature !== undefined) {
		tags.feature = context.feature;
	}

	if (context.operation !== undefined) {
		tags.operation = context.operation;
	}

	if (context.properties !== undefined) {
		for (const [propertyName, propertyValue] of Object.entries(context.properties)) {
			tags[propertyName] = String(propertyValue);
		}
	}

	return {
		extra: {
			pathname
		},
		tags
	};
}

export function createLazyBugsinkBrowserReporter(
	lazyBugsinkBrowserReporterDependencies: LazyBugsinkBrowserReporterDependencies
): UnexpectedFailureReporter {
	const {
		configuration,
		loadSdk = loadBrowserBugsinkSdk,
		readPathname,
		terminalFallback
	} = lazyBugsinkBrowserReporterDependencies;

	if (configuration.isNothing) {
		return {
			report(error): void {
				terminalFallback(error);
			}
		};
	}

	const configuredBugsinkConfiguration = configuration.value;
	const browserBugsinkClientTask = {
		task: undefined as Promise<BrowserBugsinkSdkModule> | undefined
	};

	async function initializeBrowserBugsinkClient(
		runtime: UnexpectedFailureContext["runtime"]
	): Promise<BrowserBugsinkSdkModule> {
		try {
			const browserBugsinkSdk = await loadSdk();

			browserBugsinkSdk.init(
				createBugsinkBrowserOptions(configuredBugsinkConfiguration, runtime, browserBugsinkSdk)
			);

			return browserBugsinkSdk;
		} catch (error) {
			browserBugsinkClientTask.task = undefined;
			throw error;
		}
	}

	async function loadBrowserBugsinkClient(
		runtime: UnexpectedFailureContext["runtime"]
	): Promise<BrowserBugsinkSdkModule> {
		if (browserBugsinkClientTask.task !== undefined) {
			return browserBugsinkClientTask.task;
		}

		browserBugsinkClientTask.task = initializeBrowserBugsinkClient(runtime);

		return browserBugsinkClientTask.task;
	}

	async function reportFailure(error: unknown, context: UnexpectedFailureContext): Promise<void> {
		try {
			const browserBugsinkSdk = await loadBrowserBugsinkClient(context.runtime);

			browserBugsinkSdk.captureException(
				error,
				createBugsinkCaptureContext(context, readPathname(), configuredBugsinkConfiguration.release)
			);
		} catch {
			terminalFallback(error);
		}
	}

	return {
		report(error, context): void {
			void reportFailure(error, context);
		}
	};
}

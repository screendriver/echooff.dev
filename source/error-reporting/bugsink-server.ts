import process from "node:process";
import {
	captureException,
	dedupeIntegration,
	init,
	linkedErrorsIntegration,
	onUncaughtExceptionIntegration,
	onUnhandledRejectionIntegration,
	type CaptureContext,
	type NodeOptions
} from "@sentry/node";
import {
	bugsinkEnvironment,
	readBuildBugsinkConfiguration,
	createBugsinkDataCollection,
	createBugsinkEventTags,
	type BugsinkConfiguration
} from "./bugsink-configuration.ts";

export type BugsinkServerSdk = {
	readonly captureException: (error: unknown, captureContext?: CaptureContext) => unknown;
	readonly init: (options: NodeOptions) => unknown;
};

const productionBugsinkServerSdk: BugsinkServerSdk = {
	captureException,
	init
};

export type InitializeBugsinkServerOptions = {
	readonly isProductionApplicationRuntime: boolean;
	readonly configuration: BugsinkConfiguration | undefined;
	readonly sdk: BugsinkServerSdk;
};

export type ReportUnexpectedServerFailureOptions = {
	readonly error: Error;
	readonly method: string;
	readonly pathname: string;
	readonly statusCode: number;
};

export function createBugsinkServerOptions(configuration: BugsinkConfiguration): NodeOptions {
	return {
		dataCollection: createBugsinkDataCollection(),
		defaultIntegrations: false,
		dsn: configuration.dsn,
		enabled: true,
		environment: bugsinkEnvironment,
		initialScope: {
			tags: createBugsinkEventTags("server", configuration.release)
		},
		integrations: [
			dedupeIntegration(),
			linkedErrorsIntegration(),
			onUncaughtExceptionIntegration(),
			onUnhandledRejectionIntegration()
		],
		registerEsmLoaderHooks: false,
		release: configuration.release
	};
}

export function initializeBugsinkServer(initializeBugsinkServerOptions: InitializeBugsinkServerOptions): boolean {
	const { configuration, isProductionApplicationRuntime, sdk } = initializeBugsinkServerOptions;

	if (configuration !== undefined && isProductionApplicationRuntime) {
		sdk.init(createBugsinkServerOptions(configuration));
		return true;
	}

	return false;
}

export function createUnexpectedServerFailureReporter(
	bugsinkServerSdk: Pick<BugsinkServerSdk, "captureException">
): (options: ReportUnexpectedServerFailureOptions) => void {
	return function reportUnexpectedServerFailure(options): void {
		const { error, method, pathname, statusCode } = options;

		bugsinkServerSdk.captureException(error, {
			tags: {
				"http.method": method,
				"http.pathname": pathname,
				"http.status_code": String(statusCode)
			}
		});
	};
}

const isProductionApplicationRuntime =
	process.env.NODE_ENV === "production" && process.env.ECHOOFF_APPLICATION_RUNTIME === "server";

const buildBugsinkConfigurationResult = readBuildBugsinkConfiguration();

if (isProductionApplicationRuntime && buildBugsinkConfigurationResult.isErr) {
	throw new TypeError("The production Bugsink server configuration is invalid.");
}

initializeBugsinkServer({
	configuration: buildBugsinkConfigurationResult.unwrapOr(undefined),
	isProductionApplicationRuntime,
	sdk: productionBugsinkServerSdk
});

export const reportUnexpectedServerFailure = createUnexpectedServerFailureReporter(productionBugsinkServerSdk);

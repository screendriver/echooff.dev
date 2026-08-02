import { err, ok, type Result } from "true-myth/result";

export const bugsinkHost = "https://bugsink.82r.de";
export const bugsinkApplication = "echooff.dev";
export const bugsinkEnvironment = "production";

export type BugsinkRuntime = "browser" | "deployment_check" | "server";

export type BugsinkEventTags = Readonly<Record<string, string>>;

export type BugsinkConfiguration = {
	readonly dsn: string;
	readonly release: string;
};

export type BugsinkBuildEnvironment = {
	readonly PROD?: boolean;
	readonly PUBLIC_BUGSINK_DSN?: unknown;
	readonly PUBLIC_BUGSINK_RELEASE?: unknown;
};

type ImportMetaWithOptionalEnvironment = {
	readonly env?: BugsinkBuildEnvironment;
};

function readAstroBuildEnvironment(): BugsinkBuildEnvironment {
	const importMetaWithOptionalEnvironment: ImportMetaWithOptionalEnvironment = import.meta;

	return importMetaWithOptionalEnvironment.env ?? {};
}

function parseBugsinkUrl(configuredDsn: string): Result<URL, Error> {
	try {
		return ok(new URL(configuredDsn));
	} catch {
		return err(new TypeError("PUBLIC_BUGSINK_DSN must be a valid URL."));
	}
}

function parseBugsinkDsn(configuredDsn: string): Result<string, Error> {
	const parsedUrlResult = parseBugsinkUrl(configuredDsn);

	if (parsedUrlResult.isErr) {
		return err(parsedUrlResult.error);
	}

	if (parsedUrlResult.value.origin !== bugsinkHost) {
		return err(new RangeError("PUBLIC_BUGSINK_DSN must use the configured Bugsink origin."));
	}

	return ok(configuredDsn);
}

function readBugsinkRelease(configuredRelease: unknown): Result<string, Error> {
	if (typeof configuredRelease !== "string" || configuredRelease.length === 0) {
		return err(new TypeError("PUBLIC_BUGSINK_RELEASE must be a non-empty string."));
	}

	return ok(configuredRelease);
}

export function readBugsinkConfiguration(
	bugsinkBuildEnvironment: BugsinkBuildEnvironment
): Result<BugsinkConfiguration | undefined, Error> {
	const configuredDsn = bugsinkBuildEnvironment.PUBLIC_BUGSINK_DSN;

	if (configuredDsn === undefined || configuredDsn === "") {
		return ok(undefined);
	}

	if (typeof configuredDsn !== "string") {
		return err(new TypeError("PUBLIC_BUGSINK_DSN must be a string."));
	}

	const parsedDsnResult = parseBugsinkDsn(configuredDsn);

	if (parsedDsnResult.isErr) {
		return err(parsedDsnResult.error);
	}

	const releaseResult = readBugsinkRelease(bugsinkBuildEnvironment.PUBLIC_BUGSINK_RELEASE);

	if (releaseResult.isErr) {
		return err(releaseResult.error);
	}

	return ok({
		dsn: parsedDsnResult.value,
		release: releaseResult.value
	});
}

export function readBuildBugsinkConfiguration(): Result<BugsinkConfiguration | undefined, Error> {
	return readBugsinkConfiguration(readAstroBuildEnvironment());
}

export function createBugsinkEventTags(runtime: BugsinkRuntime, release: string): BugsinkEventTags {
	return {
		application: bugsinkApplication,
		environment: bugsinkEnvironment,
		release,
		runtime
	};
}

export function createBugsinkDataCollection(): Readonly<Record<string, unknown>> {
	return {
		cookies: false,
		databaseQueryData: false,
		frameContextLines: 0,
		genAI: {
			inputs: false,
			outputs: false
		},
		graphQL: {
			document: false,
			variables: false
		},
		httpBodies: [],
		httpHeaders: {
			request: false,
			response: false
		},
		stackFrameVariables: false,
		urlQueryParams: false,
		userInfo: false
	};
}

export const bugsinkIsProductionBuild = readAstroBuildEnvironment().PROD ?? false;

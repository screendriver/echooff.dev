import { err, ok, type Result } from "true-myth/result";
import { just, nothing, type Maybe } from "true-myth/maybe";

export const bugsinkHost = "https://bugsink.82r.de";
export const bugsinkDsn = "https://9611ae13522c41d8a36a3edfc702ba8b@bugsink.82r.de/2";
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
		return err(new TypeError("The Bugsink project DSN must be a valid URL."));
	}
}

function parseBugsinkDsn(configuredDsn: string): Result<string, Error> {
	const parsedUrlResult = parseBugsinkUrl(configuredDsn);

	if (parsedUrlResult.isErr) {
		return err(parsedUrlResult.error);
	}

	if (parsedUrlResult.value.origin !== bugsinkHost) {
		return err(new RangeError("The Bugsink project DSN must use the configured origin."));
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
): Result<Maybe<BugsinkConfiguration>, Error> {
	if (bugsinkBuildEnvironment.PROD !== true) {
		return ok(nothing<BugsinkConfiguration>());
	}

	const parsedDsnResult = parseBugsinkDsn(bugsinkDsn);

	if (parsedDsnResult.isErr) {
		return err(parsedDsnResult.error);
	}

	const releaseResult = readBugsinkRelease(bugsinkBuildEnvironment.PUBLIC_BUGSINK_RELEASE);

	if (releaseResult.isErr) {
		return err(releaseResult.error);
	}

	return ok(
		just<BugsinkConfiguration>({
			dsn: parsedDsnResult.value,
			release: releaseResult.value
		})
	);
}

export function readBuildBugsinkConfiguration(): Result<Maybe<BugsinkConfiguration>, Error> {
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

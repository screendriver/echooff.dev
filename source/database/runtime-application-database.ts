import { isError } from "@sindresorhus/is";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { tryOrElse, type Task } from "true-myth/task";
import type { Unit } from "true-myth/unit";
import type { ApplicationDatabaseConnection, CreateApplicationDatabaseInput } from "./application-database.ts";

export const productionApplicationDatabasePath = "/data/echooff.sqlite";
export const applicationDatabaseBusyTimeoutMilliseconds = 5000;

export type RuntimeApplicationDatabaseModule = {
	readonly createApplicationDatabase: (
		createApplicationDatabaseInput: CreateApplicationDatabaseInput
	) => Task<ApplicationDatabaseConnection, Error>;
	readonly closeApplicationDatabase: (
		applicationDatabaseConnection: ApplicationDatabaseConnection
	) => Task<Unit, Error>;
};

export type RuntimeApplicationDatabaseDependencies = {
	readonly busyTimeoutMilliseconds: number;
	readonly databasePath: string;
	readonly loadApplicationDatabaseModule: () => Task<RuntimeApplicationDatabaseModule, Error>;
};

function normalizeDynamicImportError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

export function createRuntimeApplicationDatabaseTaskReader(
	runtimeApplicationDatabaseDependencies: RuntimeApplicationDatabaseDependencies
): () => Task<ApplicationDatabaseConnection, Error> {
	const { busyTimeoutMilliseconds, databasePath, loadApplicationDatabaseModule } =
		runtimeApplicationDatabaseDependencies;
	let createdApplicationDatabaseTask: Maybe<Task<ApplicationDatabaseConnection, Error>> = nothing();

	return () => {
		return createdApplicationDatabaseTask.match({
			Just(applicationDatabaseTask) {
				return applicationDatabaseTask;
			},
			Nothing() {
				const applicationDatabaseTask = loadApplicationDatabaseModule().andThen((applicationDatabaseModule) => {
					return applicationDatabaseModule.createApplicationDatabase({
						busyTimeoutMilliseconds,
						databasePath
					});
				});

				createdApplicationDatabaseTask = just(applicationDatabaseTask);

				return applicationDatabaseTask;
			}
		});
	};
}

function loadProductionApplicationDatabaseModule(): Task<RuntimeApplicationDatabaseModule, Error> {
	return tryOrElse(normalizeDynamicImportError, async () => {
		return import("./application-database.ts");
	});
}

export const readRuntimeApplicationDatabaseTask = createRuntimeApplicationDatabaseTaskReader({
	busyTimeoutMilliseconds: applicationDatabaseBusyTimeoutMilliseconds,
	databasePath: productionApplicationDatabasePath,
	loadApplicationDatabaseModule: loadProductionApplicationDatabaseModule
});

export function closeRuntimeApplicationDatabase(): Task<Unit, Error> {
	return readRuntimeApplicationDatabaseTask().andThen((applicationDatabaseConnection) => {
		return loadProductionApplicationDatabaseModule().andThen((applicationDatabaseModule) => {
			return applicationDatabaseModule.closeApplicationDatabase(applicationDatabaseConnection);
		});
	});
}

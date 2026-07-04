import { isError } from "@sindresorhus/is";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { resolve as resolveTask, tryOrElse as tryTaskOrElse, type Task } from "true-myth/task";
import type { MentionCacheRepository as SqliteMentionCacheRepository } from "./mention-cache-database.ts";
import type { MentionCacheEntry, MentionCacheRepository } from "./mention-cache.ts";

const mentionCacheDatabaseBusyTimeoutMilliseconds = 5000;
const productionMentionCacheDatabasePath = "/data/echooff-cache.sqlite";

function normalizeDynamicImportError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

export function createDisabledMentionCacheRepository(): MentionCacheRepository {
	return {
		readEntry() {
			return resolveTask(nothing<MentionCacheEntry>());
		},
		writeEntry() {
			return resolveTask(undefined);
		}
	};
}

function createRuntimeMentionCacheRepositoryTaskReader(): () => Task<SqliteMentionCacheRepository, Error> {
	let createdMentionCacheRepositoryTask: Maybe<Task<SqliteMentionCacheRepository, Error>> = nothing();

	return () => {
		return createdMentionCacheRepositoryTask.match({
			Just(mentionCacheRepositoryTask) {
				return mentionCacheRepositoryTask;
			},
			Nothing() {
				const mentionCacheRepositoryTask = tryTaskOrElse(normalizeDynamicImportError, async () => {
					return import("./mention-cache-database.ts");
				}).andThen((mentionCacheDatabaseModule) => {
					return mentionCacheDatabaseModule.createMentionCacheRepository({
						busyTimeoutMilliseconds: mentionCacheDatabaseBusyTimeoutMilliseconds,
						databasePath: productionMentionCacheDatabasePath
					});
				});

				createdMentionCacheRepositoryTask = just(mentionCacheRepositoryTask);

				return mentionCacheRepositoryTask;
			}
		});
	};
}

export const readRuntimeMentionCacheRepositoryTask = createRuntimeMentionCacheRepositoryTaskReader();

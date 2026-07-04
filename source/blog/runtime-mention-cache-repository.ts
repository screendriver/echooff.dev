import { just, nothing, type Maybe } from "true-myth/maybe";
import { resolve as resolveTask, type Task } from "true-myth/task";
import {
	createMentionCacheRepository,
	type MentionCacheRepository as SqliteMentionCacheRepository
} from "./mention-cache-database.ts";
import type { MentionCacheEntry, MentionCacheRepository } from "./mention-cache.ts";

const mentionCacheDatabaseBusyTimeoutMilliseconds = 5000;
const productionMentionCacheDatabasePath = "/data/echooff-cache.sqlite";

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
				const mentionCacheRepositoryTask = createMentionCacheRepository({
					busyTimeoutMilliseconds: mentionCacheDatabaseBusyTimeoutMilliseconds,
					databasePath: productionMentionCacheDatabasePath
				});

				createdMentionCacheRepositoryTask = just(mentionCacheRepositoryTask);

				return mentionCacheRepositoryTask;
			}
		});
	};
}

export const readRuntimeMentionCacheRepositoryTask = createRuntimeMentionCacheRepositoryTaskReader();

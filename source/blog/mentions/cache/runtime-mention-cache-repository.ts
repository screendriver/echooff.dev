import { just, nothing, type Maybe } from "true-myth/maybe";
import { resolve as resolveTask, type Task } from "true-myth/task";
import { Unit } from "true-myth/unit";
import { readRuntimeApplicationDatabaseTask } from "../../../database/runtime-application-database.ts";
import { createMentionCacheRepository } from "./mention-cache-database.ts";
import type { MentionCacheEntry, MentionCacheRepository } from "./mention-cache.ts";

export function createDisabledMentionCacheRepository(): MentionCacheRepository {
	return {
		deleteEntriesFetchedBefore() {
			return resolveTask(Unit);
		},
		readEntry() {
			return resolveTask(nothing<MentionCacheEntry>());
		},
		writeEntry() {
			return resolveTask(Unit);
		}
	};
}

function createRuntimeMentionCacheRepositoryTaskReader(): () => Task<MentionCacheRepository, Error> {
	let createdMentionCacheRepositoryTask: Maybe<Task<MentionCacheRepository, Error>> = nothing();

	return () => {
		return createdMentionCacheRepositoryTask.match({
			Just(mentionCacheRepositoryTask) {
				return mentionCacheRepositoryTask;
			},
			Nothing() {
				const mentionCacheRepositoryTask = readRuntimeApplicationDatabaseTask().map((applicationDatabase) => {
					const { database } = applicationDatabase;

					return createMentionCacheRepository(database);
				});

				createdMentionCacheRepositoryTask = just(mentionCacheRepositoryTask);

				return mentionCacheRepositoryTask;
			}
		});
	};
}

export const readRuntimeMentionCacheRepositoryTask = createRuntimeMentionCacheRepositoryTaskReader();

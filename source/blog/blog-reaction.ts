import type { Maybe } from "true-myth/maybe";
import type { Task } from "true-myth/task";

export type BlogReactionSnapshot = {
	readonly count: number;
	readonly reacted: boolean;
};

export type BlogReactionRepository = {
	readonly addReactionAndReadSnapshot: (postSlug: string, reactorHash: string) => Task<BlogReactionSnapshot, Error>;
	readonly readSnapshot: (postSlug: string, reactorHash: Maybe<string>) => Task<BlogReactionSnapshot, Error>;
	readonly removeReactionAndReadSnapshot: (
		postSlug: string,
		reactorHash: string
	) => Task<BlogReactionSnapshot, Error>;
};

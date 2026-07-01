import { isUndefined } from "@sindresorhus/is";

type RuntimeMentionCacheEntry<Value> = {
	readonly refreshedAtMilliseconds: number;
	readonly value: Value;
};

export type RuntimeMentionCache<Value> = Map<string, RuntimeMentionCacheEntry<Value>>;

type FreshRuntimeMentionCacheReadResult<Value> = {
	readonly kind: "fresh";
	readonly value: Value;
};

type MissRuntimeMentionCacheReadResult = {
	readonly kind: "miss";
};

type StaleRuntimeMentionCacheReadResult<Value> = {
	readonly kind: "stale";
	readonly value: Value;
};

type RuntimeMentionCacheReadResultByKind<Value> = {
	readonly fresh: FreshRuntimeMentionCacheReadResult<Value>;
	readonly miss: MissRuntimeMentionCacheReadResult;
	readonly stale: StaleRuntimeMentionCacheReadResult<Value>;
};

export type RuntimeMentionCacheReadResult<Value> =
	RuntimeMentionCacheReadResultByKind<Value>[keyof RuntimeMentionCacheReadResultByKind<Value>];

type ReadRuntimeMentionCacheInput<Value> = {
	readonly cache: RuntimeMentionCache<Value>;
	readonly cacheKey: string;
	readonly nowMilliseconds: number;
	readonly ttlMilliseconds: number;
};

type WriteRuntimeMentionCacheInput<Value> = {
	readonly cache: RuntimeMentionCache<Value>;
	readonly cacheKey: string;
	readonly nowMilliseconds: number;
	readonly value: Value;
};

export function createRuntimeMentionCache<Value>(): RuntimeMentionCache<Value> {
	return new Map<string, RuntimeMentionCacheEntry<Value>>();
}

export function readRuntimeMentionCache<Value>(
	readRuntimeMentionCacheInput: ReadRuntimeMentionCacheInput<Value>
): RuntimeMentionCacheReadResult<Value> {
	const { cache, cacheKey, nowMilliseconds, ttlMilliseconds } = readRuntimeMentionCacheInput;
	const cachedEntry = cache.get(cacheKey);

	if (isUndefined(cachedEntry)) {
		return {
			kind: "miss"
		};
	}

	if (nowMilliseconds - cachedEntry.refreshedAtMilliseconds <= ttlMilliseconds) {
		return {
			kind: "fresh",
			value: cachedEntry.value
		};
	}

	return {
		kind: "stale",
		value: cachedEntry.value
	};
}

export function writeRuntimeMentionCache<Value>(
	writeRuntimeMentionCacheInput: WriteRuntimeMentionCacheInput<Value>
): void {
	const { cache, cacheKey, nowMilliseconds, value } = writeRuntimeMentionCacheInput;

	cache.set(cacheKey, {
		refreshedAtMilliseconds: nowMilliseconds,
		value
	});
}

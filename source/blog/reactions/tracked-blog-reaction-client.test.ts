import assert from "node:assert";
import { suite, test } from "mocha";
import type { BlogReactionAnalytics } from "./blog-reaction-analytics.ts";
import type { BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";
import { createTrackedBlogReactionClient } from "./tracked-blog-reaction-client.ts";

type CreateFakeBlogReactionClientOptions = {
	readonly addReaction?: BlogReactionClient["addReaction"];
	readonly loadReaction?: BlogReactionClient["loadReaction"];
	readonly removeReaction?: BlogReactionClient["removeReaction"];
};

type FakeBlogReactionClient = {
	readonly addedPostSlugs: readonly string[];
	readonly client: BlogReactionClient;
	readonly loadedPostSlugs: readonly string[];
	readonly removedPostSlugs: readonly string[];
};

type RecordingBlogReactionAnalytics = {
	readonly addedPostSlugs: readonly string[];
	readonly analytics: BlogReactionAnalytics;
	readonly removedPostSlugs: readonly string[];
};

const defaultReactionResponse: BlogReactionResponse = {
	count: 1,
	reacted: true
};

function createFakeBlogReactionClient(
	createFakeBlogReactionClientOptions: CreateFakeBlogReactionClientOptions = {}
): FakeBlogReactionClient {
	const {
		addReaction: executeAddReaction = async function createDefaultAddedReaction(): Promise<BlogReactionResponse> {
			return defaultReactionResponse;
		},
		loadReaction:
			executeLoadReaction = async function createDefaultLoadedReaction(): Promise<BlogReactionResponse> {
				return { count: 0, reacted: false };
			},
		removeReaction:
			executeRemoveReaction = async function createDefaultRemovedReaction(): Promise<BlogReactionResponse> {
				return { count: 0, reacted: false };
			}
	} = createFakeBlogReactionClientOptions;
	const addedPostSlugs: string[] = [];
	const loadedPostSlugs: string[] = [];
	const removedPostSlugs: string[] = [];

	return {
		addedPostSlugs,
		client: {
			async addReaction(postSlug: string): Promise<BlogReactionResponse> {
				addedPostSlugs.push(postSlug);
				return executeAddReaction(postSlug);
			},
			async loadReaction(postSlug: string): Promise<BlogReactionResponse> {
				loadedPostSlugs.push(postSlug);
				return executeLoadReaction(postSlug);
			},
			async removeReaction(postSlug: string): Promise<BlogReactionResponse> {
				removedPostSlugs.push(postSlug);
				return executeRemoveReaction(postSlug);
			}
		},
		loadedPostSlugs,
		removedPostSlugs
	};
}

function createRecordingBlogReactionAnalytics(): RecordingBlogReactionAnalytics {
	const addedPostSlugs: string[] = [];
	const removedPostSlugs: string[] = [];

	return {
		addedPostSlugs,
		analytics: {
			trackReactionAdded(postSlug: string): void {
				addedPostSlugs.push(postSlug);
			},
			trackReactionRemoved(postSlug: string): void {
				removedPostSlugs.push(postSlug);
			}
		},
		removedPostSlugs
	};
}

async function captureRejectedFailure(reactionOperation: Promise<BlogReactionResponse>): Promise<unknown> {
	try {
		await reactionOperation;
	} catch (error) {
		return error;
	}

	return undefined;
}

suite("Tracked blog reaction client", function () {
	test("delegates loading exactly once without tracking", async function () {
		const loadedReactionResponse: BlogReactionResponse = {
			count: 4,
			reacted: false
		};
		const fakeBlogReactionClient = createFakeBlogReactionClient({
			async loadReaction(): Promise<BlogReactionResponse> {
				return loadedReactionResponse;
			}
		});
		const recordingBlogReactionAnalytics = createRecordingBlogReactionAnalytics();
		const trackedBlogReactionClient = createTrackedBlogReactionClient({
			analytics: recordingBlogReactionAnalytics.analytics,
			client: fakeBlogReactionClient.client
		});

		const actualReactionResponse = await trackedBlogReactionClient.loadReaction("first-post");

		assert.strictEqual(actualReactionResponse, loadedReactionResponse);
		assert.deepStrictEqual(fakeBlogReactionClient.loadedPostSlugs, ["first-post"]);
		assert.partialDeepStrictEqual(recordingBlogReactionAnalytics, {
			addedPostSlugs: [],
			removedPostSlugs: []
		});
	});

	test("tracks an addition only after the underlying operation resolves", async function () {
		const deferredAddReaction = Promise.withResolvers<BlogReactionResponse>();
		const addedReactionResponse: BlogReactionResponse = {
			count: 1,
			reacted: true
		};
		const fakeBlogReactionClient = createFakeBlogReactionClient({
			async addReaction(): Promise<BlogReactionResponse> {
				return deferredAddReaction.promise;
			}
		});
		const recordingBlogReactionAnalytics = createRecordingBlogReactionAnalytics();
		const trackedBlogReactionClient = createTrackedBlogReactionClient({
			analytics: recordingBlogReactionAnalytics.analytics,
			client: fakeBlogReactionClient.client
		});

		const reactionOperation = trackedBlogReactionClient.addReaction("first-post");

		assert.deepStrictEqual(recordingBlogReactionAnalytics.addedPostSlugs, []);
		deferredAddReaction.resolve(addedReactionResponse);

		const actualReactionResponse = await reactionOperation;

		assert.strictEqual(actualReactionResponse, addedReactionResponse);
		assert.deepStrictEqual(fakeBlogReactionClient.addedPostSlugs, ["first-post"]);
		assert.deepStrictEqual(recordingBlogReactionAnalytics.addedPostSlugs, ["first-post"]);
	});

	test("tracks a removal only after the underlying operation resolves", async function () {
		const deferredRemoveReaction = Promise.withResolvers<BlogReactionResponse>();
		const removedReactionResponse: BlogReactionResponse = {
			count: 0,
			reacted: false
		};
		const fakeBlogReactionClient = createFakeBlogReactionClient({
			async removeReaction(): Promise<BlogReactionResponse> {
				return deferredRemoveReaction.promise;
			}
		});
		const recordingBlogReactionAnalytics = createRecordingBlogReactionAnalytics();
		const trackedBlogReactionClient = createTrackedBlogReactionClient({
			analytics: recordingBlogReactionAnalytics.analytics,
			client: fakeBlogReactionClient.client
		});

		const reactionOperation = trackedBlogReactionClient.removeReaction("first-post");

		assert.deepStrictEqual(recordingBlogReactionAnalytics.removedPostSlugs, []);
		deferredRemoveReaction.resolve(removedReactionResponse);

		const actualReactionResponse = await reactionOperation;

		assert.strictEqual(actualReactionResponse, removedReactionResponse);
		assert.deepStrictEqual(fakeBlogReactionClient.removedPostSlugs, ["first-post"]);
		assert.deepStrictEqual(recordingBlogReactionAnalytics.removedPostSlugs, ["first-post"]);
	});

	test("rethrows a failed addition without tracking or retrying", async function () {
		const additionFailure = new Error("addition failed");
		let addReactionCallCount = 0;
		const fakeBlogReactionClient = createFakeBlogReactionClient({
			async addReaction(): Promise<BlogReactionResponse> {
				addReactionCallCount += 1;
				throw additionFailure;
			}
		});
		const recordingBlogReactionAnalytics = createRecordingBlogReactionAnalytics();
		const trackedBlogReactionClient = createTrackedBlogReactionClient({
			analytics: recordingBlogReactionAnalytics.analytics,
			client: fakeBlogReactionClient.client
		});

		const actualFailure = await captureRejectedFailure(trackedBlogReactionClient.addReaction("first-post"));

		assert.strictEqual(actualFailure, additionFailure);
		assert.strictEqual(addReactionCallCount, 1);
		assert.deepStrictEqual(recordingBlogReactionAnalytics.addedPostSlugs, []);
	});

	test("rethrows a failed removal without tracking or retrying", async function () {
		const removalFailure = new Error("removal failed");
		let removeReactionCallCount = 0;
		const fakeBlogReactionClient = createFakeBlogReactionClient({
			async removeReaction(): Promise<BlogReactionResponse> {
				removeReactionCallCount += 1;
				throw removalFailure;
			}
		});
		const recordingBlogReactionAnalytics = createRecordingBlogReactionAnalytics();
		const trackedBlogReactionClient = createTrackedBlogReactionClient({
			analytics: recordingBlogReactionAnalytics.analytics,
			client: fakeBlogReactionClient.client
		});

		const actualFailure = await captureRejectedFailure(trackedBlogReactionClient.removeReaction("first-post"));

		assert.strictEqual(actualFailure, removalFailure);
		assert.strictEqual(removeReactionCallCount, 1);
		assert.deepStrictEqual(recordingBlogReactionAnalytics.removedPostSlugs, []);
	});

	test("returns a successful result when analytics delivery fails", async function () {
		const analyticsFailure = new Error("analytics delivery failed");
		let addReactionCallCount = 0;
		const successfulReactionResponse: BlogReactionResponse = {
			count: 1,
			reacted: true
		};
		const fakeBlogReactionClient = createFakeBlogReactionClient({
			async addReaction(): Promise<BlogReactionResponse> {
				addReactionCallCount += 1;
				return successfulReactionResponse;
			}
		});
		const trackedBlogReactionClient = createTrackedBlogReactionClient({
			analytics: {
				trackReactionAdded(): void {
					throw analyticsFailure;
				},
				trackReactionRemoved(): void {
					return undefined;
				}
			},
			client: fakeBlogReactionClient.client
		});

		const actualReactionResponse = await trackedBlogReactionClient.addReaction("first-post");

		assert.strictEqual(actualReactionResponse, successfulReactionResponse);
		assert.strictEqual(addReactionCallCount, 1);
	});
});

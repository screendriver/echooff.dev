import assert from "node:assert";
import { suite, test } from "mocha";
import { blogReactionAddedEventName, blogReactionRemovedEventName } from "./blog-reaction-analytics.ts";
import { createRybbitBlogReactionAnalytics, type RybbitBrowserApi } from "./rybbit-blog-reaction-analytics.ts";

type RecordedRybbitEvent = {
	readonly eventName: string;
	readonly properties: Readonly<Record<string, string>>;
};

type RecordingRybbitBrowserApi = {
	readonly api: RybbitBrowserApi;
	readonly recordedEvents: readonly RecordedRybbitEvent[];
};

function createRecordingRybbitBrowserApi(): RecordingRybbitBrowserApi {
	const recordedEvents: RecordedRybbitEvent[] = [];

	return {
		api: {
			trackEvent(eventName, properties): void {
				recordedEvents.push({ eventName, properties });
			}
		},
		recordedEvents
	};
}

suite("Rybbit blog reaction analytics", function () {
	test("tracks a successful reaction addition with only the post slug", function () {
		const recordingRybbitBrowserApi = createRecordingRybbitBrowserApi();
		const analytics = createRybbitBlogReactionAnalytics({
			readRybbitBrowserApi(): RybbitBrowserApi {
				return recordingRybbitBrowserApi.api;
			}
		});

		analytics.trackReactionAdded("translations-belong-to-the-user-interface");

		assert.deepStrictEqual(recordingRybbitBrowserApi.recordedEvents, [
			{
				eventName: blogReactionAddedEventName,
				properties: {
					post_slug: "translations-belong-to-the-user-interface"
				}
			}
		]);
	});

	test("tracks a successful reaction removal with only the post slug", function () {
		const recordingRybbitBrowserApi = createRecordingRybbitBrowserApi();
		const analytics = createRybbitBlogReactionAnalytics({
			readRybbitBrowserApi(): RybbitBrowserApi {
				return recordingRybbitBrowserApi.api;
			}
		});

		analytics.trackReactionRemoved("translations-belong-to-the-user-interface");

		assert.deepStrictEqual(recordingRybbitBrowserApi.recordedEvents, [
			{
				eventName: blogReactionRemovedEventName,
				properties: {
					post_slug: "translations-belong-to-the-user-interface"
				}
			}
		]);
	});

	test("does not send an event when Rybbit is unavailable", function () {
		let browserApiReadCount = 0;
		const analytics = createRybbitBlogReactionAnalytics({
			readRybbitBrowserApi(): undefined {
				browserApiReadCount += 1;
				return undefined;
			}
		});

		analytics.trackReactionAdded("first-post");
		analytics.trackReactionRemoved("first-post");
		assert.strictEqual(browserApiReadCount, 2);
	});

	test("does not allow an Rybbit delivery failure to escape", function () {
		const deliveryFailure = new Error("Rybbit delivery failed");
		const analytics = createRybbitBlogReactionAnalytics({
			readRybbitBrowserApi(): RybbitBrowserApi {
				return {
					trackEvent(): void {
						throw deliveryFailure;
					}
				};
			}
		});

		analytics.trackReactionAdded("first-post");
		analytics.trackReactionRemoved("first-post");
	});
});

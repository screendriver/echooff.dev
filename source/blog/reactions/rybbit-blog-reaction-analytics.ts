import { isUndefined } from "@sindresorhus/is";
import {
	blogReactionAddedEventName,
	blogReactionRemovedEventName,
	type BlogReactionAnalytics
} from "./blog-reaction-analytics.ts";

export type RybbitBrowserApi = {
	readonly trackEvent: (eventName: string, properties: Readonly<Record<string, string>>) => void;
};

export type ReadRybbitBrowserApi = () => RybbitBrowserApi | undefined;

export type CreateRybbitBlogReactionAnalyticsOptions = {
	readonly readRybbitBrowserApi: ReadRybbitBrowserApi;
};

function readAvailableRybbitBrowserApi(readRybbitBrowserApi: ReadRybbitBrowserApi): RybbitBrowserApi | undefined {
	try {
		return readRybbitBrowserApi();
	} catch {
		return undefined;
	}
}

function trackBlogReactionEvent(readRybbitBrowserApi: ReadRybbitBrowserApi, eventName: string, postSlug: string): void {
	const rybbitBrowserApi = readAvailableRybbitBrowserApi(readRybbitBrowserApi);

	if (isUndefined(rybbitBrowserApi)) {
		return;
	}

	try {
		rybbitBrowserApi.trackEvent(eventName, { post_slug: postSlug });
	} catch {}
}

export function createRybbitBlogReactionAnalytics(
	createRybbitBlogReactionAnalyticsOptions: CreateRybbitBlogReactionAnalyticsOptions
): BlogReactionAnalytics {
	const { readRybbitBrowserApi } = createRybbitBlogReactionAnalyticsOptions;

	return {
		trackReactionAdded(postSlug) {
			trackBlogReactionEvent(readRybbitBrowserApi, blogReactionAddedEventName, postSlug);
		},
		trackReactionRemoved(postSlug) {
			trackBlogReactionEvent(readRybbitBrowserApi, blogReactionRemovedEventName, postSlug);
		}
	};
}

import is from "@sindresorhus/is";

function createAbsoluteUrl(configuredSiteUrl: URL, pathname: string): string {
	return new URL(pathname, configuredSiteUrl).toString();
}

export function getConfiguredSiteUrlOrThrow(configuredSiteUrl: URL | undefined): URL {
	if (is.undefined(configuredSiteUrl)) {
		throw new TypeError("Astro.site must be configured to create absolute blog URLs");
	}

	return configuredSiteUrl;
}

export function createSiteHomeAbsoluteUrl(configuredSiteUrl: URL | undefined): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), "/");
}

export function createBlogIndexAbsoluteUrl(configuredSiteUrl: URL | undefined): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), "/blog");
}

export function createBlogTopicIndexAbsoluteUrl(configuredSiteUrl: URL | undefined): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), "/blog/topics");
}

export function createBlogTopicPath(topicSlug: string): string {
	return `/blog/topics/${topicSlug}`;
}

export function createBlogTopicAbsoluteUrl(configuredSiteUrl: URL | undefined, topicSlug: string): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), createBlogTopicPath(topicSlug));
}

export function createBlogPostAbsoluteUrl(configuredSiteUrl: URL | undefined, blogPostSlug: string): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), `/blog/${blogPostSlug}`);
}

export function createBlogRssFeedAbsoluteUrl(configuredSiteUrl: URL | undefined): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), "/rss.xml");
}

export function createAbsoluteAssetUrl(configuredSiteUrl: URL | undefined, assetPathname: string): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), assetPathname);
}

export function createWebmentionEndpointUrl(configuredSiteUrl: URL | undefined): string {
	const verifiedSiteUrl = getConfiguredSiteUrlOrThrow(configuredSiteUrl);

	return `https://webmention.io/${verifiedSiteUrl.host}/webmention`;
}

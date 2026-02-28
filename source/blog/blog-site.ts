function createAbsoluteUrl(configuredSiteUrl: URL, pathname: string): string {
	return new URL(pathname, configuredSiteUrl).toString();
}

export function getConfiguredSiteUrlOrThrow(configuredSiteUrl: URL | undefined): URL {
	if (configuredSiteUrl === undefined) {
		throw new TypeError("Astro.site must be configured to create absolute blog URLs");
	}

	return configuredSiteUrl;
}

export function createBlogIndexAbsoluteUrl(configuredSiteUrl: URL | undefined): string {
	return createAbsoluteUrl(getConfiguredSiteUrlOrThrow(configuredSiteUrl), "/blog");
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

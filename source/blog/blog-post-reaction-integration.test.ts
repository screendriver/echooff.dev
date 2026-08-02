import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));
const blogPostRoutePath = join(repositoryRootDirectoryPath, "source/pages/blog/[slug].astro");
const blogPostReactionComponentPath = join(repositoryRootDirectoryPath, "source/blog/BlogPostReaction.astro");
const blogPostReactionBrowserModulePath = join(
	repositoryRootDirectoryPath,
	"source/blog/blog-post-reaction-browser.ts"
);

suite("BlogPostReaction integration", function () {
	test("is included before deferred mentions through the shared blog post route", async function () {
		const blogPostRoute = await readFile(blogPostRoutePath, "utf8");
		const reactionComponentUsage = "<BlogPostReaction postSlug={blogPost.id} />";
		const mentionsComponentUsage = "<BlogPostMentions blogPostId={blogPost.id} server:defer>";

		assert.match(blogPostRoute, /import BlogPostReaction from ["']\.\.\/\.\.\/blog\/BlogPostReaction\.astro["']/u);
		assert.match(blogPostRoute, new RegExp(reactionComponentUsage.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
		assert.strictEqual(
			blogPostRoute.indexOf(reactionComponentUsage) < blogPostRoute.indexOf(mentionsComponentUsage),
			true
		);
	});

	test("contains the quiet accessible control outside Pagefind article content", async function () {
		const blogPostReactionComponent = await readFile(blogPostReactionComponentPath, "utf8");
		const blogPostReactionBrowserModule = await readFile(blogPostReactionBrowserModulePath, "utf8");

		assert.match(blogPostReactionComponent, />Did this make you think\?</u);
		assert.match(blogPostReactionComponent, /<button[\s\S]*aria-pressed="false"[\s\S]*>\s*👍 Yes\s*<\/button>/u);
		assert.match(blogPostReactionComponent, /data-post-slug=\{postSlug\}/u);
		assert.match(blogPostReactionComponent, /data-blog-post-reaction-count>No reactions yet/u);
		assert.match(blogPostReactionComponent, /aria-live="polite"/u);
		assert.match(
			blogPostReactionComponent,
			/Your reaction is remembered in this browser so it can be counted once and removed later\./u
		);
		assert.match(blogPostReactionComponent, /data-pagefind-ignore="all"/u);
		assert.match(blogPostReactionComponent, /document\.querySelectorAll\("\[data-blog-post-reaction\]"\)/u);
		assert.match(blogPostReactionBrowserModule, /reactionRootElement\.querySelector\(/u);
		assert.doesNotMatch(blogPostReactionComponent, /document\.querySelector\("\[data-blog-post-reaction-/u);
		assert.doesNotMatch(blogPostReactionComponent, /client:(?:load|idle|visible|only)/u);
	});
});

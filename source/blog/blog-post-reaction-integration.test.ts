import assert from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));
const astroConfigurationPath = join(repositoryRootDirectoryPath, "astro.config.js");
const blogPostRoutePath = join(repositoryRootDirectoryPath, "source/pages/blog/[slug].astro");
const blogShellPath = join(repositoryRootDirectoryPath, "source/blog/BlogShell.astro");
const blogPostReactionComponentPath = join(repositoryRootDirectoryPath, "source/blog/BlogPostReaction.tsx");
const blogReadingProgressComponentPath = join(
	repositoryRootDirectoryPath,
	"source/blog/BlogReadingProgressIndicator.tsx"
);

suite("Preact blog island integration", function () {
	test("registers Preact without React compatibility", async function () {
		const astroConfiguration = await readFile(astroConfigurationPath, "utf8");

		assert.match(astroConfiguration, /import preact from ["']@astrojs\/preact["']/u);
		assert.match(astroConfiguration, /preact\(\)/u);
		assert.doesNotMatch(astroConfiguration, /@astrojs\/react|preact\/compat|compat:\s*true/u);
	});

	test("hydrates reading progress on load and reactions near the viewport", async function () {
		const blogShell = await readFile(blogShellPath, "utf8");
		const blogPostRoute = await readFile(blogPostRoutePath, "utf8");

		assert.match(blogShell, /<BlogReadingProgressIndicator client:load \/>/u);
		assert.match(
			blogPostRoute,
			/<BlogPostReaction client:visible=\{\{ rootMargin: "300px" \}\} postSlug=\{blogPost\.id\} \/>/u
		);
		assert.doesNotMatch(blogShell, /BlogReadingProgressIndicator[^>]*client:only/u);
		assert.doesNotMatch(blogPostRoute, /BlogPostReaction[^>]*client:only/u);
	});

	test("passes every shared blog post slug to the reaction island before mentions", async function () {
		const blogPostRoute = await readFile(blogPostRoutePath, "utf8");
		const reactionComponentUsage =
			'<BlogPostReaction client:visible={{ rootMargin: "300px" }} postSlug={blogPost.id} />';
		const mentionsComponentUsage = "<BlogPostMentions blogPostId={blogPost.id} server:defer>";

		assert.match(
			blogPostRoute,
			/import \{ BlogPostReaction \} from ["']\.\.\/\.\.\/blog\/BlogPostReaction\.tsx["']/u
		);
		assert.match(blogPostRoute, /export async function getStaticPaths\(\)/u);
		assert.match(blogPostRoute, /slug: blogPost\.id/u);
		assert.match(blogPostRoute, new RegExp(reactionComponentUsage.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
		assert.strictEqual(
			blogPostRoute.indexOf(reactionComponentUsage) < blogPostRoute.indexOf(mentionsComponentUsage),
			true
		);
	});

	test("keeps the reaction SSR markup useful and outside Pagefind article content", async function () {
		const blogPostReactionComponent = await readFile(blogPostReactionComponentPath, "utf8");

		assert.match(blogPostReactionComponent, /<section[\s\S]*aria-labelledby="blog-post-reaction-question"/u);
		assert.match(blogPostReactionComponent, /Did this make you think\?/u);
		assert.match(blogPostReactionComponent, /<span aria-hidden="true">👍<\/span>/u);
		assert.match(blogPostReactionComponent, /aria-pressed=\{buttonPressed\}/u);
		assert.match(blogPostReactionComponent, /disabled=\{buttonDisabled\}/u);
		assert.match(blogPostReactionComponent, /aria-live="polite"/u);
		assert.match(blogPostReactionComponent, /role="status"/u);
		assert.match(blogPostReactionComponent, /Your reaction is remembered in this browser/u);
		assert.match(blogPostReactionComponent, /data-pagefind-ignore="all"/u);
	});

	test("contains no obsolete imperative island implementation", function () {
		assert.strictEqual(
			existsSync(join(repositoryRootDirectoryPath, "source/blog/BlogReadingProgressIndicator.astro")),
			false
		);
		assert.strictEqual(existsSync(join(repositoryRootDirectoryPath, "source/blog/BlogPostReaction.astro")), false);
		assert.strictEqual(
			existsSync(join(repositoryRootDirectoryPath, "source/blog/blog-post-reaction-browser.ts")),
			false
		);
		assert.strictEqual(
			existsSync(join(repositoryRootDirectoryPath, "source/blog/blog-reaction-visibility.ts")),
			false
		);
		assert.strictEqual(
			existsSync(join(repositoryRootDirectoryPath, "source/blog/blog-reaction-interaction.ts")),
			false
		);
	});

	test("does not make reading progress depend on reaction code", async function () {
		const readingProgressComponent = await readFile(blogReadingProgressComponentPath, "utf8");

		assert.doesNotMatch(readingProgressComponent, /ky|ArkType|blog-reaction|BlogPostReaction/u);
	});
});

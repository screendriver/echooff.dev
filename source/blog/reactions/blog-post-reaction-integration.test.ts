import assert from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../../", import.meta.url));
const astroConfigurationPath = join(repositoryRootDirectoryPath, "astro.config.js");
const blogPostRoutePath = join(repositoryRootDirectoryPath, "source/pages/blog/[slug].astro");
const blogShellPath = join(repositoryRootDirectoryPath, "source/blog/BlogShell.astro");
const fireAndForgetInvokerPath = join(repositoryRootDirectoryPath, "source/browser/fire-and-forget-invoker.ts");
const unexpectedBrowserFailureReporterPath = join(
	repositoryRootDirectoryPath,
	"source/browser/report-unexpected-browser-failure.ts"
);
const blogPostReactionComponentPath = join(repositoryRootDirectoryPath, "source/blog/reactions/BlogPostReaction.tsx");
const blogPostReactionIslandPath = join(
	repositoryRootDirectoryPath,
	"source/blog/reactions/BlogPostReactionIsland.tsx"
);
const readingProgressComponentPath = join(
	repositoryRootDirectoryPath,
	"source/blog/reading-progress/BlogReadingProgressIndicator.tsx"
);

suite("Preact blog island integration", function () {
	test("registers Preact without React compatibility", async function () {
		const astroConfiguration = await readFile(astroConfigurationPath, "utf8");

		assert.match(astroConfiguration, /import preact from ["']@astrojs\/preact["']/u);
		assert.match(astroConfiguration, /preact\(\)/u);
		assert.doesNotMatch(astroConfiguration, /@astrojs\/react|preact\/compat|compat:\s*true/u);
	});

	test("hydrates reading progress on load and reactions after initial page work", async function () {
		const blogShell = await readFile(blogShellPath, "utf8");
		const blogPostRoute = await readFile(blogPostRoutePath, "utf8");

		assert.match(blogShell, /<BlogReadingProgressIndicator client:load \/>/u);
		assert.match(
			blogPostRoute,
			/<BlogPostReactionIsland client:idle=\{\{ timeout: 1000 \}\} postSlug=\{blogPost\.id\} \/>/u
		);
		assert.doesNotMatch(blogShell, /BlogReadingProgressIndicator[^>]*client:only/u);
		assert.doesNotMatch(blogPostRoute, /<BlogPostReaction client:/u);
	});

	test("keeps reactions and mentions as separate siblings in the article footer", async function () {
		const blogPostRoute = await readFile(blogPostRoutePath, "utf8");
		const reactionComponentUsage =
			"<BlogPostReactionIsland client:idle={{ timeout: 1000 }} postSlug={blogPost.id} />";
		const mentionsComponentUsage = "<BlogPostMentions blogPostId={blogPost.id} server:defer>";

		assert.match(blogPostRoute, /import \{ BlogPostReactionIsland \} from/u);
		assert.doesNotMatch(blogPostRoute, /import \{ BlogPostReaction \}/u);
		assert.match(blogPostRoute, /<footer class="blog-post-article-footer" data-pagefind-ignore="all">/u);
		assert.match(blogPostRoute, /<BlogPostContent>[\s\S]*<Content \/>[\s\S]*<\/BlogPostContent>/u);
		assert.match(blogPostRoute, /<BlogPostMentions blogPostId=\{blogPost\.id\} server:defer>/u);
		assert.doesNotMatch(blogPostRoute, /class="blog-post-article-body"/u);
		assert.strictEqual(
			blogPostRoute.indexOf(reactionComponentUsage) < blogPostRoute.indexOf(mentionsComponentUsage),
			true
		);
	});

	test("keeps the reaction markup semantic and excludes the removed disclosure", async function () {
		const blogPostReactionComponent = await readFile(blogPostReactionComponentPath, "utf8");

		assert.match(blogPostReactionComponent, /<section[\s\S]*aria-labelledby="blog-post-reaction-question"/u);
		assert.match(
			blogPostReactionComponent,
			/<h2 id="blog-post-reaction-question">Did this make you think\?<\/h2>/u
		);
		assert.match(blogPostReactionComponent, /<button[\s\S]*type="button"/u);
		assert.match(blogPostReactionComponent, /aria-pressed=\{buttonPressed\}/u);
		assert.match(blogPostReactionComponent, /<p className="blog-post-reaction-status" role="status">/u);
		assert.doesNotMatch(blogPostReactionComponent, /aria-live=/u);
		assert.doesNotMatch(blogPostReactionComponent, /remembered in this browser/u);
		assert.match(blogPostReactionComponent, /data-pagefind-ignore="all"/u);
	});

	test("makes the island the explicit Ky composition root", async function () {
		const blogPostReactionComponent = await readFile(blogPostReactionComponentPath, "utf8");
		const blogPostReactionIsland = await readFile(blogPostReactionIslandPath, "utf8");

		assert.doesNotMatch(
			blogPostReactionComponent,
			/from ["']ky["']|blog-reaction-http-client|createKyBlogReactionClient/u
		);
		assert.match(blogPostReactionComponent, /reactionClient: BlogReactionClient/u);
		assert.doesNotMatch(blogPostReactionComponent, /reactionClient\?/u);
		assert.match(blogPostReactionIsland, /from ["']\.\/blog-reaction-http-client\.tsx?["']/u);
		assert.match(blogPostReactionIsland, /createKyBlogReactionClient\(\)/u);
		assert.match(blogPostReactionIsland, /reactionClient=\{blogReactionClient\}/u);
		assert.match(blogPostReactionIsland, /createFireAndForgetInvoker/u);
		assert.match(blogPostReactionIsland, /reportUnexpectedBrowserFailure/u);
		assert.match(blogPostReactionIsland, /fireAndForgetInvoker=\{fireAndForgetInvoker\}/u);
		assert.match(blogPostReactionComponent, /fireAndForgetInvoker: FireAndForgetInvoker/u);
		assert.doesNotMatch(blogPostReactionComponent, /createFireAndForgetInvoker|reportUnexpectedBrowserFailure/u);
		assert.doesNotMatch(blogPostReactionComponent, /void (?:updateReaction|loadReaction)\(\)/u);
	});

	test("keeps the fire-and-forget port independent from browser and feature infrastructure", async function () {
		const fireAndForgetInvoker = await readFile(fireAndForgetInvokerPath, "utf8");
		const unexpectedBrowserFailureReporter = await readFile(unexpectedBrowserFailureReporterPath, "utf8");

		assert.match(fireAndForgetInvoker, /export type FireAndForgetInvoker/u);
		assert.match(fireAndForgetInvoker, /export function createFireAndForgetInvoker/u);
		assert.doesNotMatch(
			fireAndForgetInvoker,
			/Preact|preact|Ky|ky|Astro|blog-reaction|globalThis|window|document|console/u
		);
		assert.match(unexpectedBrowserFailureReporter, /globalThis\.reportError/u);
	});

	test("contains no obsolete imperative island or CSS-module test plumbing", async function () {
		assert.strictEqual(
			existsSync(join(repositoryRootDirectoryPath, "source/blog/BlogReadingProgressIndicator.astro")),
			false
		);
		assert.strictEqual(existsSync(join(repositoryRootDirectoryPath, "source/blog/BlogPostReaction.astro")), false);
		assert.strictEqual(
			existsSync(join(repositoryRootDirectoryPath, "source/blog/blog-post-reaction-browser.ts")),
			false
		);
	});

	test("keeps reading progress independent from reaction and mention code", async function () {
		const readingProgressComponent = await readFile(readingProgressComponentPath, "utf8");

		assert.doesNotMatch(readingProgressComponent, /ky|ArkType|blog-reaction|BlogPostReaction|mention/u);
	});
});

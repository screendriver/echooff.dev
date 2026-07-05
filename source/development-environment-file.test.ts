import assert from "node:assert";
import { suite, test } from "mocha";
import {
	createDevelopmentEnvironmentFileContent,
	createDevelopmentEnvironmentVariables
} from "./development-environment-file.ts";

suite("createDevelopmentEnvironmentVariables()", function () {
	test("creates deterministic development environment variables", function () {
		const actualEnvironmentVariables = createDevelopmentEnvironmentVariables("http://127.0.0.1:4321");
		const expectedEnvironmentVariables = {
			CONTACT_FORM_URL: "http://127.0.0.1:4321/contact-form",
			GITHUB_API_BASE_URL: "http://127.0.0.1:4321",
			GITHUB_LOGIN: "foo",
			GITHUB_TOKEN: "foo",
			HACKER_NEWS_API_URL: "http://127.0.0.1:4321/hacker-news",
			WEBMENTION_API_URL: "http://127.0.0.1:4321/webmentions"
		};

		assert.deepStrictEqual(actualEnvironmentVariables, expectedEnvironmentVariables);
	});
});

suite("createDevelopmentEnvironmentFileContent()", function () {
	test("creates the deterministic development environment file content", function () {
		const actualEnvironmentFileContent = createDevelopmentEnvironmentFileContent("http://127.0.0.1:4321");
		const expectedEnvironmentFileContent = [
			"GITHUB_API_BASE_URL=http://127.0.0.1:4321",
			'GITHUB_LOGIN="foo"',
			'GITHUB_TOKEN="foo"',
			'WEBMENTION_API_URL="http://127.0.0.1:4321/webmentions"',
			'HACKER_NEWS_API_URL="http://127.0.0.1:4321/hacker-news"',
			'CONTACT_FORM_URL="http://127.0.0.1:4321/contact-form"'
		].join("\n");

		assert.strictEqual(actualEnvironmentFileContent, expectedEnvironmentFileContent);
	});

	test("uses the provided line break between entries", function () {
		const actualEnvironmentFileContent = createDevelopmentEnvironmentFileContent("http://127.0.0.1:4321", "\r\n");
		const expectedEnvironmentFileContent = [
			"GITHUB_API_BASE_URL=http://127.0.0.1:4321",
			'GITHUB_LOGIN="foo"',
			'GITHUB_TOKEN="foo"',
			'WEBMENTION_API_URL="http://127.0.0.1:4321/webmentions"',
			'HACKER_NEWS_API_URL="http://127.0.0.1:4321/hacker-news"',
			'CONTACT_FORM_URL="http://127.0.0.1:4321/contact-form"'
		].join("\r\n");

		assert.strictEqual(actualEnvironmentFileContent, expectedEnvironmentFileContent);
	});
});

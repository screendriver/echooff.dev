import { describe, expect, it } from "vitest";
import {
	createDevelopmentEnvironmentFileContent,
	createDevelopmentEnvironmentVariables
} from "./development-environment-file.ts";

describe("createDevelopmentEnvironmentVariables()", () => {
	it("creates deterministic development environment variables", () => {
		const actualEnvironmentVariables = createDevelopmentEnvironmentVariables("http://127.0.0.1:4321");
		const expectedEnvironmentVariables = {
			CONTACT_FORM_URL: "http://127.0.0.1:4321/contact-form",
			GITHUB_API_BASE_URL: "http://127.0.0.1:4321",
			GITHUB_LOGIN: "foo",
			GITHUB_TOKEN: "foo",
			HACKER_NEWS_API_URL: "http://127.0.0.1:4321/hacker-news",
			WEBMENTION_API_URL: "http://127.0.0.1:4321/webmentions"
		};

		expect(actualEnvironmentVariables).toStrictEqual(expectedEnvironmentVariables);
	});
});

describe("createDevelopmentEnvironmentFileContent()", () => {
	it("creates the deterministic development environment file content", () => {
		const actualEnvironmentFileContent = createDevelopmentEnvironmentFileContent("http://127.0.0.1:4321");
		const expectedEnvironmentFileContent = [
			"GITHUB_API_BASE_URL=http://127.0.0.1:4321",
			'GITHUB_LOGIN="foo"',
			'GITHUB_TOKEN="foo"',
			'WEBMENTION_API_URL="http://127.0.0.1:4321/webmentions"',
			'HACKER_NEWS_API_URL="http://127.0.0.1:4321/hacker-news"',
			'CONTACT_FORM_URL="http://127.0.0.1:4321/contact-form"'
		].join("\n");

		expect(actualEnvironmentFileContent).toBe(expectedEnvironmentFileContent);
	});

	it("uses the provided line break between entries", () => {
		const actualEnvironmentFileContent = createDevelopmentEnvironmentFileContent("http://127.0.0.1:4321", "\r\n");
		const expectedEnvironmentFileContent = [
			"GITHUB_API_BASE_URL=http://127.0.0.1:4321",
			'GITHUB_LOGIN="foo"',
			'GITHUB_TOKEN="foo"',
			'WEBMENTION_API_URL="http://127.0.0.1:4321/webmentions"',
			'HACKER_NEWS_API_URL="http://127.0.0.1:4321/hacker-news"',
			'CONTACT_FORM_URL="http://127.0.0.1:4321/contact-form"'
		].join("\r\n");

		expect(actualEnvironmentFileContent).toBe(expectedEnvironmentFileContent);
	});
});

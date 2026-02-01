import { describe, it, expect } from "vitest";
import { parse } from "valibot";
import { gitHubApiTokenSchema, gitHubBaseUrlSchema, gitHubLoginSchema } from "./environment-variables.js";

describe("gitHubBaseUrlSchema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			return parse(gitHubBaseUrlSchema, true);
		}).toThrowError("Invalid type: Expected string but received true");
	});

	it("does not allow numbers", () => {
		expect(() => {
			return parse(gitHubBaseUrlSchema, 42);
		}).toThrowError("Invalid type: Expected string but received 42");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			return parse(gitHubBaseUrlSchema, "");
		}).toThrowError('Invalid URL: Received ""');
	});

	it("does not allow strings that are not an URL", () => {
		expect(() => {
			return parse(gitHubBaseUrlSchema, "foo");
		}).toThrowError('Invalid URL: Received "foo"');
	});

	it("allows a string URL", () => {
		const gitHubBaseUrl = parse(gitHubBaseUrlSchema, "https://example.com");

		expect(gitHubBaseUrl.toString()).toStrictEqual(new URL("https://example.com").toString());
	});
});

describe("gitHubLoginSchema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			return parse(gitHubLoginSchema, true);
		}).toThrowError("Invalid type: Expected string but received true");
	});

	it("does not allow numbers", () => {
		expect(() => {
			return parse(gitHubLoginSchema, 42);
		}).toThrowError("Invalid type: Expected string but received 42");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			return parse(gitHubLoginSchema, "");
		}).toThrowError("Invalid length: Expected >=1 but received 0");
	});

	it("allows non empty strings", () => {
		const gitHubLogin = parse(gitHubLoginSchema, "foo");

		expect(gitHubLogin).toBe("foo");
	});
});

describe("gitHubApiTokenSchema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			return parse(gitHubApiTokenSchema, true);
		}).toThrowError("Invalid type: Expected string but received true");
	});

	it("does not allow numbers", () => {
		expect(() => {
			return parse(gitHubApiTokenSchema, 42);
		}).toThrowError("Invalid type: Expected string but received 42");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			return parse(gitHubApiTokenSchema, "");
		}).toThrowError("Invalid length: Expected >=1 but received 0");
	});

	it("allows non empty strings", () => {
		const gitHubLogin = parse(gitHubApiTokenSchema, "foo");

		expect(gitHubLogin).toBe("foo");
	});
});

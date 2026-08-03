import assert from "node:assert";
import { suite, test } from "mocha";
import { readRybbitBrowserApiFromGlobal } from "./rybbit-browser-adapter.ts";
import type { RybbitBrowserApi } from "./rybbit-blog-reaction-analytics.ts";

type RybbitEventProperties = Readonly<Record<string, string>>;

type RybbitEventCall = {
	eventName: string;
	properties: RybbitEventProperties;
};

function requireRybbitBrowserApi(browserApi: RybbitBrowserApi | undefined): RybbitBrowserApi {
	if (browserApi === undefined) {
		throw new Error("Expected a Rybbit browser API");
	}

	return browserApi;
}

suite("readRybbitBrowserApiFromGlobal()", function () {
	test("adapts an ordinary object and forwards the exact event data", function () {
		const actualEvent: RybbitEventCall = {
			eventName: "",
			properties: {}
		};
		const rybbitGlobal = {
			event(eventName: string, properties: RybbitEventProperties): void {
				actualEvent.eventName = eventName;
				actualEvent.properties = properties;
			}
		};
		const expectedProperties = {
			post_slug: "translations-belong-to-the-user-interface"
		};
		const browserApi = requireRybbitBrowserApi(readRybbitBrowserApiFromGlobal(rybbitGlobal));

		browserApi.trackEvent("blog_reaction_added", expectedProperties);

		assert.partialDeepStrictEqual(actualEvent, {
			eventName: "blog_reaction_added",
			properties: expectedProperties
		});
	});

	test("accepts class instances with inherited event methods", function () {
		const RybbitGlobalInstance = class RybbitGlobalInstance {
			private readonly eventCalls: RybbitEventCall[] = [];

			public event(eventName: string, properties: RybbitEventProperties): void {
				this.eventCalls.push({ eventName, properties });
			}

			public readEventCalls(): readonly RybbitEventCall[] {
				return this.eventCalls;
			}
		};
		const rybbitGlobal = new RybbitGlobalInstance();
		const browserApi = requireRybbitBrowserApi(readRybbitBrowserApiFromGlobal(rybbitGlobal));
		const expectedProperties = { post_slug: "first-post" };

		browserApi.trackEvent("blog_reaction_removed", expectedProperties);

		assert.deepStrictEqual(rybbitGlobal.readEventCalls(), [
			{
				eventName: "blog_reaction_removed",
				properties: expectedProperties
			}
		]);
	});

	test("accepts a callable global with an event property", function () {
		const actualEvent: RybbitEventCall = {
			eventName: "",
			properties: {}
		};
		function rybbitGlobal(): string {
			return "rybbit";
		}
		const rybbitGlobalWithEvent = Object.assign(rybbitGlobal, {
			event(eventName: string, properties: RybbitEventProperties): void {
				actualEvent.eventName = eventName;
				actualEvent.properties = properties;
			}
		});
		const expectedProperties = { post_slug: "first-post" };
		const browserApi = requireRybbitBrowserApi(readRybbitBrowserApiFromGlobal(rybbitGlobalWithEvent));

		browserApi.trackEvent("blog_reaction_added", expectedProperties);

		assert.partialDeepStrictEqual(actualEvent, {
			eventName: "blog_reaction_added",
			properties: expectedProperties
		});
	});

	test("returns undefined for missing or malformed Rybbit globals", function () {
		const missingRybbitGlobals: readonly unknown[] = [
			undefined,
			null,
			"rybbit",
			42,
			{},
			{ event: undefined },
			{ event: "not callable" }
		];

		for (const missingRybbitGlobal of missingRybbitGlobals) {
			const actualBrowserApi = readRybbitBrowserApiFromGlobal(missingRybbitGlobal);

			assert.strictEqual(actualBrowserApi, undefined);
		}
	});

	test("returns undefined when reading event throws", function () {
		const throwingGetter = {
			get event(): never {
				throw new Error("event getter failed");
			}
		};

		const actualBrowserApi = readRybbitBrowserApiFromGlobal(throwingGetter);

		assert.strictEqual(actualBrowserApi, undefined);
	});

	test("returns undefined when a proxy throws while reading event", function () {
		const throwingProxy = new Proxy(
			{},
			{
				get(): never {
					throw new Error("event proxy failed");
				}
			}
		);

		const actualBrowserApi = readRybbitBrowserApiFromGlobal(throwingProxy);

		assert.strictEqual(actualBrowserApi, undefined);
	});
});

import { isFunction, isObject } from "@sindresorhus/is";
import type { RybbitBrowserApi } from "./rybbit-blog-reaction-analytics.ts";

function readRybbitGlobal(): unknown {
	const browserGlobal = globalThis as typeof globalThis & {
		readonly rybbit?: unknown;
	};

	return browserGlobal.rybbit;
}

function readRybbitEventProperty(rybbitGlobal: unknown): unknown {
	if (!isObject(rybbitGlobal)) {
		return undefined;
	}

	try {
		return Reflect.get(rybbitGlobal, "event");
	} catch {
		return undefined;
	}
}

export function readRybbitBrowserApiFromGlobal(rybbitGlobal: unknown): RybbitBrowserApi | undefined {
	const rybbitEvent = readRybbitEventProperty(rybbitGlobal);

	if (!isFunction(rybbitEvent)) {
		return undefined;
	}

	return {
		trackEvent(eventName, properties): void {
			Reflect.apply(rybbitEvent, rybbitGlobal, [eventName, properties]);
		}
	};
}

export function readRybbitBrowserApi(): RybbitBrowserApi | undefined {
	return readRybbitBrowserApiFromGlobal(readRybbitGlobal());
}

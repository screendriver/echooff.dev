import { isFunction, isPlainObject } from "@sindresorhus/is";
import type { RybbitBrowserApi } from "./rybbit-blog-reaction-analytics.ts";

type RybbitGlobal = {
	readonly event: unknown;
};

type RybbitEvent = (eventName: string, properties: Readonly<Record<string, string>>) => void;

function isRybbitGlobal(value: unknown): value is RybbitGlobal {
	return isPlainObject(value) && Object.hasOwn(value, "event");
}

function isRybbitEvent(value: unknown): value is RybbitEvent {
	return isFunction(value) && isFunction(value.call);
}

function readRybbitGlobal(): RybbitGlobal | undefined {
	const browserGlobal = globalThis as typeof globalThis & {
		readonly rybbit?: unknown;
	};

	if (!isRybbitGlobal(browserGlobal.rybbit)) {
		return undefined;
	}

	return browserGlobal.rybbit;
}

export function readRybbitBrowserApi(): RybbitBrowserApi | undefined {
	const rybbitGlobal = readRybbitGlobal();
	const rybbitEvent = rybbitGlobal?.event;

	if (!isRybbitEvent(rybbitEvent)) {
		return undefined;
	}

	return {
		trackEvent(eventName, properties): void {
			rybbitEvent.call(rybbitGlobal, eventName, properties);
		}
	};
}

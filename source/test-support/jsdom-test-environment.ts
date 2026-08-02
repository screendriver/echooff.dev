import { JSDOM } from "jsdom";
import { just, nothing, type Maybe } from "true-myth/maybe";

type InstalledGlobalProperty = {
	readonly name: string;
	readonly descriptor: PropertyDescriptor | undefined;
};

export type JsdomTestEnvironment = {
	readonly install: () => void;
	readonly restore: () => void;
};

const jsdomGlobalNames = [
	"window",
	"document",
	"navigator",
	"HTMLElement",
	"HTMLButtonElement",
	"Element",
	"Node",
	"Text",
	"Event",
	"MouseEvent",
	"KeyboardEvent",
	"getComputedStyle"
] as const;

export function createJsdomTestEnvironment(): JsdomTestEnvironment {
	let jsdom: Maybe<JSDOM> = nothing();
	let installedGlobalProperties: readonly InstalledGlobalProperty[] = [];

	function install(): void {
		if (jsdom.isJust) {
			throw new TypeError("The jsdom test environment is already installed.");
		}

		jsdom = just(
			new JSDOM("<!doctype html><html><body></body></html>", {
				url: "https://www.echooff.dev/"
			})
		);
		const currentJsdom = jsdom;

		if (currentJsdom.isNothing) {
			throw new TypeError("Expected jsdom to be initialized.");
		}

		installedGlobalProperties = jsdomGlobalNames.map((globalPropertyName) => {
			return {
				descriptor: Object.getOwnPropertyDescriptor(globalThis, globalPropertyName),
				name: globalPropertyName
			};
		});

		for (const globalPropertyName of jsdomGlobalNames) {
			Object.defineProperty(globalThis, globalPropertyName, {
				configurable: true,
				value: Reflect.get(currentJsdom.value.window, globalPropertyName),
				writable: true
			});
		}
	}

	function restore(): void {
		if (jsdom.isNothing) {
			return;
		}

		for (const installedGlobalProperty of installedGlobalProperties) {
			if (installedGlobalProperty.descriptor === undefined) {
				Reflect.deleteProperty(globalThis, installedGlobalProperty.name);
			} else {
				Object.defineProperty(globalThis, installedGlobalProperty.name, installedGlobalProperty.descriptor);
			}
		}

		jsdom.value.window.close();
		jsdom = nothing();
		installedGlobalProperties = [];
	}

	return { install, restore };
}

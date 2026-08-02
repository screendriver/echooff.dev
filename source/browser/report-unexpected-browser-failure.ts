export function reportUnexpectedBrowserFailure(error: unknown): void {
	// This module is the browser composition boundary for unexpected failures.
	// eslint-disable-next-line unicorn/no-unnecessary-global-this -- The platform reporter is intentionally read from the browser global.
	if (typeof globalThis.reportError === "function") {
		// eslint-disable-next-line unicorn/no-unnecessary-global-this -- The platform reporter is intentionally called through the browser global.
		globalThis.reportError(error);
		return;
	}

	// eslint-disable-next-line no-console -- This is the conservative fallback for unexpected browser failures.
	console.error(error);
}

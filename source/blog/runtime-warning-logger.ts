import process from "node:process";
import { isError } from "@sindresorhus/is";

export type RuntimeWarningLogger = {
	readonly warn: (message: string, error: unknown) => void;
};
type StandardErrorRuntimeWarningLoggerDependencies = {
	readonly writeText: (textContent: string) => void;
};

function formatRuntimeWarningMessage(message: string, error: unknown): string {
	const errorMessage = isError(error) ? error.message : String(error);

	return `${message}: ${errorMessage}\n`;
}

export function createStandardErrorRuntimeWarningLogger(
	dependencies: StandardErrorRuntimeWarningLoggerDependencies
): RuntimeWarningLogger {
	return {
		warn(message, error) {
			dependencies.writeText(formatRuntimeWarningMessage(message, error));
		}
	};
}

export const standardErrorRuntimeWarningLogger: RuntimeWarningLogger = {
	...createStandardErrorRuntimeWarningLogger({
		writeText(textContent) {
			process.stderr.write(textContent);
		}
	})
};

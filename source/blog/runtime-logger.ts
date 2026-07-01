import process from "node:process";
import { isError } from "@sindresorhus/is";
import { match } from "ts-pattern";

export type RuntimeLogProperties = Readonly<Record<string, boolean | number | string | null>>;

export type RuntimeLogger = {
	readonly info: (message: string, properties: RuntimeLogProperties) => void;
	readonly warn: (message: string, error: unknown, properties: RuntimeLogProperties) => void;
};

type StandardStreamRuntimeLoggerDependencies = {
	readonly writeErrorText: (textContent: string) => void;
	readonly writeOutputText: (textContent: string) => void;
};

function readErrorMessage(error: unknown): string {
	return match(error)
		.when(isError, (knownError) => {
			return knownError.message;
		})
		.otherwise(String);
}

function readErrorName(error: unknown): string {
	return match(error)
		.when(isError, (knownError) => {
			return knownError.name;
		})
		.otherwise(() => {
			return "UnknownError";
		});
}

function formatRuntimeLogLine(level: "info" | "warn", message: string, properties: RuntimeLogProperties): string {
	return `${JSON.stringify({
		level,
		message,
		...properties
	})}\n`;
}

export function createStandardStreamRuntimeLogger(
	dependencies: StandardStreamRuntimeLoggerDependencies
): RuntimeLogger {
	return {
		info(message, properties) {
			dependencies.writeOutputText(formatRuntimeLogLine("info", message, properties));
		},
		warn(message, error, properties) {
			dependencies.writeErrorText(
				formatRuntimeLogLine("warn", message, {
					...properties,
					errorMessage: readErrorMessage(error),
					errorName: readErrorName(error)
				})
			);
		}
	};
}

export const standardStreamRuntimeLogger: RuntimeLogger = {
	...createStandardStreamRuntimeLogger({
		writeErrorText(textContent) {
			process.stderr.write(textContent);
		},
		writeOutputText(textContent) {
			process.stdout.write(textContent);
		}
	})
};

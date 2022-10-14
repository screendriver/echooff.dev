export interface ErrorReporter {
	send(error: unknown): void;
}

export function createErrorReporter(): ErrorReporter {
	return {
		send(error) {
			console.error(error);
		}
	};
}

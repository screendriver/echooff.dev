import type Sentry from '@sentry/gatsby';

export interface ErrorReporterDependencies {
    readonly sentry: typeof Sentry;
}

export interface ErrorReporter {
    send(error: unknown): void;
}

export function createErrorReporter(dependencies: ErrorReporterDependencies): ErrorReporter {
    const { sentry } = dependencies;

    return {
        send(error) {
            sentry.captureException(error);
        },
    };
}

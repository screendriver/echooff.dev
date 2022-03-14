import test from 'ava';
import { fake } from 'sinon';
import { createErrorReporter, ErrorReporterDependencies } from '../../../src/error-reporter/reporter';

test('sends the given error to Sentry', (t) => {
    const captureException = fake();
    const dependencies = {
        sentry: {
            captureException,
        },
    } as unknown as ErrorReporterDependencies;
    const error = new Error('Test error');
    createErrorReporter(dependencies).send(error);

    t.true(captureException.calledOnceWith(error));
});

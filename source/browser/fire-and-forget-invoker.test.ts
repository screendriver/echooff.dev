import assert from "node:assert";
import { suite, test } from "mocha";
import {
	createFireAndForgetInvoker,
	type FireAndForgetInvoker,
	type FireAndForgetOperation
} from "./fire-and-forget-invoker.ts";

function createTestFireAndForgetInvoker(
	reportedFailures: unknown[],
	resolveReportedFailure?: () => void
): FireAndForgetInvoker {
	return createFireAndForgetInvoker({
		reportFailure(error) {
			reportedFailures.push(error);
			resolveReportedFailure?.();
		}
	});
}

suite("createFireAndForgetInvoker()", function () {
	test("invokes a resolving operation exactly once without reporting", function () {
		const reportedFailures: unknown[] = [];
		const fireAndForgetInvoker = createTestFireAndForgetInvoker(reportedFailures);
		let invocationCount = 0;
		const operation: FireAndForgetOperation = async function resolveOperation(): Promise<void> {
			invocationCount += 1;
		};
		const invokeAsUnknown: (operation: FireAndForgetOperation) => unknown = fireAndForgetInvoker.invoke;

		const actualReturnValue = Reflect.apply(invokeAsUnknown, fireAndForgetInvoker, [operation]);

		assert.strictEqual(actualReturnValue, undefined);
		assert.strictEqual(invocationCount, 1);
		assert.deepStrictEqual(reportedFailures, []);
	});

	test("allows several independent operations", function () {
		const reportedFailures: unknown[] = [];
		const fireAndForgetInvoker = createTestFireAndForgetInvoker(reportedFailures);
		let invocationCount = 0;

		fireAndForgetInvoker.invoke(async function resolveFirstOperation(): Promise<void> {
			invocationCount += 1;
		});
		fireAndForgetInvoker.invoke(async function resolveSecondOperation(): Promise<void> {
			invocationCount += 1;
		});

		assert.strictEqual(invocationCount, 2);
		assert.deepStrictEqual(reportedFailures, []);
	});

	test("reports the original rejected value exactly once without retrying", async function () {
		const reportedFailures: unknown[] = [];
		const reportedFailure = Promise.withResolvers<boolean>();
		const fireAndForgetInvoker = createTestFireAndForgetInvoker(reportedFailures, () => {
			reportedFailure.resolve(true);
		});
		const rejectedValue = new Error("expected test rejection");
		let invocationCount = 0;

		fireAndForgetInvoker.invoke(async function rejectOperation(): Promise<void> {
			invocationCount += 1;
			throw rejectedValue;
		});

		await reportedFailure.promise;

		assert.deepStrictEqual(reportedFailures, [rejectedValue]);
		assert.strictEqual(invocationCount, 1);
	});

	test("reports a synchronous throw exactly once", function () {
		const reportedFailures: unknown[] = [];
		const fireAndForgetInvoker = createTestFireAndForgetInvoker(reportedFailures);
		const thrownValue = new Error("synchronous test failure");
		const throwOperation: FireAndForgetOperation = function throwOperation(): never {
			throw thrownValue;
		};

		fireAndForgetInvoker.invoke(throwOperation);

		assert.deepStrictEqual(reportedFailures, [thrownValue]);
	});

	test("reports several independent failures once each", async function () {
		const reportedFailures: unknown[] = [];
		const reportedFailuresCompleted = Promise.withResolvers<boolean>();
		const fireAndForgetInvoker = createTestFireAndForgetInvoker(reportedFailures, () => {
			if (reportedFailures.length === 2) {
				reportedFailuresCompleted.resolve(true);
			}
		});
		const firstRejectedValue = new Error("first test failure");
		const secondRejectedValue = new Error("second test failure");

		fireAndForgetInvoker.invoke(async function rejectFirstOperation(): Promise<void> {
			throw firstRejectedValue;
		});
		fireAndForgetInvoker.invoke(async function rejectSecondOperation(): Promise<void> {
			throw secondRejectedValue;
		});

		await reportedFailuresCompleted.promise;

		assert.deepStrictEqual(reportedFailures, [firstRejectedValue, secondRejectedValue]);
	});
});

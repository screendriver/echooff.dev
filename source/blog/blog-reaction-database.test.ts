import assert from "node:assert";
import { suite, test } from "mocha";
import type { Kysely, KyselyPlugin } from "kysely";
import { just, nothing } from "true-myth/maybe";
import { isOk, type Result } from "true-myth/result";
import type { Task } from "true-myth/task";
import type { ApplicationDatabase, ApplicationDatabaseConnection } from "./application-database.ts";
import { withTemporaryApplicationDatabase } from "./application-database-test-support.ts";
import { createBlogReactionRepository } from "./blog-reaction-database.ts";
import { createTestPublishedBlogPostSlug } from "./blog-reaction-test-support.ts";
import type { BlogReactionRepository, BlogReactionSnapshot } from "./blog-reaction.ts";

type RecordedQueryOperation = "DeleteQueryNode" | "InsertQueryNode" | "SelectQueryNode";

type QueryOperationRecorder = {
	readonly operationKinds: readonly RecordedQueryOperation[];
	readonly recordOperationKind: (operationKind: RecordedQueryOperation) => void;
};

const firstPostSlug = createTestPublishedBlogPostSlug("first-post");
const quietPostSlug = createTestPublishedBlogPostSlug("quiet-post");
const secondPostSlug = createTestPublishedBlogPostSlug("second-post");

function unwrapTestResult<Value>(result: Result<Value, Error>): Value {
	if (isOk(result)) {
		return result.value;
	}

	throw result.error;
}

async function unwrapTestTask<Value>(task: Task<Value, Error>): Promise<Value> {
	return unwrapTestResult(await task);
}

function createTestBlogReactionRepository(
	applicationDatabaseConnection: ApplicationDatabaseConnection
): BlogReactionRepository {
	return createBlogReactionRepository(applicationDatabaseConnection.database);
}

function createRecordingDatabase(
	applicationDatabaseConnection: ApplicationDatabaseConnection,
	queryOperationRecorder: QueryOperationRecorder
): Kysely<ApplicationDatabase> {
	const recordingPlugin: KyselyPlugin = {
		transformQuery(queryArguments) {
			if (queryArguments.node.kind === "DeleteQueryNode") {
				queryOperationRecorder.recordOperationKind("DeleteQueryNode");
			} else if (queryArguments.node.kind === "InsertQueryNode") {
				queryOperationRecorder.recordOperationKind("InsertQueryNode");
			} else if (queryArguments.node.kind === "SelectQueryNode") {
				queryOperationRecorder.recordOperationKind("SelectQueryNode");
			}

			return queryArguments.node;
		},
		async transformResult(resultArguments) {
			return resultArguments.result;
		}
	};

	return applicationDatabaseConnection.database.withPlugin(recordingPlugin);
}

function assertSnapshot(actualSnapshot: BlogReactionSnapshot, expectedSnapshot: BlogReactionSnapshot): void {
	assert.deepStrictEqual(actualSnapshot, expectedSnapshot);
}

suite("blog reaction database repository", function () {
	test(
		"reads an empty post without an anonymous identity",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			const actualSnapshot = await unwrapTestTask(blogReactionRepository.readSnapshot(quietPostSlug, nothing()));

			assertSnapshot(actualSnapshot, {
				count: 0,
				reacted: false
			});
		})
	);

	test(
		"adds the first reaction and returns the updated snapshot",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			const actualSnapshot = await unwrapTestTask(
				blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one")
			);

			assertSnapshot(actualSnapshot, {
				count: 1,
				reacted: true
			});
		})
	);

	test(
		"keeps repeated additions idempotent",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one"));
			const actualSnapshot = await unwrapTestTask(
				blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one")
			);

			assertSnapshot(actualSnapshot, {
				count: 1,
				reacted: true
			});
		})
	);

	test(
		"counts different identities independently on one post",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one"));
			const actualSnapshot = await unwrapTestTask(
				blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-two")
			);

			assertSnapshot(actualSnapshot, {
				count: 2,
				reacted: true
			});
		})
	);

	test(
		"isolates one identity between different posts",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(firstPostSlug, "reactor-hash-one"));
			const actualSnapshot = await unwrapTestTask(
				blogReactionRepository.readSnapshot(secondPostSlug, just("reactor-hash-one"))
			);

			assertSnapshot(actualSnapshot, {
				count: 0,
				reacted: false
			});
		})
	);

	test(
		"reads the matching and non-matching reaction state",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one"));
			const actualMatchingSnapshot = await unwrapTestTask(
				blogReactionRepository.readSnapshot(quietPostSlug, just("reactor-hash-one"))
			);
			const actualNonMatchingSnapshot = await unwrapTestTask(
				blogReactionRepository.readSnapshot(quietPostSlug, just("reactor-hash-two"))
			);

			assertSnapshot(actualMatchingSnapshot, {
				count: 1,
				reacted: true
			});
			assertSnapshot(actualNonMatchingSnapshot, {
				count: 1,
				reacted: false
			});
		})
	);

	test(
		"removes an existing reaction and makes repeated removal idempotent",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);

			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one"));
			const actualFirstRemovalSnapshot = await unwrapTestTask(
				blogReactionRepository.removeReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one")
			);
			const actualSecondRemovalSnapshot = await unwrapTestTask(
				blogReactionRepository.removeReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one")
			);

			assertSnapshot(actualFirstRemovalSnapshot, {
				count: 0,
				reacted: false
			});
			assertSnapshot(actualSecondRemovalSnapshot, {
				count: 0,
				reacted: false
			});
		})
	);

	test(
		"executes the write before the count query for mutations",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const operationKinds: RecordedQueryOperation[] = [];
			const queryOperationRecorder: QueryOperationRecorder = {
				operationKinds,
				recordOperationKind(operationKind) {
					operationKinds.push(operationKind);
				}
			};
			const recordingDatabase = createRecordingDatabase(applicationDatabaseConnection, queryOperationRecorder);
			const blogReactionRepository = createBlogReactionRepository(recordingDatabase);

			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one"));

			assert.deepStrictEqual(queryOperationRecorder.operationKinds, ["InsertQueryNode", "SelectQueryNode"]);
		})
	);

	test(
		"executes the delete before the count query for removals",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const blogReactionRepository = createTestBlogReactionRepository(applicationDatabaseConnection);
			await unwrapTestTask(blogReactionRepository.addReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one"));
			const operationKinds: RecordedQueryOperation[] = [];
			const queryOperationRecorder: QueryOperationRecorder = {
				operationKinds,
				recordOperationKind(operationKind) {
					operationKinds.push(operationKind);
				}
			};
			const recordingDatabase = createRecordingDatabase(applicationDatabaseConnection, queryOperationRecorder);
			const recordingBlogReactionRepository = createBlogReactionRepository(recordingDatabase);

			await unwrapTestTask(
				recordingBlogReactionRepository.removeReactionAndReadSnapshot(quietPostSlug, "reactor-hash-one")
			);

			assert.deepStrictEqual(queryOperationRecorder.operationKinds, ["DeleteQueryNode", "SelectQueryNode"]);
		})
	);
});

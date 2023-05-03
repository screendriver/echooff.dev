import { test, assert } from "vitest";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import { ZodError } from "zod";
import {
	GitHubStatistics,
	gitHubStatisticsSchema
} from "../../../source/github-statistics/github-statistics-schema.js";

const gitHubStatisticsFactory = Factory.define<GitHubStatistics>(() => {
	return {
		user: {
			repositories: {
				totalCount: 7
			},
			starredRepositories: {
				totalCount: 42
			}
		}
	};
});

test('gitHubStatisticsSchema does allow additional properties in addition to "user" object an strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		foo: "bar"
	} as unknown as GitHubStatistics);

	const actual = gitHubStatisticsSchema.parse(gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();
	assert.deepStrictEqual(actual, expected);
});

test('gitHubStatisticsSchema does allow additional properties in "user" object and strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			foo: "bar"
		}
	} as unknown as GitHubStatistics);

	const actual = gitHubStatisticsSchema.parse(gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();
	assert.deepStrictEqual(actual, expected);
});

test('gitHubStatisticsSchema does allow additional properties in "user.repositories" object and strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				foo: "bar"
			}
		}
	} as unknown as GitHubStatistics);

	const actual = gitHubStatisticsSchema.parse(gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();
	assert.deepStrictEqual(actual, expected);
});

test('gitHubStatisticsSchema does allow additional properties in "user.starredRepositories" object and strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				foo: "bar"
			}
		}
	} as unknown as GitHubStatistics);

	const actual = gitHubStatisticsSchema.parse(gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();
	assert.deepStrictEqual(actual, expected);
});

test('gitHubStatisticsSchema does not allow negative numbers for "user.repositories.totalCount', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: -42
			}
		}
	});

	assert.throws(
		() => gitHubStatisticsSchema.parse(gitHubStatistics),
		ZodError,
		stripIndent`
          [
            {
              "code": "too_small",
              "minimum": 0,
              "type": "number",
              "inclusive": true,
              "exact": false,
              "message": "Number must be greater than or equal to 0",
              "path": [
                "user",
                "repositories",
                "totalCount"
              ]
            }
          ]`
	);
});

test('gitHubStatisticsSchema does not allow other types than number for "user.repositories.totalCount', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: "foo"
			}
		}
	} as unknown as GitHubStatistics);

	assert.throws(
		() => gitHubStatisticsSchema.parse(gitHubStatistics),
		ZodError,
		stripIndent`
          [
            {
              "code": "invalid_type",
              "expected": "number",
              "received": "string",
              "path": [
                "user",
                "repositories",
                "totalCount"
              ],
              "message": "Expected number, received string"
            }
          ]`
	);
});

test('gitHubStatisticsSchema allows 0 for "user.repositories.totalCount', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: 0
			}
		}
	});

	const actual = gitHubStatisticsSchema.parse(gitHubStatistics);
	const expected = gitHubStatistics;
	assert.deepStrictEqual(actual, expected);
});

test('gitHubStatisticsSchema does not allow negative numbers for "user.starredRepositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				totalCount: -42
			}
		}
	});

	assert.throws(
		() => gitHubStatisticsSchema.parse(gitHubStatistics),
		ZodError,
		stripIndent`
          [
            {
              "code": "too_small",
              "minimum": 0,
              "type": "number",
              "inclusive": true,
              "exact": false,
              "message": "Number must be greater than or equal to 0",
              "path": [
                "user",
                "starredRepositories",
                "totalCount"
              ]
            }
          ]`
	);
});

test('gitHubStatisticsSchema does not allow other types than number for "user.starredRepositories.totalCount', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				totalCount: "foo"
			}
		}
	} as unknown as GitHubStatistics);

	assert.throws(
		() => gitHubStatisticsSchema.parse(gitHubStatistics),
		ZodError,
		stripIndent`
        [
          {
            "code": "invalid_type",
            "expected": "number",
            "received": "string",
            "path": [
              "user",
              "starredRepositories",
              "totalCount"
            ],
            "message": "Expected number, received string"
          }
        ]`
	);
});

test('gitHubStatisticsSchema allows 0 for "user.starredRepositories.totalCount', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				totalCount: 0
			}
		}
	});

	const actual = gitHubStatisticsSchema.parse(gitHubStatistics);
	const expected = gitHubStatistics;
	assert.deepStrictEqual(actual, expected);
});

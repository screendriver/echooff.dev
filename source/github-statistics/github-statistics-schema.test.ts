import { test, expect } from "vitest";
import { parse } from "valibot";
import { Factory } from "fishery";
import { type GitHubStatistics, gitHubStatisticsSchema } from "./github-statistics-schema.js";

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

	const actual = parse(gitHubStatisticsSchema, gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();

	expect(actual).toStrictEqual(expected);
});

test('gitHubStatisticsSchema does allow additional properties in "user" object and strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			foo: "bar"
		}
	} as unknown as GitHubStatistics);

	const actual = parse(gitHubStatisticsSchema, gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();

	expect(actual).toStrictEqual(expected);
});

test('gitHubStatisticsSchema does allow additional properties in "user.repositories" object and strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				foo: "bar"
			}
		}
	} as unknown as GitHubStatistics);

	const actual = parse(gitHubStatisticsSchema, gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();

	expect(actual).toStrictEqual(expected);
});

test('gitHubStatisticsSchema does allow additional properties in "user.starredRepositories" object and strips them out', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				foo: "bar"
			}
		}
	} as unknown as GitHubStatistics);

	const actual = parse(gitHubStatisticsSchema, gitHubStatistics);
	const expected = gitHubStatisticsFactory.build();

	expect(actual).toStrictEqual(expected);
});

test('gitHubStatisticsSchema does not allow negative numbers for "user.repositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: -42
			}
		}
	});

	expect(() => {
		return parse(gitHubStatisticsSchema, gitHubStatistics);
	}).toThrow("Invalid value: Expected >=0 but received -42");
});

test('gitHubStatisticsSchema does not allow other types than number for "user.repositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: "foo"
			}
		}
	} as unknown as GitHubStatistics);

	expect(() => {
		return parse(gitHubStatisticsSchema, gitHubStatistics);
	}).toThrow('Invalid type: Expected number but received "foo"');
});

test('gitHubStatisticsSchema allows 0 for "user.repositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: 0
			}
		}
	});

	const actual = parse(gitHubStatisticsSchema, gitHubStatistics);
	const expected = gitHubStatistics;

	expect(actual).toStrictEqual(expected);
});

test('gitHubStatisticsSchema does not allow negative numbers for "user.starredRepositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				totalCount: -42
			}
		}
	});

	expect(() => {
		return parse(gitHubStatisticsSchema, gitHubStatistics);
	}).toThrow("Invalid value: Expected >=0 but received -42");
});

test('gitHubStatisticsSchema does not allow other types than number for "user.starredRepositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				totalCount: "foo"
			}
		}
	} as unknown as GitHubStatistics);

	expect(() => {
		return parse(gitHubStatisticsSchema, gitHubStatistics);
	}).toThrow('Invalid type: Expected number but received "foo"');
});

test('gitHubStatisticsSchema allows 0 for "user.starredRepositories.totalCount"', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			starredRepositories: {
				totalCount: 0
			}
		}
	});

	const actual = parse(gitHubStatisticsSchema, gitHubStatistics);
	const expected = gitHubStatistics;

	expect(actual).toStrictEqual(expected);
});

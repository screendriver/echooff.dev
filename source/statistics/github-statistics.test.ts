import { describe, it, expect } from "vitest";
import { Factory } from "fishery";
import { gitHubStatisticsResponseSchema } from "./github-statistics-response-schema.js";
import { parseGitHubStatistics, type GitHubStatistics } from "./github-statistics.js";

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

describe("gitHub statistics schema", () => {
	it('does allow additional properties in addition to "user" object an strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			foo: "bar"
		} as unknown as GitHubStatistics);

		const actual = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expected = gitHubStatisticsFactory.build();

		expect(actual).toStrictEqual(expected);
	});

	it('does allow additional properties in "user" object and strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				foo: "bar"
			}
		} as unknown as GitHubStatistics);

		const actual = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expected = gitHubStatisticsFactory.build();

		expect(actual).toStrictEqual(expected);
	});

	it('does allow additional properties in "user.repositories" object and strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					foo: "bar"
				}
			}
		} as unknown as GitHubStatistics);

		const actual = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expected = gitHubStatisticsFactory.build();

		expect(actual).toStrictEqual(expected);
	});

	it('does allow additional properties in "user.starredRepositories" object and strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					foo: "bar"
				}
			}
		} as unknown as GitHubStatistics);

		const actual = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expected = gitHubStatisticsFactory.build();

		expect(actual).toStrictEqual(expected);
	});

	it('does not allow negative numbers for "user.repositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					totalCount: -42
				}
			}
		});

		expect(() => {
			return gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		}).toThrowError("user.repositories.totalCount must be non-negative (was -42)");
	});

	it('does not allow other types than number for "user.repositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					totalCount: "foo"
				}
			}
		} as unknown as GitHubStatistics);

		expect(() => {
			return gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		}).toThrowError("user.repositories.totalCount must be a number (was a string)");
	});

	it('allows 0 for "user.repositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					totalCount: 0
				}
			}
		});

		const actual = parseGitHubStatistics(gitHubStatistics);
		const expected = gitHubStatistics;

		expect(actual).toStrictEqual(expected);
	});

	it('does not allow negative numbers for "user.starredRepositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					totalCount: -42
				}
			}
		});

		expect(() => {
			return gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		}).toThrowError("user.starredRepositories.totalCount must be non-negative (was -42)");
	});

	it('does not allow other types than number for "user.starredRepositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					totalCount: "foo"
				}
			}
		} as unknown as GitHubStatistics);

		expect(() => {
			return gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		}).toThrowError("user.starredRepositories.totalCount must be a number (was a string)");
	});

	it('allows 0 for "user.starredRepositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					totalCount: 0
				}
			}
		});

		const actual = parseGitHubStatistics(gitHubStatistics);
		const expected = gitHubStatistics;

		expect(actual).toStrictEqual(expected);
	});
});

import { describe, expect, it } from "vitest";
import { Factory } from "fishery";
import { gitHubStatisticsResponseSchema } from "./github-statistics-response-schema.ts";
import { parseGitHubStatistics, type GitHubStatistics } from "./github-statistics.ts";

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

		const actualGitHubStatistics = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expectedGitHubStatistics = gitHubStatisticsFactory.build();

		expect(actualGitHubStatistics).toStrictEqual(expectedGitHubStatistics);
	});

	it('does allow additional properties in "user" object and strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				foo: "bar"
			}
		} as unknown as GitHubStatistics);

		const actualGitHubStatistics = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expectedGitHubStatistics = gitHubStatisticsFactory.build();

		expect(actualGitHubStatistics).toStrictEqual(expectedGitHubStatistics);
	});

	it('does allow additional properties in "user.repositories" object and strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					foo: "bar"
				}
			}
		} as unknown as GitHubStatistics);

		const actualGitHubStatistics = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expectedGitHubStatistics = gitHubStatisticsFactory.build();

		expect(actualGitHubStatistics).toStrictEqual(expectedGitHubStatistics);
	});

	it('does allow additional properties in "user.starredRepositories" object and strips them out', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					foo: "bar"
				}
			}
		} as unknown as GitHubStatistics);

		const actualGitHubStatistics = gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		const expectedGitHubStatistics = gitHubStatisticsFactory.build();

		expect(actualGitHubStatistics).toStrictEqual(expectedGitHubStatistics);
	});

	it('does not allow negative numbers for "user.repositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					totalCount: -42
				}
			}
		});

		const actualAssertionOperation = (): void => {
			gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		};
		const expectedErrorMessage = "user.repositories.totalCount must be non-negative (was -42)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it('does not allow other types than number for "user.repositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					totalCount: "foo"
				}
			}
		} as unknown as GitHubStatistics);

		const actualAssertionOperation = (): void => {
			gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		};
		const expectedErrorMessage = "user.repositories.totalCount must be a number (was a string)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it('allows 0 for "user.repositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				repositories: {
					totalCount: 0
				}
			}
		});

		const actualGitHubStatistics = parseGitHubStatistics(gitHubStatistics);
		const expectedGitHubStatistics = gitHubStatistics;

		expect(actualGitHubStatistics).toStrictEqual(expectedGitHubStatistics);
	});

	it('does not allow negative numbers for "user.starredRepositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					totalCount: -42
				}
			}
		});

		const actualAssertionOperation = (): void => {
			gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		};
		const expectedErrorMessage = "user.starredRepositories.totalCount must be non-negative (was -42)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it('does not allow other types than number for "user.starredRepositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					totalCount: "foo"
				}
			}
		} as unknown as GitHubStatistics);

		const actualAssertionOperation = (): void => {
			gitHubStatisticsResponseSchema.assert(gitHubStatistics);
		};
		const expectedErrorMessage = "user.starredRepositories.totalCount must be a number (was a string)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it('allows 0 for "user.starredRepositories.totalCount"', () => {
		const gitHubStatistics = gitHubStatisticsFactory.build({
			user: {
				starredRepositories: {
					totalCount: 0
				}
			}
		});

		const actualGitHubStatistics = parseGitHubStatistics(gitHubStatistics);
		const expectedGitHubStatistics = gitHubStatistics;

		expect(actualGitHubStatistics).toStrictEqual(expectedGitHubStatistics);
	});
});

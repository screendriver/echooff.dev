import { type } from "arktype";

export const gitHubStatisticsResponseSchema = type({
	user: {
		repositories: {
			totalCount: "number >= 0"
		},
		starredRepositories: {
			totalCount: "number >= 0"
		}
	}
}).onDeepUndeclaredKey("delete");

import { z } from 'zod';

export const gitHubStatisticsSchema = z.object({
    user: z.object({
        repositories: z.object({
            totalCount: z.number().nonnegative(),
        }),
        starredRepositories: z.object({
            totalCount: z.number().nonnegative(),
        }),
    }),
});

export type GitHubStatistics = z.infer<typeof gitHubStatisticsSchema>;

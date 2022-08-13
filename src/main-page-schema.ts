import { ImageDataLike } from 'gatsby-plugin-image';
import { Result } from 'true-myth';
import { z, ZodError } from 'zod';

const filledStringSchema = z.string().min(1);

export const mainPageDataSchema = z
    .object({
        allResumeDataJson: z
            .object({
                nodes: z
                    .array(
                        z
                            .object({
                                since: filledStringSchema,
                                showOnlyYear: z.boolean(),
                                industry: filledStringSchema,
                                jobTitle: filledStringSchema,
                                jobDescription: filledStringSchema,
                                company: z
                                    .object({
                                        name: filledStringSchema,
                                        url: z.string().url(),
                                    })
                                    .strict(),
                            })
                            .strict(),
                    )
                    .min(1),
            })
            .strict(),
        headerImage: z.unknown().transform((headerImage) => {
            return headerImage as ImageDataLike;
        }),
        headerImageSmall: z.unknown().transform((headerImage) => {
            return headerImage as ImageDataLike;
        }),
        site: z
            .object({
                siteMetadata: z
                    .object({
                        author: filledStringSchema,
                        jobTitle: filledStringSchema,
                        keywords: filledStringSchema,
                        favicon: filledStringSchema,
                    })
                    .strict(),
            })
            .strict(),
    })
    .strict();

export type MainPageData = z.infer<typeof mainPageDataSchema>;

function formatParseError(error: ZodError): string {
    return error.issues
        .map((issue) => {
            if (issue.path.length === 0) {
                return issue.message;
            }

            return `${issue.path.join('.')}: ${issue.message}`;
        })
        .join('\n');
}

export function parseMainPageData(mainPageData: unknown): Result<MainPageData, string> {
    const parseResult = mainPageDataSchema.safeParse(mainPageData);

    if (parseResult.success) {
        return Result.ok(parseResult.data);
    }

    return Result.err(formatParseError(parseResult.error));
}

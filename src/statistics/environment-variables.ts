import { z } from "zod";

export const gitHubBaseUrlSchema = z
    .string()
    .url()
    .transform((url) => {
        return new URL(url);
    });

export const gitHubLoginSchema = z.string().min(1);

export const gitHubApiTokenSchema = z.string().min(1);

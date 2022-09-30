import { z } from "zod";

export const gitHubBaseUrlSchema = z
    .string()
    .url()
    .transform((url) => {
        return new URL(url);
    });

export const gitHubLoginSchema = z.string().nonempty();

export const gitHubApiTokenSchema = z.string().nonempty();

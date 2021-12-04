import { z } from 'zod';

export const gitHubBaseUrlSchema = z
    .string()
    .url()
    .transform((url) => {
        return new URL(url);
    });

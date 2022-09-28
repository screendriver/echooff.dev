import { z } from 'zod';

export const contactFormUrlSchema = z.string().min(1);

export const contactStateMachineContextSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    message: z.string().min(1),
});

export type ContactStateMachineContext = z.infer<typeof contactStateMachineContextSchema>;

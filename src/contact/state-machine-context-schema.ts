import { z } from 'zod';

export const contactStateMachineContextSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    message: z.string().nonempty(),
});

export type ContactStateMachineContext = z.infer<typeof contactStateMachineContextSchema>;

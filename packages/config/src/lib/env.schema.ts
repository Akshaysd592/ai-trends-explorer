import {z} from "zod";


export const envSchema = z.object({
    NODE_ENV: z.enum(['development','test','production']),
    PORT: z.coerce.number().default(3000),

})

export type EnvSchema = z.infer<typeof envSchema>;
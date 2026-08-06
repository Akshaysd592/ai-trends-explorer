import {z} from "zod";


export const envSchema = z.object({
    NODE_ENV: z.enum(['development','test','production']),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
    GITHUB_TOKEN: z.string().optional(),
})

export type EnvSchema = z.infer<typeof envSchema>;
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
  GITHUB_API_URL: z.string().url(),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_DEFAULT_LIMIT: z.coerce.number().default(20),
  GITHUB_REQUEST_TIMEOUT: z.coerce.number().default(10000),
  HUGGINGFACE_API_URL: z.string().url().default('https://huggingface.co'),
  HUGGINGFACE_API_TOKEN: z.string().optional(),
  HUGGINGFACE_DEFAULT_LIMIT: z.coerce.number().default(20),
  HUGGINGFACE_REQUEST_TIMEOUT: z.coerce.number().default(10000),
});

export type EnvSchema = z.infer<typeof envSchema>;
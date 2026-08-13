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
  HUGGINGFACE_API_URL: z.string().url(),
  HUGGINGFACE_API_TOKEN: z.string().optional(),
  HUGGINGFACE_DEFAULT_LIMIT: z.coerce.number().default(20),
  HUGGINGFACE_REQUEST_TIMEOUT: z.coerce.number().default(10000),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().default('ai_trend_explorer'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_CACHE_TTL: z.coerce.number().default(300),
  REDIS_HISTORICAL_TTL_DAYS: z.coerce.number().default(30),
  KAFKA_BROKERS: z.string(),
  KAFKA_CLIENT_ID: z.string(),
  KAFKA_GROUP_ID: z.string(),
  KAFKA_TOPIC_ANALYSIS_REQUEST: z.string(),
  AI_PROVIDER: z.enum(['huggingface', 'openai', 'gemini']),
  AI_API_URL: z.string().url(),
  AI_MODEL: z.string(),
  AI_API_TOKEN: z.string().optional(),
  AI_REQUEST_TIMEOUT: z.coerce.number(),
});

export type EnvSchema = z.infer<typeof envSchema>;

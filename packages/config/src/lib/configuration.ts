import { envSchema } from './env.schema.js';

export function configuration() {
  const env = envSchema.parse(process.env);

  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
    },
    logger: {
      level: env.LOG_LEVEL,
      pretty: env.NODE_ENV !== 'production',
    },
    github: {
      apiUrl: env.GITHUB_API_URL,
      token: env.GITHUB_TOKEN,
      defaultLimit: env.GITHUB_DEFAULT_LIMIT,
      timeout: env.GITHUB_REQUEST_TIMEOUT,
    },
    huggingface: {
      apiUrl: env.HUGGINGFACE_API_URL,
      token: env.HUGGINGFACE_API_TOKEN,
      defaultLimit: env.HUGGINGFACE_DEFAULT_LIMIT,
      timeout: env.HUGGINGFACE_REQUEST_TIMEOUT,
    },
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      cacheTtl: env.REDIS_CACHE_TTL,
    },
    trends: {
      historicalTtlDays: env.REDIS_HISTORICAL_TTL_DAYS,
    },
    kafka: {
      brokers: env.KAFKA_BROKERS,
      clientId: env.KAFKA_CLIENT_ID,
      groupId: env.KAFKA_GROUP_ID,
      topicAnalysisRequest: env.KAFKA_TOPIC_ANALYSIS_REQUEST,
    },
    ai: {
      provider: env.AI_PROVIDER,
      apiUrl: env.AI_API_URL,
      model: env.AI_MODEL,
      apiToken: env.AI_API_TOKEN,
      timeout: env.AI_REQUEST_TIMEOUT,
    },
  };
}

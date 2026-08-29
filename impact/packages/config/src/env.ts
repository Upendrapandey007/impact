import { z } from 'zod';

// ─── Database ───────────────────────────────────────────────────────────────

export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().int().positive().default(20),
});

// ─── Redis ───────────────────────────────────────────────────────────────────

export const redisEnvSchema = z.object({
  REDIS_URL: z.string().url(),
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authEnvSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  WORKOS_API_KEY: z.string().optional(),
  WORKOS_CLIENT_ID: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

// ─── AWS / Storage ───────────────────────────────────────────────────────────

export const storageEnvSchema = z.object({
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_POLICIES: z.string().default('impact-policies-dev'),
  S3_BUCKET_DOCUMENTS: z.string().default('impact-documents-dev'),
  S3_BUCKET_EXPORTS: z.string().default('impact-exports-dev'),
});

// ─── AI ──────────────────────────────────────────────────────────────────────

export const aiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  OPENAI_MAX_TOKENS: z.coerce.number().int().positive().default(2000),
  AI_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.75),
});

// ─── App ─────────────────────────────────────────────────────────────────────

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_URL: z.string().url().default('http://localhost:3001'),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  SENTRY_DSN: z.string().url().optional(),
});

// ─── Combined API env ────────────────────────────────────────────────────────

export const apiEnvSchema = appEnvSchema
  .merge(databaseEnvSchema)
  .merge(redisEnvSchema)
  .merge(authEnvSchema)
  .merge(storageEnvSchema)
  .merge(aiEnvSchema);

export type ApiEnv = z.infer<typeof apiEnvSchema>;

// ─── Combined Web env ─────────────────────────────────────────────────────────

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Impact'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  WORKOS_API_KEY: z.string().optional(),
  WORKOS_CLIENT_ID: z.string().optional(),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validates environment variables against a schema.
 * Throws a descriptive error in development, exits gracefully in production.
 */
export function validateEnv<T extends z.ZodType>(
  schema: T,
  env: NodeJS.ProcessEnv = process.env,
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    const message = `Invalid environment variables:\n${formatted}`;

    if (process.env['NODE_ENV'] === 'production') {
      console.error(message);
      process.exit(1);
    } else {
      throw new Error(message);
    }
  }

  return result.data as z.infer<T>;
}

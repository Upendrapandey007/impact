import { describe, expect, it } from 'vitest';
import { apiEnvSchema, webEnvSchema, validateEnv } from '../env';

describe('@impact/config Environment Validation (Unit Tests)', () => {
  describe('apiEnvSchema', () => {
    it('validates a correct API environment config', () => {
      const validEnv = {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/impact',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'super-secret-key-at-least-32-characters-long',
        NODE_ENV: 'development',
      };

      const parsed = validateEnv(apiEnvSchema, validEnv as NodeJS.ProcessEnv);
      expect(parsed.DATABASE_MAX_CONNECTIONS).toBe(20); // Default applied
      expect(parsed.JWT_SECRET).toBe('super-secret-key-at-least-32-characters-long');
      expect(parsed.OPENAI_MODEL).toBe('gpt-4o'); // Default applied
    });

    it('throws error when required DATABASE_URL is missing', () => {
      const invalidEnv = {
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'super-secret-key-at-least-32-characters-long',
      };

      expect(() => validateEnv(apiEnvSchema, invalidEnv as NodeJS.ProcessEnv)).toThrowError(
        /DATABASE_URL/,
      );
    });

    it('throws error when JWT_SECRET is less than 32 characters', () => {
      const invalidEnv = {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/impact',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'short-secret',
      };

      expect(() => validateEnv(apiEnvSchema, invalidEnv as NodeJS.ProcessEnv)).toThrowError(
        /JWT_SECRET/,
      );
    });
  });

  describe('webEnvSchema', () => {
    it('validates a correct Web environment config with defaults', () => {
      const parsed = validateEnv(webEnvSchema, {});
      expect(parsed.NEXT_PUBLIC_API_URL).toBe('http://localhost:3001');
      expect(parsed.NEXT_PUBLIC_APP_NAME).toBe('Impact');
    });

    it('throws error if NEXT_PUBLIC_API_URL is not a valid URL', () => {
      const invalidEnv = {
        NEXT_PUBLIC_API_URL: 'not-a-url',
      };

      expect(() => validateEnv(webEnvSchema, invalidEnv as NodeJS.ProcessEnv)).toThrowError(
        /NEXT_PUBLIC_API_URL/,
      );
    });
  });
});

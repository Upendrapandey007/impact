import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from './schema/index';

export type Database = PostgresJsDatabase<typeof schema>;

let _db: Database | null = null;

export function createDatabase(connectionString: string): Database {
  const client = postgres(connectionString, {
    max: Number(process.env['DATABASE_MAX_CONNECTIONS'] ?? 20),
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, {
    schema,
    logger: process.env['NODE_ENV'] === 'development',
  });
}

/**
 * Singleton accessor — use in application code.
 * Call initDb() once at app startup.
 */
export function getDb(): Database {
  if (!_db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return _db;
}

export function initDb(connectionString: string): Database {
  _db = createDatabase(connectionString);
  return _db;
}

// Re-export schema and types
export * from './schema/index';
export { schema };

import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Lazy initialization - only connect when db is actually used
let _client: any = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured. Please set it in .env.local');
    }

    try {
      if (!_client) {
        // Use require to avoid ES module import type issues
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const postgres = require('postgres');
        _client = postgres(connectionString, { 
          prepare: false,
          max: 1,
          idle_timeout: 20,
          connect_timeout: 10,
        });
      }
      
      _db = drizzle(_client, { schema });
    } catch (error: any) {
      console.error('Database connection error:', error.message);
      throw error;
    }
  }
  
  return _db;
}

// Create a proxy that lazily initializes the db on first access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = getDb();
    const value = (db as any)[prop];
    // If it's a function, bind it to db so 'this' works correctly
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  }
}) as ReturnType<typeof drizzle>;


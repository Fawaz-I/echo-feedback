#!/usr/bin/env bun

/**
 * Database migration script
 * Template for running database migrations
 */

import { Database } from 'bun:sqlite';
import { resolve } from 'path';

const DB_PATH = process.env.DATABASE_URL || './data.db';

console.log('🔄 Running database migrations...');
console.log(`📍 Database location: ${DB_PATH}`);

const db = new Database(resolve(DB_PATH));

// Example migration: Add a new column
// Uncomment and modify as needed for actual migrations

/*
db.exec(`
  ALTER TABLE feedback ADD COLUMN language TEXT;
`);
console.log('✅ Added language column to feedback table');
*/

/*
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback_attachments (
    id TEXT PRIMARY KEY,
    feedback_id TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (feedback_id) REFERENCES feedback(id)
  );
`);
console.log('✅ Created feedback_attachments table');
*/

console.log('✅ Migrations complete!');
console.log('💡 Edit scripts/migrate.ts to add your migrations');

db.close();

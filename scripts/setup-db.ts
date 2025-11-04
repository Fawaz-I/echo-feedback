#!/usr/bin/env bun

/**
 * Database setup script
 * Initializes the database schema and creates tables
 */

import { Database } from 'bun:sqlite';
import { resolve } from 'path';

const DB_PATH = process.env.DATABASE_URL || './data.db';

console.log('🗄️  Setting up database...');
console.log(`📍 Database location: ${DB_PATH}`);

const db = new Database(resolve(DB_PATH), { create: true });

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS apps (
    app_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    webhook_url TEXT,
    webhook_secret TEXT,
    created_at TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    source TEXT NOT NULL,
    duration_ms INTEGER,
    audio_url TEXT NOT NULL,
    transcript TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,
    sentiment TEXT NOT NULL,
    priority TEXT NOT NULL,
    metadata TEXT,
    webhook_status TEXT,
    FOREIGN KEY (app_id) REFERENCES apps(app_id)
  );
`);

// Create indexes for common queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_feedback_app_id ON feedback(app_id);
  CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
  CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
  CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON feedback(sentiment);
  CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
`);

console.log('✅ Database setup complete!');
console.log('📊 Tables created: apps, feedback');
console.log('🔍 Indexes created for optimized queries');

db.close();

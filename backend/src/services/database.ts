import { Database } from 'bun:sqlite';
import type { App, FeedbackItem } from '@echo-feedback/types';

const DB_PATH = process.env.DATABASE_URL || './data.db';

let db: Database;

function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH);
    initializeSchema();
    console.log(`📊 Database initialized: ${DB_PATH}`);
  }
  return db;
}

function initializeSchema() {
  const db = getDb();

  // Create apps table
  db.run(`
    CREATE TABLE IF NOT EXISTS apps (
      app_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      webhook_url TEXT,
      webhook_secret TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create feedback_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback_items (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT NOT NULL DEFAULT 'web',
      duration_ms INTEGER,
      audio_url TEXT NOT NULL,
      transcript TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      priority TEXT NOT NULL,
      summary_tts_url TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      webhook_status TEXT NOT NULL DEFAULT 'none',
      FOREIGN KEY (app_id) REFERENCES apps(app_id)
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_feedback_app_id ON feedback_items(app_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_items(created_at)');
}

/**
 * Get app configuration by app_id
 */
export function getApp(appId: string): App | null {
  const db = getDb();
  const query = db.query('SELECT * FROM apps WHERE app_id = ?');
  const result = query.get(appId) as App | null;
  
  if (result) {
    result.created_at = new Date(result.created_at as unknown as string);
  }
  
  return result;
}

/**
 * Create or update an app
 */
export function upsertApp(app: Omit<App, 'created_at'>): App {
  const db = getDb();
  
  const existing = getApp(app.app_id);
  
  if (existing) {
    // Update existing app
    db.run(
      `UPDATE apps SET name = ?, webhook_url = ?, webhook_secret = ? WHERE app_id = ?`,
      [app.name, app.webhook_url || null, app.webhook_secret || null, app.app_id]
    );
  } else {
    // Insert new app
    db.run(
      `INSERT INTO apps (app_id, name, webhook_url, webhook_secret) VALUES (?, ?, ?, ?)`,
      [app.app_id, app.name, app.webhook_url || null, app.webhook_secret || null]
    );
  }
  
  return getApp(app.app_id)!;
}

/**
 * Save feedback item to database
 */
export function saveFeedback(feedback: Omit<FeedbackItem, 'created_at'>): FeedbackItem {
  const db = getDb();
  
  db.run(
    `INSERT INTO feedback_items (
      id, app_id, source, duration_ms, audio_url, transcript, summary,
      category, sentiment, priority, summary_tts_url, metadata, webhook_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      feedback.id,
      feedback.app_id,
      feedback.source || 'web',
      feedback.duration_ms || 0,
      feedback.audio_url,
      feedback.transcript,
      feedback.summary,
      feedback.category,
      feedback.sentiment,
      feedback.priority,
      feedback.summary_tts_url || null,
      JSON.stringify(feedback.metadata || {}),
      feedback.webhook_status || 'none',
    ]
  );
  
  return getFeedback(feedback.id)!;
}

/**
 * Get feedback item by ID
 */
export function getFeedback(id: string): FeedbackItem | null {
  const db = getDb();
  const query = db.query('SELECT * FROM feedback_items WHERE id = ?');
  const result = query.get(id) as unknown as Record<string, unknown> | undefined;
  
  if (!result) return null;
  
  return {
    ...result,
    created_at: new Date(result.created_at as string),
    metadata: JSON.parse(result.metadata as string),
  } as FeedbackItem;
}

/**
 * Update webhook status for feedback item
 */
export function updateWebhookStatus(
  id: string,
  status: 'sent' | 'failed' | 'none'
): void {
  const db = getDb();
  db.run('UPDATE feedback_items SET webhook_status = ? WHERE id = ?', [status, id]);
}

/**
 * Get all feedback items for an app
 */
export function getFeedbackByApp(
  appId: string,
  limit = 50,
  offset = 0
): FeedbackItem[] {
  const db = getDb();
  const query = db.query(
    'SELECT * FROM feedback_items WHERE app_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  );
  const results = query.all(appId, limit, offset) as unknown as Record<string, unknown>[];
  
  return results.map((r) => ({
    ...r,
    created_at: new Date(r.created_at as string),
    metadata: JSON.parse(r.metadata as string),
  })) as FeedbackItem[];
}

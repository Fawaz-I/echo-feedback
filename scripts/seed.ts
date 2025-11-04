#!/usr/bin/env bun

/**
 * Database seeding script
 * Populates the database with sample data for testing
 */

import { Database } from 'bun:sqlite';
import { resolve } from 'path';

const DB_PATH = process.env.DATABASE_URL || './data.db';

console.log('🌱 Seeding database with sample data...');
console.log(`📍 Database location: ${DB_PATH}`);

const db = new Database(resolve(DB_PATH));

// Seed demo app
const demoApp = {
  app_id: 'demo_app',
  name: 'Demo Application',
  webhook_url: null,
  webhook_secret: null,
  created_at: new Date().toISOString(),
};

db.run(
  `INSERT OR REPLACE INTO apps (app_id, name, webhook_url, webhook_secret, created_at)
   VALUES (?, ?, ?, ?, ?)`,
  [demoApp.app_id, demoApp.name, demoApp.webhook_url, demoApp.webhook_secret, demoApp.created_at]
);

console.log('✅ Created demo app:', demoApp.app_id);

// Seed sample feedback
const sampleFeedback = [
  {
    id: 'sample-1',
    app_id: 'demo_app',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    source: 'web',
    duration_ms: 5000,
    audio_url: '/uploads/sample-1.webm',
    transcript: 'The new dashboard is really intuitive and easy to use. Great work!',
    summary: 'Positive feedback on new dashboard design',
    category: 'praise',
    sentiment: 'positive',
    priority: 'low',
    metadata: '{"pageUrl":"https://example.com/dashboard","locale":"en-US"}',
    webhook_status: 'none',
  },
  {
    id: 'sample-2',
    app_id: 'demo_app',
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    source: 'web',
    duration_ms: 8000,
    audio_url: '/uploads/sample-2.webm',
    transcript: 'I found a bug where the submit button does not work on mobile devices.',
    summary: 'Submit button not working on mobile',
    category: 'bug',
    sentiment: 'negative',
    priority: 'high',
    metadata: '{"pageUrl":"https://example.com/form","device":"mobile"}',
    webhook_status: 'none',
  },
  {
    id: 'sample-3',
    app_id: 'demo_app',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    source: 'web',
    duration_ms: 6500,
    audio_url: '/uploads/sample-3.webm',
    transcript: 'It would be great to have dark mode support for the application.',
    summary: 'Feature request: dark mode support',
    category: 'feature',
    sentiment: 'neutral',
    priority: 'medium',
    metadata: '{"pageUrl":"https://example.com/settings"}',
    webhook_status: 'none',
  },
];

for (const feedback of sampleFeedback) {
  db.run(
    `INSERT OR REPLACE INTO feedback
     (id, app_id, created_at, source, duration_ms, audio_url, transcript, summary,
      category, sentiment, priority, metadata, webhook_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      feedback.id,
      feedback.app_id,
      feedback.created_at,
      feedback.source,
      feedback.duration_ms,
      feedback.audio_url,
      feedback.transcript,
      feedback.summary,
      feedback.category,
      feedback.sentiment,
      feedback.priority,
      feedback.metadata,
      feedback.webhook_status,
    ]
  );
  console.log(`✅ Created sample feedback: ${feedback.id} (${feedback.category})`);
}

console.log('🎉 Database seeded successfully!');
console.log(`📊 Added ${sampleFeedback.length} sample feedback items`);

db.close();

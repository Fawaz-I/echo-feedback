/**
 * Echo Feedback API - Main application entry point
 */

import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { getEnvConfig, logConfigStatus } from './config/env';
import { getCorsMiddleware } from './config/cors';
import { DB_INIT_APP_ID } from './config/constants';
import healthRoutes from './routes/health';
import feedbackRoutes from './routes/feedback';
import appsRoutes from './routes/apps';

const app = new Hono();

// Load and validate configuration
const config = getEnvConfig();
logConfigStatus(config);

// Initialize database on startup
import('./services/database').then(({ getApp }) => {
  // Trigger schema initialization
  getApp(DB_INIT_APP_ID);
});

// Enable CORS for frontend development
app.use('/*', getCorsMiddleware());

// Serve uploaded audio files
app.use('/uploads/*', serveStatic({ root: './' }));

// Mount route handlers
app.route('/', healthRoutes);
app.route('/', feedbackRoutes);
app.route('/', appsRoutes);

// 404 handler - must be last
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

const server = Bun.serve({
  port: config.port,
  fetch: app.fetch,
  hostname: '0.0.0.0', // Bind to all interfaces, not just localhost
});

console.log(`🎙️  Echo Feedback API running on port ${server.port}`);

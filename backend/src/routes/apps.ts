/**
 * App management routes
 */

import { Hono } from 'hono';
import type { FeedbackItem } from '@echo-feedback/types';
import { getApp, upsertApp } from '../services/database';
import { sendWebhook } from '../services/webhooks';

const apps = new Hono();

// Get app by ID
apps.get('/api/apps/:appId', async (c) => {
  const appId = c.req.param('appId');
  const app = getApp(appId);

  if (!app) {
    return c.json({ error: 'App not found' }, 404);
  }

  // Don't expose webhook_secret
  return c.json({
    app_id: app.app_id,
    name: app.name,
    has_webhook: !!app.webhook_url,
    created_at: app.created_at,
  });
});

// Test webhook endpoint
apps.post('/api/apps/:appId/test-webhook', async (c) => {
  const appId = c.req.param('appId');
  const appConfig = getApp(appId);

  if (!appConfig) {
    return c.json({ error: 'App not found' }, 404);
  }

  if (!appConfig.webhook_url) {
    return c.json({ error: 'No webhook configured for this app' }, 400);
  }

  // Send test webhook
  const testFeedback: Partial<FeedbackItem> = {
    id: 'test-' + crypto.randomUUID(),
    app_id: appId,
    created_at: new Date(),
    transcript: 'This is a test feedback message.',
    summary: 'Test webhook delivery',
    category: 'other',
    sentiment: 'neutral',
    priority: 'low',
    audio_url: '/uploads/test.webm',
    metadata: {},  // Empty metadata for test
  };

  const result = await sendWebhook(testFeedback, {
    url: appConfig.webhook_url,
    secret: appConfig.webhook_secret,
  });

  return c.json({
    success: result.success,
    error: result.error,
    message: result.success ? 'Test webhook sent successfully' : 'Test webhook failed',
  });
});

// Create or update app
apps.post('/api/apps', async (c) => {
  try {
    const body = await c.req.json();
    const { app_id, name, webhook_url, webhook_secret } = body;

    if (!app_id || !name) {
      return c.json({ error: 'Missing required fields: app_id, name' }, 400);
    }

    // Validate webhook URL if provided
    if (webhook_url) {
      try {
        new URL(webhook_url);
      } catch {
        return c.json({ error: 'Invalid webhook URL format' }, 400);
      }
    }

    const appData = { app_id, name, webhook_url, webhook_secret };
    const saved = upsertApp(appData);

    return c.json({
      app_id: saved.app_id,
      name: saved.name,
      has_webhook: !!saved.webhook_url,
      created_at: saved.created_at,
    });
  } catch (error) {
    console.error('Error creating/updating app:', error);
    return c.json({ error: 'Failed to create/update app' }, 500);
  }
});

export default apps;

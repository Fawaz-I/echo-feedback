import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { classifyFeedback, transcribeAudio as transcribeWithOpenAI } from './services/openai';
import { transcribeAudio as transcribeWithElevenLabs } from './services/elevenlabs';
import { saveAudioFile } from './services/storage';
import { sendWebhook } from './services/webhook';
import { getApp, saveFeedback, updateWebhookStatus } from './services/database';
import type { FeedbackItem } from '@echo-feedback/types';

const app = new Hono();

// Initialize database on startup
import('./services/database').then(({ getApp }) => {
  // Trigger schema initialization
  getApp('_init');
});

// Determine which transcription service to use
const USE_ELEVENLABS = process.env.ELEVEN_API_KEY ? true : false;

if (USE_ELEVENLABS) {
  console.log('🎙️  Using ElevenLabs for transcription');
} else {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when not using ElevenLabs. Please set it in your .env file.');
  }
  console.log('🎙️  Using OpenAI Whisper for transcription');
}

// Enable CORS for frontend development
app.use('/*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Serve uploaded audio files
app.use('/uploads/*', serveStatic({ root: './' }));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feedback submission endpoint
app.post('/api/feedback', async (c) => {
  try {
    const body = await c.req.parseBody();
    const appId = body.appId as string;
    const audio = body.audio as File;
    const metadata = body.metadata ? JSON.parse(body.metadata as string) : {};

    if (!appId || !audio) {
      return c.json({ error: 'Missing required fields: appId, audio' }, 400);
    }

    // Validate file size (5 MB max)
    if (audio.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Audio file too large. Max 5 MB.' }, 400);
    }

    const feedbackId = crypto.randomUUID();

    // Save audio file
    const audioFilename = `${feedbackId}.webm`;
    const audioUrl = await saveAudioFile(audio, audioFilename);

    // Transcribe audio using configured service
    const transcript = USE_ELEVENLABS 
      ? await transcribeWithElevenLabs(audio)
      : await transcribeWithOpenAI(audio);

    // Classify feedback using OpenAI
    const classification = await classifyFeedback(transcript);

    // Save feedback to database
    const feedbackItem = saveFeedback({
      id: feedbackId,
      app_id: appId,
      source: 'web',
      duration_ms: 0, // Could calculate from audio file
      audio_url: audioUrl,
      transcript,
      summary: classification.summary,
      category: classification.category,
      sentiment: classification.sentiment,
      priority: classification.priority,
      metadata,
      webhook_status: 'none',
    });

    // Send webhook if configured (async, don't wait)
    const appConfig = getApp(appId);
    if (appConfig?.webhook_url) {
      sendWebhook(feedbackItem, {
        url: appConfig.webhook_url,
        secret: appConfig.webhook_secret,
      })
        .then((result) => {
          updateWebhookStatus(feedbackId, result.success ? 'sent' : 'failed');
          if (!result.success) {
            console.error(`Webhook failed for ${feedbackId}:`, result.error);
          }
        })
        .catch((error) => {
          console.error(`Webhook error for ${feedbackId}:`, error);
          updateWebhookStatus(feedbackId, 'failed');
        });
    }

    return c.json({
      id: feedbackId,
      transcript,
      summary: classification.summary,
      category: classification.category,
      sentiment: classification.sentiment,
      audio_url: audioUrl,
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return c.json({ error: 'Failed to process feedback' }, 500);
  }
});

// App management endpoints
app.get('/api/apps/:appId', async (c) => {
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
app.post('/api/apps/:appId/test-webhook', async (c) => {
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

app.post('/api/apps', async (c) => {
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
    const { upsertApp } = await import('./services/database');
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

const port = process.env.PORT || 3001;

console.log(`🎙️  Echo Feedback API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
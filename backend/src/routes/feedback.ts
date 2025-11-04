/**
 * Feedback submission routes
 */

import { Hono } from 'hono';
import { classifyFeedback, transcribeAudio as transcribeWithOpenAI } from '../services/openai';
import { transcribeAudio as transcribeWithElevenLabs } from '../services/elevenlabs';
import { saveAudioFile } from '../services/storage';
import { sendWebhook } from '../services/webhooks';
import { getApp, saveFeedback, updateWebhookStatus } from '../services/database';
import { getEnvConfig } from '../config/env';
import { MAX_AUDIO_FILE_SIZE, MAX_AUDIO_FILE_SIZE_MB } from '../config/constants';

const feedback = new Hono();
const config = getEnvConfig();

feedback.post('/api/feedback', async (c) => {
  try {
    const body = await c.req.parseBody();
    const appId = body.appId as string;
    const audio = body.audio as File;
    const metadata = body.metadata ? JSON.parse(body.metadata as string) : {};

    if (!appId || !audio) {
      return c.json({ error: 'Missing required fields: appId, audio' }, 400);
    }

    // Validate file size
    if (audio.size > MAX_AUDIO_FILE_SIZE) {
      return c.json({ error: `Audio file too large. Max ${MAX_AUDIO_FILE_SIZE_MB}MB.` }, 400);
    }

    const feedbackId = crypto.randomUUID();

    // Save audio file
    const audioFilename = `${feedbackId}.webm`;
    const audioUrl = await saveAudioFile(audio, audioFilename);

    // Transcribe audio using configured service
    const transcript = config.useElevenLabs
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

export default feedback;

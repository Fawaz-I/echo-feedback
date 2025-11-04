/**
 * Health check routes
 */

import { Hono } from 'hono';
import { getEnvConfig } from '../config/env';

const health = new Hono();
const config = getEnvConfig();

health.get('/health', (c) => {
  return c.json({
    status: 'ok',
    api: 'Echo Feedback API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    transcription_service: config.useElevenLabs ? 'ElevenLabs' : 'OpenAI Whisper',
  });
});

export default health;

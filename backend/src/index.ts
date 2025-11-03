import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { classifyFeedback } from './services/openai';
import { transcribeAudio } from './services/elevenlabs';
import { saveAudioFile } from './services/storage';

const app = new Hono();

// Enable CORS for frontend development
app.use('/*', cors());

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

    // Transcribe audio using ElevenLabs STT
    const transcript = await transcribeAudio(audio);

    // Classify feedback using OpenAI
    const classification = await classifyFeedback(transcript);

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

// Webhook endpoint (placeholder)
app.post('/api/webhook', async (c) => {
  return c.json({ message: 'Webhook endpoint - coming soon' }, 501);
});

const port = process.env.PORT || 3001;

console.log(`🎙️  Echo Feedback API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
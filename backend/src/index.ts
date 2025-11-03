import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for frontend development
app.use('/*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feedback submission endpoint (placeholder)
app.post('/api/feedback', async (c) => {
  return c.json({ 
    message: 'Feedback endpoint - coming soon',
    id: crypto.randomUUID()
  }, 501);
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
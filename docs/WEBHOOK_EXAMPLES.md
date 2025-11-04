# Webhook Integration Examples

Complete examples for integrating Echo Feedback webhooks into your application.

## Table of Contents

- [Quick Start](#quick-start)
- [Testing Webhooks](#testing-webhooks)
- [Server Handlers](#server-handlers)
  - [Bun + Hono](#bun--hono)
  - [Node.js + Express](#nodejs--express)
  - [Next.js API Routes](#nextjs-api-routes)
  - [Deno + Oak](#deno--oak)
- [HMAC Signature Verification](#hmac-signature-verification)
- [Retry Handling](#retry-handling)
- [Platform-Specific Examples](#platform-specific-examples)
  - [Slack](#slack)
  - [Discord](#discord)
  - [Linear](#linear)
  - [Custom Database](#custom-database)

---

## Quick Start

### 1. Register Your App with Webhook

```bash
curl -X POST http://localhost:3001/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "my_app_123",
    "name": "My Application",
    "webhook_url": "https://your-server.com/webhooks/echo-feedback",
    "webhook_secret": "whsec_your_secret_key_here"
  }'
```

### 2. Test Webhook Delivery

```bash
curl -X POST http://localhost:3001/api/apps/my_app_123/test-webhook
```

### 3. Verify It Works

Check your server logs or webhook endpoint for the test payload.

---

## Testing Webhooks

### Using webhook.site

[webhook.site](https://webhook.site) provides instant webhook URLs for testing:

```bash
# 1. Visit https://webhook.site and copy your unique URL
# 2. Register it:
curl -X POST http://localhost:3001/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test_app",
    "name": "Test App",
    "webhook_url": "https://webhook.site/your-unique-id"
  }'

# 3. Submit test feedback and watch it arrive in real-time
```

### Using ngrok for Local Development

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL
curl -X POST http://localhost:3001/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "local_test",
    "name": "Local Test",
    "webhook_url": "https://abc123.ngrok.io/webhooks/echo"
  }'
```

---

## Server Handlers

### Bun + Hono

```typescript
import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';

const app = new Hono();

// Webhook handler
app.post('/webhooks/echo-feedback', async (c) => {
  const signature = c.req.header('x-echo-signature');
  const timestamp = c.req.header('x-echo-timestamp');
  const body = await c.req.text();

  // Verify signature
  const secret = process.env.WEBHOOK_SECRET!;
  if (signature && !verifySignature(body, signature, secret)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  // Verify timestamp (prevent replay attacks)
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age > 5 * 60 * 1000) { // 5 minutes
      return c.json({ error: 'Request too old' }, 401);
    }
  }

  const feedback = JSON.parse(body);

  // Process feedback
  console.log('Received feedback:', {
    id: feedback.id,
    category: feedback.category,
    summary: feedback.summary,
  });

  // Store in your database
  await db.feedback.create({
    data: {
      echoId: feedback.id,
      appId: feedback.appId,
      transcript: feedback.transcript,
      summary: feedback.summary,
      category: feedback.category,
      sentiment: feedback.sentiment,
      priority: feedback.priority,
      audioUrl: feedback.audioUrl,
      metadata: feedback.metadata,
      createdAt: new Date(feedback.timestamp),
    },
  });

  return c.json({ received: true });
});

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = `sha256=${createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export default {
  port: 3000,
  fetch: app.fetch,
};
```

### Node.js + Express

```javascript
import express from 'express';
import crypto from 'crypto';

const app = express();

// IMPORTANT: Use raw body for signature verification
app.post(
  '/webhooks/echo-feedback',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-echo-signature'];
    const timestamp = req.headers['x-echo-timestamp'];
    const rawBody = req.body.toString('utf8');

    // Verify signature
    const secret = process.env.WEBHOOK_SECRET;
    if (signature && !verifySignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Verify timestamp
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age > 5 * 60 * 1000) {
        return res.status(401).json({ error: 'Request too old' });
      }
    }

    const feedback = JSON.parse(rawBody);

    // Process feedback
    try {
      await processFeedback(feedback);
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing feedback:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }
);

function verifySignature(payload, signature, secret) {
  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

async function processFeedback(feedback) {
  // Your processing logic
  console.log('Processing:', feedback.summary);
  
  // Example: Send to your database
  await db.query(
    'INSERT INTO feedback (echo_id, summary, category, sentiment) VALUES (?, ?, ?, ?)',
    [feedback.id, feedback.summary, feedback.category, feedback.sentiment]
  );
}

app.listen(3000, () => console.log('Webhook server running on :3000'));
```

### Next.js API Routes

```typescript
// pages/api/webhooks/echo-feedback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createHmac, timingSafeEqual } from 'crypto';
import { buffer } from 'micro';

// Disable body parsing, need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-echo-signature'] as string;
  const timestamp = req.headers['x-echo-timestamp'] as string;
  
  // Get raw body
  const rawBody = await buffer(req);
  const bodyString = rawBody.toString('utf8');

  // Verify signature
  const secret = process.env.WEBHOOK_SECRET!;
  if (signature && !verifySignature(bodyString, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Verify timestamp
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age > 5 * 60 * 1000) {
      return res.status(401).json({ error: 'Request too old' });
    }
  }

  const feedback = JSON.parse(bodyString);

  try {
    // Process feedback
    await processFeedback(feedback);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
}

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = `sha256=${createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

async function processFeedback(feedback: any) {
  // Your logic here
  console.log('Received feedback:', feedback.summary);
}
```

### Deno + Oak

```typescript
import { Application, Router } from 'https://deno.land/x/oak/mod.ts';

const router = new Router();

router.post('/webhooks/echo-feedback', async (ctx) => {
  const signature = ctx.request.headers.get('x-echo-signature');
  const timestamp = ctx.request.headers.get('x-echo-timestamp');
  
  const body = await ctx.request.body.text();

  // Verify signature
  const secret = Deno.env.get('WEBHOOK_SECRET')!;
  if (signature && !(await verifySignature(body, signature, secret))) {
    ctx.response.status = 401;
    ctx.response.body = { error: 'Invalid signature' };
    return;
  }

  // Verify timestamp
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age > 5 * 60 * 1000) {
      ctx.response.status = 401;
      ctx.response.body = { error: 'Request too old' };
      return;
    }
  }

  const feedback = JSON.parse(body);

  // Process feedback
  console.log('Feedback received:', feedback.summary);

  ctx.response.body = { received: true };
});

async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const expected = `sha256=${Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  return signature === expected;
}

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });
```

---

## HMAC Signature Verification

### Complete Example with Timing Attack Protection

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

interface WebhookRequest {
  headers: Record<string, string>;
  body: string;
}

function verifyWebhookSignature(
  req: WebhookRequest,
  secret: string
): { valid: boolean; error?: string } {
  const signature = req.headers['x-echo-signature'];
  const timestamp = req.headers['x-echo-timestamp'];

  // Check signature exists
  if (!signature) {
    return { valid: false, error: 'Missing signature' };
  }

  // Check timestamp exists
  if (!timestamp) {
    return { valid: false, error: 'Missing timestamp' };
  }

  // Verify timestamp freshness (prevent replay attacks)
  const age = Date.now() - parseInt(timestamp);
  const MAX_AGE = 5 * 60 * 1000; // 5 minutes
  
  if (age > MAX_AGE) {
    return { valid: false, error: 'Request too old' };
  }

  if (age < 0) {
    return { valid: false, error: 'Request from future' };
  }

  // Compute expected signature
  const expectedSignature = `sha256=${createHmac('sha256', secret)
    .update(req.body)
    .digest('hex')}`;

  // Timing-safe comparison
  try {
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Signature comparison failed' };
  }
}

// Usage
const result = verifyWebhookSignature(
  {
    headers: {
      'x-echo-signature': req.headers['x-echo-signature'],
      'x-echo-timestamp': req.headers['x-echo-timestamp'],
    },
    body: rawBody,
  },
  process.env.WEBHOOK_SECRET!
);

if (!result.valid) {
  console.error('Webhook verification failed:', result.error);
  return res.status(401).json({ error: result.error });
}
```

### Python Example

```python
import hmac
import hashlib
import time
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = 'your-secret-key'

@app.route('/webhooks/echo-feedback', methods=['POST'])
def webhook():
    signature = request.headers.get('x-echo-signature')
    timestamp = request.headers.get('x-echo-timestamp')
    body = request.get_data()
    
    # Verify signature
    if not verify_signature(body, signature, WEBHOOK_SECRET):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Verify timestamp
    if timestamp:
        age = time.time() * 1000 - int(timestamp)
        if age > 5 * 60 * 1000:  # 5 minutes
            return jsonify({'error': 'Request too old'}), 401
    
    feedback = request.get_json()
    
    # Process feedback
    print(f"Received: {feedback['summary']}")
    
    return jsonify({'received': True})

def verify_signature(payload, signature, secret):
    expected = 'sha256=' + hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)

if __name__ == '__main__':
    app.run(port=3000)
```

---

## Retry Handling

### Exponential Backoff with Jitter

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

async function deliverWebhookWithRetry(
  url: string,
  payload: object,
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 60000,
  }
): Promise<{ success: boolean; error?: string }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✅ Webhook delivered on attempt ${attempt + 1}`);
        return { success: true };
      }

      // Don't retry on 4xx errors (except 429 rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return {
          success: false,
          error: `Client error: ${response.status}`,
        };
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < config.maxRetries) {
        // Exponential backoff with jitter
        const exponentialDelay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        const jitter = Math.random() * 1000;
        const delay = exponentialDelay + jitter;

        console.log(
          `⚠️  Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
  };
}
```

### Queue-Based Retry with Bull

```typescript
import Queue from 'bull';
import Redis from 'ioredis';

const webhookQueue = new Queue('webhooks', {
  redis: process.env.REDIS_URL,
});

// Configure retry strategy
webhookQueue.process(async (job) => {
  const { url, payload, signature, timestamp } = job.data;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Echo-Signature': signature,
      'X-Echo-Timestamp': timestamp,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return { delivered: true };
});

// Add webhook to queue
await webhookQueue.add(
  {
    url: webhookUrl,
    payload: feedbackData,
    signature: generateSignature(payloadString, secret),
    timestamp: Date.now().toString(),
  },
  {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  }
);
```

---

## Platform-Specific Examples

### Slack

```typescript
// The payload is automatically formatted for Slack
// Just process and optionally add custom logic

app.post('/webhooks/echo-feedback', async (c) => {
  const feedback = await c.req.json();

  // Echo Feedback already sends Slack-formatted blocks
  // You can forward it as-is or add custom fields

  // Example: Add thread reply functionality
  if (feedback.blocks) {
    // Store the message timestamp for threading
    const messageTs = await storeSlackMessage(feedback.id);
    
    // Future feedback can reply in thread
    feedback.thread_ts = messageTs;
  }

  return c.json({ received: true });
});
```

### Discord

Convert Echo Feedback payload to Discord embeds:

```typescript
app.post('/webhooks/echo-to-discord', async (c) => {
  const feedback = await c.req.json();

  const discordPayload = {
    embeds: [
      {
        title: `New ${feedback.category} feedback`,
        description: feedback.summary,
        color: getSentimentColor(feedback.sentiment),
        fields: [
          {
            name: 'Transcript',
            value: feedback.transcript.substring(0, 1024),
          },
          {
            name: 'Priority',
            value: feedback.priority,
            inline: true,
          },
          {
            name: 'Sentiment',
            value: feedback.sentiment,
            inline: true,
          },
        ],
        footer: {
          text: `Feedback ID: ${feedback.id}`,
        },
        timestamp: feedback.timestamp,
      },
    ],
  };

  // Forward to Discord webhook
  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordPayload),
  });

  return c.json({ received: true });
});

function getSentimentColor(sentiment: string): number {
  const colors = {
    positive: 0x22c55e, // green
    neutral: 0x94a3b8, // gray
    negative: 0xef4444, // red
  };
  return colors[sentiment as keyof typeof colors] || 0x94a3b8;
}
```

### Linear

Create Linear issues from feedback:

```typescript
import { LinearClient } from '@linear/sdk';

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

app.post('/webhooks/echo-to-linear', async (c) => {
  const feedback = await c.req.json();

  // Map category to Linear issue type
  const stateId = feedback.category === 'bug'
    ? process.env.LINEAR_BUG_STATE_ID
    : process.env.LINEAR_FEATURE_STATE_ID;

  // Map priority
  const priorityMap = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const issue = await linear.createIssue({
    teamId: process.env.LINEAR_TEAM_ID!,
    title: feedback.summary,
    description: `## Transcript\n\n${feedback.transcript}\n\n---\n\n**Sentiment:** ${feedback.sentiment}\n**Audio:** ${feedback.audioUrl}`,
    priority: priorityMap[feedback.priority as keyof typeof priorityMap],
    stateId,
    labels: [feedback.category, feedback.sentiment],
  });

  console.log(`Created Linear issue: ${issue.id}`);

  return c.json({ received: true, linearIssue: issue.id });
});
```

### Custom Database

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

app.post('/webhooks/echo-feedback', async (c) => {
  const signature = c.req.header('x-echo-signature');
  const rawBody = await c.req.text();

  // Verify signature
  if (!verifySignature(rawBody, signature!, process.env.WEBHOOK_SECRET!)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const feedback = JSON.parse(rawBody);

  // Store in database with relations
  const savedFeedback = await prisma.feedback.create({
    data: {
      echoId: feedback.id,
      appId: feedback.appId,
      transcript: feedback.transcript,
      summary: feedback.summary,
      category: feedback.category,
      sentiment: feedback.sentiment,
      priority: feedback.priority,
      audioUrl: feedback.audioUrl,
      metadata: feedback.metadata,
      
      // Auto-assign based on category
      assignee: feedback.category === 'bug'
        ? { connect: { email: 'bugs@company.com' } }
        : undefined,
      
      // Add to project
      project: {
        connect: { id: feedback.metadata?.projectId },
      },
      
      // Create notifications
      notifications: {
        create: {
          userId: await getResponsibleUser(feedback.category),
          type: 'NEW_FEEDBACK',
          read: false,
        },
      },
    },
  });

  // Trigger additional workflows
  if (feedback.priority === 'high' && feedback.category === 'bug') {
    await sendUrgentAlert(savedFeedback);
  }

  return c.json({ received: true, id: savedFeedback.id });
});

async function getResponsibleUser(category: string): Promise<string> {
  const assignments = {
    bug: 'engineering-lead',
    feature: 'product-manager',
    praise: 'customer-success',
    other: 'support-team',
  };
  
  const user = await prisma.user.findFirst({
    where: { role: assignments[category as keyof typeof assignments] },
  });
  
  return user?.id || 'default-admin';
}

async function sendUrgentAlert(feedback: any) {
  // Send to PagerDuty, Opsgenie, etc.
  await fetch(process.env.PAGERDUTY_WEBHOOK!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_action: 'trigger',
      payload: {
        summary: `High Priority Bug: ${feedback.summary}`,
        severity: 'error',
        source: 'echo-feedback',
      },
    }),
  });
}
```

---

## Complete Production Example

Combining all best practices:

```typescript
import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';
import Queue from 'bull';

const app = new Hono();

// Queue for async processing
const feedbackQueue = new Queue('feedback-processing', {
  redis: process.env.REDIS_URL,
});

// Main webhook endpoint
app.post('/webhooks/echo-feedback', async (c) => {
  // 1. Get headers and body
  const signature = c.req.header('x-echo-signature');
  const timestamp = c.req.header('x-echo-timestamp');
  const rawBody = await c.req.text();

  // 2. Verify signature
  const verification = verifyWebhook(rawBody, signature!, timestamp!, process.env.WEBHOOK_SECRET!);
  if (!verification.valid) {
    console.error('Webhook verification failed:', verification.error);
    return c.json({ error: verification.error }, 401);
  }

  // 3. Parse payload
  const feedback = JSON.parse(rawBody);

  // 4. Add to processing queue (respond quickly)
  await feedbackQueue.add(feedback, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });

  // 5. Respond immediately
  return c.json({ received: true });
});

// Process feedback asynchronously
feedbackQueue.process(async (job) => {
  const feedback = job.data;

  try {
    // Store in database
    await storeFeedback(feedback);

    // Send notifications
    await sendNotifications(feedback);

    // Update analytics
    await updateAnalytics(feedback);

    console.log(`✅ Processed feedback ${feedback.id}`);
  } catch (error) {
    console.error(`❌ Failed to process ${feedback.id}:`, error);
    throw error; // Will trigger retry
  }
});

function verifyWebhook(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): { valid: boolean; error?: string } {
  if (!signature) return { valid: false, error: 'Missing signature' };
  if (!timestamp) return { valid: false, error: 'Missing timestamp' };

  // Check timestamp freshness
  const age = Date.now() - parseInt(timestamp);
  if (age > 5 * 60 * 1000) {
    return { valid: false, error: 'Request too old' };
  }

  // Verify signature
  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
  
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return { valid: false, error: 'Invalid signature' };
    }
  } catch {
    return { valid: false, error: 'Signature comparison failed' };
  }

  return { valid: true };
}

async function storeFeedback(feedback: any) {
  // Your database logic
}

async function sendNotifications(feedback: any) {
  // Send to Slack, email, etc.
}

async function updateAnalytics(feedback: any) {
  // Update metrics
}

export default app;
```

---

## Troubleshooting

### Webhook Not Receiving Requests

1. **Check URL is publicly accessible:**
   ```bash
   curl -X POST https://your-server.com/webhooks/echo-feedback \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. **Verify app registration:**
   ```bash
   curl http://localhost:3001/api/apps/your_app_id
   ```

3. **Check firewall rules**

### Signature Verification Failing

1. **Use raw body** - Don't parse JSON before verification
2. **Check secret matches** - Same secret in both systems
3. **Verify header names** - Case-sensitive: `x-echo-signature`

### Requests Timing Out

1. **Respond quickly** - Process async, respond < 3 seconds
2. **Use queues** - Bull, BullMQ, or similar
3. **Check server capacity**

---

For more information, see:
- [Main Webhook Guide](./WEBHOOKS.md)
- [API Documentation](./API.md)
- [Testing Guide](./TESTING.md)

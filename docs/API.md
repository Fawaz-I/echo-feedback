# Echo Feedback API Documentation

## Base URL

```
https://api.echo-feedback.com
```

## Authentication

No authentication required for public endpoints. Apps are identified by `appId`.

---

## Endpoints

### POST /api/feedback

Submit voice feedback.

**Request**

- Method: `POST`
- Content-Type: `multipart/form-data`

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appId` | string | Yes | Your application identifier |
| `audio` | file | Yes | Audio file (webm/mp3/wav, max 5MB, max 120s) |
| `metadata` | JSON string | No | Additional context (see below) |

**Metadata Object**

```json
{
  "pageUrl": "https://example.com/page",
  "device": "Desktop",
  "os": "macOS",
  "locale": "en-US",
  "appVersion": "1.0.0"
}
```

**Response** (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "transcript": "The dark mode toggle isn't working on the settings page.",
  "summary": "Dark mode toggle malfunction on settings page",
  "category": "bug",
  "sentiment": "negative",
  "priority": "medium",
  "language": "en-US",
  "audio_url": "/uploads/550e8400.webm",
  "summary_tts_url": "/summaries/550e8400.mp3"
}
```

**Field Descriptions**

- `category`: One of `bug`, `feature`, `praise`, `other`
- `sentiment`: One of `positive`, `neutral`, `negative`
- `priority`: One of `low`, `medium`, `high`
- `language`: BCP-47 language code

**Error Responses**

```json
// 400 Bad Request
{
  "error": "Audio file required"
}

// 413 Payload Too Large
{
  "error": "Audio file exceeds 5MB limit"
}

// 500 Internal Server Error
{
  "error": "Processing failed"
}
```

---

### POST /api/apps

Register a new application with webhook configuration.

**Request**

```json
{
  "appId": "my_app_123",
  "name": "My Application",
  "webhookUrl": "https://hooks.slack.com/services/...",
  "webhookSecret": "your-secret-key"
}
```

**Response** (201 Created)

```json
{
  "appId": "my_app_123",
  "name": "My Application",
  "webhookUrl": "https://hooks.slack.com/services/...",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

### POST /api/apps/:appId/test-webhook

Test webhook delivery with sample data.

**Response** (200 OK)

```json
{
  "success": true,
  "status": 200,
  "message": "Webhook delivered successfully"
}
```

---

## Webhooks

### Payload Format

Webhooks are automatically formatted based on the `webhookUrl`:

**Slack** (detected by `hooks.slack.com`):
```json
{
  "text": "🎙️ New Feedback: Bug Report",
  "blocks": [...]
}
```

**Jira** (detected by `jira` in URL):
```json
{
  "fields": {
    "project": { "key": "PROJ" },
    "issuetype": { "name": "Bug" },
    "summary": "Dark mode toggle malfunction",
    "description": "..."
  }
}
```

**GitHub** (detected by `github.com`):
```json
{
  "title": "[Bug] Dark mode toggle malfunction",
  "body": "...",
  "labels": ["bug", "user-feedback"]
}
```

**Generic** (fallback):
```json
{
  "event": "feedback.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "feedback": { ... }
}
```

### HMAC Signature Verification

All webhooks include an `X-Echo-Signature` header:

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

## Rate Limits

- **Per App**: 100 requests/minute
- **Per IP**: 20 requests/minute

Exceeding limits returns `429 Too Many Requests`.

---

## SDK Examples

### React

```tsx
import { EchoFeedback } from '@echo-feedback/react';

function App() {
  return (
    <EchoFeedback
      appId="my_app_123"
      endpoint="https://api.echo-feedback.com"
      maxDurationSec={60}
      onComplete={(data) => console.log('Feedback received:', data)}
    />
  );
}
```

### Web Component

```html
<script src="https://cdn.echo-feedback.dev/v1/web.js"></script>
<echo-feedback
  app-id="my_app_123"
  endpoint="https://api.echo-feedback.com"
  variant="compact"
>
</echo-feedback>
```

### cURL

```bash
curl -X POST https://api.echo-feedback.com/api/feedback \
  -F "appId=my_app_123" \
  -F "audio=@recording.webm" \
  -F 'metadata={"pageUrl":"https://example.com"}'
```

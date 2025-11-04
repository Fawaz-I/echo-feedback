# Webhook Integration Guide

Echo Feedback can automatically send feedback data to external systems via webhooks.

> 📚 **For complete integration examples**, see [WEBHOOK_EXAMPLES.md](../docs/WEBHOOK_EXAMPLES.md) with copy-paste-ready code for Bun, Express, Next.js, and more.

## Supported Platforms

- **Slack** - Posts formatted messages to channels
- **Jira** - Creates issues automatically
- **GitHub** - Creates repository issues
- **Notion** - Adds entries to databases
- **Custom** - Generic JSON payloads for any webhook endpoint

## Setup

### 1. Register Your App

Create an app configuration with webhook settings:

```bash
curl -X POST http://localhost:3001/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "my-app-123",
    "name": "My Application",
    "webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "webhook_secret": "your-secret-key-for-hmac"
  }'
```

### 2. Webhook Delivery

When feedback is submitted with a registered `appId`, the webhook will be triggered automatically.

The webhook payload is automatically formatted based on the destination:

#### Slack Format

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "😊 New Feedback: bug"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Summary:*\nDark mode not persisting"
        }
      ]
    }
  ]
}
```

#### GitHub Format

```json
{
  "title": "Dark mode not persisting between sessions",
  "body": "## Transcript\n\nThe dark mode keeps resetting...",
  "labels": ["bug", "neutral", "priority-medium"]
}
```

#### Generic Format

For unknown webhook URLs, a standard JSON payload is sent:

```json
{
  "id": "uuid",
  "appId": "my-app-123",
  "timestamp": "2025-01-15T10:30:00Z",
  "transcript": "User's spoken feedback...",
  "summary": "Brief summary of issue",
  "category": "bug",
  "sentiment": "neutral",
  "priority": "medium",
  "audioUrl": "https://example.com/uploads/abc.webm",
  "metadata": {
    "pageUrl": "https://app.example.com/settings",
    "device": "desktop"
  }
}
```

## Security

### HMAC Signature Verification

If you provide a `webhook_secret`, all webhook requests include HMAC signatures:

**Headers:**
```
X-Echo-Signature: sha256=<hmac_signature>
X-Echo-Timestamp: <unix_timestamp>
```

**Verification Example (Node.js):**

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = `sha256=${createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  return signature === expectedSignature;
}

// In your webhook endpoint:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-echo-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
});
```

## Platform-Specific Setup

### Slack

1. Create an Incoming Webhook in Slack:
   - Go to https://api.slack.com/apps
   - Create a new app or select existing
   - Enable "Incoming Webhooks"
   - Add webhook to workspace
   - Copy the webhook URL

2. Use the webhook URL when registering your app

### Jira

1. Create an API token:
   - Go to https://id.atlassian.com/manage/api-tokens
   - Create token

2. Webhook URL format:
   ```
   https://YOUR-DOMAIN.atlassian.net/rest/api/3/issue
   ```

3. Include Basic Auth in webhook headers (extend webhook service to support this)

### GitHub

1. Create a Personal Access Token with `repo` scope

2. Webhook URL format:
   ```
   https://api.github.com/repos/OWNER/REPO/issues
   ```

3. Include `Authorization: token YOUR_TOKEN` in headers (extend webhook service)

### Notion

1. Create an integration:
   - Go to https://www.notion.so/my-integrations
   - Create new integration
   - Copy the secret token

2. Share your database with the integration

3. Webhook URL format:
   ```
   https://api.notion.com/v1/pages
   ```

4. Include database ID in URL or as parameter

## Monitoring

Webhook delivery status is tracked in the database:

```sql
SELECT id, summary, webhook_status, created_at 
FROM feedback_items 
WHERE webhook_status = 'failed';
```

Webhook logs are also printed to console:

```
✅ Webhook delivered in 245ms to https://hooks.slack.com/...
❌ Webhook failed (404) in 123ms: Not Found
```

## Retry Logic

Currently, webhooks are attempted once. Failed webhooks are marked as `failed` in the database.

**Future Enhancement:** Implement exponential backoff retry with configurable attempts.

## Testing

Use [webhook.site](https://webhook.site) to inspect webhook payloads:

```bash
curl -X POST http://localhost:3001/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "name": "Test App",
    "webhook_url": "https://webhook.site/your-unique-url"
  }'
```

Then submit feedback and check webhook.site for the payload.

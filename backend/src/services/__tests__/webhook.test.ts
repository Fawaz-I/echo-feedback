import { describe, test, expect, mock } from 'bun:test';
import { deliverWebhook, formatWebhookPayload } from '../webhook';
import type { FeedbackItem } from '@echo-feedback/types';

describe('Webhook Service', () => {
  const mockFeedback: FeedbackItem = {
    id: 'test-123',
    app_id: 'demo_app',
    created_at: new Date().toISOString(),
    source: 'web',
    duration_ms: 5000,
    audio_url: '/uploads/test.webm',
    transcript: 'This is a test feedback',
    summary: 'Test summary',
    category: 'bug',
    sentiment: 'negative',
    priority: 'high',
    metadata: { pageUrl: 'https://example.com' },
  };

  describe('formatWebhookPayload', () => {
    test('formats Slack payload correctly', () => {
      const payload = formatWebhookPayload(mockFeedback, 'https://hooks.slack.com/test') as any;
      
      expect(payload).toHaveProperty('blocks');
      expect(payload).toHaveProperty('attachments');
      expect(payload.blocks[0].text.text).toContain('New Feedback');
    });

    test('formats Jira payload correctly', () => {
      const payload = formatWebhookPayload(mockFeedback, 'https://jira.example.com/webhook');
      
      expect(payload).toHaveProperty('fields');
      expect(payload.fields).toHaveProperty('summary');
      expect(payload.fields).toHaveProperty('description');
    });

    test('formats GitHub payload correctly', () => {
      const payload = formatWebhookPayload(mockFeedback, 'https://api.github.com/repos/test/repo/issues') as any;
      
      expect(payload).toHaveProperty('title');
      expect(payload).toHaveProperty('body');
      expect(payload.title).toBe(mockFeedback.summary);
      expect(payload.labels).toContain(mockFeedback.category);
    });

    test('formats generic payload as fallback', () => {
      const payload = formatWebhookPayload(mockFeedback, 'https://example.com/webhook') as any;
      
      expect(payload).toHaveProperty('id');
      expect(payload.id).toBe(mockFeedback.id);
    });
  });

  describe('deliverWebhook', () => {
    test('successfully delivers webhook with HMAC signature', async () => {
      const fetchMock = mock(() => Promise.resolve(new Response(null, { status: 200 })));
      global.fetch = fetchMock as any;

      const result = await deliverWebhook(
        'https://example.com/webhook',
        mockFeedback,
        'test-secret'
      );

      expect(result.status).toBe('sent');
      expect(fetchMock).toHaveBeenCalled();
      
      const callArgs = fetchMock.mock.calls[0];
      const headers = callArgs[1].headers as Record<string, string>;
      expect(headers['X-Echo-Signature']).toBeDefined();
    });

    test('handles webhook delivery failure', async () => {
      global.fetch = mock(() => Promise.resolve(new Response(null, { status: 500 }))) as any;

      const result = await deliverWebhook(
        'https://example.com/webhook',
        mockFeedback,
        'test-secret'
      );

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    test('handles network errors', async () => {
      global.fetch = mock(() => Promise.reject(new Error('Network error'))) as any;

      const result = await deliverWebhook(
        'https://example.com/webhook',
        mockFeedback,
        'test-secret'
      );

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Network error');
    });
  });
});

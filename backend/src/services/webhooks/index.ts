/**
 * Webhook service - main orchestration
 */

import type { FeedbackItem } from '@echo-feedback/types';
import type { WebhookConfig, WebhookPayload } from './types';
import { sendWebhook as deliverWebhook } from './delivery';

export { verifyWebhookSignature } from './signing';
export { formatPayload } from './formatters';
export type { WebhookConfig, WebhookPayload, WebhookResult } from './types';

/**
 * Create webhook payload from feedback item
 */
function createWebhookPayload(feedback: Partial<FeedbackItem>): WebhookPayload {
  return {
    id: feedback.id!,
    appId: feedback.app_id!,
    timestamp: typeof feedback.created_at === 'string'
      ? feedback.created_at
      : feedback.created_at?.toISOString() || new Date().toISOString(),
    transcript: feedback.transcript!,
    summary: feedback.summary!,
    category: feedback.category!,
    sentiment: feedback.sentiment!,
    priority: feedback.priority!,
    audioUrl: feedback.audio_url!,
    metadata: (feedback.metadata || {}) as Record<string, unknown>,
  };
}

/**
 * Send webhook for feedback item
 */
export async function sendWebhook(
  feedback: Partial<FeedbackItem>,
  config: WebhookConfig
): Promise<{ success: boolean; error?: string }> {
  const payload = createWebhookPayload(feedback);
  return deliverWebhook(payload, config);
}

/**
 * Format webhook payload for a specific platform
 */
export function formatWebhookPayload(feedback: Partial<FeedbackItem>, webhookUrl: string): unknown {
  const payload = createWebhookPayload(feedback);
  const { formatPayload } = require('./formatters');
  return formatPayload(payload, webhookUrl);
}

/**
 * Deliver webhook (alias for sendWebhook for backward compatibility)
 */
export async function deliverWebhook(
  webhookUrl: string,
  feedback: Partial<FeedbackItem>,
  secret?: string
): Promise<{ status: 'sent' | 'failed'; error?: string }> {
  const result = await sendWebhook(feedback, { url: webhookUrl, secret });
  return {
    status: result.success ? 'sent' : 'failed',
    error: result.error,
  };
}

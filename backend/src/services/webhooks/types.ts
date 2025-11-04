/**
 * Webhook type definitions
 */

export interface WebhookConfig {
  url: string;
  secret?: string;
}

export interface WebhookPayload {
  id: string;
  appId: string;
  timestamp: string;
  transcript: string;
  summary: string;
  category: string;
  sentiment: string;
  priority: string;
  audioUrl: string;
  metadata: Record<string, unknown> | Record<string, string | undefined>;
}

export interface WebhookResult {
  success: boolean;
  error?: string;
}

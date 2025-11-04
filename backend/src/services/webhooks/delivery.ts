/**
 * Webhook delivery logic
 */

import { WEBHOOK_USER_AGENT, WEBHOOK_SIGNATURE_HEADER, WEBHOOK_TIMESTAMP_HEADER } from '../../config/constants';
import type { WebhookConfig, WebhookPayload, WebhookResult } from './types';
import { generateSignature } from './signing';
import { formatPayload } from './formatters';

/**
 * Send webhook with retry logic
 */
export async function sendWebhook(
  payload: WebhookPayload,
  config: WebhookConfig
): Promise<WebhookResult> {
  if (!config.url) {
    return { success: false, error: 'No webhook URL configured' };
  }

  const startTime = Date.now();

  try {
    const formattedPayload = formatPayload(payload, config.url);
    const payloadString = JSON.stringify(formattedPayload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': WEBHOOK_USER_AGENT,
    };

    // Add HMAC signature if secret is provided
    if (config.secret) {
      const signature = generateSignature(payloadString, config.secret);
      headers[WEBHOOK_SIGNATURE_HEADER] = `sha256=${signature}`;
      headers[WEBHOOK_TIMESTAMP_HEADER] = Date.now().toString();
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: payloadString,
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Webhook failed (${response.status}) in ${duration}ms:`,
        errorText.substring(0, 200)
      );
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    console.log(`✅ Webhook delivered in ${duration}ms to ${config.url}`);
    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Webhook error after ${duration}ms:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

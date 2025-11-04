/**
 * Webhook signature generation and verification
 */

import { createHmac } from 'node:crypto';

/**
 * Generate HMAC signature for webhook verification
 */
export function generateSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify incoming webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = `sha256=${generateSignature(payload, secret)}`;
  return signature === expectedSignature;
}

/**
 * Request validation middleware
 */

import type { Context, Next } from 'hono';
import { ValidationError } from '@echo-feedback/utils';

/**
 * Validates that required fields are present in request body
 */
export function validateFields(...requiredFields: string[]) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}));

    const missing = requiredFields.filter((field) => !body[field]);

    if (missing.length > 0) {
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
    }

    await next();
  };
}

/**
 * Validates multipart form data has required fields
 */
export function validateFormData(...requiredFields: string[]) {
  return async (c: Context, next: Next) => {
    const body = await c.req.parseBody();

    const missing = requiredFields.filter((field) => !body[field]);

    if (missing.length > 0) {
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
    }

    await next();
  };
}

/**
 * Validates URL parameters are present
 */
export function validateParams(...requiredParams: string[]) {
  return async (c: Context, next: Next) => {
    const missing = requiredParams.filter((param) => !c.req.param(param));

    if (missing.length > 0) {
      throw new ValidationError(`Missing required parameters: ${missing.join(', ')}`);
    }

    await next();
  };
}

/**
 * Validates content type
 */
export function validateContentType(expectedType: string) {
  return async (c: Context, next: Next) => {
    const contentType = c.req.header('content-type');

    if (!contentType || !contentType.includes(expectedType)) {
      throw new ValidationError(`Expected content-type: ${expectedType}`, {
        received: contentType,
      });
    }

    await next();
  };
}

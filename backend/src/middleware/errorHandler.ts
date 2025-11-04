/**
 * Centralized error handling middleware
 */

import type { Context, Next } from 'hono';
import { APIError } from '@echo-feedback/utils';

/**
 * Error handler middleware
 * Catches errors thrown in route handlers and formats them consistently
 */
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error in request:', error);

    // Handle known API errors
    if (error instanceof APIError) {
      return c.json(
        {
          error: error.message,
          details: error.details,
        },
        error.statusCode
      );
    }

    // Handle unknown errors
    return c.json(
      {
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(c: Context) {
  return c.json(
    {
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
}

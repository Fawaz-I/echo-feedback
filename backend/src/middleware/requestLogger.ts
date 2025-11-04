/**
 * Request logging middleware
 */

import type { Context, Next } from 'hono';

/**
 * Logs all incoming requests with timing information
 */
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const { method, path } = c.req;

  // Skip logging for health checks to reduce noise
  if (path === '/health') {
    await next();
    return;
  }

  console.log(`--> ${method} ${path}`);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;
  const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';

  console.log(`${statusEmoji} ${method} ${path} - ${status} (${duration}ms)`);
}

/**
 * Extended request logger with body information (for debugging)
 */
export async function detailedRequestLogger(c: Context, next: Next) {
  const start = Date.now();
  const { method, path } = c.req;

  console.log(`--> ${method} ${path}`);
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`<-- ${method} ${path} - ${status} (${duration}ms)`);
}

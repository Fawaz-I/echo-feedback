/**
 * CORS configuration for the API
 */

import { cors } from 'hono/cors';

/**
 * Get CORS middleware configuration
 * Enables CORS for frontend development
 */
export function getCorsMiddleware() {
  return cors({
    origin: '*', // Allow all origins in development
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 600,
    credentials: true,
  });
}

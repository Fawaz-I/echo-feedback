/**
 * Health route tests
 */

import { describe, test, expect } from 'bun:test';
import healthRoutes from '../health';

describe('Health Routes', () => {
  test('GET /health returns status ok', async () => {
    const req = new Request('http://localhost/health');
    const res = await healthRoutes.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('timestamp');
  });

  test('GET /health includes uptime', async () => {
    const req = new Request('http://localhost/health');
    const res = await healthRoutes.fetch(req);
    const data = await res.json();

    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  test('GET /health includes ISO timestamp', async () => {
    const req = new Request('http://localhost/health');
    const res = await healthRoutes.fetch(req);
    const data = await res.json();

    expect(typeof data.timestamp).toBe('string');
    // Validate ISO 8601 format
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});

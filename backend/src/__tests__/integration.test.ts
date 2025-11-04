import { describe, test, expect } from 'bun:test';
import type { FeedbackItem } from '@echo-feedback/types';

describe('Feedback Data Validation', () => {
  test('validates feedback item structure', () => {
    const feedback: Partial<FeedbackItem> = {
      id: 'test-123',
      app_id: 'demo_app',
      transcript: 'Test feedback',
      summary: 'Summary',
      category: 'bug',
      sentiment: 'negative',
      priority: 'high',
    };

    expect(feedback.category).toBe('bug');
    expect(['bug', 'feature', 'praise', 'other']).toContain(feedback.category!);
    expect(['positive', 'neutral', 'negative']).toContain(feedback.sentiment!);
    expect(['low', 'medium', 'high']).toContain(feedback.priority!);
  });

  test('validates required fields', () => {
    const validFeedback: Required<Pick<FeedbackItem, 'id' | 'app_id' | 'transcript' | 'summary' | 'category' | 'sentiment' | 'priority'>> = {
      id: 'test-123',
      app_id: 'test_app',
      transcript: 'Test',
      summary: 'Summary',
      category: 'bug',
      sentiment: 'neutral',
      priority: 'medium',
    };

    expect(validFeedback.id).toBeDefined();
    expect(validFeedback.app_id).toBeDefined();
    expect(validFeedback.transcript).toBeDefined();
  });
});

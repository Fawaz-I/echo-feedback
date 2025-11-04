/**
 * Environment configuration tests
 */

import { describe, test, expect } from 'bun:test';

describe('Environment Configuration', () => {
  describe('getEnvConfig', () => {
    test.todo('should load environment variables correctly');
    test.todo('should throw error when no transcription service configured');
    test.todo('should use ElevenLabs when ELEVEN_API_KEY is set');
    test.todo('should use OpenAI when only OPENAI_API_KEY is set');
    test.todo('should apply default values for optional configs');
  });

  describe('logConfigStatus', () => {
    test.todo('should log transcription service');
    test.todo('should log summarizer model');
    test.todo('should not log secrets');
  });
});

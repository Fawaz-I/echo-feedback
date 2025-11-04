import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { classifyFeedback, transcribeAudio } from '../openai';

describe('OpenAI Service', () => {
  beforeEach(() => {
    // Reset environment
    process.env.OPENAI_API_KEY = 'test-key';
  });

  describe('transcribeAudio', () => {
    test('successfully transcribes audio', async () => {
      const mockBlob = new Blob(['fake audio data'], { type: 'audio/webm' });
      
      global.fetch = mock(() => 
        Promise.resolve(new Response(JSON.stringify({ text: 'Hello world' }), { status: 200 }))
      ) as any;

      const result = await transcribeAudio(mockBlob);

      expect(result).toBe('Hello world');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    test('handles transcription API errors', async () => {
      const mockBlob = new Blob(['fake audio data']);
      
      global.fetch = mock(() => 
        Promise.resolve(new Response('Bad Request', { status: 400 }))
      ) as any;

      await expect(transcribeAudio(mockBlob)).rejects.toThrow();
    });
  });

  describe('classifyFeedback', () => {
    test('classifies feedback correctly', async () => {
      const mockResponse = {
        summary: 'Dark mode bug',
        category: 'bug',
        sentiment: 'negative',
        priority: 'medium',
        language: 'en-US',
      };

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: JSON.stringify(mockResponse) } }],
            }),
            { status: 200 }
          )
        )
      ) as any;

      const result = await classifyFeedback('The dark mode is not working properly');

      expect(result.summary).toBe('Dark mode bug');
      expect(result.category).toBe('bug');
      expect(result.sentiment).toBe('negative');
      expect(result.priority).toBe('medium');
    });

    test('validates classification response structure', async () => {
      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: '{"invalid": "structure"}' } }],
            }),
            { status: 200 }
          )
        )
      ) as any;

      await expect(classifyFeedback('test feedback')).rejects.toThrow();
    });

    test('handles GPT API errors gracefully', async () => {
      global.fetch = mock(() =>
        Promise.resolve(new Response('Server Error', { status: 500 }))
      ) as any;

      await expect(classifyFeedback('test feedback')).rejects.toThrow();
    });
  });
});

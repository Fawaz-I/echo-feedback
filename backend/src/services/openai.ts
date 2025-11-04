import type { GPTClassification } from '@echo-feedback/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUMMARIZER_MODEL = process.env.SUMMARIZER_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set. Whisper transcription and GPT summarization will fail.');
}

const SYSTEM_PROMPT = 'You are a classifier for user feedback. Output strict JSON only.';

interface OpenAIMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface WhisperResponse {
  text: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  const startTime = Date.now();

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1'); // TODO: Try gpt-4o-mini-transcribe for 2-5x speed
    formData.append('language', 'en'); // Skip auto-detection for 100-500ms savings
    formData.append('temperature', '0'); // Deterministic output

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Whisper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as WhisperResponse;
    
    if (!data.text) {
      throw new Error('No transcript text in Whisper response');
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Whisper transcription completed in ${duration}ms`);

    return data.text;
  } catch (error) {
    console.error('❌ OpenAI Whisper transcription failed:', error);
    throw error;
  }
}

export async function classifyFeedback(
  transcript: string
): Promise<GPTClassification> {
  const startTime = Date.now();

  const userPrompt = `Feedback transcript:
"""
${transcript}
"""

Return JSON with:
- summary (string)
- category (bug|feature|praise|other)
- sentiment (positive|neutral|negative)
- priority (low|medium|high)
- language (BCP-47 code)`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: SUMMARIZER_MODEL,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as OpenAIResponse;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const classification: GPTClassification = JSON.parse(content);

    // Validate required fields
    if (!classification.summary || !classification.category || 
        !classification.sentiment || !classification.priority) {
      throw new Error('Invalid classification response from OpenAI');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ GPT classification completed in ${duration}ms using ${SUMMARIZER_MODEL}`);

    return classification;
  } catch (error) {
    console.error('❌ OpenAI classification failed:', error);
    throw error;
  }
}
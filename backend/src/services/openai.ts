import type { GPTClassification } from '@echo-feedback/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUMMARIZER_MODEL = process.env.SUMMARIZER_MODEL || 'gpt-5-nano-2025-08-07';

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set. Summarization will fail.');
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

    const data: OpenAIResponse = await response.json();
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
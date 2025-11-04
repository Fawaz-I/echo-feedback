const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;

interface TranscriptionResponse {
  text: string;
  language_code: string;
}

/**
 * Transcribe audio using ElevenLabs STT (optional, requires ELEVEN_API_KEY)
 */
export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  if (!ELEVEN_API_KEY) {
    throw new Error('ELEVEN_API_KEY not configured. Cannot use ElevenLabs transcription.');
  }

  const startTime = Date.now();

  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('model', 'scribe_v1');
    // Auto-detect language by not specifying language_code

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text/convert', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as TranscriptionResponse;
    
    if (!data.text) {
      throw new Error('No transcript text in ElevenLabs response');
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ ElevenLabs STT transcription completed in ${duration}ms (${data.language_code})`);

    return data.text;
  } catch (error) {
    console.error('❌ ElevenLabs transcription failed:', error);
    throw error;
  }
}
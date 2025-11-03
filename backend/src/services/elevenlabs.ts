const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;

if (!ELEVEN_API_KEY) {
  console.warn('⚠️  ELEVEN_API_KEY not set. Transcription will fail.');
}

interface TranscriptionResponse {
  text: string;
  language_code: string;
}

export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  const startTime = Date.now();

  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('model', 'scribe_v1');
    // Auto-detect language by not specifying language_code

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text/convert', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data: TranscriptionResponse = await response.json();
    
    if (!data.text) {
      throw new Error('No transcript text in ElevenLabs response');
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ STT transcription completed in ${duration}ms (${data.language_code})`);

    return data.text;
  } catch (error) {
    console.error('❌ ElevenLabs transcription failed:', error);
    throw error;
  }
}
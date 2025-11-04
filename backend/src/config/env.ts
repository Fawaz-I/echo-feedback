/**
 * Environment variable configuration and validation
 */

import { DEFAULT_PORT, DEFAULT_DATABASE_PATH, DEFAULT_UPLOADS_DIR, DEFAULT_SUMMARIZER_MODEL } from './constants';

export interface EnvConfig {
  // Required
  openaiApiKey: string | undefined;

  // Optional
  elevenApiKey: string | undefined;
  summarizerModel: string;
  databaseUrl: string;
  uploadsDir: string;
  port: number;
  webhookSecret: string | undefined;

  // Computed
  useElevenLabs: boolean;
}

/**
 * Parse and validate environment variables
 */
export function getEnvConfig(): EnvConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const elevenApiKey = process.env.ELEVEN_API_KEY;
  const useElevenLabs = !!elevenApiKey;

  // Validate: must have at least one transcription service
  if (!useElevenLabs && !openaiApiKey) {
    throw new Error(
      'OPENAI_API_KEY is required when not using ElevenLabs. Please set it in your .env file.'
    );
  }

  return {
    openaiApiKey,
    elevenApiKey,
    summarizerModel: process.env.SUMMARIZER_MODEL || DEFAULT_SUMMARIZER_MODEL,
    databaseUrl: process.env.DATABASE_URL || DEFAULT_DATABASE_PATH,
    uploadsDir: process.env.UPLOADS_DIR || DEFAULT_UPLOADS_DIR,
    port: parseInt(process.env.PORT || String(DEFAULT_PORT), 10),
    webhookSecret: process.env.WEBHOOK_SECRET,
    useElevenLabs,
  };
}

/**
 * Log configuration status (safe, without secrets)
 */
export function logConfigStatus(config: EnvConfig): void {
  if (config.useElevenLabs) {
    console.log('🎙️  Using ElevenLabs for transcription');
  } else {
    console.log('🎙️  Using OpenAI Whisper for transcription');
  }

  console.log(`📊 Summarizer model: ${config.summarizerModel}`);
  console.log(`💾 Database: ${config.databaseUrl}`);
  console.log(`📁 Uploads directory: ${config.uploadsDir}`);
}

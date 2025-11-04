/**
 * Application constants and defaults
 */

// File upload limits
export const MAX_AUDIO_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_AUDIO_FILE_SIZE_MB = 5;

// API defaults
export const DEFAULT_PORT = 3001;
export const DEFAULT_DATABASE_PATH = './data.db';
export const DEFAULT_UPLOADS_DIR = './uploads';

// OpenAI defaults
export const DEFAULT_SUMMARIZER_MODEL = 'gpt-4o-mini';
export const DEFAULT_WHISPER_MODEL = 'whisper-1';

// Webhook defaults
export const WEBHOOK_USER_AGENT = 'EchoFeedback/1.0';
export const WEBHOOK_SIGNATURE_HEADER = 'X-Echo-Signature';
export const WEBHOOK_TIMESTAMP_HEADER = 'X-Echo-Timestamp';

// Supported audio formats
export const SUPPORTED_AUDIO_FORMATS = ['.webm', '.mp3', '.wav', '.m4a', '.ogg'];

// Database initialization trigger app ID
export const DB_INIT_APP_ID = '_init';

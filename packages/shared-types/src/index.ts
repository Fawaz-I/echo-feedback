// Feedback submission types
export interface FeedbackMetadata {
  pageUrl?: string;
  device?: string;
  os?: string;
  locale?: string;
  appVersion?: string;
}

export interface FeedbackSubmission {
  appId: string;
  audio: File | Blob;
  metadata?: FeedbackMetadata;
}

// Feedback response types
export type FeedbackCategory = 'bug' | 'feature' | 'praise' | 'other';
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';
export type FeedbackPriority = 'low' | 'medium' | 'high';
export type FeedbackSource = 'web' | 'ios' | 'android';
export type WebhookStatus = 'sent' | 'failed' | 'none';

export interface FeedbackResponse {
  id: string;
  transcript: string;
  summary: string;
  category: FeedbackCategory;
  sentiment: FeedbackSentiment;
  summary_tts_url?: string;
  audio_url: string;
}

// Database types
export interface FeedbackItem {
  id: string;
  app_id: string;
  created_at: Date;
  source: FeedbackSource;
  duration_ms: number;
  audio_url: string;
  transcript: string;
  summary: string;
  category: FeedbackCategory;
  sentiment: FeedbackSentiment;
  priority: FeedbackPriority;
  summary_tts_url?: string;
  metadata: FeedbackMetadata;
  webhook_status: WebhookStatus;
}

export interface App {
  app_id: string;
  name: string;
  webhook_url?: string;
  webhook_secret?: string;
  created_at: Date;
}

// GPT Classification Response
export interface GPTClassification {
  summary: string;
  category: FeedbackCategory;
  sentiment: FeedbackSentiment;
  priority: FeedbackPriority;
  language: string; // BCP-47 code
}
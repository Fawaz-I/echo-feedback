import type { FeedbackResponse } from '@echo-feedback/types';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error' | 'complete';
export type Variant = 'card' | 'compact' | 'small';

export interface EchoFeedbackEventMap {
  'echo-start': CustomEvent<void>;
  'echo-stop': CustomEvent<{ duration: number }>;
  'echo-upload': CustomEvent<{ size: number }>;
  'echo-complete': CustomEvent<FeedbackResponse>;
  'echo-error': CustomEvent<{ message: string; error?: Error }>;
  'echo-progress': CustomEvent<{ elapsed: number; max: number }>;
}

export interface EchoFeedbackAttributes {
  'app-id': string;
  'endpoint': string;
  'max-duration-sec'?: string;
  'variant'?: Variant;
  'auto-upload'?: string;
  'title'?: string;
  'subtitle'?: string;
  'status-idle'?: string;
  'status-recording'?: string;
  'status-processing'?: string;
  'error-message'?: string;
}

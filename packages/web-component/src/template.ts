import type { RecordingState, Variant } from './types';

interface TemplateProps {
  state: RecordingState;
  elapsed: number;
  maxDuration: number;
  variant: Variant;
  styles: {
    base: string;
    variant: string;
  };
}

export function template({ state, elapsed, maxDuration, variant, styles }: TemplateProps): string {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isError = state === 'error';

  return `
    <style>${styles.base}</style>
    <style>${styles.variant}</style>
    
    <div part="container" class="ef-container ef-variant-${variant}" data-state="${state}">
      <!-- Header Slot -->
      <div part="header" class="ef-header">
        <slot name="header">
          <h2 part="title">Share Your Feedback</h2>
          <p part="subtitle">Record up to ${maxDuration} seconds</p>
        </slot>
      </div>

      <!-- Error Message -->
      ${isError ? `
        <div part="error" class="ef-error">
          <slot name="error">
            <p>⚠️ An error occurred. Please try again.</p>
          </slot>
        </div>
      ` : ''}

      <!-- Recording UI -->
      <div part="controls" class="ef-controls">
        ${isRecording ? `
          <div part="timer" class="ef-timer">
            ${formatTime(elapsed)}
          </div>
          <div part="meter" class="ef-meter">
            <div part="meter-fill" class="ef-meter-fill" style="width: ${(elapsed / maxDuration) * 100}%"></div>
          </div>
        ` : ''}

        <!-- Mic Button -->
        <slot name="trigger">
          <button
            part="mic-button"
            class="ef-mic-button"
            data-recording="${isRecording}"
            ${isProcessing ? 'disabled' : ''}
            aria-label="${isRecording ? 'Stop recording' : 'Start recording'}">
            <span part="mic-icon" class="ef-mic-icon">
              ${isProcessing ? '⏳' : isRecording ? '⏹️' : '🎙️'}
            </span>
          </button>
        </slot>

        <p part="status" class="ef-status">
          ${isProcessing ? 'Processing your feedback...' :
            isRecording ? 'Recording... Click to stop' :
            'Click to start recording'}
        </p>
      </div>

      <!-- Results -->
      <div part="results" class="ef-results">
        <div part="transcript-container" class="ef-transcript-container">
          <slot name="transcript"></slot>
        </div>
        <div part="summary-container" class="ef-summary-container">
          <slot name="summary"></slot>
        </div>
      </div>

      <!-- Footer Slot -->
      <div part="footer" class="ef-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  `;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

import type { RecordingState, Variant } from './types';

interface TemplateProps {
  state: RecordingState;
  elapsed: number;
  maxDuration: number;
  variant: Variant;
  title?: string;
  subtitle?: string | null;
  statusIdle?: string;
  statusRecording?: string;
  statusProcessing?: string;
  styles: {
    base: string;
    variant: string;
  };
}

// SVG Icons
const micIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

const stopIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>`;

const loaderIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

const alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

export function template({ 
  state, 
  elapsed, 
  maxDuration, 
  variant, 
  title = 'Share Your Feedback',
  subtitle,
  statusIdle = 'Click to start recording',
  statusRecording = 'Recording... Click to stop',
  statusProcessing = 'Processing your feedback...',
  styles 
}: TemplateProps): string {
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
          <h2 part="title">${title}</h2>
          ${subtitle !== null && subtitle !== '' ? `<p part="subtitle">${subtitle}</p>` : subtitle === null ? `<p part="subtitle">Record up to ${maxDuration} seconds</p>` : ''}
        </slot>
      </div>

      <!-- Error Message -->
      ${isError ? `
        <div part="error" class="ef-error">
          <slot name="error">
            <span style="width: 16px; height: 16px; flex-shrink: 0; display: inline-block;">${alertIcon}</span>
            <span>An error occurred. Please try again.</span>
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
            <span part="mic-icon" class="ef-mic-icon ${isProcessing ? 'loading' : ''}">
              ${isProcessing ? loaderIcon : isRecording ? stopIcon : micIcon}
            </span>
          </button>
        </slot>

        <slot name="status">
          <p part="status" class="ef-status">
            ${isProcessing ? statusProcessing :
              isRecording ? statusRecording :
              statusIdle}
          </p>
        </slot>
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

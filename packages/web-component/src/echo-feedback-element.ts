import type { FeedbackResponse } from '@echo-feedback/types';
import type { RecordingState, Variant, EchoFeedbackEventMap } from './types';
import { template } from './template';
import baseStyles from './themes/base.css?inline';
import cardStyles from './themes/card.css?inline';
import compactStyles from './themes/compact.css?inline';
import smallStyles from './themes/small.css?inline';

export class EchoFeedbackElement extends HTMLElement {
  private shadow: ShadowRoot;
  private state: RecordingState = 'idle';
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timer: number | null = null;
  private elapsed = 0;

  // Observed attributes
  static get observedAttributes() {
    return [
      'app-id', 
      'endpoint', 
      'max-duration-sec', 
      'variant', 
      'auto-upload',
      'title',
      'subtitle',
      'status-idle',
      'status-recording',
      'status-processing',
      'error-message'
    ];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  // Public API
  public async start(): Promise<void> {
    // Clear previous results
    this.querySelector('[slot="transcript"]')?.remove();
    this.querySelector('[slot="summary"]')?.remove();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
      this.elapsed = 0;

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => this.handleStop();

      this.mediaRecorder.start();
      this.setState('recording');
      this.emit('echo-start', undefined);

      const startTime = Date.now();
      
      // Update progress bar smoothly (every 50ms for smooth animation)
      const progressInterval = window.setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        this.elapsed = Math.floor(elapsedMs / 1000);
        const progress = (elapsedMs / 1000) / this.maxDuration;
        
        // Update progress meter smoothly
        const meterFill = this.shadow.querySelector('[part="meter-fill"]') as HTMLElement;
        if (meterFill) {
          const percentage = Math.min(progress * 100, 100);
          meterFill.style.width = `${percentage}%`;
        }
        
        // Update timer text every second
        const timerEl = this.shadow.querySelector('[part="timer"]');
        if (timerEl) {
          timerEl.textContent = this.formatTime(this.elapsed);
        }
        
        // Emit progress event every second
        if (elapsedMs % 1000 < 50) {
          this.emit('echo-progress', { elapsed: this.elapsed, max: this.maxDuration });
        }

        if (this.elapsed >= this.maxDuration) {
          clearInterval(progressInterval);
          this.stop();
        }
      }, 50);
      
      this.timer = progressInterval;
    } catch (error) {
      this.handleError('Microphone access denied', error as Error);
    }
  }

  public stop(): void {
    if (this.mediaRecorder && this.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      this.emit('echo-stop', { duration: this.elapsed });
    }
  }

  public reset(): void {
    this.cleanup();
    this.setState('idle');
    this.elapsed = 0;
    this.render();
  }

  // Getters for attributes
  private get appId(): string {
    return this.getAttribute('app-id') || '';
  }

  private get endpoint(): string {
    return this.getAttribute('endpoint') || '';
  }

  private get maxDuration(): number {
    return parseInt(this.getAttribute('max-duration-sec') || '90', 10);
  }

  private get variant(): Variant {
    return (this.getAttribute('variant') as Variant) || 'card';
  }

  private get autoUpload(): boolean {
    return this.hasAttribute('auto-upload');
  }

  private get title(): string {
    return this.getAttribute('title') || 'Share Your Feedback';
  }

  private get subtitle(): string | null {
    return this.getAttribute('subtitle');
  }

  private get statusIdle(): string {
    return this.getAttribute('status-idle') || 'Click to start recording';
  }

  private get statusRecording(): string {
    return this.getAttribute('status-recording') || 'Recording... Click to stop';
  }

  private get statusProcessing(): string {
    return this.getAttribute('status-processing') || 'Processing your feedback...';
  }

  private get errorMessage(): string | null {
    return this.getAttribute('error-message');
  }

  // State management
  private setState(newState: RecordingState) {
    this.state = newState;
    this.updateUI();
  }

  private emit<K extends keyof EchoFeedbackEventMap>(
    eventName: K,
    detail: EchoFeedbackEventMap[K]['detail']
  ) {
    this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
  }

  private handleError(message: string, error?: Error) {
    this.setState('error');
    const displayMessage = this.errorMessage || message;
    this.emit('echo-error', { message: displayMessage, error });
  }

  private async handleStop() {
    const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });

    // Check size
    if (audioBlob.size > 5 * 1024 * 1024) {
      this.handleError(this.errorMessage || 'Recording too large (max 5MB)');
      return;
    }

    // Show immediate success state
    this.setState('complete');

    if (this.autoUpload) {
      // Fire-and-forget upload in background
      this.uploadInBackground(audioBlob);
    } else {
      // Manual mode - just show success
      setTimeout(() => this.setState('idle'), 3000);
    }
  }

  private uploadInBackground(audioBlob: Blob) {
    // Don't await - let it run in background
    (async () => {
      this.emit('echo-upload', { size: audioBlob.size });

      try {
        const formData = new FormData();
        formData.append('appId', this.appId);
        formData.append('audio', audioBlob, 'feedback.webm');
        formData.append('metadata', JSON.stringify({
          pageUrl: window.location.href,
          device: navigator.userAgent,
          locale: navigator.language,
          timestamp: new Date().toISOString(),
        }));

        const response = await fetch(`${this.endpoint}/api/feedback`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: FeedbackResponse = await response.json();
        this.emit('echo-complete', data);
        
        // Show results in slots if provided
        this.displayResults(data);
      } catch (error) {
        // Silent fail - user already got confirmation
        console.error('Background upload failed:', error);
        this.emit('echo-error', { 
          message: 'Background upload failed', 
          error: error as Error 
        });
      }
    })();
  }

  // Kept for manual upload via public API
  private async upload(audioBlob: Blob) {
    this.setState('processing');
    this.emit('echo-upload', { size: audioBlob.size });

    try {
      const formData = new FormData();
      formData.append('appId', this.appId);
      formData.append('audio', audioBlob, 'feedback.webm');
      formData.append('metadata', JSON.stringify({
        pageUrl: window.location.href,
        device: navigator.userAgent,
        locale: navigator.language,
        timestamp: new Date().toISOString(),
      }));

      const response = await fetch(`${this.endpoint}/api/feedback`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: FeedbackResponse = await response.json();
      this.setState('complete');
      this.emit('echo-complete', data);
      
      // Show results in slots if provided
      this.displayResults(data);
    } catch (error) {
      this.handleError('Upload failed', error as Error);
    }
  }

  private displayResults(data: FeedbackResponse) {
    const transcriptSlot = this.shadow.querySelector('[name="transcript"]');
    const summarySlot = this.shadow.querySelector('[name="summary"]');
    const resultsSection = this.shadow.querySelector('.ef-results');
    
    if (transcriptSlot && !this.querySelector('[slot="transcript"]')) {
      const p = document.createElement('p');
      p.textContent = data.transcript;
      p.slot = 'transcript';
      this.appendChild(p);
    }

    if (summarySlot && !this.querySelector('[slot="summary"]')) {
      const div = document.createElement('div');
      div.innerHTML = `
        <p><strong>Summary:</strong> ${data.summary}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Sentiment:</strong> ${data.sentiment}</p>
      `;
      div.slot = 'summary';
      this.appendChild(div);
    }

    // Show results section when content is added
    if (resultsSection && (this.querySelector('[slot="transcript"]') || this.querySelector('[slot="summary"]'))) {
      (resultsSection as HTMLElement).style.display = 'flex';
    }
  }

  private cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder = null;
    }
  }

  private render() {
    let variantStyles = cardStyles;
    if (this.variant === 'compact') {
      variantStyles = compactStyles;
    } else if (this.variant === 'small') {
      variantStyles = smallStyles;
    }

    this.shadow.innerHTML = template({
      state: this.state,
      elapsed: this.elapsed,
      maxDuration: this.maxDuration,
      variant: this.variant,
      title: this.title,
      subtitle: this.subtitle,
      statusIdle: this.statusIdle,
      statusRecording: this.statusRecording,
      statusProcessing: this.statusProcessing,
      styles: {
        base: baseStyles,
        variant: variantStyles,
      },
    });
  }

  private attachEventListeners() {
    const micButton = this.shadow.querySelector('[part="mic-button"]');
    if (micButton) {
      micButton.addEventListener('click', () => {
        if (this.state === 'recording') {
          this.stop();
        } else if (this.state === 'idle' || this.state === 'complete') {
          this.start();
        }
      });
    }
  }

  private updateTimer() {
    const timerEl = this.shadow.querySelector('[part="timer"]');
    if (timerEl) {
      timerEl.textContent = this.formatTime(this.elapsed);
    }
  }

  private updateUI() {
    this.render();
    this.attachEventListeners();
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

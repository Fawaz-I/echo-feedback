import type { FeedbackResponse } from '@echo-feedback/types';
import type { RecordingState, Variant, EchoFeedbackEventMap } from './types';
import { template } from './template';
import baseStyles from './themes/base.css?inline';
import cardStyles from './themes/card.css?inline';
import compactStyles from './themes/compact.css?inline';

export class EchoFeedbackElement extends HTMLElement {
  private shadow: ShadowRoot;
  private state: RecordingState = 'idle';
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timer: number | null = null;
  private elapsed = 0;

  // Observed attributes
  static get observedAttributes() {
    return ['app-id', 'endpoint', 'max-duration-sec', 'variant', 'auto-upload'];
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

      // Start timer
      this.timer = window.setInterval(() => {
        this.elapsed++;
        this.updateTimer();
        this.emit('echo-progress', { elapsed: this.elapsed, max: this.maxDuration });

        if (this.elapsed >= this.maxDuration) {
          this.stop();
        }
      }, 1000);
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
    this.emit('echo-error', { message, error });
  }

  private async handleStop() {
    const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });

    // Check size
    if (audioBlob.size > 5 * 1024 * 1024) {
      this.handleError('Recording too large (max 5MB)');
      return;
    }

    if (this.autoUpload) {
      await this.upload(audioBlob);
    } else {
      this.setState('idle');
    }
  }

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
    this.shadow.innerHTML = template({
      state: this.state,
      elapsed: this.elapsed,
      maxDuration: this.maxDuration,
      variant: this.variant,
      styles: {
        base: baseStyles,
        variant: this.variant === 'card' ? cardStyles : compactStyles,
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

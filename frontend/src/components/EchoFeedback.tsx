import { useState, useRef } from 'react';
import type { FeedbackResponse } from '@echo-feedback/types';
import { MicIcon, StopIcon, AlertIcon } from './icons';

interface EchoFeedbackProps {
  appId: string;
  endpoint: string;
  maxDurationSec?: number;
  variant?: 'card' | 'compact' | 'small';
  // Customizable text
  title?: string;
  subtitle?: string;
  statusIdle?: string;
  statusRecording?: string;
  statusProcessing?: string;
  errorMessage?: string;
  onRecordingStop?: () => void;
  onComplete?: (data: FeedbackResponse) => void;
}

function EchoFeedback({ 
  appId, 
  endpoint, 
  maxDurationSec = 90,
  variant = 'card',
  title = 'Share Your Feedback',
  subtitle,
  statusIdle = 'Click to start recording',
  statusRecording = 'Click to stop recording',
  statusProcessing = 'Processing...',
  errorMessage,
  onRecordingStop,
  onComplete 
}: EchoFeedbackProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSec) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      setError(errorMessage || 'Microphone access denied. Please allow microphone access to record feedback.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    
    // Check size limit (5 MB)
    if (audioBlob.size > 5 * 1024 * 1024) {
      setError(errorMessage || 'Recording too large. Please keep feedback under 5 MB.');
      return;
    }

    // Show immediate success feedback
    setShowThanks(true);
    setRecordingTime(0);

    // Notify parent that recording stopped (for demo purposes)
    onRecordingStop?.();

    // Auto-hide thanks message after 3 seconds
    setTimeout(() => setShowThanks(false), 3000);

    // Fire-and-forget upload in background
    (async () => {
      try {
        const formData = new FormData();
        formData.append('appId', appId);
        formData.append('audio', audioBlob, 'feedback.webm');
        formData.append('metadata', JSON.stringify({
          pageUrl: window.location.href,
          device: navigator.userAgent,
          locale: navigator.language,
          timestamp: new Date().toISOString(),
        }));

        const response = await fetch(`${endpoint}/api/feedback`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: FeedbackResponse = await response.json();
        onComplete?.(data);
      } catch (err) {
        console.error('Background upload failed:', err);
      }
    })();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Variant styles
  const variantStyles = {
    card: {
      padding: '2rem',
      gap: '1rem',
      titleSize: '1.5rem',
      subtitleSize: '0.875rem',
      buttonSize: 80,
      iconSize: 32,
      timerSize: '2rem',
      statusSize: '0.875rem',
    },
    compact: {
      padding: '1rem',
      gap: '0.5rem',
      titleSize: '1rem',
      subtitleSize: '0.875rem',
      buttonSize: 60,
      iconSize: 24,
      timerSize: '1.5rem',
      statusSize: '0.875rem',
    },
    small: {
      padding: '0.75rem',
      gap: '0.5rem',
      titleSize: '0.875rem',
      subtitleSize: '0.75rem',
      buttonSize: 48,
      iconSize: 20,
      timerSize: '1.25rem',
      statusSize: '0.75rem',
    },
  };

  const styles = variantStyles[variant];
  const showSubtitle = variant !== 'compact' && variant !== 'small';

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e5e5',
      borderRadius: variant === 'small' ? '8px' : '12px',
      padding: styles.padding,
      textAlign: 'center',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    }}>
      <div style={{ marginBottom: variant === 'small' ? '0.75rem' : '1.5rem' }}>
        <h2 style={{ 
          fontSize: styles.titleSize, 
          fontWeight: '600',
          marginBottom: variant === 'small' ? '0.25rem' : '0.5rem',
          color: '#0a0a0a',
          margin: '0 0 0.5rem 0',
        }}>
          {title}
        </h2>
        {showSubtitle && (subtitle !== undefined ? (
          subtitle ? (
            <p style={{ color: '#737373', fontSize: styles.subtitleSize, margin: 0 }}>
              {subtitle}
            </p>
          ) : null
        ) : (
          <p style={{ color: '#737373', fontSize: styles.subtitleSize, margin: 0 }}>
            Record up to {maxDurationSec} seconds of audio
          </p>
        ))}
      </div>

      {showThanks && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: variant === 'small' ? '0.75rem' : '1rem',
          marginBottom: styles.gap,
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: styles.statusSize,
        }}>
          <span>✅</span>
          <span>Thanks for your feedback!</span>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: variant === 'small' ? '0.75rem' : '1rem',
          marginBottom: styles.gap,
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: styles.statusSize,
        }}>
          <AlertIcon className="" style={{ width: variant === 'small' ? '14px' : '16px', height: variant === 'small' ? '14px' : '16px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: variant === 'small' ? '0.75rem' : styles.gap }}>
        {isRecording && (
          <div style={{ 
            fontSize: styles.timerSize, 
            fontWeight: '700',
            color: '#0a0a0a',
            fontVariantNumeric: 'tabular-nums',
            minHeight: variant === 'small' ? '1.75rem' : '2.5rem',
          }}>
            {formatTime(recordingTime)}
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={false}
          style={{
            background: isRecording ? '#0a0a0a' : '#0a0a0a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: `${styles.buttonSize}px`,
            height: `${styles.buttonSize}px`,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          {isRecording ? (
            <StopIcon className="" style={{ width: `${styles.iconSize}px`, height: `${styles.iconSize}px` }} />
          ) : (
            <MicIcon className="" style={{ width: `${styles.iconSize}px`, height: `${styles.iconSize}px` }} />
          )}
        </button>

        <p style={{ color: '#737373', fontSize: styles.statusSize, margin: 0 }}>
          {isRecording ? statusRecording : statusIdle}
        </p>
      </div>
    </div>
  );
}

export default EchoFeedback;
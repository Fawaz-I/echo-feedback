import { useState, useRef } from 'react';
import type { FeedbackResponse } from '@echo-feedback/types';

interface EchoFeedbackProps {
  appId: string;
  endpoint: string;
  maxDurationSec?: number;
  onComplete?: (data: FeedbackResponse) => void;
}

function EchoFeedback({ 
  appId, 
  endpoint, 
  maxDurationSec = 90,
  onComplete 
}: EchoFeedbackProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      setError('Microphone access denied. Please allow microphone access to record feedback.');
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
      setError('Recording too large. Please keep feedback under 5 MB.');
      return;
    }

    setIsProcessing(true);

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
      setRecordingTime(0);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
      border: '1px solid #667eea44',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Share Your Feedback</h2>
        <p style={{ color: '#888' }}>Record up to {maxDurationSec} seconds of audio</p>
      </div>

      {error && (
        <div style={{
          background: '#ef444422',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#ef4444',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {isRecording && (
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#667eea',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatTime(recordingTime)}
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            background: isRecording ? '#ef4444' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            fontSize: '2rem',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: isProcessing ? 0.5 : 1,
            transform: isRecording ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isRecording ? '0 0 20px #ef444444' : '0 0 20px #667eea44',
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = isRecording ? 'scale(1.15)' : 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = isRecording ? 'scale(1.1)' : 'scale(1)';
            }
          }}
        >
          {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎙️'}
        </button>

        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          {isProcessing ? 'Processing...' : isRecording ? 'Click to stop recording' : 'Click to start recording'}
        </p>
      </div>
    </div>
  );
}

export default EchoFeedback;
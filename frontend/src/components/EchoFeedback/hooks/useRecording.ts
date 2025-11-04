/**
 * Recording hook - manages MediaRecorder and recording state
 */

import { useState, useRef, useCallback } from 'react';

export interface UseRecordingOptions {
  maxDurationSec?: number;
  onStop?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
}

export function useRecording(options: UseRecordingOptions = {}) {
  const { maxDurationSec = 90, onStop, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onStop?.(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
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
      const errorMessage = 'Microphone access denied. Please allow microphone access to record feedback.';
      onError?.(errorMessage);
      console.error('Error accessing microphone:', err);
    }
  }, [maxDurationSec, onStop, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  };
}

/**
 * Upload hook - handles feedback upload to API
 */

import { useState, useCallback } from 'react';
import type { FeedbackResponse } from '@echo-feedback/types';

export interface UseUploadOptions {
  appId: string;
  endpoint: string;
  onComplete?: (data: FeedbackResponse) => void;
  onError?: (error: string) => void;
}

export function useUpload(options: UseUploadOptions) {
  const { appId, endpoint, onComplete, onError } = options;
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (audioBlob: Blob) => {
      // Check size limit (5 MB)
      if (audioBlob.size > 5 * 1024 * 1024) {
        const errorMessage = 'Recording too large. Please keep feedback under 5 MB.';
        onError?.(errorMessage);
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('appId', appId);
        formData.append('audio', audioBlob, 'feedback.webm');
        formData.append(
          'metadata',
          JSON.stringify({
            pageUrl: window.location.href,
            device: navigator.userAgent,
            locale: navigator.language,
            timestamp: new Date().toISOString(),
          })
        );

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
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        onError?.(errorMessage);
        console.error('Upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [appId, endpoint, onComplete, onError]
  );

  const uploadInBackground = useCallback(
    (audioBlob: Blob) => {
      // Fire-and-forget upload
      (async () => {
        try {
          const formData = new FormData();
          formData.append('appId', appId);
          formData.append('audio', audioBlob, 'feedback.webm');
          formData.append(
            'metadata',
            JSON.stringify({
              pageUrl: window.location.href,
              device: navigator.userAgent,
              locale: navigator.language,
              timestamp: new Date().toISOString(),
            })
          );

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
    },
    [appId, endpoint, onComplete]
  );

  return {
    isUploading,
    upload,
    uploadInBackground,
  };
}

import { useState } from 'react';
import EchoFeedback from './components/EchoFeedback';
import type { FeedbackResponse } from '@echo-feedback/types';
import { MicIcon } from './components/icons';

function App() {
  const [lastResponse, setLastResponse] = useState<FeedbackResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div style={{
      maxWidth: '800px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700',
          color: '#0a0a0a',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          <MicIcon className="" style={{ width: '2.5rem', height: '2.5rem' }} />
          Echo Feedback
        </h1>
        <p style={{ color: '#737373', fontSize: '1rem', margin: 0 }}>
          Voice-first feedback for your apps
        </p>
      </header>

      <EchoFeedback
        appId="demo_app"
        endpoint="http://localhost:3001"
        maxDurationSec={30}
        onRecordingStop={() => {
          setIsProcessing(true);
          setLastResponse(null);
        }}
        onComplete={(data) => {
          console.log('Feedback received:', data);
          setLastResponse(data);
          setIsProcessing(false);
        }}
      />

      {(isProcessing || lastResponse) && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: '#0a0a0a',
            fontSize: '1.125rem',
            fontWeight: '600',
          }}>
            {isProcessing ? 'Processing your feedback...' : 'Last Feedback'}
          </h3>
          {isProcessing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ 
                height: '3rem', 
                background: '#f5f5f5', 
                borderRadius: '6px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{ 
                height: '3rem', 
                background: '#f5f5f5', 
                borderRadius: '6px',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: '0.1s',
              }} />
              <div style={{ 
                height: '2rem', 
                background: '#f5f5f5', 
                borderRadius: '6px',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: '0.2s',
              }} />
            </div>
          ) : lastResponse ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong style={{ color: '#0a0a0a', fontSize: '0.875rem' }}>Transcript:</strong>
                <p style={{ color: '#404040', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>
                  {lastResponse.transcript}
                </p>
              </div>
              <div>
                <strong style={{ color: '#0a0a0a', fontSize: '0.875rem' }}>Summary:</strong>
                <p style={{ color: '#404040', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>
                  {lastResponse.summary}
                </p>
              </div>
              <div>
                <strong style={{ color: '#0a0a0a', fontSize: '0.875rem' }}>Category:</strong>
                <span style={{ 
                  background: '#f5f5f5',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  color: '#0a0a0a',
                  fontSize: '0.875rem',
                  marginLeft: '0.5rem',
                  display: 'inline-block',
                }}>
                  {lastResponse.category}
                </span>
              </div>
              <div>
                <strong style={{ color: '#0a0a0a', fontSize: '0.875rem' }}>Sentiment:</strong>
                <span style={{
                  background: lastResponse.sentiment === 'positive' ? '#f0fdf4' : 
                             lastResponse.sentiment === 'negative' ? '#fef2f2' : '#f5f5f5',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  color: lastResponse.sentiment === 'positive' ? '#166534' : 
                         lastResponse.sentiment === 'negative' ? '#991b1b' : '#404040',
                  fontSize: '0.875rem',
                  marginLeft: '0.5rem',
                  display: 'inline-block',
                }}>
                  {lastResponse.sentiment}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default App;
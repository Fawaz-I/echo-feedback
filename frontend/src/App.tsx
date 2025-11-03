import { useState } from 'react';
import EchoFeedback from './components/EchoFeedback';
import type { FeedbackResponse } from '@echo-feedback/types';

function App() {
  const [lastResponse, setLastResponse] = useState<FeedbackResponse | null>(null);

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
          fontSize: '3rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🎙️ Echo Feedback
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>
          Voice-first feedback for your apps
        </p>
      </header>

      <EchoFeedback
        appId="demo_app"
        endpoint="http://localhost:3001"
        maxDurationSec={90}
        onComplete={(data) => {
          console.log('Feedback received:', data);
          setLastResponse(data);
        }}
      />

      {lastResponse && (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Last Feedback</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p><strong>Transcript:</strong> {lastResponse.transcript}</p>
            <p><strong>Summary:</strong> {lastResponse.summary}</p>
            <p><strong>Category:</strong> <span style={{ 
              background: '#667eea33',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              color: '#667eea'
            }}>{lastResponse.category}</span></p>
            <p><strong>Sentiment:</strong> <span style={{
              background: lastResponse.sentiment === 'positive' ? '#10b98133' : 
                         lastResponse.sentiment === 'negative' ? '#ef444433' : '#64748b33',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              color: lastResponse.sentiment === 'positive' ? '#10b981' : 
                     lastResponse.sentiment === 'negative' ? '#ef4444' : '#64748b'
            }}>{lastResponse.sentiment}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
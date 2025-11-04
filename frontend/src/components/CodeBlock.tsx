import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#fafafa',
          fontSize: '0.875rem',
          transition: 'all 0.2s',
          zIndex: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        {copied ? (
          <>
            <Check size={16} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy</span>
          </>
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          borderRadius: '8px',
          padding: '1.5rem',
          fontSize: '0.875rem',
          margin: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

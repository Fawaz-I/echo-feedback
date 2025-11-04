# @echo-feedback/web

A customizable Web Component for voice feedback with shadcn-inspired theming.

## Installation

```bash
npm install @echo-feedback/web
```

Or use via CDN:

```html
<script type="module" src="https://cdn.echo-feedback.dev/web.esm.js"></script>
```

## Quick Start

```html
<echo-feedback 
  app-id="your_app_id" 
  endpoint="https://your-api.com"
  auto-upload>
</echo-feedback>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `app-id` | `string` | **required** | Your application ID |
| `endpoint` | `string` | **required** | API endpoint URL |
| `max-duration-sec` | `number` | `90` | Maximum recording duration |
| `variant` | `"card" \| "compact"` | `"card"` | Visual variant |
| `auto-upload` | `boolean` | `false` | Auto-upload when recording stops |
| `theme` | `string` | - | Custom theme name (for CSS targeting) |

## Methods

```javascript
const feedback = document.querySelector('echo-feedback');

// Start recording
await feedback.start();

// Stop recording
feedback.stop();

// Reset component
feedback.reset();
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `echo-start` | `void` | Recording started |
| `echo-stop` | `{ duration: number }` | Recording stopped |
| `echo-upload` | `{ size: number }` | Upload started |
| `echo-complete` | `FeedbackResponse` | Feedback processed |
| `echo-error` | `{ message: string, error?: Error }` | Error occurred |
| `echo-progress` | `{ elapsed: number, max: number }` | Recording progress |

### Event Example

```javascript
const feedback = document.querySelector('echo-feedback');

feedback.addEventListener('echo-complete', (e) => {
  console.log('Transcript:', e.detail.transcript);
  console.log('Summary:', e.detail.summary);
  console.log('Category:', e.detail.category);
  console.log('Sentiment:', e.detail.sentiment);
});

feedback.addEventListener('echo-error', (e) => {
  console.error('Error:', e.detail.message);
});
```

## Theming (shadcn-style)

### Using CSS Variables

Customize the component by overriding CSS variables:

```css
echo-feedback {
  /* Colors */
  --ef-bg: #ffffff;
  --ef-fg: #0a0a0a;
  --ef-accent: #667eea;
  --ef-accent-fg: #ffffff;
  --ef-error: #ef4444;
  --ef-border: #e5e5e5;
  --ef-muted: #f5f5f5;
  --ef-muted-fg: #737373;
  
  /* Spacing */
  --ef-radius: 12px;
  --ef-padding: 2rem;
  --ef-gap: 1rem;
  
  /* Typography */
  --ef-font-family: sans-serif;
  --ef-font-size-base: 1rem;
  --ef-font-size-lg: 1.5rem;
  --ef-font-size-sm: 0.875rem;
}
```

### Dark Mode

```html
<echo-feedback theme="dark" ...></echo-feedback>
```

Or use CSS:

```css
echo-feedback[theme="dark"] {
  --ef-bg: #0a0a0a;
  --ef-fg: #fafafa;
  --ef-muted: #262626;
  --ef-muted-fg: #a3a3a3;
  --ef-border: #404040;
}
```

### Custom Theme

```css
echo-feedback[theme="custom"] {
  --ef-accent: #10b981; /* Green accent */
  --ef-radius: 24px; /* Larger radius */
  --ef-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

## Slots

Customize content using named slots:

```html
<echo-feedback app-id="demo" endpoint="https://api.example.com">
  <!-- Custom header -->
  <div slot="header">
    <h2>💬 Share Your Thoughts</h2>
    <p>We'd love to hear from you!</p>
  </div>
  
  <!-- Custom trigger button -->
  <button slot="trigger" class="my-custom-button">
    🎤 Start Recording
  </button>
  
  <!-- Custom transcript display -->
  <div slot="transcript">
    <strong>What you said:</strong>
    <p id="my-transcript"></p>
  </div>
  
  <!-- Custom summary display -->
  <div slot="summary" id="my-summary"></div>
  
  <!-- Custom footer -->
  <div slot="footer">
    <small>Powered by Echo Feedback</small>
  </div>
</echo-feedback>
```

## CSS Parts

Style internal elements using `::part()`:

```css
echo-feedback::part(container) {
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
}

echo-feedback::part(mic-button) {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

echo-feedback::part(timer) {
  font-family: 'Monaco', monospace;
  font-size: 3rem;
}

echo-feedback::part(error) {
  border-left: 4px solid var(--ef-error);
}
```

### Available Parts

- `container` - Main wrapper
- `header` - Header section
- `title` - Title text
- `subtitle` - Subtitle text
- `error` - Error message
- `controls` - Controls section
- `timer` - Recording timer
- `meter` - Progress meter
- `meter-fill` - Progress fill
- `mic-button` - Microphone button
- `mic-icon` - Icon inside button
- `status` - Status text
- `results` - Results section
- `transcript-container` - Transcript wrapper
- `summary-container` - Summary wrapper
- `footer` - Footer section

## Variants

### Card (Default)

Polished card with gradient background:

```html
<echo-feedback variant="card" ...></echo-feedback>
```

### Compact

Minimal, space-efficient:

```html
<echo-feedback variant="compact" ...></echo-feedback>
```

## Framework Integration

### React

```tsx
import '@echo-feedback/web';
import { useRef, useEffect } from 'react';

function App() {
  const feedbackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = feedbackRef.current;
    if (!el) return;

    const handleComplete = (e: CustomEvent) => {
      console.log('Feedback:', e.detail);
    };

    el.addEventListener('echo-complete', handleComplete);
    return () => el.removeEventListener('echo-complete', handleComplete);
  }, []);

  return (
    <echo-feedback
      ref={feedbackRef}
      app-id="demo"
      endpoint="https://api.example.com"
      auto-upload
    />
  );
}
```

### Vue

```vue
<template>
  <echo-feedback
    app-id="demo"
    endpoint="https://api.example.com"
    @echo-complete="handleComplete"
    auto-upload
  />
</template>

<script setup>
import '@echo-feedback/web';

const handleComplete = (e) => {
  console.log('Feedback:', e.detail);
};
</script>
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14.1+

Requires:
- `MediaRecorder` API
- Custom Elements v1
- Shadow DOM v1

## TypeScript

```typescript
import '@echo-feedback/web';
import type { EchoFeedbackEventMap } from '@echo-feedback/web';

const feedback = document.querySelector('echo-feedback')!;

feedback.addEventListener('echo-complete', (e: CustomEvent<EchoFeedbackEventMap['echo-complete']['detail']>) => {
  console.log(e.detail.transcript);
});
```

## License

MIT

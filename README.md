# 🎙️ Echo Feedback

Voice-first feedback SDK and API for web and mobile apps.

## Features

- 🎤 Voice recording with MediaRecorder API
- 📝 Speech-to-text transcription (OpenAI Whisper by default, ElevenLabs optional)
- 🤖 AI-powered summarization & classification (GPT-4o-mini)
- 🔊 Text-to-speech summaries (ElevenLabs, optional)
- 🪝 Webhook integrations (Slack, Jira, GitHub, Notion)
- 📦 React SDK & Web Component

## Project Structure

```
echo-feedback/
├── backend/              # Bun + Hono API
├── frontend/             # React development playground
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── react-sdk/        # @echo-feedback/react (coming soon)
│   └── web-component/    # Web component (coming soon)
└── package.json          # Workspace root
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- OpenAI API key (required)
- ElevenLabs API key (optional - for alternative transcription)

### Installation

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Add your API keys to .env
```

### Development

```bash
# Start backend only
bun run dev

# Start both backend and frontend
bun run dev:all
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## API Endpoints

### `POST /api/feedback`

Submit voice feedback.

**Request:**
- `appId` (string) - Your app identifier
- `audio` (file) - Audio file (webm/mpeg/ogg, ≤120s, ≤5MB)
- `metadata` (JSON string) - Optional metadata

**Response:**
```json
{
  "id": "uuid",
  "transcript": "...",
  "summary": "...",
  "category": "bug|feature|praise|other",
  "sentiment": "positive|neutral|negative",
  "summary_tts_url": "/summaries/abc.mp3",
  "audio_url": "/uploads/xyz.webm"
}
```

## Tech Stack

- **Backend:** Bun, Hono, SQLite/Turso
- **Frontend:** React, TypeScript, Vite
- **AI Services:** OpenAI Whisper (transcription) & GPT (classification), ElevenLabs (optional STT/TTS)
- **Storage:** S3-compatible for audio files

## License

MIT

## Author

Fawaz Ilupeju - [GitHub](https://github.com/Fawaz-I)
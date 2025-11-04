# Echo Feedback — Project Knowledge

Voice-first feedback SDK and API built by **Fawaz Ilupeju**.

Echo Feedback enables users to record spoken feedback instead of typing.
It processes audio → transcript → summary → category → sentiment → (optional) TTS summary,
and exposes a developer-friendly widget + backend API that can integrate into any web or mobile app.

---

## 🧩 Core Architecture

### Frontend

- **Framework:** React + TypeScript
- **Optional:** Web Component version (`<echo-feedback>`)
- **Purpose:** Capture user voice and send audio to the backend
- **Key APIs:** `MediaRecorder` for recording, `fetch` for uploads
- **Output:** Displays transcript, summary, sentiment, category, and optional audio summary

### Backend

- **Runtime:** Bun + Hono
- **Endpoints:**
  - `/api/feedback` — handles file uploads and processing
  - `/api/webhook` — delivers structured data to external systems
- **Services:**
  - OpenAI **Whisper** for transcription (default)
  - GPT-4o-mini for summarization + classification
  - ElevenLabs **Speech-to-Text** (optional, if ELEVEN_API_KEY is set)
  - ElevenLabs **Text-to-Speech (TTS)** for voiced summaries (optional)
- **Storage:** SQLite or Turso for metadata, S3-compatible storage for audio
- **Integrations:** Slack, Jira, GitHub, Notion via webhooks

---

## ⚙️ Stack Decisions & Rationale

| Component        | Choice                    | Rationale                                         |
| ---------------- | ------------------------- | ------------------------------------------------- |
| Backend          | Bun + Hono                | Lightweight, TypeScript-native, fast API routes   |
| Transcription    | ElevenLabs STT            | Included in Fawaz’s free subscription (60+ hours) |
| Summarization    | gpt-5-nano-2025-08-07 (configurable) | Ultra-fast, cost-effective JSON classification |
| Speech Synthesis | ElevenLabs TTS            | Natural-sounding voice summaries                  |
| Frontend         | React + Vite              | Developer-friendly SDK distribution               |
| Data             | SQLite / Turso            | Simple to host and query                          |
| Integrations     | Webhooks                  | Decoupled delivery model                          |
| Hosting          | Render / Fly.io / Netlify | Low setup, easy deploy                            |

---

## 📡 API Contract

### `POST /api/feedback`

**Input (multipart/form-data):**

- `appId` (string)
- `audio` (file — webm/mpeg/ogg, ≤120s)
- `metadata` (JSON string; `{pageUrl, device, os, locale, appVersion}`)

**Response (JSON):**

```json
{
  "id": "uuid",
  "transcript": "User feedback text...",
  "summary": "Dark mode preference not persisting between sessions.",
  "category": "bug",
  "sentiment": "neutral",
  "summary_tts_url": "/summaries/abc.mp3",
  "audio_url": "/uploads/xyz.webm"
}
```

---

## 🧱 Data Model

### `feedback_items`

| Field           | Type      | Notes                           |
| --------------- | --------- | ------------------------------- |
| id              | uuid      | Primary key                     |
| app_id          | string    | Identifier for integrating app  |
| created_at      | timestamp | Auto-generated                  |
| source          | string    | web / ios / android             |
| duration_ms     | int       | Recording length                |
| audio_url       | string    | Path or S3 link                 |
| transcript      | text      | STT result                      |
| summary         | text      | GPT summary                     |
| category        | enum      | bug / feature / praise / other  |
| sentiment       | enum      | positive / neutral / negative   |
| priority        | enum      | low / medium / high             |
| summary_tts_url | string    | Optional voice summary          |
| metadata        | json      | Device, OS, locale, app version |
| webhook_status  | enum      | sent / failed / none            |

### `apps`

| Field          | Type      | Notes              |
| -------------- | --------- | ------------------ |
| app_id         | string    | Primary key        |
| name           | string    | App name           |
| webhook_url    | string    | Integration target |
| webhook_secret | string    | For HMAC signature |
| created_at     | timestamp | Auto-generated     |

---

## 📦 Frontend SDK Integration

### React Example

```tsx
import { EchoFeedback } from "@echo-feedback/react";

<EchoFeedback
  appId="app_123"
  endpoint="https://api.echo-feedback.com"
  maxDurationSec={90}
  onComplete={(data) => console.log(data)}
/>;
```

### Web Component Example

```html
<script src="https://cdn.echo-feedback.dev/web.js"></script>
<echo-feedback app-id="app_123" endpoint="https://api.echo-feedback.com">
</echo-feedback>
```

---

## 🔒 Security & Compliance

- HTTPS enforced end-to-end
- HMAC signatures for webhook verification
- Retention configurable (default 30 days)
- Automatic redaction of phone numbers / emails from transcripts
- Rate limits per `appId` and per IP
- File validation: reject >5 MB or >120 s recordings
- Audio access restricted to signed URLs

---

## 🪜 Milestones (Execution Plan)

| Day  | Deliverable                                          | Status |
| ---- | ---------------------------------------------------- | ------ |
| 1–2  | Frontend record/upload widget + backend API skeleton | ✅ Complete |
| 3–4  | Integrate ElevenLabs STT + GPT summarization         | ✅ Complete |
| 5–6  | Add ElevenLabs TTS + webhook delivery                | ✅ Webhooks Complete |
| 7    | Build Web Component + theming                        |
| 8–10 | Admin UI, tests, docs, deploy                        |

---

## 🧠 Prompts and AI Behaviors

### GPT Summarization Prompt

```
System: You are a classifier for user feedback. Output strict JSON only.

User:
Feedback transcript:
"""
{{TRANSCRIPT}}
"""

Return JSON with:
- summary (string)
- category (bug|feature|praise|other)
- sentiment (positive|neutral|negative)
- priority (low|medium|high)
- language (BCP-47 code)
```

### Code Generation Notes for Codebuff

- Use **Hono router** style (not Express).
- Use **Bun native fetch** for HTTP.
- All models return JSON only, never prose.
- Strict TypeScript types for requests/responses.
- Environment variables:
  - `OPENAI_API_KEY` (required)
  - `ELEVEN_API_KEY` (optional - use ElevenLabs instead of Whisper)
  - `SUMMARIZER_MODEL` (default: gpt-4o-mini)
  - `DATABASE_URL` (SQLite path, default: ./data.db)
  - `WEBHOOK_SECRET` (for HMAC signatures)
- Enforce ≤120 s recording limit.
- Log STT + GPT duration for observability.

### Webhook System

- **Auto-format** for Slack, Jira, GitHub, Notion based on URL detection
- **HMAC signatures** with `X-Echo-Signature` header for security
- **Async delivery** - doesn't block feedback response
- **Status tracking** - `sent`, `failed`, or `none` in database
- **Test endpoint** - `POST /api/apps/:appId/test-webhook`
- **App management** - Register apps with webhook URLs via `POST /api/apps`

---

## 🧩 Design Principles

- **Voice-first** feedback: frictionless and accessible.
- **Developer-first** integration: single-line SDK embed.
- **Privacy-aware** by default.
- **Low cost / performant** (Bun runtime, ElevenLabs free tier).
- **Portable** (runs on any small VPS or edge worker).

---

## 🧠 Future Extensions

- Emotion/tone detection via acoustic analysis
- Multilingual transcription + translation
- Analytics dashboard for themes & frequency
- Developer portal for API key management
- Inline feedback within mobile SDKs

---

## 🧾 License

**MIT License**

---

## 📘 Maintainer

**Fawaz Ilupeju**
Boston, MA – 2025
GitHub: [github.com/Fawaz-I](https://github.com/Fawaz-I)

# Development Guide

Complete guide for developing Echo Feedback locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

---

## Prerequisites

### Required

- **Bun** >= 1.0.0 ([Install](https://bun.sh/))
- **Node.js** >= 18.0.0 (for some tooling)
- **Git**

### Recommended

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/echo-feedback.git
cd echo-feedback
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
bun install
```

### 3. Configure Environment Variables

```bash
# Backend configuration
cd backend
cp .env.example .env

# Edit .env with your API keys
# Required: OPENAI_API_KEY
# Optional: ELEVEN_API_KEY, WEBHOOK_SECRET
```

### 4. Set Up Database

```bash
# Run database setup script
bun run ../scripts/setup-db.ts

# Optional: Seed with sample data
bun run ../scripts/seed.ts
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend API
cd backend
bun run dev

# Terminal 2: Frontend dev server
cd frontend
bun run dev
```

---

## Project Structure

```
echo-feedback/
├── backend/                 # Hono API server
│   ├── src/
│   │   ├── config/         # Configuration layer
│   │   ├── middleware/     # Request processing
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Main entry point
│   └── package.json
│
├── frontend/                # React demo app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Demo application
│   │   └── main.tsx
│   └── package.json
│
├── packages/
│   ├── shared-types/       # TypeScript types
│   ├── shared-utils/       # Shared utilities
│   └── web-component/      # Web Component
│
├── scripts/                # Maintenance scripts
├── docs/                   # Documentation
└── package.json            # Monorepo root
```

---

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate package

3. **Test your changes:**
   ```bash
   # Run tests
   bun test

   # Run specific package tests
   cd backend && bun test
   ```

4. **Commit with clear messages:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Convention

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

---

## Testing

### Running Tests

```bash
# All tests
bun test

# Watch mode
bun test --watch

# Backend only
cd backend && bun test

# With coverage
bun test --coverage
```

### Writing Tests

Tests are located next to source files in `__tests__` directories:

```typescript
// Example test file
import { describe, test, expect } from 'bun:test';

describe('MyFeature', () => {
  test('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Submit feedback (requires audio file)
curl -X POST http://localhost:3001/api/feedback \
  -F "appId=demo_app" \
  -F "audio=@test-audio.webm"
```

---

## Code Quality

### TypeScript

- Use strict mode (enabled by default)
- Define proper types (avoid `any`)
- Use interfaces for object shapes

### Best Practices

1. **Single Responsibility:** Each file/function does one thing
2. **DRY:** Don't repeat yourself - extract common logic
3. **Error Handling:** Use try-catch and proper error types
4. **Async/Await:** Prefer over .then() chains
5. **Comments:** Explain "why", not "what"

---

## Debugging

### Backend Debugging

```bash
# Enable debug logging
DEBUG=* bun run dev

# Check database contents
bun run scripts/check-db.ts
```

### Frontend Debugging

1. Open browser DevTools (F12)
2. Use React DevTools extension
3. Check Console for errors
4. Network tab for API calls

### Common Issues

**Database locked:**
```bash
# Close all database connections
rm data.db-wal data.db-shm
```

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install
```

---

## Common Tasks

### Add a New Route

1. Create route file in `backend/src/routes/`
2. Define route handlers
3. Import and mount in `backend/src/index.ts`
4. Add tests in `routes/__tests__/`

### Add a New Service

1. Create service file in `backend/src/services/`
2. Export functions
3. Add tests in `services/__tests__/`
4. Import in routes that need it

### Update Database Schema

1. Edit `scripts/setup-db.ts`
2. Create migration in `scripts/migrate.ts`
3. Update TypeScript types in `packages/shared-types/`

### Add New Webhook Platform

1. Add formatter in `backend/src/services/webhooks/formatters.ts`
2. Update URL detection logic
3. Add tests
4. Document in `docs/WEBHOOKS.md`

### Clean Old Uploads

```bash
# Preview files to delete (dry run)
DRY_RUN=true bun run scripts/clean-uploads.ts

# Delete files older than 30 days
bun run scripts/clean-uploads.ts

# Custom threshold (7 days)
MAX_FILE_AGE_DAYS=7 bun run scripts/clean-uploads.ts
```

---

## Workspace Commands

```bash
# Install dependencies for all workspaces
bun install

# Run command in specific workspace
bun run --filter backend dev
bun run --filter frontend dev

# Run command in all workspaces
bun run --filter '*' build

# Add dependency to specific workspace
cd backend && bun add hono

# Add dev dependency
cd frontend && bun add -d vite
```

---

## Environment Variables

### Backend (.env)

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
ELEVEN_API_KEY=...          # For ElevenLabs transcription
SUMMARIZER_MODEL=gpt-4o-mini
DATABASE_URL=./data.db
UPLOADS_DIR=./uploads
PORT=3001
WEBHOOK_SECRET=...
```

### Frontend (Vite)

```bash
# Vite proxy configured in vite.config.ts
# API proxied from http://localhost:3000 -> http://localhost:3001
```

---

## Troubleshooting

### "Cannot find module"

Clear and reinstall:
```bash
rm -rf node_modules bun.lockb
bun install
```

### Database errors

Reset database:
```bash
rm data.db
bun run scripts/setup-db.ts
bun run scripts/seed.ts
```

### TypeScript errors

Rebuild types:
```bash
bun run build
```

### API not responding

1. Check backend is running: `curl http://localhost:3001/health`
2. Check logs for errors
3. Verify environment variables are set

---

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Getting Help

- Check existing issues on GitHub
- Review documentation in `/docs`
- Ask in team chat/Slack
- Create detailed bug reports with:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Environment (OS, Bun version, etc.)

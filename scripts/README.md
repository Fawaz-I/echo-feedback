# Echo Feedback Scripts

Utility scripts for database management and maintenance.

## Available Scripts

### Database Setup

Initialize the database schema and create tables:

```bash
bun run scripts/setup-db.ts
```

This creates:
- `apps` table
- `feedback` table
- Indexes for optimized queries

### Database Seeding

Populate the database with sample data for testing:

```bash
bun run scripts/seed.ts
```

This creates:
- Demo app (`demo_app`)
- 3 sample feedback items (praise, bug, feature request)

### Database Migrations

Run database migrations (template for custom migrations):

```bash
bun run scripts/migrate.ts
```

Edit this file to add your own migration logic.

### Clean Old Uploads

Remove old audio files from uploads directory:

```bash
# Dry run (preview what would be deleted)
DRY_RUN=true bun run scripts/clean-uploads.ts

# Actually delete files older than 30 days
bun run scripts/clean-uploads.ts

# Custom age threshold (e.g., 7 days)
MAX_FILE_AGE_DAYS=7 bun run scripts/clean-uploads.ts
```

## Usage Examples

### Initial Setup

```bash
# 1. Set up database
bun run scripts/setup-db.ts

# 2. Seed with sample data (optional)
bun run scripts/seed.ts

# 3. Start the server
cd backend && bun run dev
```

### Maintenance

```bash
# Clean uploads older than 14 days
MAX_FILE_AGE_DAYS=14 bun run scripts/clean-uploads.ts

# Run migrations
bun run scripts/migrate.ts
```

## Environment Variables

All scripts respect the following environment variables:

- `DATABASE_URL` - Database file path (default: `./data.db`)
- `UPLOADS_DIR` - Uploads directory (default: `./uploads`)
- `MAX_FILE_AGE_DAYS` - Max file age for cleanup (default: `30`)
- `DRY_RUN` - Preview mode for cleanup (default: `false`)

## Adding Custom Scripts

1. Create a new `.ts` file in this directory
2. Add the shebang: `#!/usr/bin/env bun`
3. Make it executable: `chmod +x scripts/your-script.ts`
4. Run with: `bun run scripts/your-script.ts`

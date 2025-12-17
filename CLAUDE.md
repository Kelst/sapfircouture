# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm db:seed          # Create admin user (tsx scripts/seed-admin.ts)

# Database (Drizzle)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio GUI

# Docker services (PostgreSQL + MinIO)
docker compose up -d  # Start local services

# Make commands (production)
make prod             # Start production (builds and deploys with Caddy)
make stop             # Stop all containers
make logs             # View all logs
make logs-app         # View Next.js app logs
make backup           # Backup database to backups/
make restore FILE=x   # Restore database from file
make db-shell         # Connect to PostgreSQL shell
```

## Architecture

### Tech Stack
- Next.js 16 (App Router, RSC, Turbopack)
- TypeScript with strict mode
- Tailwind CSS 4 + shadcn/ui (new-york style)
- Drizzle ORM + PostgreSQL 16
- Better Auth for authentication
- MinIO (S3-compatible) for image storage
- next-intl for i18n (en/uk locales)
- Caddy for production reverse proxy + auto SSL

### Routing Structure
Public routes: `src/app/[locale]/(public)/` - home, catalog, about, contacts
Admin routes: `src/app/(admin)/admin/` - no locale prefix, auth-protected via middleware
Auth routes: `src/app/[locale]/(auth)/` - login page
API routes: `src/app/api/` - v1 REST endpoints, auth, upload, health

The locale prefix uses "as-needed" mode (default `en` has no prefix, `/uk/*` for Ukrainian).

### Key Directories
- `src/actions/` - Server Actions (collection, dress, settings, user, etc.)
- `src/lib/db/schema.ts` - Drizzle schema (single source of truth)
- `src/lib/auth/` - Better Auth configuration
- `src/lib/storage/s3.ts` - S3/MinIO client
- `src/lib/validators/` - Zod schemas for validation
- `src/lib/telegram/` - Telegram notification integration
- `src/components/ui/` - shadcn/ui components
- `src/components/admin/` - Admin panel components
- `src/components/public/` - Public site components
- `src/i18n/` - Internationalization config (routing.ts, config.ts)
- `messages/` - Translation JSON files (en.json, uk.json)

### Database Schema
Main tables: `collections`, `dresses`, `styles`, `heroSlides`, `pages`, `settings`, `contactRequests`, `socialLinks`, `dressViews`
Auth tables (Better Auth): `users`, `sessions`, `accounts`, `verifications`

Bilingual fields follow the pattern: `nameEn`/`nameUk`, `titleEn`/`titleUk`, `descriptionEn`/`descriptionUk`

### Middleware
`src/middleware.ts` handles:
- Admin route protection (redirects to `/login` if no session token)
- i18n routing for public pages (via next-intl)

### Path Aliases
`@/*` maps to `./src/*`

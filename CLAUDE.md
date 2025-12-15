# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm lint             # Run ESLint

# Database (Drizzle)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio GUI

# Docker services (PostgreSQL + MinIO)
docker compose up -d  # Start local services
```

## Architecture

### Tech Stack
- Next.js 16 (App Router, RSC, Turbopack)
- TypeScript with strict mode
- Tailwind CSS 4 + shadcn/ui (new-york style)
- Drizzle ORM + PostgreSQL
- Better Auth for authentication
- MinIO (S3-compatible) for image storage
- next-intl for i18n (en/uk locales)

### Routing Structure
All routes are under `src/app/[locale]/`:
- `(public)/` - Public pages (home, catalog, about, contacts)
- `(admin)/admin/` - Admin panel (dashboard, dresses, pages, settings)
- `api/` - API routes (auth, upload, health)

The locale prefix uses "as-needed" mode (default locale has no prefix).

### Key Directories
- `src/actions/` - Server Actions for mutations
- `src/lib/db/schema.ts` - Drizzle schema (single source of truth)
- `src/lib/auth/` - Better Auth configuration
- `src/lib/storage/s3.ts` - S3/MinIO client
- `src/lib/validators/` - Zod schemas
- `src/components/ui/` - shadcn/ui components
- `src/components/admin/` - Admin panel components
- `src/components/public/` - Public site components
- `messages/` - Translation JSON files (en.json, uk.json)

### Database Schema
Main tables: `dresses`, `categories`, `pages`, `settings`, `contactRequests`
Auth tables (Better Auth): `users`, `sessions`, `accounts`, `verifications`

Bilingual fields follow the pattern: `nameEn`/`nameUk`, `descriptionEn`/`descriptionUk`

### Path Aliases
`@/*` maps to `./src/*`

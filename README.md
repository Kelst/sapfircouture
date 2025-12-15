# Sapfir Couture - Wedding Salon Website

A professional wedding salon website with admin panel built with Next.js 15, TypeScript, and modern web technologies.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion
- **Backend**: Drizzle ORM, PostgreSQL 16, Better Auth
- **Storage**: MinIO (S3-compatible)
- **i18n**: next-intl (English + Ukrainian)
- **DevOps**: Docker Compose, Caddy

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### Local Development

1. **Start Docker services:**
   ```bash
   docker compose up -d
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env.local
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

6. **Open in browser:**
   - Website: http://localhost:3000
   - MinIO Console: http://localhost:9001

### Database Management

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## Project Structure

```
sapfircouture/
├── messages/           # i18n translations
├── drizzle/            # Database migrations
├── public/             # Static assets
└── src/
    ├── app/            # Next.js App Router
    │   ├── [locale]/   # Localized routes
    │   │   ├── (public)/  # Public pages
    │   │   └── (admin)/   # Admin panel
    │   └── api/        # API routes
    ├── components/     # React components
    ├── lib/            # Utilities
    ├── i18n/           # Internationalization
    ├── actions/        # Server actions
    ├── hooks/          # React hooks
    └── types/          # TypeScript types
```

## Features

### Public Website
- Home page with hero section
- Dress catalog with filters
- Individual dress pages with lightbox gallery
- About page
- Contact form with Telegram notifications
- Multi-language support (EN/UK)

### Admin Panel
- Dashboard with statistics
- Dress management (CRUD)
- Image upload to MinIO
- CMS pages editor
- Settings management

## Production Deployment

1. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Update Caddyfile:**
   ```
   your-domain.com {
       reverse_proxy app:3000
       encode gzip
   }
   ```

3. **Deploy:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret key (32+ chars) |
| `S3_ENDPOINT` | MinIO/S3 endpoint URL |
| `S3_ACCESS_KEY` | MinIO/S3 access key |
| `S3_SECRET_KEY` | MinIO/S3 secret key |
| `S3_BUCKET` | Storage bucket name |
| `S3_PUBLIC_URL` | Public URL for images |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (optional) |
| `TELEGRAM_CHAT_ID` | Telegram chat ID (optional) |

## License

Private - All rights reserved

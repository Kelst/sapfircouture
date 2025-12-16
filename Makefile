.PHONY: help dev prod stop restart logs build seed clean

# Default target
help:
	@echo "Sapfir Couture - Wedding Salon"
	@echo ""
	@echo "Usage:"
	@echo "  make dev      - Start development environment"
	@echo "  make prod     - Start production environment"
	@echo "  make stop     - Stop all containers"
	@echo "  make restart  - Restart production"
	@echo "  make logs     - View logs"
	@echo "  make build    - Rebuild production images"
	@echo "  make seed     - Create admin user"
	@echo "  make clean    - Remove all containers and volumes"
	@echo ""

# Development
dev:
	docker compose up -d
	@echo "Development environment started"
	@echo "PostgreSQL: localhost:5432"
	@echo "MinIO: localhost:9000 (console: localhost:9001)"

# Production
prod:
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Copy .env.example to .env and configure it."; \
		exit 1; \
	fi
	docker compose -f docker-compose.prod.yml up -d --build
	@echo ""
	@echo "Production environment started!"
	@echo "Caddy will automatically obtain SSL certificate for your domain."

# Stop containers
stop:
	docker compose -f docker-compose.prod.yml down
	docker compose down

# Restart production
restart:
	docker compose -f docker-compose.prod.yml restart

# View logs
logs:
	docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
logs-app:
	docker compose -f docker-compose.prod.yml logs -f app

logs-caddy:
	docker compose -f docker-compose.prod.yml logs -f caddy

logs-db:
	docker compose -f docker-compose.prod.yml logs -f postgres

# Rebuild images
build:
	docker compose -f docker-compose.prod.yml build --no-cache

# Create admin user
seed:
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found."; \
		exit 1; \
	fi
	docker compose -f docker-compose.prod.yml run --rm migrate sh -c "\
		corepack enable pnpm && \
		pnpm install --frozen-lockfile && \
		pnpm db:seed"

# Clean up
clean:
	docker compose -f docker-compose.prod.yml down -v
	docker compose down -v
	docker system prune -f
	@echo "Cleaned up all containers and volumes"

# Database shell
db-shell:
	docker exec -it wedding-db psql -U wedding -d wedding_salon

# Backup database
backup:
	@mkdir -p backups
	docker exec wedding-db pg_dump -U wedding wedding_salon > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/"

# Restore database
restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=backups/backup_xxx.sql"; \
		exit 1; \
	fi
	docker exec -i wedding-db psql -U wedding wedding_salon < $(FILE)
	@echo "Database restored from $(FILE)"

#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Create migrations tracking table if not exists
psql -c "
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"

# Get list of already applied migrations
APPLIED=$(psql -t -c "SELECT hash FROM __drizzle_migrations;" | tr -d ' ')

# Apply each migration in order
for migration in /drizzle/0*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration" .sql)

        # Check if already applied
        if echo "$APPLIED" | grep -q "^${filename}$"; then
            echo "⏭️  Skipping $filename (already applied)"
        else
            echo "📦 Applying $filename..."
            psql -f "$migration"
            psql -c "INSERT INTO __drizzle_migrations (hash) VALUES ('$filename');"
            echo "✅ Applied $filename"
        fi
    fi
done

echo "✅ All migrations completed successfully!"

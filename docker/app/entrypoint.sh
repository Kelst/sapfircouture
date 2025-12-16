#!/bin/sh
set -e

echo "🚀 Starting Sapfir Couture..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h ${DB_HOST:-postgres} -p ${DB_PORT:-5432} -U ${DB_USER:-wedding} -q; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Run database migrations
echo "📦 Running database migrations..."
node -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    console.log('✅ Migrations completed');
    sql.end();
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    sql.end();
    process.exit(1);
  });
"
echo "✅ Migrations completed"

# Start the application
echo "🎉 Starting Next.js server..."
exec node server.js

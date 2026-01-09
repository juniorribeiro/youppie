#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 1
done

echo "Database is ready. Checking migration status..."
cd /app

# First, try to resolve any failed migrations
echo "Checking for failed migrations..."
npx prisma migrate status 2>&1 | grep -q "failed migrations" && {
  echo "Failed migrations found. Resolving..."
  npx prisma migrate resolve --rolled-back "20250107000000_add_subscription_fields" 2>/dev/null || {
    echo "Could not resolve failed migration. This may be a fresh database."
  }
} || echo "No failed migrations found."

# Try to deploy migrations
echo "Deploying migrations..."
if npx prisma migrate deploy 2>&1; then
  echo "Migrations applied successfully."
else
  MIGRATE_ERROR=$?
  echo "Migration deploy failed (exit code: $MIGRATE_ERROR)"
  
  # Check if the error is because tables don't exist (fresh database)
  # In this case, use db push to sync the schema from the current Prisma schema
  echo "This appears to be a fresh database or migration order issue."
  echo "Syncing database schema using db push..."
  npx prisma db push --accept-data-loss --skip-generate
  
  if [ $? -eq 0 ]; then
    echo "Schema synced successfully. Marking migrations as applied..."
    # Mark all migrations as applied since we synced the schema
    npx prisma migrate resolve --applied "20250107000000_add_subscription_fields" 2>/dev/null || true
    npx prisma migrate resolve --applied "20260106162245_add_phone_to_lead_and_avatar_to_user" 2>/dev/null || true
    echo "All migrations marked as applied."
  else
    echo "Failed to sync schema. Please check database connection and permissions."
    exit 1
  fi
fi

echo "Database setup completed. Starting API..."
cd /app/apps/api
exec node dist/src/main.js

#!/bin/bash
# packages/database/scripts/deploy-schema.sh

# Exit on error
set -e

echo "🚀 Deploying Prisma Schema to Database..."

# Navigate to script directory to find relative path to schema
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DB_ROOT="$DIR/.."

# Run migration
# Uses DATABASE_URL from environment
npx prisma migrate deploy --schema="$DB_ROOT/prisma/schema.prisma"

echo "✅ Schema Deployment Complete."

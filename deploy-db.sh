#!/bin/bash
# Helper script to migrate and seed the database inside Docker
# Usage: ./deploy-db.sh

echo "Deploying Database via Docker..."
# Run as root to ensure permission to download engines if needed (though Debian image should have them)
docker-compose run --rm --user root api /bin/sh -c "cd packages/database && npx prisma migrate deploy && npx prisma db seed"
echo "Done!"

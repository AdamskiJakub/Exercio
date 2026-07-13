#!/bin/bash
# Deploy backend to Hetzner VPS
# Usage: ./scripts/deploy-backend.sh

set -e

HOST="exercio-vps"
REMOTE_DIR="/opt/exercio"
LOCAL_BACKEND_DIR="$(cd "$(dirname "$0")/../backend" && pwd)"

echo "🚀 Deploying backend to Hetzner VPS..."
echo ""

# 1. Copy backend files to server
echo "📦 Copying backend files..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='pnpm-lock.yaml' \
  "$LOCAL_BACKEND_DIR/" "$HOST:$REMOTE_DIR/"

# 2. Copy prisma.config.ts (it's in the root, not backend/)
echo "📄 Copying prisma.config.ts..."
rsync -avz "$(dirname "$LOCAL_BACKEND_DIR")/prisma.config.ts" "$HOST:$REMOTE_DIR/"

# 3. Rebuild and restart on server
echo "🔨 Rebuilding and restarting..."
ssh "$HOST" "cd $REMOTE_DIR && docker compose build --no-cache backend && docker compose up -d backend"

# 4. Run migrations
echo "🗄️  Running database migrations..."
ssh "$HOST" "cd $REMOTE_DIR && docker compose run --rm backend npx prisma migrate deploy"

echo ""
echo "✅ Backend deployed successfully!"
echo "   Check logs: ssh $HOST 'docker compose logs -f backend'"

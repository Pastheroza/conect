#!/usr/bin/env bash
set -e

# Load environment
source .env 2>/dev/null || true
REMOTE_HOST="${REMOTE_HOST:-dbystruev@conect.api.hurated.com}"
REMOTE_DIR="${REMOTE_DIR:-conect/app}"

echo "=== Deploying to conect.app.hurated.com ==="

# Parse arguments
COMMIT_MSG="Deploy app"
while getopts "m:" opt; do
  case $opt in
    m) COMMIT_MSG="$OPTARG" ;;
  esac
done

# Commit and push
echo "Committing changes: $COMMIT_MSG"
cd "$(dirname "$0")/.."
git add -A
git commit -m "$COMMIT_MSG" || true
echo "Pushing to git..."
git push --force-with-lease

# Deploy on server
echo "Deploying on server..."
ssh "$REMOTE_HOST" "cd $REMOTE_DIR && git pull && docker compose up -d --build"

echo "=== Deployment complete ==="
echo "App available at: https://conect.app.hurated.com"

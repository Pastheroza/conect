#!/usr/bin/env bash
# Usage: ./logs.sh [-f] [-n100] [--tail 50] etc.
# All arguments are passed to docker compose logs

source .env 2>/dev/null
REMOTE_HOST="${REMOTE_HOST:-dbystruev@conect.api.hurated.com}"
REMOTE_DIR="${REMOTE_DIR:-conect/backend}"

ssh "$REMOTE_HOST" "cd $REMOTE_DIR && docker compose logs $*"

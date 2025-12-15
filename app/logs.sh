#!/usr/bin/env bash
source .env 2>/dev/null
REMOTE_HOST="${REMOTE_HOST:-dbystruev@conect.api.hurated.com}"
REMOTE_DIR="${REMOTE_DIR:-conect/app}"

ssh "$REMOTE_HOST" "cd $REMOTE_DIR && docker compose logs $*"

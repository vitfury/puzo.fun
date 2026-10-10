#!/bin/bash
set -euo pipefail

# Builds the production frontend bundle into frontend/dist, which nginx serves
# as static files (see docker/nginx/tunnel.conf). Runs in a container because
# the deployment host has no node installed.
#
# VITE_API_URL must be passed at build time: Vite inlines import.meta.env at
# compile time, and the fallback in src/api/client.ts points at localhost, which
# would send every production request to the visitor's own machine.

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

VITE_API_URL="${VITE_API_URL:-/api/v1}"
NODE_IMAGE="${NODE_IMAGE:-node:20-alpine}"

echo "==> Building frontend (VITE_API_URL=$VITE_API_URL)"

docker run --rm \
  -v "$APP_DIR/frontend":/app \
  -w /app \
  -e "VITE_API_URL=$VITE_API_URL" \
  "$NODE_IMAGE" \
  sh -c "npm ci --no-audit --no-fund && npm run build"

if [ ! -f frontend/dist/index.html ]; then
  echo "!! Build produced no frontend/dist/index.html" >&2
  exit 1
fi

echo "==> Built $(du -sh frontend/dist | cut -f1) into frontend/dist"

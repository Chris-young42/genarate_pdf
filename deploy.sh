#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[resumeforge]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

CMD="${1:-deploy}"

if [ "$CMD" = "stop" ]; then
  log "Stopping containers..."
  docker stop resumeforge-frontend resumeforge-backend 2>/dev/null || true
  docker rm   resumeforge-frontend resumeforge-backend 2>/dev/null || true
  ok "Containers stopped and removed."
  exit 0
fi

if [ "$CMD" = "clean" ]; then
  log "Stopping containers..."
  docker stop resumeforge-frontend resumeforge-backend 2>/dev/null || true
  docker rm   resumeforge-frontend resumeforge-backend 2>/dev/null || true
  log "Removing images..."
  docker rmi resumeforge-frontend resumeforge-backend 2>/dev/null || true
  log "Removing network..."
  docker network rm resume-net 2>/dev/null || true
  ok "Cleaned up. Data in ./data is preserved."
  exit 0
fi

command -v docker >/dev/null 2>&1 || err "Docker is not installed."
log "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"

log "Building frontend image..."
docker build -t resumeforge-frontend ./frontend

log "Building backend image..."
docker build -t resumeforge-backend ./backend

ok "Images built."

log "Stopping existing containers (if any)..."
docker rm -f resumeforge-frontend resumeforge-backend 2>/dev/null || true

docker network inspect resume-net >/dev/null 2>&1 || docker network create resume-net

log "Starting backend..."
docker run -d \
  --name resumeforge-backend \
  --network resume-net \
  --network-alias backend \
  -v "${PROJECT_ROOT}/data:/app/data" \
  --restart unless-stopped \
  resumeforge-backend

log "Starting frontend..."
docker run -d \
  --name resumeforge-frontend \
  --network resume-net \
  -p 3000:3000 \
  --restart unless-stopped \
  resumeforge-frontend

log "Waiting for services..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    ok "Frontend is ready."
    break
  fi
  sleep 1
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ResumeForge is running!${NC}"
echo -e "${GREEN}  http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

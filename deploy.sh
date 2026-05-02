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

# ── stop ──
if [ "$CMD" = "stop" ]; then
  log "Stopping containers..."
  docker stop resumeforge-frontend resumeforge-backend 2>/dev/null || true
  docker rm   resumeforge-frontend resumeforge-backend 2>/dev/null || true
  ok "Containers stopped and removed."
  exit 0
fi

# ── clean ──
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

# ── deploy ──
command -v docker >/dev/null 2>&1 || err "Docker is not installed."
log "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"

CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:3000}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001/api/resumes}"

log "Building frontend image..."
docker build \
  --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
  -t resumeforge-frontend \
  ./frontend

log "Building backend image..."
docker build \
  -t resumeforge-backend \
  ./backend

ok "Images built."

log "Stopping existing containers (if any)..."
docker rm -f resumeforge-frontend resumeforge-backend 2>/dev/null || true

docker network inspect resume-net >/dev/null 2>&1 || docker network create resume-net

log "Starting backend..."
docker run -d \
  --name resumeforge-backend \
  --network resume-net \
  -e "CORS_ORIGIN=${CORS_ORIGIN}" \
  -v "${PROJECT_ROOT}/data:/app/data" \
  -p 3001:3001 \
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
  if curl -s -o /dev/null http://localhost:3001/api/resumes 2>/dev/null; then
    ok "Backend is ready."
    break
  fi
  sleep 1
done

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
echo -e "${GREEN}  Frontend : http://localhost:3000${NC}"
echo -e "${GREEN}  Backend  : http://localhost:3001${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Commands:"
echo "  bash deploy.sh          # deploy"
echo "  bash deploy.sh stop     # stop containers"
echo "  bash deploy.sh clean    # stop + remove images"
echo "  docker logs -f resumeforge-backend"
echo "  docker logs -f resumeforge-frontend"

#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

red()  { echo -e "\033[31m$1\033[0m"; }
green(){ echo -e "\033[32m$1\033[0m"; }

if [ $# -eq 0 ]; then
  echo "用法: safe-prisma.sh <prisma 子命令>"
  echo "示例: safe-prisma.sh migrate dev --name add_user"
  exit 1
fi

red "[1/3] 停后端..."
# 杀 nest 相关进程
pkill -f "nest start" 2>/dev/null || true
# Windows 备选
taskkill //F //FI "WINDOWTITLE eq nest*" 2>/dev/null || true
sleep 1

# 确认 dev.db 没被占用 (超时 5s)
for i in 1 2 3 4 5; do
  if ! fuser "$BACKEND_DIR/prisma/dev.db" 2>/dev/null; then
    break
  fi
  sleep 1
done

green "[2/3] 执行: npx prisma $*"
cd "$BACKEND_DIR"
npx prisma "$@"
EXIT=$?

green "[3/3] 启后端..."
cd "$BACKEND_DIR"
nohup npm run dev > /dev/null 2>&1 &
sleep 2

green "✓ 完成，后端已在后台运行"
exit $EXIT

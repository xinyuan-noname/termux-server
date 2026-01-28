#!/bin/bash

set -euo pipefail

# 日志和文件配置
LOG_DIR="logs"
URL_FILE="url.txt"
CLOUDFLARED_LOG="$LOG_DIR/cloudflared.log"
APP_DEV_LOG="$LOG_DIR/app-dev.log"

# 确保日志目录存在
mkdir -p "$LOG_DIR"

# 加载 .env（如果存在）
[ -f .env ] && source .env

# 设置默认端口3000
export PORT="${PORT:-3000}"

# 开发者模式：默认关闭
DEV_MODE=false
[ "${NODE_ENV:-}" == "dev" ] && DEV_MODE=true

# 初始化 PID 变量（用于 cleanup）
SERVER_PID=""
REDIS_PID=""
TUNNEL_PID=""

# 检查必要命令
required_cmds=("redis-server" "cloudflared")
if [[ "$DEV_MODE" == "true" ]]; then
  required_cmds+=("nodemon")
else
  required_cmds+=("node")
fi

for cmd in "${required_cmds[@]}"; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Error: Required command '$cmd' not found." >&2
    exit 1
  fi
done

# 清理函数：终止所有子进程
cleanup() {
  local pids=()
  [[ -n "$SERVER_PID" ]] && pids+=("$SERVER_PID")
  [[ -n "$REDIS_PID" ]]  && pids+=("$REDIS_PID")
  [[ -n "$TUNNEL_PID" ]] && pids+=("$TUNNEL_PID")

  if [ ${#pids[@]} -gt 0 ]; then
    echo -e "\n🧹 Shutting down services..."
    # 发送 SIGTERM
    kill "${pids[@]}" 2>/dev/null || true
    # 等待最多 2 秒
    sleep 2
    # 强制 kill 剩余进程
    for pid in "${pids[@]}"; do
      if kill -0 "$pid" 2>/dev/null; then
        echo "⚠️  Force killing $pid"
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
  fi
}

# 注册清理函数（覆盖 EXIT、INT、TERM）
trap cleanup EXIT INT TERM

# 启动 Node.js 或 Nodemon（根据 DEV_MODE）
if [[ "$DEV_MODE" == "true" ]]; then
  echo "🛠️  Developer mode enabled. Clearing dev log: $APP_DEV_LOG"
  > "$APP_DEV_LOG"
  echo "🚀 Starting Nodemon server on port $PORT (logging to $APP_DEV_LOG)..."
  nodemon src/server.js > "$APP_DEV_LOG" 2>&1 &
else
  echo "🚀 Starting Node.js server on port $PORT..."
  node src/server.js &
fi
SERVER_PID=$!

# 启动 Redis（非 daemon 模式，便于管理）
echo "🚀 Starting Redis server..."
redis-server --daemonize no > "$LOG_DIR/redis.log" 2>&1 &
REDIS_PID=$!

# 等待服务就绪（可选，根据实际调整）
sleep 1

# 启动 Cloudflare Tunnel
echo "🚇 Starting Cloudflare Tunnel..."
cloudflared tunnel --url "http://127.0.0.1:$PORT" > "$CLOUDFLARED_LOG" 2>&1 &
TUNNEL_PID=$!

# 清空 URL 文件
> "$URL_FILE"

# 尝试获取公网 URL（最多 10 秒）
echo "⏳ Waiting for Cloudflare Tunnel URL (max 10s)..."
for i in {1..20}; do
  # 检查 tunnel 是否还在运行
  if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
    echo "❌ Cloudflared exited unexpectedly."
    exit 1
  fi

  URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$CLOUDFLARED_LOG" 2>/dev/null | head -n1)
  if [ -n "$URL" ]; then
    echo "$URL" > "$URL_FILE"
    echo "✅ Public URL: $URL"
    cat "$URL_FILE"
    exit 0
  fi
  sleep 0.5
done

echo "❌ Failed to get Cloudflare Tunnel URL within timeout."
exit 1
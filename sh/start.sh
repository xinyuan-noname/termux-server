#!/bin/bash

# dev-or-prod.sh - 启动开发或生产环境脚本

set -e  # 遇到错误立即退出

# 创建日志目录（如果不存在）
mkdir -p logs/prod
mkdir -p logs/dev

# 从环境变量读取配置 确保.env是LF而非CRLF
[ -f .env ] && source .env
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-development}

REDIS_LOG="logs/prod/redis.log"
[ "$NODE_ENV" == "development" ] && REDIS_LOG="logs/dev/redis.log"

APP_LOG="logs/prod/app.log"
[ "$NODE_ENV" == "development" ] && APP_LOG="logs/dev/app.log"

ERROR_LOG="logs/prod/error.log"
[ "$NODE_ENV" == "development" ] && ERROR_LOG="logs/dev/error.log"

CLOUDFLARED_LOG="logs/prod/cloudflared.log"
[ "$NODE_ENV" == "development" ] && CLOUDFLARED_LOG="logs/dev/cloudflared.log"

WORKER_LOG="logs/prod/worker.log"
[ "$NODE_ENV" == "development" ] && WORKER_LOG="logs/dev/worker.log"

kill -9 $(lsof -ti:49999) $(lsof -ti:$PORT) $(lsof -ti:6379) || true
echo "Starting application in $NODE_ENV mode on port $PORT..."

# 清理开发日志（仅在开发模式下）
if [[ "$NODE_ENV" == "development" ]]; then
    echo "Clearing app-dev.log..."
    > "$APP_LOG"
    > "$ERROR_LOG"
    > "$CLOUDFLARED_LOG"
    > "$REDIS_LOG"
    > "$WORKER_LOG"
fi

# 函数：清理并退出
cleanup() {
    echo "Shutting down services..."
    if [[ "$NODE_ENV" == "development" ]] && pgrep -f "nodemon.*src/server.js" > /dev/null; then
        pkill -f "nodemon.*src/server.js"
        elif [[ "$NODE_ENV" != "development" ]] && pgrep -f "node.*src/server.js" > /dev/null; then
        pkill -f "node.*src/server.js"
    fi
    if [[ "$NODE_ENV" == "development" ]] && pgrep -f "nodemon.*src/workers/index.worker.js" > /dev/null; then
        pkill -f "nodemon.*src/workers/index.worker.js"
        elif [[ "$NODE_ENV" != "development" ]] && pgrep -f "node.*src/workers/index.worker.js" > /dev/null; then
        pkill -f "node.*src/workers/index.worker.js"
    fi
    if pgrep redis-server > /dev/null; then
        redis-cli shutdown
    fi
    if [[ -n "$TUNNEL_PID" ]]; then
        kill "$TUNNEL_PID" 2>/dev/null || true
    fi
    exit 0
}

# 启动 Redis（后台运行）
echo "Starting redis-server..."
redis-server --daemonize yes --loglevel notice --logfile "$REDIS_LOG"

# 注册退出信号处理
trap cleanup SIGINT SIGTERM

# 启动应用服务器（根据 NODE_ENV 选择 nodemon 或 node）
# 启动应用服务器
if [[ "$NODE_ENV" == "development" ]]; then
    echo "Starting server with nodemon..."
    nodemon src/server.js &
    SERVER_PID=$!
    
    echo "Starting worker with nodemon..."
    nodemon src/workers/index.worker.js &          
    WORKER_PID=$!
else
    echo "Starting server with node..."
    node src/server.js &
    SERVER_PID=$!
    
    echo "Starting worker with node..."
    node src/workers/index.worker.js &
    WORKER_PID=$!
fi

# 等待服务器启动（简单等待5秒，可根据需要调整）
sleep 5

# 检查服务器是否成功启动
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Error: Server failed to start." >&2
    cleanup
fi

# 启动 cloudflared tunnel 并获取临时 URL
echo "Starting cloudflared tunnel on localhost:$PORT..."
cloudflared tunnel --url "http://localhost:$PORT" --metrics 127.0.0.1:49999 --protocol http2 > "$CLOUDFLARED_LOG" 2>&1 &
TUNNEL_PID=$!

# 等待 cloudflared 初始化并提取临时 URL
echo "Waiting for cloudflared to assign a public URL..."
sleep 8

# 尝试从 cloudflared 日志中提取临时 URL
TEMP_URL=""
for i in {1..10}; do
    TEMP_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$CLOUDFLARED_LOG" | head -n1)
    if [[ -n "$TEMP_URL" ]]; then
        break
    fi
    sleep 2
done

if [[ -n "$TEMP_URL" ]]; then
    echo ""
    echo "✅ Temporary public URL: $TEMP_URL"
    echo ""
    printf '%s' "$TEMP_URL" > url.txt&&\
    git add url.txt >/dev/null&&\
    git commit -m "change url" >/dev/null&&\
    git push -u origin main >/dev/null&&\
    echo "✅ URl push to origin"
else
    echo "⚠️  Warning: Could not extract temporary URL from cloudflared logs."
    echo "   Check $CLOUDFLARED_LOG for details."
fi

# 等待主进程结束（保持脚本运行）
wait "$SERVER_PID"
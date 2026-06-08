#!/usr/bin/env bash
# 固定使用 3000 端口启动 Next.js dev server
# 若端口被占用，先终止占用进程，再启动

set -euo pipefail

PORT="${PORT:-3000}"

# 查询占用该端口的进程 PID
pids="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN || true)"

if [[ -n "${pids}" ]]; then
  echo "[restart-dev] 端口 ${PORT} 已被占用，PID: ${pids}，准备终止..."
  # 先尝试优雅退出
  kill ${pids} 2>/dev/null || true

  # 等待最多 5 秒确认释放
  for _ in 1 2 3 4 5; do
    sleep 1
    still="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN || true)"
    if [[ -z "$still" ]]; then
      break
    fi
  done

  # 仍未释放则强制 kill
  still="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN || true)"
  if [[ -n "${still}" ]]; then
    echo "[restart-dev] 未优雅退出，强制终止 PID: ${still}"
    kill -9 ${still} 2>/dev/null || true
    sleep 1
  fi
  echo "[restart-dev] 端口 ${PORT} 已释放"
else
  echo "[restart-dev] 端口 ${PORT} 空闲"
fi

echo "[restart-dev] 在端口 ${PORT} 启动 next dev"
exec npx next dev -p "${PORT}"

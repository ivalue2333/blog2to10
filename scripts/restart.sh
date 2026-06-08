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

echo "[restart-dev] 在端口 ${PORT} 后台启动 next dev"

LOG_DIR="${LOG_DIR:-.dev-logs}"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/next-dev-${PORT}.log"
PID_FILE="${LOG_DIR}/next-dev-${PORT}.pid"

# 后台启动，脱离当前 shell，输出重定向到日志文件
nohup npx next dev -p "${PORT}" >"${LOG_FILE}" 2>&1 &
NEXT_PID=$!
disown "${NEXT_PID}" 2>/dev/null || true

echo "${NEXT_PID}" >"${PID_FILE}"
echo "[restart-dev] 已后台启动，PID: ${NEXT_PID}"
echo "[restart-dev] 日志: ${LOG_FILE}"
echo "[restart-dev] 查看日志: tail -f ${LOG_FILE}"
echo "[restart-dev] 停止服务: kill \$(cat ${PID_FILE})"

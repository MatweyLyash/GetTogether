#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACK="$ROOT/Back"
FRONT="$ROOT/Front/GetTogether"
LOGS="$ROOT/logs"

mkdir -p "$LOGS"

kill_port() {
  local port="$1"
  if lsof -ti:"$port" >/dev/null 2>&1; then
    echo "Освобождаю порт $port..."
    lsof -ti:"$port" | xargs -r kill -9
  fi
}

# Освобождаем порты 3000 и 5000 (vite и backend)
kill_port 3000
kill_port 5000

echo "Запуск бэкенда..."
cd "$BACK"
npm run start > "$LOGS/back.log" 2>&1 &

echo "Запуск фронтенда..."
cd "$FRONT"
npm run dev > "$LOGS/front.log" 2>&1 &

echo "Логи:"
echo "  Backend: $LOGS/back.log"
echo "  Front:   $LOGS/front.log"

# Ngrok отключен: текущий IP заблокирован (ERR_NGROK_9040).
# Если блокировка снимется, запустите вручную в отдельном терминале:
ngrok http https://localhost:3000
echo "Ngrok не запускается (ERR_NGROK_9040). Запустите вручную, если доступно."
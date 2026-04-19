#!/usr/bin/env bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Останавливаю процессы бэкенда и фронтенда..."

kill_port() {
  local port="$1"
  if lsof -ti:"$port" >/dev/null 2>&1; then
    echo "Убиваю процесс на порту $port..."
    lsof -ti:"$port" | xargs -r kill 2>/dev/null || true
  fi
}

kill_port 3000
kill_port 5000

echo ""
echo "Остановить PostgreSQL? (y/n)"
read -r answer
if [ "$answer" = "y" ]; then
  docker compose -f "$ROOT/docker-compose.dev.yml" down
  echo "PostgreSQL остановлен."
else
  echo "PostgreSQL оставлен работать."
fi

echo "Готово."

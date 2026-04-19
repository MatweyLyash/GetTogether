#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACK="$ROOT/Back"
FRONT="$ROOT/Front"
LOGS="$ROOT/logs"

mkdir -p "$LOGS"

echo "=== Запуск тестового окружения GetTogether ==="
echo ""

# Проверяем, запущен ли postgres
if ! docker compose -f "$ROOT/docker-compose.dev.yml" ps postgres 2>/dev/null | grep -q "running\|healthy"; then
  echo "Запускаю PostgreSQL через Docker..."
  docker compose -f "$ROOT/docker-compose.dev.yml" up -d postgres
  echo "Жду готовности PostgreSQL..."
  sleep 3
else
  echo "PostgreSQL уже запущен."
fi

kill_port() {
  local port="$1"
  if lsof -ti:"$port" >/dev/null 2>&1; then
    echo "Освобождаю порт $port..."
    lsof -ti:"$port" | xargs -r kill -9 2>/dev/null || true
  fi
}

kill_port 3000
kill_port 5000

echo "Запуск бэкенда (nodemon)..."
cd "$BACK"
npx sequelize-cli db:migrate 2>/dev/null || echo "Миграции не нужны или уже применены"
npm run dev > "$LOGS/back.log" 2>&1 &
BACK_PID=$!

echo "Запуск фронтенда (Vite dev server)..."
cd "$FRONT"
npm run dev > "$LOGS/front.log" 2>&1 &
FRONT_PID=$!

echo ""
echo "=== Всё запущено ==="
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Логи:"
echo "    Backend:  $LOGS/back.log"
echo "    Frontend: $LOGS/front.log"
echo ""
echo "PID процессов:"
echo "  Backend:  $BACK_PID"
echo "  Frontend: $FRONT_PID"
echo ""
echo "Для остановки: kill $BACK_PID $FRONT_PID"
echo "  или: ./stop_dev.sh"
echo ""

wait

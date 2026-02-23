#!/bin/bash
set -e
cd "$(dirname "$0")"

trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Installing dependencies..."
npm install

echo "Starting VizAdvisor (dev server + API proxy)..."
npm run dev:full &
PID=$!

# Wait for Vite to be ready
echo "Waiting for server to start..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 0.5
done

echo "Opening browser to http://localhost:5173/advisor"
open "http://localhost:5173/advisor"

wait $PID

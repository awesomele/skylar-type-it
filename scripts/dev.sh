#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/_local_do_not_track_app"
BACKUP_DIR="$ROOT_DIR/_backup"
PORT="${PORT:-5173}"
HOST="${HOST:-0.0.0.0}"
RUNTIME="${1:-npm}"

# Pre-dev cleanup to avoid stale local-install artifacts.
mkdir -p "$BACKUP_DIR"
for dir in "$ROOT_DIR"/_local_do_not_track_app.bak.*; do
  if [[ -d "$dir" ]]; then
    mv "$dir" "$BACKUP_DIR"/
  fi
done

# Clear Vite caches so local config changes apply cleanly.
if [[ -d "$APP_DIR/node_modules/.vite" ]]; then
  find "$APP_DIR/node_modules/.vite" -mindepth 1 -delete
fi
if [[ -d "$APP_DIR/node_modules/.vite-temp" ]]; then
  find "$APP_DIR/node_modules/.vite-temp" -mindepth 1 -delete
fi

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "Bootstrapping local app at $APP_DIR ..."
  mkdir -p "$APP_DIR"
  (cd "$APP_DIR" && npm create vite@latest . -- --template react-ts)
fi

if [[ ! -d "$APP_DIR/node_modules" ]]; then
  echo "Installing app dependencies..."
  if [[ "$RUNTIME" == "bun" ]]; then
    (cd "$APP_DIR" && bun install)
  else
    npm --prefix "$APP_DIR" install
  fi
fi

# Ensure Tailwind tooling exists for utility classes used by typing-practice.tsx.
if ! grep -q '"@tailwindcss/vite"' "$APP_DIR/package.json"; then
  npm --prefix "$APP_DIR" install -D tailwindcss @tailwindcss/vite
fi

# Keep the source TSX in sync when edited at repo root.
if [[ -f "$ROOT_DIR/typing-practice.tsx" ]]; then
  cp "$ROOT_DIR/typing-practice.tsx" "$APP_DIR/src/typing-practice.tsx"
fi

# Ensure Vite uses Tailwind plugin.
cat > "$APP_DIR/vite.config.ts" <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
EOF

# Ensure Tailwind styles are loaded.
cat > "$APP_DIR/src/index.css" <<'EOF'
@import "tailwindcss";

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}
EOF

# Ensure Vite entry renders typing-practice.
MAIN_FILE="$APP_DIR/src/main.tsx"
if grep -q "import App from './App.tsx'" "$MAIN_FILE"; then
  sed -i '' "s#import App from './App.tsx'#import App from './typing-practice'#" "$MAIN_FILE"
fi

if [[ "$RUNTIME" == "bun" ]]; then
  (cd "$APP_DIR" && bunx vite --host "$HOST" --port "$PORT")
else
  npm --prefix "$APP_DIR" run dev -- --host "$HOST" --port "$PORT"
fi

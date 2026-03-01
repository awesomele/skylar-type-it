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

# Ensure Tailwind tooling exists for utility classes used by src/.
if ! grep -q '"@tailwindcss/vite"' "$APP_DIR/package.json"; then
  npm --prefix "$APP_DIR" install -D tailwindcss @tailwindcss/vite
fi

# Sync the tracked source directory into the local app.
# Excludes test files and Vite-scaffold files managed below.
if [[ -d "$ROOT_DIR/src" ]]; then
  rsync -a \
    --exclude '__tests__' \
    --exclude '*.test.ts' \
    --exclude '*.test.tsx' \
    "$ROOT_DIR/src/" "$APP_DIR/src/"
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

# Point Vite entry at src/TypingPractice.
MAIN_FILE="$APP_DIR/src/main.tsx"
cat > "$MAIN_FILE" <<'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './TypingPractice'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
EOF

if [[ "$RUNTIME" == "bun" ]]; then
  (cd "$APP_DIR" && bunx vite --host "$HOST" --port "$PORT")
else
  npm --prefix "$APP_DIR" run dev -- --host "$HOST" --port "$PORT"
fi

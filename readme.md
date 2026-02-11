# Skylar Type It

Run the app from repo root with one command:

```bash
npm run dev
```

Open:
- http://localhost:5173/

Notes:
- This launcher auto-syncs `typing-practice.tsx` into `_local_do_not_track_app/src/typing-practice.tsx`.
- It also ensures `main.tsx` points to `typing-practice`.
- Local scaffold folder name is explicit by design: `_local_do_not_track_app` (ignored by git).
- It auto-cleans stale backup folders and Vite cache before launch.
- If the local app is missing, it bootstraps Vite + Tailwind automatically.

Optional Bun runtime:

```bash
npm run dev:bun
```

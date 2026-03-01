# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server at http://localhost:5173
npm run dev:bun      # same, using Bun runtime

npm test             # run tests in watch mode
npm run test:run     # run tests once
```

To run a single test file:
```bash
npx vitest run src/__tests__/TypingPractice.test.tsx
```

There is no separate lint or build command at the repo root — the dev server build happens inside `_local_do_not_track_app/` via `scripts/dev.sh`.

## Architecture

**Two-layer repo layout:** tracked source lives in `src/`, but the Vite dev server runs from `_local_do_not_track_app/` (gitignored). `scripts/dev.sh` rsyncs `src/` into the scaffold on every `npm run dev`, excluding test files. Never edit files inside `_local_do_not_track_app/` directly.

**Single orchestrator component:** `TypingPractice.tsx` owns all session state and wires together every hook and component. It is the only stateful component; all others are presentational and receive props. The main logic paths are `handleTypingInput` and `handleMemorizeInput`, both called from the shared `handleInputChange` handler.

**Two practice modes (controlled by `PracticeMode` type):**
- `typing` — user types a full generated passage character-by-character; WPM and accuracy track in real time.
- `memorize` — user types one word at a time from a vocabulary list; each correct word triggers speech synthesis and advances `currentWordIndex`.

**State flow between hooks:**
- `useStreak` — tracks `consecutiveCorrect` / `highestStreak`; `TypingPractice` checks the streak values *before* calling `streak.recordCorrect()` to decide whether to trigger a record-break animation.
- `useAnimations` — exposes `triggerRecordBreak()` and `triggerCompletion()`, which set timed boolean flags consumed by `AnimationEffects` components.
- `useAudio` / `useSpeech` — called from the input handlers; speech fires on word completion, audio fires on each correct/incorrect keystroke.

**Text generation:** `generateText()` in `utils/textGeneration.ts` selects words randomly from either the default pool or a user-supplied list. For memorize mode it also parses vocabulary definitions via `parseVocabList()`, which expects lines in `word - explanation` format (multi-line definitions supported).

**Testing setup:** Vitest + jsdom + Testing Library. Web Audio API and Web Speech API are both mocked in `src/__tests__/setup.ts` because jsdom does not implement them. Tests use `vi` globals (configured via `vitest.config.ts`).

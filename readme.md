# Skylar Type It

Run the app from repo root with one command:

```bash
npm run dev
```

Open:
- http://localhost:5173/

Run tests:

```bash
npm test          # watch mode
npm run test:run  # single run
```

Source layout (tracked by git):

```
src/
  TypingPractice.tsx       # main component
  types.ts                 # shared TypeScript types
  constants.ts             # word pools and defaults
  utils/
    formatting.ts          # formatTime
    textGeneration.ts      # generateText, getMaxPassageLength
  hooks/
    useAudio.ts            # Web Audio API (click/error sounds)
    useSpeech.ts           # Web Speech API (word pronunciation)
    useStreak.ts           # consecutive correct / best streak
    useAnimations.ts       # confetti and celebration effects
  components/
    AnimationEffects.tsx   # MiniConfetti, FullConfetti, SoccerBalls
    ControlPanel.tsx       # mode, length, speak toggle
    CompletionBanner.tsx   # completion message
    ProgressBar.tsx        # memorize mode progress
    StatisticsGrid.tsx     # errors / streak / best / WPM grid
    TextDisplay.tsx        # passage rendering and hidden input
    VocabularyEditor.tsx   # expandable custom pool editor
  __tests__/               # Vitest + Testing Library tests
```

Notes:
- `dev.sh` rsyncs `src/` into `_local_do_not_track_app/src/` (test files excluded).
- Local scaffold folder `_local_do_not_track_app` is gitignored.
- It auto-cleans stale backup folders and Vite cache before launch.
- If the local app is missing, it bootstraps Vite + Tailwind automatically.

Optional Bun runtime:

```bash
npm run dev:bun
```

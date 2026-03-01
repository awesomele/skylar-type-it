import { useState } from 'react';

export interface StreakState {
  consecutiveCorrect: number;
  highestStreak: number;
  justBrokeRecord: boolean;
}

export interface StreakActions {
  recordCorrect: () => void;
  recordError: () => void;
  reset: () => void;
}

export function useStreak(): StreakState & StreakActions {
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [justBrokeRecord, setJustBrokeRecord] = useState(false);

  function recordCorrect() {
    setConsecutiveCorrect((prev) => {
      const next = prev + 1;
      setHighestStreak((best) => {
        if (next > best) {
          setJustBrokeRecord(true);
          setTimeout(() => setJustBrokeRecord(false), 200);
          return next;
        }
        return best;
      });
      return next;
    });
  }

  function recordError() {
    setConsecutiveCorrect(0);
  }

  function reset() {
    setConsecutiveCorrect(0);
    setHighestStreak(0);
    setJustBrokeRecord(false);
  }

  return { consecutiveCorrect, highestStreak, justBrokeRecord, recordCorrect, recordError, reset };
}

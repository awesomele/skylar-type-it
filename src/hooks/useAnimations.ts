import { useState } from 'react';

export interface AnimationState {
  showConfetti: boolean;
  showSoccerBalls: boolean;
  showRecordBreakEffect: boolean;
  showMiniConfetti: boolean;
}

export interface AnimationActions {
  triggerCompletion: () => void;
  triggerRecordBreak: () => void;
  reset: () => void;
}

export function useAnimations(): AnimationState & AnimationActions {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSoccerBalls, setShowSoccerBalls] = useState(false);
  const [showRecordBreakEffect, setShowRecordBreakEffect] = useState(false);
  const [showMiniConfetti, setShowMiniConfetti] = useState(false);

  function triggerCompletion() {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
    setTimeout(() => {
      setShowSoccerBalls(true);
      setTimeout(() => setShowSoccerBalls(false), 4000);
    }, 1500);
  }

  function triggerRecordBreak() {
    setShowRecordBreakEffect(true);
    setShowMiniConfetti(true);
    setTimeout(() => {
      setShowRecordBreakEffect(false);
      setShowMiniConfetti(false);
    }, 800);
  }

  function reset() {
    setShowConfetti(false);
    setShowSoccerBalls(false);
    setShowRecordBreakEffect(false);
    setShowMiniConfetti(false);
  }

  return {
    showConfetti,
    showSoccerBalls,
    showRecordBreakEffect,
    showMiniConfetti,
    triggerCompletion,
    triggerRecordBreak,
    reset,
  };
}

import React from 'react';

interface Props {
  wpm: number;
  accuracy: number;
  timeFormatted: string;
}

export function CompletionBanner({ wpm, accuracy, timeFormatted }: Props) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
      <h2 className="text-2xl font-light text-green-800 mb-2">Complete! 🎉</h2>
      <p className="text-green-700">
        You typed at {wpm} WPM with {accuracy}% accuracy in {timeFormatted}
      </p>
    </div>
  );
}

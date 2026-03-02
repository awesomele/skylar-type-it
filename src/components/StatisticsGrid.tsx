import React from 'react';

interface Props {
  totalErrorCount: number;
  consecutiveCorrect: number;
  highestStreak: number;
  justBrokeRecord: boolean;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  textLength: number;
  formatTime: (seconds: number) => string;
}

function dynamicFontSize(value: number, textLength: number): string {
  const size = Math.max(2.5, Math.min(6, 2.5 + Math.pow(value / Math.max(textLength, 1), 0.4) * 7.5));
  return `${size}rem`;
}

export function StatisticsGrid({
  totalErrorCount,
  consecutiveCorrect,
  highestStreak,
  justBrokeRecord,
  wpm,
  accuracy,
  timeElapsed,
  textLength,
  formatTime,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-lg shadow-sm p-4 text-center flex flex-col items-center justify-center min-h-28">
        <div
          className="font-light text-red-600 mb-2 transition-all duration-300 leading-none"
          style={{ fontSize: dynamicFontSize(totalErrorCount, textLength) }}
        >
          {totalErrorCount}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Errors</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 text-center flex flex-col items-center justify-center min-h-28">
        <div
          className="font-light text-green-600 mb-2 transition-all duration-300 leading-none"
          style={{ fontSize: dynamicFontSize(consecutiveCorrect, textLength) }}
        >
          {consecutiveCorrect}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Streak</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 text-center flex flex-col items-center justify-center min-h-28">
        <div
          className={`font-light mb-2 relative leading-none transition-all ${
            justBrokeRecord ? 'duration-200 scale-125' : 'duration-500 scale-100'
          }`}
          style={{ color: '#FFD700' }}
        >
          <div className="text-xl mb-2">👑</div>
          <div
            className="transition-all duration-300"
            style={{ fontSize: dynamicFontSize(highestStreak, textLength) }}
          >
            {highestStreak}
          </div>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Best</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 text-center flex flex-col items-center justify-center min-h-28">
        <div className="space-y-1">
          <div>
            <div className="text-lg font-light text-gray-600">{wpm}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">WPM</div>
          </div>
          <div>
            <div className="text-lg font-light text-gray-600">{accuracy}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Accuracy</div>
          </div>
          <div>
            <div className="text-lg font-light text-gray-600">{formatTime(timeElapsed)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { PracticeMode } from '../types';

interface Props {
  practiceMode: PracticeMode;
  onPracticeModeChange: (mode: PracticeMode) => void;
  passageLength: number;
  maxPassageLength: number;
  onPassageLengthChange: (length: number) => void;
  speakEnabled: boolean;
  onSpeakEnabledChange: (enabled: boolean) => void;
}

export function ControlPanel({
  practiceMode,
  onPracticeModeChange,
  passageLength,
  maxPassageLength,
  onPassageLengthChange,
  speakEnabled,
  onSpeakEnabledChange,
}: Props) {
  const clampedLength = Math.min(passageLength, maxPassageLength);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <label className="block text-sm text-gray-600 font-medium mb-3">Practice Mode:</label>
        <div className="flex flex-col gap-3">
          {(['typing', 'memorize'] as const).map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: practiceMode === mode ? '#3b82f6' : '#e5e7eb' }}
            >
              <input
                type="radio"
                name="practiceMode"
                value={mode}
                checked={practiceMode === mode}
                onChange={() => onPracticeModeChange(mode)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 font-medium">
                {mode === 'typing' ? 'Typing Mode' : 'Memorize Mode'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="block text-sm text-gray-600 font-medium mb-3">Passage Length (words):</label>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="1"
            max={maxPassageLength}
            step="1"
            value={clampedLength}
            onChange={(e) => onPassageLengthChange(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-2xl font-medium text-gray-800 text-center">{clampedLength}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 font-medium mb-3">Speak Words:</label>
        <label className="relative inline-flex items-center cursor-pointer w-full justify-center">
          <input
            type="checkbox"
            checked={speakEnabled}
            onChange={(e) => onSpeakEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-14 h-7 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
              speakEnabled ? 'bg-green-600 after:translate-x-7' : 'bg-gray-200'
            }`}
          />
          <span className="ml-3 text-sm text-gray-700 font-medium">{speakEnabled ? 'On' : 'Off'}</span>
        </label>
      </div>
    </div>
  );
}

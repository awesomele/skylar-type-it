import React from 'react';
import type { PracticeMode } from '../types';
import { DEFAULT_WORD_POOL } from '../constants';

interface Props {
  practiceMode: PracticeMode;
  customMaterial: string;
  customTypingPool: string;
  onCustomMaterialChange: (value: string) => void;
  onCustomTypingPoolChange: (value: string) => void;
  onApply: () => void;
}

function countWords(practiceMode: PracticeMode, customMaterial: string, customTypingPool: string): number {
  if (practiceMode === 'memorize') {
    const words: string[] = [];
    for (const line of customMaterial.split('\n')) {
      if (line.includes('-')) {
        const word = line.substring(0, line.indexOf('-')).trim();
        if (word) words.push(word);
      }
    }
    return words.length;
  }
  const pool = customTypingPool
    .split(/[,\s]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  return pool.length > 0 ? pool.length : DEFAULT_WORD_POOL.length;
}

export function VocabularyEditor({
  practiceMode,
  customMaterial,
  customTypingPool,
  onCustomMaterialChange,
  onCustomTypingPoolChange,
  onApply,
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const wordCount = countWords(practiceMode, customMaterial, customTypingPool);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <label className="block text-sm text-gray-600 font-medium">
            Custom vocabulary pool{' '}
            {practiceMode === 'memorize' ? '(word - explanation)' : '(comma or space separated)'}:
          </label>
          <div className="bg-blue-50 rounded-full px-3 py-1">
            <span className="text-sm font-semibold text-blue-700">{wordCount} words</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? '▼ Collapse' : '▶ Expand'}
        </button>
      </div>

      {expanded && (
        <>
          <textarea
            value={practiceMode === 'memorize' ? customMaterial : customTypingPool}
            onChange={(e) =>
              practiceMode === 'memorize'
                ? onCustomMaterialChange(e.target.value)
                : onCustomTypingPoolChange(e.target.value)
            }
            className="w-full p-3 border-2 border-gray-200 rounded font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows={6}
            placeholder={practiceMode === 'memorize' ? 'word - explanation' : 'word1, word2, word3...'}
          />
          <button
            onClick={onApply}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            Update Vocabulary Pool
          </button>
        </>
      )}
    </div>
  );
}

import { DEFAULT_WORD_POOL } from '../constants';
import type { PracticeMode, WordExplanations } from '../types';

export interface ParsedVocab {
  words: string[];
  explanations: WordExplanations;
}

export interface GenerateTextParams {
  practiceMode: PracticeMode;
  passageLength: number;
  customMaterial: string;
  customTypingPool: string;
}

export interface GenerateTextResult {
  text: string;
  explanations?: WordExplanations;
}

export function parseVocabList(material: string): ParsedVocab {
  const lines = material.split('\n');
  const words: string[] = [];
  const explanations: WordExplanations = {};

  let currentWord: string | null = null;
  let currentExplanation: string[] = [];

  for (const line of lines) {
    if (line.includes('-')) {
      if (currentWord) {
        explanations[currentWord] = currentExplanation.join('\n').trim();
      }
      const dashIndex = line.indexOf('-');
      currentWord = line.substring(0, dashIndex).trim();
      if (currentWord) {
        words.push(currentWord);
        currentExplanation = [line.substring(dashIndex + 1).trim()];
      }
    } else if (currentWord && line.trim()) {
      currentExplanation.push(line.trim());
    }
  }

  if (currentWord) {
    explanations[currentWord] = currentExplanation.join('\n').trim();
  }

  return { words, explanations };
}

export function getMaxPassageLength(
  practiceMode: PracticeMode,
  customMaterial: string,
  customTypingPool: string,
): number {
  if (practiceMode === 'memorize' && customMaterial.trim()) {
    const { words } = parseVocabList(customMaterial);
    return Math.min(words.length, 200);
  }

  const poolWords = customTypingPool
    .split(/[,\s]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const poolSize = poolWords.length > 0 ? poolWords.length : DEFAULT_WORD_POOL.length;
  return Math.min(poolSize, 200);
}

export function generateText(params: GenerateTextParams): GenerateTextResult {
  const { practiceMode, passageLength, customMaterial, customTypingPool } = params;

  if (practiceMode === 'memorize' && customMaterial.trim()) {
    const { words, explanations } = parseVocabList(customMaterial);

    const available = [...words];
    const count = Math.min(passageLength, available.length);
    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      selected.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }

    return { text: selected.join(' ').trim(), explanations };
  }

  const poolWords = customTypingPool
    .split(/[,\s]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const pool = poolWords.length > 0 ? poolWords : DEFAULT_WORD_POOL;
  const words: string[] = [];
  for (let i = 0; i < passageLength; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return { text: words.join(' ').trim() };
}

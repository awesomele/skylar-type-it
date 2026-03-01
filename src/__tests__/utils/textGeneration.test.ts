import { describe, it, expect } from 'vitest';
import {
  getMaxPassageLength,
  generateText,
  parseVocabList,
} from '../../utils/textGeneration';
import { DEFAULT_VOCAB_LIST, DEFAULT_WORD_POOL } from '../../constants';

const SAMPLE_VOCAB = 'apple - a red fruit\nbanana - a yellow fruit\ncherry - a small red fruit';

describe('parseVocabList', () => {
  it('parses word-explanation pairs', () => {
    const result = parseVocabList(SAMPLE_VOCAB);
    expect(result.words).toEqual(['apple', 'banana', 'cherry']);
    expect(result.explanations['apple']).toBe('a red fruit');
    expect(result.explanations['banana']).toBe('a yellow fruit');
    expect(result.explanations['cherry']).toBe('a small red fruit');
  });

  it('ignores lines without a dash', () => {
    const input = 'apple - fruit\njust a line with no dash\nbanana - yellow';
    const result = parseVocabList(input);
    expect(result.words).toEqual(['apple', 'banana']);
  });

  it('handles empty input', () => {
    const result = parseVocabList('');
    expect(result.words).toHaveLength(0);
    expect(result.explanations).toEqual({});
  });

  it('handles multi-line explanations', () => {
    const input = 'word - first line\nsecond line';
    const result = parseVocabList(input);
    expect(result.explanations['word']).toBe('first line\nsecond line');
  });
});

describe('getMaxPassageLength', () => {
  it('returns word count from vocab list in memorize mode', () => {
    const result = getMaxPassageLength('memorize', SAMPLE_VOCAB, '');
    expect(result).toBe(3);
  });

  it('caps at 200 in memorize mode', () => {
    const bigVocab = Array.from({ length: 250 }, (_, i) => `word${i} - def${i}`).join('\n');
    const result = getMaxPassageLength('memorize', bigVocab, '');
    expect(result).toBe(200);
  });

  it('returns custom pool size in typing mode', () => {
    const result = getMaxPassageLength('typing', '', 'foo, bar, baz');
    expect(result).toBe(3);
  });

  it('falls back to default word pool in typing mode when pool is empty', () => {
    const result = getMaxPassageLength('typing', '', '');
    expect(result).toBe(Math.min(DEFAULT_WORD_POOL.length, 200));
  });

  it('caps at 200 in typing mode', () => {
    const bigPool = Array.from({ length: 250 }, (_, i) => `word${i}`).join(', ');
    const result = getMaxPassageLength('typing', '', bigPool);
    expect(result).toBe(200);
  });
});

describe('generateText', () => {
  it('returns correct word count in typing mode', () => {
    const { text } = generateText({
      practiceMode: 'typing',
      passageLength: 10,
      customMaterial: '',
      customTypingPool: '',
    });
    expect(text.split(' ')).toHaveLength(10);
  });

  it('returns words from custom pool in typing mode', () => {
    const { text } = generateText({
      practiceMode: 'typing',
      passageLength: 5,
      customMaterial: '',
      customTypingPool: 'alpha, beta, gamma',
    });
    const words = text.split(' ');
    expect(words).toHaveLength(5);
    words.forEach((w) => expect(['alpha', 'beta', 'gamma']).toContain(w));
  });

  it('returns unique words in memorize mode', () => {
    const { text } = generateText({
      practiceMode: 'memorize',
      passageLength: 3,
      customMaterial: SAMPLE_VOCAB,
      customTypingPool: '',
    });
    const words = text.split(' ');
    expect(words).toHaveLength(3);
    // All unique
    expect(new Set(words).size).toBe(3);
  });

  it('returns explanations map in memorize mode', () => {
    const { explanations } = generateText({
      practiceMode: 'memorize',
      passageLength: 3,
      customMaterial: SAMPLE_VOCAB,
      customTypingPool: '',
    });
    expect(explanations).toBeDefined();
    expect(Object.keys(explanations!)).toHaveLength(3);
  });

  it('clamps word count to available vocabulary in memorize mode', () => {
    const { text } = generateText({
      practiceMode: 'memorize',
      passageLength: 100,
      customMaterial: SAMPLE_VOCAB, // only 3 words
      customTypingPool: '',
    });
    expect(text.split(' ')).toHaveLength(3);
  });

  it('uses default word pool as fallback in typing mode', () => {
    const { text } = generateText({
      practiceMode: 'typing',
      passageLength: 5,
      customMaterial: '',
      customTypingPool: '',
    });
    const words = text.split(' ');
    expect(words).toHaveLength(5);
    words.forEach((w) => expect(DEFAULT_WORD_POOL).toContain(w));
  });
});

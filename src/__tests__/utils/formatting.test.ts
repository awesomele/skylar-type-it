import { describe, it, expect } from 'vitest';
import { formatTime } from '../../utils/formatting';

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(9)).toBe('0:09');
    expect(formatTime(59)).toBe('0:59');
  });

  it('formats exactly 1 minute', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('pads seconds with leading zero', () => {
    expect(formatTime(61)).toBe('1:01');
    expect(formatTime(600)).toBe('10:00');
  });
});

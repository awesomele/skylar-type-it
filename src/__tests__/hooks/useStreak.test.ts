import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreak } from '../../hooks/useStreak';

describe('useStreak', () => {
  it('initializes with zero values', () => {
    const { result } = renderHook(() => useStreak());
    expect(result.current.consecutiveCorrect).toBe(0);
    expect(result.current.highestStreak).toBe(0);
    expect(result.current.justBrokeRecord).toBe(false);
  });

  it('increments streak on correct character', () => {
    const { result } = renderHook(() => useStreak());
    act(() => { result.current.recordCorrect(); });
    act(() => { result.current.recordCorrect(); });
    expect(result.current.consecutiveCorrect).toBe(2);
  });

  it('updates highest streak when current streak exceeds it', () => {
    const { result } = renderHook(() => useStreak());
    act(() => { result.current.recordCorrect(); });
    act(() => { result.current.recordCorrect(); });
    expect(result.current.highestStreak).toBe(2);
  });

  it('resets consecutive streak on error but keeps highest', () => {
    const { result } = renderHook(() => useStreak());
    act(() => { result.current.recordCorrect(); });
    act(() => { result.current.recordCorrect(); });
    act(() => { result.current.recordError(); });
    expect(result.current.consecutiveCorrect).toBe(0);
    expect(result.current.highestStreak).toBe(2);
  });

  it('sets justBrokeRecord when a new record is set', () => {
    const { result } = renderHook(() => useStreak());
    act(() => { result.current.recordCorrect(); });
    expect(result.current.justBrokeRecord).toBe(true);
  });

  it('resets all state via reset()', () => {
    const { result } = renderHook(() => useStreak());
    act(() => {
      result.current.recordCorrect();
      result.current.recordCorrect();
    });
    act(() => { result.current.reset(); });
    expect(result.current.consecutiveCorrect).toBe(0);
    expect(result.current.highestStreak).toBe(0);
    expect(result.current.justBrokeRecord).toBe(false);
  });

  it('does not update highest streak if current does not exceed it', () => {
    const { result } = renderHook(() => useStreak());
    // Build streak of 3
    act(() => {
      result.current.recordCorrect();
      result.current.recordCorrect();
      result.current.recordCorrect();
    });
    expect(result.current.highestStreak).toBe(3);
    // Break it
    act(() => { result.current.recordError(); });
    // Build streak of 2 (less than best)
    act(() => {
      result.current.recordCorrect();
      result.current.recordCorrect();
    });
    expect(result.current.highestStreak).toBe(3);
  });
});

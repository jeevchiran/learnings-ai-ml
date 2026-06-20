import { describe, it, expect, beforeEach, vi } from 'vitest'

const store = {};
const localStorageMock = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

vi.stubGlobal('localStorage', localStorageMock);

const { load, save, markComplete, toggleBookmark, setLastVisited } =
  await import('../hooks/progressStorage.js');

describe('progressStorage', () => {
  beforeEach(() => localStorageMock.clear());

  it('load returns empty object when nothing stored', () => {
    expect(load()).toEqual({});
  });

  it('save and load round-trip', () => {
    const data = { 'm1': { completed: true } };
    save(data);
    expect(load()).toEqual(data);
  });

  it('markComplete sets completed true and lastVisited', () => {
    const result = markComplete('module-1');
    expect(result['module-1'].completed).toBe(true);
    expect(typeof result['module-1'].lastVisited).toBe('number');
  });

  it('markComplete preserves existing fields', () => {
    save({ 'module-1': { bookmarked: true } });
    const result = markComplete('module-1');
    expect(result['module-1'].bookmarked).toBe(true);
    expect(result['module-1'].completed).toBe(true);
  });

  it('toggleBookmark flips bookmark state', () => {
    const first = toggleBookmark('module-1');
    expect(first['module-1'].bookmarked).toBe(true);
    const second = toggleBookmark('module-1');
    expect(second['module-1'].bookmarked).toBe(false);
  });

  it('setLastVisited sets timestamp', () => {
    const before = Date.now();
    const result = setLastVisited('module-1');
    expect(result['module-1'].lastVisited).toBeGreaterThanOrEqual(before);
  });
});

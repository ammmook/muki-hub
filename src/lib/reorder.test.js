import { describe, expect, it } from 'vitest';
import { insertAt, reorder } from './reorder.js';

const abc = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const ids = (l) => l.map((x) => x.id).join('');

describe('reorder', () => {
  it('moves an item forward and backward', () => {
    expect(ids(reorder(abc, 'a', 2))).toBe('bca');
    expect(ids(reorder(abc, 'c', 0))).toBe('cab');
  });
  it('returns null when nothing changes', () => {
    expect(reorder(abc, 'b', 1)).toBeNull();
    expect(reorder(abc, 'zzz', 0)).toBeNull();
    expect(reorder(abc, 'a', 3)).toBeNull();
    expect(reorder(abc, 'a', -1)).toBeNull();
  });
  it('does not mutate the input', () => {
    reorder(abc, 'a', 2);
    expect(ids(abc)).toBe('abc');
  });
});

describe('insertAt', () => {
  it('inserts at an index and clamps out-of-range values', () => {
    expect(ids(insertAt(abc, { id: 'x' }, 1))).toBe('axbc');
    expect(ids(insertAt(abc, { id: 'x' }, 99))).toBe('abcx');
    expect(ids(insertAt(abc, { id: 'x' }, -5))).toBe('xabc');
  });
});

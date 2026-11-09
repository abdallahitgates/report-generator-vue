import { describe, expect, it } from 'vitest';
import { createQueue } from '../src/utils/queue.js';

describe('createQueue', () => {
  it('runs at most N tasks at once and all of them in the end', async () => {
    const run = createQueue(3);
    let active = 0;
    let peak = 0;
    const task = (v) => async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      return v;
    };
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => run(task(i))));
    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(peak).toBe(3);
  });

  it('keeps going after a failed task', async () => {
    const run = createQueue(1);
    await expect(run(async () => { throw new Error('nope'); })).rejects.toThrow('nope');
    await expect(run(async () => 'next')).resolves.toBe('next');
  });
});

import { describe, expect, it } from 'vitest';

import { moveLeft } from './game';
import type { Map2048, MoveResult } from './types/game.d';

describe('moveLeft', () => {
  it('merged correctly', () => {
    const map: Map2048 = [
      [2, 2, null, null],
      [4, null, 4, 4],
      [null, null, 2, 2],
      [8, 8, 16, 16],
    ];

    const expected: MoveResult = {
      result: [
        [4, null, null, null],
        [8, 4, null, null],
        [4, null, null, null],
        [16, 32, null, null],
      ],
      isMoved: true,
      moveScore: 64,
    };

    const actual = moveLeft(map);
    expect(actual).toEqual(expected);
  });

  it("handle can't move situation", () => {
    const map: Map2048 = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, null],
      [null, null, null, null],
    ];

    const expected: MoveResult = {
      result: map,
      isMoved: false,
      moveScore: 0,
    };

    const actual = moveLeft(map);
    expect(actual).toEqual(expected);
  });
});

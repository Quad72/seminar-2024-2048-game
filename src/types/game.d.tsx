export type Cell = number | null;
export type Map2048 = Cell[][];
export type Direction = 'up' | 'left' | 'right' | 'down';
type RotateDegree = 0 | 90 | 180 | 270;
export type DirectionDegreeMap = Record<Direction, RotateDegree>;
export type MoveResult = {
  result: Map2048;
  isMoved: boolean;
  moveScore: number;
};

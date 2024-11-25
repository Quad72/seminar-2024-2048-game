import Cell from './Cell.tsx';
import styles from './css/Board.module.css';
import type { BoardProps } from './types/Board.d.tsx';
import type { Cell as Celltype } from './types/game.d.tsx';

const Board = ({ BoardArray }: BoardProps) => {
  return (
    <div className={styles.board}>
      {BoardArray.map((row: Celltype[], rowIndex: number) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((cellValue: Celltype, columnIndex: number) => (
            <Cell key={columnIndex} value={cellValue} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;

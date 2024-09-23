import Cell from './Cell.tsx';
import { type Cell as Celltype, type Map2048 } from './game.tsx';

interface BoardProps {
  BoardArray: Map2048;
}

const Board = ({ BoardArray }: BoardProps) => {
  return (
    <div className="board">
      {BoardArray.map((row: Celltype[], rowIndex: number) => (
        <div className="row" key={rowIndex}>
          {row.map((cellValue: Celltype, columnIndex: number) => (
            <Cell key={columnIndex} value={cellValue} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;

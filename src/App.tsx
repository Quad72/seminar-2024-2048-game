import './App.css';
import './game.tsx';

import { useEffect, useState } from 'react';

import { type Cell, type Map2048, moveMapIn2048Rule } from './game.tsx';

interface BoardProps {
  BoardArray: Map2048;
}
interface CellProps {
  value: number | null;
}

function App() {
  const createBoard = (rows: number, cols: number): Map2048 => {
    //return Array.from({ length: rows }, () => Array(cols).fill(0));
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null),
    );
  };

  const initializeBoard = (): Map2048 => {
    const board = createBoard(4, 4);
    return addRandomBlock(addRandomBlock(board));
  };

  const addRandomBlock = (board: Map2048): Map2048 => {
    const emptyCells: [number, number][] = [];

    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      if (row === undefined) throw new Error('invalid map');
      for (let j = 0; j < row.length; j++) {
        if (row[j] === null) {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length === 0) return board;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const selectedCell = emptyCells[randomIndex];
    if (selectedCell !== undefined) {
      const [i, j] = selectedCell;
      if (board[i] === undefined) throw new Error('invalid map');
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
    return board;
  };

  //const initialBoard = createBoard(4, 4);

  //const [board, setBoard] = useState<Map2048>(initialBoard);\

  const loadGameStateFromLocalStorage = (): {
    board: Map2048;
    score: number;
    bestScore: number;
  } => {
    const savedBoard = localStorage.getItem('2048-board');
    const savedScore = localStorage.getItem('Score');
    const savedBestScore = localStorage.getItem('bestScore');

    const board =
      savedBoard !== null
        ? (JSON.parse(savedBoard) as Map2048)
        : initializeBoard();
    const score = savedScore !== null ? parseInt(savedScore, 10) : 0;
    const bestScore =
      savedBestScore !== null ? parseInt(savedBestScore, 10) : 0;

    return { board, score, bestScore };
  };

  const saveGameStateToLocalStorage = (
    board: Map2048,
    score: number,
    bestScore: number,
  ) => {
    localStorage.setItem('2048-board', JSON.stringify(board));
    localStorage.setItem('Score', score.toString());
    localStorage.setItem('bestScore', bestScore.toString());
  };

  const handleUndo = (lastboard: Map2048) => {
    setBoard(lastboard);
  };

  /*const checkGameWon = (board:Map2048): boolean => {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === undefined) throw new Error('invalid map');
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 128) {
          return true;
        }
      }
    }
    return false;
  }*/

  const checkGameWon = (board: Map2048): boolean => {
    return board.some((row) => row.some((cell) => cell === 128));
  };

  const checkGameOver = (board: Map2048): boolean => {
    // 이동 가능한지 여부를 확인하는 함수
    const canMove = (
      Board: Map2048,
      direction: 'up' | 'down' | 'left' | 'right',
    ): boolean => {
      const testMove = moveMapIn2048Rule(Board, direction);
      return testMove.isMoved;
    };

    // 보드의 각 방향에 대해 이동 가능한지 확인
    return !(
      canMove(board, 'up') ||
      canMove(board, 'down') ||
      canMove(board, 'left') ||
      canMove(board, 'right')
    );
  };

  const [board, setBoard] = useState<Map2048>(
    loadGameStateFromLocalStorage().board,
  );
  const [lastboard, setLastBoard] = useState<Map2048>(
    loadGameStateFromLocalStorage().board,
  );
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [Score, setScore] = useState<number>(
    loadGameStateFromLocalStorage().score,
  );
  const [bestScore, setBestScore] = useState<number>(
    loadGameStateFromLocalStorage().bestScore,
  );

  //const [board, setBoard] = useState<Map2048>(initializeBoard());

  useEffect(() => {
    saveGameStateToLocalStorage(board, Score, bestScore);
  }, [board, Score, bestScore]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOver || isWon) return;

      let Movement = { result: board, isMoved: false, moveScore: 0 };
      let updatedBoard = [...board];
      let moved = false;
      let moveScore = 0;

      switch (event.key) {
        case 'ArrowUp':
          Movement = moveMapIn2048Rule(board, 'up');
          updatedBoard = Movement.result;
          moved = Movement.isMoved;
          moveScore = Movement.moveScore;
          break;
        case 'ArrowDown':
          Movement = moveMapIn2048Rule(board, 'down');
          updatedBoard = Movement.result;
          moved = Movement.isMoved;
          moveScore = Movement.moveScore;
          break;
        case 'ArrowLeft':
          Movement = moveMapIn2048Rule(board, 'left');
          updatedBoard = Movement.result;
          moved = Movement.isMoved;
          moveScore = Movement.moveScore;
          break;
        case 'ArrowRight':
          Movement = moveMapIn2048Rule(board, 'right');
          updatedBoard = Movement.result;
          moved = Movement.isMoved;
          moveScore = Movement.moveScore;
          break;
        default:
          return;
      }
      if (moved) {
        const newboard = addRandomBlock(updatedBoard);
        setLastBoard(board);
        setBoard(newboard);
        setScore((prevScore) => {
          const newScore = prevScore + moveScore;

          // 베스트 스코어와 비교하여 업데이트
          if (newScore > bestScore) {
            setBestScore(newScore);
          }

          return newScore;
        });
        saveGameStateToLocalStorage(newboard, Score, bestScore);
        if (checkGameWon(newboard)) {
          setIsWon(true);
        } else if (checkGameOver(newboard)) {
          setIsOver(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, isOver, isWon, bestScore, Score]);

  const restartGame = () => {
    setBoard(initializeBoard());
    setIsOver(false);
    setIsWon(false);
    setScore(0);
    saveGameStateToLocalStorage(initializeBoard(), 0, bestScore);
  };

  return (
    <div className="app">
      <h1>2048 Game</h1>
      <div className="toolLine">
        <button
          onClick={() => {
            handleUndo(lastboard);
          }}
          className="undobutton"
        >
          undo
        </button>
        <button className="scorebutton">score: {Score}</button>
        <button className="scorebutton">score: {bestScore}</button>
      </div>
      <Board BoardArray={board} />
      {isOver && !isWon && (
        <div className="overlay">
          <div className="game-over-message">
            <h2>Game Over</h2>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
      {isWon && (
        <div className="overlay">
          <div className="game-over-message">
            <h2>You Win!</h2>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
    </div>
  );
}

const Cell = ({ value }: CellProps) => {
  const getClassName = () => {
    switch (value) {
      case 2:
        return 'cell cell-2';
      case 4:
        return 'cell cell-4';
      case 8:
        return 'cell cell-8';
      case 16:
        return 'cell cell-16';
      case 32:
        return 'cell cell-32';
      case 64:
        return 'cell cell-64';
      case 128:
        return 'cell cell-128';
      case 256:
        return 'cell cell-256';
      case 512:
        return 'cell cell-512';
      case 1024:
        return 'cell cell-1024';
      case 2048:
        return 'cell cell-2048';
      default:
        return 'cell';
    }
  };

  return <div className={getClassName()}>{value !== null ? value : ''}</div>;
};

const Board = ({ BoardArray }: BoardProps) => {
  return (
    <div className="board">
      {BoardArray.map((row: Cell[], rowIndex: number) => (
        <div className="row" key={rowIndex}>
          {row.map((cellValue: Cell, columnIndex: number) => (
            <Cell key={columnIndex} value={cellValue} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;

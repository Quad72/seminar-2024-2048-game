import './App.css';
import './game.tsx';

import { useEffect, useState } from 'react';

import Board from './Board';
import { type Map2048, moveMapIn2048Rule } from './game.tsx';

interface GameState {
  board: Map2048;
  score: number;
}

function App() {
  const createBoard = (rows: number, cols: number): Map2048 => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null),
    );
  };

  const initializeBoard = (): Map2048 => {
    const board = createBoard(4, 4);
    return addRandomBlock(addRandomBlock(board));
  };

  const saveStateToHistory = (currentState: GameState) => {
    setHistory((prevHistory) => [...prevHistory, currentState]);
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

  const loadGameStateFromLocalStorage = (): {
    board: Map2048;
    score: number;
    bestScore: number;
    history: GameState[];
  } => {
    const savedBoard = localStorage.getItem('2048-board');
    const savedScore = localStorage.getItem('Score');
    const savedBestScore = localStorage.getItem('bestScore');
    const savedHistory = localStorage.getItem('gameHistory');
    const newboard = initializeBoard();

    const board =
      savedBoard !== null ? (JSON.parse(savedBoard) as Map2048) : newboard;
    const score = savedScore !== null ? parseInt(savedScore, 10) : 0;
    const bestScore =
      savedBestScore !== null ? parseInt(savedBestScore, 10) : 0;
    const history =
      savedHistory !== null
        ? (JSON.parse(savedHistory) as GameState[])
        : [{ board: newboard, score: 0 }];

    return { board, score, bestScore, history };
  };

  const saveGameStateToLocalStorage = (
    board: Map2048,
    score: number,
    bestScore: number,
    history: GameState[],
  ) => {
    localStorage.setItem('2048-board', JSON.stringify(board));
    localStorage.setItem('Score', score.toString());
    localStorage.setItem('bestScore', bestScore.toString());
    localStorage.setItem('gameHistory', JSON.stringify(history));
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousState = newHistory[newHistory.length - 1];
      if (previousState !== undefined) {
        setBoard(previousState.board);
        setScore(previousState.score);
        setHistory(newHistory);
      }
    }
  };

  const checkGameWon = (board: Map2048): boolean => {
    return board.some((row) => row.some((cell) => cell === 128));
  };

  const checkGameOver = (board: Map2048): boolean => {
    const canMove = (
      currBoard: Map2048,
      direction: 'up' | 'down' | 'left' | 'right',
    ): boolean => {
      const testMove = moveMapIn2048Rule(currBoard, direction);
      return testMove.isMoved;
    };

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
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [Score, setScore] = useState<number>(
    loadGameStateFromLocalStorage().score,
  );
  const [bestScore, setBestScore] = useState<number>(
    loadGameStateFromLocalStorage().bestScore,
  );
  const [history, setHistory] = useState<GameState[]>(
    loadGameStateFromLocalStorage().history,
  );

  useEffect(() => {
    saveGameStateToLocalStorage(board, Score, bestScore, history);
  }, [board, Score, bestScore, history]);

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
        setBoard(newboard);
        setScore((prevScore) => {
          const newScore = prevScore + moveScore;

          // 베스트 스코어와 비교하여 업데이트
          if (newScore > bestScore) {
            setBestScore(newScore);
          }

          return newScore;
        });
        saveStateToHistory({ board: newboard, score: Score });
        saveGameStateToLocalStorage(newboard, Score, bestScore, history);
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
  }, [board, isOver, isWon, bestScore, Score, history]);

  const restartGame = () => {
    const newboard = initializeBoard();
    setBoard(newboard);
    setIsOver(false);
    setIsWon(false);
    setScore(0);
    setHistory([{ board: newboard, score: 0 }]);
    saveGameStateToLocalStorage(newboard, 0, bestScore, history);
  };

  return (
    <div className="app">
      <h1>2048 Game</h1>
      <div className="toolLine">
        <button
          onClick={() => {
            handleUndo();
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

export default App;

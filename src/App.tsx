import './game.tsx';

import { useEffect, useState } from 'react';

import Board from './Board';
import styles from './css/App.module.css';
import { moveMapIn2048Rule } from './game.tsx';
import type { GameState } from './types/App.d.tsx';
import type { Direction, Map2048 } from './types/game.d.tsx';

const directionMap: { [key: string]: Direction } = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const App = () => {
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
    /*const emptyCells: [number, number][] = [];

    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      if (row === undefined) throw new Error('invalid map');
      for (let j = 0; j < row.length; j++) {
        if (row[j] === null) {
          emptyCells.push([i, j]);
        }
      }
    }*/

    const emptyCells = board
      .map((row, i) => {
        return row
          .map((cell, j) => (cell === null ? [i, j] : null))
          .filter((cell) => cell !== null);
      })
      .flat();

    if (emptyCells.length === 0) return board;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const selectedCell = emptyCells[randomIndex];
    if (selectedCell !== undefined && selectedCell.length === 2) {
      const [i, j] = selectedCell;
      if (i === undefined || j === undefined || board[i] === undefined)
        throw new Error('invalid cell');
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
    /*const savedBoard = localStorage.getItem('2048-board');
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
        : [{ board: newboard, score: 0 }];*/
    function parseWithDefault<T>(key: string, defaultValue: T): T {
      const savedValue = localStorage.getItem(key);
      if (savedValue === null) return defaultValue;
      try {
        return JSON.parse(savedValue) as T;
      } catch {
        return defaultValue;
      }
    }

    const newboard = initializeBoard();
    const board = parseWithDefault<Map2048>('2048-board', newboard);
    const score = parseWithDefault<number>('Score', 0);
    const bestScore = parseWithDefault<number>('bestScore', 0);
    const history = parseWithDefault<GameState[]>('gameHistory', [
      { board: newboard, score: 0 },
    ]);

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

      if (event.key in directionMap) {
        const direction = directionMap[event.key];
        if (direction === undefined) return;
        Movement = moveMapIn2048Rule(board, direction);
        updatedBoard = Movement.result;
        moved = Movement.isMoved;
        moveScore = Movement.moveScore;
      }

      if (moved) {
        const newboard = addRandomBlock(updatedBoard);
        setBoard(newboard);
        setScore((prevScore) => {
          const newScore = prevScore + moveScore;

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
    <div className={styles.main}>
      <h1>2048 Game</h1>
      <div className={styles.toolLine}>
        <button
          onClick={() => {
            handleUndo();
          }}
          className={styles.toolButton}
        >
          undo
        </button>
        <button className={styles.toolButton}>score: {Score}</button>
        <button className={styles.toolButton}>score: {bestScore}</button>
      </div>
      <Board BoardArray={board} />
      {isOver && !isWon && (
        <div className={styles.overlay}>
          <div className={styles.gameOverMessage}>
            <h2>Game Over</h2>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
      {isWon && (
        <div className={styles.overlay}>
          <div className={styles.gameOverMessage}>
            <h2>You Win!</h2>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

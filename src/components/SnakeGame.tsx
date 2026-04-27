import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

interface SnakeGameProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  highScore: number;
  setHighScore: React.Dispatch<React.SetStateAction<number>>;
  onGameStatusChange?: (status: string) => void;
}

export default function SnakeGame({ score, setScore, highScore, setHighScore, onGameStatusChange }: SnakeGameProps) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snake.some(segment => segment.x === newFood?.x && segment.y === newFood?.y)) {
        break;
      }
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood());
    onGameStatusChange?.('ACTIVE');
  };

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      if (head.y >= GRID_SIZE) head.y = 0;

      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        onGameStatusChange?.('CRASHED');
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood, highScore, setScore, setHighScore, onGameStatusChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ':
          if (!isGameOver) setIsPaused(p => !p);
          else resetGame();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameOver]);

  useEffect(() => {
    const speed = Math.max(80, BASE_SPEED - Math.floor(score / 50) * 5);
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [moveSnake, score]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px] bg-[#0a0a0a] border-2 border-neon-blue/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] p-1 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Food */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bg-neon-pink rounded-full shadow-[0_0_15px_rgba(217,70,239,1)]"
          style={{
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            zIndex: 20
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={`${i}-${segment.x}-${segment.y}`}
            className={`absolute ${i === 0 ? 'bg-neon-blue shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-neon-blue/60'} rounded-sm`}
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(segment.x / GRID_SIZE) * 100}%`,
              top: `${(segment.y / GRID_SIZE) * 100}%`,
              zIndex: 10,
              opacity: 1 - (i / snake.length) * 0.5
            }}
          />
        ))}

        {/* Overlays */}
        <AnimatePresence>
          {isPaused && !isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm z-30"
            >
              <button
                onClick={() => setIsPaused(false)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 border-2 border-neon-blue flex items-center justify-center bg-neon-blue/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <Play className="w-8 h-8 text-neon-blue fill-neon-blue" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neon-blue">Resume Session</span>
                <span className="text-[8px] opacity-40 uppercase tracking-[0.2em] mt-4">Press [SPACE] to start</span>
              </button>
            </motion.div>
          )}

          {isGameOver && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#050505]/90 backdrop-blur-md z-40 border-2 border-neon-pink/50"
            >
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple mb-2">SYSTEM_FAILURE</h2>
                <div className="text-slate-300">
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Final Integrity</p>
                  <p className="text-4xl font-bold text-white mb-8">{score}</p>
                </div>
                <button
                  onClick={resetGame}
                  className="px-6 py-2 border-2 border-neon-blue text-neon-blue text-[11px] uppercase font-bold hover:bg-neon-blue hover:text-[#050505] transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reload_Loop
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


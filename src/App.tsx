import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import { useMusicPlayer } from './components/MusicPlayer';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Terminal, Activity, Zap } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('IDLE');
  
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    setVolume,
    togglePlay,
    nextTrack,
    prevTrack,
    handleTimeUpdate,
    handleSeek,
    audioRef
  } = useMusicPlayer();

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const padScore = (num: number) => num.toString().padStart(6, '0');

  return (
    <div className="w-full h-screen bg-[#050505] text-[#e0e0e0] font-mono flex flex-col p-6 select-none border-4 border-[#1a1a1a] overflow-hidden">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      <header className="flex justify-between items-end mb-8 border-b border-neon-blue/30 pb-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink">
            SYNTH-SNAKE v1.0
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-neon-blue/60">
            Experimental Audio-Visual Environment
          </p>
        </div>
        
        <div className="flex gap-8 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] text-neon-pink uppercase">Session Score</span>
            <span className="text-3xl font-bold leading-none text-white">{padScore(score)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neon-blue uppercase">High Record</span>
            <span className="text-3xl font-bold leading-none text-white/40">{padScore(highScore)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Side: Music Info */}
        <aside className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="p-4 border border-white/10 bg-white/5 rounded-sm">
            <h3 className="text-[11px] uppercase tracking-widest text-neon-pink mb-4 flex justify-between">
              <span>Now Playing</span>
              <span className={isPlaying ? "animate-pulse" : ""}>●</span>
            </h3>
            <div className="mb-4 aspect-square bg-gradient-to-br from-neon-pink/20 to-neon-blue/20 rounded flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(217,70,239,0.1)] relative overflow-hidden group">
              <div className={`absolute inset-0 bg-gradient-to-tr transition-opacity duration-1000 ${isPlaying ? 'opacity-40' : 'opacity-10'}`} style={{ backgroundColor: currentTrack.color }} />
              <div className="relative z-10 w-12 h-12 border-2 border-white/40 rounded-full flex items-center justify-center">
                <div className={`w-2 h-2 bg-white rounded-full ${isPlaying ? 'animate-ping' : ''}`} />
              </div>
            </div>
            <p className="text-sm font-bold truncate text-white uppercase tracking-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">{currentTrack.artist}</p>
          </div>

          <nav className="flex-1 flex flex-col gap-2 overflow-hidden">
            <h3 className="text-[10px] uppercase text-neon-blue mb-2">System_Modules</h3>
            <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
              <div className="p-3 bg-white/10 border-l-2 border-neon-pink flex justify-between items-center">
                <span className="text-xs uppercase">Audio_Link</span>
                <span className="text-[10px] opacity-40">ACTIVE</span>
              </div>
              <div className="p-3 bg-white/5 border-l-2 border-transparent flex justify-between items-center opacity-60">
                <span className="text-xs uppercase">Visual_Sync</span>
                <span className="text-[10px] opacity-40">AUTO</span>
              </div>
              <div className="p-3 bg-white/5 border-l-2 border-transparent flex justify-between items-center opacity-60">
                <span className="text-xs uppercase">Neural_Map</span>
                <span className="text-[10px] opacity-40">OFFLINE</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Center: Snake Game */}
        <section className="col-span-6 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="w-full h-full flex items-center justify-center">
            <SnakeGame 
              score={score} 
              setScore={setScore} 
              highScore={highScore} 
              setHighScore={setHighScore}
              onGameStatusChange={setGameStatus}
            />
          </div>
        </section>

        {/* Right Side: Stats & Terminal */}
        <aside className="col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="p-4 border border-white/10 bg-white/5 rounded-sm">
            <h3 className="text-[10px] uppercase text-neon-blue mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Engine Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px]">
                <span className="opacity-60">Audio Buffer</span>
                <span className="text-neon-pink">STABLE</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="opacity-60">Game Speed</span>
                <span className="text-neon-blue">{Math.min(100, (score / 500) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="opacity-60">Process Yield</span>
                <span>98.2%</span>
              </div>
              <div className="w-full bg-white/10 h-1 mt-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isPlaying ? '100%' : '30%' }}
                  className="bg-neon-blue h-full"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 p-4 border border-white/10 bg-white/5 rounded-sm overflow-hidden">
            <h3 className="text-[10px] uppercase text-neon-pink mb-2 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Terminal Output
            </h3>
            <div className="text-[10px] leading-relaxed opacity-40 font-mono space-y-1 overflow-y-auto custom-scrollbar">
              <p>{">"} INITIALIZING GAME_LOOP...</p>
              <p>{">"} AUDIO_BUFFER LOADED [3/3]</p>
              <p>{">"} SNAKE_ENTITY_SPAWNED AT [10,10]</p>
              <p>{">"} SYSTEM_STATUS: {gameStatus}</p>
              {score > 0 && <p>{">"} SCORE_ACCUMULATED: {score}</p>}
              {score > highScore && <p>{">"} NEW_HIGH_RECORD_DETECTED</p>}
              {gameStatus === 'CRASHED' && <p className="text-neon-pink">{">"} ERROR: COLLISION_DETECTED</p>}
              <p>{">"} WAITING_FOR_INPUT...</p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="mt-8 flex items-center gap-8 border-t border-white/10 pt-6">
        {/* Controls */}
        <div className="flex gap-4">
          <button 
            onClick={prevTrack}
            className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-12 h-12 border-2 border-neon-blue flex items-center justify-center bg-neon-blue/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-neon-blue/20 transition-all text-neon-blue"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <button 
            onClick={nextTrack}
            className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest px-1">
            <span className="text-white/40">{formatTime(progress)}</span>
            <span className="text-white/40">-{formatTime(duration - progress)}</span>
          </div>
          <div 
            className="h-1.5 w-full bg-white/10 rounded-full relative overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              handleSeek(pct * duration);
            }}
          >
            <motion.div 
              style={{ width: `${(progress / duration) * 100}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-blue to-neon-pink"
            />
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase opacity-40 mb-1 flex items-center gap-1">
              <Volume2 className="w-2 h-2" /> Volume
            </span>
            <div className="w-24 h-1 bg-white/10 flex items-center justify-start overflow-hidden relative cursor-pointer group"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                setVolume(x / rect.width);
              }}
            >
              <div className="h-full bg-white/60" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
          <button className="px-4 py-2 border border-neon-pink text-neon-pink text-[10px] uppercase font-bold hover:bg-neon-pink hover:text-black transition-colors flex items-center gap-2">
            <Maximize2 className="w-3 h-3" /> Fullscreen
          </button>
        </div>
      </footer>
    </div>
  );
}


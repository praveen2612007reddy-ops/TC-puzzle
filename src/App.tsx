import React, { useState, useEffect } from 'react';
import {
  Clapperboard,
  Shield,
  Search,
  Zap,
  Award,
  Volume2,
  VolumeX,
  Coins,
  Flame,
  Smartphone,
  Monitor
} from 'lucide-react';
import { TollywoodPuzzleView } from './components/TollywoodPuzzleView';
import { CricketJerseyPuzzleView } from './components/CricketJerseyPuzzleView';
import { SmartSolverView } from './components/SmartSolverView';
import { DailyBlitzView } from './components/DailyBlitzView';
import { StatsView } from './components/StatsView';
import { ActiveTab, UserStats } from './types/puzzle';
import { sound } from './utils/audio';

const STORAGE_KEY = 'tollywood_cric_puzzle_data_v1';

const defaultStats: UserStats = {
  coins: 100, // Generous starting balance to experiment with hints
  streak: 1,
  lastPlayedDate: new Date().toISOString().slice(0, 10),
  moviesSolved: [],
  cricketersSolved: [],
  blitzHighScore: 0,
  totalHintsUsed: 0,
  soundEnabled: true
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tollywood');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  // Load persistent stats
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultStats, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return defaultStats;
  });

  // Save persistent stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Sync sound utility
  useEffect(() => {
    sound.enabled = stats.soundEnabled;
  }, [stats.soundEnabled]);

  const handleToggleSound = () => {
    setStats((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const handleAddCoins = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      coins: prev.coins + amount
    }));
  };

  const handleSpendCoins = (amount: number): boolean => {
    if (stats.coins < amount) return false;
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - amount,
      totalHintsUsed: prev.totalHintsUsed + 1
    }));
    return true;
  };

  const handleSolveMovie = (id: string) => {
    if (!stats.moviesSolved.includes(id)) {
      setStats((prev) => ({
        ...prev,
        moviesSolved: [...prev.moviesSolved, id]
      }));
    }
  };

  const handleSolveCricketer = (id: string) => {
    if (!stats.cricketersSolved.includes(id)) {
      setStats((prev) => ({
        ...prev,
        cricketersSolved: [...prev.cricketersSolved, id]
      }));
    }
  };

  const handleUpdateBlitzHighScore = (newScore: number) => {
    setStats((prev) => ({
      ...prev,
      blitzHighScore: Math.max(prev.blitzHighScore, newScore)
    }));
  };

  const handleResetStats = () => {
    setStats(defaultStats);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Outer Shell for Desktop / Mobile Adaptation */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-md mx-auto min-h-screen sm:min-h-[844px] sm:my-4 sm:rounded-[40px] sm:border-8 sm:border-slate-800 sm:shadow-2xl sm:shadow-amber-500/5 bg-slate-950 flex flex-col relative overflow-hidden'
            : 'max-w-2xl mx-auto min-h-screen bg-slate-950 flex flex-col relative'
        }`}
      >
        {/* Top App Header (Mobile Pattern) */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shrink-0">
          {/* Brand Wordmark (Single text element as per contract) */}
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-white font-display flex items-center gap-1.5">
              <span className="text-amber-400">Tollywood</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400">Cricket</span>
            </h1>
          </div>

          {/* Right Action Icons: Sound, Coins, Frame Mode */}
          <div className="flex items-center gap-2">
            {/* Coins Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-mono-numbers font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.coins}</span>
            </div>

            {/* Streak flame */}
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-mono-numbers font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>{stats.streak}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 tap-bounce"
              title={stats.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {stats.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Desktop Device Frame Toggle (Hidden on small mobile screens) */}
            <button
              onClick={() => setDeviceFrameMode(!deviceFrameMode)}
              className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 tap-bounce"
              title={deviceFrameMode ? 'Expand Full Width' : 'Simulate Phone Frame'}
            >
              {deviceFrameMode ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Main Application Content */}
        <main className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain">
          {activeTab === 'tollywood' && (
            <TollywoodPuzzleView
              coins={stats.coins}
              onAddCoins={handleAddCoins}
              onSpendCoins={handleSpendCoins}
              solvedIds={stats.moviesSolved}
              onSolve={handleSolveMovie}
              soundEnabled={stats.soundEnabled}
              onToggleSound={handleToggleSound}
            />
          )}

          {activeTab === 'cricket' && (
            <CricketJerseyPuzzleView
              coins={stats.coins}
              onAddCoins={handleAddCoins}
              onSpendCoins={handleSpendCoins}
              solvedIds={stats.cricketersSolved}
              onSolve={handleSolveCricketer}
              soundEnabled={stats.soundEnabled}
              onToggleSound={handleToggleSound}
            />
          )}

          {activeTab === 'solver' && <SmartSolverView />}

          {activeTab === 'blitz' && (
            <DailyBlitzView
              onAddCoins={handleAddCoins}
              highScore={stats.blitzHighScore}
              onUpdateHighScore={handleUpdateBlitzHighScore}
            />
          )}

          {activeTab === 'stats' && (
            <StatsView
              coins={stats.coins}
              streak={stats.streak}
              moviesSolved={stats.moviesSolved}
              cricketersSolved={stats.cricketersSolved}
              blitzHighScore={stats.blitzHighScore}
              onResetStats={handleResetStats}
            />
          )}
        </main>

        {/* Bottom Tab Navigation Bar (Strict Pattern 1 from Mobile Constitution) */}
        <nav className="fixed sm:sticky bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shrink-0">
          <div className="grid grid-cols-5 items-center max-w-md mx-auto">
            {/* Tollywood Tab */}
            <button
              onClick={() => {
                sound.tapLetter();
                setActiveTab('tollywood');
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce min-h-[48px] ${
                activeTab === 'tollywood'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clapperboard
                className={`w-5 h-5 transition-transform ${
                  activeTab === 'tollywood' ? 'scale-110 text-amber-400' : ''
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1">Tollywood</span>
            </button>

            {/* Cricket Tab */}
            <button
              onClick={() => {
                sound.tapLetter();
                setActiveTab('cricket');
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce min-h-[48px] ${
                activeTab === 'cricket'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield
                className={`w-5 h-5 transition-transform ${
                  activeTab === 'cricket' ? 'scale-110 text-emerald-400' : ''
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1">Cricket</span>
            </button>

            {/* Smart Solver Detective Tab */}
            <button
              onClick={() => {
                sound.tapLetter();
                setActiveTab('solver');
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce min-h-[48px] ${
                activeTab === 'solver'
                  ? 'text-purple-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search
                className={`w-5 h-5 transition-transform ${
                  activeTab === 'solver' ? 'scale-110 text-purple-400' : ''
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1">Solver</span>
            </button>

            {/* Daily Blitz Tab */}
            <button
              onClick={() => {
                sound.tapLetter();
                setActiveTab('blitz');
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce min-h-[48px] ${
                activeTab === 'blitz'
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap
                className={`w-5 h-5 transition-transform ${
                  activeTab === 'blitz' ? 'scale-110 text-rose-400' : ''
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1">60s Blitz</span>
            </button>

            {/* Stats Tab */}
            <button
              onClick={() => {
                sound.tapLetter();
                setActiveTab('stats');
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce min-h-[48px] ${
                activeTab === 'stats'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award
                className={`w-5 h-5 transition-transform ${
                  activeTab === 'stats' ? 'scale-110 text-amber-400' : ''
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1">Trophies</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

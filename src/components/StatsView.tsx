import React from 'react';
import {
  Trophy,
  Award,
  Clapperboard,
  Flame,
  Coins,
  Shield,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TOLLYWOOD_MOVIES } from '../data/tollywoodMovies';
import { CRICKET_STARS } from '../data/cricketStars';

interface Props {
  coins: number;
  streak: number;
  moviesSolved: string[];
  cricketersSolved: string[];
  blitzHighScore: number;
  onResetStats: () => void;
}

export const StatsView: React.FC<Props> = ({
  coins,
  streak,
  moviesSolved,
  cricketersSolved,
  blitzHighScore,
  onResetStats
}) => {
  const totalMovies = TOLLYWOOD_MOVIES.length;
  const totalCricketers = CRICKET_STARS.length;

  const moviePercent = Math.round((moviesSolved.length / totalMovies) * 100);
  const cricketPercent = Math.round((cricketersSolved.length / totalCricketers) * 100);

  const badges = [
    {
      title: 'Tollywood Fanatic',
      description: 'Solve at least 5 Telugu movies',
      unlocked: moviesSolved.length >= 5,
      icon: Clapperboard,
      color: 'amber'
    },
    {
      title: 'Box Office King',
      description: 'Solve at least 15 Telugu blockbusters',
      unlocked: moviesSolved.length >= 15,
      icon: Trophy,
      color: 'amber'
    },
    {
      title: 'Jersey Collector',
      description: 'Identify 5 cricket jersey legends',
      unlocked: cricketersSolved.length >= 5,
      icon: Shield,
      color: 'emerald'
    },
    {
      title: 'Century Maker',
      description: 'Identify 15 cricket stars',
      unlocked: cricketersSolved.length >= 15,
      icon: Award,
      color: 'emerald'
    },
    {
      title: 'Blitz Master',
      description: 'Score over 100 points in 60s Blitz',
      unlocked: blitzHighScore >= 100,
      icon: Flame,
      color: 'rose'
    }
  ];

  return (
    <div className="flex flex-col min-h-full pb-20 space-y-4">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Award className="w-9 h-9" />
        </div>

        <h2 className="text-xl font-black text-white font-display">
          Trivia Champion
        </h2>
        <div className="text-xs text-slate-400 flex items-center justify-center gap-2 mt-1">
          <span>Telugu Cinema & Cricket Trivia</span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-semibold mb-0.5">
              <Coins className="w-3.5 h-3.5" /> Coins
            </div>
            <div className="text-base font-black text-white font-mono-numbers">
              {coins}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-orange-400 font-semibold mb-0.5">
              <Flame className="w-3.5 h-3.5" /> Streak
            </div>
            <div className="text-base font-black text-white font-mono-numbers">
              {streak} Days
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-semibold mb-0.5">
              <Trophy className="w-3.5 h-3.5" /> Blitz High
            </div>
            <div className="text-base font-black text-white font-mono-numbers">
              {blitzHighScore}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Solving Progress
        </h3>

        {/* Tollywood Progress */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              Tollywood Telugu Movies
            </span>
            <span className="text-amber-400 font-mono-numbers font-bold">
              {moviesSolved.length}/{totalMovies} ({moviePercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${moviePercent}%` }}
            />
          </div>
        </div>

        {/* Cricket Progress */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Cricket Jersey Legends
            </span>
            <span className="text-emerald-400 font-mono-numbers font-bold">
              {cricketersSolved.length}/{totalCricketers} ({cricketPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${cricketPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges and Milestones */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white tracking-wide mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Trophies & Milestones</span>
        </h3>

        <div className="space-y-2.5">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  badge.unlocked
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? badge.color === 'amber'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : badge.color === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-900 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{badge.title}</span>
                    {badge.unlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {badge.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Stats Option */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (window.confirm('Reset all your solved puzzle progress and scores?')) {
              onResetStats();
            }
          }}
          className="text-xs text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto transition-colors py-2 px-3 min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Puzzle Progress</span>
        </button>
      </div>
    </div>
  );
};

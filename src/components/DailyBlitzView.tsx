import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  Timer,
  Zap,
  Flame,
  RotateCcw,
  Trophy,
  Award,
  Clapperboard,
  Shield,
  ChevronRight
} from 'lucide-react';
import { TOLLYWOOD_MOVIES } from '../data/tollywoodMovies';
import { CRICKET_STARS } from '../data/cricketStars';
import { sound } from '../utils/audio';

interface Props {
  onAddCoins: (amt: number) => void;
  highScore: number;
  onUpdateHighScore: (score: number) => void;
}

interface BlitzQuestion {
  type: 'movie' | 'cricket';
  prompt: string;
  subPrompt: string;
  badge: string;
  correctAnswer: string;
  options: string[];
}

export const DailyBlitzView: React.FC<Props> = ({
  onAddCoins,
  highScore,
  onUpdateHighScore
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questions, setQuestions] = useState<BlitzQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Generate randomized pool of 20 rapid questions
  const generateQuestions = (): BlitzQuestion[] => {
    const list: BlitzQuestion[] = [];

    // Add Movie questions
    const shuffledMovies = [...TOLLYWOOD_MOVIES].sort(() => Math.random() - 0.5);
    shuffledMovies.slice(0, 10).forEach((m) => {
      const distractors = TOLLYWOOD_MOVIES.filter((x) => x.id !== m.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((x) => x.displayTitle);

      const options = [m.displayTitle, ...distractors].sort(() => Math.random() - 0.5);

      list.push({
        type: 'movie',
        prompt: `Hero: ${m.hero}`,
        subPrompt: `Heroine: ${m.heroine} · Year: ${m.year}`,
        badge: 'Tollywood Movie',
        correctAnswer: m.displayTitle,
        options
      });
    });

    // Add Cricket questions
    const shuffledCricket = [...CRICKET_STARS].sort(() => Math.random() - 0.5);
    shuffledCricket.slice(0, 10).forEach((c) => {
      const distractors = CRICKET_STARS.filter((x) => x.id !== c.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((x) => c.displayName !== x.displayName ? x.displayName : `${x.displayName} II`);

      const options = [c.displayName, ...distractors].sort(() => Math.random() - 0.5);

      list.push({
        type: 'cricket',
        prompt: `Jersey #${c.jerseyNumber} · ${c.country}`,
        subPrompt: `${c.role} (${c.iplTeam})`,
        badge: 'Cricket Star',
        correctAnswer: c.displayName,
        options
      });
    });

    return list.sort(() => Math.random() - 0.5);
  };

  const handleStartGame = () => {
    const qList = generateQuestions();
    setQuestions(qList);
    setCurrentQIndex(0);
    setScore(0);
    setCombo(1);
    setTimeLeft(60);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('gameover');
      const bonusCoins = Math.floor(score / 5);
      if (bonusCoins > 0) {
        onAddCoins(bonusCoins);
      }
      if (score > highScore) {
        onUpdateHighScore(score);
        try {
          confetti({ particleCount: 100, spread: 80 });
        } catch {
          // ignore
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, timeLeft, score, highScore, onAddCoins, onUpdateHighScore]);

  const handleAnswer = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent double tap

    const currentQ = questions[currentQIndex];
    setSelectedAnswer(option);

    if (option === currentQ.correctAnswer) {
      sound.playCorrect();
      setIsCorrect(true);
      const points = 10 * combo;
      setScore((prev) => prev + points);
      setCombo((prev) => Math.min(prev + 1, 4));
    } else {
      sound.playWrong();
      setIsCorrect(false);
      setCombo(1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        // Recycle questions if finished before timer
        setQuestions((prev) => [...prev, ...generateQuestions()]);
        setCurrentQIndex((prev) => prev + 1);
      }
    }, 380);
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Intro State */}
      {gameState === 'intro' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-emerald-500/10 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-9 h-9" />
            </div>

            <h2 className="text-xl font-black text-white font-display mb-1">
              60s Rapid Blitz
            </h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mb-4">
              Rapid-fire mixed challenge! Solve as many Telugu cast and Cricket jersey puzzles as you can before the clock runs out.
            </p>

            {/* High Score Banner */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 max-w-xs mx-auto mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300">Personal Best:</span>
              </div>
              <span className="text-base font-black text-amber-400 font-mono-numbers">
                {highScore} pts
              </span>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full max-w-xs mx-auto py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 tap-bounce min-h-[48px] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Start 60s Blitz</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Game State */}
      {gameState === 'playing' && questions[currentQIndex] && (
        <div className="space-y-4">
          {/* Top HUD */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-md">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl flex items-center gap-1.5 font-bold font-mono-numbers text-sm ${
                  timeLeft <= 10
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'bg-slate-800 text-amber-400'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Score & Combo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/30">
                <Flame className="w-3.5 h-3.5" />
                <span>{combo}x</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
                <div className="text-base font-black text-white font-mono-numbers">
                  {score}
                </div>
              </div>
            </div>
          </div>

          {/* Current Question Card */}
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center"
          >
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 bg-slate-800 text-slate-300">
              {questions[currentQIndex].type === 'movie' ? (
                <>
                  <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tollywood Movie</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cricket Jersey</span>
                </>
              )}
            </div>

            <h3 className="text-lg font-black text-white mb-1">
              {questions[currentQIndex].prompt}
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6">
              {questions[currentQIndex].subPrompt}
            </p>

            {/* 4 Choices Buttons */}
            <div className="grid grid-cols-1 gap-2.5 text-left">
              {questions[currentQIndex].options.map((opt, idx) => {
                const isThisSelected = selectedAnswer === opt;
                const isThisCorrect = opt === questions[currentQIndex].correctAnswer;

                let btnStyle = 'bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700';

                if (selectedAnswer !== null) {
                  if (isThisCorrect) {
                    btnStyle = 'bg-emerald-500 border-emerald-400 text-slate-950 font-black';
                  } else if (isThisSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500 border-rose-400 text-white font-bold';
                  } else {
                    btnStyle = 'bg-slate-900 border-slate-800 text-slate-600 opacity-40';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all tap-bounce min-h-[50px] shadow-sm ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-9 h-9" />
          </div>

          <h3 className="text-2xl font-black text-white font-display">
            Blitz Complete!
          </h3>

          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 max-w-xs mx-auto space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Final Score:</span>
              <span className="text-lg font-black text-amber-400 font-mono-numbers">
                {score} pts
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">High Score:</span>
              <span className="text-sm font-bold text-slate-200 font-mono-numbers">
                {Math.max(score, highScore)} pts
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">Bonus Coins Earned:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono-numbers">
                +{Math.floor(score / 5)} Coins
              </span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full max-w-xs mx-auto py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 tap-bounce min-h-[48px] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Another Blitz</span>
          </button>
        </div>
      )}
    </div>
  );
};

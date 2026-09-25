import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Shield,
  Lightbulb,
  Trash2,
  Shuffle,
  ChevronRight,
  CheckCircle2,
  Award,
  Zap,
  Flame,
  Activity
} from 'lucide-react';
import { Cricketer } from '../types/puzzle';
import { CRICKET_STARS } from '../data/cricketStars';
import { sound } from '../utils/audio';

// Static imported asset from image generation
import cricketBannerImg from '../assets/images/cricket_jersey_banner_1790354402515.jpg';

interface Props {
  coins: number;
  onAddCoins: (amt: number) => void;
  onSpendCoins: (amt: number) => boolean;
  solvedIds: string[];
  onSolve: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const CricketJerseyPuzzleView: React.FC<Props> = ({
  coins,
  onAddCoins,
  onSpendCoins,
  solvedIds,
  onSolve,
  soundEnabled,
  onToggleSound
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'tiles' | 'choice'>('tiles');

  const player: Cricketer = CRICKET_STARS[currentIndex % CRICKET_STARS.length];
  const isSolved = solvedIds.includes(player.id);

  const cleanAnswer = useMemo(() => player.cleanAnswer.toUpperCase().replace(/[^A-Z]/g, ''), [player]);
  const answerLength = cleanAnswer.length;

  const [slots, setSlots] = useState<{ letter: string; bankIndex: number | null; isHint?: boolean }[]>([]);
  const [revealedCommentary, setRevealedCommentary] = useState(false);
  const [revealedRole, setRevealedRole] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isWrongShake, setIsWrongShake] = useState(false);
  const [letterBank, setLetterBank] = useState<{ id: string; char: string; disabled: boolean }[]>([]);

  // Setup round
  useEffect(() => {
    const chars = cleanAnswer.split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numDistractors = Math.max(3, 14 - chars.length);
    for (let i = 0; i < numDistractors; i++) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      chars.push(randChar);
    }
    const shuffled = chars
      .map((char, idx) => ({ id: `${char}-${idx}-${Math.random()}`, char, disabled: false }))
      .sort(() => Math.random() - 0.5);

    setLetterBank(shuffled);
    setSlots(Array(answerLength).fill({ letter: '', bankIndex: null, isHint: false }));
    setRevealedCommentary(false);
    setRevealedRole(false);
    setShowSuccessModal(false);
    setIsWrongShake(false);
  }, [currentIndex, cleanAnswer, answerLength]);

  const handleBankLetterClick = (bankIdx: number) => {
    const item = letterBank[bankIdx];
    if (item.disabled || isSolved) return;

    const emptySlotIdx = slots.findIndex((s) => !s.letter);
    if (emptySlotIdx === -1) return;

    sound.tapLetter();

    const newSlots = [...slots];
    newSlots[emptySlotIdx] = { letter: item.char, bankIndex: bankIdx, isHint: false };
    setSlots(newSlots);

    const newBank = [...letterBank];
    newBank[bankIdx].disabled = true;
    setLetterBank(newBank);

    checkAnswerCompletion(newSlots);
  };

  const handleSlotClick = (slotIdx: number) => {
    const slot = slots[slotIdx];
    if (!slot.letter || slot.isHint || isSolved) return;

    sound.removeLetter();

    if (slot.bankIndex !== null && letterBank[slot.bankIndex]) {
      const newBank = [...letterBank];
      newBank[slot.bankIndex].disabled = false;
      setLetterBank(newBank);
    }

    const newSlots = [...slots];
    newSlots[slotIdx] = { letter: '', bankIndex: null, isHint: false };
    setSlots(newSlots);
  };

  const checkAnswerCompletion = (currentSlots: { letter: string; bankIndex: number | null; isHint?: boolean }[]) => {
    const isFull = currentSlots.every((s) => s.letter !== '');
    if (!isFull) return;

    const currentWord = currentSlots.map((s) => s.letter).join('');
    if (currentWord === cleanAnswer) {
      sound.playCorrect();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Fallback
      }
      onSolve(player.id);
      onAddCoins(25);
      setShowSuccessModal(true);
    } else {
      sound.playWrong();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
    }
  };

  const handleClear = () => {
    sound.removeLetter();
    const newBank = letterBank.map((b) => ({ ...b, disabled: false }));
    const newSlots = slots.map((s) => (s.isHint ? s : { letter: '', bankIndex: null, isHint: false }));
    newSlots.forEach((s) => {
      if (s.isHint && s.bankIndex !== null && newBank[s.bankIndex]) {
        newBank[s.bankIndex].disabled = true;
      }
    });
    setLetterBank(newBank);
    setSlots(newSlots);
  };

  const handleShuffle = () => {
    sound.tapLetter();
    const shuffled = [...letterBank].sort(() => Math.random() - 0.5);
    setLetterBank(shuffled);
  };

  // Hint: reveal 1 letter
  const handleRevealLetterHint = () => {
    if (coins < 15) return;
    const targetIdx = slots.findIndex((s, idx) => s.letter !== cleanAnswer[idx]);
    if (targetIdx === -1) return;

    if (!onSpendCoins(15)) return;
    sound.playHint();

    const expectedChar = cleanAnswer[targetIdx];
    const bankIdx = letterBank.findIndex((b) => b.char === expectedChar && !b.disabled);

    const prevSlot = slots[targetIdx];
    const newBank = [...letterBank];
    if (prevSlot.bankIndex !== null && newBank[prevSlot.bankIndex]) {
      newBank[prevSlot.bankIndex].disabled = false;
    }

    if (bankIdx !== -1) {
      newBank[bankIdx].disabled = true;
    }

    const newSlots = [...slots];
    newSlots[targetIdx] = { letter: expectedChar, bankIndex: bankIdx !== -1 ? bankIdx : null, isHint: true };
    setSlots(newSlots);
    setLetterBank(newBank);

    checkAnswerCompletion(newSlots);
  };

  // Hint: eliminate wrong letters
  const handleEliminateLetters = () => {
    if (coins < 20) return;
    const answerChars = cleanAnswer.split('');
    const wrongBankIndices = letterBank
      .map((b, idx) => (!answerChars.includes(b.char) && !b.disabled ? idx : -1))
      .filter((idx) => idx !== -1);

    if (wrongBankIndices.length === 0) return;

    if (!onSpendCoins(20)) return;
    sound.playHint();

    const toRemove = wrongBankIndices.slice(0, 3);
    const newBank = [...letterBank];
    toRemove.forEach((idx) => {
      newBank[idx].disabled = true;
    });
    setLetterBank(newBank);
  };

  const handleNextPlayer = () => {
    setCurrentIndex((prev) => (prev + 1) % CRICKET_STARS.length);
  };

  const handlePrevPlayer = () => {
    setCurrentIndex((prev) => (prev - 1 + CRICKET_STARS.length) % CRICKET_STARS.length);
  };

  // 4 Multiple Choice choices
  const multipleChoiceOptions = useMemo(() => {
    const distractors = CRICKET_STARS.filter((p) => p.id !== player.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [player, ...distractors].sort(() => Math.random() - 0.5);
  }, [player]);

  const handleSelectChoice = (selectedPlayer: Cricketer) => {
    if (selectedPlayer.id === player.id) {
      sound.playCorrect();
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {
        // Fallback
      }
      onSolve(player.id);
      onAddCoins(25);
      setShowSuccessModal(true);
    } else {
      sound.playWrong();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Stadium Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-xl mb-4">
        <div className="absolute inset-0 z-0">
          <img
            src={cricketBannerImg}
            alt="Cricket Stadium"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Cricket Jersey Riddle
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono-numbers text-slate-400">
                Player {currentIndex + 1}/{CRICKET_STARS.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isSolved ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              ) : (
                <span className="text-xs text-emerald-400 font-mono-numbers">+25 Coins</span>
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-white tracking-wide">
            Guess Cricketer By Jersey & Clues
          </h2>
          <p className="text-xs text-slate-300">
            Decode the legendary cricketer from the iconic jersey number, colors & feats!
          </p>
        </div>
      </div>

      {/* Main Feature: 3D-Styled Athletic Jersey Card */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-lg mb-4">
        {/* Rendered Jersey Graphic */}
        <div className="flex items-center justify-center py-2 mb-3">
          <div className="relative w-44 h-52 sm:w-48 sm:h-56 flex items-center justify-center drop-shadow-2xl">
            {/* SVG Jersey Graphic with Dynamic Colors */}
            <svg
              viewBox="0 0 200 240"
              className="w-full h-full filter drop-shadow-lg"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Drop Shadow Filter */}
              <defs>
                <linearGradient id="jerseyShine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* Jersey Body & Sleeves Outline */}
              <path
                d="M 60,25 
                   C 75,35 125,35 140,25 
                   L 185,55 
                   L 165,95 
                   L 145,85 
                   L 150,225 
                   C 150,230 50,230 50,225 
                   L 55,85 
                   L 35,95 
                   L 15,55 
                   Z"
                fill={player.jerseyColors.primary}
                stroke={player.jerseyColors.secondary}
                strokeWidth="4"
              />

              {/* Collar Accent */}
              <path
                d="M 70,25 C 85,45 115,45 130,25 L 140,25 C 120,55 80,55 60,25 Z"
                fill={player.jerseyColors.secondary}
              />

              {/* Shoulder/Sleeve Trim Stripes */}
              <line
                x1="22"
                y1="62"
                x2="45"
                y2="78"
                stroke={player.jerseyColors.secondary}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1="178"
                y1="62"
                x2="155"
                y2="78"
                stroke={player.jerseyColors.secondary}
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Shading Overlay */}
              <path
                d="M 60,25 
                   C 75,35 125,35 140,25 
                   L 185,55 
                   L 165,95 
                   L 145,85 
                   L 150,225 
                   C 150,230 50,230 50,225 
                   L 55,85 
                   L 35,95 
                   L 15,55 
                   Z"
                fill="url(#jerseyShine)"
              />

              {/* Big Iconic Number */}
              <text
                x="100"
                y="155"
                fontSize="68"
                fontWeight="900"
                fontFamily="'JetBrains Mono', 'Plus Jakarta Sans', sans-serif"
                fill={player.jerseyColors.numberColor}
                textAnchor="middle"
                dominantBaseline="middle"
                stroke="#000000"
                strokeWidth="1.5"
              >
                {player.jerseyNumber}
              </text>

              {/* Jersey Subtext / Country */}
              <text
                x="100"
                y="195"
                fontSize="12"
                fontWeight="700"
                fill={player.jerseyColors.numberColor}
                textAnchor="middle"
                opacity="0.9"
                letterSpacing="3"
              >
                {player.country.toUpperCase()}
              </text>
            </svg>
          </div>
        </div>

        {/* Team Badges & Jersey Info */}
        <div className="flex items-center justify-between text-xs text-slate-300 pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{player.country}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{player.iplTeam}</span>
          </div>
          <span className="text-xs text-emerald-400/90 font-medium">
            {player.difficulty}
          </span>
        </div>

        {/* Clue 1: Iconic Match Moment */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 mb-3">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Iconic Match Moment / Clue:
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            "{player.iconicMoment}"
          </p>
        </div>

        {/* Unlockable Clues: Batting/Bowling Style & Commentary */}
        <div className="space-y-2">
          {revealedRole ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs space-y-1"
            >
              <div className="flex items-center gap-2 text-white">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Role:</span> {player.role}
              </div>
              <div className="text-slate-300 text-[11px] pl-5.5">
                🏏 {player.battingStyle} · 🎯 {player.bowlingStyle}
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setRevealedRole(true)}
              className="w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 text-xs flex items-center justify-center gap-1.5 transition-colors tap-bounce min-h-[44px]"
            >
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unlock Batting/Bowling Style Clue (Free)</span>
            </button>
          )}

          {revealedCommentary ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200"
            >
              <div className="font-semibold text-emerald-300 text-[11px] mb-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Iconic Stadium Commentary:
              </div>
              <div className="italic font-medium">"{player.hintQuote}"</div>
            </motion.div>
          ) : (
            <button
              onClick={() => setRevealedCommentary(true)}
              className="w-full py-1.5 px-3 rounded-lg border border-dashed border-emerald-500/30 text-emerald-400/90 hover:bg-emerald-500/10 text-xs flex items-center justify-center gap-1.5 transition-colors tap-bounce min-h-[44px]"
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reveal Iconic Commentary Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setInputMode('tiles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
              inputMode === 'tiles'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Letter Tiles
          </button>
          <button
            onClick={() => setInputMode('choice')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
              inputMode === 'choice'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4 Choices
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPlayer}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 min-h-[38px] tap-bounce"
            title="Previous Player"
          >
            Prev
          </button>
          <button
            onClick={handleNextPlayer}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 min-h-[38px] tap-bounce flex items-center gap-1"
            title="Next Player"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tiles Mode */}
      {inputMode === 'tiles' && (
        <div className="space-y-4">
          {/* Answer Slots Display */}
          <div
            className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 transition-all ${
              isWrongShake ? 'ring-2 ring-rose-500 animate-bounce' : ''
            }`}
          >
            {slots.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border flex items-center justify-center font-bold text-lg transition-all tap-bounce ${
                  slot.letter
                    ? slot.isHint
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800 border-emerald-400/50 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
                disabled={!slot.letter || slot.isHint || isSolved}
              >
                {slot.letter}
              </button>
            ))}
          </div>

          {/* Letter Bank Keyboard */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Spell the cricketer's name:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleShuffle}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 tap-bounce"
                  title="Shuffle Letters"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 tap-bounce"
                  title="Clear Slots"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {letterBank.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleBankLetterClick(idx)}
                  disabled={item.disabled || isSolved}
                  className={`min-h-[44px] h-11 sm:h-12 rounded-xl font-bold text-base flex items-center justify-center transition-all tap-bounce ${
                    item.disabled
                      ? 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 active:scale-95 shadow-sm'
                  }`}
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>

          {/* Power-up Hints Bar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRevealLetterHint}
              disabled={coins < 15 || isSolved}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all tap-bounce min-h-[44px] ${
                coins >= 15 && !isSolved
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>Reveal 1 Letter</span>
              <span className="font-mono-numbers text-emerald-400 text-[10px] ml-1">
                (15 coins)
              </span>
            </button>

            <button
              onClick={handleEliminateLetters}
              disabled={coins < 20 || isSolved}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all tap-bounce min-h-[44px] ${
                coins >= 20 && !isSolved
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Remove 3 Wrong</span>
              <span className="font-mono-numbers text-rose-400 text-[10px] ml-1">
                (20 coins)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Multiple Choice Mode */}
      {inputMode === 'choice' && (
        <div className="space-y-2.5">
          <div className="text-xs font-medium text-slate-400 px-1">
            Pick the matching cricket star:
          </div>
          <div className="grid grid-cols-1 gap-2">
            {multipleChoiceOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectChoice(opt)}
                disabled={isSolved}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all tap-bounce min-h-[52px] ${
                  isSolved && opt.id === player.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-white'
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{opt.displayName}</span>
                    <span className="text-xs font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                      #{opt.jerseyNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {opt.nickname} · {opt.country}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Award className="w-8 h-8" />
              </div>

              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                Cricket Legend Decoded!
              </div>

              <h3 className="text-xl font-black text-white font-display mb-0.5">
                {player.displayName}
              </h3>
              <p className="text-sm text-emerald-300 font-medium mb-3">
                Jersey #{player.jerseyNumber} · {player.nickname}
              </p>

              <div className="bg-slate-950/70 rounded-xl p-3 text-left border border-slate-800 mb-4 text-xs space-y-1.5">
                <div className="text-slate-300">
                  <span className="text-slate-500">Full Name:</span> {player.fullName}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Role:</span> {player.role}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Style:</span> {player.battingStyle}
                </div>
                <div className="text-emerald-400/90 pt-1 text-[11px] border-t border-slate-800">
                  🏆 {player.iconicMoment}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-slate-400">Reward:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono-numbers">
                  +25 Coins
                </span>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleNextPlayer();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 tap-bounce min-h-[48px]"
              >
                Next Cricket Jersey
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

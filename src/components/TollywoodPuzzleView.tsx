import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Sparkles,
  Lightbulb,
  Trash2,
  Shuffle,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  HelpCircle,
  Clapperboard,
  Music,
  UserCheck,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { TollywoodMovie } from '../types/puzzle';
import { TOLLYWOOD_MOVIES } from '../data/tollywoodMovies';
import { sound } from '../utils/audio';

// Static imported asset from image generation
import cinemaBannerImg from '../assets/images/tollywood_cinema_banner_1790354388481.jpg';

interface Props {
  coins: number;
  onAddCoins: (amt: number) => void;
  onSpendCoins: (amt: number) => boolean;
  solvedIds: string[];
  onSolve: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TollywoodPuzzleView: React.FC<Props> = ({
  coins,
  onAddCoins,
  onSpendCoins,
  solvedIds,
  onSolve,
  soundEnabled,
  onToggleSound
}) => {
  // Filter or pick current puzzle
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'tiles' | 'choice'>('tiles');
  
  // Current movie
  const movie: TollywoodMovie = TOLLYWOOD_MOVIES[currentIndex % TOLLYWOOD_MOVIES.length];
  const isSolved = solvedIds.includes(movie.id);

  // Solved state and answer tracking
  const cleanAnswer = useMemo(() => movie.cleanAnswer.toUpperCase().replace(/[^A-Z]/g, ''), [movie]);
  const answerLength = cleanAnswer.length;

  // Selected letter indices from available keyboard bank
  // slots: Array of objects { letter: string; bankIndex: number | null; isHint?: boolean }
  const [slots, setSlots] = useState<{ letter: string; bankIndex: number | null; isHint?: boolean }[]>([]);
  const [revealedDialogue, setRevealedDialogue] = useState(false);
  const [revealedDirector, setRevealedDirector] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isWrongShake, setIsWrongShake] = useState(false);

  // Generate scrambled letter bank (answer letters + 4 random distractors)
  const [letterBank, setLetterBank] = useState<{ id: string; char: string; disabled: boolean }[]>([]);

  // Initialize puzzle round
  useEffect(() => {
    // Generate letter bank
    const chars = cleanAnswer.split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numDistractors = Math.max(3, 14 - chars.length);
    for (let i = 0; i < numDistractors; i++) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      chars.push(randChar);
    }
    // Shuffle
    const shuffled = chars
      .map((char, idx) => ({ id: `${char}-${idx}-${Math.random()}`, char, disabled: false }))
      .sort(() => Math.random() - 0.5);

    setLetterBank(shuffled);
    setSlots(Array(answerLength).fill({ letter: '', bankIndex: null, isHint: false }));
    setRevealedDialogue(false);
    setRevealedDirector(false);
    setShowSuccessModal(false);
    setIsWrongShake(false);
  }, [currentIndex, cleanAnswer, answerLength]);

  // Handle letter click from keyboard
  const handleBankLetterClick = (bankIdx: number) => {
    const item = letterBank[bankIdx];
    if (item.disabled || isSolved) return;

    // Find first empty slot
    const emptySlotIdx = slots.findIndex((s) => !s.letter);
    if (emptySlotIdx === -1) return;

    sound.tapLetter();

    const newSlots = [...slots];
    newSlots[emptySlotIdx] = { letter: item.char, bankIndex: bankIdx, isHint: false };
    setSlots(newSlots);

    const newBank = [...letterBank];
    newBank[bankIdx].disabled = true;
    setLetterBank(newBank);

    // Check if slots are fully filled
    checkAnswerCompletion(newSlots);
  };

  // Remove letter from slot
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

  // Check answer
  const checkAnswerCompletion = (currentSlots: { letter: string; bankIndex: number | null; isHint?: boolean }[]) => {
    const isFull = currentSlots.every((s) => s.letter !== '');
    if (!isFull) return;

    const currentWord = currentSlots.map((s) => s.letter).join('');
    if (currentWord === cleanAnswer) {
      // Victory!
      sound.playCorrect();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
      onSolve(movie.id);
      onAddCoins(25);
      setShowSuccessModal(true);
    } else {
      // Wrong guess
      sound.playWrong();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
    }
  };

  // Clear all non-hint slots
  const handleClear = () => {
    sound.removeLetter();
    const newBank = letterBank.map((b) => ({ ...b, disabled: false }));
    const newSlots = slots.map((s) => (s.isHint ? s : { letter: '', bankIndex: null, isHint: false }));
    // Disable bank letters that are kept by hints
    newSlots.forEach((s) => {
      if (s.isHint && s.bankIndex !== null && newBank[s.bankIndex]) {
        newBank[s.bankIndex].disabled = true;
      }
    });
    setLetterBank(newBank);
    setSlots(newSlots);
  };

  // Shuffle keyboard letters
  const handleShuffle = () => {
    sound.tapLetter();
    const shuffled = [...letterBank].sort(() => Math.random() - 0.5);
    setLetterBank(shuffled);
  };

  // Hint 1: Reveal next correct letter (Cost: 15 coins)
  const handleRevealLetterHint = () => {
    if (coins < 15) return;
    // Find first slot that does not match correct answer
    const targetIdx = slots.findIndex((s, idx) => s.letter !== cleanAnswer[idx]);
    if (targetIdx === -1) return;

    if (!onSpendCoins(15)) return;
    sound.playHint();

    const expectedChar = cleanAnswer[targetIdx];
    // Find this char in letterBank that is not currently locked as hint
    const bankIdx = letterBank.findIndex((b) => b.char === expectedChar && !b.disabled);

    // Free the previous letter in target slot if occupied
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

  // Hint 2: Eliminate 3 wrong letters (Cost: 20 coins)
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

  // Next movie
  const handleNextMovie = () => {
    setCurrentIndex((prev) => (prev + 1) % TOLLYWOOD_MOVIES.length);
  };

  const handlePrevMovie = () => {
    setCurrentIndex((prev) => (prev - 1 + TOLLYWOOD_MOVIES.length) % TOLLYWOOD_MOVIES.length);
  };

  // Multiple Choice Mode Options
  const multipleChoiceOptions = useMemo(() => {
    const distractors = TOLLYWOOD_MOVIES.filter((m) => m.id !== movie.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [movie, ...distractors].sort(() => Math.random() - 0.5);
  }, [movie]);

  const handleSelectChoice = (selectedMovie: TollywoodMovie) => {
    if (selectedMovie.id === movie.id) {
      sound.playCorrect();
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {
        // Fallback
      }
      onSolve(movie.id);
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
      {/* Header Banner / Cinema Atmosphere */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 shadow-xl mb-4">
        <div className="absolute inset-0 z-0">
          <img
            src={cinemaBannerImg}
            alt="Tollywood Cinema"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Clapperboard className="w-4 h-4 text-amber-400" />
                Tollywood Cast Riddle
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono-numbers text-slate-400">
                Puzzle {currentIndex + 1}/{TOLLYWOOD_MOVIES.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isSolved ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-mono-numbers">+25 Coins</span>
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-white tracking-wide">
            Guess Telugu Movie By Cast
          </h2>
          <p className="text-xs text-slate-300">
            Identify the Tollywood blockbuster from the star cast & iconic clues!
          </p>
        </div>
      </div>

      {/* Primary Clue Card: Cast & Stars */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-lg mb-4">
        {/* Top bar of clue card: Year & Genre */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">{movie.year}</span>
            <span aria-hidden="true">·</span>
            <span>{movie.genre}</span>
          </div>
          <span className="text-xs text-amber-400/90 font-medium">
            {movie.difficulty}
          </span>
        </div>

        {/* Lead Actors Presentation */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Lead Hero */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-amber-400/90 uppercase tracking-wider font-semibold">
                Hero / Lead
              </div>
              <div className="text-sm font-bold text-white truncate">
                {movie.hero}
              </div>
            </div>
          </div>

          {/* Lead Heroine */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-rose-400/90 uppercase tracking-wider font-semibold">
                Heroine / Co-Star
              </div>
              <div className="text-sm font-bold text-white truncate">
                {movie.heroine}
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Cast & Crew */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 mb-3 space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Supporting / Villain / Comedian:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {movie.supportingCast.map((actor, idx) => (
              <span
                key={idx}
                className="text-xs bg-slate-800/90 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700/60 font-medium"
              >
                {actor}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Locked Clues: Director & Music / Dialogue */}
        <div className="space-y-2">
          {/* Director & Music Clue */}
          {revealedDirector ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Director:</span>
                <span className="font-semibold text-white">{movie.director}</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">{movie.musicDirector}</span>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setRevealedDirector(true)}
              className="w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 text-xs flex items-center justify-center gap-1.5 transition-colors tap-bounce min-h-[44px]"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Director & Music Director Hint (Free)</span>
            </button>
          )}

          {/* Dialogue Hint */}
          {revealedDialogue ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90"
            >
              <div className="font-semibold text-amber-300 text-[11px] mb-0.5">
                Famous Punch Dialogue / Clue:
              </div>
              <div className="italic font-medium">"{movie.iconicDialogue}"</div>
              <div className="text-[11px] text-amber-300/70 mt-1">
                {movie.iconicDialogueEnglish}
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setRevealedDialogue(true)}
              className="w-full py-1.5 px-3 rounded-lg border border-dashed border-amber-500/30 text-amber-400/90 hover:bg-amber-500/10 text-xs flex items-center justify-center gap-1.5 transition-colors tap-bounce min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Reveal Iconic Telugu Dialogue / Clue</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Selector (Tiles vs Multiple Choice) */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setInputMode('tiles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
              inputMode === 'tiles'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Letter Tiles
          </button>
          <button
            onClick={() => setInputMode('choice')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
              inputMode === 'choice'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4 Choices
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMovie}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 min-h-[38px] tap-bounce"
            title="Previous Movie"
          >
            Prev
          </button>
          <button
            onClick={handleNextMovie}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 min-h-[38px] tap-bounce flex items-center gap-1"
            title="Next Movie"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guessing Area: Tiles Mode */}
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
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800 border-amber-400/50 text-white shadow-md'
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
                Tap letters to spell the movie:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleShuffle}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 tap-bounce"
                  title="Shuffle Keyboard"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 tap-bounce"
                  title="Clear Non-Hint Letters"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2-row letter keyboard */}
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
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Reveal 1 Letter</span>
              <span className="font-mono-numbers text-amber-400 text-[10px] ml-1">
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

      {/* Guessing Area: Multiple Choice Mode */}
      {inputMode === 'choice' && (
        <div className="space-y-2.5">
          <div className="text-xs font-medium text-slate-400 px-1">
            Choose the matching Tollywood movie:
          </div>
          <div className="grid grid-cols-1 gap-2">
            {multipleChoiceOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectChoice(opt)}
                disabled={isSolved}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all tap-bounce min-h-[52px] ${
                  isSolved && opt.id === movie.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-white'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{opt.displayTitle}</div>
                  <div className="text-xs text-slate-400 font-serif">
                    {opt.teluguTitle} · {opt.year}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Success Modal / Banner */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-8 h-8" />
              </div>

              <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
                Blockbuster Solved!
              </div>

              <h3 className="text-xl font-black text-white font-display mb-1">
                {movie.displayTitle}
              </h3>
              <p className="text-sm text-amber-200/90 font-serif mb-4">
                {movie.teluguTitle} ({movie.year})
              </p>

              <div className="bg-slate-950/70 rounded-xl p-3 text-left border border-slate-800 mb-4 text-xs space-y-1.5">
                <div className="text-slate-300">
                  <span className="text-slate-500">Director:</span> {movie.director}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Music:</span> {movie.musicDirector}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Punch:</span> "{movie.iconicDialogue}"
                </div>
                <div className="text-amber-400/90 pt-1 text-[11px] border-t border-slate-800">
                  💡 {movie.trivia}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-slate-400">Reward:</span>
                <span className="text-sm font-bold text-amber-400 font-mono-numbers">
                  +25 Coins
                </span>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleNextMovie();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 tap-bounce min-h-[48px]"
              >
                Next Tollywood Movie
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

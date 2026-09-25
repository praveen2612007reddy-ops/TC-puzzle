import React, { useState, useMemo } from 'react';
import {
  Search,
  Film,
  Trophy,
  Sparkles,
  User,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  X,
  Clapperboard,
  Check
} from 'lucide-react';
import { TOLLYWOOD_MOVIES } from '../data/tollywoodMovies';
import { CRICKET_STARS } from '../data/cricketStars';
import { TollywoodMovie, Cricketer } from '../types/puzzle';

export const SmartSolverView: React.FC = () => {
  const [solverTab, setSolverTab] = useState<'tollywood' | 'cricket' | 'dialogue'>('tollywood');

  // Tollywood filters
  const [selectedHero, setSelectedHero] = useState<string>('');
  const [selectedHeroine, setSelectedHeroine] = useState<string>('');
  const [freeSearchText, setFreeSearchText] = useState<string>('');

  // Cricket filters
  const [jerseyQuery, setJerseyQuery] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Dialogue / Keyword query
  const [dialogueQuery, setDialogueQuery] = useState<string>('');

  // Pre-compiled list of top Tollywood actors for quick-tap tags
  const topHeroes = ['Prabhas', 'Mahesh Babu', 'Allu Arjun', 'Ram Charan', 'Nani', 'Pawan Kalyan', 'NTR Jr.', 'Vijay Deverakonda'];
  const topHeroines = ['Samantha', 'Anushka Shetty', 'Rashmika Mandanna', 'Mrunal Thakur', 'Pooja Hegde', 'Shruti Haasan', 'Tamannaah'];

  // Popular jersey numbers for quick-tap
  const popularJerseys = [7, 18, 45, 10, 93, 17, 333, 12, 63, 8, 99, 11, 30, 228];

  // Filtered Tollywood movies
  const matchedMovies = useMemo(() => {
    return TOLLYWOOD_MOVIES.filter((m) => {
      const heroMatch = !selectedHero || m.hero.toLowerCase().includes(selectedHero.toLowerCase());
      const heroineMatch = !selectedHeroine || m.heroine.toLowerCase().includes(selectedHeroine.toLowerCase());
      const freeMatch =
        !freeSearchText ||
        m.displayTitle.toLowerCase().includes(freeSearchText.toLowerCase()) ||
        m.teluguTitle.includes(freeSearchText) ||
        m.hero.toLowerCase().includes(freeSearchText.toLowerCase()) ||
        m.heroine.toLowerCase().includes(freeSearchText.toLowerCase()) ||
        m.director.toLowerCase().includes(freeSearchText.toLowerCase()) ||
        m.musicDirector.toLowerCase().includes(freeSearchText.toLowerCase()) ||
        m.supportingCast.some((c) => c.toLowerCase().includes(freeSearchText.toLowerCase()));

      return heroMatch && heroineMatch && freeMatch;
    });
  }, [selectedHero, selectedHeroine, freeSearchText]);

  // Filtered Cricket Stars
  const matchedCricketers = useMemo(() => {
    return CRICKET_STARS.filter((c) => {
      const jerseyMatch =
        !jerseyQuery ||
        c.jerseyNumber.toString() === jerseyQuery.trim() ||
        c.displayName.toLowerCase().includes(jerseyQuery.toLowerCase()) ||
        c.fullName.toLowerCase().includes(jerseyQuery.toLowerCase());

      const teamMatch =
        !selectedTeam ||
        c.iplTeam.toLowerCase().includes(selectedTeam.toLowerCase()) ||
        c.country.toLowerCase().includes(selectedTeam.toLowerCase());

      return jerseyMatch && teamMatch;
    });
  }, [jerseyQuery, selectedTeam]);

  // Dialogue / Clue Riddle Matcher
  const matchedRiddles = useMemo(() => {
    if (!dialogueQuery.trim()) return [];
    const q = dialogueQuery.toLowerCase();

    const movies = TOLLYWOOD_MOVIES.filter(
      (m) =>
        m.iconicDialogue.toLowerCase().includes(q) ||
        m.iconicDialogueEnglish.toLowerCase().includes(q) ||
        m.displayTitle.toLowerCase().includes(q)
    ).map((m) => ({ type: 'movie' as const, data: m }));

    const cricketers = CRICKET_STARS.filter(
      (c) =>
        c.iconicMoment.toLowerCase().includes(q) ||
        c.hintQuote.toLowerCase().includes(q) ||
        c.nickname.toLowerCase().includes(q)
    ).map((c) => ({ type: 'cricket' as const, data: c }));

    return [...movies, ...cricketers];
  }, [dialogueQuery]);

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Solver Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Instant Puzzle Solver & Detective
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          Stuck on a riddle or playing trivia? Reverse-search Telugu movies by cast or cricketers by jersey number!
        </p>

        {/* Solver Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setSolverTab('tollywood')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors min-h-[44px] ${
              solverTab === 'tollywood'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Tollywood</span>
          </button>

          <button
            onClick={() => setSolverTab('cricket')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors min-h-[44px] ${
              solverTab === 'cricket'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Cricket #</span>
          </button>

          <button
            onClick={() => setSolverTab('dialogue')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors min-h-[44px] ${
              solverTab === 'dialogue'
                ? 'bg-purple-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Punch/Riddle</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Tollywood Cast-to-Movie Solver */}
      {solverTab === 'tollywood' && (
        <div className="space-y-4">
          {/* Search Inputs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            {/* Free search / Any actor, director, supporting cast */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by any actor, director, or title..."
                value={freeSearchText}
                onChange={(e) => setFreeSearchText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 min-h-[44px]"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              {freeSearchText && (
                <button
                  onClick={() => setFreeSearchText('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Hero Selector */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Filter by Hero:</span>
                {selectedHero && (
                  <button
                    onClick={() => setSelectedHero('')}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Clear ({selectedHero})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topHeroes.map((hero) => (
                  <button
                    key={hero}
                    onClick={() => setSelectedHero(selectedHero === hero ? '' : hero)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all tap-bounce min-h-[32px] ${
                      selectedHero === hero
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {hero}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Heroine Selector */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Filter by Heroine:</span>
                {selectedHeroine && (
                  <button
                    onClick={() => setSelectedHeroine('')}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Clear ({selectedHeroine})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topHeroines.map((heroine) => (
                  <button
                    key={heroine}
                    onClick={() => setSelectedHeroine(selectedHeroine === heroine ? '' : heroine)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all tap-bounce min-h-[32px] ${
                      selectedHeroine === heroine
                        ? 'bg-rose-500 border-rose-400 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {heroine}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2 px-1 flex items-center justify-between">
              <span>Matching Tollywood Movies ({matchedMovies.length}):</span>
              <span className="text-[11px] text-slate-500">Instant database lookup</span>
            </div>

            {matchedMovies.length === 0 ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                No Telugu movie matched this exact cast combination. Try clearing filters or typing partial names.
              </div>
            ) : (
              <div className="space-y-2.5">
                {matchedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{movie.displayTitle}</span>
                          <span className="text-xs text-amber-400/90 font-serif">
                            ({movie.teluguTitle})
                          </span>
                        </h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-300">{movie.year}</span>
                          <span aria-hidden="true">·</span>
                          <span>{movie.genre}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {movie.cleanAnswer}
                      </span>
                    </div>

                    {/* Cast Info */}
                    <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/70 text-xs space-y-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400/90 font-medium">Hero:</span>
                        <span className="text-white font-semibold">{movie.hero}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-rose-400/90 font-medium">Heroine:</span>
                        <span className="text-slate-200">{movie.heroine}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Director: {movie.director}</span>
                        <span aria-hidden="true">·</span>
                        <span>Music: {movie.musicDirector}</span>
                      </div>
                    </div>

                    {/* Dialogue quote */}
                    <div className="text-[11px] italic text-slate-400 border-l-2 border-amber-500 pl-2">
                      "{movie.iconicDialogue}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Cricket Jersey Number Solver */}
      {solverTab === 'cricket' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            {/* Jersey Number input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Jersey # (e.g., 7, 18, 45, 10, 93) or Player Name..."
                value={jerseyQuery}
                onChange={(e) => setJerseyQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              {jerseyQuery && (
                <button
                  onClick={() => setJerseyQuery('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Tap Jersey Numbers */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Popular Jersey Numbers:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularJerseys.map((num) => (
                  <button
                    key={num}
                    onClick={() => setJerseyQuery(num.toString())}
                    className={`px-3 py-1.5 text-xs font-mono-numbers font-bold rounded-lg border transition-all tap-bounce min-h-[38px] ${
                      jerseyQuery === num.toString()
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    #{num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2 px-1 flex items-center justify-between">
              <span>Matching Cricketers ({matchedCricketers.length}):</span>
              <span className="text-[11px] text-slate-500">Jersey directory</span>
            </div>

            {matchedCricketers.length === 0 ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                No cricketer found with jersey #{jerseyQuery}. Try numbers like 7, 18, 45, 10, or 93.
              </div>
            ) : (
              <div className="space-y-2.5">
                {matchedCricketers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-3.5 transition-all shadow-md flex items-start gap-3.5"
                  >
                    {/* Mini Jersey Badge */}
                    <div
                      className="w-14 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-md"
                      style={{
                        backgroundColor: player.jerseyColors.primary,
                        borderColor: player.jerseyColors.secondary
                      }}
                    >
                      <span
                        className="text-2xl font-black font-mono-numbers"
                        style={{ color: player.jerseyColors.numberColor }}
                      >
                        {player.jerseyNumber}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: player.jerseyColors.numberColor }}
                      >
                        {player.country.slice(0, 3)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-sm font-bold text-white truncate">
                          {player.displayName}
                        </h4>
                        <span className="text-[10px] font-semibold text-emerald-400/90 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                          #{player.jerseyNumber}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-medium">
                        {player.nickname}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {player.role} · {player.iplTeam}
                      </div>

                      <div className="text-[11px] text-emerald-300/80 mt-1.5 pt-1.5 border-t border-slate-800/80">
                        ⭐ {player.iconicMoment}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Punch Dialogue & Riddle Solver */}
      {solverTab === 'dialogue' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Type punch words e.g. 'Thaggedhe le', 'commit aithe', 'Helicopter'..."
                value={dialogueQuery}
                onChange={(e) => setDialogueQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 min-h-[44px]"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              {dialogueQuery && (
                <button
                  onClick={() => setDialogueQuery('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Riddle Tags */}
            <div className="flex flex-wrap gap-1.5">
              {['Thaggedhe le', 'Commit aithe', 'Naatu Naatu', '6 sixes', '264 runs', 'Kattappa'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setDialogueQuery(tag)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-purple-300 hover:border-purple-500/40 min-h-[32px] tap-bounce"
                  >
                    "{tag}"
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2 px-1">
              Riddle Search Results ({matchedRiddles.length}):
            </div>

            {matchedRiddles.length === 0 ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                {dialogueQuery
                  ? 'No movie punch or cricket moment found for this keyword. Try a different phrase.'
                  : 'Enter a Telugu movie dialogue phrase or cricket riddle above to find the answer instantly!'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {matchedRiddles.map((item, idx) => {
                  if (item.type === 'movie') {
                    const m = item.data as TollywoodMovie;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 shadow-md"
                      >
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clapperboard className="w-3.5 h-3.5" /> Tollywood Movie
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          {m.displayTitle} ({m.year})
                        </h4>
                        <p className="text-xs italic text-amber-200/90 my-1 font-medium">
                          "{m.iconicDialogue}"
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Cast: {m.hero}, {m.heroine} · Directed by {m.director}
                        </p>
                      </div>
                    );
                  } else {
                    const c = item.data as Cricketer;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 shadow-md"
                      >
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> Cricket Star · #{c.jerseyNumber}
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          {c.displayName} ({c.nickname})
                        </h4>
                        <p className="text-xs text-emerald-200/90 my-1 font-medium">
                          "{c.iconicMoment}"
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          Commentary: "{c.hintQuote}"
                        </p>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

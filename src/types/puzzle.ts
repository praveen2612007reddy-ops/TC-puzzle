export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TollywoodMovie {
  id: string;
  cleanAnswer: string; // Sanitized uppercase string used for guessing grid
  displayTitle: string; // Full English title
  teluguTitle: string; // Telugu font script title
  hero: string;
  heroine: string;
  supportingCast: string[];
  director: string;
  musicDirector: string;
  year: number;
  genre: string;
  iconicDialogue: string; // In Telugu transliteration / Telugu
  iconicDialogueEnglish: string; // English translation
  trivia: string;
  difficulty: Difficulty;
  themeColor: string;
}

export interface CricketJerseyColors {
  primary: string; // Hex for main body
  secondary: string; // Hex for collar / trims
  numberColor: string; // Hex for printed jersey number
  teamName: string;
}

export interface Cricketer {
  id: string;
  cleanAnswer: string; // Sanitized uppercase player surname or common name for grid
  fullName: string;
  displayName: string;
  nickname: string;
  jerseyNumber: number;
  country: string;
  iplTeam: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  jerseyColors: CricketJerseyColors;
  iconicMoment: string;
  hintQuote: string;
  difficulty: Difficulty;
}

export interface UserStats {
  coins: number;
  streak: number;
  lastPlayedDate: string;
  moviesSolved: string[];
  cricketersSolved: string[];
  blitzHighScore: number;
  totalHintsUsed: number;
  soundEnabled: boolean;
}

export type ActiveTab = 'tollywood' | 'cricket' | 'solver' | 'blitz' | 'stats';

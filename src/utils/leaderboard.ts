import { LeaderboardEntry } from '../types/engine';

const LEADERBOARD_KEY = 'engine_puzzle_car_leaderboard_v1';
const PLAYER_NAME_KEY = 'engine_puzzle_car_current_player_name';
const DIFFICULTY_KEY = 'engine_puzzle_car_current_difficulty';

const DEFAULT_RECORDS: LeaderboardEntry[] = [
  {
    id: 'rec_1',
    playerName: 'Carlos Sainz (Dakar Pro)',
    timeSeconds: 74.2,
    timeFormatted: '01:14.2',
    score: 12850,
    accuracyPercent: 100,
    grade: 'S+',
    rankTitle: '🏆 Ingeniero Jefe F1 / Dakar',
    date: '21/10/2026',
    difficulty: 'dakar',
  },
  {
    id: 'rec_2',
    playerName: 'Sébastien Loeb (WRC Legend)',
    timeSeconds: 88.5,
    timeFormatted: '01:28.5',
    score: 12200,
    accuracyPercent: 100,
    grade: 'S+',
    rankTitle: '🏆 Ingeniero Jefe F1 / Dakar',
    date: '21/10/2026',
    difficulty: 'dakar',
  },
  {
    id: 'rec_3',
    playerName: 'Mecánico Jefe RedBull F1',
    timeSeconds: 102.0,
    timeFormatted: '01:42.0',
    score: 11400,
    accuracyPercent: 96,
    grade: 'S+',
    rankTitle: '🏆 Ingeniero Jefe F1 / Dakar',
    date: '20/10/2026',
    difficulty: 'mecanico',
  },
];

export function getStoredPlayerName(): string {
  if (typeof window === 'undefined') return '';
  const name = localStorage.getItem(PLAYER_NAME_KEY);
  if (!name || !name.trim() || name === 'Mecánico Dakar' || name === 'Mecánica Dakar') {
    return '';
  }
  return name.trim();
}

export function saveStoredPlayerName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYER_NAME_KEY, name.trim());
}

export function getStoredDifficulty(): import('../types/engine').AssemblyDifficulty {
  if (typeof window === 'undefined') return 'mecanico';
  const diff = localStorage.getItem(DIFFICULTY_KEY);
  if (diff === 'aprendiz' || diff === 'mecanico' || diff === 'dakar') {
    return diff;
  }
  return 'mecanico';
}

export function saveStoredDifficulty(diff: import('../types/engine').AssemblyDifficulty): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DIFFICULTY_KEY, diff);
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_RECORDS;
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_RECORDS));
      return DEFAULT_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean up any old demo entries (rec_4, rec_5, rec_6) so only the 3 demo winners remain
      const sanitized = parsed.filter(
        (r) => r.id !== 'rec_4' && r.id !== 'rec_5' && r.id !== 'rec_6'
      );
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sanitized));
      }
      return sanitized.length > 0 ? sanitized : DEFAULT_RECORDS;
    }
    return DEFAULT_RECORDS;
  } catch {
    return DEFAULT_RECORDS;
  }
}

export function saveLeaderboardRecord(
  entryData: Omit<LeaderboardEntry, 'id'>
): { entry: LeaderboardEntry; rankPosition: number } {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entryData,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };

  // Combine and sort by total score descending, then by time ascending
  const updated = [...current, newEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });

  // Limit to top 25 records
  const trimmed = updated.slice(0, 25);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors
  }

  const rankPosition = trimmed.findIndex((r) => r.id === newEntry.id) + 1;
  return { entry: newEntry, rankPosition: rankPosition > 0 ? rankPosition : trimmed.length };
}

export function clearLeaderboardToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_RECORDS));
}

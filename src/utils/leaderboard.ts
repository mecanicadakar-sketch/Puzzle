import { LeaderboardEntry, AssemblyDifficulty } from '../types/engine';

const LEADERBOARD_KEY = 'engine_puzzle_car_leaderboard_v2';
const PLAYER_NAME_KEY = 'engine_puzzle_car_current_player_name';
const DIFFICULTY_KEY = 'engine_puzzle_car_current_difficulty';

export const DEFAULT_TOP_10_RECORDS: LeaderboardEntry[] = [
  {
    id: 'rec_sainz',
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
    id: 'rec_loeb',
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
    id: 'rec_redbull',
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
  {
    id: 'rec_al_attiyah',
    playerName: 'Nasser Al-Attiyah (Toyota Gazoo)',
    timeSeconds: 115.4,
    timeFormatted: '01:55.4',
    score: 10850,
    accuracyPercent: 95,
    grade: 'S+',
    rankTitle: '⭐ Mecánico Maestro de Competición',
    date: '19/10/2026',
    difficulty: 'dakar',
  },
  {
    id: 'rec_roma',
    playerName: 'Nani Roma (Ford M-Sport)',
    timeSeconds: 128.0,
    timeFormatted: '02:08.0',
    score: 9950,
    accuracyPercent: 92,
    grade: 'A',
    rankTitle: '⭐ Mecánico Oficial Especialista',
    date: '18/10/2026',
    difficulty: 'mecanico',
  },
  {
    id: 'rec_peterhansel',
    playerName: 'Stéphane Peterhansel (Audi Dakar)',
    timeSeconds: 135.2,
    timeFormatted: '02:15.2',
    score: 9400,
    accuracyPercent: 90,
    grade: 'A',
    rankTitle: '⭐ Mecánico Oficial Especialista',
    date: '17/10/2026',
    difficulty: 'mecanico',
  },
  {
    id: 'rec_ekstrom',
    playerName: 'Mattias Ekström (Dakar E-Tron)',
    timeSeconds: 142.0,
    timeFormatted: '02:22.0',
    score: 8900,
    accuracyPercent: 88,
    grade: 'B',
    rankTitle: '🔧 Mecánico de Pista Calificado',
    date: '16/10/2026',
    difficulty: 'aprendiz',
  },
  {
    id: 'rec_chicherit',
    playerName: 'Guerlain Chicherit (Prodrive)',
    timeSeconds: 154.5,
    timeFormatted: '02:34.5',
    score: 8350,
    accuracyPercent: 85,
    grade: 'B',
    rankTitle: '🔧 Mecánico de Pista Calificado',
    date: '15/10/2026',
    difficulty: 'aprendiz',
  },
  {
    id: 'rec_prokop',
    playerName: 'Martin Prokop (Benzina Orlen)',
    timeSeconds: 168.0,
    timeFormatted: '02:48.0',
    score: 7800,
    accuracyPercent: 82,
    grade: 'C',
    rankTitle: '🛠️ Asistente Técnico de Boxes',
    date: '14/10/2026',
    difficulty: 'aprendiz',
  },
  {
    id: 'rec_de_villiers',
    playerName: 'Giniel de Villiers (Hilux Dakar)',
    timeSeconds: 182.0,
    timeFormatted: '03:02.0',
    score: 7200,
    accuracyPercent: 80,
    grade: 'C',
    rankTitle: '🛠️ Asistente Técnico de Boxes',
    date: '13/10/2026',
    difficulty: 'aprendiz',
  },
];

export function getStoredPlayerName(): string {
  if (typeof window === 'undefined') return '';
  const name = localStorage.getItem(PLAYER_NAME_KEY);
  if (
    !name ||
    !name.trim() ||
    name === 'Mecánico Dakar' ||
    name === 'Mecánica Dakar' ||
    name === 'Jefe de Taller'
  ) {
    return '';
  }
  return name.trim();
}

export function saveStoredPlayerName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYER_NAME_KEY, name.trim());
}

export function getStoredDifficulty(): AssemblyDifficulty {
  if (typeof window === 'undefined') return 'mecanico';
  const diff = localStorage.getItem(DIFFICULTY_KEY);
  if (diff === 'aprendiz' || diff === 'mecanico' || diff === 'dakar') {
    return diff;
  }
  return 'mecanico';
}

export function saveStoredDifficulty(diff: AssemblyDifficulty): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DIFFICULTY_KEY, diff);
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_TOP_10_RECORDS;
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      // Check if old key had entries
      const oldRaw = localStorage.getItem('engine_puzzle_car_leaderboard_v1');
      if (oldRaw) {
        const parsedOld = JSON.parse(oldRaw);
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          const merged = [...parsedOld, ...DEFAULT_TOP_10_RECORDS]
            .sort((a, b) => b.score !== a.score ? b.score - a.score : a.timeSeconds - b.timeSeconds)
            .slice(0, 10);
          localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(merged));
          return merged;
        }
      }
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_TOP_10_RECORDS));
      return DEFAULT_TOP_10_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sort descending by score, then ascending by time, and return top 10
      const sorted = [...parsed]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeSeconds - b.timeSeconds;
        })
        .slice(0, 10);
      return sorted;
    }
    return DEFAULT_TOP_10_RECORDS;
  } catch {
    return DEFAULT_TOP_10_RECORDS;
  }
}

export function saveLeaderboardRecord(
  entryData: Omit<LeaderboardEntry, 'id'>,
  existingId?: string | null
): { entry: LeaderboardEntry; rankPosition: number; top10: LeaderboardEntry[] } {
  const current = getLeaderboard();
  const cleanPlayerName = entryData.playerName.trim() || 'Piloto Dakar';

  const newEntry: LeaderboardEntry = {
    ...entryData,
    playerName: cleanPlayerName,
    id: existingId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };

  // Filter out any prior entry with the same ID or same player name if new score is higher
  const filtered = current.filter((r) => {
    if (existingId && r.id === existingId) return false;
    if (r.playerName.toLowerCase() === cleanPlayerName.toLowerCase() && r.score <= newEntry.score) {
      return false;
    }
    return true;
  });

  // Combine and sort by total score descending, then by time ascending
  const updated = [...filtered, newEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });

  // Maintain up to Top 10 records
  const trimmedTop10 = updated.slice(0, 10);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmedTop10));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: trimmedTop10 }));
    }
  } catch {
    // Ignore storage quota errors
  }

  const rankPosition = trimmedTop10.findIndex((r) => r.id === newEntry.id) + 1;
  return {
    entry: newEntry,
    rankPosition: rankPosition > 0 ? rankPosition : 10,
    top10: trimmedTop10,
  };
}

export function updatePlayerNameInLeaderboard(recordId: string, newName: string): LeaderboardEntry[] {
  if (typeof window === 'undefined' || !recordId || !newName.trim()) return getLeaderboard();
  try {
    const list = getLeaderboard();
    const updated = list.map((r) => (r.id === recordId ? { ...r, playerName: newName.trim() } : r));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: updated }));
    return updated;
  } catch {
    return getLeaderboard();
  }
}

export function clearLeaderboardToDefault(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_TOP_10_RECORDS;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_TOP_10_RECORDS));
  window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: DEFAULT_TOP_10_RECORDS }));
  return DEFAULT_TOP_10_RECORDS;
}

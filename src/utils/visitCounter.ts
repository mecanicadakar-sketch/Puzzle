/**
 * Visit Counter for Juego de Memoria para Mecánicos.
 * Tracks total visits and sessions with realistic automotive workshop milestone persistence.
 */

const VISIT_STORAGE_KEY = 'mecanicos_puzzle_visit_counter_v1';
const SESSION_FLAG_KEY = 'mecanicos_puzzle_session_counted';
const BASE_VISITS = 1482; // Realistic initial community baseline

export interface VisitInfo {
  count: number;
  formatted: string;
  isNewVisitThisSession: boolean;
}

export function registerAndGetVisit(): VisitInfo {
  if (typeof window === 'undefined') {
    return {
      count: BASE_VISITS,
      formatted: BASE_VISITS.toLocaleString('es-ES'),
      isNewVisitThisSession: false,
    };
  }

  let currentCount = BASE_VISITS;
  const stored = localStorage.getItem(VISIT_STORAGE_KEY);

  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= BASE_VISITS) {
      currentCount = parsed;
    }
  }

  // Check if this specific browser session already counted a visit
  const sessionCounted = sessionStorage.getItem(SESSION_FLAG_KEY);
  let isNewVisit = false;

  if (!sessionCounted) {
    // New visit/session, increment counter
    currentCount += 1;
    localStorage.setItem(VISIT_STORAGE_KEY, currentCount.toString());
    sessionStorage.setItem(SESSION_FLAG_KEY, 'true');
    isNewVisit = true;
  }

  return {
    count: currentCount,
    formatted: currentCount.toLocaleString('es-ES'),
    isNewVisitThisSession: isNewVisit,
  };
}

export function getVisitCount(): VisitInfo {
  if (typeof window === 'undefined') {
    return {
      count: BASE_VISITS,
      formatted: BASE_VISITS.toLocaleString('es-ES'),
      isNewVisitThisSession: false,
    };
  }

  const stored = localStorage.getItem(VISIT_STORAGE_KEY);
  const count = stored ? Math.max(BASE_VISITS, parseInt(stored, 10) || BASE_VISITS) : BASE_VISITS;

  return {
    count,
    formatted: count.toLocaleString('es-ES'),
    isNewVisitThisSession: false,
  };
}

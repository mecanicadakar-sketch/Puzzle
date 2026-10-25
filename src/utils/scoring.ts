import { AssemblyStats, FinalScoreBreakdown, EnginePartId, PartTorquesMap, AssemblyDifficulty } from '../types/engine';
import { ENGINE_PARTS } from '../data/engineParts';

/**
 * Formats seconds into MM:SS.d
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  const paddedMins = mins.toString().padStart(2, '0');
  const paddedSecs = secs.toString().padStart(2, '0');
  return `${paddedMins}:${paddedSecs}.${tenths}`;
}

export function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates detailed score breakdown based on speed, precision, torque, timing, and errors
 */
export function calculateFinalScore(
  stats: AssemblyStats,
  installedPartIds: EnginePartId[],
  partTorques: PartTorquesMap,
  timingOffsetTeeth: number,
  oilLevel: number,
  coolantLiters: number = 5.0,
  difficulty: AssemblyDifficulty = 'mecanico'
): FinalScoreBreakdown {
  // 1. Base assembly points (500 pts per part, 15 parts = 7500 pts max)
  const assemblyPoints = installedPartIds.length * 500;

  // 2. Torque bonus: 250 pts each for meeting torque specs within tolerance
  const torqueTolerance = difficulty === 'aprendiz' ? 10 : 3;
  let torqueBonus = 0;
  ENGINE_PARTS.forEach((part) => {
    if (part.torqueRequiredNm && installedPartIds.includes(part.id)) {
      const applied = partTorques[part.id] || 0;
      if (Math.abs(applied - part.torqueRequiredNm) <= torqueTolerance) {
        torqueBonus += 250;
      }
    }
  });

  // 3. Timing bonus: 500 pts if exactly 0 teeth offset
  const timingBonus =
    installedPartIds.includes('timing_belt') && timingOffsetTeeth === 0 ? 500 : 0;

  // 4. Lubrication bonus: 500 pts if in ideal range (70% - 85%)
  const oilBonus =
    installedPartIds.includes('oil_fluid') && oilLevel >= 70 && oilLevel <= 85
      ? 500
      : 0;

  // 5. Coolant bonus: 500 pts if 5.0 L filled (4.5 L to 5.0 L)
  const coolantBonus =
    installedPartIds.includes('coolant_fluid') && coolantLiters >= 4.5 && coolantLiters <= 5.0
      ? 500
      : 0;

  // 6. Speed bonus: max 3000 pts for sub-90 seconds, decays to 500 pts at 300 seconds (5 min)
  const timeSecs = Math.max(1, stats.elapsedSeconds);
  let speedBonus = 0;
  if (timeSecs <= 90) {
    speedBonus = 3000;
  } else if (timeSecs <= 300) {
    // Linear interpolation from 3000 down to 500
    const ratio = (300 - timeSecs) / (300 - 90);
    speedBonus = Math.round(500 + ratio * 2500);
  } else {
    speedBonus = Math.max(100, Math.round(500 - (timeSecs - 300) * 2));
  }

  // 7. Error penalties adjusted by difficulty:
  const penaltyPerFailedAttempt = difficulty === 'dakar' ? 250 : difficulty === 'aprendiz' ? 60 : 150;
  const penaltyPerDismount = difficulty === 'dakar' ? 150 : difficulty === 'aprendiz' ? 50 : 100;
  const penaltyPerFailedStart = difficulty === 'dakar' ? 400 : 300;

  const errorPenalties =
    stats.failedAttempts * penaltyPerFailedAttempt +
    stats.dismountCount * penaltyPerDismount +
    stats.failedStartAttempts * penaltyPerFailedStart;

  // 8. Precision Bonus: extra bonus if zero errors!
  let precisionBonus = 0;
  if (stats.failedAttempts === 0 && stats.dismountCount === 0 && stats.failedStartAttempts === 0) {
    precisionBonus = difficulty === 'dakar' ? 2000 : 1500;
  } else if (stats.failedAttempts <= 1 && stats.failedStartAttempts === 0) {
    precisionBonus = 750;
  }

  // Total Score (never below 0) with Dakar multiplier
  const rawScore = Math.max(
    0,
    assemblyPoints + torqueBonus + timingBonus + oilBonus + coolantBonus + speedBonus + precisionBonus - errorPenalties
  );

  const totalScore = difficulty === 'dakar' ? Math.round(rawScore * 1.3) : rawScore;

  // Accuracy percentage
  const totalActionAttempts =
    stats.correctPlacements + stats.failedAttempts + stats.dismountCount;
  const accuracyPercent =
    totalActionAttempts > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round((stats.correctPlacements / totalActionAttempts) * 100)
          )
        )
      : 100;

  // Rank determination
  let rankGrade: 'S+' | 'A' | 'B' | 'C' | 'D' = 'D';
  let rankTitle = 'Aprendiz de Taller';
  let badgeColor = '#94a3b8';

  if (totalScore >= 12000 && accuracyPercent >= 90) {
    rankGrade = 'S+';
    rankTitle = '🏆 Ingeniero Jefe de Motores (F1 / Dakar)';
    badgeColor = '#fbbf24'; // Gold
  } else if (totalScore >= 10000 && accuracyPercent >= 80) {
    rankGrade = 'A';
    rankTitle = '🥇 Maestro Mecánico Especialista';
    badgeColor = '#38bdf8'; // Cyan
  } else if (totalScore >= 8000) {
    rankGrade = 'B';
    rankTitle = '🥈 Técnico de Taller Oficial';
    badgeColor = '#34d399'; // Emerald
  } else if (totalScore >= 6000) {
    rankGrade = 'C';
    rankTitle = '🥉 Mecánico Cualificado';
    badgeColor = '#fb923c'; // Amber
  } else {
    rankGrade = 'D';
    rankTitle = '🔧 Aprendiz de Taller';
    badgeColor = '#a8a29e'; // Gray
  }

  return {
    assemblyPoints,
    speedBonus,
    precisionBonus,
    torqueBonus,
    timingBonus,
    oilBonus,
    coolantBonus,
    errorPenalties,
    totalScore,
    accuracyPercent,
    elapsedTimeFormatted: formatTime(stats.elapsedSeconds),
    rankTitle,
    rankGrade,
    badgeColor,
  };
}

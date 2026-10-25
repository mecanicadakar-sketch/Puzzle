import React, { useState } from 'react';
import { FinalScoreBreakdown, LeaderboardEntry, AssemblyDifficulty } from '../types/engine';
import { saveLeaderboardRecord } from '../utils/leaderboard';
import {
  Trophy,
  Clock,
  Target,
  Wrench,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Flame,
  Award,
  User,
  ListOrdered,
  Save,
} from 'lucide-react';

interface ScorecardModalProps {
  scorecard: FinalScoreBreakdown;
  playerName: string;
  difficulty?: AssemblyDifficulty;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
  onResetGame: () => void;
  onOpenLeaderboard: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  scorecard,
  playerName,
  difficulty = 'mecanico',
  onUpdatePlayerName,
  onClose,
  onResetGame,
  onOpenLeaderboard,
}) => {
  const [inputName, setInputName] = useState<string>(playerName);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);

  const handleSaveToLeaderboard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = inputName.trim() || 'Jefe de Taller';
    onUpdatePlayerName(finalName);

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()}`;

    const { rankPosition } = saveLeaderboardRecord({
      playerName: finalName,
      timeSeconds: Number((scorecard.speedBonus > 0 ? (300 - (scorecard.speedBonus - 500) / 2500 * 210) : 180).toFixed(1)),
      timeFormatted: scorecard.elapsedTimeFormatted,
      score: scorecard.totalScore,
      accuracyPercent: scorecard.accuracyPercent,
      grade: scorecard.rankGrade,
      rankTitle: scorecard.rankTitle,
      date: dateStr,
      difficulty,
    });

    setSavedRank(rankPosition);
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#141a24] border-2 border-[#38465c] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-auto flex flex-col max-h-[94vh]">
        {/* Header Banner with Engine Puzzle Car branding */}
        <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 px-4 sm:px-6 py-3 sm:py-4 text-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Engine Puzzle Car Official Logo Asset */}
            <img
              src="/assets/aistudio/Engine-Puzzle-Car_183fdf67.jpg"
              alt="Engine Puzzle Car: The Ultimate Assembly Challenge"
              className="h-16 sm:h-24 w-auto object-contain rounded-2xl shadow-2xl border-2 border-white/40 mb-2 p-1 bg-black/40 hover:scale-105 transition-transform"
            />
            <h2 className="font-racing font-extrabold text-lg sm:text-xl text-white tracking-wider uppercase drop-shadow-md">
              ¡Motor Armado y Puesto en Marcha!
            </h2>
            <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
              Evaluación Técnica Oficial del Banco de Pruebas
            </p>
          </div>
        </div>

        {/* Main Scorecard Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Participant Name Input / Registration */}
          <div className="bg-[#0b0f17] border border-[#232f42] rounded-2xl p-3 sm:p-4">
            <form onSubmit={handleSaveToLeaderboard} className="space-y-2">
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="font-racing font-bold text-gray-300 flex items-center gap-1.5 uppercase text-[11px] sm:text-xs">
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Nombre del Participante:
                </span>
                {isSaved && savedRank && (
                  <span className="text-[10px] sm:text-[11px] font-mono-tech text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                    ¡Puesto #{savedRank} en el Ranking!
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Tu nombre o apodo mecánico..."
                  className="flex-1 bg-[#141a24] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-racing tracking-wide focus:outline-none focus:border-amber-500 min-h-[44px]"
                  maxLength={30}
                />
                <button
                  type="submit"
                  className={`px-4 py-2.5 min-h-[44px] font-racing font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  {isSaved ? 'Guardado' : 'Guardar Récord'}
                </button>
              </div>
            </form>
          </div>

          {/* Hero Score & Rank Display */}
          <div className="bg-[#0b0f17] border border-[#2d3748] rounded-2xl p-3.5 sm:p-4 text-center relative overflow-hidden">
            <div className="text-[11px] sm:text-xs font-mono-tech text-gray-400 uppercase tracking-widest mb-1">
              Puntuación Final Total
            </div>

            <div className="text-4xl sm:text-5xl font-racing font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400 my-1 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              {scorecard.totalScore.toLocaleString()}{' '}
              <span className="text-lg sm:text-xl font-sans text-amber-400">PTS</span>
            </div>

            {/* Rank badge */}
            <div className="inline-flex items-center gap-2 mt-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#1b2537] border border-[#3b4b66] shadow-md flex-wrap justify-center">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-racing font-bold text-xs sm:text-sm text-white tracking-wide">
                {scorecard.rankTitle}
              </span>
              <span
                className="font-mono-tech font-extrabold text-[11px] sm:text-xs px-2 py-0.5 rounded-md text-black"
                style={{ backgroundColor: scorecard.badgeColor }}
              >
                Grado {scorecard.rankGrade}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid: Time & Accuracy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            {/* Elapsed Time */}
            <div className="bg-[#0d121c] border border-[#232f42] rounded-2xl p-3 sm:p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono-tech text-gray-400 uppercase block">
                  Tiempo Empleado
                </span>
                <span className="text-lg sm:text-xl font-racing font-bold text-white tracking-wider">
                  {scorecard.elapsedTimeFormatted}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono-tech block">
                  +{scorecard.speedBonus} pts velocidad
                </span>
              </div>
            </div>

            {/* Precision & Accuracy */}
            <div className="bg-[#0d121c] border border-[#232f42] rounded-2xl p-3 sm:p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono-tech text-gray-400 uppercase block">
                  Precisión Mecánica
                </span>
                <span className="text-lg sm:text-xl font-racing font-bold text-emerald-400 tracking-wider">
                  {scorecard.accuracyPercent}%
                </span>
                <span className="text-[10px] text-gray-400 font-mono-tech block">
                  {scorecard.errorPenalties > 0
                    ? `-${scorecard.errorPenalties} pts penalización`
                    : '¡Sin piezas incorrectas!'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Points Breakdown */}
          <div className="bg-[#0d121c] border border-[#232f42] rounded-2xl p-3 sm:p-3.5 space-y-2">
            <div className="text-xs font-racing font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Desglose Técnico de Puntos
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Montaje de 15 Componentes
                </span>
                <span className="font-mono-tech font-bold text-white">
                  +{scorecard.assemblyPoints}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Precisión Torquímetro (Nm)
                </span>
                <span className="font-mono-tech font-bold text-emerald-400">
                  +{scorecard.torqueBonus}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Calado Distribución (0° PMS)
                </span>
                <span className="font-mono-tech font-bold text-cyan-400">
                  +{scorecard.timingBonus}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  Nivel de Aceite Sintético
                </span>
                <span className="font-mono-tech font-bold text-amber-400">
                  +{scorecard.oilBonus}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                  Refrigerante Orgánico (5.0 L)
                </span>
                <span className="font-mono-tech font-bold text-teal-400">
                  +{scorecard.coolantBonus || 0}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Bonificación por Velocidad
                </span>
                <span className="font-mono-tech font-bold text-blue-400">
                  +{scorecard.speedBonus}
                </span>
              </div>

              {scorecard.precisionBonus > 0 && (
                <div className="flex justify-between items-center text-gray-300 py-0.5 border-b border-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    Bonificación Hoja Limpia (0 Fallos)
                  </span>
                  <span className="font-mono-tech font-bold text-emerald-300">
                    +{scorecard.precisionBonus}
                  </span>
                </div>
              )}

              {scorecard.errorPenalties > 0 && (
                <div className="flex justify-between items-center text-red-400 py-0.5">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Penalizaciones (Fallos)
                  </span>
                  <span className="font-mono-tech font-bold">
                    -{scorecard.errorPenalties}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="min-h-[46px] py-3 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-racing font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              <Flame className="w-4 h-4 shrink-0" />
              Probar en Dyno
            </button>

            <button
              onClick={() => {
                if (!isSaved) handleSaveToLeaderboard();
                onOpenLeaderboard();
              }}
              className="min-h-[46px] py-3 px-3 bg-blue-600 hover:bg-blue-500 text-white font-racing font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              <ListOrdered className="w-4 h-4 shrink-0" />
              Ver Clasificación
            </button>

            <button
              onClick={onResetGame}
              className="min-h-[46px] py-3 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-racing font-bold text-xs rounded-xl border border-gray-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              Nuevo Récord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

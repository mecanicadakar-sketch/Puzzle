import React from 'react';
import {
  Wrench,
  Gauge,
  BookOpen,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  User,
  ListOrdered,
  Eye,
  Award,
} from 'lucide-react';
import { WorkshopMode, AssemblyDifficulty } from '../types/engine';
import { formatTime } from '../utils/scoring';

interface NavbarProps {
  currentMode: WorkshopMode;
  onSelectMode: (mode: WorkshopMode) => void;
  installedCount: number;
  totalPartsCount: number;
  onOpenManual: () => void;
  onResetEngine: () => void;
  onQuickAssemble: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  currentScore: number;
  accuracyPercent: number;
  hasCompletedStart: boolean;
  onOpenScorecard: () => void;
  playerName: string;
  difficulty: AssemblyDifficulty;
  onOpenLeaderboard: () => void;
  onEditPlayerName: () => void;
  onOpenAccessModal: () => void;
  visitCountFormatted?: string;
  unlockedAchievementsCount?: number;
  onOpenAchievements?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  installedCount,
  totalPartsCount,
  onOpenManual,
  onResetEngine,
  onQuickAssemble,
  isMuted,
  onToggleSound,
  elapsedSeconds,
  isTimerRunning,
  currentScore,
  accuracyPercent,
  hasCompletedStart,
  onOpenScorecard,
  playerName,
  difficulty,
  onOpenLeaderboard,
  onEditPlayerName,
  onOpenAccessModal,
  visitCountFormatted,
  unlockedAchievementsCount,
  onOpenAchievements,
}) => {
  const percent = Math.round((installedCount / totalPartsCount) * 100);
  const isComplete = installedCount === totalPartsCount;

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'dakar':
        return {
          label: 'Jefe de Taller',
          color: 'bg-red-500/20 text-red-300 border-red-500/40 hover:border-red-400',
        };
      case 'aprendiz':
        return {
          label: 'Aprendiz',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400',
        };
      default:
        return {
          label: 'Mecánico Pro',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:border-amber-400',
        };
    }
  };

  const diffBadge = getDifficultyBadge();

  return (
    <header className="bg-[#0b0f17]/85 border-b border-[#212936] px-3 sm:px-4 lg:px-6 py-2.5 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Row: Brand & Quick Action Utilities */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand with Engine Puzzle Car Logo */}
          <div
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
            onClick={onOpenAccessModal}
            title="Abrir Ficha de Ingreso y Dificultad"
          >
            <img
              src="/assets/aistudio/Engine-Puzzle-Car_183fdf67.jpg"
              alt="Engine Puzzle Car Logo"
              className="h-14 sm:h-16 md:h-20 w-auto rounded-2xl shadow-xl border-2 border-amber-500/40 bg-black/40 p-0.5 object-contain group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-racing font-extrabold text-base sm:text-lg lg:text-xl text-white tracking-wider flex items-center gap-1 leading-tight">
                  <span className="text-amber-400">JUEGO DE MEMORIA</span>
                  <span className="text-cyan-400">PARA MECÁNICOS</span>
                </h1>
                <span className="text-[10px] sm:text-xs font-mono-tech px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase hidden xs:inline font-bold">
                  2.0L Turbo
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-300 font-mono-tech tracking-wide truncate font-bold">
                BANCO ALEATORIO EN CADA PARTIDA
              </p>
            </div>
          </div>

          {/* Quick Actions (Visits, Records, Manual, Auto, Reset, Sound) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Numerador de Visitas Odometer */}
            {visitCountFormatted && (
              <div
                className="h-9 sm:h-10 px-2 sm:px-3 bg-[#090d14] border border-amber-500/30 rounded-xl flex items-center gap-1.5 text-xs font-mono-tech text-amber-300 shadow-inner shrink-0"
                title="Contador / Numerador de Visitas del Taller Mecánico"
              >
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden md:inline uppercase text-[10px] text-gray-400 font-bold">Visitas:</span>
                <span className="font-extrabold text-amber-300 tracking-wider bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                  {visitCountFormatted}
                </span>
              </div>
            )}

            {/* Leaderboard / Récords Button */}
            <button
              onClick={onOpenLeaderboard}
              className="h-9 sm:h-10 px-2.5 sm:px-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-racing font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
              title="Ver Tabla de Récords"
            >
              <Trophy className="w-4 h-4 text-black shrink-0" />
              <span className="hidden sm:inline">Récords</span>
            </button>

            {/* Achievements Button */}
            {onOpenAchievements && (
              <button
                onClick={onOpenAchievements}
                className="h-9 px-2 sm:px-2.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-racing font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                title="Ver Logros y Trofeos Desbloqueados"
              >
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Logros</span>
                <span className="bg-amber-400 text-black text-[9px] font-mono-tech font-extrabold px-1 rounded-full">
                  {unlockedAchievementsCount || 0}/7
                </span>
              </button>
            )}

            {/* Quick manual modal trigger */}
            <button
              onClick={onOpenManual}
              className="h-9 w-9 sm:w-auto sm:px-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-all shrink-0"
              title="Manual Técnico de Taller"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline text-xs">Manual</span>
            </button>

            {/* Quick Auto-Assemble */}
            <button
              onClick={onQuickAssemble}
              className="h-9 w-9 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 text-xs font-medium flex items-center justify-center cursor-pointer transition-all shrink-0"
              title="Armar motor completo automáticamente"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Reset Engine */}
            <button
              onClick={onResetEngine}
              className="h-9 w-9 bg-gray-800/80 hover:bg-red-950/40 text-gray-400 hover:text-red-300 rounded-xl border border-gray-700 hover:border-red-500/40 flex items-center justify-center cursor-pointer transition-all shrink-0"
              title="Reiniciar armado y banco"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                isMuted
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white'
              }`}
              title={isMuted ? 'Activar Sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Second Row: Live Telemetry HUD Bar + Mode Switchers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Mode Switchers: Taller & Banco Dyno */}
          <div className="flex items-center gap-1.5 bg-[#121926] p-1 rounded-2xl border border-gray-800 shrink-0">
            <button
              onClick={() => onSelectMode('assembly')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs sm:text-sm font-racing font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                currentMode === 'assembly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Taller ({installedCount}/{totalPartsCount})</span>
            </button>

            <button
              onClick={() => onSelectMode('dyno')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs sm:text-sm font-racing font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                currentMode === 'dyno'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Banco Dyno</span>
              {isComplete && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </div>

          {/* Telemetry HUD: Player, Time, Score, Precision */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#121926] px-3 py-2 rounded-2xl border border-gray-800 shadow-inner overflow-x-auto scrollbar-none justify-between sm:justify-end text-xs sm:text-sm">
            {/* Participant & Difficulty */}
            <button
              onClick={onOpenAccessModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 font-racing text-amber-300 cursor-pointer transition-colors shrink-0 text-xs sm:text-sm"
              title="Cambiar piloto y dificultad"
            >
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[95px] font-bold">{playerName}</span>
              <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border font-mono-tech ${diffBadge.color}`}>
                {diffBadge.label}
              </span>
            </button>

            {/* Stopwatch */}
            <div className="flex items-center gap-1.5 border-l border-gray-700/80 pl-2.5 shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isTimerRunning
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                    : elapsedSeconds > 0
                    ? 'bg-amber-400'
                    : 'bg-gray-600'
                }`}
              />
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-mono-tech font-bold text-xs sm:text-base text-white tracking-wider">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Current Score */}
            <div className="flex items-center gap-1.5 border-l border-gray-700/80 pl-2.5 shrink-0">
              <span className="text-xs font-mono-tech text-gray-400 uppercase hidden md:inline font-bold">
                Pts:
              </span>
              <span className="font-racing font-bold text-xs sm:text-base text-amber-400 tracking-wide">
                {currentScore.toLocaleString()}
              </span>
            </div>

            {/* Precision % */}
            <div className="flex items-center gap-1.5 border-l border-gray-700/80 pl-2.5 shrink-0">
              <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono-tech font-bold text-xs sm:text-sm text-emerald-300">
                {accuracyPercent}%
              </span>
            </div>

            {/* Trophy button if completed */}
            {hasCompletedStart && (
              <button
                onClick={onOpenScorecard}
                className="ml-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-racing font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-pulse shrink-0"
                title="Ver Puntuación Final"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Puntuación</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

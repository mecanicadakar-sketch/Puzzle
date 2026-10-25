import React from 'react';
import { Trophy, CheckCircle, Lock, Award, Flame, Zap, Sparkles } from 'lucide-react';

export interface ArcadeAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

export const ARCADE_ACHIEVEMENTS: ArcadeAchievement[] = [
  {
    id: 'first_part',
    title: 'Despegue en Boxes',
    description: 'Monta tu primer componente mecánico correctamente en el bloque.',
    icon: '🚀',
    points: 150,
  },
  {
    id: 'combo_3',
    title: 'Racha Imparable',
    description: 'Alcanza una racha de 3 o más componentes seguidos sin cometer fallos.',
    icon: '🔥',
    points: 500,
  },
  {
    id: 'perfect_torque',
    title: 'Apriete Milimétrico',
    description: 'Aplica el torque exacto (Nm) con la llave dinamométrica según el manual.',
    icon: '🎯',
    points: 400,
  },
  {
    id: 'perfect_timing',
    title: 'Sincronía 0° PMS',
    description: 'Cala la distribución y árboles de levas exactamente a 0° Punto Muerto Superior.',
    icon: '⏱️',
    points: 600,
  },
  {
    id: 'oil_coolant',
    title: 'Sangre de Competición',
    description: 'Carga el cárter (4.5 L de aceite sintético) y los 5.0 L de refrigerante OAT.',
    icon: '🛢️',
    points: 350,
  },
  {
    id: 'all_parts',
    title: 'Rompecabezas Completo',
    description: 'Encuentra y ensambla las 15 piezas desparramadas en el banco de trabajo.',
    icon: '🧩',
    points: 1000,
  },
  {
    id: 'dyno_started',
    title: 'Rugido Dakar Turbo',
    description: 'Supera el chequeo del Dyno y pon en marcha el motor 2.0L a 7.200 RPM.',
    icon: '🏎️',
    points: 1500,
  },
];

interface AchievementsModalProps {
  unlockedIds: string[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  unlockedIds,
  onClose,
}) => {
  const totalEarnedPoints = ARCADE_ACHIEVEMENTS.filter((a) =>
    unlockedIds.includes(a.id)
  ).reduce((acc, curr) => acc + curr.points, 0);

  const completionPercent = Math.round(
    (unlockedIds.length / ARCADE_ACHIEVEMENTS.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#121824] border-2 border-[#2b3a50] rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/40 flex items-center justify-center text-2xl shadow-md">
              🏆
            </div>
            <div>
              <h3 className="font-racing font-extrabold text-base sm:text-lg text-white tracking-wider uppercase">
                Logros & Trofeos Mecánicos
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
                Desafíos arcade de habilidad, velocidad y precisión
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-200 text-xl font-bold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Progress Strip */}
        <div className="bg-[#0b101a] px-4 sm:px-6 py-3 border-b border-[#232f42] flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono-tech text-gray-400 block">
              Progreso de Desafíos:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-racing font-bold text-sm text-white">
                {unlockedIds.length} / {ARCADE_ACHIEVEMENTS.length} Desbloqueados
              </span>
              <span className="text-xs font-mono-tech text-amber-400 font-bold bg-amber-500/20 px-2 py-0.2 rounded-full border border-amber-500/30">
                +{totalEarnedPoints} PTS
              </span>
            </div>
          </div>

          <div className="w-28 sm:w-36 bg-gray-800 h-2.5 rounded-full overflow-hidden border border-gray-700">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Achievements List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {ARCADE_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-[#172233] to-[#111724] border-amber-500/40 text-white shadow-md'
                    : 'bg-[#090d14]/70 border-gray-800 text-gray-500 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    isUnlocked
                      ? 'bg-amber-500/20 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-gray-800/60 border-gray-700 grayscale'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h4
                      className={`font-racing font-bold text-xs sm:text-sm tracking-wide ${
                        isUnlocked ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {ach.title}
                    </h4>
                    <span
                      className={`font-mono-tech text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      +{ach.points} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-2">
                    {ach.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {isUnlocked ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#0b101a] px-4 sm:px-6 py-3 border-t border-[#232f42] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] py-2.5 px-6 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-racing font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center"
          >
            Continuar Desafío
          </button>
        </div>
      </div>
    </div>
  );
};

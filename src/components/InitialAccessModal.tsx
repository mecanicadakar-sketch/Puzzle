import React, { useState } from 'react';
import { AssemblyDifficulty } from '../types/engine';
import { soundEngine } from '../services/soundEngine';
import {
  Wrench,
  User,
  Gauge,
  Trophy,
  CheckCircle2,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Play,
  Eye,
} from 'lucide-react';

interface InitialAccessModalProps {
  currentName: string;
  currentDifficulty: AssemblyDifficulty;
  onConfirm: (name: string, difficulty: AssemblyDifficulty) => void;
  onClose?: () => void;
  onOpenLeaderboard: () => void;
  isFirstVisit?: boolean;
  visitCountFormatted?: string;
}

export const InitialAccessModal: React.FC<InitialAccessModalProps> = ({
  currentName,
  currentDifficulty,
  onConfirm,
  onOpenLeaderboard,
  visitCountFormatted,
}) => {
  const [name, setName] = useState<string>(() => {
    if (
      currentName &&
      currentName !== 'Mecánico Dakar' &&
      currentName !== 'Mecánica Dakar' &&
      currentName !== 'Jefe de Taller'
    ) {
      return currentName;
    }
    return '';
  });
  const [difficulty, setDifficulty] = useState<AssemblyDifficulty>(currentDifficulty || 'mecanico');
  const [nameError, setNameError] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);

  React.useEffect(() => {
    if (
      currentName &&
      currentName !== 'Mecánico Dakar' &&
      currentName !== 'Mecánica Dakar' &&
      currentName !== 'Jefe de Taller'
    ) {
      setName(currentName);
    }
  }, [currentName]);

  React.useEffect(() => {
    if (currentDifficulty) {
      setDifficulty(currentDifficulty);
    }
  }, [currentDifficulty]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim().length > 0) {
      setNameError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setNameError('⚠️ Escribe tu nombre o apodo para ingresar al taller.');
      soundEngine.playToolSound('wrench');
      return;
    }

    if (cleanName.length < 2) {
      setNameError('⚠️ El nombre debe tener al menos 2 caracteres.');
      soundEngine.playToolSound('wrench');
      return;
    }

    setNameError('');
    soundEngine.playToolSound('ratchet');
    setTimeout(() => {
      soundEngine.playToolSound('place');
    }, 150);
    onConfirm(cleanName, difficulty);
  };

  const difficultyOptions: {
    id: AssemblyDifficulty;
    title: string;
    subtitle: string;
    tag: string;
    tagColor: string;
    borderColor: string;
    bgGradient: string;
    icon: React.ReactNode;
    features: string[];
  }[] = [
    {
      id: 'aprendiz',
      title: 'Aprendiz de Taller',
      subtitle: 'Taller Escuela & Iniciación',
      tag: 'Fácil',
      tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      borderColor: 'border-emerald-500/50 hover:border-emerald-400',
      bgGradient: 'from-emerald-950/40 to-slate-900/60',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      features: [
        'Botones "Montar" en azul que indican qué pieza sigue',
        'Indicador luminoso de componente listo para montaje',
        'Tolerancia de apriete flexible (±10 Nm)',
        'Penalización leve por error (-50 pts)',
      ],
    },
    {
      id: 'mecanico',
      title: 'Mecánico Oficial',
      subtitle: 'Desafío Rompecabezas Real',
      tag: 'Recomendado',
      tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      borderColor: 'border-amber-500/60 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      bgGradient: 'from-amber-950/40 to-slate-900/60',
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
      features: [
        'Sin botones en azul: deduce cada paso con tu memoria',
        'Todas las 15 piezas desparramadas en el banco',
        'Levas y distribución fuera de punto (+36° / 2 dientes)',
        'Puntuación estándar de taller oficial',
      ],
    },
    {
      id: 'dakar',
      title: 'Jefe de Taller',
      subtitle: 'Competición Extrema & F1',
      tag: 'Extremo (x1.3 Pts)',
      tagColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      borderColor: 'border-red-500/60 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
      bgGradient: 'from-red-950/40 to-slate-900/60',
      icon: <Flame className="w-5 h-5 text-red-400 animate-pulse" />,
      features: [
        'Piezas 100% desordenadas y aleatorias en cada partida',
        'Máxima exigencia de memoria mecánica sin orden estructurado',
        'Deducción técnica pura por ciclo motor Otto 4T',
        'Penalización doble (-250 pts) y multiplicador x1.3 para ranking',
      ],
    },
  ];

  const isFormValid = name.trim().length >= 2 && Boolean(difficulty);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#101622] border-2 border-amber-500/60 rounded-3xl w-full max-w-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
        {/* Top Header - Dakar Workshop Livery */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-4 sm:px-6 py-4 sm:py-5 border-b border-[#2d3a4e] relative overflow-hidden shrink-0">
          <img
            src="/assets/aistudio/fondo-mecanica_d81652bf.jpg"
            alt="Fondo Motor Mecánica Lamborghini"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
          
          {/* Racing Hazard Stripe Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{
              background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 12px, #000 12px, #000 24px)',
            }}
          />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              {!imageError ? (
                <img
                  src="/assets/aistudio/Engine-Puzzle-Car_183fdf67.jpg"
                  alt="Engine Puzzle Car Logo"
                  onError={() => setImageError(true)}
                  className="h-16 sm:h-20 md:h-24 w-auto rounded-2xl shadow-2xl border-2 border-amber-500/50 bg-black/40 p-1 object-contain hover:scale-105 transition-transform shrink-0"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-black font-black shadow-lg shrink-0">
                  <Wrench className="w-8 h-8 text-black" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-mono-tech px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-amber-400" />
                    Ficha de Ingreso
                  </span>
                  {visitCountFormatted && (
                    <span className="text-[10px] sm:text-xs font-mono-tech px-2 py-0.5 rounded bg-[#090d14] text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Visitas: {visitCountFormatted}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs font-mono-tech text-gray-300 hidden xs:inline">
                    2.0L Turbo
                  </span>
                </div>
                <h2 className="font-racing font-extrabold text-base sm:text-xl lg:text-2xl text-white tracking-wider uppercase mt-1 truncate">
                  Juego de Memoria para Mecánicos
                </h2>
                <p className="text-xs sm:text-sm text-amber-300 font-mono-tech font-bold truncate">
                  Configura tu ficha para ingresar al taller
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Step 1: Participant Name */}
          <div className="space-y-2.5">
            <label className="flex items-center justify-between text-sm sm:text-base font-racing font-bold uppercase tracking-wider text-gray-200">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                1. Nombre del Piloto / Mecánico:
              </span>
              <span className="text-xs font-mono-tech text-gray-400 lowercase font-normal">
                (para ranking y tiempos)
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ingrese su Nombre Aquí"
                maxLength={26}
                autoFocus
                className={`w-full px-4 py-3 bg-[#090d14] border rounded-xl text-white font-racing tracking-wide text-sm sm:text-base focus:outline-none shadow-inner placeholder:text-gray-500 placeholder:italic transition-colors ${
                  nameError
                    ? 'border-red-500 ring-2 ring-red-500/20'
                    : name.trim().length >= 2
                    ? 'border-emerald-500/80 focus:border-emerald-400'
                    : 'border-gray-700 focus:border-amber-400'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono-tech text-gray-400">
                {name.length}/26
              </span>
            </div>

            {nameError && (
              <p className="text-xs text-red-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Step 2: Difficulty Selection */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm sm:text-base font-racing font-bold uppercase tracking-wider text-gray-200">
              <span className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                2. Nivel de Dificultad:
              </span>
              <span className="text-xs font-mono-tech text-cyan-400 hidden sm:inline">
                Determina el desorden del banco y ayudas
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {difficultyOptions.map((opt) => {
                const isSelected = difficulty === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setDifficulty(opt.id);
                      soundEngine.playToolSound('key_click');
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all bg-gradient-to-b ${opt.bgGradient} ${
                      isSelected
                        ? `${opt.borderColor} ring-2 ring-amber-400/30 scale-[1.01]`
                        : 'border-gray-800 hover:border-gray-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Active Radio Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${opt.tagColor}`}>
                          {opt.tag}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-500' : 'border-gray-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>

                    <h4 className="font-racing font-bold text-sm sm:text-base text-white">{opt.title}</h4>
                    <p className="text-xs text-gray-300 font-mono-tech mb-2.5">{opt.subtitle}</p>

                    <ul className="space-y-1.5 text-xs text-gray-200 font-sans border-t border-white/10 pt-2">
                      {opt.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#232f42]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playToolSound('ratchet');
                onOpenLeaderboard();
              }}
              className="w-full sm:w-auto px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white font-racing text-xs sm:text-sm font-bold rounded-xl border border-gray-600 flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[46px] shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ver Récords (Top 3 Ganadores)</span>
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full sm:w-auto flex-1 py-3.5 px-6 font-racing font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 tracking-wider uppercase min-h-[50px] ${
                isFormValid
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>¡Ingresar al Taller y Comenzar!</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

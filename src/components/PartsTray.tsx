import React, { useState, useEffect } from 'react';
import { EnginePart, EnginePartId, AssemblyDifficulty, PartCategory } from '../types/engine';
import { soundEngine } from '../services/soundEngine';
import { ComponentIllustration } from './ComponentIllustration';
import {
  Check,
  Wrench,
  Shuffle,
  Puzzle,
  Flame,
  Zap,
  Search,
  ShieldCheck,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PartsTrayProps {
  parts: EnginePart[];
  installedPartIds: EnginePartId[];
  selectedPartId: EnginePartId | null;
  onSelectPart: (part: EnginePart) => void;
  onMountPart: (partId: EnginePartId) => void;
  difficulty: AssemblyDifficulty;
  onChangeDifficulty: () => void;
  shuffleKey?: number | string;
}

// Conflict pairs that should NOT be adjacent in the memory puzzle tray
const CONFLICT_PAIRS: [EnginePartId, EnginePartId][] = [
  ['crankcase_block', 'crankshaft'],
  ['crankshaft', 'pistons_rods'],
  ['pistons_rods', 'cylinder_head'],
  ['head_gasket', 'cylinder_head'],
  ['cylinder_head', 'camshafts'],
  ['camshafts', 'timing_belt'],
  ['timing_belt', 'valve_cover'],
  ['cylinder_head', 'spark_plugs'],
  ['valve_cover', 'spark_plugs'],
  ['cylinder_head', 'intake_manifold'],
  ['cylinder_head', 'exhaust_turbo'],
  ['oil_pan', 'oil_fluid'],
  ['cylinder_head', 'coolant_fluid'],
  ['crankcase_block', 'oil_pan'],
];

function areConflicting(a: EnginePartId, b: EnginePartId): boolean {
  return CONFLICT_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a)
  );
}

/**
 * Dynamic randomized Fisher-Yates permutation with anti-adjacent separation.
 * Guarantees that the horizontal parts list always swaps and scrambles positions
 * on every app load and every game restart, in all modes.
 */
function generateRandomizedOrder(parts: EnginePart[]): EnginePartId[] {
  const ids = parts.map((p) => p.id);
  const scrambled = [...ids];

  // Run multiple passes of Fisher-Yates shuffle with random swaps
  for (let round = 0; round < 3; round++) {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
  }

  // Anti-adjacent separation passes: prevent correlated engine parts from being adjacent
  for (let pass = 0; pass < 10; pass++) {
    for (let i = 0; i < scrambled.length - 1; i++) {
      if (areConflicting(scrambled[i], scrambled[i + 1])) {
        const swapOffset = 2 + Math.floor(Math.random() * (scrambled.length - 3));
        const targetIdx = (i + swapOffset) % scrambled.length;
        [scrambled[i + 1], scrambled[targetIdx]] = [scrambled[targetIdx], scrambled[i + 1]];
      }
    }
  }

  return scrambled;
}

export const PartsTray: React.FC<PartsTrayProps> = ({
  parts,
  installedPartIds,
  selectedPartId,
  onSelectPart,
  onMountPart,
  difficulty,
  onChangeDifficulty,
  shuffleKey,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderedPartIds, setOrderedPartIds] = useState<EnginePartId[]>(() =>
    generateRandomizedOrder(parts)
  );
  const [shuffleCounter, setShuffleCounter] = useState<number>(1);
  const [isShufflingAnim, setIsShufflingAnim] = useState<boolean>(false);

  // Dynamic re-randomization whenever shuffleKey (from restart/initial access/page reload) changes
  useEffect(() => {
    setOrderedPartIds(generateRandomizedOrder(parts));
    setShuffleCounter((c) => c + 1);
  }, [parts, shuffleKey]);

  const handleShuffle = () => {
    soundEngine.playToolSound('ratchet');
    setIsShufflingAnim(true);
    setOrderedPartIds(generateRandomizedOrder(parts));
    setShuffleCounter((c) => c + 1);
    setTimeout(() => {
      setIsShufflingAnim(false);
      soundEngine.playToolSound('place');
    }, 280);
  };

  const getCategoryStyles = (category: PartCategory) => {
    switch (category) {
      case 'bloque':
        return {
          border: 'border-amber-500/40 hover:border-amber-400',
          gradient: 'from-amber-950/40 via-[#111722] to-black',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          text: 'text-amber-400',
          glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        };
      case 'alternativo':
        return {
          border: 'border-cyan-500/40 hover:border-cyan-400',
          gradient: 'from-cyan-950/40 via-[#111722] to-black',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          text: 'text-cyan-400',
          glow: 'group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]',
        };
      case 'culata':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          gradient: 'from-emerald-950/40 via-[#111722] to-black',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          text: 'text-emerald-400',
          glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
        };
      case 'perifericos':
        return {
          border: 'border-purple-500/40 hover:border-purple-400',
          gradient: 'from-purple-950/40 via-[#111722] to-black',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          text: 'text-purple-400',
          glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]',
        };
      case 'fluidos':
        return {
          border: 'border-rose-500/40 hover:border-rose-400',
          gradient: 'from-rose-950/40 via-[#111722] to-black',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          text: 'text-rose-400',
          glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]',
        };
      default:
        return {
          border: 'border-gray-700 hover:border-gray-500',
          gradient: 'from-gray-900 via-[#111722] to-black',
          badge: 'bg-gray-800 text-gray-300 border-gray-700',
          text: 'text-gray-300',
          glow: '',
        };
    }
  };

  // Re-map parts according to current ordering
  const orderedParts = orderedPartIds
    .map((id) => parts.find((p) => p.id === id))
    .filter((p): p is EnginePart => p !== undefined);

  const filteredParts = orderedParts.filter((part) => {
    // Search match
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = part.name.toLowerCase().includes(term);
      const matchShort = part.shortName.toLowerCase().includes(term);
      const matchDesc = part.functionDesc.toLowerCase().includes(term);
      if (!matchName && !matchShort && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="bg-[#0e141f]/80 backdrop-blur-md border-2 border-[#2b384c] rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col space-y-3 sm:space-y-4 relative overflow-hidden">
      {/* Decorative Automotive Hazard & Workbench Pattern */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #111 10px, #111 20px)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-30 pointer-events-none [background-size:16px_16px]" />

      {/* Tray Header & Controls */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#212a3a] pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-red-500/20 to-blue-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Puzzle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="font-racing font-extrabold text-base sm:text-lg lg:text-xl text-white tracking-wide uppercase flex items-center gap-1.5">
                <span>Banco de Trabajo • Rompecabezas</span>
              </h3>

              <span className="text-xs font-mono-tech px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 font-bold">
                🎲 Aleatorio #{shuffleCounter}
              </span>

              {difficulty === 'dakar' && (
                <span className="text-xs font-mono-tech px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Jefe de Taller
                </span>
              )}
              {difficulty === 'mecanico' && (
                <span className="text-xs font-mono-tech px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  Mecánico Oficial
                </span>
              )}
              {difficulty === 'aprendiz' && (
                <span className="text-xs font-mono-tech px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Aprendiz Guiado
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 mt-1 leading-snug break-words">
              {difficulty === 'aprendiz'
                ? 'Modo aprendiz guiado: piezas con asistencia técnica e indicadores de montaje en azul.'
                : 'Las 15 piezas cambian de lugar aleatoriamente en cada partida. ¡Identifica los componentes mecánicos!'}
            </p>
          </div>
        </div>

        {/* Action Controls: Search, Shuffle, Difficulty & Filter Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-stretch lg:self-auto flex-wrap">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[140px] sm:min-w-0 sm:w-48">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pieza..."
              className="w-full pl-8 pr-7 py-2 bg-[#080c13] border border-gray-700 focus:border-amber-400 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none min-h-[38px]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Shuffle / Randomize Positions Button */}
          <button
            onClick={handleShuffle}
            className="px-3 sm:px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-racing font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 min-h-[38px] shrink-0"
            title="Intercambiar y mezclar aleatoriamente las posiciones de las piezas en el banco"
          >
            <Shuffle className={`w-4 h-4 shrink-0 ${isShufflingAnim ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Intercambiar Posiciones</span>
            <span className="sm:hidden">Mezclar</span>
          </button>

          {/* Difficulty change button */}
          <button
            onClick={onChangeDifficulty}
            className="px-3 py-2 bg-[#172130] hover:bg-[#1e2a3c] text-amber-300 border border-amber-500/40 rounded-xl text-xs sm:text-sm font-racing font-bold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[38px] shrink-0"
            title="Cambiar dificultad y perfil"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">Nivel</span>
          </button>

          {/* Badge: Todas las Piezas */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080c13] border border-amber-500/40 text-amber-300 font-racing text-xs sm:text-sm shrink-0 shadow-inner">
            <Puzzle className="w-4 h-4 text-amber-400" />
            <span>Todas las Piezas ({parts.length})</span>
          </div>
        </div>
      </div>

      {/* Workbench Status Bar: Todas las Piezas (sin filtros clasificatorios para mayor desafío de memoria) */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-[#212a3a]/60 pb-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-racing font-bold tracking-wide text-gray-200 text-xs sm:text-sm flex items-center gap-1.5">
            <span className="text-amber-400">Banco Completo:</span>
            <span>15 Componentes Mezclados</span>
          </span>
          <span className="text-xs font-mono-tech text-gray-300 px-2 py-0.5 rounded bg-black/40 border border-gray-800 hidden xs:inline">
            {installedPartIds.length} Montadas • {parts.length - installedPartIds.length} Pendientes
          </span>
        </div>
        <span className="text-xs font-mono-tech text-amber-400/90 hidden md:inline">
          🧠 Sin filtros: Deduce el orden mecánico con tu conocimiento y memoria
        </span>
      </div>

      {/* Scattered Puzzle Grid without internal nested scroll */}
      <div
        className={`relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 p-0.5 transition-opacity ${
          isShufflingAnim ? 'opacity-40 scale-98' : 'opacity-100'
        }`}
      >
        {filteredParts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-mono-tech text-xs">
            No se encontraron piezas con el filtro actual. Prueba seleccionando "Todas las Piezas".
          </div>
        ) : (
          filteredParts.map((part, index) => {
            const isInstalled = installedPartIds.includes(part.id);
            const isSelected = selectedPartId === part.id;
            const isCanMount = part.prerequisites.every((id) => installedPartIds.includes(id));
            const catStyles = getCategoryStyles(part.category);

            // Subtle puzzle angle when scrambled (-1.2deg to +1.2deg for mobile stability)
            const tiltAngles = [-1.2, 1.0, -0.8, 1.2, -1.0, 0.8, -1.2, 1.1, -0.9, 1.2];
            const tilt =
              (difficulty === 'mecanico' || difficulty === 'dakar')
                ? tiltAngles[index % tiltAngles.length]
                : 0;

            return (
              <div
                key={part.id}
                onClick={() => {
                  soundEngine.playToolSound('wrench');
                  onSelectPart(part);
                }}
                style={{ transform: `rotate(${tilt}deg)` }}
                className={`group relative p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:rotate-0 hover:scale-[1.02] hover:z-20 bg-gradient-to-b ${catStyles.gradient} ${catStyles.glow} ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.02] z-10'
                    : isInstalled
                    ? 'border-emerald-500/40 text-gray-300 opacity-80 hover:opacity-100 hover:border-emerald-400'
                    : `${catStyles.border}`
                }`}
              >
                {/* Top status indicator & mechanical tag */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] sm:text-xs font-mono-tech uppercase tracking-wider px-2 py-0.5 rounded-md border font-bold truncate max-w-[95px] sm:max-w-none ${catStyles.badge}`}
                  >
                    {part.category}
                  </span>

                  {isInstalled ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="text-[10px] sm:text-xs font-mono-tech text-amber-300 bg-black/70 px-2 py-0.5 rounded border border-amber-500/30 font-bold"
                        title={`Casilla aleatoria #${index + 1} en el banco`}
                      >
                        Pos #{index + 1}
                      </span>
                      {difficulty === 'aprendiz' && isCanMount && (
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse"
                          title="Modo Aprendiz: ¡Pieza lista para montar!"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Mechanical Component Artwork */}
                <div className="w-full flex items-center justify-center py-2 sm:py-2.5 my-1 bg-[#070a10]/90 rounded-xl border border-gray-800/80 group-hover:border-gray-700 transition-colors shadow-inner relative overflow-hidden">
                  <ComponentIllustration partId={part.id} size={50} />
                  {part.torqueRequiredNm && (
                    <span className="absolute bottom-1 right-1 text-[10px] font-mono-tech text-amber-300 bg-black/80 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                      {part.torqueRequiredNm}Nm
                    </span>
                  )}
                  {part.requiresTimingAlignment && (
                    <span className="absolute top-1 right-1 text-[10px] font-mono-tech text-cyan-300 bg-black/80 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                      0°PMS
                    </span>
                  )}
                </div>

                {/* Part Name & Specs */}
                <div className="my-1.5 text-center min-w-0">
                  <h4 className="font-racing font-bold text-sm sm:text-base text-white leading-tight truncate group-hover:text-amber-300 transition-colors">
                    {part.shortName}
                  </h4>
                  <span className="text-xs text-gray-300 block truncate mt-1 font-mono-tech">
                    {part.specText.split('|')[0]}
                  </span>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-2 border-t border-white/5">
                  {isInstalled ? (
                    <div className="text-xs sm:text-sm font-mono-tech text-emerald-400 text-center font-bold flex items-center justify-center gap-1.5 min-h-[42px]">
                      <Check className="w-4 h-4" />
                      <span>Instalado</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPart(part);
                        onMountPart(part.id);
                      }}
                      className={`w-full py-2.5 px-2.5 font-racing font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 min-h-[42px] ${
                        difficulty === 'aprendiz' && isCanMount
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-2 ring-blue-400/40 animate-pulse'
                          : 'bg-[#17202e] hover:bg-[#233147] text-gray-200 hover:text-white border border-[#2b3a52]'
                      }`}
                    >
                      <Wrench className={`w-3.5 h-3.5 shrink-0 ${difficulty === 'aprendiz' && isCanMount ? 'text-white' : 'text-amber-400'}`} />
                      <span className="truncate">
                        {difficulty === 'aprendiz' && isCanMount ? 'Montar (¡Listo!)' : 'Montar'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

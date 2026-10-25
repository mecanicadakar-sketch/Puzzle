import { EnginePart, EnginePartId, PartTorquesMap, AssemblyDifficulty } from '../types/engine';
import { soundEngine } from '../services/soundEngine';
import { Wrench, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle, Settings, Gauge } from 'lucide-react';

import { ComponentIllustration } from './ComponentIllustration';

interface PartDetailsCardProps {
  part: EnginePart;
  installedPartIds: EnginePartId[];
  partTorques: PartTorquesMap;
  timingOffsetTeeth: number;
  oilLevel: number;
  coolantLiters?: number;
  onMountPart: (partId: EnginePartId) => void;
  onDismountPart: (partId: EnginePartId) => void;
  onOpenTorqueModal: (part: EnginePart) => void;
  onOpenTimingModal: () => void;
  onOpenOilModal: () => void;
  onOpenCoolantModal: () => void;
  allParts: EnginePart[];
  difficulty?: AssemblyDifficulty;
  onGoToDyno?: () => void;
}

export const PartDetailsCard: React.FC<PartDetailsCardProps> = ({
  part,
  installedPartIds,
  partTorques,
  timingOffsetTeeth,
  oilLevel,
  coolantLiters = 5.0,
  onMountPart,
  onDismountPart,
  onOpenTorqueModal,
  onOpenTimingModal,
  onOpenOilModal,
  onOpenCoolantModal,
  allParts,
  difficulty = 'mecanico',
  onGoToDyno,
}) => {
  const isInstalled = installedPartIds.includes(part.id);
  const canMount = part.prerequisites.every((id) => installedPartIds.includes(id));
  const currentTorque = partTorques[part.id] || 0;
  const isTorqued =
    part.torqueRequiredNm && currentTorque >= part.torqueRequiredNm - 3;

  return (
    <div className="bg-[#141a24]/85 backdrop-blur-md border border-[#2d3748] rounded-2xl p-3.5 sm:p-5 shadow-2xl flex flex-col justify-between space-y-3.5 sm:space-y-4">
      {/* Top Header with Component Visual Artwork */}
      <div className="flex items-center gap-3 sm:gap-4 border-b border-[#212a3a] pb-3 sm:pb-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0b0f17] border border-[#303d52] p-2 flex items-center justify-center shrink-0 shadow-inner">
          <ComponentIllustration partId={part.id} size={60} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-xs font-mono-tech px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold">
              {part.category}
            </span>
            {isInstalled ? (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle className="w-3.5 h-3.5" />
                Instalado
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                En Banco
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-xl font-racing font-bold text-white tracking-wide mt-1.5 truncate">
            {part.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 truncate mt-0.5">{part.specText}</p>
        </div>
      </div>

      {/* Description & Engineering Details */}
      <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-gray-200">
        <div>
          <span className="text-xs sm:text-sm font-bold text-gray-400 block mb-1 uppercase tracking-wider font-mono-tech">
            Función en el Ciclo:
          </span>
          <p className="text-xs sm:text-sm text-gray-200">{part.functionDesc}</p>
        </div>

        <div>
          <span className="text-xs sm:text-sm font-bold text-gray-400 block mb-1 uppercase tracking-wider font-mono-tech">
            Material y Especificación:
          </span>
          <p className="text-xs sm:text-sm text-gray-400">{part.material}</p>
        </div>

        {/* Mechanic Tip Box */}
        <div className="bg-[#0b0f17] border border-amber-500/30 rounded-xl p-3 text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-racing font-bold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            Consejo del Maestro Mecánico:
          </div>
          <p className="leading-relaxed">{part.mechanicTip}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 sm:pt-3 border-t border-[#212a3a] space-y-2">
        {!isInstalled ? (
          <button
            onClick={() => onMountPart(part.id)}
            className={`w-full py-3.5 px-4 font-racing font-bold text-sm sm:text-base rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] active:scale-98 ${
              difficulty === 'aprendiz' && canMount
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-2 ring-blue-400/40 animate-pulse'
                : 'bg-[#17202e] hover:bg-[#233147] text-white border border-[#2b3a52]'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>
              {difficulty === 'aprendiz' && canMount
                ? 'Montar en el Motor (¡Listo!)'
                : 'Montar en el Motor'}
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            {/* Torque wrench button if part requires torque */}
            {part.torqueRequiredNm && (
              <button
                onClick={() => onOpenTorqueModal(part)}
                className={`w-full py-2.5 px-3.5 sm:px-4 font-racing font-bold text-xs sm:text-sm rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                  isTorqued
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/40 animate-pulse'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>
                    {isTorqued ? 'Par Correcto' : 'Apretar con Dinamométrica'}
                  </span>
                </div>
                <span className="font-mono-tech font-bold text-xs sm:text-sm">
                  {currentTorque} / {part.torqueRequiredNm} Nm
                </span>
              </button>
            )}

            {/* Timing calibration button if timing belt OR camshafts */}
            {(part.requiresTimingAlignment || part.id === 'camshafts') && (
              <button
                onClick={onOpenTimingModal}
                className={`w-full py-2.5 px-3.5 sm:px-4 font-racing font-bold text-xs sm:text-sm rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                  timingOffsetTeeth === 0
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-red-950/50 border-red-500/60 text-red-300 hover:bg-red-900/50 animate-pulse'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className={`w-4 h-4 ${timingOffsetTeeth === 0 ? 'text-emerald-400' : 'text-red-400 animate-spin'}`} style={{ animationDuration: '6s' }} />
                  <span>
                    {timingOffsetTeeth === 0
                      ? 'Levas Sincronizadas (0°)'
                      : '¡Fuera de Punto! Sincronizar'}
                  </span>
                </div>
                <span className={`font-mono-tech font-bold px-2 py-0.5 rounded text-xs ${
                  timingOffsetTeeth === 0
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-900/80 text-red-200 border border-red-500/50'
                }`}>
                  {timingOffsetTeeth === 0 ? '0° PMS' : `${timingOffsetTeeth > 0 ? `+${timingOffsetTeeth}` : timingOffsetTeeth}T`}
                </span>
              </button>
            )}

            {/* Oil service check button if oil */}
            {part.id === 'oil_fluid' && (
              <button
                onClick={onOpenOilModal}
                className={`w-full py-2.5 px-3.5 sm:px-4 font-racing font-bold text-xs sm:text-sm rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                  oilLevel >= 70 && oilLevel <= 85
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/40'
                    : 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-900/40 animate-pulse'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>Nivel de Aceite</span>
                </div>
                <span className="font-mono-tech font-bold text-xs sm:text-sm">
                  {((oilLevel / 100) * 5.2).toFixed(1)} L ({oilLevel}%)
                </span>
              </button>
            )}

            {/* Coolant service check button if coolant */}
            {part.id === 'coolant_fluid' && (
              <button
                onClick={onOpenCoolantModal}
                className={`w-full py-2.5 px-3 sm:px-4 font-racing font-bold text-xs rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                  (coolantLiters || 0) >= 4.5 && (coolantLiters || 0) <= 5.0
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-900/40 animate-pulse'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Circuito Refrigerante</span>
                </div>
                <span className="font-mono-tech font-bold text-[11px] sm:text-xs">
                  {(coolantLiters || 0).toFixed(1)} / 5.0 L
                </span>
              </button>
            )}

            {/* Quick Test on Dyno button */}
            {onGoToDyno && (
              <button
                onClick={onGoToDyno}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white font-racing font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 min-h-[40px]"
              >
                <Gauge className="w-4 h-4 text-white" />
                <span>Probar en Banco Dyno</span>
              </button>
            )}

            {/* Dismount button */}
            <button
              onClick={() => {
                soundEngine.playToolSound('wrench');
                onDismountPart(part.id);
              }}
              className="w-full py-2.5 px-3 text-xs text-gray-400 hover:text-red-400 bg-gray-900/80 hover:bg-red-950/30 rounded-xl border border-gray-800 hover:border-red-500/30 transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
            >
              Desmontar y devolver al banco
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

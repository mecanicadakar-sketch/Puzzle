import React, { useState } from 'react';
import { EnginePart } from '../types/engine';
import { soundEngine } from '../services/soundEngine';
import { Wrench, CheckCircle, RotateCcw, AlertTriangle, ArrowRight, Gauge, ChevronRight, Minus, Plus } from 'lucide-react';

interface TorqueWrenchModalProps {
  part: EnginePart;
  currentTorque: number;
  onApplyTorque: (torque: number) => void;
  onClose: () => void;
}

export const TorqueWrenchModal: React.FC<TorqueWrenchModalProps> = ({
  part,
  currentTorque,
  onApplyTorque,
  onClose,
}) => {
  const targetTorque = part.torqueRequiredNm || 50;

  // 3-stage torque sequence targets (Etapa 1: Pre-apriete, Etapa 2: Intermedio, Etapa 3: Final)
  const stageTargets: [number, number, number] = part.torqueStages || [
    Math.max(5, Math.round(targetTorque * 0.4)),
    Math.max(8, Math.round(targetTorque * 0.7)),
    targetTorque,
  ];

  const stageLabels = [
    { name: 'Etapa 1: Pre-apriete', desc: 'Asentamiento inicial parejo de roscas', target: stageTargets[0] },
    { name: 'Etapa 2: Intermedio', desc: 'Aproximación de carga elástica', target: stageTargets[1] },
    { name: 'Etapa 3: Final Nominal', desc: 'Torsión especificada de fábrica ("CLICK")', target: stageTargets[2] },
  ];

  // Determine starting state: if already torqued previously to target, mark as completed
  const isInitiallyCompleted = currentTorque > 0 && Math.abs(currentTorque - targetTorque) <= 3;

  const [currentStageIndex, setCurrentStageIndex] = useState<number>(isInitiallyCompleted ? 3 : 0);
  const [appliedStageTorques, setAppliedStageTorques] = useState<(number | null)[]>([
    isInitiallyCompleted ? stageTargets[0] : null,
    isInitiallyCompleted ? stageTargets[1] : null,
    isInitiallyCompleted ? currentTorque : null,
  ]);

  // Selected torque on the Vernier slider for the active stage
  // Start slightly below the stage target so the mechanic moves the slider
  const [selectedTorque, setSelectedTorque] = useState<number>(() => {
    if (isInitiallyCompleted) return currentTorque;
    return Math.max(3, stageTargets[0] - 4);
  });

  const [isSuccess, setIsSuccess] = useState<boolean>(isInitiallyCompleted);
  const [activeBoltAnim, setActiveBoltAnim] = useState<number | null>(null);

  // Active target based on stage
  const activeStage = Math.min(currentStageIndex, 2);
  const currentStageTarget = stageTargets[activeStage];

  const minSlider = Math.max(2, Math.floor(stageTargets[0] * 0.4));
  const maxSlider = Math.min(150, Math.ceil(targetTorque * 1.5));

  const handleTorqueSliderChange = (newVal: number) => {
    const clamped = Math.max(minSlider, Math.min(maxSlider, newVal));
    setSelectedTorque(clamped);
    soundEngine.playToolSound('ratchet');
  };

  const handleApplyCurrentStage = () => {
    soundEngine.playToolSound('ratchet');
    
    // Animate bolts in cross tightening sequence
    setActiveBoltAnim(1);
    setTimeout(() => setActiveBoltAnim(3), 120);
    setTimeout(() => setActiveBoltAnim(2), 240);
    setTimeout(() => setActiveBoltAnim(4), 360);
    setTimeout(() => setActiveBoltAnim(null), 520);

    const nextApplied = [...appliedStageTorques];
    nextApplied[activeStage] = selectedTorque;
    setAppliedStageTorques(nextApplied);

    if (activeStage === 2) {
      // Completed Stage 3 (Final)
      soundEngine.playToolSound('torque_click');
      setCurrentStageIndex(3);
      const isAccurate = Math.abs(selectedTorque - targetTorque) <= 3;
      setIsSuccess(isAccurate);
      onApplyTorque(selectedTorque);
    } else {
      // Advance to next stage (Stage 1 -> 2, or Stage 2 -> 3)
      const nextStage = activeStage + 1;
      setCurrentStageIndex(nextStage);
      // Initialize the slider for the new stage starting slightly under the next target
      // This ensures the user actively slides the vernier scale for every single stage!
      const nextTarget = stageTargets[nextStage];
      const startValue = Math.max(selectedTorque, nextTarget - 5);
      setSelectedTorque(startValue);
    }
  };

  const handleReset = () => {
    setCurrentStageIndex(0);
    setAppliedStageTorques([null, null, null]);
    setIsSuccess(false);
    setSelectedTorque(Math.max(3, stageTargets[0] - 4));
    soundEngine.playToolSound('ratchet');
  };

  const diff = selectedTorque - currentStageTarget;
  const isAccurateCurrentStage = Math.abs(diff) <= 2;

  const getDialColor = () => {
    if (diff === 0) return 'text-emerald-400';
    if (Math.abs(diff) <= 2) return 'text-emerald-300';
    if (Math.abs(diff) <= 5) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#21262d] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#30363d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-racing font-bold text-sm sm:text-lg text-white tracking-wide truncate">
                Llave Dinamométrica / Torquímetro
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                Par de apriete en 3 etapas: <span className="text-amber-300 font-semibold">{part.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base font-bold p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* 3-Stage Interactive Progress Track */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3 sm:p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs uppercase font-mono-tech tracking-wider text-gray-400 font-bold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Secuencia Técnica de 3 Fases
              </span>
              <span className="text-[10px] sm:text-xs font-mono-tech px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                {currentStageIndex >= 3 ? '3/3 Completado' : `Etapa ${currentStageIndex + 1} de 3`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {stageLabels.map((stage, idx) => {
                const isPassed = appliedStageTorques[idx] !== null;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-2 sm:p-2.5 border transition-all text-center relative ${
                      isPassed
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                        : 'bg-[#161b22] border-gray-800 text-gray-500 opacity-60'
                    }`}
                  >
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase truncate">
                      Pase {idx + 1}
                    </div>
                    <div className="text-sm sm:text-base font-racing font-bold my-0.5">
                      {stage.target} <span className="text-[9px] font-sans">Nm</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-mono-tech truncate">
                      {isPassed ? (
                        <span className="text-emerald-400 font-semibold flex items-center justify-center gap-0.5">
                          ✓ {appliedStageTorques[idx]} Nm
                        </span>
                      ) : isCurrent ? (
                        <span className="text-amber-400 font-semibold animate-pulse">Ajustar</span>
                      ) : (
                        <span>Pendiente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Stage Instruction Banner */}
          {currentStageIndex < 3 ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-300">
                  {stageLabels[currentStageIndex].name}: Objetivo {currentStageTarget} Nm
                </p>
                <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
                  Mueve la escala micrométrica del torquímetro hasta alcanzar{' '}
                  <strong className="text-white">{currentStageTarget} Nm</strong> para este pase y presiona apretar.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-200">¡Secuencia de 3 Aprietes Completada con Éxito!</p>
                <p className="text-emerald-400/80 text-[11px] mt-0.5">
                  Los pernos fueron asentados en {appliedStageTorques[0]} Nm, llevados a {appliedStageTorques[1]} Nm y finalizados a {appliedStageTorques[2]} Nm.
                </p>
              </div>
            </div>
          )}

          {/* Dials: Factory Target vs Current Vernier Dial */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3 sm:p-4 text-center">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                {currentStageIndex < 3 ? `Meta Fase ${currentStageIndex + 1}` : 'Meta Fábrica Final'}
              </span>
              <div className="text-2xl sm:text-3xl font-racing font-bold text-emerald-400">
                {currentStageIndex < 3 ? currentStageTarget : targetTorque}{' '}
                <span className="text-xs sm:text-sm font-sans text-emerald-300/80">Nm</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 block">
                {((currentStageIndex < 3 ? currentStageTarget : targetTorque) * 0.73756).toFixed(1)} lb-ft
              </span>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3 sm:p-4 text-center">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                Ajuste en Escala
              </span>
              <div className={`text-2xl sm:text-3xl font-racing font-bold ${getDialColor()}`}>
                {selectedTorque} <span className="text-xs sm:text-sm font-sans opacity-80">Nm</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 block">
                {diff === 0
                  ? '🎯 Calibración perfecta'
                  : diff < 0
                  ? `Faltan ${Math.abs(diff)} Nm`
                  : `Exceso de +${diff} Nm`}
              </span>
            </div>
          </div>

          {/* Interactive Vernier Micrometer Slider */}
          {currentStageIndex < 3 && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 sm:p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="font-medium text-gray-300">Escala Micrométrica del Mango</span>
                <span className="font-mono-tech text-amber-400 font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedTorque} Nm
                </span>
              </div>

              {/* Slider with [-1] and [+1] precision touch controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTorqueSliderChange(selectedTorque - 1)}
                  disabled={selectedTorque <= minSlider}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  title="Restar 1 Nm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min={minSlider}
                  max={maxSlider}
                  step={1}
                  value={selectedTorque}
                  onChange={(e) => handleTorqueSliderChange(Number(e.target.value))}
                  className="w-full accent-amber-500 h-3 bg-gray-700 rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleTorqueSliderChange(selectedTorque + 1)}
                  disabled={selectedTorque >= maxSlider}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  title="Sumar 1 Nm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono-tech">
                <span>{minSlider} Nm</span>
                <button
                  type="button"
                  onClick={() => handleTorqueSliderChange(currentStageTarget)}
                  className="text-amber-400 hover:text-amber-300 underline cursor-pointer font-bold px-1 py-0.5 rounded hover:bg-amber-500/10 transition-colors"
                >
                  Fijar exacto a {currentStageTarget} Nm
                </button>
                <span>{maxSlider} Nm</span>
              </div>
            </div>
          )}

          {/* Bolting Pattern Action & Visual Bolts */}
          <div className="bg-[#1c2333] border border-[#2d3748] rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Pernos en Secuencia Cruzada</h4>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {currentStageIndex === 0 && 'Ajusta la escala a la Etapa 1 y aprieta en cruz.'}
                  {currentStageIndex === 1 && 'Etapa 1 asentada. Aumenta la escala para la Etapa 2.'}
                  {currentStageIndex === 2 && 'Etapa 2 lista. Calibra al par nominal final (Etapa 3).'}
                  {currentStageIndex >= 3 && 'Pernos apretados a la tensión final especificada.'}
                </p>
              </div>
            </div>

            {/* Visual Bolt representation */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 py-1">
              {[1, 2, 3, 4].map((bolt) => {
                const isAnim = activeBoltAnim === bolt;
                const isFinal = currentStageIndex >= 3;
                const lastTorque =
                  currentStageIndex >= 3
                    ? appliedStageTorques[2]
                    : currentStageIndex > 0
                    ? appliedStageTorques[currentStageIndex - 1]
                    : null;

                return (
                  <div
                    key={bolt}
                    className={`h-12 sm:h-14 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      isAnim
                        ? 'bg-amber-500/40 border-amber-400 text-amber-200 scale-105 shadow-md shadow-amber-500/20'
                        : isFinal
                        ? isSuccess
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : lastTorque !== null
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-[#0d1117] border-gray-700 text-gray-400'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] font-mono-tech">Perno #{bolt}</span>
                    <span className="text-[11px] sm:text-xs font-bold">
                      {lastTorque !== null ? `${lastTorque} Nm` : 'Libre'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 pt-1">
              {currentStageIndex < 3 ? (
                <button
                  type="button"
                  onClick={handleApplyCurrentStage}
                  className={`flex-1 py-3 px-3 sm:px-4 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px] transition-all active:scale-98 ${
                    isAccurateCurrentStage
                      ? 'bg-amber-600 hover:bg-amber-500 ring-1 ring-amber-400'
                      : 'bg-amber-700 hover:bg-amber-600'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>
                    Apretar Etapa {currentStageIndex + 1} ({selectedTorque} Nm)
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-3 px-3 sm:px-4 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px] transition-all active:scale-98 ${
                    isSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSuccess ? 'Confirmar Apriete y Volver al Banco' : 'Aceptar este Par y Volver al Banco'}</span>
                </button>
              )}

              {(currentStageIndex > 0 || isInitiallyCompleted) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl flex items-center gap-1.5 text-xs font-medium cursor-pointer min-h-[44px] transition-colors border border-gray-700"
                  title="Reiniciar secuencia desde Etapa 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reiniciar Fases</span>
                </button>
              )}
            </div>

            {/* Warning or Tip banner */}
            {currentStageIndex < 3 && Math.abs(diff) > 5 && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 text-amber-300 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Atención: El objetivo para este pase es <strong>{currentStageTarget} Nm</strong> (tienes {selectedTorque} Nm).
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

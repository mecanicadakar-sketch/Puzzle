import React, { useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Settings, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';

interface TimingCalibrationModalProps {
  currentOffsetTeeth: number;
  onSaveTiming: (offsetTeeth: number) => void;
  onClose: () => void;
}

export const TimingCalibrationModal: React.FC<TimingCalibrationModalProps> = ({
  currentOffsetTeeth,
  onSaveTiming,
  onClose,
}) => {
  const [offsetTeeth, setOffsetTeeth] = useState<number>(currentOffsetTeeth);

  const handleStep = (delta: number) => {
    const next = Math.max(-3, Math.min(3, offsetTeeth + delta));
    setOffsetTeeth(next);
    soundEngine.playToolSound('ratchet');
    if (next === 0) {
      soundEngine.playToolSound('torque_click');
    }
  };

  const isPerfect = offsetTeeth === 0;
  const degreesOffset = offsetTeeth * 18;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#131924] border border-[#2b384e] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1b2333] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#2b384e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border transition-colors shrink-0 ${
              isPerfect 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
            }`}>
              <Settings className={`w-5 h-5 sm:w-6 sm:h-6 ${isPerfect ? '' : 'animate-spin'}`} style={{ animationDuration: '6s' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-racing font-bold text-sm sm:text-lg text-white tracking-wide truncate">
                  Puesta a Punto de Levas
                </h3>
                <span className={`text-[9px] sm:text-[10px] font-mono-tech px-2 py-0.5 rounded-full uppercase font-bold border ${
                  isPerfect
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                }`}>
                  {isPerfect ? 'Sincronizado' : 'Fuera de Punto'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                Sincronización DOHC con Cigüeñal a 0° PMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base font-bold p-1.5 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Visual Calibration View */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          <div className="relative bg-[#090d14] border border-[#222e42] rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
            {/* Visual alignment laser line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-cyan-500/15 pointer-events-none" />
            {isPerfect && (
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-emerald-400 shadow-[0_0_15px_#10b981] pointer-events-none transition-all duration-300" />
            )}

            {/* Cylinder Head Fixed Alignment Reference Mark Banner */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 z-20 mb-1">
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-mono-tech text-gray-400 uppercase tracking-wider mb-0.5">
                  Marca Fija
                </span>
                <div className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono-tech font-bold flex items-center gap-1 transition-colors ${
                  isPerfect ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' : 'bg-gray-800 text-gray-300 border border-gray-700'
                }`}>
                  <span>TDC ▼</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-mono-tech text-gray-400 uppercase tracking-wider mb-0.5">
                  Marca Fija
                </span>
                <div className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono-tech font-bold flex items-center gap-1 transition-colors ${
                  isPerfect ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' : 'bg-gray-800 text-gray-300 border border-gray-700'
                }`}>
                  <span>TDC ▼</span>
                </div>
              </div>
            </div>

            {/* Upper Camshaft Gears (Twin Cams) */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 z-10 mb-4 sm:mb-6">
              {/* Intake Cam Gear */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono-tech text-gray-400 mb-1 font-semibold">
                  Leva Adm (IN)
                </span>
                <div className="relative">
                  {/* Fixed Reference Pointer on Engine Head */}
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 z-20 transition-all ${
                    isPerfect ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                  }`} />
                  
                  {/* Sprocket Body */}
                  <div
                    className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 ${
                      isPerfect ? 'border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-[#475569]'
                    } bg-[#182335] relative flex items-center justify-center transition-transform duration-300 shadow-xl`}
                    style={{ transform: `rotate(${degreesOffset}deg)` }}
                  >
                    {/* Spokes */}
                    <div className="absolute w-full h-1 bg-gray-600" />
                    <div className="absolute w-1 h-full bg-gray-600" />
                    <div className="absolute w-full h-1 bg-gray-600 rotate-45" />
                    <div className="absolute w-1 h-full bg-gray-600 rotate-45" />
                    
                    {/* Center nut */}
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-800 border-2 border-gray-400 z-10 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-gray-200 shadow">
                      IN
                    </div>
                    {/* Rotating timing notch */}
                    <div className={`absolute top-0 w-2 sm:w-2.5 h-3.5 sm:h-4.5 rounded-b z-10 transition-colors ${
                      isPerfect ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Exhaust Cam Gear */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono-tech text-gray-400 mb-1 font-semibold">
                  Leva Esc (EX)
                </span>
                <div className="relative">
                  {/* Fixed Reference Pointer on Engine Head */}
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 z-20 transition-all ${
                    isPerfect ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                  }`} />

                  {/* Sprocket Body */}
                  <div
                    className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 ${
                      isPerfect ? 'border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-[#475569]'
                    } bg-[#182335] relative flex items-center justify-center transition-transform duration-300 shadow-xl`}
                    style={{ transform: `rotate(${degreesOffset}deg)` }}
                  >
                    <div className="absolute w-full h-1 bg-gray-600" />
                    <div className="absolute w-1 h-full bg-gray-600" />
                    <div className="absolute w-full h-1 bg-gray-600 rotate-45" />
                    <div className="absolute w-1 h-full bg-gray-600 rotate-45" />
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-800 border-2 border-gray-400 z-10 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-gray-200 shadow">
                      EX
                    </div>
                    <div className={`absolute top-0 w-2 sm:w-2.5 h-3.5 sm:h-4.5 rounded-b z-10 transition-colors ${
                      isPerfect ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    }`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Timing belt tensioner span */}
            <div className="w-44 sm:w-56 h-8 sm:h-9 border-x-4 border-dashed border-cyan-600/70 flex items-center justify-center bg-cyan-950/20 rounded">
              <span className="text-[9px] sm:text-[10px] font-mono-tech text-cyan-300 bg-[#121926] px-2 py-0.5 rounded border border-cyan-700/80">
                Correa HNBR (Relación 2:1)
              </span>
            </div>

            {/* Crankshaft Timing Gear (Lower Reference) */}
            <div className="flex flex-col items-center z-10 mt-2 sm:mt-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#334155] bg-[#0c1322] relative flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-700 border border-gray-400 z-10 flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-gray-200">
                  PMS
                </div>
                {/* Fixed Block TDC Indicator Mark */}
                <div className="absolute -top-2.5 w-2.5 h-2.5 bg-cyan-400 rotate-45 shadow-[0_0_8px_#22d3ee]" />
                <div className="absolute top-0 w-1.5 h-3 bg-white" />
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono-tech text-gray-400 mt-1.5 font-bold">
                Cigüeñal Calado a 0° PMS
              </span>
            </div>

            {/* Synchronization Status Banner */}
            <div className="mt-4 w-full flex items-center justify-center">
              {isPerfect ? (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-lg text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡LEVAS SINCRONIZADAS! (0° PMS - Calado OK)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-semibold shadow-lg animate-pulse text-center">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    DESFASE: {offsetTeeth > 0 ? `+${offsetTeeth}` : offsetTeeth} dientes ({degreesOffset > 0 ? `+${degreesOffset}°` : `${degreesOffset}°`})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Stepper & Slider Controls */}
          <div className="space-y-3 sm:space-y-4 bg-[#18202e] p-3.5 sm:p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-racing text-gray-300 text-[11px] sm:text-xs">Ajuste de Dientes:</span>
              <span className={`font-mono-tech font-bold text-xs sm:text-sm px-2 py-0.5 rounded border ${
                isPerfect 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
                  : 'bg-red-950/60 border-red-500/50 text-red-400'
              }`}>
                {offsetTeeth === 0 ? '0 Dientes (Alineado)' : `${offsetTeeth > 0 ? `+${offsetTeeth}` : offsetTeeth}T (${degreesOffset}°)`}
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              <button
                onClick={() => handleStep(-1)}
                className="py-2.5 sm:py-3 px-2 sm:px-4 bg-gray-800/90 hover:bg-gray-700 active:bg-gray-600 rounded-xl border border-gray-700 text-white font-racing font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all active:scale-98 shadow min-h-[42px]"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">-1 Diente</span>
              </button>

              <button
                onClick={() => {
                  setOffsetTeeth(0);
                  soundEngine.playToolSound('torque_click');
                }}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-racing font-bold text-[10px] sm:text-xs border flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98 shadow min-h-[44px] ${
                  isPerfect
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/50 text-cyan-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Calar 0°</span>
              </button>

              <button
                onClick={() => handleStep(1)}
                className="py-2.5 sm:py-3 px-2 sm:px-4 bg-gray-800/90 hover:bg-gray-700 active:bg-gray-600 rounded-xl border border-gray-700 text-white font-racing font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all active:scale-98 shadow min-h-[44px]"
              >
                <span className="truncate">+1 Diente</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </button>
            </div>

            {/* Visual Dials/Teeth Indicator */}
            <div className="flex items-center justify-between pt-1 px-0.5 gap-1 overflow-x-auto scrollbar-none">
              {[-3, -2, -1, 0, 1, 2, 3].map((tooth) => (
                <button
                  key={tooth}
                  onClick={() => {
                    setOffsetTeeth(tooth);
                    soundEngine.playToolSound('ratchet');
                    if (tooth === 0) soundEngine.playToolSound('torque_click');
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono-tech text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center justify-center min-h-[40px] min-w-[36px] ${
                    offsetTeeth === tooth
                      ? tooth === 0
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_#10b981]'
                        : 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_#ef4444]'
                      : tooth === 0
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tooth > 0 ? `+${tooth}` : tooth}
                </button>
              ))}
            </div>
          </div>

          {/* Mechanic Technical Warning */}
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all shadow-md ${
              isPerfect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/40 border-red-500/50 text-red-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isPerfect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              )}
              <div>
                {isPerfect ? (
                  <p>
                    <strong className="text-emerald-300 font-racing">¡Sincronismo 100% Calado!</strong> La relación de giro 2:1 entre el cigüeñal y los dos árboles de levas está calibrada al milímetro en 0° PMS (Punto Muerto Superior). Las válvulas abrirán y cerrarán sin peligro de interferencia mecánica.
                  </p>
                ) : (
                  <p>
                    <strong className="text-red-300 font-racing">¡Peligro Mecánico Severo (Fuera de Punto)!</strong> Este motor 2.0L 16V es de interferencia. Con {Math.abs(offsetTeeth)} diente(s) de desfase ({degreesOffset}°), al accionar el arranque los pistones chocarán contra las válvulas de admisión/escape abiertas, doblando válvulas y destruyendo la culata (Código OBD-II P0016).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Confirm Button */}
          <button
            onClick={() => {
              onSaveTiming(offsetTeeth);
              onClose();
            }}
            className={`w-full min-h-[48px] py-4 px-4 font-racing font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              isPerfect
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-lg'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {isPerfect ? 'Guardar Calado (0° PMS) y Volver al Banco' : 'Fijar Distribución y Volver al Banco'}
          </button>
        </div>
      </div>
    </div>
  );
};


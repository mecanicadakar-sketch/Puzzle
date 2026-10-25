import React, { useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Droplet, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';

interface OilDipstickModalProps {
  currentOilLevel: number; // 0 to 100
  onSaveOilLevel: (level: number) => void;
  onClose: () => void;
}

export const OilDipstickModal: React.FC<OilDipstickModalProps> = ({
  currentOilLevel,
  onSaveOilLevel,
  onClose,
}) => {
  const [oilLevel, setOilLevel] = useState<number>(currentOilLevel);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isDipstickPulled, setIsDipstickPulled] = useState<boolean>(true);

  const handlePourOil = () => {
    setIsPouring(true);
    soundEngine.playToolSound('oil_pour');

    const interval = setInterval(() => {
      setOilLevel((prev) => {
        const next = Math.min(100, prev + 15);
        if (next >= 100) {
          clearInterval(interval);
          setIsPouring(false);
        }
        return next;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setIsPouring(false);
    }, 1200);
  };

  const handlePullDipstick = () => {
    soundEngine.playToolSound('place');
    setIsDipstickPulled(!isDipstickPulled);
  };

  const handleDrainOil = () => {
    soundEngine.playToolSound('oil_pour');
    setOilLevel(0);
  };

  // 70% to 85% is ideal (4.5 Litres)
  const isLevelIdeal = oilLevel >= 70 && oilLevel <= 85;
  const isLevelLow = oilLevel < 70;
  const isLevelOverfill = oilLevel > 85;

  const currentLiters = ((oilLevel / 100) * 5.2).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#21262d] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#30363d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Droplet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-racing font-bold text-sm sm:text-lg text-white tracking-wide truncate">
                Servicio de Aceite y Varilla
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                Lubricante SAE 5W-40 Competición
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base font-bold p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Visual Oil Level in Engine */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between">
              <span className="text-xs font-mono-tech text-gray-400">Volumen en Cárter</span>
              
              {/* Engine Sump Fluid representation */}
              <div className="w-24 h-36 sm:h-40 bg-[#1e293b] rounded-b-2xl border-2 border-gray-600 relative overflow-hidden flex flex-col justify-end p-1 my-2">
                {/* Oil liquid */}
                <div
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-b-xl transition-all duration-500 relative"
                  style={{ height: `${oilLevel}%` }}
                >
                  {isPouring && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </div>
                {/* Capacity ticks */}
                <div className="absolute right-1 top-2 text-[8px] font-mono-tech text-gray-500">MAX (4.8L)</div>
                <div className="absolute right-1 top-8 text-[8px] font-mono-tech text-emerald-400">IDEAL (4.5L)</div>
                <div className="absolute right-1 bottom-3 text-[8px] font-mono-tech text-red-400">MIN (2.0L)</div>
              </div>

              <div className="text-center mt-1 sm:mt-2">
                <span className="text-xl sm:text-2xl font-racing font-bold text-amber-400">
                  {currentLiters} L
                </span>
                <span className="text-[10px] text-gray-500 block">Capacidad total 4.8 L</span>
              </div>
            </div>

            {/* Dipstick Inspection View */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono-tech text-gray-400">Varilla de Nivel</span>
                <button
                  onClick={handlePullDipstick}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium cursor-pointer min-h-[32px] flex items-center"
                >
                  {isDipstickPulled ? 'Insertar' : 'Extraer'}
                </button>
              </div>

              {/* Graphic of the metallic dipstick */}
              <div className="h-36 sm:h-40 flex items-center justify-center py-2">
                {isDipstickPulled ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-32 sm:h-36 bg-gradient-to-b from-gray-400 via-gray-300 to-amber-200 rounded-sm relative border border-gray-500 flex flex-col justify-end">
                      {/* Oil wet mark */}
                      <div
                        className="w-full bg-amber-500/90 rounded-sm border-t border-amber-300 shadow-[0_0_8px_#f59e0b]"
                        style={{ height: `${Math.min(100, (oilLevel / 85) * 60)}%` }}
                      />
                      {/* Hatch marks for MIN and MAX */}
                      <div className="absolute top-8 left-0 right-0 h-0.5 bg-red-600" title="MAX" />
                      <div className="absolute bottom-5 left-0 right-0 h-0.5 bg-red-600" title="MIN" />
                    </div>
                    <div className="flex flex-col justify-between h-32 sm:h-36 text-[9px] font-mono-tech text-gray-400">
                      <span className="text-red-400">MAX</span>
                      <span className="text-emerald-400">ZONA ÓPTIMA</span>
                      <span className="text-red-400">MIN</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-3">
                    <div className="w-8 h-8 rounded-full border-4 border-amber-500 flex items-center justify-center text-amber-500 mb-1.5 font-bold">
                      O
                    </div>
                    <span className="text-xs text-gray-400">Varilla en la guía.</span>
                    <button
                      onClick={handlePullDipstick}
                      className="mt-1 text-xs text-amber-400 underline font-semibold cursor-pointer"
                    >
                      Extraer para ver
                    </button>
                  </div>
                )}
              </div>

              {/* Status pill */}
              <div className="w-full text-center">
                {isLevelIdeal ? (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Nivel Óptimo (4.5 L)
                  </span>
                ) : isLevelLow ? (
                  <span className="text-[10px] font-semibold text-red-400 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full">
                    {oilLevel === 0 ? 'Sin Aceite' : 'Nivel Bajo'}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Exceso de Aceite
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Pour & Drain */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePourOil}
              disabled={isPouring || oilLevel >= 100}
              className="flex-1 py-3 px-3 sm:px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 min-h-[44px]"
            >
              <Droplet className="w-4 h-4" />
              <span>{isPouring ? 'Vertiendo Aceite...' : 'Verter Aceite 5W-40'}</span>
            </button>

            <button
              onClick={handleDrainOil}
              disabled={oilLevel === 0}
              className="py-3 px-3 sm:px-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-700 min-h-[44px]"
              title="Drenar cárter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          </div>

          {/* Mechanic advice */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              isLevelIdeal
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : isLevelLow
                ? 'bg-red-950/30 border-red-500/40 text-red-300'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            }`}
          >
            {isLevelIdeal && (
              <p>
                <strong>¡Nivel Perfecto!</strong> El aceite cubre el chupador de la bomba adecuadamente. Presión estable a 45 PSI en caliente.
              </p>
            )}
            {isLevelLow && (
              <p>
                <AlertTriangle className="w-4 h-4 inline mr-1 text-red-400" />
                <strong>¡Alerta!</strong> Arrancar sin aceite provocará fricción destructiva y fundición de casquillos.
              </p>
            )}
            {isLevelOverfill && (
              <p>
                <strong>Sobrellenado:</strong> El cigüeñal batirá el aceite generando espuma.
              </p>
            )}
          </div>

          {/* Confirm */}
          <button
            onClick={() => {
              onSaveOilLevel(oilLevel);
              onClose();
            }}
            className="w-full py-3 sm:py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[44px]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirmar Nivel de Aceite</span>
          </button>
        </div>
      </div>
    </div>
  );
};

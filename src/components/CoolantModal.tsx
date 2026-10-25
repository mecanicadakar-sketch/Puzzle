import React, { useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Droplet, CheckCircle, RotateCcw, AlertTriangle, Thermometer, Sliders, Minus, Plus } from 'lucide-react';

interface CoolantModalProps {
  currentCoolantLiters: number; // 0 to 5.0
  onSaveCoolantLevel: (liters: number) => void;
  onClose: () => void;
}

export const CoolantModal: React.FC<CoolantModalProps> = ({
  currentCoolantLiters,
  onSaveCoolantLevel,
  onClose,
}) => {
  // El cursor de llenado no debe coincidir de primera con el nivel deseado (5.0 L)
  const [liters, setLiters] = useState<number>(() => {
    if (!currentCoolantLiters || currentCoolantLiters === 0 || currentCoolantLiters === 5.0) {
      return 1.0; // Nivel bajo inicial (1.0 L / circuito vacío) para que el mecánico deba usar el cursor
    }
    return currentCoolantLiters;
  });
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [capOpen, setCapOpen] = useState<boolean>(true);
  const [isPurged, setIsPurged] = useState<boolean>(false);

  const handleSliderChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(5.0, Number(newVal.toFixed(1))));
    setLiters(clamped);
    soundEngine.playToolSound('oil_pour');
  };

  const handlePour = () => {
    if (!capOpen) {
      setCapOpen(true);
    }
    setIsPouring(true);
    soundEngine.playToolSound('oil_pour');

    const timer = setInterval(() => {
      setLiters((prev) => {
        const next = Math.min(5.0, Number((prev + 0.5).toFixed(1)));
        if (next >= 5.0) {
          clearInterval(timer);
          setIsPouring(false);
          soundEngine.playToolSound('place');
        }
        return next;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(timer);
      setIsPouring(false);
    }, 1200);
  };

  const handlePurgeAir = () => {
    soundEngine.playBlowOff();
    setIsPurged(true);
  };

  const handleDrain = () => {
    soundEngine.playToolSound('oil_pour');
    setLiters(0);
    setIsPurged(false);
  };

  const isLevelIdeal = liters >= 4.5 && liters <= 5.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#161b22] border-2 border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#21262d] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#30363d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-racing font-bold text-base sm:text-lg text-white tracking-wide">
                Circuito de Refrigeración (5.0 L)
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400">
                Llenado de Refrigerante OAT & Purga de Aire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Visual Tank */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 flex flex-col items-center justify-between">
              <span className="text-xs font-mono-tech text-gray-400 mb-2">Vaso de Expansión</span>

              {/* Tank Graphic */}
              <div className="w-28 h-40 sm:h-44 bg-[#1e293b] rounded-2xl border-2 border-gray-600 relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
                {/* Yellow safety cap on top */}
                <button
                  type="button"
                  onClick={() => setCapOpen(!capOpen)}
                  className={`absolute top-1 left-1/2 -translate-x-1/2 min-w-[50px] min-h-[26px] px-2 rounded-md border text-[8px] font-bold font-mono-tech flex items-center justify-center cursor-pointer transition-all ${
                    capOpen
                      ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                      : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}
                  title="Tapón presurizado (1.2 bar)"
                >
                  {capOpen ? 'ABIERTO' : 'CERRADO'}
                </button>

                {/* Coolant Liquid */}
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-xl transition-all duration-300 relative"
                  style={{ height: `${(liters / 5.0) * 82}%` }}
                >
                  {isPouring && (
                    <div className="absolute inset-0 bg-white/25 animate-pulse" />
                  )}
                </div>

                {/* Level ticks */}
                <div className="absolute right-1 top-8 text-[8px] font-mono-tech text-emerald-300 font-bold">
                  MAX 5.0L
                </div>
                <div className="absolute right-1 bottom-6 text-[8px] font-mono-tech text-red-400 font-bold">
                  MIN 2.0L
                </div>
              </div>

              <div className="text-center mt-2">
                <span className="text-2xl font-racing font-bold text-emerald-400">
                  {liters.toFixed(1)} / 5.0 L
                </span>
                <span className="text-[10px] text-gray-500 block">Capacidad oficial circuito</span>
              </div>
            </div>

            {/* Circuit Telemetry & Purge Box */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-mono-tech text-gray-400 block mb-2">
                  Estado del Circuito
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-300 border-b border-gray-800 pb-1.5">
                    <span>Nivel:</span>
                    <strong
                      className={
                        isLevelIdeal
                          ? 'text-emerald-400'
                          : liters === 0
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }
                    >
                      {isLevelIdeal ? '5.0 L (Óptimo)' : liters === 0 ? 'Vacío (0.0 L)' : `${liters.toFixed(1)} L`}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-gray-300 border-b border-gray-800 pb-1.5">
                    <span>Temp. Ebullición:</span>
                    <strong className="text-cyan-400 font-mono-tech">128 °C</strong>
                  </div>

                  <div className="flex justify-between items-center text-gray-300 border-b border-gray-800 pb-1.5">
                    <span>Purga de Aire:</span>
                    <strong className={isPurged ? 'text-emerald-400' : 'text-amber-400'}>
                      {isPurged ? 'Purgado OK' : 'Pendiente'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Purge button */}
              <button
                onClick={handlePurgeAir}
                disabled={liters < 3.0 || isPurged}
                className="w-full min-h-[44px] py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/40 disabled:opacity-40 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                {isPurged ? 'Aire Purgado (Sin Bolsas)' : 'Purgar Tornillo Sangrado'}
              </button>
            </div>
          </div>

          {/* Cursor Slider to Raise / Lower Coolant Level */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Cursor de Nivel Deseado (Subir / Bajar)
              </span>
              <span className="font-mono-tech text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {liters.toFixed(1)} L / 5.0 L
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSliderChange(liters - 0.2)}
                disabled={liters <= 0}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                title="Bajar nivel (-0.2 L)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min={0}
                max={5.0}
                step={0.1}
                value={liters}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full accent-emerald-500 h-3 bg-gray-700 rounded-lg cursor-pointer"
                title="Mover cursor para subir o bajar el nivel de refrigerante deseado"
              />

              <button
                type="button"
                onClick={() => handleSliderChange(liters + 0.2)}
                disabled={liters >= 5.0}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                title="Subir nivel (+0.2 L)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono-tech pt-0.5">
              <span>0.0 L (Circuito Seco)</span>
              <button
                type="button"
                onClick={() => handleSliderChange(5.0)}
                className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer font-bold px-1.5 py-0.5 rounded hover:bg-emerald-500/10 transition-colors"
              >
                Fijar en 5.0 L (Nivel Ideal)
              </button>
              <span>5.0 L (Capacidad Máx)</span>
            </div>
          </div>

          {/* Controls: Pour & Drain */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={handlePour}
              disabled={isPouring || liters >= 5.0}
              className="flex-1 min-h-[46px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Droplet className="w-4 h-4 shrink-0" />
              <span>{isPouring ? 'Llenando Circuito...' : 'Verter Refrigerante OAT (hasta 5.0 L)'}</span>
            </button>

            <button
              onClick={handleDrain}
              disabled={liters === 0}
              className="min-h-[44px] py-2.5 sm:py-3 px-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-700 active:scale-98"
              title="Drenar circuito a 0 L"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Vaciar</span>
            </button>
          </div>

          {/* Mechanic advice */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isLevelIdeal
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/30 border-red-500/40 text-red-300'
            }`}
          >
            {isLevelIdeal ? (
              <p>
                <strong>¡Nivel Nominal de 5.0 Litros Alcanzado!</strong> Las camisas de los 4 cilindros y la culata están sumergidas en fluido térmico. El motor disipará el calor de combustión manteniéndose en los 88°C ideales.
              </p>
            ) : (
              <p>
                <AlertTriangle className="w-4 h-4 inline mr-1 text-red-400" />
                <strong>¡Alerta de Temperatura!</strong> Sin los 5.0 Litros de refrigerante, al arrancar en el banco el motor superará los 120°C en menos de un minuto, quemando la junta de culata (Código OBD-II P0217).
              </p>
            )}
          </div>

          {/* Confirm */}
          <button
            onClick={() => {
              onSaveCoolantLevel(liters);
              onClose();
            }}
            className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Confirmar Refrigerante ({liters.toFixed(1)} L) y Volver al Banco</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useCallback } from 'react';
import { Gauge, Flame, Zap, Wind, Sliders } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface AcceleratorPedalProps {
  throttle: number; // 0 to 1
  onThrottleChange: (throttle: number) => void;
  onThrottleRelease: () => void;
  rpm: number;
  engineState: 'stopped' | 'cranking' | 'running' | 'failed';
  boostBar?: number;
  oilPressurePsi?: number;
}

export const AcceleratorPedal: React.FC<AcceleratorPedalProps> = ({
  throttle,
  onThrottleChange,
  onThrottleRelease,
  rpm,
  engineState,
  boostBar = 0,
}) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const pedalBoxRef = useRef<HTMLDivElement | null>(null);

  const isRunning = engineState === 'running';

  // Calculate throttle percentage from pointer Y position
  const calculateThrottleFromPointer = useCallback(
    (clientY: number) => {
      if (!pedalBoxRef.current || !isRunning) return;
      const rect = pedalBoxRef.current.getBoundingClientRect();
      const relY = clientY - rect.top;
      // Proportional travel: 0.2 min on touch to 1.0 full
      const normalized = Math.max(0.2, Math.min(1.0, relY / (rect.height * 0.85)));
      onThrottleChange(normalized);
    },
    [isRunning, onThrottleChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isRunning) {
      soundEngine.playToolSound('key_click');
      return;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    isDraggingRef.current = true;
    setIsPressed(true);
    calculateThrottleFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !isRunning) return;
    calculateThrottleFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // safe fallback
      }
      isDraggingRef.current = false;
      setIsPressed(false);
      onThrottleRelease();
    }
  };

  // Quick rev blip (Golpe de Gas)
  const handleQuickBlip = () => {
    if (!isRunning) return;
    setIsPressed(true);
    onThrottleChange(0.78);
    setTimeout(() => {
      onThrottleRelease();
      setIsPressed(false);
    }, 450);
  };

  // Full stomp (WOT 100%)
  const handleWotStomp = () => {
    if (!isRunning) return;
    setIsPressed(true);
    onThrottleChange(1.0);
  };

  // Butterfly valve angle (0° to 90°)
  const butterflyAngle = Math.round(throttle * 90);

  // Tachometer color
  const getRpmColor = () => {
    if (!isRunning) return 'text-gray-400';
    if (rpm < 3000) return 'text-cyan-400';
    if (rpm < 5500) return 'text-amber-400';
    return 'text-red-500 animate-pulse';
  };

  // Shift light active (>6400 RPM)
  const isShiftLight = isRunning && rpm >= 6400;

  // Mechanical stroke travel displacement (0 to 8px)
  const travelPx = Math.round(throttle * 8);

  // Angle for the integrated mini tachometer needle (-130° at 0 RPM to +130° at 7,200 RPM)
  const needleAngle = -130 + Math.min(1, Math.max(0, rpm / 7200)) * 260;

  return (
    <div className="w-full max-w-full bg-[#0a0f18] border border-amber-500/40 rounded-xl p-2 sm:p-3 shadow-lg relative select-none overflow-hidden">
      {/* Top compact status bar */}
      <div className="flex items-center justify-between gap-1.5 border-b border-gray-800 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className={`w-3 h-3 ${isRunning && throttle > 0.2 ? 'text-red-500 animate-bounce' : ''}`} />
          </div>
          <span className="font-racing font-bold text-xs sm:text-sm text-white tracking-wide uppercase truncate">
            Pedal y Tacómetro Integrado
          </span>
          <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-red-600/20 text-red-300 border border-red-500/30 shrink-0">
            2.0L Turbo
          </span>
        </div>

        {/* Shift light & state badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isShiftLight && (
            <span className="text-[9px] font-racing font-black px-1.5 py-0.5 rounded bg-blue-500 text-white animate-ping">
              SHIFT
            </span>
          )}
          <span
            className={`text-[9px] font-mono-tech px-2 py-0.5 rounded font-bold ${
              isRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {isRunning ? 'EN MARCHA' : 'PARADO'}
          </span>
        </div>
      </div>

      {/* Main Row: High-Visibility Tachometer Gauge + Compact Pedal + Quick Rev Buttons */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* COL 1 (5 cols): High-Visibility Integrated Tachometer & RPM Readout */}
        <div className="col-span-6 sm:col-span-5 bg-[#070b12] border border-gray-800 rounded-xl p-1.5 sm:p-2 flex items-center gap-2 relative overflow-hidden shadow-inner">
          {/* Mini Analog Dial Gauge (SVG) */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1f2937"
                strokeWidth="8"
                strokeDasharray="188 62"
                strokeDashoffset="-31"
              />
              {/* Active RPM arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={rpm > 6400 ? '#ef4444' : rpm > 4000 ? '#f59e0b' : '#38bdf8'}
                strokeWidth="8"
                strokeDasharray={`${Math.min(188, (rpm / 7200) * 188)} 251`}
                strokeDashoffset="-31"
                className="transition-all duration-75"
              />
            </svg>

            {/* Needle in Center */}
            <div
              className="absolute w-1 h-8 sm:h-9 bg-red-500 origin-bottom rounded-full transition-transform duration-75 shadow-[0_0_6px_#ef4444]"
              style={{
                transform: `rotate(${needleAngle}deg)`,
                bottom: '50%',
              }}
            />
            {/* Center Cap */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-gray-900 border-2 border-gray-600 z-10 flex items-center justify-center shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>

            {/* Redline Indicator text */}
            <span className="absolute bottom-1 text-[7px] font-mono-tech text-red-500 font-bold">
              7.2k
            </span>
          </div>

          {/* RPM Digital HUD & Telemetry Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-[9px] font-racing text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-400 shrink-0" />
              Régimen RPM
            </span>
            {/* Large High-Contrast Digital RPM readout that fits cleanly */}
            <div className={`font-mono-tech font-extrabold text-sm sm:text-lg leading-tight tracking-tight ${getRpmColor()}`}>
              {Math.round(rpm)} <span className="text-[9px] font-sans text-gray-400 font-normal">RPM</span>
            </div>

            {/* Turbo Boost & Throttle percentage badges */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono-tech">
              <span className="text-cyan-300 font-bold flex items-center gap-0.5">
                <Wind className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                {boostBar > 0 ? `+${boostBar.toFixed(2)}` : '0.00'}b
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-amber-400 font-bold">
                {Math.round(throttle * 100)}% Gas
              </span>
            </div>
          </div>
        </div>

        {/* COL 2 (3 cols): The Compact Mechanical Accelerator Pedal */}
        <div className="col-span-3 sm:col-span-3 flex justify-center">
          <div
            ref={pedalBoxRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`w-[58px] sm:w-[68px] h-[88px] sm:h-[98px] rounded-xl relative select-none touch-none cursor-pointer flex flex-col items-center justify-between p-1 border transition-all ${
              !isRunning
                ? 'opacity-60 cursor-not-allowed border-gray-700 bg-gray-900/60'
                : isPressed
                ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] bg-black/90'
                : 'border-amber-500/60 hover:border-amber-400 bg-[#070b12] shadow-md'
            }`}
            title={isRunning ? 'Presiona o arrastra para acelerar' : 'Arranca el motor primero'}
          >
            {/* Top Twin Springs */}
            <div className="w-full flex items-center justify-around px-1 pt-0.5">
              <svg width="18" height="8" viewBox="0 0 18 8" className="text-gray-400">
                <path
                  d="M1,4 Q3,1 5,4 T9,4 T13,4 L17,4"
                  fill="none"
                  stroke={throttle > 0.3 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="1.8"
                  style={{ transform: `scaleY(${1 - throttle * 0.4})`, transformOrigin: 'center' }}
                />
              </svg>
              <div className="w-1 h-1.5 bg-gray-400 rounded-xs" />
              <svg width="18" height="8" viewBox="0 0 18 8" className="text-gray-400">
                <path
                  d="M1,4 Q3,1 5,4 T9,4 T13,4 L17,4"
                  fill="none"
                  stroke={throttle > 0.3 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="1.8"
                  style={{ transform: `scaleY(${1 - throttle * 0.4})`, transformOrigin: 'center' }}
                />
              </svg>
            </div>

            {/* Aluminum Pedal Blade */}
            <div
              className={`w-[48px] sm:w-[56px] h-[58px] sm:h-[66px] rounded-lg relative flex flex-col items-center justify-between p-1 border transition-transform duration-75 ${
                isPressed
                  ? 'bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 border-red-400 shadow-inner'
                  : 'bg-gradient-to-b from-slate-200 via-gray-300 to-slate-400 border-slate-300 shadow-md'
              }`}
              style={{
                transform: `translateY(${travelPx}px) scale(${1 - throttle * 0.03})`,
              }}
            >
              <div className="w-full flex items-center justify-between border-b border-gray-500/40 pb-0.5 px-0.5">
                <span className="text-[6.5px] font-racing font-black text-gray-800">DAKAR</span>
                <span className="text-[6.5px] font-mono-tech font-bold text-red-600">
                  {Math.round(throttle * 100)}%
                </span>
              </div>

              {/* 4 Drilled Rubber Studs */}
              <div className="grid grid-cols-2 gap-1 my-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-gray-500 shadow-inner flex items-center justify-center"
                  >
                    <div
                      className={`w-1 h-1 rounded-full ${
                        throttle > 0.5 ? 'bg-red-500 shadow-[0_0_3px_#ef4444]' : 'bg-gray-600'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="w-full text-center border-t border-gray-500/40 pt-0.5">
                <span className="text-[6.5px] font-racing font-black text-gray-800">GAS</span>
              </div>
            </div>

            {/* Bottom Pivot Pin */}
            <div className="w-full flex items-center justify-between px-1 pt-0.5 border-t border-gray-800">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              <span className="text-[6.5px] font-mono-tech font-bold text-gray-400">
                {isPressed ? 'FONDO' : 'PISAR'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            </div>
          </div>
        </div>

        {/* COL 3 (4 cols): Quick Action Rev Buttons & Fine Slider */}
        <div className="col-span-3 sm:col-span-4 flex flex-col justify-between gap-1.5">
          {/* Quick Rev Blip */}
          <button
            type="button"
            onClick={handleQuickBlip}
            disabled={!isRunning}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 text-black font-racing font-bold text-[10px] sm:text-xs rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
            title="Golpe de acelerador rápido"
          >
            <Zap className="w-3 h-3 text-black shrink-0" />
            <span className="truncate">Golpe Gas</span>
          </button>

          {/* WOT Stomp */}
          <button
            type="button"
            onMouseDown={handleWotStomp}
            onMouseUp={onThrottleRelease}
            onTouchStart={handleWotStomp}
            onTouchEnd={onThrottleRelease}
            disabled={!isRunning}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-racing font-bold text-[10px] sm:text-xs rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
            title="Mantener para acelerar al 100%"
          >
            <Flame className="w-3 h-3 text-white shrink-0" />
            <span className="truncate">A Fondo (100%)</span>
          </button>

          {/* Compact Throttle Slider */}
          <div className="w-full bg-[#070b12] border border-gray-800 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
            <Sliders className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={throttle}
              disabled={!isRunning}
              onChange={(e) => onThrottleChange(Number(e.target.value))}
              onMouseUp={onThrottleRelease}
              onTouchEnd={onThrottleRelease}
              className="w-full accent-red-500 h-1.5 bg-gray-800 rounded cursor-pointer disabled:opacity-40"
              title="Ajuste fino de aceleración"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

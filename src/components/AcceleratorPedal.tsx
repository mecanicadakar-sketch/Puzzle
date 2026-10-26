import React, { useState, useRef, useCallback } from 'react';
import { Gauge, Flame, Zap, Wind, Activity, Sliders } from 'lucide-react';
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
  oilPressurePsi = 0,
}) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const pedalBoxRef = useRef<HTMLDivElement | null>(null);

  const isRunning = engineState === 'running';

  // Pointer event handlers for pedal press & drag
  const calculateThrottleFromPointer = useCallback(
    (clientY: number) => {
      if (!pedalBoxRef.current || !isRunning) return;
      const rect = pedalBoxRef.current.getBoundingClientRect();
      const relY = clientY - rect.top;
      // Proportional press depth (min 0.2, max 1.0)
      const normalized = Math.max(0.2, Math.min(1.0, relY / (rect.height * 0.9)));
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
    onThrottleChange(0.75);
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

  // Butterfly valve angle: 0° idle, 90° wide open
  const butterflyAngle = Math.round(throttle * 90);

  // Tachometer color based on RPM
  const getRpmColor = () => {
    if (!isRunning) return 'text-gray-400';
    if (rpm < 3000) return 'text-cyan-400';
    if (rpm < 5500) return 'text-amber-400';
    return 'text-red-500 animate-pulse';
  };

  // Pedal travel displacement (0px idle -> 9px pressed)
  const travelPx = Math.round(throttle * 9);

  return (
    <div className="w-full bg-[#0d121c] border border-amber-500/40 rounded-xl p-2.5 sm:p-3 shadow-lg relative select-none">
      {/* Top compact bar: title + quick indicators */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className={`w-3.5 h-3.5 ${isRunning && throttle > 0.2 ? 'text-red-500 animate-bounce' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-racing font-bold text-xs sm:text-sm text-white tracking-wide uppercase truncate">
                Pedal de Acelerador
              </span>
              <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                2.0L Turbo
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate">
              {isRunning
                ? '¡Motor en marcha! Mantén pulsado el pedal o los botones para acelerar'
                : 'Arranca el motor (START) para acelerar'}
            </p>
          </div>
        </div>

        {/* Live Digital Telemetry Badges */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono-tech">
          {/* Throttle % */}
          <div className="bg-[#070b12] border border-gray-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <span className="text-gray-400 text-[9px] uppercase font-bold">Gas:</span>
            <span
              className={`font-racing font-bold text-xs ${
                throttle > 0.8 ? 'text-red-400 animate-pulse' : throttle > 0.3 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {Math.round(throttle * 100)}%
            </span>
          </div>

          {/* RPM */}
          <div className="bg-[#070b12] border border-gray-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span className={`font-racing font-bold text-xs ${getRpmColor()}`}>
              {Math.round(rpm)} <span className="text-[8px] font-sans font-normal opacity-70">RPM</span>
            </span>
          </div>

          {/* Boost */}
          <div className="hidden sm:flex bg-[#070b12] border border-gray-800 px-2 py-0.5 rounded-lg items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span className="font-mono-tech font-bold text-cyan-300 text-xs">
              {boostBar > 0 ? `+${boostBar.toFixed(2)}` : '0.00'} Bar
            </span>
          </div>
        </div>
      </div>

      {/* Main Row: Compact 3D-Look Racing Pedal + Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* COMPACT MECHANICAL PEDAL (Dimensions tuned: ~72px wide, ~105px tall) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div
            ref={pedalBoxRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`w-[74px] h-[108px] rounded-xl relative select-none touch-none cursor-pointer flex flex-col items-center justify-between p-1.5 border transition-all ${
              !isRunning
                ? 'opacity-70 cursor-not-allowed border-gray-700 bg-gray-900/60'
                : isPressed
                ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-black/80'
                : 'border-amber-500/60 hover:border-amber-400 bg-[#070b12] shadow-md'
            }`}
            title={isRunning ? 'Presiona o arrastra para acelerar' : 'Arranca el motor primero'}
          >
            {/* Top Twin Compression Springs */}
            <div className="w-full flex items-center justify-around px-2 pt-0.5">
              <svg width="22" height="10" viewBox="0 0 22 10" className="text-gray-400">
                <path
                  d="M1,5 Q3.5,1 6,5 T11,5 T16,5 L21,5"
                  fill="none"
                  stroke={throttle > 0.3 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="2"
                  style={{
                    transform: `scaleY(${1 - throttle * 0.4})`,
                    transformOrigin: 'center',
                  }}
                />
              </svg>
              <div className="w-1.5 h-2 bg-gradient-to-b from-gray-300 to-gray-600 rounded-sm" />
              <svg width="22" height="10" viewBox="0 0 22 10" className="text-gray-400">
                <path
                  d="M1,5 Q3.5,1 6,5 T11,5 T16,5 L21,5"
                  fill="none"
                  stroke={throttle > 0.3 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="2"
                  style={{
                    transform: `scaleY(${1 - throttle * 0.4})`,
                    transformOrigin: 'center',
                  }}
                />
              </svg>
            </div>

            {/* Aluminum Racing Pedal Blade */}
            <div
              className={`w-[60px] h-[72px] rounded-lg relative flex flex-col items-center justify-between p-1 border transition-transform duration-75 ${
                isPressed
                  ? 'bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 border-red-400 shadow-inner'
                  : 'bg-gradient-to-b from-slate-200 via-gray-300 to-slate-400 border-slate-300 shadow-md'
              }`}
              style={{
                transform: `translateY(${travelPx}px) scale(${1 - throttle * 0.04})`,
              }}
            >
              {/* Brand Engraving */}
              <div className="w-full flex items-center justify-between border-b border-gray-500/40 pb-0.5 px-0.5">
                <span className="text-[7px] font-racing font-extrabold tracking-tight text-gray-800">
                  DAKAR
                </span>
                <span className="text-[7px] font-mono-tech font-bold text-red-600">
                  {Math.round(throttle * 100)}%
                </span>
              </div>

              {/* 4 Drilled Anti-Slip Grip Studs */}
              <div className="grid grid-cols-2 gap-1.5 my-auto">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full bg-[#111827] border border-gray-500 shadow-inner flex items-center justify-center"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        throttle > 0.5 ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' : 'bg-gray-600'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Label */}
              <div className="w-full text-center border-t border-gray-500/40 pt-0.5">
                <span className="text-[7px] font-racing font-black text-gray-800 tracking-wider">
                  GAS
                </span>
              </div>
            </div>

            {/* Bottom Pivot Bracket */}
            <div className="w-full flex items-center justify-between px-1 pt-0.5 border-t border-gray-800">
              <div className="w-2 h-2 rounded-full bg-gray-600 border border-gray-400" />
              <span className="text-[7px] font-mono-tech font-bold text-gray-400 uppercase">
                {isPressed ? 'PISADO' : 'PISAR'}
              </span>
              <div className="w-2 h-2 rounded-full bg-gray-600 border border-gray-400" />
            </div>
          </div>
        </div>

        {/* Right Section: Telemetry Bars & Touch Action Buttons */}
        <div className="flex-1 w-full flex flex-col justify-between gap-2">
          {/* LED Throttle Segment Bar */}
          <div className="bg-[#070b12] border border-gray-800 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-racing">
              <span className="text-gray-300 flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400" />
                Mariposa de Admisión
              </span>
              <span className="text-amber-300 font-mono-tech font-bold text-[10px]">
                {butterflyAngle}° / 90° ({Math.round(throttle * 100)}%)
              </span>
            </div>

            {/* Segmented meter */}
            <div className="w-full h-3 bg-gray-900 rounded p-0.5 flex gap-0.5 border border-gray-800">
              {Array.from({ length: 12 }).map((_, idx) => {
                const step = (idx + 1) / 12;
                const isActive = throttle >= step - 0.05;
                const isHigh = idx >= 9;
                const isMid = idx >= 5;

                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-xs transition-colors duration-75 ${
                      isActive
                        ? isHigh
                          ? 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                          : isMid
                          ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]'
                          : 'bg-emerald-400 shadow-[0_0_3px_#10b981]'
                        : 'bg-gray-800/60'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-[9px] font-mono-tech text-gray-500">
              <span>0% Ralentí (950 RPM)</span>
              <span>50% (3,800 RPM)</span>
              <span className="text-red-400 font-bold">100% (7,200 RPM)</span>
            </div>
          </div>

          {/* Quick Rev Buttons for fast finger control */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {/* Quick Rev Blip */}
            <button
              type="button"
              onClick={handleQuickBlip}
              disabled={!isRunning}
              className="py-1.5 px-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 text-black font-racing font-bold text-[11px] rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
              title="Golpe de acelerador rápido"
            >
              <Zap className="w-3 h-3 text-black shrink-0" />
              <span>Golpe de Gas</span>
            </button>

            {/* WOT Stomp */}
            <button
              type="button"
              onMouseDown={handleWotStomp}
              onMouseUp={onThrottleRelease}
              onTouchStart={handleWotStomp}
              onTouchEnd={onThrottleRelease}
              disabled={!isRunning}
              className="py-1.5 px-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-racing font-bold text-[11px] rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
              title="Mantener presionado para acelerar al 100%"
            >
              <Flame className="w-3 h-3 text-white shrink-0" />
              <span>A Fondo (100%)</span>
            </button>

            {/* Continuous Range Slider */}
            <div className="col-span-2 sm:col-span-1 bg-[#070b12] border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-cyan-400 shrink-0" />
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
                className="w-full accent-red-500 h-2 bg-gray-800 rounded cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

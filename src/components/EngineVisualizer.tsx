import React, { useEffect, useRef, useState } from 'react';
import { EnginePart, EnginePartId } from '../types/engine';
import { ENGINE_PARTS } from '../data/engineParts';
import { Layers, Eye, Cpu, Activity, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EngineVisualizerProps {
  installedPartIds: EnginePartId[];
  onSelectPart: (part: EnginePart) => void;
  activePartId?: EnginePartId | null;
  isRunning?: boolean;
  isCranking?: boolean;
  rpm?: number;
  timingOffsetTeeth?: number;
  onOpenTimingModal?: () => void;
}

export const EngineVisualizer: React.FC<EngineVisualizerProps> = ({
  installedPartIds,
  onSelectPart,
  activePartId,
  isRunning = false,
  isCranking = false,
  rpm = 0,
  timingOffsetTeeth = 0,
  onOpenTimingModal,
}) => {
  const [viewMode, setViewMode] = useState<'assembly' | 'cutaway'>('assembly');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crankAngleRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const isInstalled = (id: EnginePartId) => installedPartIds.includes(id);

  // Animate dynamic 4-stroke cutaway on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Update crank angle based on current RPM
      const currentRpm = isRunning ? Math.max(900, rpm) : isCranking ? 250 : 0;
      if (currentRpm > 0) {
        // RPS * 360 * delta
        const degreesPerSec = (currentRpm / 60) * 360;
        crankAngleRef.current = (crankAngleRef.current + degreesPerSec * delta) % 720;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Engine Block cross section
      const blockX = 50;
      const blockY = 70;
      const blockWidth = width - 100;
      const blockHeight = height - 120;
      const numCylinders = 4;
      const cylSpacing = blockWidth / numCylinders;
      const cylRadius = cylSpacing * 0.32;
      const strokeLen = 42;
      const rodLen = 78;
      const crankCenterY = blockY + blockHeight - 45;

      // Draw Sump/Cárter if installed
      if (isInstalled('oil_pan')) {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(blockX - 10, blockY + blockHeight - 15, blockWidth + 20, 35, [0, 0, 16, 16]);
        ctx.fill();
        ctx.stroke();

        // Oil level inside sump
        if (isInstalled('oil_fluid')) {
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.roundRect(blockX - 8, blockY + blockHeight + 2, blockWidth + 16, 18, [0, 0, 12, 12]);
          ctx.fill();
        }
      }

      // Engine block casing
      if (isInstalled('crankcase_block')) {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY + 50, blockWidth, blockHeight - 50, 10);
        ctx.fill();
        ctx.stroke();
      } else {
        // Ghost outline of empty engine mounting stand awaiting the cylinder block
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.roundRect(blockX, blockY + 50, blockWidth, blockHeight - 50, 10);
        ctx.stroke();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = 'bold 13px "Racing Sans One", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BANCO VACÍO - MONTA EL BLOQUE DE CILINDROS', width / 2, blockY + (blockHeight / 2) + 20);
        ctx.restore();
      }

      // Cylinder head if installed
      if (isInstalled('cylinder_head')) {
        ctx.fillStyle = 'rgba(51, 65, 85, 0.9)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(blockX - 5, blockY - 5, blockWidth + 10, 55, [12, 12, 4, 4]);
        ctx.fill();
        ctx.stroke();

        // Head gasket line
        if (isInstalled('head_gasket')) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(blockX - 5, blockY + 50);
          ctx.lineTo(blockX + blockWidth + 5, blockY + 50);
          ctx.stroke();
        }
      }

      // Valve cover
      if (isInstalled('valve_cover')) {
        ctx.fillStyle = '#991b1b';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY - 32, blockWidth, 26, [14, 14, 2, 2]);
        ctx.fill();
        ctx.stroke();
      }

      // Draw 4 Cylinders with Pistons, Rods, Valves, and Ignition
      const crankAngle = crankAngleRef.current; // 0 to 720 degrees
      // Inline 4 firing order: 1 - 3 - 4 - 2
      // Crankshaft throws: Cyl 1 & 4 are at 0°, Cyl 2 & 3 are at 180°
      const cylAngles = [
        crankAngle, // Cyl 1
        (crankAngle + 180) % 720, // Cyl 2
        (crankAngle + 180) % 720, // Cyl 3
        crankAngle, // Cyl 4
      ];

      for (let i = 0; i < numCylinders; i++) {
        const cylX = blockX + cylSpacing * i + cylSpacing * 0.5;
        const currentAngleRad = ((cylAngles[i] % 360) * Math.PI) / 180;

        // Draw cylinder bore sleeve
        if (isInstalled('crankcase_block')) {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(cylX - cylRadius, blockY + 30, cylRadius * 2, blockHeight - 85);
          ctx.fill();
          ctx.stroke();

          // Cylinder wall cross-hatch hone marks
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1;
          for (let yHone = blockY + 40; yHone < blockY + blockHeight - 65; yHone += 12) {
            ctx.beginPath();
            ctx.moveTo(cylX - cylRadius + 2, yHone);
            ctx.lineTo(cylX + cylRadius - 2, yHone + 8);
            ctx.stroke();
          }
        }

        // Piston & Crank Kinematics
        // Crank pin position
        const crankPinX = cylX + Math.sin(currentAngleRad) * strokeLen * 0.5;
        const crankPinY = crankCenterY - Math.cos(currentAngleRad) * strokeLen * 0.5;

        // Piston crown position calculated via connecting rod trigonometry
        const crankOffset = Math.sin(currentAngleRad) * strokeLen * 0.5;
        const rodVert = Math.sqrt(Math.max(0, rodLen * rodLen - crankOffset * crankOffset));
        const pistonY = crankPinY - rodVert;

        // Crankshaft counterweights & journals
        if (isInstalled('crankshaft')) {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(cylX, crankCenterY, 14, 0, Math.PI * 2);
          ctx.stroke();

          // Crank web
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(cylX, crankCenterY);
          ctx.lineTo(crankPinX, crankPinY);
          ctx.stroke();

          // Counterweight lobe
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(
            cylX - Math.sin(currentAngleRad) * 12,
            crankCenterY + Math.cos(currentAngleRad) * 12,
            12,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Connecting Rod
        if (isInstalled('pistons_rods')) {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(crankPinX, crankPinY);
          ctx.lineTo(cylX, pistonY);
          ctx.stroke();

          // Rod bolts / cap
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(crankPinX, crankPinY, 5, 0, Math.PI * 2);
          ctx.fill();

          // Piston body
          const pistonWidth = cylRadius * 1.9;
          const pistonHeight = 28;
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cylX - pistonWidth * 0.5, pistonY - pistonHeight, pistonWidth, pistonHeight, 3);
          ctx.fill();
          ctx.stroke();

          // Piston rings
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cylX - pistonWidth * 0.5, pistonY - pistonHeight + 6);
          ctx.lineTo(cylX + pistonWidth * 0.5, pistonY - pistonHeight + 6);
          ctx.moveTo(cylX - pistonWidth * 0.5, pistonY - pistonHeight + 11);
          ctx.lineTo(cylX + pistonWidth * 0.5, pistonY - pistonHeight + 11);
          ctx.stroke();

          // Wrist pin (bulón)
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cylX, pistonY - 10, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4-Stroke Cycle state for this cylinder (0 to 720 degrees)
        // 0°-180°: Power/Combustion (Pistón baja con fuego)
        // 180°-360°: Exhaust (Pistón sube con válvula de escape abierta)
        // 360°-540°: Intake (Pistón baja con válvula de admisión abierta y aire fresco)
        // 540°-720°: Compression (Pistón sube con válvulas cerradas)
        const cycleDeg = cylAngles[i];

        // Draw Valves
        if (isInstalled('cylinder_head')) {
          const isIntakeOpen = cycleDeg >= 360 && cycleDeg <= 540;
          const isExhaustOpen = cycleDeg >= 180 && cycleDeg <= 360;

          // Intake valve (Left)
          const intakeOffset = isIntakeOpen ? 6 : 0;
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(cylX - 18, blockY + 20 + intakeOffset, 4, 18);
          ctx.beginPath();
          ctx.ellipse(cylX - 16, blockY + 38 + intakeOffset, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Exhaust valve (Right)
          const exhaustOffset = isExhaustOpen ? 6 : 0;
          ctx.fillStyle = '#f97316';
          ctx.fillRect(cylX + 14, blockY + 20 + exhaustOffset, 4, 18);
          ctx.beginPath();
          ctx.ellipse(cylX + 16, blockY + 38 + exhaustOffset, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spark Plug & Combustion Chamber Flash
        if (isInstalled('spark_plugs')) {
          // Spark plug body
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(cylX - 3, blockY - 12, 6, 26);
          // Ceramic ribbing
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cylX - 5, blockY - 18, 10, 8);

          // Combustion Flash when engine is running and cylinder is at 0°-70° (Power stroke)
          if ((isRunning || isCranking) && cycleDeg >= 0 && cycleDeg <= 70) {
            // Intense glowing flame explosion in the chamber!
            const flameIntensity = (70 - cycleDeg) / 70;
            const grad = ctx.createRadialGradient(
              cylX,
              blockY + 36,
              2,
              cylX,
              blockY + 40,
              cylRadius * 1.5
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(0.2, 'rgba(251, 191, 36, 0.9)');
            grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.8)');
            grad.addColorStop(1, 'rgba(185, 28, 28, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(cylX, blockY + 40, cylRadius * 0.95, 22 * flameIntensity, 0, 0, Math.PI * 2);
            ctx.fill();

            // Spark plug electric arc
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cylX, blockY + 16);
            ctx.lineTo(cylX + (Math.random() - 0.5) * 6, blockY + 26);
            ctx.stroke();
          }
        }

        // Cylinder label and cycle phase
        if (isInstalled('crankcase_block')) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`CIL #${i + 1}`, cylX, blockY + blockHeight - 68);

          let phaseText = 'PARADO';
          let phaseColor = '#64748b';
          if (isRunning || isCranking) {
            if (cycleDeg < 180) {
              phaseText = 'EXP';
              phaseColor = '#ef4444';
            } else if (cycleDeg < 360) {
              phaseText = 'ESC';
              phaseColor = '#f97316';
            } else if (cycleDeg < 540) {
              phaseText = 'ADM';
              phaseColor = '#38bdf8';
            } else {
              phaseText = 'COM';
              phaseColor = '#eab308';
            }
          }
          ctx.fillStyle = phaseColor;
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText(phaseText, cylX, blockY + blockHeight - 55);
        }
      }

      // Draw Turbo if installed
      if (isInstalled('exhaust_turbo')) {
        const turboX = blockX + blockWidth + 15;
        const turboY = blockY + 10;
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(turboX, turboY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Compressor wheel
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(turboX, turboY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Glowing turbine if high RPM
        if (isRunning && rpm > 4000) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(turboX, turboY, 26, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Starter motor if installed
      if (isInstalled('starter_motor')) {
        const starterX = blockX - 25;
        const starterY = crankCenterY - 10;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(starterX - 25, starterY, 28, 22, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.font = '7px sans-serif';
        ctx.fillText('12V', starterX - 11, starterY + 14);
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [installedPartIds, isRunning, isCranking, rpm]);

  return (
    <div className="bg-[#111620]/80 backdrop-blur-md border border-[#2d3748] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Visualizer Header */}
      <div className="bg-[#18202f]/90 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-[#2d3748] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-racing font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2 flex-wrap">
              <span>Motor 2.0L 16V Turbo DOHC</span>
              {isRunning && (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  ENCENDIDO ({Math.round(rpm)} RPM)
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Banco de Montaje |{' '}
              <span className="text-blue-300 font-semibold font-mono-tech">
                {installedPartIds.length}/{ENGINE_PARTS.length} Piezas Instaladas
              </span>
            </p>
          </div>
        </div>

        {/* Header Right Actions: Camshaft Timing Status + View Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Camshaft Timing / Sincronismo Quick Button if timing belt or camshafts installed */}
          {(installedPartIds.includes('timing_belt') || installedPartIds.includes('camshafts')) && onOpenTimingModal && (
            <button
              onClick={onOpenTimingModal}
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1 sm:gap-1.5 border transition-all cursor-pointer shadow-sm ${
                timingOffsetTeeth === 0
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-red-950/80 border-red-500/70 text-red-200 hover:bg-red-900/80 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              }`}
              title="Calibrar punto y sincronismo de árboles de levas"
            >
              {timingOffsetTeeth === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden xs:inline">Levas Caladas</span>
                  <span className="font-mono-tech text-[9px] sm:text-[10px] bg-emerald-900/80 px-1.5 py-0.2 rounded">0° PMS</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="hidden xs:inline">¡Fuera de Punto!</span>
                  <span className="font-mono-tech text-[9px] sm:text-[10px] bg-red-900 px-1.5 py-0.2 rounded">
                    {timingOffsetTeeth > 0 ? `+${timingOffsetTeeth}` : timingOffsetTeeth}T
                  </span>
                </>
              )}
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-0.5 sm:p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setViewMode('assembly')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'assembly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Despiece</span>
            </button>
            <button
              onClick={() => setViewMode('cutaway')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'cutaway'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Corte 4T</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 min-h-[240px] sm:min-h-[320px] lg:min-h-[380px] bg-garage-pattern flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Cutaway Canvas View */}
        <canvas
          ref={canvasRef}
          width={580}
          height={380}
          className={`w-full max-w-[620px] h-auto object-contain transition-opacity duration-300 ${
            viewMode === 'cutaway' ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}
        />

        {/* Exploded / Assembly Layered View */}
        {viewMode === 'assembly' && (
          <div className="w-full max-w-xl h-full flex flex-col items-center justify-center relative py-2 sm:py-4">
            {/* Stand mounting base */}
            <div className="w-40 sm:w-56 h-3 sm:h-4 bg-gray-700 rounded-full mb-1 shadow-md" />
            <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-800 border-x-2 border-gray-600 mb-2" />

            {/* Vertical Part Stacking Cards (Interactive Exploded Layers) */}
            <div className="w-full space-y-1.5 sm:space-y-2 max-h-[420px] overflow-y-auto px-1">
              {ENGINE_PARTS.map((part) => {
                const installed = isInstalled(part.id);
                const isActive = activePartId === part.id;

                return (
                  <div
                    key={part.id}
                    onClick={() => onSelectPart(part)}
                    className={`group relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-[44px] ${
                      installed
                        ? 'bg-[#161f2e] border-blue-500/40 text-gray-200 shadow-sm hover:border-blue-400'
                        : 'bg-[#0e131d]/80 border-dashed border-gray-700/80 text-gray-500 hover:border-blue-500/50 hover:bg-[#131b29]'
                    } ${isActive ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${
                          installed ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-gray-600'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm sm:text-base font-racing font-bold tracking-wide truncate ${
                              installed ? 'text-white' : 'text-gray-400'
                            }`}
                          >
                            {part.name}
                          </span>
                          {installed && (
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-tech border border-emerald-500/30 font-bold">
                              Montado
                            </span>
                          )}
                          {!installed && (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono-tech border border-gray-700">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 truncate mt-0.5">
                          {part.specText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {part.torqueRequiredNm && (
                        <span className="text-xs font-mono-tech text-amber-400 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                          {part.torqueRequiredNm} Nm
                        </span>
                      )}
                      <span className="text-sm text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Telemetry HUD overlay in Cutaway mode */}
        {viewMode === 'cutaway' && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-black/75 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-gray-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-xs font-mono-tech gap-1 sm:gap-2">
            <div className="flex items-center gap-3 text-gray-300 flex-wrap">
              <span>
                ENCENDIDO: <strong className="text-amber-400">1-3-4-2</strong>
              </span>
              <span>
                CIGÜEÑAL: <strong className="text-cyan-400">{Math.round(crankAngleRef.current)}°</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-400 hidden xs:inline">Fases:</span>
              <span className="text-red-400 font-bold">EXP</span>
              <span className="text-orange-400 font-bold">ESC</span>
              <span className="text-blue-400 font-bold">ADM</span>
              <span className="text-yellow-400 font-bold">COM</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

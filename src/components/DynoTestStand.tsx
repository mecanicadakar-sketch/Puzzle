import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { EnginePartId, EngineDiagnosticResult, PartTorquesMap } from '../types/engine';
import { ENGINE_PARTS } from '../data/engineParts';
import { soundEngine } from '../services/soundEngine';
import { AcceleratorPedal } from './AcceleratorPedal';
import {
  Gauge,
  Key,
  Flame,
  AlertOctagon,
  CheckCircle2,
  Wrench,
  Volume2,
  VolumeX,
  Trophy,
  Settings,
  Activity,
  Zap,
  Sparkles,
  Wind,
  ArrowRight,
} from 'lucide-react';

interface DynoTestStandProps {
  installedPartIds: EnginePartId[];
  partTorques: PartTorquesMap;
  timingOffsetTeeth: number;
  oilLevel: number;
  coolantLiters?: number;
  onReturnToWorkshop: () => void;
  onGoToWorkshopFix?: (partId?: EnginePartId, toolModal?: 'timing' | 'torque' | 'oil' | 'coolant') => void;
  onEngineStartedSuccessfully: () => void;
  onEngineFailedStart: () => void;
  onOpenScorecard: () => void;
  elapsedSeconds?: number;
  currentScore?: number;
  onOpenTimingModal?: () => void;
}

function drawDynoEngineCutaway(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  crankAngle: number,
  currentRpm: number,
  engineState: 'stopped' | 'cranking' | 'running' | 'failed',
  boostBar: number,
  installedPartIds: EnginePartId[]
) {
  const isInstalled = (id: EnginePartId) => installedPartIds.includes(id);

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Vibration shake when high RPM
  if (engineState === 'running' && currentRpm > 3600) {
    const shakeIntensity = ((currentRpm - 3600) / 3600) * 2.5;
    const sx = (Math.random() - 0.5) * shakeIntensity;
    const sy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(sx, sy);
  }

  // Background
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, width, height);

  // Tech grid lines
  ctx.strokeStyle = '#141d2b';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Engine block geometry
  const blockX = 80;
  const blockY = 44;
  const blockWidth = width - 180;
  const blockHeight = height - 76;
  const numCylinders = 4;
  const cylSpacing = blockWidth / numCylinders;
  const cylRadius = Math.min(32, cylSpacing * 0.35);
  const strokeLen = 42;
  const rodLen = 76;
  const crankCenterY = blockY + blockHeight - 24;

  // 1. Sump / Cárter
  if (isInstalled('oil_pan')) {
    ctx.fillStyle = '#111827';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(blockX - 12, blockY + blockHeight - 6, blockWidth + 24, 26, [0, 0, 12, 12]);
    ctx.fill();
    ctx.stroke();

    if (isInstalled('oil_fluid')) {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(blockX - 10, blockY + blockHeight + 2, blockWidth + 20, 14, [0, 0, 10, 10]);
      ctx.fill();
    }
  }

  // 2. Engine Block casing
  if (isInstalled('crankcase_block')) {
    ctx.fillStyle = 'rgba(23, 32, 48, 0.9)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY + 36, blockWidth, blockHeight - 40, 8);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Cylinder Head
  if (isInstalled('cylinder_head')) {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(blockX - 6, blockY - 2, blockWidth + 12, 40, [10, 10, 2, 2]);
    ctx.fill();
    ctx.stroke();

    if (isInstalled('head_gasket')) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(blockX - 6, blockY + 38);
      ctx.lineTo(blockX + blockWidth + 6, blockY + 38);
      ctx.stroke();
    }
  }

  // 4. Valve cover
  if (isInstalled('valve_cover')) {
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(blockX - 2, blockY - 22, blockWidth + 4, 20, [8, 8, 2, 2]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fecaca';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('2.0L 16V TURBO DOHC • 1-3-4-2', blockX + 16, blockY - 9);
  }

  // Firing order throw offsets in degrees (720° cycle):
  // Cyl 1: 0°, Cyl 3: 180°, Cyl 4: 360°, Cyl 2: 540°
  const cylCycleOffsets = [0, 540, 180, 360];
  // Crank throws: 1 & 4 at 0°, 2 & 3 at 180°
  const crankThrowOffsets = [0, 180, 180, 0];

  // 5. Cylinders, Pistons, Rods, Crankshaft
  for (let i = 0; i < numCylinders; i++) {
    const cylX = blockX + cylSpacing * i + cylSpacing * 0.5;
    const cycleDeg = (crankAngle + cylCycleOffsets[i]) % 720;
    const throwDeg = (crankAngle + crankThrowOffsets[i]) % 360;
    const throwRad = (throwDeg * Math.PI) / 180;

    // Cylinder sleeve
    if (isInstalled('crankcase_block')) {
      ctx.fillStyle = '#090d14';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(cylX - cylRadius, blockY + 22, cylRadius * 2, blockHeight - 55);
      ctx.fill();
      ctx.stroke();

      // Honing cross marks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let yH = blockY + 32; yH < blockY + blockHeight - 40; yH += 10) {
        ctx.beginPath();
        ctx.moveTo(cylX - cylRadius + 2, yH);
        ctx.lineTo(cylX + cylRadius - 2, yH + 6);
        ctx.stroke();
      }
    }

    // Kinematics
    const crankPinX = cylX + Math.sin(throwRad) * (strokeLen * 0.5);
    const crankPinY = crankCenterY - Math.cos(throwRad) * (strokeLen * 0.5);
    const offset = Math.sin(throwRad) * (strokeLen * 0.5);
    const rodVert = Math.sqrt(Math.max(0, rodLen * rodLen - offset * offset));
    const pistonPinY = crankPinY - rodVert;

    // Combustion explosion at TDC (between 0 and 50 deg in cycle)
    const isCombustion = cycleDeg >= 0 && cycleDeg <= 50 && (engineState === 'running' || engineState === 'cranking');
    if (isCombustion && isInstalled('spark_plugs')) {
      const chamberY = blockY + 22;
      const flameGrad = ctx.createRadialGradient(
        cylX, chamberY + 8, 2,
        cylX, chamberY + 12, cylRadius * 1.3
      );
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#fde047');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(cylX, chamberY + 8, cylRadius * 0.95, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spark lightning
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cylX, chamberY);
      ctx.lineTo(cylX - 2, chamberY + 5);
      ctx.lineTo(cylX + 2, chamberY + 9);
      ctx.lineTo(cylX, chamberY + 13);
      ctx.stroke();
    }

    // Crankshaft throw & counterweight
    if (isInstalled('crankshaft')) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cylX, crankCenterY, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cylX, crankCenterY);
      ctx.lineTo(crankPinX, crankPinY);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(
        cylX - Math.sin(throwRad) * 11,
        crankCenterY + Math.cos(throwRad) * 11,
        11,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Connecting Rod
    if (isInstalled('pistons_rods')) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(crankPinX, crankPinY);
      ctx.lineTo(cylX, pistonPinY);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(crankPinX, crankPinY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Piston
      const pistonW = cylRadius * 1.88;
      const pistonH = 24;
      const pistonTop = pistonPinY - pistonH;

      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cylX - pistonW * 0.5, pistonTop, pistonW, pistonH, 3);
      ctx.fill();
      ctx.stroke();

      // Piston compression rings
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.moveTo(cylX - pistonW * 0.5 + 1, pistonTop + 4 + r * 3);
        ctx.lineTo(cylX + pistonW * 0.5 - 1, pistonTop + 4 + r * 3);
        ctx.stroke();
      }

      // Wrist pin
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cylX, pistonPinY - 6, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Valves in cylinder head
    if (isInstalled('cylinder_head')) {
      const isIntakeOpen = cycleDeg >= 360 && cycleDeg < 540;
      const isExhaustOpen = cycleDeg >= 180 && cycleDeg < 360;
      const intakeValveY = blockY + 12 + (isIntakeOpen ? 6 : 0);
      const exhaustValveY = blockY + 12 + (isExhaustOpen ? 6 : 0);

      // Intake valve
      ctx.strokeStyle = isIntakeOpen ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cylX - 12, blockY - 4);
      ctx.lineTo(cylX - 12, intakeValveY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cylX - 17, intakeValveY);
      ctx.lineTo(cylX - 7, intakeValveY);
      ctx.stroke();

      // Exhaust valve
      ctx.strokeStyle = isExhaustOpen ? '#f97316' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cylX + 12, blockY - 4);
      ctx.lineTo(cylX + 12, exhaustValveY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cylX + 7, exhaustValveY);
      ctx.lineTo(cylX + 17, exhaustValveY);
      ctx.stroke();
    }

    // Spark plug
    if (isInstalled('spark_plugs')) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cylX - 2.5, blockY - 14, 5, 16);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cylX - 1.5, blockY + 2, 3, 5);
    }

    // Cylinder number & 4-stroke cycle phase text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Cilindro ${i + 1}`, cylX, blockY + blockHeight + 14);

    let phaseName = 'Detenido';
    let phaseColor = '#64748b';
    if (engineState === 'running' || engineState === 'cranking') {
      if (cycleDeg < 180) {
        phaseName = '💥 Combustión';
        phaseColor = '#ef4444';
      } else if (cycleDeg < 360) {
        phaseName = '💨 Escape';
        phaseColor = '#f97316';
      } else if (cycleDeg < 540) {
        phaseName = '🌀 Admisión';
        phaseColor = '#38bdf8';
      } else {
        phaseName = '🔒 Compresión';
        phaseColor = '#10b981';
      }
    }
    ctx.fillStyle = phaseColor;
    ctx.font = 'bold 9px monospace';
    ctx.fillText(phaseName, cylX, blockY + blockHeight + 25);
  }

  // 6. Turbocharger on right side
  if (isInstalled('exhaust_turbo')) {
    const turboX = blockX + blockWidth + 50;
    const turboY = blockY + 55;
    const turboSpoolAngle = (crankAngle * (1 + boostBar * 1.5)) % 360;
    const turboRad = (turboSpoolAngle * Math.PI) / 180;

    // Manifold pipe
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(blockX + blockWidth - 4, blockY + 45);
    ctx.lineTo(turboX - 20, turboY);
    ctx.stroke();

    // Turbo housing
    const isHighBoost = engineState === 'running' && currentRpm > 4200;
    ctx.fillStyle = isHighBoost ? '#dc2626' : '#1e293b';
    ctx.strokeStyle = isHighBoost ? '#f97316' : '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(turboX, turboY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spinning turbine blades
    ctx.strokeStyle = isHighBoost ? '#fef08a' : '#94a3b8';
    ctx.lineWidth = 2.5;
    for (let b = 0; b < 6; b++) {
      const bAngle = turboRad + (b * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(turboX, turboY);
      ctx.lineTo(turboX + Math.cos(bAngle) * 18, turboY + Math.sin(bAngle) * 18);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(turboX, turboY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TURBO', turboX, turboY + 38);
    ctx.fillStyle = boostBar > 0.2 ? '#f59e0b' : '#64748b';
    ctx.fillText(`+${boostBar.toFixed(2)} BAR`, turboX, turboY + 49);
  }

  // 7. Starter Motor on left side
  if (isInstalled('starter_motor')) {
    const starterX = blockX - 44;
    const starterY = crankCenterY - 10;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = engineState === 'cranking' ? '#ef4444' : '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(starterX, starterY, 32, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('12V', starterX + 16, starterY + 14);

    if (engineState === 'cranking') {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('START', starterX + 16, starterY + 28);
    }
  }

  ctx.restore();
}

export const DynoTestStand: React.FC<DynoTestStandProps> = ({
  installedPartIds,
  partTorques,
  timingOffsetTeeth,
  oilLevel,
  coolantLiters = 5.0,
  onReturnToWorkshop,
  onGoToWorkshopFix,
  onEngineStartedSuccessfully,
  onEngineFailedStart,
  onOpenScorecard,
  elapsedSeconds = 0,
  currentScore = 0,
  onOpenTimingModal,
}) => {
  // Key state: 'off' | 'acc' | 'on' | 'start'
  const [keyState, setKeyState] = useState<'off' | 'acc' | 'on' | 'start'>('off');
  const [engineState, setEngineState] = useState<'stopped' | 'cranking' | 'running' | 'failed'>('stopped');
  const [rpm, setRpm] = useState<number>(0);
  const [throttle, setThrottle] = useState<number>(0); // 0 to 1
  const [boostBar, setBoostBar] = useState<number>(0);
  const [oilPressurePsi, setOilPressurePsi] = useState<number>(0);
  const [coolantTempC, setCoolantTempC] = useState<number>(24);
  const [diagnosticResult, setDiagnosticResult] = useState<EngineDiagnosticResult | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crankAngleRef = useRef<number>(0);
  const rpmRef = useRef<number>(0);
  const engineStateRef = useRef<'stopped' | 'cranking' | 'running' | 'failed'>('stopped');
  const boostBarRef = useRef<number>(0);
  const throttleRef = useRef<number>(0);
  const crankTimeoutRef = useRef<number | null>(null);

  // Evaluate engine build health
  const evaluateEngine = (): EngineDiagnosticResult => {
    // 1. Starter motor check
    if (!installedPartIds.includes('starter_motor')) {
      return {
        canStart: false,
        status: 'missing_starter',
        title: 'Sin Motor de Arranque',
        message: 'Al girar la llave solo se oye un chasquido de relé. El motor de arranque de 12V no está montado en la campana.',
        targetPartId: 'starter_motor',
        actionButtonText: 'Ir al Taller a Instalar Motor de Arranque (12V)',
        obdCode: {
          code: 'P0512',
          title: 'Circuito del Motor de Arranque Abierto',
          description: 'No hay motor de arranque para girar el volante de inercia.',
          solution: 'Instala el motor de arranque y conecta la batería de 12V en el taller.',
          severity: 'warning',
        },
      };
    }

    // 2. Core mechanical components
    if (!installedPartIds.includes('crankshaft')) {
      return {
        canStart: false,
        status: 'missing_crank',
        title: 'Falta Cigüeñal',
        message: 'El bloque está vacío. No existe eje de rotación para transmitir potencia.',
        targetPartId: 'crankshaft',
        actionButtonText: 'Ir al Taller a Montar Cigüeñal',
        obdCode: {
          code: 'P0335',
          title: 'Sensor / Eje Cigüeñal Ausente',
          description: 'Falta el eje central motriz del bloque.',
          solution: 'Instala el cigüeñal forjado en el soporte de bancada.',
          severity: 'fatal',
        },
      };
    }

    if (!installedPartIds.includes('pistons_rods')) {
      return {
        canStart: false,
        status: 'missing_pistons',
        title: 'Faltan Pistones y Bielas',
        message: 'No hay cámaras de compresión ni pistones dentro de los cilindros.',
        targetPartId: 'pistons_rods',
        actionButtonText: 'Ir al Taller a Montar Pistones y Bielas',
        obdCode: {
          code: 'P0300',
          title: 'Cilindros Vacíos (Sin Pistones)',
          description: 'No hay elementos móviles en las camisas de los cilindros.',
          solution: 'Inserta el juego de 4 pistones con bielas y aros en el bloque.',
          severity: 'fatal',
        },
      };
    }

    if (!installedPartIds.includes('head_gasket')) {
      return {
        canStart: false,
        status: 'missing_head',
        title: 'Falta Junta de Culata',
        message: 'No se puede sellar la compresión sin la junta multicapa de culata.',
        targetPartId: 'head_gasket',
        actionButtonText: 'Ir al Taller a Colocar Junta de Culata',
        obdCode: {
          code: 'P0117',
          title: 'Junta de Culata Ausente',
          description: 'Falta el sello hermético entre bloque y culata.',
          solution: 'Coloca la junta de culata sobre los pasadores guía del bloque.',
          severity: 'critical',
        },
      };
    }

    if (!installedPartIds.includes('cylinder_head')) {
      return {
        canStart: false,
        status: 'missing_head',
        title: 'Culata Desmontada',
        message: 'El motor no tiene compresión porque los cilindros están al aire libre sin culata hermética.',
        targetPartId: 'cylinder_head',
        actionButtonText: 'Ir al Taller a Montar Culata',
        obdCode: {
          code: 'P0117',
          title: 'Culata 16V No Instalada',
          description: 'Falta la tapa superior de cámaras de combustión.',
          solution: 'Monta la culata 16V DOHC sobre el bloque motor.',
          severity: 'critical',
        },
      };
    }

    // 3. Cylinder head torque check
    const headTorque = partTorques['cylinder_head'] || 0;
    if (headTorque < 70) {
      return {
        canStart: false,
        status: 'untorqued_head',
        title: 'Fuga Masiva de Compresión (Culata Floja)',
        message: `La culata tiene solo ${headTorque} Nm de apriete (la especificación es 85 Nm). La compresión se escapa con un fuerte siseo.`,
        targetPartId: 'cylinder_head',
        toolActionType: 'torque',
        actionButtonText: 'Ir al Taller con Dinamométrica (Apretar a 85 Nm)',
        obdCode: {
          code: 'P0117',
          title: 'Pernos de Culata sin Par de Apriete Nominal',
          description: 'Falta de apriete dinamométrico provoca soplo de junta.',
          solution: 'Usa el torquímetro para apretar a 85 Nm en cruz.',
          severity: 'critical',
        },
      };
    }

    // 4. Distribution timing check
    if (!installedPartIds.includes('timing_belt')) {
      return {
        canStart: false,
        status: 'timing_clash',
        title: 'Sin Correa de Distribución',
        message: 'Los árboles de levas están quietos mientras el cigüeñal gira. Las válvulas abiertas son golpeadas.',
        targetPartId: 'timing_belt',
        toolActionType: 'timing',
        actionButtonText: 'Ir al Taller a Montar y Sincronizar Distribución',
        obdCode: {
          code: 'P0016',
          title: 'Desfase Catastrófico de Distribución',
          description: 'Válvulas dobladas por falta de sincronización.',
          solution: 'Monta el kit de distribución y cala las poleas a 0° PMS.',
          severity: 'fatal',
        },
      };
    }

    if (timingOffsetTeeth !== 0) {
      return {
        canStart: false,
        status: 'timing_clash',
        title: `Distribución Fuera de Punto (${timingOffsetTeeth > 0 ? `+${timingOffsetTeeth}` : timingOffsetTeeth} Dientes)`,
        message: '¡Colisión mecánica de válvulas! Las marcas de la polea no estaban en 0° PMS (TDC). Los pistones chocaron contra las válvulas de admisión.',
        targetPartId: 'timing_belt',
        toolActionType: 'timing',
        actionButtonText: 'Calibrar Sincronismo a 0° PMS (Poner a Punto)',
        obdCode: {
          code: 'P0016',
          title: 'Desfase de Distribución Cigüeñal / Levas',
          description: 'Correlación de fase fuera de rango admisible.',
          solution: 'Alinea los piñones de los árboles de levas con el testigo del bloque a 0° PMS.',
          severity: 'fatal',
        },
      };
    }

    // 5. Fuel system check
    if (!installedPartIds.includes('intake_manifold')) {
      return {
        canStart: false,
        status: 'missing_fuel',
        title: 'Sin Suministro de Combustible',
        message: 'El motor gira con el motor de arranque pero no llega gasolina a los cilindros. Falta el múltiple con los inyectores.',
        targetPartId: 'intake_manifold',
        actionButtonText: 'Ir al Taller a Instalar Múltiple de Admisión',
        obdCode: {
          code: 'P0087',
          title: 'Circuito de Inyección sin Presión',
          description: 'No hay mezcla estequiométrica en los conductos.',
          solution: 'Instala el múltiple de admisión con inyectores de 550cc.',
          severity: 'critical',
        },
      };
    }

    // 6. Ignition check
    if (!installedPartIds.includes('spark_plugs')) {
      return {
        canStart: false,
        status: 'missing_spark',
        title: 'Sin Chispa de Encendido',
        message: 'El motor gira impulsado por el motor de arranque pero las bujías o bobinas COP no están instaladas. No hay chispa para inflamar el combustible.',
        targetPartId: 'spark_plugs',
        actionButtonText: 'Ir al Taller a Enroscar Bujías de Iridio',
        obdCode: {
          code: 'P0300',
          title: 'Fallo General de Encendido (Sin Chispa)',
          description: 'Sin arco de alta tensión en las cámaras de combustión.',
          solution: 'Enrosca las 4 bujías de iridio y conecta las bobinas a 25 Nm.',
          severity: 'critical',
        },
      };
    }

    // 7. Lubrication oil check
    if (!installedPartIds.includes('oil_fluid') || oilLevel < 65) {
      return {
        canStart: false,
        status: 'missing_oil',
        title: 'Gripaje por Falta de Aceite',
        message: 'El motor arrancó pero tras 2 segundos la fricción en seco provocó el gripaje de los casquillos de bancada y bielas. ¡El motor se ha clavado!',
        targetPartId: 'oil_fluid',
        toolActionType: 'oil',
        actionButtonText: 'Ir al Taller a Verter Aceite Sintético 5W-40 (4.5 L)',
        obdCode: {
          code: 'P0524',
          title: 'Presión de Aceite Crítica (Cárter Seco)',
          description: 'Falta total de lubricante hidrodinámico.',
          solution: 'Vierte 4.5 Litros de aceite sintético 5W-40 hasta la marca MAX de la varilla.',
          severity: 'fatal',
        },
      };
    }

    // 8. Coolant fluid check (5.0 L)
    if (!installedPartIds.includes('coolant_fluid') || coolantLiters < 4.0) {
      return {
        canStart: false,
        status: 'missing_coolant',
        title: 'Sobrecalentamiento: Sin Refrigerante (5.0 L)',
        message: 'El circuito de enfriamiento no tiene refrigerante. Sin los 5.0 Litros de refrigerante orgánico OAT, el motor superará los 120°C y quemará la junta de culata.',
        targetPartId: 'coolant_fluid',
        toolActionType: 'coolant',
        actionButtonText: 'Ir al Taller a Llenar Refrigerante OAT (5.0 L)',
        obdCode: {
          code: 'P0217',
          title: 'Sobrecalentamiento Crítico / Circuito sin Refrigerante',
          description: 'Falta de fluido térmico en las galerías de refrigeración.',
          solution: 'Vierte 5.0 Litros de refrigerante orgánico OAT en el vaso de expansión.',
          severity: 'fatal',
        },
      };
    }

    // 9. Other parts check (15 parts total)
    if (installedPartIds.length < 15) {
      const firstMissing = ENGINE_PARTS.find((p) => !installedPartIds.includes(p.id));
      return {
        canStart: false,
        status: 'missing_crank',
        title: `Motor Incompleto (${installedPartIds.length}/15 Piezas)`,
        message: `Faltan ${15 - installedPartIds.length} componentes para completar el armado mecánico. Falta instalar: ${firstMissing?.name || 'piezas pendientes'}.`,
        targetPartId: firstMissing?.id,
        actionButtonText: `Ir al Taller a Montar ${firstMissing?.shortName || firstMissing?.name || 'Pieza Faltante'}`,
        obdCode: {
          code: 'P1000',
          title: 'Ciclo de Montaje Incompleto',
          description: `El motor tiene solo ${installedPartIds.length} de 15 piezas instaladas.`,
          solution: `Vuelve al taller de ensamble y monta ${firstMissing?.name || 'las piezas restantes'}.`,
          severity: 'warning',
        },
      };
    }

    // Perfect build!
    return {
      canStart: true,
      status: 'ready',
      title: '¡Motor Perfecto y Listo!',
      message: 'Todos los componentes mecánicos, pares de apriete, calado de distribución, aceite y los 5.0 L de refrigerante están en perfecto orden.',
    };
  };

  // Turn Ignition Key
  const handleTurnKey = (targetState: 'off' | 'acc' | 'on' | 'start') => {
    soundEngine.playToolSound('key_click');
    setKeyState(targetState);

    if (targetState === 'off') {
      soundEngine.stopCranking();
      soundEngine.stopEngine();
      setEngineState('stopped');
      engineStateRef.current = 'stopped';
      setRpm(0);
      rpmRef.current = 0;
      setBoostBar(0);
      boostBarRef.current = 0;
      setOilPressurePsi(0);
      setDiagnosticResult(null);
      return;
    }

    if (targetState === 'on') {
      soundEngine.stopCranking();
      if (engineState === 'cranking') {
        setEngineState('stopped');
        engineStateRef.current = 'stopped';
        setRpm(0);
        rpmRef.current = 0;
      }
    }
  };

  // Start button press (Cranking)
  const handleStartMouseDown = () => {
    if (keyState === 'off') {
      // Auto turn key to ON first
      soundEngine.playToolSound('key_click');
      setKeyState('on');
    }

    setKeyState('start');
    const health = evaluateEngine();
    setDiagnosticResult(health);

    if (health.status === 'missing_starter') {
      // Just a solenoid click
      soundEngine.playToolSound('key_click');
      setEngineState('failed');
      engineStateRef.current = 'failed';
      setRpm(0);
      rpmRef.current = 0;
      onEngineFailedStart();
      return;
    }

    // Starter cranks!
    setEngineState('cranking');
    engineStateRef.current = 'cranking';
    setRpm(250);
    rpmRef.current = 250;
    soundEngine.startCranking();

    crankTimeoutRef.current = window.setTimeout(() => {
      soundEngine.stopCranking();

      if (health.canStart) {
        // SUCCESS! ENGINE ROARS TO LIFE!
        setEngineState('running');
        engineStateRef.current = 'running';
        setRpm(950);
        rpmRef.current = 950;
        setOilPressurePsi(45);
        setCoolantTempC(40);
        soundEngine.startEngine(950);
        onEngineStartedSuccessfully();

        if (!hasCelebrated) {
          setHasCelebrated(true);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#10b981', '#f59e0b', '#ef4444'],
          });
        }
      } else {
        // Mechanical failure!
        setEngineState('failed');
        engineStateRef.current = 'failed';
        setRpm(0);
        rpmRef.current = 0;
        onEngineFailedStart();

        if (health.status === 'timing_clash') {
          soundEngine.playEngineFailure('clatter');
        } else if (health.status === 'missing_oil') {
          soundEngine.playEngineFailure('seize');
        } else if (health.status === 'untorqued_head') {
          soundEngine.playEngineFailure('backfire');
        }
      }
    }, 1400);
  };

  const handleStartMouseUp = () => {
    if (keyState === 'start') {
      setKeyState('on');
    }
    if (engineState === 'cranking') {
      if (crankTimeoutRef.current) {
        clearTimeout(crankTimeoutRef.current);
      }
      soundEngine.stopCranking();
      setEngineState('stopped');
      engineStateRef.current = 'stopped';
      setRpm(0);
      rpmRef.current = 0;
    }
  };

  // Keep engine state ref synchronized
  useEffect(() => {
    engineStateRef.current = engineState;
  }, [engineState]);

  // Unified real-time animation & physics loop (Runs at 60 FPS)
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const curEngineState = engineStateRef.current;
      const curThrottle = throttleRef.current;
      let currentRpm = rpmRef.current;

      if (curEngineState === 'running') {
        // Target RPM: 950 idle up to 7200 RPM at 100% throttle
        const targetRpm = 950 + curThrottle * (7200 - 950);
        const revSpeed = curThrottle > 0.05 ? 12 : 6;
        currentRpm = currentRpm + (targetRpm - currentRpm) * Math.min(1, revSpeed * delta);
        rpmRef.current = currentRpm;
        setRpm(currentRpm);

        // Boost pressure (turbo spools above 2500 RPM with throttle)
        const currentBoost = curThrottle > 0.2 ? Number((curThrottle * 1.25).toFixed(2)) : 0;
        boostBarRef.current = currentBoost;
        setBoostBar(currentBoost);

        // Oil pressure increases with RPM
        const targetPsi = 42 + (curThrottle * 35);
        setOilPressurePsi((prev) => Math.round(prev + (targetPsi - prev) * 0.1));

        // Warm up coolant slowly
        setCoolantTempC((prev) => Math.min(88, prev + 0.05));
      } else if (curEngineState === 'cranking') {
        currentRpm = 250;
        rpmRef.current = 250;
      } else {
        currentRpm = 0;
        rpmRef.current = 0;
      }

      // Advance crankshaft rotation angle based on current RPM
      // RPM = rev/min => rev/sec = RPM / 60 => deg/sec = (RPM / 60) * 360
      if (currentRpm > 0) {
        const degPerSec = (currentRpm / 60) * 360;
        crankAngleRef.current = (crankAngleRef.current + degPerSec * delta) % 720;
      }

      // Render the 4-cylinder engine cutaway to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawDynoEngineCutaway(
            ctx,
            canvas.width,
            canvas.height,
            crankAngleRef.current,
            currentRpm,
            curEngineState,
            boostBarRef.current,
            installedPartIds
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [installedPartIds]);

  // Synchronize throttle updates with audio engine
  useEffect(() => {
    throttleRef.current = throttle;
    if (engineState === 'running') {
      soundEngine.updateEngineRpm(rpm, throttle);
    }
  }, [throttle, rpm, engineState]);

  // Keyboard controls for throttle (Spacebar / ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        throttleRef.current = 0.95;
        setThrottle(0.95);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        throttleRef.current = 0;
        setThrottle(0);
        if (engineStateRef.current === 'running') {
          soundEngine.playBlowOff();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  return (
    <div className="w-full max-w-full bg-[#0b0f15] border border-[#2d3748] rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-2xl flex flex-col space-y-3 sm:space-y-5 overflow-x-hidden">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1f2937] pb-2.5 sm:pb-4 gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gauge className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-racing font-bold text-white tracking-wide flex items-center gap-2 flex-wrap">
              <span>Banco Dyno de Pruebas</span>
              {engineState === 'running' && (
                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  MOTOR EN MARCHA
                </span>
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-400">
              Telemetría en tiempo real y diagnóstico OBD-II
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-end flex-wrap">
          {engineState === 'running' && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-racing font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all animate-bounce min-h-[38px]"
            >
              <Trophy className="w-4 h-4" />
              <span>Puntuación</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className={`p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
            }`}
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onReturnToWorkshop}
            className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all min-h-[38px]"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Taller</span>
          </button>
        </div>
      </div>

      {/* 4-Cylinder Interactive Cutaway Engine in Real Time Motion */}
      <div className="w-full max-w-full bg-[#111722] border border-[#232f42] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-racing font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                <span>Motor 2.0L 16V Turbo • Cinemática en Tiempo Real</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-mono-tech">
                Orden de Encendido: <span className="text-amber-400 font-bold">1 - 3 - 4 - 2</span> • DOHC 16 Válvulas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs font-mono-tech">
            <div className="bg-[#0b0f17] border border-gray-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-gray-400">Vel. Media Pistón:</span>
              <span className="text-cyan-400 font-bold">
                {((2 * 0.086 * rpm) / 60).toFixed(1)} m/s
              </span>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-gray-400">Frecuencia:</span>
              <span className="text-amber-400 font-bold">
                {(rpm / 60).toFixed(0)} Hz
              </span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border ${
                engineState === 'running'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : engineState === 'cranking'
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 animate-pulse'
                  : engineState === 'failed'
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  engineState === 'running'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    : engineState === 'cranking'
                    ? 'bg-yellow-400 animate-ping'
                    : engineState === 'failed'
                    ? 'bg-red-400'
                    : 'bg-gray-500'
                }`}
              />
              <span>
                {engineState === 'running'
                  ? `EN MARCHA (${Math.round(rpm)} RPM)`
                  : engineState === 'cranking'
                  ? 'GIRANDO ARRANQUE'
                  : engineState === 'failed'
                  ? 'FALLO MECÁNICO'
                  : 'MOTOR PARADO'}
              </span>
            </div>
          </div>
        </div>

        {/* The Animated Cutaway Canvas */}
        <div className="relative w-full bg-[#080c14] rounded-xl border border-gray-800/80 overflow-hidden shadow-inner flex items-center justify-center p-1 sm:p-2">
          <canvas
            ref={canvasRef}
            width={820}
            height={300}
            className="w-full max-w-[820px] h-auto block select-none"
          />

          {/* Engine stopped overlay hint */}
          {engineState === 'stopped' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none p-4 text-center">
              <div className="bg-gray-900/90 border border-gray-700 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-racing text-gray-200">
                  Pulsa START o gira la llave para arrancar y ver los pistones acelerar en tiempo real
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend of 4 strokes */}
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] sm:text-xs font-mono-tech">
          <div className="bg-[#0b0f17] border border-red-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5 text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="truncate">💥 Combustión</span>
          </div>
          <div className="bg-[#0b0f17] border border-orange-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5 text-orange-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span className="truncate">💨 Escape</span>
          </div>
          <div className="bg-[#0b0f17] border border-sky-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
            <span className="truncate">🌀 Admisión</span>
          </div>
          <div className="bg-[#0b0f17] border border-emerald-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">🔒 Compresión</span>
          </div>
        </div>

        {/* Pedal de Acelerador Realista Abajo del Motor en Funcionamiento */}
        <div className="mt-4 pt-3 border-t border-gray-800/80">
          <AcceleratorPedal
            throttle={throttle}
            onThrottleChange={(val) => {
              throttleRef.current = val;
              setThrottle(val);
            }}
            onThrottleRelease={() => {
              if (throttleRef.current > 0.2 && engineStateRef.current === 'running') {
                soundEngine.playBlowOff();
              }
              throttleRef.current = 0;
              setThrottle(0);
            }}
            rpm={rpm}
            engineState={engineState}
            boostBar={boostBar}
            oilPressurePsi={oilPressurePsi}
          />
        </div>
      </div>

      {/* Main Dyno Dashboard Cluster */}
      <div className="w-full max-w-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 overflow-hidden">
        {/* Analog Gauges Panel (Tachometer & Boost) */}
        <div className="lg:col-span-2 bg-[#111722] border border-[#232f42] rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 items-center">
            {/* Tachometer (Tacómetro) */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-racing font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Tacómetro Principal (x1000 RPM)
              </span>

              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[#334155] bg-radial from-[#1e293b] to-[#0b0f17] relative flex items-center justify-center shadow-inner">
                {/* Redline zone */}
                <div className="absolute top-2.5 right-4 sm:right-6 text-[8px] sm:text-[9px] font-mono-tech text-red-500 font-bold">
                  REDLINE 7.2k
                </div>

                {/* Dial numbers with safe radius that never clips */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const angle = -140 + num * 40;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.sin(rad) * 56;
                  const y = -Math.cos(rad) * 56;
                  return (
                    <span
                      key={num}
                      className={`absolute text-[11px] sm:text-xs font-mono-tech font-bold ${
                        num >= 6 ? 'text-red-400' : 'text-gray-400'
                      }`}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      {num}
                    </span>
                  );
                })}

                {/* Needle */}
                <div
                  className="w-1 h-16 sm:h-20 bg-red-500 rounded-full origin-bottom absolute bottom-20 sm:bottom-24 transition-transform duration-75 shadow-[0_0_8px_#ef4444]"
                  style={{
                    transform: `rotate(${-140 + (rpm / 7500) * 280}deg)`,
                  }}
                />

                {/* Center hub */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 border-2 border-gray-600 z-10 flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                </div>

                {/* Digital readout */}
                <div className="absolute bottom-3 sm:bottom-5 font-mono-tech text-base sm:text-lg font-bold text-white tracking-widest bg-black/60 px-2 py-0.5 rounded border border-gray-700">
                  {Math.round(rpm)} <span className="text-[9px] sm:text-[10px] text-gray-400 font-sans">RPM</span>
                </div>
              </div>
            </div>

            {/* Turbo Boost & Oil Pressure Gauges */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
              {/* Turbo Boost */}
              <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 sm:p-4 flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] font-racing text-gray-400 uppercase tracking-wider mb-1.5">
                  Presión Turbo
                </span>
                <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-full border-2 border-gray-700 bg-gray-900 relative flex items-center justify-center">
                  <div
                    className="w-0.5 h-9 sm:h-12 bg-amber-400 origin-bottom absolute bottom-11 sm:bottom-14 transition-transform duration-100"
                    style={{ transform: `rotate(${-120 + boostBar * 180}deg)` }}
                  />
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gray-800 border border-gray-600 z-10" />
                  <span className="absolute bottom-1.5 sm:bottom-2 font-mono-tech text-[10px] sm:text-xs text-amber-400 font-bold">
                    {boostBar > 0 ? `+${boostBar.toFixed(2)}` : '0.00'} Bar
                  </span>
                </div>
              </div>

              {/* Oil Pressure */}
              <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 sm:p-4 flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] font-racing text-gray-400 uppercase tracking-wider mb-1.5">
                  Presión Aceite
                </span>
                <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-full border-2 border-gray-700 bg-gray-900 relative flex items-center justify-center">
                  <div
                    className="w-0.5 h-9 sm:h-12 bg-emerald-400 origin-bottom absolute bottom-11 sm:bottom-14 transition-transform duration-100"
                    style={{ transform: `rotate(${-120 + (oilPressurePsi / 80) * 240}deg)` }}
                  />
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gray-800 border border-gray-600 z-10" />
                  <span className="absolute bottom-1.5 sm:bottom-2 font-mono-tech text-[10px] sm:text-xs text-emerald-400 font-bold">
                    {oilPressurePsi} PSI
                  </span>
                </div>
              </div>

              {/* Coolant Temp */}
              <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-racing text-gray-400 uppercase">Temp Agua</span>
                <span className="text-sm font-mono-tech font-bold text-cyan-400 mt-1">
                  {Math.round(coolantTempC)} °C
                </span>
              </div>

              {/* Alternator Battery */}
              <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-racing text-gray-400 uppercase">Batería 12V</span>
                <span className="text-sm font-mono-tech font-bold text-amber-400 mt-1">
                  {engineState === 'running' ? '14.2 V' : keyState !== 'off' ? '12.4 V' : '0.0 V'}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Lights Strip */}
          <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-around">
            {/* Check Engine MIL */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  keyState === 'on' && engineState !== 'running'
                    ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                    : engineState === 'failed'
                    ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]'
                    : 'bg-gray-800'
                }`}
              />
              <span className="text-[9px] font-mono-tech text-gray-400">CHECK</span>
            </div>

            {/* Oil Warning */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  keyState !== 'off' && oilPressurePsi < 20
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                    : 'bg-gray-800'
                }`}
              />
              <span className="text-[9px] font-mono-tech text-gray-400">ACEITE</span>
            </div>

            {/* Battery Warning */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  keyState !== 'off' && engineState !== 'running'
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                    : 'bg-gray-800'
                }`}
              />
              <span className="text-[9px] font-mono-tech text-gray-400">BATERÍA</span>
            </div>

            {/* Shift Light (Redline) */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  rpm > 6500 ? 'bg-blue-400 animate-ping shadow-[0_0_12px_#38bdf8]' : 'bg-gray-800'
                }`}
              />
              <span className="text-[9px] font-mono-tech text-gray-400">SHIFT</span>
            </div>
          </div>
        </div>

        {/* Ignition Controls & Throttle Pedal Panel */}
        <div className="bg-[#111722] border border-[#232f42] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-racing font-bold text-sm text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Interruptor de Encendido
            </h3>

            {/* Key Selector Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['off', 'acc', 'on'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => handleTurnKey(pos)}
                  className={`py-2 px-1 text-xs font-mono-tech font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                    keyState === pos
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}

              {/* Start Spring-loaded button */}
              <button
                onMouseDown={handleStartMouseDown}
                onMouseUp={handleStartMouseUp}
                onTouchStart={handleStartMouseDown}
                onTouchEnd={handleStartMouseUp}
                className={`py-2 px-1 text-xs font-mono-tech font-bold rounded-lg border uppercase transition-all select-none cursor-pointer ${
                  keyState === 'start'
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_12px_#ef4444]'
                    : 'bg-red-950/40 border-red-700/60 text-red-300 hover:bg-red-900/60'
                }`}
              >
                START
              </button>
            </div>

            {/* Big Starter Push Button */}
            <button
              onMouseDown={handleStartMouseDown}
              onMouseUp={handleStartMouseUp}
              onTouchStart={handleStartMouseDown}
              onTouchEnd={handleStartMouseUp}
              disabled={engineState === 'running'}
              className={`w-full py-5 rounded-2xl font-racing font-bold text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer select-none shadow-2xl ${
                engineState === 'running'
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 opacity-80 cursor-default'
                  : keyState === 'start'
                  ? 'bg-red-500 text-white scale-98 shadow-[0_0_20px_#ef4444]'
                  : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg active:scale-98'
              }`}
            >
              <Flame className="w-5 h-5 animate-pulse" />
              {engineState === 'running'
                ? '¡Motor en Marcha!'
                : keyState === 'start'
                ? 'Dando Arranque...'
                : 'Mantener Pulsado para Arrancar'}
            </button>
          </div>

          {/* Throttle Pedal Section */}
          <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-racing">
              <span className="text-gray-300">Pedal de Acelerador (Mariposa)</span>
              <span className="text-amber-400 font-mono-tech font-bold">
                {Math.round(throttle * 100)}%
              </span>
            </div>

            {/* Slider or Click to accelerate */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={throttle}
              disabled={engineState !== 'running'}
              onChange={(e) => {
                const val = Number(e.target.value);
                throttleRef.current = val;
                setThrottle(val);
              }}
              onInput={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                throttleRef.current = val;
                setThrottle(val);
              }}
              onMouseUp={() => {
                throttleRef.current = 0;
                setThrottle(0);
                if (engineState === 'running') soundEngine.playBlowOff();
              }}
              onTouchEnd={() => {
                throttleRef.current = 0;
                setThrottle(0);
                if (engineState === 'running') soundEngine.playBlowOff();
              }}
              className="w-full accent-red-500 h-3 bg-gray-800 rounded-lg cursor-pointer disabled:opacity-40"
            />

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Ralentí (950 RPM)</span>
              <span className="text-gray-400">Tip: Mantén pulsado [ESPACIO] para acelerar</span>
              <span>7,200 RPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Readout / Failure or Success Report */}
      {diagnosticResult && (
        <div
          className={`p-5 rounded-2xl border text-sm leading-relaxed transition-all shadow-xl ${
            diagnosticResult.canStart
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {diagnosticResult.canStart ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-racing font-bold text-base tracking-wide text-white">
                  {diagnosticResult.title}
                </h4>
                {diagnosticResult.obdCode && (
                  <span className="font-mono-tech px-2.5 py-0.5 rounded-full bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs">
                    OBD-II: {diagnosticResult.obdCode.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300">{diagnosticResult.message}</p>

              {diagnosticResult.obdCode && (
                <div className="mt-3 pt-3 border-t border-red-500/20 text-xs text-amber-200/90 bg-red-950/30 p-3.5 rounded-xl space-y-3">
                  <p><strong>Solución Mecánica:</strong> {diagnosticResult.obdCode.solution}</p>

                  {/* Quick Action Navigation Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {diagnosticResult.actionButtonText && onGoToWorkshopFix && (
                      <button
                        onClick={() =>
                          onGoToWorkshopFix(
                            diagnosticResult.targetPartId,
                            diagnosticResult.toolActionType
                          )
                        }
                        className="py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 animate-pulse"
                      >
                        <Wrench className="w-4 h-4 text-white" />
                        <span>{diagnosticResult.actionButtonText}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    )}

                    {diagnosticResult.status === 'timing_clash' && onOpenTimingModal && (
                      <button
                        onClick={onOpenTimingModal}
                        className="py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-racing font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>Abrir Sincronismo Aquí (0° PMS)</span>
                      </button>
                    )}

                    <button
                      onClick={onReturnToWorkshop}
                      className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-racing font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>← Volver al Taller</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Quick Switch back to Workshop */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-[#111722] border border-[#232f42] rounded-2xl shadow-lg gap-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
          <span>¿Necesitas montar, desmontar o calibrar piezas del motor 2.0L?</span>
        </div>
        <button
          onClick={onReturnToWorkshop}
          className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-racing font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <span>← Volver a Mesa de Taller</span>
        </button>
      </div>
    </div>
  );
};

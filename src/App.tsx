/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EnginePart,
  EnginePartId,
  WorkshopMode,
  PartTorquesMap,
  AssemblyStats,
  FinalScoreBreakdown,
  AssemblyDifficulty,
} from './types/engine';
import { ENGINE_PARTS } from './data/engineParts';
import { soundEngine } from './services/soundEngine';
import { calculateFinalScore } from './utils/scoring';
import {
  getStoredPlayerName,
  saveStoredPlayerName,
  getStoredDifficulty,
  saveStoredDifficulty,
  saveLeaderboardRecord,
  updatePlayerNameInLeaderboard,
} from './utils/leaderboard';
import { registerAndGetVisit } from './utils/visitCounter';
import { Navbar } from './components/Navbar';
import { EngineVisualizer } from './components/EngineVisualizer';
import { PartDetailsCard } from './components/PartDetailsCard';
import { PartsTray } from './components/PartsTray';
import { DynoTestStand } from './components/DynoTestStand';
import { TorqueWrenchModal } from './components/TorqueWrenchModal';
import { TimingCalibrationModal } from './components/TimingCalibrationModal';
import { OilDipstickModal } from './components/OilDipstickModal';
import { CoolantModal } from './components/CoolantModal';
import { TechnicalManualModal } from './components/TechnicalManualModal';
import { ScorecardModal } from './components/ScorecardModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ParticipantNameModal } from './components/ParticipantNameModal';
import { InitialAccessModal } from './components/InitialAccessModal';
import { Footer } from './components/Footer';
import { ArcadeCelebration, FloatingScore } from './components/ArcadeCelebration';
import { AchievementsModal, ARCADE_ACHIEVEMENTS } from './components/AchievementsModal';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Eye,
  Award,
  Gauge,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // Visitor counter (persisted in localStorage and initialized on session start)
  const [visitInfo] = useState(() => registerAndGetVisit());

  // Participant Name (persisted in localStorage)
  const [playerName, setPlayerName] = useState<string>(() => getStoredPlayerName());

  // Assembly Difficulty: 'aprendiz' | 'mecanico' | 'dakar'
  const [difficulty, setDifficulty] = useState<AssemblyDifficulty>(() => getStoredDifficulty());

  // Initial access / garage welcome modal (Obligatorio para ingresar al juego)
  const [showInitialAccessModal, setShowInitialAccessModal] = useState<boolean>(true);

  // Seed key to force dynamic random rearrangement of parts whenever a game starts or resets
  const [trayShuffleKey, setTrayShuffleKey] = useState<number>(() => Date.now());

  // State for installed parts (persisted in localStorage)
  const [installedPartIds, setInstalledPartIds] = useState<EnginePartId[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('mecanicos_installed_parts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Torque recorded per part (Nm) (persisted in localStorage)
  const [partTorques, setPartTorques] = useState<PartTorquesMap>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('mecanicos_part_torques');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {};
  });

  // Timing belt offset (persisted in localStorage)
  const [timingOffsetTeeth, setTimingOffsetTeeth] = useState<number>(() => {
    if (typeof window === 'undefined') return 2;
    try {
      const stored = localStorage.getItem('mecanicos_timing_offset');
      if (stored !== null) return Number(stored);
    } catch {
      // ignore
    }
    return 2;
  });

  // Engine oil level (0% - 100%) (persisted in localStorage)
  const [oilLevel, setOilLevel] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem('mecanicos_oil_level');
      if (stored !== null) return Number(stored);
    } catch {
      // ignore
    }
    return 0;
  });

  // Engine coolant fluid level (0 to 5.0 Liters) (persisted in localStorage)
  const [coolantLiters, setCoolantLiters] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem('mecanicos_coolant_liters');
      if (stored !== null) return Number(stored);
    } catch {
      // ignore
    }
    return 0;
  });

  // Selected part for inspection
  const [selectedPart, setSelectedPart] = useState<EnginePart>(() => {
    return ENGINE_PARTS[0]; // Bloque de Cilindros by default (primera pieza a montar)
  });

  // Mobile view tab filter for comfortable phone gameplay ('both' | 'workbench' | 'engine')
  const [mobileTab, setMobileTab] = useState<'both' | 'workbench' | 'engine'>('both');

  // Current workshop mode: 'assembly' | 'dyno'
  const [currentMode, setCurrentMode] = useState<WorkshopMode>('assembly');

  // Assembly Stats & Timer
  const [stats, setStats] = useState<AssemblyStats>({
    startTime: null,
    endTime: null,
    elapsedSeconds: 0,
    isRunning: false,
    correctPlacements: 0, // motor inicia completamente vacío
    failedAttempts: 0,
    dismountCount: 0,
    failedStartAttempts: 0,
    perfectTorqueCount: 0,
    perfectTiming: false, // out of sync by default!
    perfectOil: false,
    perfectCoolant: false,
  });

  const [hasCompletedStart, setHasCompletedStart] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<FinalScoreBreakdown | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [currentPlayerRecordId, setCurrentPlayerRecordId] = useState<string | null>(null);

  // Active modals
  const [activeModal, setActiveModal] = useState<
    'torque' | 'timing' | 'oil' | 'coolant' | 'manual' | null
  >(null);
  const [modalPart, setModalPart] = useState<EnginePart | null>(null);

  // Arcade Gamification State: Combos, Confetti & Floating Scores
  const [comboCount, setComboCount] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('mecanicos_unlocked_achievements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [achievementToast, setAchievementToast] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  // Game background wallpaper visibility intensity: 'intenso' (default, clearly visible) | 'maximo' (full art) | 'sutil'
  const [bgIntensity, setBgIntensity] = useState<'intenso' | 'maximo' | 'sutil'>('intenso');

  // Helper to trigger arcade achievement
  const triggerAchievement = (id: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('mecanicos_unlocked_achievements', JSON.stringify(next));
      } catch {
        // ignore
      }
      const ach = ARCADE_ACHIEVEMENTS.find((a) => a.id === id);
      if (ach) {
        soundEngine.playAchievement();
        setAchievementToast({
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
        });
        setTimeout(() => {
          setAchievementToast(null);
        }, 4000);
      }
      return next;
    });
  };

  // Helper to spawn floating score burst in arcade style
  const addFloatingScore = (text: string, color?: string) => {
    const id = `score_${Date.now()}_${Math.random()}`;
    const x = typeof window !== 'undefined' ? window.innerWidth * 0.5 + (Math.random() - 0.5) * 160 : 300;
    const y = typeof window !== 'undefined' ? window.innerHeight * 0.42 + (Math.random() - 0.5) * 80 : 300;

    setFloatingScores((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((s) => s.id !== id));
    }, 1100);
  };

  // Sound mute state
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());

  // Workshop notification toast
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>({
    type: 'info',
    message: 'Bienvenido a ENGINE PUZZLE CAR. Las piezas están desparramadas en el banco como un rompecabezas. ¡Encuentra cada pieza y arranca el motor!',
  });

  // Stopwatch interval timer
  useEffect(() => {
    let interval: number;
    if (stats.isRunning) {
      interval = window.setInterval(() => {
        setStats((prev) => ({
          ...prev,
          elapsedSeconds: Number((prev.elapsedSeconds + 0.1).toFixed(1)),
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [stats.isRunning]);

  // Persist engine assembly state to localStorage so pieces and calibrations are never lost
  useEffect(() => {
    try {
      localStorage.setItem('mecanicos_installed_parts', JSON.stringify(installedPartIds));
    } catch {
      // ignore
    }
  }, [installedPartIds]);

  useEffect(() => {
    try {
      localStorage.setItem('mecanicos_part_torques', JSON.stringify(partTorques));
    } catch {
      // ignore
    }
  }, [partTorques]);

  useEffect(() => {
    try {
      localStorage.setItem('mecanicos_timing_offset', String(timingOffsetTeeth));
    } catch {
      // ignore
    }
  }, [timingOffsetTeeth]);

  useEffect(() => {
    try {
      localStorage.setItem('mecanicos_oil_level', String(oilLevel));
    } catch {
      // ignore
    }
  }, [oilLevel]);

  useEffect(() => {
    try {
      localStorage.setItem('mecanicos_coolant_liters', String(coolantLiters));
    } catch {
      // ignore
    }
  }, [coolantLiters]);

  // Start timer on first user assembly action if not already running
  const ensureTimerStarted = () => {
    if (!stats.isRunning && !hasCompletedStart) {
      setStats((prev) => ({
        ...prev,
        isRunning: true,
        startTime: prev.startTime || Date.now(),
      }));
    }
  };

  // Notification timer
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setNotification({ type, message });
  };

  const handleUpdatePlayerName = (newName: string) => {
    const trimmed = newName.trim();
    setPlayerName(trimmed);
    saveStoredPlayerName(trimmed);
    if (currentPlayerRecordId && trimmed) {
      updatePlayerNameInLeaderboard(currentPlayerRecordId, trimmed);
    }
  };

  // Mount a part
  const handleMountPart = (partId: EnginePartId) => {
    ensureTimerStarted();

    const part = ENGINE_PARTS.find((p) => p.id === partId);
    if (!part) return;

    // Verify prerequisites
    const missingPrereqs = part.prerequisites.filter(
      (reqId) => !installedPartIds.includes(reqId)
    );
    if (missingPrereqs.length > 0) {
      soundEngine.playErrorBuzzer();
      setComboCount(0);
      addFloatingScore('-50 PTS (Fallo de Secuencia)', '#ef4444');
      // Record failed attempt for precision penalty
      setStats((prev) => ({
        ...prev,
        failedAttempts: prev.failedAttempts + 1,
      }));

      showToast(
        part.prerequisiteFailureReason || '¡Pieza incorrecta! No puedes montarla sin sus componentes previos.',
        'warning'
      );
      return;
    }

    // Successful Placement & Combo calculations
    const newCombo = comboCount + 1;
    setComboCount(newCombo);

    if (newCombo >= 2) {
      soundEngine.playCombo(newCombo);
      addFloatingScore(`+${100 + newCombo * 100} PTS COMBO x${newCombo}!`);
    } else {
      soundEngine.playToolSound('place');
      addFloatingScore('+100 PTS');
    }

    if (newCombo >= 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
      triggerAchievement('combo_3');
    }

    triggerAchievement('first_part');

    if (installedPartIds.length + 1 === ENGINE_PARTS.length) {
      soundEngine.playStageClear();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3800);
      triggerAchievement('all_parts');
    }

    setInstalledPartIds((prev) => [...prev, partId]);
    setStats((prev) => ({
      ...prev,
      correctPlacements: prev.correctPlacements + 1,
    }));

    // Keep this newly mounted part selected so details card shows its status
    setSelectedPart(part);

    // Give default torque or open tool modals directly
    if (part.torqueRequiredNm) {
      setMobileTab('engine');
      setPartTorques((prev) => ({
        ...prev,
        [partId]: Math.round(part.torqueRequiredNm! * 0.7), // Starts slightly hand-tightened
      }));
      setModalPart(part);
      showToast(
        `¡${part.name} montado! Aplicando par de apriete con llave dinamométrica (${part.torqueRequiredNm} Nm)...`,
        'info'
      );
      setTimeout(() => {
        setActiveModal('torque');
      }, 350);
    } else if (part.id === 'oil_fluid') {
      setMobileTab('engine');
      setOilLevel(15); // Inicia en nivel bajo (0.8 L) para que el cursor no coincida de primera y el usuario deba subirlo
      showToast('¡Bidón de aceite SAE 5W-40 listo! Mueve el cursor para subir el nivel al cárter hasta 4.5 L.', 'info');
      setTimeout(() => {
        setActiveModal('oil');
      }, 350);
    } else if (part.id === 'coolant_fluid') {
      setMobileTab('engine');
      setCoolantLiters(1.0); // Inicia en nivel bajo (1.0 L) para que el cursor no coincida de primera y el usuario deba subirlo
      showToast('¡Bidón de refrigerante OAT listo! Mueve el cursor para subir el nivel en el vaso hasta 5.0 L.', 'info');
      setTimeout(() => {
        setActiveModal('coolant');
      }, 350);
    } else if (part.requiresTimingAlignment) {
      setMobileTab('engine');
      const outOfSyncOffset = 2;
      setTimingOffsetTeeth(outOfSyncOffset);
      setStats((prev) => ({ ...prev, perfectTiming: false }));
      showToast(
        '⚠️ ¡Correa montada! Distribución fuera de punto (+2 dientes / +36°). Poniendo a 0° PMS...',
        'warning'
      );
      setTimeout(() => {
        setActiveModal('timing');
      }, 350);
    } else if (part.id === 'camshafts') {
      setMobileTab('engine');
      const outOfSyncOffset = 2;
      setTimingOffsetTeeth(outOfSyncOffset);
      setStats((prev) => ({ ...prev, perfectTiming: false }));
      showToast(
        '¡Árboles de levas DOHC montados! Han quedado desfasados. Sincronizando con distribución a 0° PMS...',
        'info'
      );
      setTimeout(() => {
        setActiveModal('timing');
      }, 350);
    } else if (part.id === 'crankcase_block') {
      // Bloque de motor no requiere torque: volver automáticamente al panel de piezas en celulares
      handleReturnToWorkbench('¡Bloque de Cilindros fijado en el soporte! Selecciona la siguiente pieza en el banco.');
    } else if (part.id === 'head_gasket') {
      // Junta de culata no requiere torque: volver automáticamente al panel de piezas en celulares
      handleReturnToWorkbench('¡Junta de Culata colocada sobre el bloque! Selecciona la culata en el banco.');
    } else {
      // Cualquier otra pieza sin torque ni calibración interactiva
      handleReturnToWorkbench(`¡${part.name} instalado con éxito en el motor! Selecciona la siguiente pieza.`);
    }
  };

  const handleConfirmInitialAccess = (newName: string, newDiff: AssemblyDifficulty) => {
    setPlayerName(newName);
    saveStoredPlayerName(newName);
    setDifficulty(newDiff);
    saveStoredDifficulty(newDiff);
    try {
      localStorage.setItem('mecanicos_session_active', 'true');
    } catch {
      // ignore
    }
    setTrayShuffleKey(Date.now() + Math.random());
    setShowInitialAccessModal(false);
    const diffNames: Record<AssemblyDifficulty, string> = {
      aprendiz: 'Aprendiz (Taller Escuela)',
      mecanico: 'Mecánico Oficial (Desafío Puzzle)',
      dakar: 'Jefe de Taller Dakar (Extremo)',
    };
    showToast(
      `¡Boxes autorizados para ${newName}! Dificultad: ${diffNames[newDiff]}. ¡Piezas barajadas aleatoriamente!`,
      'success'
    );
  };

  // Quick navigation from Dyno failure report back to workshop to fix missing/misaligned part
  const handleGoToWorkshopFix = (
    partId?: EnginePartId,
    toolModal?: 'timing' | 'torque' | 'oil' | 'coolant'
  ) => {
    setCurrentMode('assembly');
    if (partId) {
      const part = ENGINE_PARTS.find((p) => p.id === partId);
      if (part) {
        setSelectedPart(part);
      }
    }
    if (toolModal) {
      setActiveModal(toolModal);
      if (toolModal === 'torque' && partId) {
        const part = ENGINE_PARTS.find((p) => p.id === partId);
        if (part) setModalPart(part);
      }
    }
    showToast(
      partId
        ? `🛠️ En el taller para solucionar: ${ENGINE_PARTS.find((p) => p.id === partId)?.name || partId}. ¡Móntala o ajústala y vuelve al Banco Dyno!`
        : '🛠️ Listo en el taller. Completa el montaje del motor y pulsa "Pasar a Banco Dyno".',
      'info'
    );
  };

  // Dismount a part (and recursively any parts that depend on it)
  const handleDismountPart = (partId: EnginePartId) => {
    ensureTimerStarted();

    // Find all dependent parts
    const partsToRemove = new Set<EnginePartId>([partId]);
    let addedAny = true;
    while (addedAny) {
      addedAny = false;
      for (const p of ENGINE_PARTS) {
        if (!partsToRemove.has(p.id) && installedPartIds.includes(p.id)) {
          if (p.prerequisites.some((req) => partsToRemove.has(req))) {
            partsToRemove.add(p.id);
            addedAny = true;
          }
        }
      }
    }

    setInstalledPartIds((prev) => prev.filter((id) => !partsToRemove.has(id)));
    setStats((prev) => ({
      ...prev,
      dismountCount: prev.dismountCount + 1,
    }));

    showToast(
      `Pieza desmontada${partsToRemove.size > 1 ? ` (y ${partsToRemove.size - 1} partes vinculadas)` : ''}.`,
      'info'
    );
  };

  // Quick auto-assemble for instantaneous test bench readiness
  const handleQuickAssemble = () => {
    const allIds = ENGINE_PARTS.map((p) => p.id);
    setInstalledPartIds(allIds);

    const torques: Record<EnginePartId, number> = {} as Record<EnginePartId, number>;
    ENGINE_PARTS.forEach((p) => {
      if (p.torqueRequiredNm) {
        torques[p.id] = p.torqueRequiredNm;
      }
    });
    setPartTorques(torques);
    setTimingOffsetTeeth(0);
    setOilLevel(80);
    setCoolantLiters(5.0);

    setStats((prev) => ({
      ...prev,
      correctPlacements: 15,
      elapsedSeconds: Math.max(prev.elapsedSeconds, 45), // standard simulated auto-assembly duration
    }));

    showToast('¡Motor 100% armado y fluidos calibrados (Aceite 4.5L + Refrigerante 5.0L)! Listo para el Dyno.', 'success');
  };

  // Reset engine and timer
  const handleResetEngine = () => {
    soundEngine.stopEngine();
    soundEngine.stopCranking();
    setInstalledPartIds([]);
    setPartTorques({});
    setTimingOffsetTeeth(2); // Levas fuera de punto (+2 dientes)
    setOilLevel(0);
    setCoolantLiters(0);
    setSelectedPart(ENGINE_PARTS[0]);
    setHasCompletedStart(false);
    setScorecard(null);
    setShowScorecardModal(false);
    setComboCount(0);
    setShowConfetti(false);

    try {
      localStorage.setItem('mecanicos_installed_parts', JSON.stringify([]));
      localStorage.setItem('mecanicos_part_torques', JSON.stringify({}));
      localStorage.setItem('mecanicos_timing_offset', '2');
      localStorage.setItem('mecanicos_oil_level', '0');
      localStorage.setItem('mecanicos_coolant_liters', '0');
    } catch {
      // ignore
    }

    setStats({
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      isRunning: false,
      correctPlacements: 0,
      failedAttempts: 0,
      dismountCount: 0,
      failedStartAttempts: 0,
      perfectTorqueCount: 0,
      perfectTiming: false, // Fuera de punto
      perfectOil: false,
      perfectCoolant: false,
    });

    setTrayShuffleKey(Date.now() + Math.random());
    setShowInitialAccessModal(true);
    showToast('Motor desmontado y banco de piezas barajado aleatoriamente. Configura tu partida para ingresar.', 'info');
  };

  // Automatically return the player to the workbench after confirming calibrations or fluids
  const handleReturnToWorkbench = (hintMessage?: string) => {
    setActiveModal(null);

    // Switch mobile view back to workbench so the player never gets lost on mobile
    setMobileTab('workbench');

    // Instantly reset scroll to top and ensure parts tray is cleanly brought into view on mobile
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;

      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const benchEl = document.getElementById('workshop-parts-bench');
        if (benchEl) {
          benchEl.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      });

      setTimeout(() => {
        const benchEl = document.getElementById('workshop-parts-bench');
        if (benchEl) {
          benchEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    }

    if (installedPartIds.length >= ENGINE_PARTS.length) {
      showToast('¡Motor 100% montado y calibrado! Pulsa "Ir al Banco de Pruebas" para arrancar el motor.', 'success');
    } else if (hintMessage) {
      showToast(hintMessage, 'info');
    }
  };

  // Open specific modals
  const handleOpenTorqueModal = (part: EnginePart) => {
    ensureTimerStarted();
    setModalPart(part);
    setActiveModal('torque');
  };

  const handleApplyTorque = (torque: number) => {
    if (modalPart) {
      setPartTorques((prev) => ({
        ...prev,
        [modalPart.id]: torque,
      }));

      const required = modalPart.torqueRequiredNm || 0;
      const isPerfect = Math.abs(torque - required) <= 2;
      if (isPerfect) {
        soundEngine.playToolSound('torque_click');
        addFloatingScore('+200 PTS Torque Exacto!');
        triggerAchievement('perfect_torque');
        showToast(
          `¡Par de apriete exacto registrado: ${torque} Nm en ${modalPart.name}!`,
          'success'
        );
      } else {
        showToast(
          `Par de apriete registrado: ${torque} Nm en ${modalPart.name}.`,
          'info'
        );
      }
    }
  };

  const handleSaveTiming = (offset: number) => {
    ensureTimerStarted();
    setTimingOffsetTeeth(offset);
    const isPerfect = offset === 0;
    setStats((prev) => ({
      ...prev,
      perfectTiming: isPerfect,
    }));
    if (isPerfect) {
      soundEngine.playToolSound('torque_click');
      addFloatingScore('+500 PTS Sincronía 0° PMS!');
      triggerAchievement('perfect_timing');
      showToast('¡Árboles de levas y distribución puestos en punto y sincronizados a 0° PMS!', 'success');
    } else {
      showToast(
        `Distribución ajustada con desfase de ${offset} dientes (${offset * 18}°). Sigue fuera de punto.`,
        'warning'
      );
    }
  };

  const handleSaveOilLevel = (level: number) => {
    ensureTimerStarted();
    setOilLevel(level);
    if (level >= 70 && coolantLiters >= 4.5) {
      triggerAchievement('oil_coolant');
    }
    showToast(`Nivel de aceite fijado al ${level}%.`, 'success');
  };

  const handleSaveCoolantLevel = (liters: number) => {
    ensureTimerStarted();
    setCoolantLiters(liters);
    if (oilLevel >= 70 && liters >= 4.5) {
      triggerAchievement('oil_coolant');
    }
    showToast(`Nivel de refrigerante fijado en ${liters.toFixed(1)} / 5.0 Litros.`, 'success');
  };

  // Dyno event: Successful engine start!
  const handleEngineStartedSuccessfully = () => {
    // Stop the timer
    const finalElapsed = stats.elapsedSeconds;
    const finalStats: AssemblyStats = {
      ...stats,
      isRunning: false,
      endTime: Date.now(),
      elapsedSeconds: finalElapsed,
    };
    setStats(finalStats);
    setHasCompletedStart(true);

    // Trigger celebration effects
    soundEngine.playStageClear();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);
    triggerAchievement('dyno_started');

    // Compute final scorecard
    const finalBreakdown = calculateFinalScore(
      finalStats,
      installedPartIds,
      partTorques,
      timingOffsetTeeth,
      oilLevel,
      coolantLiters,
      difficulty
    );
    setScorecard(finalBreakdown);

    // Automatically register score into the Top 10 Leaderboard!
    const effectiveName = (playerName && playerName.trim()) || 'Piloto Dakar';
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()}`;

    const { entry, rankPosition } = saveLeaderboardRecord(
      {
        playerName: effectiveName,
        timeSeconds: finalElapsed > 0 ? finalElapsed : 60,
        timeFormatted: finalBreakdown.elapsedTimeFormatted,
        score: finalBreakdown.totalScore,
        accuracyPercent: finalBreakdown.accuracyPercent,
        grade: finalBreakdown.rankGrade,
        rankTitle: finalBreakdown.rankTitle,
        date: dateStr,
        difficulty,
      },
      currentPlayerRecordId
    );

    setCurrentPlayerRecordId(entry.id);

    showToast(
      `¡Motor en marcha! ${effectiveName} clasificado #${rankPosition} en el Top 10 (${finalBreakdown.totalScore.toLocaleString()} PTS). Usa el pedal para acelerar.`,
      'success'
    );
  };

  // Dyno event: Failed start attempt
  const handleEngineFailedStart = () => {
    setStats((prev) => ({
      ...prev,
      failedStartAttempts: prev.failedStartAttempts + 1,
    }));
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const isAllAssembled = installedPartIds.length === ENGINE_PARTS.length;

  // Real-time live score calculation
  const liveScorecard = calculateFinalScore(
    stats,
    installedPartIds,
    partTorques,
    timingOffsetTeeth,
    oilLevel,
    coolantLiters,
    difficulty
  );

  return (
    <div className="min-h-screen bg-[#06090f] text-gray-200 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Immersive Game-Themed Dakar Racing Workshop Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/assets/aistudio/fondo-mecanica_d81652bf.jpg"
          alt="Fondo Taller de Mecánica y Motor Deportivo"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-opacity duration-300 scale-[1.01] ${
            bgIntensity === 'maximo'
              ? 'opacity-90'
              : bgIntensity === 'intenso'
              ? 'opacity-75'
              : 'opacity-50'
          }`}
        />
        {/* Soft Vignette Overlay: keeps image clearly visible while preserving text readability */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            bgIntensity === 'maximo'
              ? 'bg-gradient-to-b from-[#06090f]/40 via-transparent to-[#06090f]/65'
              : bgIntensity === 'intenso'
              ? 'bg-gradient-to-b from-[#06090f]/60 via-[#06090f]/25 to-[#06090f]/75'
              : 'bg-gradient-to-b from-[#06090f]/75 via-[#06090f]/50 to-[#06090f]/85'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* App Foreground Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Workshop Navigation Header with Engine Puzzle Car branding */}
        <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        installedCount={installedPartIds.length}
        totalPartsCount={ENGINE_PARTS.length}
        onOpenManual={() => setActiveModal('manual')}
        onResetEngine={handleResetEngine}
        onQuickAssemble={handleQuickAssemble}
        isMuted={isMuted}
        onToggleSound={toggleSound}
        elapsedSeconds={stats.elapsedSeconds}
        isTimerRunning={stats.isRunning}
        currentScore={liveScorecard.totalScore}
        accuracyPercent={liveScorecard.accuracyPercent}
        hasCompletedStart={hasCompletedStart}
        onOpenScorecard={() => setShowScorecardModal(true)}
        playerName={playerName}
        difficulty={difficulty}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onEditPlayerName={() => setShowInitialAccessModal(true)}
        onOpenAccessModal={() => setShowInitialAccessModal(true)}
        visitCountFormatted={visitInfo.formatted}
        unlockedAchievementsCount={unlockedAchievements.length}
        onOpenAchievements={() => setShowAchievementsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-6 space-y-3.5 sm:space-y-5">
        {/* Automotive Workshop Precision Livery Strip */}
        <div className="bg-[#0b101a]/85 backdrop-blur-md border border-[#232f42] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm shadow-md w-full">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-racing text-white tracking-wide flex items-center gap-1 text-xs sm:text-sm">
              <span className="text-amber-400 font-extrabold">JUEGO DE MEMORIA:</span>
              <span className="text-cyan-300 font-bold">MOTOR 2.0L TURBO 16V</span>
            </span>
            <span className="text-gray-600 hidden md:inline">|</span>
            <span className="text-gray-300 font-mono-tech hidden md:inline text-xs">
              1998cc • 280 HP • 380 Nm • Orden 1-3-4-2
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 font-mono-tech text-xs ml-auto sm:ml-0 flex-wrap">
            {/* Odometer Visit Counter Badge */}
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#070b12] border border-amber-500/30 text-amber-300 font-mono-tech text-[11px] shadow-inner"
              title="Numerador de visitas registradas en el taller"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-extrabold text-amber-300 tracking-wider">#{visitInfo.formatted}</span>
            </div>

            <span className="text-gray-300 text-[11px] sm:text-xs">
              Mecánico: <strong className="text-amber-300">{playerName}</strong>
            </span>

            {/* Prominent Mobile & Desktop Restart Button */}
            <button
              onClick={handleResetEngine}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white border border-red-500/50 cursor-pointer transition-all active:scale-95 text-xs font-racing font-bold shadow-md min-h-[32px]"
              title="Reiniciar el juego y barajar de nuevo el banco de piezas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Reiniciar</span>
            </button>

            {/* Arcade Achievements Trigger Button */}
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 hover:text-white border border-purple-500/40 cursor-pointer transition-colors text-xs font-racing min-h-[32px]"
              title="Abrir Logros y Trofeos Arcade del Taller"
            >
              <span>🏆 Logros [{unlockedAchievements.length}/7]</span>
            </button>

            {/* Background view & intensity toggle */}
            <button
              onClick={() => {
                setBgIntensity((prev) =>
                  prev === 'intenso' ? 'maximo' : prev === 'maximo' ? 'sutil' : 'intenso'
                );
              }}
              className="px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/40 cursor-pointer transition-colors text-xs font-racing min-h-[32px] flex items-center gap-1"
              title="Cambiar visibilidad de la imagen de fondo del taller"
            >
              <span>🖼️ Fondo: {bgIntensity}</span>
            </button>

            <button
              onClick={() => setShowInitialAccessModal(true)}
              className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700 cursor-pointer transition-colors text-xs font-racing min-h-[32px]"
            >
              ⚙️ Ficha
            </button>
          </div>
        </div>

        {/* Toast / Notification banner */}
        {notification && (
          <div
            className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border flex items-center justify-between text-xs transition-all duration-300 shadow-xl gap-2 w-full ${
              notification.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : notification.type === 'warning'
                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                : 'bg-blue-950/50 border-blue-500/40 text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />}
              {notification.type === 'info' && <Info className="w-4 h-4 shrink-0 text-blue-400" />}
              <span className="font-medium leading-snug break-words text-xs">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-white px-2 py-1 text-sm font-bold cursor-pointer shrink-0"
              title="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Mode 1: Assembly Workshop */}
        {currentMode === 'assembly' && (
          <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-0">
            {/* Quick Switch to Dyno Test Stand Bar */}
            <div className="bg-gradient-to-r from-[#0d131f] via-[#1a2336] to-[#0d131f] border-2 border-amber-500/50 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl w-full">
              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-red-500/20 to-blue-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <Gauge className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h4 className="font-racing font-bold text-sm sm:text-base text-white">
                      Banco Dyno de Pruebas
                    </h4>
                    <span className="text-[10px] sm:text-xs font-mono-tech px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      {installedPartIds.length}/15 Piezas Montadas
                    </span>
                    {installedPartIds.length === 15 && (
                      <span className="text-[10px] sm:text-xs font-mono-tech px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">
                        ¡Motor Listo!
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-300 break-words leading-relaxed mt-0.5">
                    Pasa al Dyno en cualquier momento para probar arranque, compresión y ver los pistones.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentMode('dyno')}
                className="w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 min-h-[42px]"
              >
                <Gauge className="w-4 h-4 text-white" />
                <span>PASAR A BANCO DYNO</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Mobile View Switcher Tabs (Only on small screens to easily jump between workbench and engine) */}
            <div className="lg:hidden flex items-center bg-[#0d121c] p-1 rounded-2xl border border-gray-800 text-xs font-racing font-bold shadow-md">
              <button
                onClick={() => setMobileTab('both')}
                className={`flex-1 py-2 px-1 rounded-xl text-center transition-all cursor-pointer min-h-[38px] ${
                  mobileTab === 'both'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 Completo
              </button>
              <button
                onClick={() => setMobileTab('workbench')}
                className={`flex-1 py-2 px-1 rounded-xl text-center transition-all cursor-pointer min-h-[38px] ${
                  mobileTab === 'workbench'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🧩 Piezas ({ENGINE_PARTS.length - installedPartIds.length})
              </button>
              <button
                onClick={() => setMobileTab('engine')}
                className={`flex-1 py-2 px-1 rounded-xl text-center transition-all cursor-pointer min-h-[38px] ${
                  mobileTab === 'engine'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚙️ Motor 2.0L ({installedPartIds.length}/15)
              </button>
            </div>

            {/* 1. Banco de Trabajo (Piezas aleatorias, herramientas y mesa de ensamble) */}
            <div
              id="workshop-parts-bench"
              className={`scroll-mt-20 ${mobileTab === 'engine' ? 'hidden lg:block' : 'block'}`}
            >
              <PartsTray
                parts={ENGINE_PARTS}
                installedPartIds={installedPartIds}
                selectedPartId={selectedPart?.id || null}
                onSelectPart={(part) => setSelectedPart(part)}
                onMountPart={handleMountPart}
                difficulty={difficulty}
                onChangeDifficulty={() => setShowInitialAccessModal(true)}
                shuffleKey={trayShuffleKey}
              />
            </div>

            {/* 2. Cuadro Motor 2.0L 16V Turbo (Visualizador Dinámico & Ficha de Calibración) */}
            <div
              id="engine-workbench-stand"
              className={`grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch scroll-mt-20 ${
                mobileTab === 'workbench' ? 'hidden lg:grid' : 'grid'
              }`}
            >
              {/* Left: Engine Stand Visualizer (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <EngineVisualizer
                  installedPartIds={installedPartIds}
                  onSelectPart={(part) => setSelectedPart(part)}
                  activePartId={selectedPart?.id}
                  timingOffsetTeeth={timingOffsetTeeth}
                  onOpenTimingModal={() => setActiveModal('timing')}
                />
              </div>

              {/* Right: Active Part Inspection & Assembly Actions (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <PartDetailsCard
                  part={selectedPart}
                  installedPartIds={installedPartIds}
                  partTorques={partTorques}
                  timingOffsetTeeth={timingOffsetTeeth}
                  oilLevel={oilLevel}
                  coolantLiters={coolantLiters}
                  onMountPart={handleMountPart}
                  onDismountPart={handleDismountPart}
                  onOpenTorqueModal={handleOpenTorqueModal}
                  onOpenTimingModal={() => setActiveModal('timing')}
                  onOpenOilModal={() => setActiveModal('oil')}
                  onOpenCoolantModal={() => setActiveModal('coolant')}
                  allParts={ENGINE_PARTS}
                  difficulty={difficulty}
                  onGoToDyno={() => setCurrentMode('dyno')}
                />
              </div>
            </div>

            {/* Callout if all parts are assembled: prompt to dyno test! */}
            {isAllAssembled && (
              <div className="bg-gradient-to-r from-amber-600/20 via-red-600/20 to-blue-600/20 border border-amber-500/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-racing font-bold text-sm sm:text-base text-white">
                      ¡Ensamble Completo del Motor 2.0L Turbo! (15 Piezas)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-300">
                      Has colocado las 15 piezas y los fluidos en {liveScorecard.elapsedTimeFormatted}. Pasa al Banco de Pruebas (Dyno) para arrancarlo y registrar tu récord como <strong className="text-amber-300">{playerName}</strong>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentMode('dyno')}
                  className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-racing font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shrink-0 min-h-[44px]"
                >
                  Ir al Banco de Pruebas
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Floating Thumb Action Bar when browsing workbench on phone */}
            {selectedPart && (
              <div className="lg:hidden fixed bottom-2 left-2 right-2 z-30 bg-[#0d121c]/95 border-2 border-amber-500/60 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#090d14] border border-gray-700 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono-tech text-amber-400 block truncate">
                      Seleccionada:
                    </span>
                    <h4 className="font-racing font-bold text-xs text-white truncate">
                      {selectedPart.shortName}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!installedPartIds.includes(selectedPart.id) ? (
                    <button
                      onClick={() => handleMountPart(selectedPart.id)}
                      className={`py-2 px-3 font-racing font-bold text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 cursor-pointer min-h-[38px] ${
                        difficulty === 'aprendiz' && selectedPart.prerequisites.every((id) => installedPartIds.includes(id))
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-2 ring-blue-400/40 animate-pulse'
                          : 'bg-[#17202e] hover:bg-[#233147] text-white border border-[#2b3a52]'
                      }`}
                    >
                      <Wrench className={`w-3.5 h-3.5 ${difficulty === 'aprendiz' && selectedPart.prerequisites.every((id) => installedPartIds.includes(id)) ? 'text-white' : 'text-amber-400'}`} />
                      <span>
                        {difficulty === 'aprendiz' && selectedPart.prerequisites.every((id) => installedPartIds.includes(id)) ? 'Montar (¡Listo!)' : 'Montar'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-racing text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1.5 rounded-xl font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Montado
                    </span>
                  )}

                  <button
                    onClick={() => setMobileTab('engine')}
                    className="py-2 px-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-racing rounded-xl cursor-pointer min-h-[38px] flex items-center justify-center"
                    title="Ver en el Motor"
                  >
                    ⚙️
                  </button>

                  <button
                    onClick={handleResetEngine}
                    className="py-2 px-2.5 bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/40 text-xs font-racing rounded-xl cursor-pointer min-h-[38px] flex items-center justify-center active:scale-95"
                    title="Reiniciar partida"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Dyno & Test Stand */}
        {currentMode === 'dyno' && (
          <div className="space-y-6">
            <DynoTestStand
              installedPartIds={installedPartIds}
              partTorques={partTorques}
              timingOffsetTeeth={timingOffsetTeeth}
              oilLevel={oilLevel}
              coolantLiters={coolantLiters}
              onReturnToWorkshop={() => setCurrentMode('assembly')}
              onGoToWorkshopFix={handleGoToWorkshopFix}
              onEngineStartedSuccessfully={handleEngineStartedSuccessfully}
              onEngineFailedStart={handleEngineFailedStart}
              onOpenScorecard={() => setShowScorecardModal(true)}
              elapsedSeconds={stats.elapsedSeconds}
              currentScore={liveScorecard.totalScore}
              onOpenTimingModal={() => setActiveModal('timing')}
            />
          </div>
        )}
      </main>

      {/* Dakar Workshop & Mechanics Utility Software Footer */}
      <Footer
        visitCountFormatted={visitInfo.formatted}
        totalPartsCount={ENGINE_PARTS.length}
      />
      </div>

      {/* Arcade Celebration Overlays (Particles Confetti, Floating Scores, Streak Banner & Achievement Toasts) */}
      <ArcadeCelebration
        showConfetti={showConfetti}
        comboCount={comboCount}
        floatingScores={floatingScores}
        achievementNotification={achievementToast}
        onDismissAchievement={() => setAchievementToast(null)}
      />

      {/* Arcade Achievements & Trophies Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          unlockedIds={unlockedAchievements}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}

      {/* Initial Access & Difficulty Portal Modal */}
      {showInitialAccessModal && (
        <InitialAccessModal
          currentName={playerName}
          currentDifficulty={difficulty}
          onConfirm={handleConfirmInitialAccess}
          onClose={() => setShowInitialAccessModal(false)}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          isFirstVisit={false}
          visitCountFormatted={visitInfo.formatted}
        />
      )}

      {/* Modals */}
      {showScorecardModal && scorecard && (
        <ScorecardModal
          scorecard={scorecard}
          playerName={playerName}
          difficulty={difficulty}
          onUpdatePlayerName={handleUpdatePlayerName}
          onClose={() => setShowScorecardModal(false)}
          onResetGame={handleResetEngine}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          currentPlayerId={currentPlayerRecordId}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}

      {showNameModal && (
        <ParticipantNameModal
          currentName={playerName}
          onSave={handleUpdatePlayerName}
          onClose={() => setShowNameModal(false)}
        />
      )}

      {activeModal === 'torque' && modalPart && (
        <TorqueWrenchModal
          part={modalPart}
          currentTorque={partTorques[modalPart.id] || 0}
          onApplyTorque={handleApplyTorque}
          onClose={() => handleReturnToWorkbench('¡Apriete confirmado! Selecciona la siguiente pieza en el banco.')}
        />
      )}

      {activeModal === 'timing' && (
        <TimingCalibrationModal
          currentOffsetTeeth={timingOffsetTeeth}
          onSaveTiming={handleSaveTiming}
          onClose={() => handleReturnToWorkbench('¡Distribución calada! Selecciona la siguiente pieza en el banco.')}
        />
      )}

      {activeModal === 'oil' && (
        <OilDipstickModal
          currentOilLevel={oilLevel}
          onSaveOilLevel={handleSaveOilLevel}
          onClose={() => handleReturnToWorkbench('¡Nivel de aceite registrado! Selecciona la siguiente pieza en el banco.')}
        />
      )}

      {activeModal === 'coolant' && (
        <CoolantModal
          currentCoolantLiters={coolantLiters}
          onSaveCoolantLevel={handleSaveCoolantLevel}
          onClose={() => handleReturnToWorkbench('¡Circuito de refrigeración registrado! Selecciona la siguiente pieza.')}
        />
      )}

      {activeModal === 'manual' && (
        <TechnicalManualModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

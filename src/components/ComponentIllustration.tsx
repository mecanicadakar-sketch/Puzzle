import React from 'react';
import { EnginePartId } from '../types/engine';

interface ComponentIllustrationProps {
  partId: EnginePartId;
  className?: string;
  size?: number;
}

export const ComponentIllustration: React.FC<ComponentIllustrationProps> = ({
  partId,
  className = '',
  size = 64,
}) => {
  const renderSvg = () => {
    switch (partId) {
      case 'crankcase_block':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="blockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* Engine block body */}
            <rect x="15" y="20" width="70" height="60" rx="8" fill="url(#blockGrad)" stroke="#64748b" strokeWidth="2.5" />
            {/* Cylinders bores */}
            <rect x="22" y="28" width="11" height="34" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <rect x="37" y="28" width="11" height="34" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <rect x="52" y="28" width="11" height="34" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <rect x="67" y="28" width="11" height="34" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            {/* Cylinder hone hatch marks */}
            <line x1="23" y1="35" x2="31" y2="42" stroke="#60a5fa" strokeWidth="0.8" opacity="0.6" />
            <line x1="38" y1="35" x2="46" y2="42" stroke="#60a5fa" strokeWidth="0.8" opacity="0.6" />
            <line x1="53" y1="35" x2="61" y2="42" stroke="#60a5fa" strokeWidth="0.8" opacity="0.6" />
            <line x1="68" y1="35" x2="76" y2="42" stroke="#60a5fa" strokeWidth="0.8" opacity="0.6" />
            {/* Crankcase saddles */}
            <path d="M 18 80 Q 28 68 38 80" fill="none" stroke="#64748b" strokeWidth="2" />
            <path d="M 48 80 Q 58 68 68 80" fill="none" stroke="#64748b" strokeWidth="2" />
            {/* Mounting ears */}
            <circle cx="10" cy="50" r="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="90" cy="50" r="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
        );

      case 'crankshaft':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="crankMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {/* Main shaft axis */}
            <line x1="12" y1="50" x2="88" y2="50" stroke="url(#crankMetal)" strokeWidth="6" strokeLinecap="round" />
            {/* Counterweights */}
            <path d="M 22 50 C 22 28 34 28 34 50 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 38 50 C 38 72 50 72 50 50 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 52 50 C 52 28 64 28 64 50 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 68 50 C 68 72 80 72 80 50 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Rod journals */}
            <circle cx="28" cy="36" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="44" cy="64" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="58" cy="36" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="74" cy="64" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            {/* Flywheel flange */}
            <rect x="84" y="32" width="6" height="36" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          </svg>
        );

      case 'pistons_rods':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="pistonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            {/* Piston crown */}
            <rect x="25" y="15" width="50" height="26" rx="4" fill="url(#pistonGrad)" stroke="#475569" strokeWidth="2" />
            {/* Piston ring grooves */}
            <line x1="25" y1="21" x2="75" y2="21" stroke="#334155" strokeWidth="1.5" />
            <line x1="25" y1="26" x2="75" y2="26" stroke="#334155" strokeWidth="1.5" />
            <line x1="25" y1="31" x2="75" y2="31" stroke="#334155" strokeWidth="1.5" />
            {/* Wrist pin */}
            <circle cx="50" cy="34" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            {/* Connecting rod H-beam */}
            <path d="M 46 38 L 44 72 L 40 78 L 60 78 L 56 72 L 54 38 Z" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
            {/* Rod beam slot */}
            <line x1="50" y1="44" x2="50" y2="68" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            {/* Rod big end journal */}
            <circle cx="50" cy="82" r="9" fill="none" stroke="#f59e0b" strokeWidth="3" />
            {/* Rod bolts */}
            <circle cx="39" cy="82" r="2" fill="#ef4444" />
            <circle cx="61" cy="82" r="2" fill="#ef4444" />
          </svg>
        );

      case 'oil_pan':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="panGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Gasket flange */}
            <rect x="10" y="28" width="80" height="8" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Bolt holes */}
            <circle cx="16" cy="32" r="1.5" fill="#1e293b" />
            <circle cx="34" cy="32" r="1.5" fill="#1e293b" />
            <circle cx="50" cy="32" r="1.5" fill="#1e293b" />
            <circle cx="66" cy="32" r="1.5" fill="#1e293b" />
            <circle cx="84" cy="32" r="1.5" fill="#1e293b" />
            {/* Pan sump basin */}
            <path d="M 16 36 L 22 74 C 24 78 30 80 36 80 L 76 80 C 82 80 84 76 84 66 L 84 36 Z" fill="url(#panGrad)" stroke="#475569" strokeWidth="2" />
            {/* Cooling fins */}
            <line x1="28" y1="48" x2="80" y2="48" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
            <line x1="29" y1="56" x2="80" y2="56" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
            <line x1="31" y1="64" x2="80" y2="64" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
            {/* Magnetic drain plug */}
            <rect x="22" y="74" width="8" height="10" rx="1" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          </svg>
        );

      case 'head_gasket':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* MLS gasket plate */}
            <rect x="12" y="25" width="76" height="50" rx="4" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            {/* 4 Fire rings with copper finish */}
            <circle cx="24" cy="50" r="10" fill="#0f172a" stroke="#ea580c" strokeWidth="2.5" />
            <circle cx="41" cy="50" r="10" fill="#0f172a" stroke="#ea580c" strokeWidth="2.5" />
            <circle cx="59" cy="50" r="10" fill="#0f172a" stroke="#ea580c" strokeWidth="2.5" />
            <circle cx="76" cy="50" r="10" fill="#0f172a" stroke="#ea580c" strokeWidth="2.5" />
            {/* Oil & coolant pass-through holes */}
            <circle cx="16" cy="32" r="2.5" fill="#38bdf8" />
            <circle cx="33" cy="32" r="2.5" fill="#38bdf8" />
            <circle cx="50" cy="32" r="2.5" fill="#38bdf8" />
            <circle cx="67" cy="32" r="2.5" fill="#38bdf8" />
            <circle cx="84" cy="32" r="2.5" fill="#38bdf8" />
            <circle cx="16" cy="68" r="2.5" fill="#f59e0b" />
            <circle cx="84" cy="68" r="2.5" fill="#f59e0b" />
          </svg>
        );

      case 'cylinder_head':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Cylinder head block */}
            <rect x="12" y="30" width="76" height="46" rx="6" fill="#475569" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Intake & exhaust valve stems */}
            <rect x="20" y="16" width="3" height="24" fill="#60a5fa" rx="1" />
            <rect x="28" y="16" width="3" height="24" fill="#f97316" rx="1" />
            <rect x="37" y="16" width="3" height="24" fill="#60a5fa" rx="1" />
            <rect x="45" y="16" width="3" height="24" fill="#f97316" rx="1" />
            <rect x="54" y="16" width="3" height="24" fill="#60a5fa" rx="1" />
            <rect x="62" y="16" width="3" height="24" fill="#f97316" rx="1" />
            <rect x="71" y="16" width="3" height="24" fill="#60a5fa" rx="1" />
            <rect x="79" y="16" width="3" height="24" fill="#f97316" rx="1" />
            {/* Valve spring caps */}
            <circle cx="21.5" cy="18" r="3.5" fill="#3b82f6" />
            <circle cx="29.5" cy="18" r="3.5" fill="#ea580c" />
            <circle cx="38.5" cy="18" r="3.5" fill="#3b82f6" />
            <circle cx="46.5" cy="18" r="3.5" fill="#ea580c" />
            <circle cx="55.5" cy="18" r="3.5" fill="#3b82f6" />
            <circle cx="63.5" cy="18" r="3.5" fill="#ea580c" />
            <circle cx="72.5" cy="18" r="3.5" fill="#3b82f6" />
            <circle cx="80.5" cy="18" r="3.5" fill="#ea580c" />
            {/* Spark plug central bores */}
            <circle cx="25" cy="52" r="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="42" cy="52" r="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="59" cy="52" r="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="76" cy="52" r="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
          </svg>
        );

      case 'camshafts':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Twin Camshaft bars */}
            {/* Intake Cam (Upper) */}
            <line x1="15" y1="35" x2="85" y2="35" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            {/* Intake Cam Lobes (egg-shaped) */}
            <ellipse cx="28" cy="32" rx="4" ry="7" fill="#8b5cf6" transform="rotate(-15 28 32)" />
            <ellipse cx="44" cy="38" rx="4" ry="7" fill="#8b5cf6" transform="rotate(35 44 38)" />
            <ellipse cx="60" cy="32" rx="4" ry="7" fill="#8b5cf6" transform="rotate(-40 60 32)" />
            <ellipse cx="76" cy="37" rx="4" ry="7" fill="#8b5cf6" transform="rotate(20 76 37)" />
            <circle cx="15" cy="35" r="7" fill="#475569" stroke="#c084fc" strokeWidth="2" />

            {/* Exhaust Cam (Lower) */}
            <line x1="15" y1="65" x2="85" y2="65" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            {/* Exhaust Cam Lobes */}
            <ellipse cx="28" cy="68" rx="4" ry="7" fill="#a855f7" transform="rotate(30 28 68)" />
            <ellipse cx="44" cy="62" rx="4" ry="7" fill="#a855f7" transform="rotate(-25 44 62)" />
            <ellipse cx="60" cy="69" rx="4" ry="7" fill="#a855f7" transform="rotate(45 60 69)" />
            <ellipse cx="76" cy="62" rx="4" ry="7" fill="#a855f7" transform="rotate(-30 76 62)" />
            <circle cx="15" cy="65" r="7" fill="#475569" stroke="#c084fc" strokeWidth="2" />
          </svg>
        );

      case 'timing_belt':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Dual Cam gears */}
            <circle cx="34" cy="32" r="16" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" />
            <circle cx="34" cy="32" r="5" fill="#475569" />
            <circle cx="66" cy="32" r="16" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" />
            <circle cx="66" cy="32" r="5" fill="#475569" />
            {/* Crank pulley (bottom) */}
            <circle cx="50" cy="74" r="14" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" />
            <circle cx="50" cy="74" r="4" fill="#475569" />
            {/* Tensioner pulley (middle) */}
            <circle cx="28" cy="56" r="7" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Toothed timing belt loop */}
            <path
              d="M 22 28 C 16 38 18 64 36 78 C 50 88 64 78 78 54 C 84 40 82 24 66 18 L 34 18 C 26 18 22 22 22 28 Z"
              fill="none"
              stroke="#0f172a"
              strokeWidth="5"
              strokeDasharray="2,2"
            />
            {/* Timing Alignment Dots (PMS Marks) */}
            <circle cx="34" cy="16" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="66" cy="16" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <polygon points="50,60 47,65 53,65" fill="#ef4444" />
          </svg>
        );

      case 'valve_cover':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="coverRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            {/* Magnesium Valve cover */}
            <path d="M 14 36 L 22 22 L 78 22 L 86 36 L 88 72 L 12 72 Z" fill="url(#coverRed)" stroke="#f87171" strokeWidth="2.5" />
            {/* DOHC Embossed logo bar */}
            <rect x="28" y="32" width="44" height="12" rx="3" fill="#1e293b" stroke="#fca5a5" strokeWidth="1" />
            <text x="50" y="41" fill="#f87171" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              16V DOHC TURBO
            </text>
            {/* Chrome oil fill cap */}
            <circle cx="75" cy="54" r="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
            <rect x="71" y="52" width="8" height="4" fill="#475569" />
            {/* Spark plug well seals */}
            <circle cx="28" cy="54" r="4.5" fill="#0f172a" stroke="#fca5a5" strokeWidth="1" />
            <circle cx="42" cy="54" r="4.5" fill="#0f172a" stroke="#fca5a5" strokeWidth="1" />
            <circle cx="56" cy="54" r="4.5" fill="#0f172a" stroke="#fca5a5" strokeWidth="1" />
          </svg>
        );

      case 'spark_plugs':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Coil On Plug assembly & Spark plug */}
            {/* Coil pack head */}
            <rect x="36" y="10" width="28" height="18" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            {/* Connector */}
            <rect x="44" y="6" width="12" height="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
            {/* Ceramic insulator ribbed body */}
            <rect x="43" y="28" width="14" height="26" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="43" y1="34" x2="57" y2="34" stroke="#94a3b8" strokeWidth="1" />
            <line x1="43" y1="40" x2="57" y2="40" stroke="#94a3b8" strokeWidth="1" />
            <line x1="43" y1="46" x2="57" y2="46" stroke="#94a3b8" strokeWidth="1" />
            {/* Hex nut */}
            <polygon points="40,54 60,54 64,62 36,62" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
            {/* Threaded steel shaft */}
            <rect x="44" y="62" width="12" height="18" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
            <line x1="44" y1="66" x2="56" y2="66" stroke="#475569" strokeWidth="1" />
            <line x1="44" y1="71" x2="56" y2="71" stroke="#475569" strokeWidth="1" />
            <line x1="44" y1="76" x2="56" y2="76" stroke="#475569" strokeWidth="1" />
            {/* Ground electrode & spark */}
            <path d="M 46 80 L 46 88 L 52 88" fill="none" stroke="#64748b" strokeWidth="2" />
            <circle cx="50" cy="84" r="1.5" fill="#f59e0b" />
            {/* Electric spark lightning */}
            <polygon points="50,81 48,84 52,84 49,87" fill="#38bdf8" />
          </svg>
        );

      case 'intake_manifold':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Aluminum plenum tube */}
            <rect x="15" y="24" width="70" height="18" rx="8" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            {/* Throttle body inlet (left) */}
            <rect x="6" y="26" width="12" height="14" rx="2" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
            {/* 4 Curved intake runners */}
            <path d="M 24 42 Q 22 65 24 78" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            <path d="M 40 42 Q 38 65 40 78" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            <path d="M 58 42 Q 56 65 58 78" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            <path d="M 74 42 Q 72 65 74 78" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            {/* Fuel rail (horizontal purple tube) */}
            <line x1="18" y1="66" x2="82" y2="66" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
            {/* 4 Fuel Injectors */}
            <circle cx="24" cy="66" r="3" fill="#38bdf8" />
            <circle cx="40" cy="66" r="3" fill="#38bdf8" />
            <circle cx="58" cy="66" r="3" fill="#38bdf8" />
            <circle cx="74" cy="66" r="3" fill="#38bdf8" />
          </svg>
        );

      case 'exhaust_turbo':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Exhaust tubular header */}
            <path d="M 18 20 C 18 42 36 50 48 50" fill="none" stroke="#ea580c" strokeWidth="4" />
            <path d="M 30 20 C 30 40 40 48 48 50" fill="none" stroke="#ea580c" strokeWidth="4" />
            <path d="M 64 20 C 64 40 56 48 48 50" fill="none" stroke="#ea580c" strokeWidth="4" />
            {/* Turbocharger snail housing */}
            <circle cx="58" cy="62" r="22" fill="#78350f" stroke="#f97316" strokeWidth="2.5" />
            <circle cx="58" cy="62" r="14" fill="#1e293b" stroke="#ea580c" strokeWidth="1.5" />
            {/* Compressor wheel blades */}
            <polygon points="58,52 61,62 55,62" fill="#cbd5e1" />
            <polygon points="58,72 61,62 55,62" fill="#cbd5e1" />
            <polygon points="48,62 58,59 58,65" fill="#cbd5e1" />
            <polygon points="68,62 58,59 58,65" fill="#cbd5e1" />
            <circle cx="58" cy="62" r="3.5" fill="#f59e0b" />
            {/* Wastegate actuator */}
            <rect x="76" y="44" width="14" height="10" rx="3" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="70" y1="49" x2="76" y2="49" stroke="#94a3b8" strokeWidth="2" />
          </svg>
        );

      case 'starter_motor':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Main starter motor armature cylinder */}
            <rect x="18" y="38" width="50" height="36" rx="6" fill="#1e293b" stroke="#eab308" strokeWidth="2.5" />
            {/* Solenoid upper cylinder */}
            <rect x="26" y="18" width="34" height="22" rx="4" fill="#334155" stroke="#ca8a04" strokeWidth="2" />
            {/* Electrical terminal posts */}
            <circle cx="20" cy="24" r="3" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
            <circle cx="20" cy="34" r="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            {/* Heavy copper cable bridge */}
            <path d="M 23 34 Q 32 36 32 44" fill="none" stroke="#f97316" strokeWidth="3" />
            {/* Bendix nose cone & pinion gear */}
            <path d="M 68 44 L 86 50 L 86 62 L 68 68 Z" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            <rect x="84" y="52" width="6" height="8" fill="#eab308" />
            <circle cx="87" cy="56" r="2" fill="#1e293b" />
          </svg>
        );

      case 'oil_fluid':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            {/* Synthetic Oil Canister / Bottle */}
            <path d="M 25 36 L 35 22 L 65 22 L 75 36 L 75 80 L 25 80 Z" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />
            {/* Bottle cap */}
            <rect x="42" y="14" width="16" height="9" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
            {/* Label */}
            <rect x="32" y="40" width="36" height="26" rx="3" fill="#0f172a" stroke="#fef3c7" strokeWidth="1" />
            <text x="50" y="52" fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              5W-40
            </text>
            <text x="50" y="60" fill="#e2e8f0" fontSize="5" textAnchor="middle" fontFamily="sans-serif">
              SYNTHETIC
            </text>
            {/* Chrome Dipstick across bottle */}
            <line x1="72" y1="12" x2="88" y2="82" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="70" cy="12" r="4" fill="none" stroke="#eab308" strokeWidth="2" />
            <line x1="84" y1="68" x2="88" y2="70" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="86" y1="76" x2="90" y2="78" stroke="#ef4444" strokeWidth="1.5" />
          </svg>
        );

      case 'coolant_fluid':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="coolantGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="60%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            {/* Expansion reservoir tank */}
            <path
              d="M 24 38 C 24 30 34 26 42 26 L 58 26 C 66 26 76 30 76 38 L 78 72 C 78 78 72 82 66 82 L 34 82 C 28 82 22 78 22 72 Z"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="2.5"
            />
            {/* Coolant fluid level (5.0 L) */}
            <path
              d="M 25 50 C 35 48 45 52 55 50 C 65 48 72 51 75 50 L 76 72 C 76 77 71 80 66 80 L 34 80 C 29 80 24 77 24 72 Z"
              fill="url(#coolantGrad)"
              opacity="0.85"
            />
            {/* Pressure safety radiator cap */}
            <rect x="42" y="16" width="16" height="10" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="50" cy="21" r="2" fill="#ef4444" />
            {/* Hose connection pipes */}
            <rect x="76" y="60" width="10" height="7" rx="1.5" fill="#334155" stroke="#475569" strokeWidth="1" />
            <rect x="14" y="44" width="10" height="6" rx="1.5" fill="#334155" stroke="#475569" strokeWidth="1" />
            {/* Capacity tick marks (MIN / MAX 5.0 L) */}
            <line x1="30" y1="48" x2="38" y2="48" stroke="#facc15" strokeWidth="1.5" />
            <text x="41" y="50" fill="#facc15" fontSize="5" fontWeight="bold" fontFamily="monospace">
              5.0L MAX
            </text>
            <line x1="30" y1="68" x2="38" y2="68" stroke="#ef4444" strokeWidth="1.5" />
            <text x="41" y="70" fill="#ef4444" fontSize="5" fontWeight="bold" fontFamily="monospace">
              MIN
            </text>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {renderSvg()}
    </div>
  );
};

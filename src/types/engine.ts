export type EnginePartId =
  | 'crankcase_block'
  | 'crankshaft'
  | 'pistons_rods'
  | 'oil_pan'
  | 'head_gasket'
  | 'cylinder_head'
  | 'camshafts'
  | 'timing_belt'
  | 'valve_cover'
  | 'spark_plugs'
  | 'intake_manifold'
  | 'exhaust_turbo'
  | 'starter_motor'
  | 'oil_fluid'
  | 'coolant_fluid';

export type PartCategory =
  | 'bloque'
  | 'alternativo'
  | 'culata'
  | 'perifericos'
  | 'fluidos';

export interface EnginePart {
  id: EnginePartId;
  name: string;
  shortName: string;
  category: PartCategory;
  orderNumber: number;
  prerequisites: EnginePartId[];
  prerequisiteFailureReason?: string;
  torqueRequiredNm?: number;
  torqueStages?: [number, number, number];
  requiresTimingAlignment?: boolean;
  requiresFluidCheck?: boolean;
  functionDesc: string;
  material: string;
  mechanicTip: string;
  specText: string;
  dimensions?: string;
  color: string;
  accentColor: string;
}

export interface OBDDiagnosticCode {
  code: string;
  title: string;
  description: string;
  solution: string;
  severity: 'warning' | 'critical' | 'fatal';
}

export interface EngineDiagnosticResult {
  canStart: boolean;
  status:
    | 'ready'
    | 'running'
    | 'missing_starter'
    | 'missing_spark'
    | 'missing_fuel'
    | 'missing_head'
    | 'missing_pistons'
    | 'missing_crank'
    | 'missing_oil'
    | 'missing_coolant'
    | 'timing_clash'
    | 'untorqued_head';
  title: string;
  message: string;
  obdCode?: OBDDiagnosticCode;
  targetPartId?: EnginePartId;
  toolActionType?: 'torque' | 'timing' | 'oil' | 'coolant';
  actionButtonText?: string;
}

export type PartTorquesMap = Partial<Record<EnginePartId, number>>;
export type WorkshopMode = 'assembly' | 'exploded' | 'dyno' | 'manual';

export interface AssemblyStats {
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  isRunning: boolean;
  correctPlacements: number;
  failedAttempts: number;
  dismountCount: number;
  failedStartAttempts: number;
  perfectTorqueCount: number;
  perfectTiming: boolean;
  perfectOil: boolean;
  perfectCoolant: boolean;
}

export interface FinalScoreBreakdown {
  assemblyPoints: number;
  speedBonus: number;
  precisionBonus: number;
  torqueBonus: number;
  timingBonus: number;
  oilBonus: number;
  coolantBonus: number;
  errorPenalties: number;
  totalScore: number;
  accuracyPercent: number;
  elapsedTimeFormatted: string;
  rankTitle: string;
  rankGrade: 'S+' | 'A' | 'B' | 'C' | 'D';
  badgeColor: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  timeSeconds: number;
  timeFormatted: string;
  score: number;
  accuracyPercent: number;
  grade: 'S+' | 'A' | 'B' | 'C' | 'D';
  rankTitle: string;
  date: string;
  isCurrentPlayer?: boolean;
  difficulty?: AssemblyDifficulty;
}

export type AssemblyDifficulty = 'aprendiz' | 'mecanico' | 'dakar';


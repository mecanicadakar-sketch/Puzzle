import React, { useEffect, useRef } from 'react';

export interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
}

interface ArcadeCelebrationProps {
  showConfetti: boolean;
  comboCount: number;
  floatingScores: FloatingScore[];
  achievementNotification: {
    title: string;
    description: string;
    icon: string;
  } | null;
  onDismissAchievement?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

export const ArcadeCelebration: React.FC<ArcadeCelebrationProps> = ({
  showConfetti,
  comboCount,
  floatingScores,
  achievementNotification,
  onDismissAchievement,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  // Trigger confetti burst
  useEffect(() => {
    if (!showConfetti) return;

    const colors = ['#f59e0b', '#ef4444', '#06b6d4', '#10b981', '#a855f7', '#fbbf24', '#ffffff'];
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : window.innerWidth;
    const h = canvas ? canvas.height : window.innerHeight;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      newParticles.push({
        x: w * 0.5 + (Math.random() - 0.5) * 200,
        y: h * 0.35 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1,
      });
    }
    particlesRef.current = newParticles;
  }, [showConfetti]);

  // Particle loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particlesRef.current.length > 0) {
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35; // gravity
          p.vx *= 0.98; // air drag
          p.rotation += p.vRot;
          p.alpha -= 0.012;

          if (p.alpha <= 0 || p.y > canvas.height) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Fullscreen overlay canvas for particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Floating Score Bursts (+150 PTS, COMBO!) */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingScores.map((score) => (
          <div
            key={score.id}
            style={{ left: `${score.x}px`, top: `${score.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-bounce transition-all duration-700"
          >
            <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-amber-400 text-amber-300 font-racing font-black text-sm sm:text-base tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-1.5 scale-110">
              <span className="text-amber-400">⚡</span>
              <span>{score.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Arcade Combo Banner Top Notification */}
      {comboCount >= 2 && (
        <div className="fixed top-20 right-4 z-40 pointer-events-none animate-in fade-in slide-in-from-right-10 duration-300">
          <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 p-0.5 rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            <div className="bg-[#0b0f17] px-3.5 py-2 rounded-[14px] flex items-center gap-2.5">
              <span className="text-xl animate-bounce">🔥</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-racing font-extrabold text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                    RACHA MECÁNICA
                  </span>
                  <span className="bg-red-500 text-white font-mono-tech font-black text-xs px-1.5 py-0.2 rounded-md shadow">
                    x{comboCount}
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/90 font-mono-tech">
                  +{comboCount * 150} pts bonificación por racha
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlocked Toast Notification */}
      {achievementNotification && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-0.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] max-w-sm">
            <div className="bg-[#0b101a] px-4 py-3 rounded-[14px] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {achievementNotification.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono-tech text-amber-400 font-extrabold tracking-wider block">
                  🏆 ¡Logro de Taller Desbloqueado!
                </span>
                <h4 className="font-racing font-bold text-sm text-white truncate">
                  {achievementNotification.title}
                </h4>
                <p className="text-[11px] text-gray-300 truncate mt-0.5">
                  {achievementNotification.description}
                </p>
              </div>
              {onDismissAchievement && (
                <button
                  onClick={onDismissAchievement}
                  className="text-gray-400 hover:text-white text-xs p-1 cursor-pointer shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

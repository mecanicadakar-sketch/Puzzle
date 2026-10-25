import React from 'react';
import { ExternalLink, Wrench, Shield, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  visitCountFormatted?: string;
  totalPartsCount?: number;
}

export const Footer: React.FC<FooterProps> = ({
  visitCountFormatted,
  totalPartsCount = 15,
}) => {
  return (
    <footer className="w-full bg-[#080c14] border-t-2 border-[#1c2738] relative overflow-hidden mt-8 text-gray-400">
      {/* Dakar Racing Livery Top Accent Line */}
      <div
        className="w-full h-1.5"
        style={{
          background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 12px, #ef4444 12px, #ef4444 24px, #1e293b 24px, #1e293b 36px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Brand & Credit Column */}
          <div className="md:col-span-5 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20 shrink-0">
                <Wrench className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="font-racing font-extrabold text-white text-base tracking-wider uppercase">
                  Software creado por Mecánica Dakar
                </h4>
                <p className="text-xs text-amber-400 font-mono-tech">
                  Desafío de Memoria y Ensamble Motor 2.0L Turbo 16V
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0">
              Simulador interactivo tipo puzzle para mecánicos, preparadores de competición y apasionados del automovilismo.
              {visitCountFormatted && (
                <span className="block mt-1 text-emerald-400 font-mono-tech text-[11px]">
                  🏁 Comunidad activa con más de <strong>{visitCountFormatted}</strong> visitas registradas.
                </span>
              )}
            </p>
          </div>

          {/* Right Utility Links for Mechanics (Requested by user) */}
          <div className="md:col-span-7 flex flex-col items-center md:items-end space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-racing font-bold text-xs sm:text-sm text-gray-200 uppercase tracking-wide">
                Software de utilidad para Mecánicos:
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Link 1: MiTallerPY */}
              <a
                href="https://mitallerpy.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#0f1724] hover:bg-[#162338] border border-[#2a3a52] hover:border-amber-400/80 transition-all shadow-lg flex items-center justify-between sm:justify-start gap-3 active:scale-98"
                title="Sistema de Gestión de Talleres Mecánicos MiTallerPY"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-racing border border-blue-500/40">
                    PY
                  </div>
                  <div className="text-left">
                    <span className="font-racing font-bold text-xs text-white group-hover:text-amber-300 transition-colors block">
                      MiTallerPY
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono-tech block">
                      mitallerpy.vercel.app
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
              </a>

              {/* Link 2: TallerYa */}
              <a
                href="https://tallerya.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#0f1724] hover:bg-[#162338] border border-[#2a3a52] hover:border-amber-400/80 transition-all shadow-lg flex items-center justify-between sm:justify-start gap-3 active:scale-98"
                title="Plataforma de Diagnóstico y Gestión TallerYa"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold font-racing border border-amber-500/40">
                    TY
                  </div>
                  <div className="text-left">
                    <span className="font-racing font-bold text-xs text-white group-hover:text-amber-300 transition-colors block">
                      TallerYa
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono-tech block">
                      tallerya.vercel.app
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom subtle copyright note */}
        <div className="mt-8 pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500 font-mono-tech">
          <span>
            © {new Date().getFullYear()} Mecánica Dakar • Juego de Memoria para Mecánicos ({totalPartsCount} piezas)
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            Hecho con precisión para la comunidad mecánica automotriz
          </span>
        </div>
      </div>
    </footer>
  );
};

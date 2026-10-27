import React from 'react';
import { Smartphone, Download, CheckCircle2, Share2, PlusSquare, WifiOff, X } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  isInstallable,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#141a24] border-2 border-emerald-500/60 rounded-3xl w-full max-w-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 sm:px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/30 border border-white/30 flex items-center justify-center text-emerald-300">
              <Smartphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-racing font-extrabold text-base sm:text-lg uppercase tracking-wide">
                Instalar en Celular (Offline)
              </h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                Juega sin conexión ni gasto de datos móviles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-200 text-2xl font-bold p-1 cursor-pointer"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 text-gray-200 text-xs sm:text-sm">
          {/* Logo preview */}
          <div className="flex items-center gap-3 bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
            <img
              src="/assets/aistudio/logo-Engine-car_cd954c6d.png"
              alt="Engine Puzzle Car Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-xl"
            />
            <div>
              <h4 className="font-racing font-bold text-sm text-white">Engine Puzzle Car</h4>
              <p className="text-[11px] text-gray-400">
                Simulador de Ensamble y Banco Dyno 2.0L Turbo 16V
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400 font-mono-tech">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Compatible 100% Offline (Android / iOS / PC)</span>
              </div>
            </div>
          </div>

          {isInstalled ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-racing font-bold text-sm text-emerald-300">¡App Ya Instalada!</h4>
              <p className="text-xs text-gray-300">
                Esta aplicación ya está instalada en tu dispositivo. Puedes abrirla desde tu pantalla de inicio y jugar sin internet.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="bg-[#0b0f17] border border-cyan-500/40 rounded-2xl p-4 space-y-3">
              <h4 className="font-racing font-bold text-xs sm:text-sm text-cyan-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-cyan-400" />
                Pasos para instalar en iPhone / iPad (Safari):
              </h4>
              <ol className="space-y-2 text-xs text-gray-300 font-sans list-decimal list-inside">
                <li>
                  Toca el botón <strong>Compartir</strong> en la barra inferior de Safari{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-300 font-mono-tech">
                    <Share2 className="w-3 h-3 inline mr-1" /> Compartir
                  </span>
                </li>
                <li>
                  Desliza hacia abajo y presiona <strong>"Agregar a pantalla de inicio"</strong>{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-300 font-mono-tech">
                    <PlusSquare className="w-3 h-3 inline mr-1" /> Agregar
                  </span>
                </li>
                <li>
                  Presiona <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo! El ícono de Engine Puzzle Car aparecerá en tu teléfono.
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Chrome Flow */
            <div className="space-y-3">
              {isInstallable ? (
                <button
                  type="button"
                  onClick={onNativeInstall}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-racing font-bold text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-5 h-5 text-black" />
                  <span>Instalar Ahora en Este Dispositivo</span>
                </button>
              ) : (
                <div className="bg-[#0b0f17] border border-amber-500/40 rounded-2xl p-4 space-y-2">
                  <h4 className="font-racing font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-400" />
                    Instalación Rápida desde el Navegador:
                  </h4>
                  <ol className="space-y-1.5 text-xs text-gray-300 list-decimal list-inside">
                    <li>Abre el menú de tu navegador (los 3 puntos <strong>⋮</strong> arriba a la derecha).</li>
                    <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                    <li>Confirma la instalación para tener el juego listo en tu escritorio offline.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Offline Benefits */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tech">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-base">🚀</span>
              <span className="text-gray-300">Carga ultra rápida sin esperas</span>
            </div>
            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-base">📴</span>
              <span className="text-gray-300">100% funcional sin Wi-Fi</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0b0f17] px-4 sm:px-6 py-3 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-racing font-bold cursor-pointer transition-colors"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Smartphone, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'compact' | 'floating' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome !== 'accepted') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`fixed bottom-4 left-4 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-2 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 animate-pulse text-xs font-racing font-bold ${className}`}
          title="Instalar en celular para jugar Offline"
        >
          <Smartphone className="w-4 h-4 text-emerald-200" />
          <span>Instalar Offline</span>
        </button>
        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onNativeInstall={handleClick}
          isInstallable={isInstallable}
          isIOS={isIOS}
          isInstalled={isInstalled}
        />
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Instalar App en Celular (Jugar Offline)</span>
        </button>
        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onNativeInstall={handleClick}
          isInstallable={isInstallable}
          isIOS={isIOS}
          isInstalled={isInstalled}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-racing font-bold text-[11px] sm:text-xs rounded-xl shadow-md border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 ${className}`}
        title="Instalar en Celular para Jugar Offline"
      >
        <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
        <span className="hidden xs:inline">Instalar App</span>
        <span className="xs:hidden">Instalar</span>
        <span className="text-[9px] bg-emerald-950/70 border border-emerald-400/40 px-1 rounded font-mono-tech uppercase hidden sm:inline">
          Offline
        </span>
      </button>

      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onNativeInstall={handleClick}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />
    </>
  );
};

import React, { useState } from 'react';
import { User, Check, X } from 'lucide-react';

interface ParticipantNameModalProps {
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export const ParticipantNameModal: React.FC<ParticipantNameModalProps> = ({
  currentName,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState<string>(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  const suggestions = [
    'Jefe de Taller',
    'Carlos Sainz Jr',
    'Jefe de Motores F1',
    'Técnico WRC',
    'Preparador Turbo',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141a24] border-2 border-[#2d3748] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#1e2738] px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#2d3748] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-racing font-bold text-base text-white tracking-wide">
              Nombre del Participante
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="text-xs font-mono-tech text-gray-300 block mb-1.5">
              Tu nombre o apodo para guardar récords y tiempos:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cristian Dakar..."
              maxLength={28}
              autoFocus
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#0b0f17] border border-gray-700 rounded-xl text-white font-racing tracking-wide focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <span className="text-[11px] font-mono-tech text-gray-400 block mb-1.5">
              Sugerencias rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setName(sug)}
                  className="px-3 py-1.5 min-h-[36px] rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-racing text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-racing font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 min-h-[44px] py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 text-black font-racing font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Check className="w-4 h-4" />
              Guardar Nombre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

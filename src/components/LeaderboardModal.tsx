import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/engine';
import { getLeaderboard, clearLeaderboardToDefault } from '../utils/leaderboard';
import {
  Trophy,
  Medal,
  Clock,
  Target,
  Award,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';

interface LeaderboardModalProps {
  onClose: () => void;
  currentPlayerId?: string | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  currentPlayerId,
}) => {
  const [records, setRecords] = useState<LeaderboardEntry[]>(getLeaderboard());
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Keep synchronized with storage events
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<LeaderboardEntry[]>) => {
      if (e.detail && Array.isArray(e.detail)) {
        setRecords(e.detail);
      } else {
        setRecords(getLeaderboard());
      }
    };
    window.addEventListener('leaderboard-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('leaderboard-updated', handleUpdate as EventListener);
  }, []);

  const sortedRecords = [...records]
    .filter((r) =>
      r.playerName.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === 'score') {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSeconds - b.timeSeconds;
      } else {
        if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
        return b.score - a.score;
      }
    })
    .slice(0, 10); // Display Top 10

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas reiniciar la tabla a los 10 pilotos de referencia de fábrica (Top 10)?')) {
      const defs = clearLeaderboardToDefault();
      setRecords(defs);
    }
  };

  const top3 = sortedRecords.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#141a24] border-2 border-[#38465c] rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[95vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-black/40 border border-white/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="font-racing font-extrabold text-sm sm:text-lg text-white tracking-wider uppercase truncate">
                Top 10 Mejores Puntajes
              </h3>
              <p className="text-[10px] sm:text-xs text-amber-100/90 font-medium truncate">
                Récords de Taller y Pilotos Oficiales (10 Mejores)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:text-amber-200 text-2xl font-bold p-1 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shrink-0"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Podium for Top 3 */}
        {top3.length >= 3 && searchTerm === '' && (
          <div className="bg-[#0b0f17] border-b border-[#232f42] p-2.5 sm:p-4 shrink-0">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 items-end max-w-md mx-auto text-center pt-1">
              {/* 2nd Place */}
              <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-1.5 sm:p-2.5 flex flex-col items-center shadow-lg relative">
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-300 text-slate-900 font-black text-[10px] sm:text-xs flex items-center justify-center mb-0.5 shadow-md">
                  2
                </div>
                <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 mb-0.5 shrink-0" />
                <span className="font-racing font-bold text-[9px] sm:text-xs text-white truncate max-w-full">
                  {top3[1]?.playerName}
                </span>
                <span className="text-[9px] sm:text-[11px] font-mono-tech text-amber-400 font-bold">
                  {top3[1]?.score.toLocaleString()}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono-tech text-gray-400">
                  {top3[1]?.timeFormatted}
                </span>
              </div>

              {/* 1st Place (Center, higher) */}
              <div className="bg-gradient-to-b from-[#1f293d] to-[#111722] border-2 border-amber-500 rounded-xl p-2 sm:p-3 flex flex-col items-center shadow-2xl relative -translate-y-1 sm:-translate-y-1.5">
                <div className="absolute -top-2 sm:-top-2.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[10px] sm:text-xs flex items-center justify-center shadow-lg">
                  1
                </div>
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 my-0.5 animate-bounce shrink-0" />
                <span className="font-racing font-bold text-[10px] sm:text-xs text-amber-300 truncate max-w-full">
                  {top3[0]?.playerName}
                </span>
                <span className="text-[10px] sm:text-xs font-mono-tech text-amber-400 font-bold">
                  {top3[0]?.score.toLocaleString()}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono-tech text-emerald-400 font-bold">
                  {top3[0]?.timeFormatted}
                </span>
              </div>

              {/* 3rd Place */}
              <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-1.5 sm:p-2.5 flex flex-col items-center shadow-lg relative">
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-amber-700 text-amber-100 font-black text-[10px] sm:text-xs flex items-center justify-center mb-0.5 shadow-md">
                  3
                </div>
                <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 mb-0.5 shrink-0" />
                <span className="font-racing font-bold text-[9px] sm:text-xs text-white truncate max-w-full">
                  {top3[2]?.playerName}
                </span>
                <span className="text-[9px] sm:text-[11px] font-mono-tech text-amber-400 font-bold">
                  {top3[2]?.score.toLocaleString()}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono-tech text-gray-400">
                  {top3[2]?.timeFormatted}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Sort Controls */}
        <div className="bg-[#0d121c] px-3 sm:px-5 py-2 sm:py-2.5 border-b border-[#232f42] flex items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar piloto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#182130] border border-gray-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex bg-[#141a24] p-0.5 rounded-lg border border-gray-700 text-[10px] sm:text-xs font-racing">
            <button
              onClick={() => setSortBy('score')}
              className={`px-2 py-1 rounded-md font-bold cursor-pointer transition-all ${
                sortBy === 'score' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              Puntos
            </button>
            <button
              onClick={() => setSortBy('time')}
              className={`px-2 py-1 rounded-md font-bold cursor-pointer transition-all ${
                sortBy === 'time' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tiempo
            </button>
          </div>
        </div>

        {/* Responsive Table of Top 10 Records (Zero horizontal scroll on mobile) */}
        <div className="p-2 sm:p-4 overflow-y-auto flex-1">
          <div className="border border-[#232f42] rounded-xl overflow-hidden shadow-inner">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182130] text-gray-300 font-racing uppercase tracking-wider text-[10px] sm:text-[11px]">
                <tr>
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2">Piloto</th>
                  <th className="py-2 px-2 text-center">Tiempo</th>
                  <th className="py-2 px-2 text-right">Puntuación</th>
                  <th className="py-2 px-2 text-center hidden sm:table-cell">Precisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232f42] text-gray-300">
                {sortedRecords.map((rec, index) => {
                  const isCurrent = currentPlayerId && rec.id === currentPlayerId;
                  const isGold = index === 0;
                  const isSilver = index === 1;
                  const isBronze = index === 2;

                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/20 font-semibold text-white border-l-4 border-amber-400'
                          : 'hover:bg-[#182130]/60'
                      }`}
                    >
                      {/* Rank # */}
                      <td className="py-2 px-2 text-center font-racing font-bold text-xs">
                        {isGold ? (
                          <span className="text-amber-400 font-black">🥇 1</span>
                        ) : isSilver ? (
                          <span className="text-slate-300 font-black">🥈 2</span>
                        ) : isBronze ? (
                          <span className="text-amber-600 font-black">🥉 3</span>
                        ) : (
                          <span className="text-gray-400">{index + 1}</span>
                        )}
                      </td>

                      {/* Player Name */}
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-white text-[11px] sm:text-xs truncate max-w-[130px] sm:max-w-xs">
                            {rec.playerName}
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] bg-amber-500 text-black px-1 rounded font-bold font-mono-tech">
                              TÚ
                            </span>
                          )}
                          {rec.difficulty === 'dakar' && (
                            <span className="text-[8px] bg-red-500/20 text-red-300 border border-red-500/40 px-1 rounded font-mono-tech">
                              Dakar
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400 block truncate max-w-[140px] sm:max-w-none">
                          {rec.rankTitle}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-2 px-2 text-center font-mono-tech font-bold text-cyan-400 text-[11px] sm:text-xs whitespace-nowrap">
                        {rec.timeFormatted}
                      </td>

                      {/* Score */}
                      <td className="py-2 px-2 text-right font-racing font-bold text-amber-400 text-xs sm:text-sm whitespace-nowrap">
                        {rec.score.toLocaleString()}
                      </td>

                      {/* Accuracy (hidden on extra small screens) */}
                      <td className="py-2 px-2 text-center font-mono-tech hidden sm:table-cell">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            rec.accuracyPercent >= 90
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {rec.accuracyPercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info & Factory reset button */}
        <div className="bg-[#0b0f17] px-3 sm:px-6 py-2.5 sm:py-3 border-t border-[#232f42] flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="text-[10px] sm:text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer Top 10</span>
          </button>

          <span className="text-[10px] sm:text-xs font-mono-tech text-gray-400">
            Mostrando {sortedRecords.length} de 10 mejores
          </span>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-racing font-bold cursor-pointer transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

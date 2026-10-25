import React, { useState } from 'react';
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
    });

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas reiniciar la tabla a los 3 ganadores de fábrica (Top 3)?')) {
      clearLeaderboardToDefault();
      setRecords(getLeaderboard());
    }
  };

  const top3 = sortedRecords.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#141a24] border-2 border-[#38465c] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/40 border border-white/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-racing font-extrabold text-base sm:text-xl text-white tracking-wider uppercase">
                Tabla de Récords
              </h3>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
                Top 3 Ganadores Históricos & Récords de Taller
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:text-amber-200 text-2xl font-bold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Podium for Top 3 */}
        {top3.length >= 3 && searchTerm === '' && (
          <div className="bg-[#0b0f17] border-b border-[#232f42] p-3 sm:p-5 shrink-0">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 items-end max-w-lg mx-auto text-center pt-2">
              {/* 2nd Place */}
              <div className="bg-[#111722] border border-[#2d3748] rounded-2xl p-2 sm:p-3 flex flex-col items-center shadow-lg relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center mb-1 shadow-md">
                  2
                </div>
                <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 mb-0.5 sm:mb-1 shrink-0" />
                <span className="font-racing font-bold text-[10px] sm:text-xs text-white truncate max-w-full">
                  {top3[1]?.playerName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono-tech text-amber-400 font-bold">
                  {top3[1]?.score.toLocaleString()}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-gray-400">
                  {top3[1]?.timeFormatted}
                </span>
              </div>

              {/* 1st Place (Center, higher) */}
              <div className="bg-gradient-to-b from-[#1f293d] to-[#111722] border-2 border-amber-500 rounded-2xl p-2.5 sm:p-3.5 flex flex-col items-center shadow-2xl relative -translate-y-1.5 sm:-translate-y-2">
                <div className="absolute -top-2.5 sm:-top-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs sm:text-sm flex items-center justify-center shadow-lg">
                  1
                </div>
                <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 my-0.5 sm:my-1 animate-bounce shrink-0" />
                <span className="font-racing font-bold text-xs sm:text-sm text-amber-300 truncate max-w-full">
                  {top3[0]?.playerName}
                </span>
                <span className="text-[10px] sm:text-xs font-mono-tech text-amber-400 font-bold">
                  {top3[0]?.score.toLocaleString()} pts
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-emerald-400 font-bold">
                  {top3[0]?.timeFormatted}
                </span>
              </div>

              {/* 3rd Place */}
              <div className="bg-[#111722] border border-[#2d3748] rounded-2xl p-2 sm:p-3 flex flex-col items-center shadow-lg relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-700 text-amber-100 font-black text-xs sm:text-sm flex items-center justify-center mb-1 shadow-md">
                  3
                </div>
                <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mb-0.5 sm:mb-1 shrink-0" />
                <span className="font-racing font-bold text-[10px] sm:text-xs text-white truncate max-w-full">
                  {top3[2]?.playerName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono-tech text-amber-400 font-bold">
                  {top3[2]?.score.toLocaleString()}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-gray-400">
                  {top3[2]?.timeFormatted}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Sort Controls */}
        <div className="bg-[#0d121c] px-3 sm:px-6 py-2.5 sm:py-3 border-b border-[#232f42] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar participante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#141a24] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-mono-tech text-[11px]">Ordenar:</span>
            <div className="flex bg-[#141a24] p-1 rounded-xl border border-gray-700">
              <button
                onClick={() => setSortBy('score')}
                className={`px-3 py-1 rounded-lg font-racing font-bold tracking-wider cursor-pointer transition-all ${
                  sortBy === 'score'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mayor Puntuación
              </button>
              <button
                onClick={() => setSortBy('time')}
                className={`px-3 py-1 rounded-lg font-racing font-bold tracking-wider cursor-pointer transition-all ${
                  sortBy === 'time'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Menor Tiempo
              </button>
            </div>
          </div>
        </div>

        {/* Table of Records */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1">
          <div className="border border-[#232f42] rounded-2xl overflow-x-auto shadow-inner">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-[#182130] text-gray-300 font-racing uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center w-10 sm:w-12">#</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4">Participante</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4">Tiempo</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4">Puntuación</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">Precisión</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">Rango</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right hidden sm:table-cell">Fecha</th>
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
                      {/* Rank position */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center font-racing font-bold text-xs sm:text-sm">
                        {isGold ? (
                          <span className="text-amber-400 font-extrabold">🥇 1</span>
                        ) : isSilver ? (
                          <span className="text-slate-300 font-extrabold">🥈 2</span>
                        ) : isBronze ? (
                          <span className="text-amber-600 font-extrabold">🥉 3</span>
                        ) : (
                          <span className="text-gray-500">{index + 1}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">
                            {rec.playerName}
                          </span>
                          {rec.difficulty === 'dakar' && (
                            <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-mono-tech">
                              Dakar
                            </span>
                          )}
                          {rec.difficulty === 'mecanico' && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono-tech">
                              Pro
                            </span>
                          )}
                          {rec.difficulty === 'aprendiz' && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono-tech">
                              Aprendiz
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] sm:text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-bold font-mono-tech">
                              TÚ
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {rec.rankTitle}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono-tech font-bold text-cyan-400 text-xs">
                        {rec.timeFormatted}
                      </td>

                      {/* Score */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-racing font-bold text-amber-400 text-xs sm:text-sm">
                        {rec.score.toLocaleString()}
                      </td>

                      {/* Accuracy */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center font-mono-tech">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.accuracyPercent >= 90
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {rec.accuracyPercent}%
                        </span>
                      </td>

                      {/* Grade */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center font-mono-tech font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            rec.grade === 'S+'
                              ? 'bg-amber-400 text-black font-extrabold'
                              : rec.grade === 'A'
                              ? 'bg-cyan-500 text-black font-bold'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {rec.grade}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right font-mono-tech text-[10px] text-gray-400 hidden sm:table-cell">
                        {rec.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#111722] px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#232f42] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-0 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="text-gray-400 hover:text-red-400 text-xs font-mono-tech flex items-center gap-1.5 cursor-pointer transition-colors min-h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            Restablecer Récords de Fábrica
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] py-2.5 px-6 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-racing font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center"
          >
            Cerrar Clasificación
          </button>
        </div>
      </div>
    </div>
  );
};

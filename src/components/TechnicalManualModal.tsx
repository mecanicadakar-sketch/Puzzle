import React, { useState } from 'react';
import { BookOpen, Wrench, Settings, AlertTriangle } from 'lucide-react';
import { ENGINE_PARTS, OBD_CODES } from '../data/engineParts';

interface TechnicalManualModalProps {
  onClose: () => void;
}

export const TechnicalManualModal: React.FC<TechnicalManualModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'torque' | 'timing' | 'obd'>('specs');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[94vh] my-auto">
        {/* Header */}
        <div className="bg-[#21262d] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#30363d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-racing font-bold text-base sm:text-lg text-white tracking-wide">
                Manual de Taller & Ficha Oficial
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400">
                Motor 2.0L 16V Turbo DOHC | Procedimientos y Tolerancias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Cerrar manual"
          >
            ✕
          </button>
        </div>

        {/* Tab navigation */}
        <div className="bg-[#0d1117] px-3 sm:px-6 py-2 border-b border-[#30363d] flex items-center gap-1.5 sm:gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('specs')}
            className={`whitespace-nowrap min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-racing font-bold tracking-wider cursor-pointer transition-all ${
              activeTab === 'specs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Datos Técnicos
          </button>
          <button
            onClick={() => setActiveTab('torque')}
            className={`whitespace-nowrap min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-racing font-bold tracking-wider cursor-pointer transition-all ${
              activeTab === 'torque'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Pares de Apriete (Nm)
          </button>
          <button
            onClick={() => setActiveTab('timing')}
            className={`whitespace-nowrap min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-racing font-bold tracking-wider cursor-pointer transition-all ${
              activeTab === 'timing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Puesta a Punto
          </button>
          <button
            onClick={() => setActiveTab('obd')}
            className={`whitespace-nowrap min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-racing font-bold tracking-wider cursor-pointer transition-all ${
              activeTab === 'obd'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Diagnóstico OBD-II
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono-tech text-blue-400 font-bold uppercase">
                    Dimensiones y Cotas
                  </span>
                  <div className="text-xs space-y-1 text-gray-300">
                    <p>• Cilindrada exacta: <strong>1,998 cc (2.0 Litros)</strong></p>
                    <p>• Diámetro x Carrera: <strong>82.5 mm x 92.8 mm</strong></p>
                    <p>• Relación de Compresión: <strong>9.8 : 1</strong></p>
                    <p>• Configuración: <strong>4 Cilindros en Línea</strong></p>
                    <p>• Distribución: <strong>DOHC 16 Válvulas con Taqués</strong></p>
                  </div>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono-tech text-amber-400 font-bold uppercase">
                    Combustión y Encendido
                  </span>
                  <div className="text-xs space-y-1 text-gray-300">
                    <p>• Orden de encendido: <strong className="text-amber-300">1 - 3 - 4 - 2</strong></p>
                    <p>• Bujías: <strong>Iridio 0.75 mm entrehierro</strong></p>
                    <p>• Presión de inyección: <strong>3.5 bar constante</strong></p>
                    <p>• Presión turbo máxima: <strong>+1.25 bar sobrealimentado</strong></p>
                    <p>• Ralentí de fábrica: <strong>950 ± 50 RPM</strong></p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono-tech text-emerald-400 font-bold uppercase">
                    Circuito de Lubricación
                  </span>
                  <div className="text-xs space-y-1 text-gray-300">
                    <p>• Capacidad del cárter con filtro: <strong>4.5 Litros</strong></p>
                    <p>• Viscosidad recomendada: <strong>SAE 5W-40 100% Sintético</strong></p>
                    <p>• Presión en caliente a 3,000 RPM: <strong>40 - 55 PSI (2.8 - 3.8 bar)</strong></p>
                    <p>• Presión mínima de seguridad en ralentí: <strong>18 PSI (1.2 bar)</strong></p>
                  </div>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-2">
                  <span className="text-xs font-mono-tech text-teal-400 font-bold uppercase">
                    Circuito de Refrigeración
                  </span>
                  <div className="text-xs space-y-1 text-gray-300">
                    <p>• Capacidad nominal total: <strong>5.0 Litros</strong></p>
                    <p>• Tipo de fluido: <strong>Orgánico OAT Rosa al 50%</strong></p>
                    <p>• Temperatura termostato: <strong>Apertura a 88 °C</strong></p>
                    <p>• Presión tapón expansión: <strong>1.2 bar (128 °C ebullición)</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'torque' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Pares de apriete oficiales recomendados. Los pernos de culata deben ser lubricados ligeramente con aceite de motor en la rosca antes del apriete.
              </p>

              <div className="border border-[#30363d] rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[420px]">
                  <thead className="bg-[#21262d] text-gray-300 font-racing uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 sm:px-4">Componente</th>
                      <th className="py-2.5 px-3 sm:px-4">Par (Nm)</th>
                      <th className="py-2.5 px-3 sm:px-4">Par (lb-ft)</th>
                      <th className="py-2.5 px-3 sm:px-4">Secuencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d] text-gray-300">
                    {ENGINE_PARTS.filter((p) => p.torqueRequiredNm).map((p) => (
                      <tr key={p.id} className="hover:bg-[#1f2937]/50">
                        <td className="py-2.5 px-3 sm:px-4 font-semibold text-white">{p.name}</td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono-tech font-bold text-emerald-400">
                          {p.torqueRequiredNm} Nm
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono-tech text-gray-400">
                          {((p.torqueRequiredNm || 0) * 0.73756).toFixed(1)} lb-ft
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-gray-400 text-[11px]">
                          {p.id === 'cylinder_head'
                            ? 'Espiral (centro a extremos en 3 fases)'
                            : 'Patrón en cruz cruzado parejo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'timing' && (
            <div className="space-y-4 text-xs text-gray-300">
              <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-racing font-bold text-sm">
                  <Settings className="w-4 h-4" />
                  Procedimiento de Calado (Punto Muerto Superior - PMS / 0°)
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed">
                  <li>
                    Gira el cigüeñal mediante la tuerca del extremo en sentido horario hasta que la muesca de la polea coincida exactamente con la flecha testigo marcada en el bloque (0° PMS).
                  </li>
                  <li>
                    Comprueba que el pistón número 1 se encuentre en la parte más alta de su carrera y ambas válvulas de ese cilindro permanezcan cerradas.
                  </li>
                  <li>
                    Alinea los dos piñones de los árboles de levas (Admisión y Escape) de modo que las marcas circulares queden enfrentadas entre sí sobre el plano superior de la culata.
                  </li>
                  <li>
                    Monta la correa dentada comenzando desde el piñón del cigüeñal hacia la polea tensora, asegurando que no quede comba en el tramo de tracción.
                  </li>
                  <li>
                    Aplica la tensión de fábrica al rodillo tensor automático y gira manualmente el motor dos vueltas completas de cigüeñal (720°) para verificar que las marcas sigan coincidiendo.
                  </li>
                </ol>
              </div>

              <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 text-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <p>
                  <strong>ADVERTENCIA MECÁNICA DE INTERFERENCIA:</strong> Este motor cuenta con relación de compresión 9.8:1 y cámaras compactas. La holgura libre entre pistón y válvula en apertura máxima es menor a 1.8 mm. Si se intenta arrancar con la correa desfasada, las válvulas chocarán con los pistones ocasionando daños catastróficos.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'obd' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Códigos de diagnóstico de abordo (OBD-II) para resolución de averías en el banco de pruebas:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(OBD_CODES).map((obd) => (
                  <div
                    key={obd.code}
                    className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tech font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                        {obd.code} - {obd.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-red-400">
                        {obd.severity}
                      </span>
                    </div>
                    <p className="text-gray-300">{obd.description}</p>
                    <p className="text-emerald-400 pt-1 border-t border-gray-800">
                      <strong>Corrección:</strong> {obd.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#21262d] px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#30363d] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white font-racing font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-98 flex items-center justify-center"
          >
            Cerrar Manual
          </button>
        </div>
      </div>
    </div>
  );
};

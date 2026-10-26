import React, { useEffect } from 'react';
import { X, FlaskConical } from 'lucide-react';
import ChemistryToolsHub from './ChemistryToolsHub';
import { useAppContext } from '../../AppContext';

export default function ChemistryToolsModal() {
  const { isChemistryToolsModalOpen, setIsChemistryToolsModalOpen, isDarkMode } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChemistryToolsModalOpen) {
        setIsChemistryToolsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChemistryToolsModalOpen, setIsChemistryToolsModalOpen]);

  if (!isChemistryToolsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsChemistryToolsModalOpen(false)}
      />

      {/* Modal Dialog Container */}
      <div className={`relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden z-10 transition-all ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-950/20' 
          : 'bg-slate-50 border-slate-200 text-slate-900 shadow-slate-900/15'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDarkMode 
            ? 'bg-slate-900/90 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 dark:bg-cyan-400/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <FlaskConical size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Flow Chemistry Calculation &amp; Engineering Tools
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-medium">
                  Active Diagram Linked
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Capillary hydraulics, temperature-corrected viscosity, superheating phase boundaries, biphasic miscibility, and wetted material compatibility.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChemistryToolsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Chemistry Tools (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ChemistryToolsHub />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Droplet, Flame, Layers, Activity, FlaskConical, ShieldCheck } from 'lucide-react';
import SolventMixingCalculator from './SolventMixingCalculator';
import PressureBoilingPointCalculator from './PressureBoilingPointCalculator';
import MiscibilityMatrix from './MiscibilityMatrix';
import CapillaryPressureCalculator from './CapillaryPressureCalculator';
import MaterialCompatibilityTab from './MaterialCompatibilityTab';

export type ToolSubTab = 'mixing' | 'pressure' | 'miscibility' | 'capillary' | 'compatibility';

export default function ChemistryToolsHub() {
  const [activeSubTab, setActiveSubTab] = useState<ToolSubTab>('mixing');

  const tools = [
    {
      id: 'mixing' as ToolSubTab,
      label: 'Solvent Mixing & Contraction',
      shortLabel: 'Solvent Mixing',
      icon: Droplet,
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-600 text-white',
      badge: 'Vᴱ & Density'
    },
    {
      id: 'pressure' as ToolSubTab,
      label: 'Pressure-Boiling Pt & BPR Sizing',
      shortLabel: 'Pressure & BPR',
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-600 text-white',
      badge: 'Superheating'
    },
    {
      id: 'miscibility' as ToolSubTab,
      label: 'Solvent Miscibility Matrix',
      shortLabel: 'Miscibility',
      icon: Layers,
      color: 'text-teal-600 dark:text-teal-400',
      activeBg: 'bg-teal-600 text-white',
      badge: 'Phase Ordering'
    },
    {
      id: 'capillary' as ToolSubTab,
      label: 'Capillary Pressure & Reynolds',
      shortLabel: 'Capillary Hydraulics',
      icon: Activity,
      color: 'text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-600 text-white',
      badge: 'Hagen-Poiseuille'
    },
    {
      id: 'compatibility' as ToolSubTab,
      label: 'Material Compatibility (Tubing & Wetted)',
      shortLabel: 'Material Compatibility',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-600 text-white',
      badge: 'Tubing & Acids'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeSubTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveSubTab(tool.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? `${tool.activeBg} shadow-sm font-semibold`
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon size={17} className={isActive ? 'text-white' : tool.color} />
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {tool.shortLabel}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono shrink-0 hidden xl:inline-block ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tool.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tool */}
      <div>
        {activeSubTab === 'mixing' && <SolventMixingCalculator />}
        {activeSubTab === 'pressure' && <PressureBoilingPointCalculator />}
        {activeSubTab === 'miscibility' && <MiscibilityMatrix />}
        {activeSubTab === 'capillary' && <CapillaryPressureCalculator />}
        {activeSubTab === 'compatibility' && <MaterialCompatibilityTab />}
      </div>
    </div>
  );
}

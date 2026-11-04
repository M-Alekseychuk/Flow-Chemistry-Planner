import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Flame,
  Layers,
  Activity,
  ShieldCheck,
  PanelLeft,
  LayoutGrid,
  ChevronRight,
  Info,
  FlaskConical,
} from 'lucide-react';
import SolventMixingCalculator from './SolventMixingCalculator';
import PressureBoilingPointCalculator from './PressureBoilingPointCalculator';
import MiscibilityMatrix from './MiscibilityMatrix';
import CapillaryPressureCalculator from './CapillaryPressureCalculator';
import MaterialCompatibilityTab from './MaterialCompatibilityTab';

export type ToolSubTab = 'mixing' | 'pressure' | 'miscibility' | 'capillary' | 'compatibility';
export type NavLayoutMode = 'sidebar' | 'topbar';

interface ChemistryToolsHubProps {
  defaultTab?: ToolSubTab;
}

export default function ChemistryToolsHub({ defaultTab = 'mixing' }: ChemistryToolsHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<ToolSubTab>(defaultTab);
  const [navLayout, setNavLayout] = useState<NavLayoutMode>(() => {
    const saved = localStorage.getItem('flow-chem-tools-nav-layout');
    return saved === 'topbar' ? 'topbar' : 'sidebar';
  });

  useEffect(() => {
    localStorage.setItem('flow-chem-tools-nav-layout', navLayout);
  }, [navLayout]);

  const tools = [
    {
      id: 'mixing' as ToolSubTab,
      label: 'Solvent Mixing & Contraction',
      shortLabel: 'Solvent Mixing',
      description: 'Excess volume (Vᴱ), contraction & real density',
      icon: Droplet,
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-600 text-white',
      badge: 'Vᴱ & Density'
    },
    {
      id: 'pressure' as ToolSubTab,
      label: 'Pressure-Boiling Pt & BPR Sizing',
      shortLabel: 'Pressure & BPR',
      description: 'Clausius-Clapeyron, superheating & BPR',
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-600 text-white',
      badge: 'Superheating'
    },
    {
      id: 'miscibility' as ToolSubTab,
      label: 'Solvent Miscibility Matrix',
      shortLabel: 'Miscibility Matrix',
      description: '32-solvent biphasic extraction & phase guide',
      icon: Layers,
      color: 'text-teal-600 dark:text-teal-400',
      activeBg: 'bg-teal-600 text-white',
      badge: 'Phase Ordering'
    },
    {
      id: 'capillary' as ToolSubTab,
      label: 'Capillary Pressure & Reynolds',
      shortLabel: 'Capillary Hydraulics',
      description: 'Hagen-Poiseuille ΔP & laminar flow regimes',
      icon: Activity,
      color: 'text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-600 text-white',
      badge: 'Hagen-Poiseuille'
    },
    {
      id: 'compatibility' as ToolSubTab,
      label: 'Material Compatibility',
      shortLabel: 'Material Compatibility',
      description: 'Tubing, wetted parts, acids, bases & solvents',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-600 text-white',
      badge: 'Tubing & Acids'
    }
  ];

  const currentTool = tools.find((t) => t.id === activeSubTab) || tools[0];

  return (
    <div className="space-y-5">
      {/* Top Header & Layout Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-2">
              <span>Flow Chemistry Engineering Tools</span>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                5 Modules
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Physics-based continuous reaction engineering, fluid dynamics &amp; chemical compatibility guides
            </p>
          </div>
        </div>

        {/* Layout Switcher (Sidebar vs Top Bar) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setNavLayout('sidebar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              navLayout === 'sidebar'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Vertical Sidebar layout with full titles & descriptions"
          >
            <PanelLeft size={13} />
            <span>Sidebar</span>
          </button>
          <button
            onClick={() => setNavLayout('topbar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              navLayout === 'topbar'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Clean horizontal top bar layout"
          >
            <LayoutGrid size={13} />
            <span>Top Bar</span>
          </button>
        </div>
      </div>

      {/* Mode A: Clean Top Bar Navigation (Zero Truncation) */}
      {navLayout === 'topbar' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeSubTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveSubTab(tool.id)}
                    title={`${tool.label} — ${tool.description}`}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      isActive
                        ? `${tool.activeBg} shadow-xs font-semibold`
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : tool.color} />
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {tool.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tool Stage */}
          <div>
            {activeSubTab === 'mixing' && <SolventMixingCalculator />}
            {activeSubTab === 'pressure' && <PressureBoilingPointCalculator />}
            {activeSubTab === 'miscibility' && <MiscibilityMatrix />}
            {activeSubTab === 'capillary' && <CapillaryPressureCalculator />}
            {activeSubTab === 'compatibility' && <MaterialCompatibilityTab />}
          </div>
        </div>
      )}

      {/* Mode B: Professional Vertical Sidebar Navigation (Default) */}
      {navLayout === 'sidebar' && (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-3">
            <nav className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center justify-between">
                <span>Tool Modules</span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">5 Active</span>
              </div>
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeSubTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveSubTab(tool.id)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                      isActive
                        ? `${tool.activeBg} shadow-sm`
                        : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`mt-0.5 p-1.5 rounded-md shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                          {tool.shortLabel}
                        </span>
                        <ChevronRight
                          size={14}
                          className={`shrink-0 transition-transform ${
                            isActive
                              ? 'text-white opacity-80 translate-x-0.5'
                              : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {tool.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Information / Canvas Hint */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                <Info size={13} className="text-teal-600 dark:text-teal-400" />
                <span>Active Flow Synchronization</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Calculations can export sized elements (BPR nodes, capillary tubing, Zaiput liquid-liquid extraction separators) directly onto your flow canvas.
              </p>
            </div>
          </aside>

          {/* Right Main Tool Content Stage */}
          <main className="flex-1 min-w-0 w-full">
            {activeSubTab === 'mixing' && <SolventMixingCalculator />}
            {activeSubTab === 'pressure' && <PressureBoilingPointCalculator />}
            {activeSubTab === 'miscibility' && <MiscibilityMatrix />}
            {activeSubTab === 'capillary' && <CapillaryPressureCalculator />}
            {activeSubTab === 'compatibility' && <MaterialCompatibilityTab />}
          </main>
        </div>
      )}
    </div>
  );
}

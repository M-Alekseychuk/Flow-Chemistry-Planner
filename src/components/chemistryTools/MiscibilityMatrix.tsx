import React, { useState, useMemo } from 'react';
import { SOLVENTS, getMiscibility, getSolvent, MiscibilityType } from '../../lib/chemistryToolsData';
import { 
  Layers, 
  ArrowUpDown, 
  Search, 
  Filter, 
  Info, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  PlusCircle,
  Upload,
  Check,
  Zap,
  Split,
  Crosshair,
  Grid,
  CircleDot,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function MiscibilityMatrix() {
  const { currentProject, addNodeToCanvas, stoiRows } = useAppContext();

  const [solventAId, setSolventAId] = useState('water');
  const [solventBId, setSolventBId] = useState('ethyl_acetate');
  const [matrixFilter, setMatrixFilter] = useState('');
  const [viewMode, setViewMode] = useState<'inspector' | 'matrix'>('matrix');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [matrixStyle, setMatrixStyle] = useState<'badges' | 'dots'>('badges');

  const pairwise = useMemo(() => {
    return getMiscibility(solventAId, solventBId);
  }, [solventAId, solventBId]);

  const solventA = useMemo(() => getSolvent(solventAId), [solventAId]);
  const solventB = useMemo(() => getSolvent(solventBId), [solventBId]);

  // Extract solvents from feed solutions in current diagram
  const feedSolvents = useMemo(() => {
    const list: Array<{ id: string; name: string; source: string }> = [];
    (stoiRows || []).forEach((row: any) => {
      if (row.solvent) {
        const found = SOLVENTS.find(s => 
          s.id.toLowerCase() === row.solvent.trim().toLowerCase() ||
          s.name.toLowerCase().includes(row.solvent.trim().toLowerCase()) ||
          s.formula.toLowerCase() === row.solvent.trim().toLowerCase()
        );
        if (found && !list.some(l => l.id === found.id)) {
          list.push({ id: found.id, name: found.name, source: row.name || 'Feed Solution' });
        }
      }
    });
    return list;
  }, [stoiRows]);

  // Solvents for matrix view (all 32 benchmark laboratory solvents)
  const matrixSolvents = useMemo(() => {
    const baseSolvents = SOLVENTS.filter(s => s.id !== '2methf'); // 32 solvents matching reference chart
    if (!matrixFilter.trim()) {
      return baseSolvents;
    }
    const q = matrixFilter.toLowerCase();
    return baseSolvents.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.formula.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [matrixFilter]);

  // Dynamic hovered pair calculation for live crosshair readout
  const hoveredPair = useMemo(() => {
    if (!hoveredCell) return null;
    const sRow = getSolvent(hoveredCell.rowId);
    const sCol = getSolvent(hoveredCell.colId);
    const misc = getMiscibility(hoveredCell.rowId, hoveredCell.colId);
    return { sRow, sCol, misc };
  }, [hoveredCell]);

  const handleSwap = () => {
    setSolventAId(solventBId);
    setSolventBId(solventAId);
  };

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Canvas Actions
  const handleImportFeedSolvents = () => {
    if (feedSolvents.length >= 2) {
      setSolventAId(feedSolvents[0].id);
      setSolventBId(feedSolvents[1].id);
      showFeedback(`Loaded "${feedSolvents[0].name}" and "${feedSolvents[1].name}" from active feed solutions!`);
    } else if (feedSolvents.length === 1) {
      setSolventAId(feedSolvents[0].id);
      showFeedback(`Loaded "${feedSolvents[0].name}" as Solvent 1 from feed solution!`);
    } else {
      showFeedback('No solvents configured in canvas feed solutions yet.', 'info');
    }
  };

  const handleAddZaiputToCanvas = () => {
    const newNode = {
      id: `zaiput_${Date.now()}`,
      type: 'zaiput',
      position: { 
        x: 450 + Math.floor(Math.random() * 60), 
        y: 200 + Math.floor(Math.random() * 60) 
      },
      data: {
        label: 'Membrane Separator (Zaiput)',
        notes: pairwise.status === 'miscible'
          ? `Homogeneous blend (${solventA.name} / ${solventB.name})`
          : `Top: ${pairwise.upperPhase?.name} (ρ=${pairwise.upperPhase?.density}) | Bottom: ${pairwise.lowerPhase?.name} (ρ=${pairwise.lowerPhase?.density}) (Δρ = ${pairwise.densityDelta} g/mL)`
      }
    };

    addNodeToCanvas(newNode);
    showFeedback(`Added Membrane Separator (Zaiput) to canvas diagram!`, 'success');
  };

  const getMiscibilityBadge = (type: MiscibilityType) => {
    switch (type) {
      case 'miscible':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={13} />
            Miscible
          </span>
        );
      case 'immiscible':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <XCircle size={13} />
            Immiscible (Biphasic)
          </span>
        );
      case 'partially':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertCircle size={13} />
            Partially Miscible
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800/80 dark:to-emerald-950/40 p-5 rounded-xl border border-teal-100 dark:border-teal-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="text-teal-600 dark:text-teal-400" />
              Solvent Miscibility &amp; Biphasic Extraction Matrix
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Inspect pairwise solvent compatibility, phase boundary formation, relative layer ordering (upper vs lower phase), 
              and dielectric polarity difference for liquid-liquid extraction (LLE) in flow.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setViewMode('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'inspector'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Pairwise Inspector
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Full Grid Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        }`}>
          <Check size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Canvas Workflow Integration Bar */}
      <div className="bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-cyan-50/70 dark:from-slate-800/90 dark:via-emerald-950/30 dark:to-teal-950/40 p-4 rounded-xl border border-teal-200/80 dark:border-teal-800/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Split size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Canvas Flow Reaction Integration</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 font-semibold">
                  {feedSolvents.length} Solvent{feedSolvents.length === 1 ? '' : 's'} in Diagram Feeds
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Load solvents directly from canvas feed solutions or add an in-line Membrane Separator (Zaiput) to the diagram.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleImportFeedSolvents}
              disabled={feedSolvents.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Import solvent names from feed solutions currently configured on canvas"
            >
              <Upload size={13} className="text-teal-600 dark:text-teal-400" />
              <span>Load Canvas Feeds</span>
            </button>

            <button
              onClick={handleAddZaiputToCanvas}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Add a Zaiput continuous membrane liquid-liquid separator module to diagram"
            >
              <PlusCircle size={13} />
              <span>Add Separator (Zaiput) to Canvas</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'inspector' ? (
        /* PAIRWISE INSPECTOR */
        <div className="space-y-6">
          {/* Solvent Selection Controls */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Solvent 1
                </label>
                <select
                  value={solventAId}
                  onChange={(e) => setSolventAId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {SOLVENTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ρ = {s.density} g/mL, ε = {s.dielectricConstant})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  onClick={handleSwap}
                  title="Swap Solvents"
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-transform hover:scale-105 cursor-pointer"
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Solvent 2
                </label>
                <select
                  value={solventBId}
                  onChange={(e) => setSolventBId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {SOLVENTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ρ = {s.density} g/mL, ε = {s.dielectricConstant})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pairwise Inspection Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Summary & Analysis */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Binary Pair Compatibility
                </span>
                {getMiscibilityBadge(pairwise.status)}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {pairwise.description}
              </p>

              {/* Layer Ordering Details */}
              {pairwise.status !== 'miscible' && pairwise.upperPhase && pairwise.lowerPhase && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Biphasic Layer Distribution (Gravity Separation)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                          TOP LAYER (Buoyant)
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {pairwise.upperPhase.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        ρ = {pairwise.upperPhase.density} g/mL
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                          BOTTOM LAYER (Dense)
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {pairwise.lowerPhase.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        ρ = {pairwise.lowerPhase.density} g/mL
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                    <span>Density differential: <strong className="text-slate-800 dark:text-slate-200">Δρ = {pairwise.densityDelta} g/mL</strong></span>
                    <span className="font-medium text-teal-700 dark:text-teal-300">
                      {pairwise.densityDelta && pairwise.densityDelta >= 0.15 
                        ? '⚡ Fast gravitational settling' 
                        : pairwise.densityDelta && pairwise.densityDelta >= 0.08
                        ? '⏱ Moderate phase splitting'
                        : '⚠️ Slow phase splitting (emulsion risk)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Physical Property Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Dielectric Difference</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Δε = {pairwise.dielectricDelta}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Polarity gap</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">{solventA.name} Viscosity</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {solventA.viscosity} cP
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">at 20°C</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">{solventB.name} Viscosity</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {solventB.viscosity} cP
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">at 20°C</span>
                </div>
              </div>
            </div>

            {/* Right: Visual Graduated Settling Tube with Realistic Layers & Meniscus */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <span>Visual Biphasic Separation Tube</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Graduated
                </span>
              </span>

              {/* Graphical Tube with Graduation Ticks */}
              <div className="relative w-48 h-72 my-2 flex items-center justify-center">
                {/* Tube Outer Glass Container */}
                <div className="relative w-36 h-68 rounded-b-3xl rounded-t-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-950/40 shadow-inner overflow-hidden flex flex-col justify-end p-0.5">
                  
                  {/* Glass Reflection Highlight */}
                  <div className="absolute top-2 left-2 bottom-6 w-1.5 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full z-20 pointer-events-none" />

                  {/* Graduation Marks on the Left */}
                  <div className="absolute top-4 left-0 bottom-6 w-5 flex flex-col justify-between py-1 z-20 pointer-events-none select-none">
                    {[30, 25, 20, 15, 10, 5].map((val) => (
                      <div key={val} className="flex items-center gap-1">
                        <div className="w-2 h-px bg-slate-400 dark:bg-slate-600"></div>
                        <span className="text-[7.5px] font-mono text-slate-400 dark:text-slate-500 leading-none">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {pairwise.status === 'miscible' ? (
                    /* Single Homogeneous Phase Blend */
                    <div 
                      className="w-full h-full rounded-b-2xl rounded-t-sm flex flex-col items-center justify-center p-3 text-center relative z-10 transition-all duration-300"
                      style={{
                        background: `linear-gradient(180deg, ${solventA.color}44 0%, ${solventB.color}66 100%)`
                      }}
                    >
                      <CheckCircle2 size={24} className="text-emerald-700 dark:text-emerald-300 mb-1.5" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        Single Phase
                      </span>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium mt-1">
                        100% Homogeneous Blend
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                        No separation interface
                      </span>
                    </div>
                  ) : (
                    /* Biphasic Stratified Liquid Layers */
                    <div className="w-full h-full flex flex-col justify-between relative z-10">
                      {/* Top Layer (Lighter Phase) */}
                      <div
                        style={{ 
                          height: '49%',
                          backgroundColor: `${pairwise.upperPhase?.color || '#38bdf8'}40`,
                        }}
                        className="w-full rounded-t-sm border-b border-white/40 flex flex-col items-center justify-center p-1.5 text-center relative overflow-hidden"
                      >
                        {/* Top Phase Density & Label Annotation */}
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pairwise.upperPhase?.color }}></span>
                          <span className="text-[10px] font-extrabold uppercase text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                            {pairwise.upperPhase?.name.split(' ')[0]}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                          ρ = {pairwise.upperPhase?.density} g/mL
                        </span>
                        <span className="text-[8px] font-mono uppercase text-slate-500 dark:text-slate-400">
                          Upper Phase
                        </span>
                      </div>

                      {/* Curvature Meniscus Interface */}
                      <div className="relative w-full h-2 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
                          <path
                            d="M 0 5 Q 50 10 100 5 L 100 10 L 0 10 Z"
                            fill={pairwise.status === 'partially' ? '#f59e0b99' : '#0284c788'}
                          />
                          <path
                            d="M 0 5 Q 50 10 100 5"
                            stroke={pairwise.status === 'partially' ? '#d97706' : '#38bdf8'}
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                      </div>

                      {/* Bottom Layer (Denser Phase) */}
                      <div
                        style={{ 
                          height: '49%',
                          backgroundColor: `${pairwise.lowerPhase?.color || '#6366f1'}55`,
                        }}
                        className="w-full rounded-b-2xl border-t border-white/20 flex flex-col items-center justify-center p-1.5 text-center relative overflow-hidden"
                      >
                        {/* Bottom Phase Density & Label Annotation */}
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pairwise.lowerPhase?.color }}></span>
                          <span className="text-[10px] font-extrabold uppercase text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                            {pairwise.lowerPhase?.name.split(' ')[0]}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                          ρ = {pairwise.lowerPhase?.density} g/mL
                        </span>
                        <span className="text-[8px] font-mono uppercase text-slate-500 dark:text-slate-400">
                          Lower Phase
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Clarification Annotation */}
              <div className="text-center text-[11px] text-slate-600 dark:text-slate-300 mt-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 w-full">
                {pairwise.status === 'miscible' ? (
                  <span>Ideal for single-phase homogeneous flow reactions.</span>
                ) : (
                  <span>
                    Stratified for in-line liquid-liquid extraction (e.g. <strong>Zaiput Membrane Separator</strong>).
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FULL GRID MATRIX */
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          {/* Header Controls & Status Readout */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter 32 solvents..."
                  value={matrixFilter}
                  onChange={(e) => setMatrixFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 w-52"
                />
              </div>

              {matrixFilter && (
                <button
                  onClick={() => setMatrixFilter('')}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Clear ({matrixSolvents.length} showing)
                </button>
              )}

              {/* Display Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setMatrixStyle('badges')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    matrixStyle === 'badges'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  title="Show M, I, P, Self text badges"
                >
                  <Grid size={13} />
                  <span>Symbol Badges (M / I)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixStyle('dots')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    matrixStyle === 'dots'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  title="Show reference chart dot style"
                >
                  <CircleDot size={13} />
                  <span>Dot Matrix (Chart Style)</span>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3.5 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-600"></span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">Miscible (Homogeneous)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-200"></span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">Immiscible (Biphasic)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-600 border border-slate-400"></span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">Diagonal (Self)</span>
              </div>
            </div>
          </div>

          {/* Interactive Crosshair Inspection Readout Banner */}
          <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-r from-sky-50/80 via-indigo-50/50 to-teal-50/70 dark:from-sky-950/40 dark:via-slate-800/80 dark:to-teal-950/30 shadow-2xs transition-all">
            {hoveredPair ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Crosshair size={14} />
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <span className="text-sky-700 dark:text-sky-300 font-extrabold">{hoveredPair.sRow.name}</span>
                    <span className="text-slate-400 font-normal">×</span>
                    <span className="text-teal-700 dark:text-teal-300 font-extrabold">{hoveredPair.sCol.name}</span>
                  </div>

                  <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>

                  {hoveredPair.sRow.id === hoveredPair.sCol.id ? (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      Diagonal Identity (Pure Solvent)
                    </span>
                  ) : hoveredPair.misc.status === 'miscible' ? (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Miscible Blend (Single Phase)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                      <XCircle size={12} /> Immiscible (Biphasic Boundary)
                    </span>
                  )}

                  {hoveredPair.sRow.id !== hoveredPair.sCol.id && (
                    <span className="text-slate-600 dark:text-slate-300 font-mono">
                      Δρ = {hoveredPair.misc.densityDelta} g/mL
                      {hoveredPair.misc.upperPhase && (
                        <span className="ml-1 text-slate-500 dark:text-slate-400">
                          (Top: {hoveredPair.misc.upperPhase.name.split(' ')[0]} | Bottom: {hoveredPair.misc.lowerPhase?.name.split(' ')[0]})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSolventAId(hoveredPair.sRow.id);
                      setSolventBId(hoveredPair.sCol.id);
                      setViewMode('inspector');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Pairwise</span>
                    <ArrowRight size={12} />
                  </button>

                  {hoveredPair.misc.status !== 'miscible' && (
                    <button
                      onClick={() => {
                        const newNode = {
                          id: `zaiput_${Date.now()}`,
                          type: 'zaiput',
                          position: { 
                            x: 450 + Math.floor(Math.random() * 60), 
                            y: 200 + Math.floor(Math.random() * 60) 
                          },
                          data: {
                            label: 'Membrane Separator (Zaiput)',
                            notes: `Top: ${hoveredPair.misc.upperPhase?.name} | Bottom: ${hoveredPair.misc.lowerPhase?.name} (Δρ = ${hoveredPair.misc.densityDelta} g/mL)`
                          }
                        };
                        addNodeToCanvas(newNode);
                        showFeedback(`Added Zaiput Separator for ${hoveredPair.sRow.name} + ${hoveredPair.sCol.name} to canvas!`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle size={12} />
                      <span>Add Zaiput</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Crosshair size={14} className="text-sky-500 shrink-0 animate-pulse" />
                <span>
                  <strong>Interactive Crosshair Highlighting Active:</strong> Hover your cursor over any row or column in the matrix below to instantly track intersecting lines, test biphasic extraction, and inspect solvent properties.
                </span>
              </div>
            )}
          </div>

          {/* Matrix Table with Sticky Column & Row Headers and Crosshair Line Highlighting */}
          <div 
            className="overflow-x-auto overflow-y-auto max-h-[660px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs relative"
            onMouseLeave={() => setHoveredCell(null)}
          >
            <table className="text-xs border-collapse w-max min-w-full">
              <thead>
                <tr>
                  {/* Top-Left Corner Header */}
                  <th className="p-3 border-b-2 border-r-2 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 text-left font-bold text-slate-800 dark:text-slate-100 sticky top-0 left-0 z-30 min-w-[220px] w-[220px] shadow-xs">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-700 dark:text-slate-200">
                        Solvent Names
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        Row (Solvent 1) ↓ vs Column (Solvent 2) →
                      </span>
                    </div>
                  </th>

                  {/* Vertical Column Headers with Spelled-out Full Names */}
                  {matrixSolvents.map((colSolvent) => {
                    const isColHighlighted = hoveredCell?.colId === colSolvent.id;
                    return (
                      <th
                        key={colSolvent.id}
                        onMouseEnter={() => setHoveredCell(prev => ({ rowId: prev?.rowId || colSolvent.id, colId: colSolvent.id }))}
                        className={`p-1.5 border-b-2 border-r border-slate-200 dark:border-slate-800 sticky top-0 z-20 h-52 w-10 min-w-[38px] max-w-[38px] align-bottom text-left transition-colors cursor-pointer select-none ${
                          isColHighlighted
                            ? 'bg-sky-100 dark:bg-sky-900/90 border-b-4 border-b-sky-500 text-sky-950 dark:text-sky-100 font-black shadow-sm ring-1 ring-sky-300'
                            : 'bg-slate-100 dark:bg-slate-800/95 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                        }`}
                        title={`${colSolvent.name} (${colSolvent.formula}) - ρ = ${colSolvent.density} g/mL`}
                      >
                        <div
                          className="font-bold text-xs tracking-tight whitespace-nowrap pb-2 px-1"
                          style={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block'
                          }}
                        >
                          {colSolvent.name}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {matrixSolvents.map((rowSolvent) => {
                  const isRowHighlighted = hoveredCell?.rowId === rowSolvent.id;

                  return (
                    <tr key={rowSolvent.id} className="transition-colors">
                      {/* Sticky Row Header with Spelled-out Full Name */}
                      <td
                        onMouseEnter={() => setHoveredCell(prev => ({ rowId: rowSolvent.id, colId: prev?.colId || rowSolvent.id }))}
                        className={`p-2.5 border-b border-r-2 border-slate-200 dark:border-slate-800 sticky left-0 z-10 min-w-[220px] w-[220px] transition-colors cursor-pointer select-none ${
                          isRowHighlighted
                            ? 'bg-sky-100 dark:bg-sky-900/90 border-r-4 border-r-sky-500 text-sky-950 dark:text-sky-100 font-black shadow-sm ring-1 ring-sky-300'
                            : 'bg-slate-50 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                        }`}
                        title={`${rowSolvent.name} (${rowSolvent.formula}) - ρ = ${rowSolvent.density} g/mL`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-xs truncate" title={rowSolvent.name}>
                            {rowSolvent.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>{rowSolvent.formula}</span>
                            <span>•</span>
                            <span>ρ = {rowSolvent.density}</span>
                          </span>
                        </div>
                      </td>

                      {/* Matrix Grid Cells with Crosshair Highlighting */}
                      {matrixSolvents.map((colSolvent) => {
                        const isCol = hoveredCell?.colId === colSolvent.id;
                        const isRow = hoveredCell?.rowId === rowSolvent.id;
                        const isIntersection = isRow && isCol;
                        const isCrosshair = isRow || isCol;
                        const isSelf = rowSolvent.id === colSolvent.id;

                        const pair = getMiscibility(rowSolvent.id, colSolvent.id);

                        let cellClasses = '';
                        let cellContent: React.ReactNode = null;

                        if (isSelf) {
                          // Diagonal Identity Cell - preserved per user request
                          if (isIntersection) {
                            cellClasses = 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-black ring-2 ring-sky-500 scale-105 z-10 shadow-sm';
                          } else if (isCrosshair) {
                            cellClasses = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold border-sky-300 dark:border-sky-600';
                          } else {
                            cellClasses = 'bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-semibold';
                          }

                          cellContent = matrixStyle === 'badges' ? (
                            <span className="text-[10px] font-bold">Self</span>
                          ) : (
                            <span className="text-slate-400 font-bold">—</span>
                          );
                        } else if (pair.status === 'miscible') {
                          // Miscible Cell
                          if (isIntersection) {
                            cellClasses = 'bg-emerald-300 dark:bg-emerald-700 text-emerald-950 dark:text-emerald-50 font-black ring-2 ring-emerald-500 scale-110 z-10 shadow-md';
                          } else if (isCrosshair) {
                            cellClasses = 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold border-y-sky-300 dark:border-y-sky-600';
                          } else {
                            cellClasses = 'bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold';
                          }

                          cellContent = matrixStyle === 'badges' ? (
                            <span>M</span>
                          ) : (
                            <span className="w-full h-full block"></span>
                          );
                        } else if (pair.status === 'immiscible') {
                          // Immiscible Cell (Biphasic)
                          if (isIntersection) {
                            cellClasses = 'bg-rose-300 dark:bg-rose-700 text-rose-950 dark:text-rose-50 font-black ring-2 ring-rose-500 scale-110 z-10 shadow-md';
                          } else if (isCrosshair) {
                            cellClasses = 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 font-bold border-y-sky-300 dark:border-y-sky-600';
                          } else {
                            cellClasses = 'bg-rose-50/80 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold';
                          }

                          cellContent = matrixStyle === 'badges' ? (
                            <span>I</span>
                          ) : (
                            <span className="inline-block w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-200 shadow-2xs"></span>
                          );
                        } else {
                          // Partially Miscible Cell
                          if (isIntersection) {
                            cellClasses = 'bg-amber-300 dark:bg-amber-700 text-amber-950 dark:text-amber-50 font-black ring-2 ring-amber-500 scale-110 z-10 shadow-md';
                          } else if (isCrosshair) {
                            cellClasses = 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-bold border-y-sky-300 dark:border-y-sky-600';
                          } else {
                            cellClasses = 'bg-amber-50/80 hover:bg-amber-100/90 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold';
                          }

                          cellContent = matrixStyle === 'badges' ? (
                            <span>P</span>
                          ) : (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>
                          );
                        }

                        // Add crosshair border highlights
                        let borderClasses = 'border border-slate-200 dark:border-slate-800';
                        if (isRow && !isIntersection) {
                          borderClasses = 'border-y border-y-sky-400 dark:border-y-sky-500 border-x border-x-slate-200 dark:border-x-slate-800';
                        } else if (isCol && !isIntersection) {
                          borderClasses = 'border-x border-x-sky-400 dark:border-x-sky-500 border-y border-y-slate-200 dark:border-y-slate-800';
                        }

                        return (
                          <td
                            key={colSolvent.id}
                            onMouseEnter={() => setHoveredCell({ rowId: rowSolvent.id, colId: colSolvent.id })}
                            onClick={() => {
                              setSolventAId(rowSolvent.id);
                              setSolventBId(colSolvent.id);
                              setViewMode('inspector');
                            }}
                            className={`w-10 min-w-[38px] max-w-[38px] h-10 min-h-[40px] text-center font-mono cursor-pointer transition-all duration-75 select-none relative ${borderClasses} ${cellClasses}`}
                            title={`${rowSolvent.name} + ${colSolvent.name}: ${pair.status.toUpperCase()} (Click to inspect)`}
                          >
                            <div className="flex items-center justify-center w-full h-full">
                              {cellContent}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

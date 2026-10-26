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
  Split
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function MiscibilityMatrix() {
  const { currentProject, addNodeToCanvas, stoiRows } = useAppContext();

  const [solventAId, setSolventAId] = useState('water');
  const [solventBId, setSolventBId] = useState('ethyl_acetate');
  const [matrixFilter, setMatrixFilter] = useState('');
  const [viewMode, setViewMode] = useState<'inspector' | 'matrix'>('inspector');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

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

  // Solvents for matrix view (top 12 common flow solvents)
  const matrixSolvents = useMemo(() => {
    if (!matrixFilter.trim()) {
      return SOLVENTS.slice(0, 12);
    }
    const q = matrixFilter.toLowerCase();
    return SOLVENTS.filter(s => s.name.toLowerCase().includes(q) || s.formula.toLowerCase().includes(q));
  }, [matrixFilter]);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Filter solvents..."
                value={matrixFilter}
                onChange={(e) => setMatrixFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Miscible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Partially Miscible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Immiscible</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-left font-bold text-slate-700 dark:text-slate-200 sticky left-0 z-10">
                    Solvent
                  </th>
                  {matrixSolvents.map((s) => (
                    <th
                      key={s.id}
                      className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center font-bold text-slate-700 dark:text-slate-200 min-w-[70px]"
                    >
                      <div className="truncate max-w-[70px]" title={s.name}>
                        {s.formula || s.name.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixSolvents.map((rowSolvent) => (
                  <tr key={rowSolvent.id}>
                    <td className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-10 whitespace-nowrap">
                      {rowSolvent.formula || rowSolvent.name.split(' ')[0]}
                    </td>
                    {matrixSolvents.map((colSolvent) => {
                      const pair = getMiscibility(rowSolvent.id, colSolvent.id);
                      let cellBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                      let cellText = '—';

                      if (rowSolvent.id === colSolvent.id) {
                        cellBg = 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold';
                        cellText = 'Self';
                      } else if (pair.status === 'miscible') {
                        cellBg = 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-bold';
                        cellText = 'M';
                      } else if (pair.status === 'immiscible') {
                        cellBg = 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-300 font-bold';
                        cellText = 'I';
                      } else if (pair.status === 'partially') {
                        cellBg = 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 font-bold';
                        cellText = 'P';
                      }

                      return (
                        <td
                          key={colSolvent.id}
                          onClick={() => {
                            setSolventAId(rowSolvent.id);
                            setSolventBId(colSolvent.id);
                            setViewMode('inspector');
                          }}
                          className={`p-2 border border-slate-200 dark:border-slate-800 text-center font-mono cursor-pointer transition-colors ${cellBg}`}
                          title={`${rowSolvent.name} + ${colSolvent.name}: ${pair.status}`}
                        >
                          {cellText}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

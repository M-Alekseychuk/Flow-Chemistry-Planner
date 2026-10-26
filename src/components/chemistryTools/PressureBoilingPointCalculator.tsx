import React, { useState, useMemo, useRef } from 'react';
import { 
  SOLVENTS, 
  calculateElevatedBoilingPoint, 
  calculateRequiredBPR, 
  getSolvent,
  generateVleCurveData,
  getVaporPressureBar
} from '../../lib/chemistryToolsData';
import { 
  Flame, 
  Gauge, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Upload, 
  PlusCircle, 
  Check, 
  Layers,
  Info,
  Sliders
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function PressureBoilingPointCalculator() {
  const { currentProject, applyToCanvasNode, addNodeToCanvas, stoiRows } = useAppContext();

  const [selectedSolventId, setSelectedSolventId] = useState('dcm');
  const [activeMode, setActiveMode] = useState<'forward' | 'reverse'>('reverse'); // reverse (Trxn -> BPR) default for flow process design
  const [pressureBar, setPressureBar] = useState<number>(10);
  const [targetTemp, setTargetTemp] = useState<number>(110);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Target BPR node to update
  const [selectedTargetBprId, setSelectedTargetBprId] = useState<string>('');

  const solvent = useMemo(() => getSolvent(selectedSolventId), [selectedSolventId]);

  // Canvas modules
  const activeBprNodes = useMemo(() => {
    if (!currentProject?.flowData?.nodes) return [];
    return currentProject.flowData.nodes.filter((n: any) => 
      n.type === 'bpr' || n.type === 'pressureGauge'
    );
  }, [currentProject?.flowData?.nodes]);

  const activeReactorNodes = useMemo(() => {
    if (!currentProject?.flowData?.nodes) return [];
    return currentProject.flowData.nodes.filter((n: any) => 
      n.type === 'reactor' || (n.data?.temperature !== undefined && n.data?.temperature !== '')
    );
  }, [currentProject?.flowData?.nodes]);

  // Detected solvents in feed nodes or stoichiometry table
  const detectedSolvents = useMemo(() => {
    const list: Array<{ id: string; name: string; source: string }> = [];
    // From stoiRows
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

  // Forward calculation: P -> elevated Tb
  const forwardResult = useMemo(() => {
    return calculateElevatedBoilingPoint(selectedSolventId, pressureBar);
  }, [selectedSolventId, pressureBar]);

  // Reverse calculation: target Temp -> recommended BPR
  const reverseResult = useMemo(() => {
    return calculateRequiredBPR(selectedSolventId, targetTemp);
  }, [selectedSolventId, targetTemp]);

  const bprPresets = [2, 5, 8, 10, 15, 20, 30];

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Canvas Actions
  const handleImportFromCanvas = () => {
    let imported = 0;
    // Try importing reactor temperature
    if (activeReactorNodes.length > 0) {
      const rxNode = activeReactorNodes[0];
      const t = parseFloat(rxNode.data?.temperature);
      if (!isNaN(t) && t > 0) {
        setTargetTemp(t);
        imported++;
      }
    }
    // Try importing BPR setting
    if (activeBprNodes.length > 0) {
      const bprNode = activeBprNodes[0];
      const p = parseFloat(bprNode.data?.regulatorValue);
      if (!isNaN(p) && p > 0) {
        setPressureBar(p);
        imported++;
      }
    }

    if (imported > 0) {
      showFeedback(`Imported parameters from diagram (${imported} value${imported > 1 ? 's' : ''})!`, 'success');
    } else {
      showFeedback('No temperature or pressure values found on canvas nodes to import.', 'info');
    }
  };

  const handleApplyToBprNode = () => {
    const targetId = selectedTargetBprId || activeBprNodes[0]?.id;
    if (!targetId) {
      showFeedback('Please select a BPR module from the canvas list.', 'info');
      return;
    }

    const node = activeBprNodes.find((n: any) => n.id === targetId);
    const nodeLabel = node?.data?.label || 'BPR Node';
    const bprVal = activeMode === 'reverse' ? reverseResult.recommendedBprBar : pressureBar;

    applyToCanvasNode(targetId, {
      regulatorValue: Math.round(bprVal * 10) / 10,
      regulatorUnit: 'bar',
      notes: `Sized for ${solvent.name} at ${targetTemp}°C (Pvap: ${reverseResult.vaporPressureBar} bar)`
    });

    showFeedback(`Updated "${nodeLabel}": Pressure setpoint = ${Math.round(bprVal * 10) / 10} bar`, 'success');
  };

  const handleAddSizedBprToCanvas = () => {
    const bprVal = activeMode === 'reverse' ? reverseResult.recommendedBprBar : pressureBar;
    const rounded = Math.round(bprVal * 10) / 10;
    const newNode = {
      id: `bpr_${Date.now()}`,
      type: 'bpr',
      position: { 
        x: 480 + Math.floor(Math.random() * 60), 
        y: 220 + Math.floor(Math.random() * 60) 
      },
      data: {
        label: `BPR (${rounded} bar)`,
        regulatorValue: rounded,
        regulatorUnit: 'bar',
        notes: `Solvent: ${solvent.name} | Trxn: ${targetTemp}°C (Pvap: ${reverseResult.vaporPressureBar} bar)`
      }
    };

    addNodeToCanvas(newNode);
    showFeedback(`Added sized BPR module (${rounded} bar) to canvas diagram!`, 'success');
  };

  // Operating Point for P-T Diagram
  const currentOpPoint = useMemo(() => {
    const opTemp = targetTemp;
    const opPressure = activeMode === 'reverse' ? reverseResult.recommendedBprBar : pressureBar;
    const pVap = getVaporPressureBar(selectedSolventId, opTemp);
    
    let status: 'subcooled' | 'safety_margin' | 'flash_boiling' = 'subcooled';
    if (opPressure < pVap) {
      status = 'flash_boiling';
    } else if (opPressure < pVap + 2.0) {
      status = 'safety_margin';
    } else {
      status = 'subcooled';
    }

    return {
      temp: opTemp,
      pressure: opPressure,
      pVap,
      status
    };
  }, [selectedSolventId, targetTemp, activeMode, reverseResult.recommendedBprBar, pressureBar]);

  // Generate VLE Curve points
  const vlePoints = useMemo(() => {
    return generateVleCurveData(selectedSolventId, 0, 220, 60);
  }, [selectedSolventId]);

  // SVG Chart Dimensions & Scale calculations
  const svgWidth = 560;
  const svgHeight = 280;
  const margin = { top: 25, right: 30, bottom: 42, left: 52 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const minT = 0;
  const maxT = 220;
  const minP = 0;
  const maxP = 35; // bar

  const scaleX = (t: number) => margin.left + ((Math.max(minT, Math.min(maxT, t)) - minT) / (maxT - minT)) * plotWidth;
  const scaleY = (p: number) => margin.top + (1 - (Math.max(minP, Math.min(maxP, p)) - minP) / (maxP - minP)) * plotHeight;

  // Build SVG Path for VLE curve
  const vlePathD = useMemo(() => {
    if (!vlePoints || vlePoints.length === 0) return '';
    return vlePoints.map((pt, idx) => {
      const x = scaleX(pt.temp);
      const y = scaleY(pt.pressureBar);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [vlePoints]);

  // Build Flash Evaporation (under curve) polygon
  const flashZoneD = useMemo(() => {
    if (!vlePoints || vlePoints.length === 0) return '';
    const pointsStr = vlePoints.map(pt => `${scaleX(pt.temp).toFixed(1)} ${scaleY(pt.pressureBar).toFixed(1)}`).join(' L ');
    const bottomRight = `${scaleX(maxT).toFixed(1)} ${scaleY(0).toFixed(1)}`;
    const bottomLeft = `${scaleX(minT).toFixed(1)} ${scaleY(0).toFixed(1)}`;
    return `M ${scaleX(minT).toFixed(1)} ${scaleY(0).toFixed(1)} L ${pointsStr} L ${bottomRight} L ${bottomLeft} Z`;
  }, [vlePoints]);

  // Build Subcooled Liquid (above curve) polygon
  const subcooledZoneD = useMemo(() => {
    if (!vlePoints || vlePoints.length === 0) return '';
    const pointsStr = vlePoints.map(pt => `${scaleX(pt.temp).toFixed(1)} ${scaleY(pt.pressureBar).toFixed(1)}`).join(' L ');
    const topLeft = `${scaleX(minT).toFixed(1)} ${scaleY(maxP).toFixed(1)}`;
    const topRight = `${scaleX(maxT).toFixed(1)} ${scaleY(maxP).toFixed(1)}`;
    return `M ${topLeft} L ${topRight} L ${pointsStr} Z`;
  }, [vlePoints]);

  // Hover state for interactive curve inspection
  const [hoverData, setHoverData] = useState<{ temp: number; pressure: number; x: number; y: number } | null>(null);

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const fracX = (clientX - margin.left) / plotWidth;
    if (fracX >= 0 && fracX <= 1) {
      const t = minT + fracX * (maxT - minT);
      const p = getVaporPressureBar(selectedSolventId, t);
      setHoverData({
        temp: Math.round(t),
        pressure: p,
        x: scaleX(t),
        y: scaleY(p)
      });
    } else {
      setHoverData(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-orange-950/40 p-5 rounded-xl border border-amber-100 dark:border-orange-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Flame className="text-amber-600 dark:text-amber-400" />
              Pressure-Boiling Point &amp; BPR Sizing Calculator
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Model solvent superheating in pressurized capillary microreactors using Antoine vapor pressure equations. 
              Safely accelerate reaction rates far above atmospheric boiling points without solvent flash evaporation.
            </p>
          </div>

          {/* Calculator Mode Switch */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveMode('reverse')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeMode === 'reverse'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Flame size={14} />
              Reaction Temp → Sizing BPR
            </button>
            <button
              onClick={() => setActiveMode('forward')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeMode === 'forward'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Gauge size={14} />
              Pressure → Boiling Pt
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
      <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-yellow-50/70 dark:from-slate-800/90 dark:via-orange-950/30 dark:to-amber-950/40 p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Canvas BPR &amp; Reactor Synchronization</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 font-semibold">
                  {activeBprNodes.length} BPR Module{activeBprNodes.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Directly import temperature from diagram reactors or apply the sized BPR pressure setpoint to regulator nodes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeBprNodes.length > 0 && (
              <select
                value={selectedTargetBprId || activeBprNodes[0]?.id}
                onChange={(e) => setSelectedTargetBprId(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {activeBprNodes.map((n: any) => (
                  <option key={n.id} value={n.id}>
                    {n.data?.label || n.data?.name || `BPR (${n.id.slice(0, 5)})`} ({n.data?.regulatorValue || 0} {n.data?.regulatorUnit || 'bar'})
                  </option>
                ))}
              </select>
            )}

            {/* Import Button */}
            <button
              onClick={handleImportFromCanvas}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              title="Import temperature from reactor or pressure from BPR module on canvas"
            >
              <Upload size={13} className="text-amber-600 dark:text-amber-400" />
              <span>Import from Diagram</span>
            </button>

            {/* Apply Button */}
            <button
              onClick={handleApplyToBprNode}
              disabled={activeBprNodes.length === 0}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Apply calculated BPR pressure to selected BPR node on canvas"
            >
              <ArrowRight size={13} />
              <span>Apply to BPR</span>
            </button>

            {/* Add BPR to Canvas */}
            <button
              onClick={handleAddSizedBprToCanvas}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Add a new sized BPR module directly to canvas diagram"
            >
              <PlusCircle size={13} />
              <span>Add BPR to Canvas</span>
            </button>
          </div>
        </div>

        {/* Quick Detected Solvents in Feed */}
        {detectedSolvents.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
              Solvent detected in feeds:
            </span>
            <div className="flex flex-wrap gap-1">
              {detectedSolvents.map(ds => (
                <button
                  key={ds.id}
                  onClick={() => {
                    setSelectedSolventId(ds.id);
                    showFeedback(`Switched solvent to ${ds.name} (from ${ds.source})`);
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                    selectedSolventId === ds.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-white/80 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {ds.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Solvent Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
            Selected Solvent:
          </label>
          <select
            value={selectedSolventId}
            onChange={(e) => setSelectedSolventId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {SOLVENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Ambient bp: {s.boilingPoint}°C)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>CAS: {solvent.cas}</span>
          <span>Ambient bp: <strong className="text-slate-800 dark:text-slate-200">{solvent.boilingPoint}°C</strong></span>
          <span>Antoine Range: [{solvent.antoine.tMin}°C to {solvent.antoine.tMax}°C]</span>
        </div>
      </div>

      {/* INTERACTIVE P-T PHASE BOUNDARY CURVE (Antoine Equilibrium) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Interactive Pressure–Temperature (P–T) Phase Boundary</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Antoine VLE Model
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vapor-liquid equilibrium curve delineating Subcooled Liquid (Safe), Safety Margin buffer, and Flash Evaporation risk zones.
            </p>
          </div>

          {/* Operating Point Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {currentOpPoint.status === 'subcooled' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck size={14} />
                Subcooled Liquid (Safe)
              </span>
            )}
            {currentOpPoint.status === 'safety_margin' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <AlertTriangle size={14} />
                Safety Margin Zone (&lt;2 bar buffer)
              </span>
            )}
            {currentOpPoint.status === 'flash_boiling' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                <AlertTriangle size={14} />
                Flash Evaporation Alert (Solvent Boiling!)
              </span>
            )}
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative w-full overflow-x-auto select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-4xl mx-auto h-auto cursor-crosshair"
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={() => setHoverData(null)}
          >
            <defs>
              <linearGradient id="subcooledGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="flashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.22" />
              </linearGradient>
            </defs>

            {/* Shaded Subcooled Liquid Zone */}
            <path d={subcooledZoneD} fill="url(#subcooledGrad)" />

            {/* Shaded Flash Evaporation Zone */}
            <path d={flashZoneD} fill="url(#flashGrad)" />

            {/* Gridlines */}
            {[5, 10, 15, 20, 25, 30].map(p => (
              <g key={`grid-y-${p}`}>
                <line
                  x1={margin.left}
                  y1={scaleY(p)}
                  x2={svgWidth - margin.right}
                  y2={scaleY(p)}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={scaleY(p) + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-slate-400 font-mono"
                >
                  {p} bar
                </text>
              </g>
            ))}

            {[50, 100, 150, 200].map(t => (
              <g key={`grid-x-${t}`}>
                <line
                  x1={scaleX(t)}
                  y1={margin.top}
                  x2={scaleX(t)}
                  y2={svgHeight - margin.bottom}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="3 3"
                />
                <text
                  x={scaleX(t)}
                  y={svgHeight - margin.bottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-slate-400 font-mono"
                >
                  {t}°C
                </text>
              </g>
            ))}

            {/* 1 atm line (1.013 bar) */}
            <line
              x1={margin.left}
              y1={scaleY(1.013)}
              x2={svgWidth - margin.right}
              y2={scaleY(1.013)}
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text
              x={svgWidth - margin.right - 6}
              y={scaleY(1.013) - 5}
              textAnchor="end"
              fontSize="9"
              className="fill-sky-600 dark:fill-sky-400 font-mono font-semibold"
            >
              1 atm ({solvent.boilingPoint}°C ambient bp)
            </text>

            {/* VLE Antoine Curve Line */}
            <path
              d={vlePathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />

            {/* Zone Inscription Labels inside Chart */}
            <text
              x={margin.left + 24}
              y={margin.top + 32}
              className="fill-emerald-700/80 dark:fill-emerald-300/80 font-bold text-xs"
            >
              ▲ SUBCOOLED LIQUID (Safe Single Phase)
            </text>

            <text
              x={svgWidth - margin.right - 24}
              y={svgHeight - margin.bottom - 16}
              textAnchor="end"
              className="fill-rose-600/80 dark:fill-rose-400/80 font-bold text-xs"
            >
              ▼ FLASH EVAPORATION / VAPOR POCKETS
            </text>

            {/* Crosshairs for Active Operating Point */}
            <line
              x1={scaleX(currentOpPoint.temp)}
              y1={scaleY(currentOpPoint.pressure)}
              x2={scaleX(currentOpPoint.temp)}
              y2={svgHeight - margin.bottom}
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line
              x1={margin.left}
              y1={scaleY(currentOpPoint.pressure)}
              x2={scaleX(currentOpPoint.temp)}
              y2={scaleY(currentOpPoint.pressure)}
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Active Operating Point Marker Dot */}
            <circle
              cx={scaleX(currentOpPoint.temp)}
              cy={scaleY(currentOpPoint.pressure)}
              r="7"
              className={
                currentOpPoint.status === 'subcooled'
                  ? 'fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2'
                  : currentOpPoint.status === 'safety_margin'
                  ? 'fill-amber-500 stroke-white dark:stroke-slate-900 stroke-2'
                  : 'fill-rose-500 stroke-white dark:stroke-slate-900 stroke-2 animate-ping'
              }
            />
            <circle
              cx={scaleX(currentOpPoint.temp)}
              cy={scaleY(currentOpPoint.pressure)}
              r="4"
              className={
                currentOpPoint.status === 'subcooled'
                  ? 'fill-emerald-600'
                  : currentOpPoint.status === 'safety_margin'
                  ? 'fill-amber-600'
                  : 'fill-rose-600'
              }
            />

            {/* Operating Point Floating Tag */}
            <g transform={`translate(${Math.min(svgWidth - 140, Math.max(margin.left + 10, scaleX(currentOpPoint.temp) + 12))}, ${Math.max(margin.top + 14, scaleY(currentOpPoint.pressure) - 12)})`}>
              <rect
                x="0"
                y="-14"
                width="120"
                height="28"
                rx="6"
                className="fill-slate-900/90 dark:fill-white/90 stroke-slate-700/80 dark:stroke-slate-300"
              />
              <text
                x="8"
                y="0"
                className="fill-white dark:fill-slate-900 font-mono text-[10px] font-bold"
              >
                ({currentOpPoint.temp}°C, {currentOpPoint.pressure} bar)
              </text>
              <text
                x="8"
                y="9"
                className={`font-mono text-[8px] font-bold ${
                  currentOpPoint.status === 'subcooled' ? 'fill-emerald-400 dark:fill-emerald-700' : 'fill-rose-400 dark:fill-rose-700'
                }`}
              >
                Pvap = {currentOpPoint.pVap} bar
              </text>
            </g>

            {/* Interactive Mouse Hover Marker */}
            {hoverData && (
              <g>
                <circle
                  cx={hoverData.x}
                  cy={hoverData.y}
                  r="5"
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <g transform={`translate(${Math.min(svgWidth - 110, hoverData.x + 8)}, ${Math.max(margin.top + 10, hoverData.y - 20)})`}>
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="32"
                    rx="5"
                    className="fill-amber-950/90 stroke-amber-500/80"
                  />
                  <text x="6" y="14" fill="#fde68a" fontSize="9" fontFamily="monospace">
                    T: {hoverData.temp}°C
                  </text>
                  <text x="6" y="26" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    Pvap: {hoverData.pressure} bar
                  </text>
                </g>
              </g>
            )}

            {/* Axes Labels */}
            <text
              x={margin.left + plotWidth / 2}
              y={svgHeight - 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              className="fill-slate-600 dark:fill-slate-300"
            >
              Reaction / Capillary Temperature (°C)
            </text>

            <text
              x={-margin.top - plotHeight / 2}
              y="16"
              transform="rotate(-90)"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              className="fill-slate-600 dark:fill-slate-300"
            >
              System Pressure (bar)
            </text>
          </svg>
        </div>
      </div>

      {/* Main Calculation Inputs & Result Panels */}
      {activeMode === 'reverse' ? (
        /* REVERSE MODE: Target Reaction Temp -> Required BPR */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Target Reaction Operating Temperature
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="220"
                    step="1"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="w-24 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        min="-50"
                        max="300"
                        step="1"
                        value={targetTemp}
                        onChange={(e) => setTargetTemp(parseFloat(e.target.value) || 20)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 text-right pr-9"
                      />
                      <span className="absolute right-2 top-2 text-xs font-mono text-slate-400">°C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Superheating Delta Banner */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-200/80 dark:border-amber-900/40 text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  <span>Superheating Degree (ΔT):</span>
                  <span className="font-mono font-bold text-sm">
                    {targetTemp > solvent.boilingPoint 
                      ? `+${targetTemp - solvent.boilingPoint} °C above ambient bp`
                      : 'Sub-ambient boiling operation'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  By Arrhenius kinetics, every +10°C elevation roughly doubles reaction rate (2^(ΔT / 10)).
                </p>
              </div>

              {/* Sizing Rules Guide */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">BPR Sizing Formula:</div>
                <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  P_BPR = max(2.0 bar, P_vap(T_rxn) + 2.0 bar)
                </div>
                <div className="text-[11px]">
                  Includes a +2.0 bar safety cushion to account for flow fluctuations, local hot-spots, and pump pulsation.
                </div>
              </div>
            </div>

            {/* Output Panels */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recommended BPR Rating */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Recommended BPR Setting
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                      {reverseResult.recommendedBprBar} bar
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ({reverseResult.recommendedBprPsi} psi)
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck size={14} /> Suppresses gas bubble formation in reactor coil.
                  </span>
                </div>
              </div>

              {/* Vapor Pressure */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Solvent Vapor Pressure (P<sub>vap</sub> at {targetTemp}°C)
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                      {reverseResult.vaporPressureBar} bar
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  {reverseResult.isSuperheated ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <AlertTriangle size={14} />
                      Target temperature is {targetTemp - solvent.boilingPoint}°C above ambient boiling point.
                    </span>
                  ) : (
                    <span>Operating below atmospheric boiling point ({solvent.boilingPoint}°C).</span>
                  )}
                </div>
              </div>

              {/* Hardware Selection Guide */}
              <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Matching Hardware Regulator Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Fixed Cartridge BPR</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Pick cartridge rated closest to <strong>≥ {reverseResult.recommendedBprBar} bar</strong> (e.g. {Math.ceil(reverseResult.recommendedBprBar / 5) * 5} bar cartridge).
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Adjustable Dome BPR</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Charge N₂ dome to exactly <strong>{reverseResult.recommendedBprBar} bar</strong> with digital pressure regulator.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Reactor Fittings</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {reverseResult.recommendedBprBar > 25 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">Use SS or high-pressure PEEK ferrules.</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Standard 1/16" PEEK finger-tight suitable.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FORWARD MODE: Given Back-Pressure -> Elevated Boiling Point */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Slider & Presets */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Reactor Back-Pressure (BPR Setting)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={pressureBar}
                    onChange={(e) => setPressureBar(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="w-24 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        max="200"
                        step="0.5"
                        value={pressureBar}
                        onChange={(e) => setPressureBar(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 text-right pr-9"
                      />
                      <span className="absolute right-2 top-2 text-xs font-mono text-slate-400">bar</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono mt-1">
                  ≈ {forwardResult.pressurePsi} psi
                </div>
              </div>

              {/* BPR Presets */}
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  Standard Commercial BPR Cartridge Ratings:
                </span>
                <div className="flex flex-wrap gap-2">
                  {bprPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPressureBar(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        pressureBar === preset
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {preset} bar
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Panels */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Elevated Boiling Point */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Pressurized Boiling Point (T<sub>b</sub> at {pressureBar} bar)
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                      {forwardResult.elevatedBpCelsius} °C
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ({(forwardResult.elevatedBpCelsius * 9/5 + 32).toFixed(1)} °F)
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{forwardResult.deltaTemp} °C
                  </span>{' '}
                  above ambient boiling point ({solvent.boilingPoint} °C)
                </div>
              </div>

              {/* Safe Maximum Operating Temp */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                    <span>Safe Max Reaction Temp</span>
                    <ShieldCheck size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {forwardResult.safeOperatingTempCelsius} °C
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Includes recommended <strong>-15 °C safety buffer</strong> below elevated boiling point.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

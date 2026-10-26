import React, { useState, useMemo } from 'react';
import { 
  PEEK_TUBING_PRESETS, 
  calculateCapillaryHydraulics, 
  calculateTemperatureViscosity,
  SOLVENTS, 
  getSolvent 
} from '../../lib/chemistryToolsData';
import { 
  Activity, 
  Gauge, 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Zap, 
  Thermometer, 
  ArrowRight, 
  Upload, 
  PlusCircle, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function CapillaryPressureCalculator() {
  const { currentProject, applyToCanvasNode, addNodeToCanvas } = useAppContext();

  const [innerDiameterMm, setInnerDiameterMm] = useState<number>(0.50); // Orange PEEK default (0.5 mm)
  const [lengthMeters, setLengthMeters] = useState<number>(5.0); // 5 meter reactor coil
  const [flowRateMlMin, setFlowRateMlMin] = useState<number>(2.0); // 2 mL/min
  const [nominalViscosityCp, setNominalViscosityCp] = useState<number>(1.00); // 1 cP (water at 20°C)
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(20); // 20°C nominal
  const [densityGml, setDensityGml] = useState<number>(1.00);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Target canvas node to apply values to
  const [selectedTargetNodeId, setSelectedTargetNodeId] = useState<string>('');

  // Find reactor and coil nodes on the active canvas
  const activeReactorNodes = useMemo(() => {
    if (!currentProject?.flowData?.nodes) return [];
    return currentProject.flowData.nodes.filter((n: any) => 
      n.type === 'reactor' || n.type === 'customModule' || (n.data?.volume !== undefined || n.data?.length !== undefined)
    );
  }, [currentProject?.flowData?.nodes]);

  // Compute temperature-dependent dynamic viscosity: μ(T) = μ₀ * exp(B * (1/T - 1/T₀))
  const tempViscosity = useMemo(() => {
    return calculateTemperatureViscosity(nominalViscosityCp, temperatureCelsius);
  }, [nominalViscosityCp, temperatureCelsius]);

  // Hagen-Poiseuille hydraulics using dynamic viscosity μ(T)
  const calc = useMemo(() => {
    return calculateCapillaryHydraulics(
      innerDiameterMm, 
      lengthMeters, 
      flowRateMlMin, 
      tempViscosity.viscosityCp, 
      densityGml
    );
  }, [innerDiameterMm, lengthMeters, flowRateMlMin, tempViscosity.viscosityCp, densityGml]);

  const handleApplyPresetTubing = (idMm: number) => {
    setInnerDiameterMm(idMm);
  };

  const handleApplySolventProperties = (solventId: string) => {
    const s = getSolvent(solventId);
    setNominalViscosityCp(s.viscosity);
    setDensityGml(s.density);
    showFeedback(`Loaded ${s.name}: μ₀ = ${s.viscosity} cP, ρ = ${s.density} g/mL`);
  };

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Auto-Populate from Active Diagram: Import parameters from canvas reactor node
  const handleImportFromCanvas = (nodeIdToImport?: string) => {
    const targetId = nodeIdToImport || selectedTargetNodeId || (activeReactorNodes[0]?.id);
    if (!targetId) {
      showFeedback('No reactor node found on the canvas to import from.', 'info');
      return;
    }
    const node = activeReactorNodes.find((n: any) => n.id === targetId);
    if (!node) return;

    let importedCount = 0;
    if (node.data?.length) {
      const parsedL = parseFloat(node.data.length);
      if (!isNaN(parsedL) && parsedL > 0) {
        setLengthMeters(node.data.lengthUnit === 'cm' ? parsedL / 100 : parsedL);
        importedCount++;
      }
    }
    if (node.data?.temperature !== undefined && node.data.temperature !== '') {
      const parsedT = parseFloat(node.data.temperature);
      if (!isNaN(parsedT)) {
        setTemperatureCelsius(parsedT);
        importedCount++;
      }
    }
    // Check if upstream feed or simData provides flow rate
    if (node.data?.simData?.flow) {
      setFlowRateMlMin(parseFloat(node.data.simData.flow));
      importedCount++;
    }

    const label = node.data?.label || node.data?.name || `Reactor (${node.id.slice(0, 5)})`;
    showFeedback(`Imported ${importedCount} parameter(s) from "${label}"!`, 'success');
  };

  // Apply to Selected Reactor Node on Canvas
  const handleApplyToNode = () => {
    const targetId = selectedTargetNodeId || activeReactorNodes[0]?.id;
    if (!targetId) {
      showFeedback('Please select a target reactor node from the canvas list.', 'info');
      return;
    }

    const node = activeReactorNodes.find((n: any) => n.id === targetId);
    const targetName = node?.data?.label || node?.data?.name || 'Selected Reactor';

    applyToCanvasNode(targetId, {
      length: lengthMeters,
      lengthUnit: 'm',
      volume: calc.internalVolumeMl,
      volumeUnit: 'mL',
      temperature: temperatureCelsius,
      notes: `Coil ID: ${innerDiameterMm} mm, ΔP: ${calc.pressureDropBar} bar (${calc.flowRegime})`
    });

    showFeedback(`Updated "${targetName}": Vol = ${calc.internalVolumeMl} mL, L = ${lengthMeters} m, ΔP = ${calc.pressureDropBar} bar`, 'success');
  };

  // Add a brand-new Sized Coil Reactor directly to canvas
  const handleAddSizedCoilToCanvas = () => {
    const newNodeId = `coil_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'reactor',
      position: { 
        x: 350 + Math.floor(Math.random() * 80), 
        y: 200 + Math.floor(Math.random() * 80) 
      },
      data: {
        label: `Coil Reactor (${calc.internalVolumeMl} mL)`,
        subType: 'Coil',
        volume: calc.internalVolumeMl,
        volumeUnit: 'mL',
        length: lengthMeters,
        lengthUnit: 'm',
        temperature: temperatureCelsius,
        notes: `ID: ${innerDiameterMm} mm | ΔP: ${calc.pressureDropBar} bar (${calc.flowRegime})`
      }
    };

    addNodeToCanvas(newNode);
    showFeedback(`Added new Sized Coil Reactor (${calc.internalVolumeMl} mL, ${lengthMeters} m) to diagram!`, 'success');
  };

  const tempPresets = [
    { label: 'Cryo (-78°C)', temp: -78 },
    { label: 'Sub-zero (-20°C)', temp: -20 },
    { label: 'Ice (0°C)', temp: 0 },
    { label: 'Ambient (20°C)', temp: 20 },
    { label: 'Warm (60°C)', temp: 60 },
    { label: 'Boiling (100°C)', temp: 100 },
    { label: 'Superheated (150°C)', temp: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800/80 dark:to-cyan-950/40 p-5 rounded-xl border border-cyan-100 dark:border-cyan-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="text-cyan-600 dark:text-cyan-400" />
              Capillary Pressure Drop &amp; Reynolds Flow Regime
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Hagen-Poiseuille microfluidic hydraulics model for tubular coil reactors and capillary lines.
              Features temperature-dependent viscosity correction (μ(T) via Andrade equation) and two-way canvas synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-mono">
            <span className="text-slate-500">Hagen-Poiseuille:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">ΔP ∝ L·μ(T)·Q / D⁴</span>
          </div>
        </div>
      </div>

      {/* Notification / Feedback Toast */}
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
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-cyan-50/70 dark:from-slate-800/90 dark:via-indigo-950/30 dark:to-cyan-950/40 p-4 rounded-xl border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Canvas Reactor Synchronization</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-semibold">
                  {activeReactorNodes.length} Reactor{activeReactorNodes.length === 1 ? '' : 's'} on Canvas
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Seamlessly read dimensions from canvas or write computed volume and hydraulic limits directly to modules.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeReactorNodes.length > 0 && (
              <select
                value={selectedTargetNodeId || activeReactorNodes[0]?.id}
                onChange={(e) => setSelectedTargetNodeId(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeReactorNodes.map((n: any) => (
                  <option key={n.id} value={n.id}>
                    {n.data?.label || n.data?.name || `Reactor (${n.id.slice(0, 6)})`} ({n.data?.volume || 0} {n.data?.volumeUnit || 'mL'})
                  </option>
                ))}
              </select>
            )}

            {/* Import Button */}
            <button
              onClick={() => handleImportFromCanvas()}
              disabled={activeReactorNodes.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Import length, temperature, and flow rate from active canvas reactor"
            >
              <Upload size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Import from Diagram</span>
            </button>

            {/* Apply Button */}
            <button
              onClick={handleApplyToNode}
              disabled={activeReactorNodes.length === 0}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Apply calculated volume, length, and backpressure limit to selected canvas node"
            >
              <ArrowRight size={13} />
              <span>Apply to Node</span>
            </button>

            {/* Add New Sized Coil to Canvas */}
            <button
              onClick={handleAddSizedCoilToCanvas}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Add a new pre-sized coil reactor node to the diagram"
            >
              <PlusCircle size={13} />
              <span>Add Coil to Canvas</span>
            </button>
          </div>
        </div>
      </div>

      {/* PEEK Tubing Presets Quick Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Standard PEEK Tubing Color Code Presets:</span>
          <span className="text-[11px] font-mono">1/16" Outer Diameter (OD)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PEEK_TUBING_PRESETS.map((preset) => {
            const isSelected = Math.abs(innerDiameterMm - preset.idMm) < 0.005;
            return (
              <button
                key={preset.name}
                onClick={() => handleApplyPresetTubing(preset.idMm)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: preset.colorHex }}
                  ></span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {preset.name.split(' ')[0]}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {preset.idMm} mm ({preset.idInches})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Parameters Input & Hydraulic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Geometry &amp; Fluid Parameters</span>
            <span className="font-mono text-[10px] lowercase text-cyan-600 dark:text-cyan-400">lab-grade model</span>
          </h3>

          {/* Inner Diameter */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Inner Diameter (ID):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{innerDiameterMm} mm</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="5.0"
                value={innerDiameterMm}
                onChange={(e) => setInnerDiameterMm(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs font-mono text-slate-400">mm</span>
            </div>
          </div>

          {/* Tubing Length */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Coil Length (L):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{lengthMeters} m</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="100.0"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs font-mono text-slate-400">meters</span>
            </div>
          </div>

          {/* Flow Rate */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Total Volumetric Flow Rate (Q):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{flowRateMlMin} mL/min</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.01"
                max="50.0"
                value={flowRateMlMin}
                onChange={(e) => setFlowRateMlMin(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs font-mono text-slate-400">mL/min</span>
            </div>
          </div>

          {/* TEMPERATURE CORRECTION SECTION (Andrade / Arrhenius Model) */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-slate-800/80 dark:to-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Thermometer size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Reaction Temperature:</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                {temperatureCelsius} °C ({temperatureCelsius + 273.15} K)
              </span>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-78"
                max="200"
                step="1"
                value={temperatureCelsius}
                onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value))}
                className="w-full h-2 bg-amber-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="w-20 shrink-0">
                <input
                  type="number"
                  min="-100"
                  max="300"
                  step="1"
                  value={temperatureCelsius}
                  onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value) || 20)}
                  className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-2 py-1 text-xs font-bold text-right text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Quick Temp Preset Pills */}
            <div className="flex flex-wrap gap-1">
              {tempPresets.map((tp) => (
                <button
                  key={tp.label}
                  onClick={() => setTemperatureCelsius(tp.temp)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium transition-all cursor-pointer ${
                    temperatureCelsius === tp.temp
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-900/40'
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>

            {/* Dynamic Viscosity Output Callout */}
            <div className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Viscosity at {temperatureCelsius}°C (Andrade μ(T)):
                </span>
                <span className="font-mono font-extrabold text-amber-700 dark:text-amber-300 text-sm">
                  {tempViscosity.viscosityCp} cP
                </span>
              </div>
              <div className="text-right">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  tempViscosity.percentChange < 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : tempViscosity.percentChange > 0
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {tempViscosity.percentChange > 0 ? `+${tempViscosity.percentChange}%` : `${tempViscosity.percentChange}%`} vs 20°C
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Nominal: {nominalViscosityCp} cP
                </span>
              </div>
            </div>
          </div>

          {/* Nominal Viscosity at 20°C */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Nominal Solvent Viscosity (at 20°C):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{nominalViscosityCp} cP</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="20.0"
                value={nominalViscosityCp}
                onChange={(e) => setNominalViscosityCp(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs font-mono text-slate-400">cP (mPa·s)</span>
            </div>
          </div>

          {/* Quick Solvent presets */}
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
              Auto-fill Properties from Common Solvents:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['water', 'acetonitrile', 'methanol', 'ethanol', 'isopropanol', 'dcm', 'dmso'].map((sId) => {
                const s = getSolvent(sId);
                return (
                  <button
                    key={sId}
                    onClick={() => handleApplySolventProperties(sId)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                  >
                    {s.formula} ({s.viscosity} cP)
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Hydraulic Outputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pressure Drop Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className={`absolute top-0 right-0 w-2 h-full ${
                calc.pressureSeverity === 'critical' ? 'bg-rose-500' : calc.pressureSeverity === 'caution' ? 'bg-amber-500' : 'bg-cyan-500'
              }`}></div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Capillary Pressure Drop (ΔP)</span>
                  <Gauge size={16} className={calc.pressureSeverity === 'critical' ? 'text-rose-500' : 'text-cyan-500'} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold ${
                    calc.pressureSeverity === 'critical'
                      ? 'text-rose-600 dark:text-rose-400'
                      : calc.pressureSeverity === 'caution'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-cyan-600 dark:text-cyan-400'
                  }`}>
                    {calc.pressureDropBar} bar
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({calc.pressureDropPsi} psi)
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                {calc.pressureSeverity === 'safe' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck size={14} /> Safe for standard finger-tight PEEK fittings (&lt;25 bar).
                  </span>
                )}
                {calc.pressureSeverity === 'caution' && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <AlertTriangle size={14} /> High pressure: Use wrenches on PEEK or stainless steel fittings.
                  </span>
                )}
                {calc.pressureSeverity === 'critical' && (
                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle size={14} /> Severe backpressure! Risk of tube burst or pump overpressure trip.
                  </span>
                )}
              </div>
            </div>

            {/* Reynolds Number Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Reynolds Number (Re)</span>
                  <Wind size={16} className="text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                    {calc.reynoldsNumber}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                    calc.flowRegime === 'laminar'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : calc.flowRegime === 'transitional'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {calc.flowRegime} flow
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                {calc.reynoldsNumber < 2100 ? (
                  <span>Re &lt; 2100: Parabolic laminar velocity profile (Taylor dispersion).</span>
                ) : (
                  <span>Re &gt; 2100: Secondary Dean vortices or turbulent eddies enhance radial mixing.</span>
                )}
              </div>
            </div>
          </div>

          {/* Reactor Dimensions & Residence Time Grid */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Coil Residence &amp; Hydrodynamic Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Coil Internal Volume</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-base">
                  {calc.internalVolumeMl} mL
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">V<sub>tube</sub></span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Residence Time</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-base">
                  {calc.residenceTimeSeconds >= 60
                    ? `${(calc.residenceTimeSeconds / 60).toFixed(2)} min`
                    : `${calc.residenceTimeSeconds} s`}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">τ = V / Q</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Linear Velocity</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-base">
                  {calc.linearVelocityMps} m/s
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">v = Q / A</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Wall Shear Rate</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-base">
                  {calc.shearRateSecInv} s⁻¹
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">8v / D</span>
              </div>
            </div>

            {/* Fitting Recommendation Banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <Sliders size={16} className="text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Hardware Fitting Guideline: </span>
                {calc.fittingRecommendation}
              </div>
            </div>

            {/* D^4 Sensitivity Note */}
            <div className="p-3 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-lg border border-cyan-100 dark:border-cyan-900/40 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
              <Zap size={16} className="text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">The 4th Power Law (D⁴):</span> Because capillary pressure drop scales inversely with the 4th power of diameter, cutting the tube diameter in half (e.g., from 0.5 mm to 0.25 mm) multiplies pressure drop by <strong>16×</strong>!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

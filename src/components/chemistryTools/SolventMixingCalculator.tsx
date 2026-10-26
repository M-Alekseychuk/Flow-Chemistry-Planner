import React, { useState, useMemo } from 'react';
import { SOLVENTS, calculateSolventMixture, getSolvent } from '../../lib/chemistryToolsData';
import { Droplet, ArrowRight, Info, Sparkles, Scale, Gauge, Percent } from 'lucide-react';

export default function SolventMixingCalculator() {
  const [solventAId, setSolventAId] = useState('water');
  const [solventBId, setSolventBId] = useState('ethanol');
  const [inputMode, setInputMode] = useState<'volume' | 'mass'>('volume');
  const [valA, setValA] = useState<number>(50);
  const [valB, setValB] = useState<number>(50);

  const result = useMemo(() => {
    return calculateSolventMixture(solventAId, solventBId, inputMode, valA, valB);
  }, [solventAId, solventBId, inputMode, valA, valB]);

  const handleSwapSolvents = () => {
    setSolventAId(solventBId);
    setSolventBId(solventAId);
    const tempVal = valA;
    setValA(valB);
    setValB(tempVal);
  };

  const applyPresetRatio = (ratioA: number, ratioB: number) => {
    if (inputMode === 'volume') {
      setValA(ratioA * 10);
      setValB(ratioB * 10);
    } else {
      setValA(ratioA * 10);
      setValB(ratioB * 10);
    }
  };

  // Find min contraction for scaling graph
  const minShrinkage = Math.min(...result.curvePoints.map(p => p.shrinkagePercent), -0.5);
  const maxShrinkage = Math.max(...result.curvePoints.map(p => p.shrinkagePercent), 0.2);

  return (
    <div className="space-y-6">
      {/* Top Banner & Description */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/40 p-5 rounded-xl border border-blue-100 dark:border-indigo-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Droplet className="text-blue-600 dark:text-blue-400" />
              Solvent Mixing Contraction & Density Calculator
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Non-ideal fluid thermodynamics engine calculating volume shrinkage, excess molar volume (V<sup>E</sup>), 
              and precise mixed density caused by intermolecular hydrogen bonding and packing efficiency.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setInputMode('volume')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'volume'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Droplet size={14} />
              Volume Ratio (mL)
            </button>
            <button
              onClick={() => setInputMode('mass')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'mass'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Scale size={14} />
              Mass Ratio (g)
            </button>
          </div>
        </div>
      </div>

      {/* Solvent Selection & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Solvent A Card */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              Solvent A
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{result.solventA.formula}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Select Solvent</label>
            <select
              value={solventAId}
              onChange={(e) => setSolventAId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SOLVENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (ρ = {s.density} g/mL, bp = {s.boilingPoint}°C)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {inputMode === 'volume' ? 'Volume A (mL)' : 'Mass A (g)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={valA}
                  onChange={(e) => setValA(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-base font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {inputMode === 'volume' ? 'mL' : 'g'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center text-xs space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Density:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{result.solventA.density} g/mL</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Molar Mass:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{result.solventA.molarMass} g/mol</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Boiling Pt:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{result.solventA.boilingPoint}°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Swap / Center divider */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <button
            onClick={handleSwapSolvents}
            title="Swap Solvents"
            className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full shadow-xs text-slate-600 dark:text-slate-300 transition-all hover:scale-105 cursor-pointer"
          >
            <ArrowRight size={18} className="transform md:rotate-0 rotate-90" />
          </button>
        </div>

        {/* Solvent B Card */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Solvent B
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{result.solventB.formula}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Select Solvent</label>
            <select
              value={solventBId}
              onChange={(e) => setSolventBId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SOLVENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (ρ = {s.density} g/mL, bp = {s.boilingPoint}°C)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {inputMode === 'volume' ? 'Volume B (mL)' : 'Mass B (g)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={valB}
                  onChange={(e) => setValB(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-base font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {inputMode === 'volume' ? 'mL' : 'g'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center text-xs space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Density:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{result.solventB.density} g/mL</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Molar Mass:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{result.solventB.molarMass} g/mol</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Boiling Pt:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{result.solventB.boilingPoint}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Ratio Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Quick Ratio Presets:</span>
        {[
          { label: '50 : 50', a: 5, b: 5 },
          { label: '70 : 30', a: 7, b: 3 },
          { label: '80 : 20', a: 8, b: 2 },
          { label: '90 : 10', a: 9, b: 1 },
          { label: '95 : 5', a: 9.5, b: 0.5 },
          { label: '1 : 1 (100 mL ea)', a: 10, b: 10 },
        ].map(p => (
          <button
            key={p.label}
            onClick={() => applyPresetRatio(p.a, p.b)}
            className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Calculation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contraction % */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span>Volume Shrinkage</span>
            <Percent size={14} className="text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${result.shrinkagePercent < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {result.shrinkagePercent.toFixed(2)}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({result.volumeChange > 0 ? '+' : ''}{result.volumeChange.toFixed(2)} mL)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {result.shrinkagePercent < -0.1
              ? 'Negative excess volume due to strong intermolecular packing.'
              : 'Near-ideal non-interacting mixture.'}
          </p>
        </div>

        {/* Final Mixture Density */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span>Final Mixture Density</span>
            <Gauge size={14} className="text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {result.finalDensity.toFixed(4)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">g/mL</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Ideal density: <span className="font-mono">{result.idealDensity.toFixed(4)}</span> ({result.densityDifferencePercent > 0 ? '+' : ''}{result.densityDifferencePercent.toFixed(2)}%)
          </p>
        </div>

        {/* Total Volumes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span>Actual Mixed Volume</span>
            <Droplet size={14} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              {result.actualMixedVolume.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">mL</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Unmixed sum: <span className="font-mono">{result.unmixedVolume.toFixed(2)} mL</span>
          </p>
        </div>

        {/* Mass / Mole Fractions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span>Composition Fractions</span>
            <Sparkles size={14} className="text-purple-500" />
          </div>
          <div className="space-y-1.5 mt-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Mole Fraction (x<sub>A</sub> / x<sub>B</sub>):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {result.moleFractionA.toFixed(3)} / {result.moleFractionB.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Mass (wt% A / B):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {result.massFractionA.toFixed(1)}% / {result.massFractionB.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Vol (v% A / B):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {result.volFractionA.toFixed(1)}% / {result.volFractionB.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Composition Visualizer & Full Binary Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Bar Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Visual Phase & Volume Distribution</span>
          </h3>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-blue-600 dark:text-blue-400">
                {result.solventA.name}: {result.volFractionA.toFixed(1)}% ({result.volumeA.toFixed(1)} mL)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {result.solventB.name}: {result.volFractionB.toFixed(1)}% ({result.volumeB.toFixed(1)} mL)
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${result.volFractionA}%` }}
                className="h-full bg-blue-500 transition-all duration-300"
              ></div>
              <div
                style={{ width: `${result.volFractionB}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              ></div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Unmixed Sum of Volumes:</span>
              <span className="font-mono font-semibold">{result.unmixedVolume.toFixed(2)} mL</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Total Mass:</span>
              <span className="font-mono font-semibold">{(result.massA + result.massB).toFixed(2)} g</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Net Volume Contraction:</span>
              <span className={`font-mono font-bold ${result.volumeChange < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {result.volumeChange.toFixed(3)} mL ({result.shrinkagePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Actual Delivered Volume:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{result.actualMixedVolume.toFixed(2)} mL</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Flow Reactor Practical Note:</span> When pumping binary feed streams into a T-mixer (e.g. Water at 1.0 mL/min + Ethanol at 1.0 mL/min), total flow downstream is not 2.0 mL/min, but ~1.92 mL/min due to volume contraction. Residence time in reactor coils will be ~4% longer than naive volumetric estimates!
            </div>
          </div>
        </div>

        {/* Binary Contraction Profile Graph */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Contraction Curve Across 0–100% {result.solventA.name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Excess Volume Profile</span>
          </div>

          {/* SVG Chart */}
          <div className="relative h-48 w-full bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
              {/* Zero line */}
              {(() => {
                const zeroY = 120 * ((0 - maxShrinkage) / (minShrinkage - maxShrinkage));
                return (
                  <line
                    x1="0"
                    y1={zeroY}
                    x2="300"
                    y2={zeroY}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    className="text-slate-300 dark:text-slate-600"
                  />
                );
              })()}

              {/* Curve path */}
              {(() => {
                const points = result.curvePoints.map((pt, i) => {
                  const x = (i / (result.curvePoints.length - 1)) * 300;
                  const range = minShrinkage - maxShrinkage;
                  const y = range !== 0 ? 120 * ((pt.shrinkagePercent - maxShrinkage) / range) : 60;
                  return `${x},${y}`;
                });
                const d = `M ${points.join(' L ')}`;
                return (
                  <path
                    d={d}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}

              {/* Current operating point marker */}
              {(() => {
                const fractionA = result.volFractionA / 100;
                const x = fractionA * 300;
                const range = minShrinkage - maxShrinkage;
                const y = range !== 0 ? 120 * ((result.shrinkagePercent - maxShrinkage) / range) : 60;
                return (
                  <g>
                    <circle cx={x} cy={y} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  </g>
                );
              })()}
            </svg>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>0% {result.solventA.formula}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                Operating Point: {result.shrinkagePercent.toFixed(2)}%
              </span>
              <span>100% {result.solventA.formula}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Maximum Contraction</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {minShrinkage.toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Mixture Dielectric (approx)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {((result.volFractionA * result.solventA.dielectricConstant + result.volFractionB * result.solventB.dielectricConstant) / 100).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

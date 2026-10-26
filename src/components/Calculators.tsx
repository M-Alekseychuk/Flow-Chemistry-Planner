import React, { useState, useEffect } from 'react';
import { CalculatorType } from '../types';
import { Calculator, Beaker, Timer, MoveDiagonal, Droplets, ChevronDown, ChevronUp, ChevronRight, Ruler, Trash2, FlaskConical } from 'lucide-react';
import { useAppContext } from '../AppContext';

const Card = ({ title, icon: Icon, children, isOpen, onToggle }: any) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-emerald-100 dark:border-slate-700 overflow-hidden mb-4 transition-colors">
    <button 
      onClick={onToggle}
      className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-medium">
        <Icon size={18} className="text-emerald-600 dark:text-emerald-400" />
        {title}
      </div>
      {isOpen ? <ChevronUp size={16} className="text-emerald-600 dark:text-emerald-400" /> : <ChevronDown size={16} className="text-emerald-600 dark:text-emerald-400" />}
    </button>
    {isOpen && <div className="p-4 bg-white dark:bg-slate-800/90 border-t border-emerald-50 dark:border-slate-700/60">{children}</div>}
  </div>
);

const Input = ({ label, value, onChange, unit, step = "any" }: any) => {
  const [localVal, setLocalVal] = useState(value?.toString() || '');
  
  useEffect(() => {
    if (parseFloat(localVal) !== value && localVal !== value?.toString()) {
      setLocalVal(value?.toString() || '');
    }
  }, [value]);

  const handleChange = (e: any) => {
    const sanitized = e.target.value.replace(/,/g, '.');
    setLocalVal(sanitized);
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (sanitized === '') {
      onChange(0);
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-3">
      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          inputMode="decimal"
          step={step}
          value={localVal} 
          onChange={handleChange}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-3 pr-12 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
      </div>
    </div>
  );
};

const UnitInput = ({ label, value, onChange, unit, onUnitChange, unitOptions = [] }: any) => {
  const [localVal, setLocalVal] = useState(value?.toString() || '');
  
  useEffect(() => {
    if (localVal !== value?.toString()) {
      setLocalVal(value?.toString() || '');
    }
  }, [value]);

  const handleChange = (e: any) => {
    const sanitized = e.target.value.replace(/,/g, '.');
    setLocalVal(sanitized);
    onChange(sanitized);
  };

  return (
    <div className="flex flex-col gap-1 mb-3">
      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</label>
      <div className="relative flex">
        <input 
          type="text" 
          inputMode="decimal"
          value={localVal} 
          onChange={handleChange}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-l-md py-1.5 pl-3 pr-2 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-md px-2 text-xs text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 min-w-[3rem]"
        >
          {unitOptions.map((opt: string) => (
             <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const parseFractionalInches = (input: string): number => {
  if (!input) return 0;
  const str = input.trim().replace(/,/g, '.');
  
  // Handle space or hyphen separated mixed fraction e.g. "1 1/16" or "1-1/16"
  const mixedParts = str.split(/[\s-]+/);
  if (mixedParts.length === 2 && mixedParts[1].includes('/')) {
    const whole = parseFloat(mixedParts[0]) || 0;
    const fracParts = mixedParts[1].split('/');
    if (fracParts.length === 2) {
      const num = parseFloat(fracParts[0]) || 0;
      const den = parseFloat(fracParts[1]) || 1;
      return whole + (den !== 0 ? num / den : 0);
    }
  }

  // Handle single fraction e.g. "1/16" or "3/8"
  if (str.includes('/')) {
    const fracParts = str.split('/');
    if (fracParts.length === 2) {
      const num = parseFloat(fracParts[0]) || 0;
      const den = parseFloat(fracParts[1]) || 1;
      return den !== 0 ? num / den : 0;
    }
  }

  // Regular number e.g. "0.0625"
  return parseFloat(str) || 0;
};

export const decimalToFractionalInches = (inches: number, maxDenom = 64): string => {
  if (isNaN(inches) || inches === 0) return '0"';
  const sign = inches < 0 ? '-' : '';
  const absInches = Math.abs(inches);
  const whole = Math.floor(absInches);
  const remainder = absInches - whole;

  if (remainder < 0.0001) {
    return `${sign}${whole}"`;
  }

  let num = Math.round(remainder * maxDenom);
  let den = maxDenom;

  if (num === maxDenom) {
    return `${sign}${whole + 1}"`;
  }

  if (num === 0) {
    return `${sign}${whole}"`;
  }

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const common = gcd(num, den);
  num /= common;
  den /= common;

  const fracStr = `${num}/${den}`;
  return whole > 0 ? `${sign}${whole} ${fracStr}"` : `${sign}${fracStr}"`;
};

export const parseIDToMm = (val: string | number, unit: string) => {
  if (typeof val === 'number') return unit === '"' ? val * 25.4 : val;
  const d = parseFractionalInches(val);
  return unit === '"' ? d * 25.4 : d;
};

export const parseLengthToM = (val: number, unit: string) => unit === 'cm' ? val / 100 : val;
export const parseLengthToCm = (val: number, unit: string) => unit === 'm' ? val * 100 : val;
export const parseTimeToMin = (val: number, unit: string) => unit === 's' ? val / 60 : val;

// Helper for volume calculations in mL
export const getVolumeMl = (id: string | number, idUnit: string, length: number, lUnit: string) => {
  return Math.PI * Math.pow(parseIDToMm(id, idUnit) / 2, 2) * parseLengthToM(length, lUnit);
};

export const formatTime = (minutes: number) => {
  if (minutes <= 0) return '0 s';
  let mins = Math.floor(minutes);
  let secs = Math.round((minutes - mins) * 60);
  if (secs === 60) {
    mins += 1;
    secs = 0;
  }
  if (mins === 0) return `${secs} s`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} s`;
};

const ResultBox = ({ label, value, unit, dragData }: any) => (
  <div 
    className="bg-orange-50 dark:bg-orange-950/60 rounded-md p-3 mt-4 border border-orange-200 dark:border-orange-800/60 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors shadow-sm"
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('application/reactflow', 'calcResult');
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'move';
    }}
    title="Drag to canvas"
  >
    <span className="text-sm text-orange-900 dark:text-orange-200 font-medium">{label}</span>
    <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{value} <span className="text-sm font-medium">{unit}</span></span>
  </div>
);

const UnitConverter = () => {
  const [inchInput, setInchInput] = useState<string>('1/16');
  const [mmInput, setMmInput] = useState<string>('1.588');
  const [activeTab, setActiveTab] = useState<'inchToMm' | 'mmToInch'>('inchToMm');

  const decimalInches = parseFractionalInches(inchInput);
  const calculatedMm = decimalInches * 25.4;

  const parsedMm = parseFloat(mmInput) || 0;
  const mmToInchesDecimal = parsedMm / 25.4;
  const mmToFraction = decimalToFractionalInches(mmToInchesDecimal);

  const presetFractions = [
    '1/32', '1/16', '3/32', '1/8', 
    '3/16', '1/4', '5/16', '3/8', 
    '1/2', '5/8', '3/4', '1'
  ];

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-md text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('inchToMm')}
          className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'inchToMm'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Inches → mm
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mmToInch')}
          className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'mmToInch'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          mm → Inches
        </button>
      </div>

      {activeTab === 'inchToMm' ? (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Fractional or Decimal Inches
            </label>
            <div className="relative">
              <input
                type="text"
                value={inchInput}
                onChange={(e) => setInchInput(e.target.value)}
                placeholder='e.g., 1/16, 1 1/8, or 0.0625'
                className="w-full border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-3 pr-8 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">"</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider block mb-1">
              Quick Presets
            </span>
            <div className="grid grid-cols-4 gap-1">
              {presetFractions.map((frac) => (
                <button
                  key={frac}
                  type="button"
                  onClick={() => setInchInput(frac)}
                  className={`py-1 text-xs rounded border transition-colors cursor-pointer ${
                    inchInput === frac
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {frac}"
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-md border border-emerald-100 dark:border-emerald-800/60 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Decimal Inches:</span>
              <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">{decimalInches.toFixed(4)}"</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-200/50 dark:border-emerald-800/40 pt-1.5 mt-1">
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Millimeters:</span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{calculatedMm.toFixed(3)} <span className="text-xs font-normal">mm</span></span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Millimeters (mm)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={mmInput}
                onChange={(e) => setMmInput(e.target.value)}
                placeholder="e.g. 1.588"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-3 pr-10 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">mm</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-md border border-emerald-100 dark:border-emerald-800/60 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Decimal Inches:</span>
              <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">{mmToInchesDecimal.toFixed(4)}"</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-200/50 dark:border-emerald-800/40 pt-1.5 mt-1">
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Fractional Inch:</span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{mmToFraction}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export function CalculatorsContent() {
  const [openCalc, setOpenCalc] = useState<CalculatorType | null>('stoichiometry');

  // States for Volume Calc
  const [volID, setVolID] = useState<string | number>('1/16');
  const [volIDUnit, setVolIDUnit] = useState('"');
  const [volL, setVolL] = useState(1.0);
  const [volLUnit, setVolLUnit] = useState('m');

  // States for Residence Time
  const [resID, setResID] = useState<string | number>('1/16');
  const [resIDUnit, setResIDUnit] = useState('"');
  const [resL, setResL] = useState(1.0);
  const [resLUnit, setResLUnit] = useState('m');
  const [resQ, setResQ] = useState(1.0);

  // States for Tubing Length
  const [lenID, setLenID] = useState<string | number>('1/16');
  const [lenIDUnit, setLenIDUnit] = useState('"');
  const [lenT, setLenT] = useState(10);
  const [lenTUnit, setLenTUnit] = useState('min');
  const [lenQ, setLenQ] = useState(1.0);

  // States for Flow Rate
  const [flowID, setFlowID] = useState<string | number>('1/16');
  const [flowIDUnit, setFlowIDUnit] = useState('"');
  const [flowL, setFlowL] = useState(1.0);
  const [flowLUnit, setFlowLUnit] = useState('m');
  const [flowT, setFlowT] = useState(10);
  const [flowTUnit, setFlowTUnit] = useState('min');

  // States for Space Time Yield
  const [styVol, setStyVol] = useState(10.0);
  const [styQ, setStyQ] = useState(1.0);
  const [styConc, setStyConc] = useState(1.0); // Molarity
  const [styMW, setStyMW] = useState(100.0); // g/mol
  const [styYield, setStyYield] = useState(100.0); // %

  const { stoiRows, setStoiRows, setIsChemistryToolsModalOpen } = useAppContext();

  const handleDeleteReagent = (idToRemove: any) => {
    const updatedRows = stoiRows.filter((r: any) => String(r.id) !== String(idToRemove));
    const wasLimiting = stoiRows.find((r: any) => String(r.id) === String(idToRemove))?.isLimiting;
    if (wasLimiting && updatedRows.length > 0 && !updatedRows.some((r: any) => r.isLimiting)) {
      updatedRows[0] = { ...updatedRows[0], isLimiting: true };
    }
    setStoiRows(updatedRows);
  };

  const handleAddReagent = () => {
    const nextNum = stoiRows.length + 1;
    const isFirst = stoiRows.length === 0;
    setStoiRows([
      ...stoiRows,
      {
        id: Date.now(),
        name: `Reagent ${nextNum}`,
        conc: 1.0,
        flow: 1.0,
        solvent: '',
        isLimiting: isFirst,
      },
    ]);
  };

  const toggle = (calc: CalculatorType) => {
    setOpenCalc(openCalc === calc ? null : calc);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pt-2">
      {/* Chemistry Engineering Tools Banner */}
      <button
        onClick={() => setIsChemistryToolsModalOpen?.(true)}
        className="w-full mb-3 p-3 rounded-lg bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-teal-600/10 dark:from-cyan-950/40 dark:via-blue-950/40 dark:to-teal-950/40 border border-cyan-200 dark:border-cyan-800/60 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-xs"
        title="Open Chemistry Tools Hub (Capillary ΔP, Superheating & BPR Sizing, Miscibility Matrix)"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <FlaskConical size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Chemistry Tools Hub</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-600 text-white font-mono uppercase">
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              BPR sizing, capillary ΔP &amp; miscibility
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
      </button>

      {/* Feed Solutions (Reagents) */}
      <Card title="Feed Solutions (Reagents)" icon={Calculator} isOpen={openCalc === 'stoichiometry'} onToggle={() => toggle('stoichiometry')}>
        <div className="space-y-4">
          {stoiRows.length === 0 && (
            <div className="py-4 px-3 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-400 dark:text-slate-500">
              No feed solutions configured. Click &quot;+ Add Reagent&quot; below to add one.
            </div>
          )}
          {stoiRows.map((row: any, idx: number) => (
            <div key={row.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md relative group">
              <div className="flex justify-between items-center mb-2">
                <div 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'reagent');
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      rowId: row.id,
                      name: row.name,
                      molarity: row.conc,
                      solvent: row.solvent || '',
                    }));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="cursor-grab font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-xs hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 flex items-center"
                  title="Drag to canvas"
                >
                  <MoveDiagonal size={12} className="inline mr-1" />
                  {row.name || `Reagent ${idx + 1}`}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs flex items-center gap-1 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
                    <input 
                      type="radio" 
                      name="limiting-reagent"
                      checked={row.isLimiting} 
                      onChange={() => {
                        setStoiRows(stoiRows.map((r: any) => ({ ...r, isLimiting: String(r.id) === String(row.id) })))
                      }} 
                    />
                    Limiting
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteReagent(row.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    title={`Delete ${row.name || `Reagent ${idx + 1}`}`}
                    aria-label={`Delete ${row.name || `Reagent ${idx + 1}`}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              
              <div className="mb-2 grid grid-cols-3 gap-2">
                 <div className="col-span-2">
                   <input 
                     value={row.name || ''} 
                     onChange={e => {
                        const newRows = [...stoiRows];
                        newRows[idx].name = e.target.value;
                        setStoiRows(newRows);
                     }} 
                     placeholder={`Reagent ${idx + 1} Name`}
                     className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded px-2 py-1 outline-none focus:border-emerald-400 font-medium" 
                   />
                 </div>
                 <div>
                   <input 
                     value={row.solvent || ''} 
                     onChange={e => {
                        const newRows = [...stoiRows];
                        newRows[idx].solvent = e.target.value;
                        setStoiRows(newRows);
                     }} 
                     placeholder="Solvent"
                     className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded px-2 py-1 outline-none focus:border-emerald-400" 
                   />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input label="Conc." value={row.conc} step="0.1" onChange={(v: number) => {
                  const newRows = [...stoiRows];
                  newRows[idx].conc = v;
                  setStoiRows(newRows);
                }} unit="M" />
                <Input label="Flow" value={row.flow} step="0.1" onChange={(v: number) => {
                  const newRows = [...stoiRows];
                  newRows[idx].flow = v;
                  setStoiRows(newRows);
                }} unit="mL/min" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex justify-between items-center">
                <span>Rate: {(row.conc * row.flow).toFixed(2)} mmol/min</span>
                {(() => {
                  const limitingRow = stoiRows.find((r: any) => r.isLimiting) || stoiRows[0];
                  const limitingRate = limitingRow ? limitingRow.conc * limitingRow.flow : 0;
                  const equiv = limitingRate > 0 ? (row.conc * row.flow) / limitingRate : 0;
                  
                  if (row.isLimiting) {
                    return <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">1.00 eq.</span>;
                  }

                  return (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        step="0.1"
                        value={row.equivInput !== undefined ? row.equivInput : equiv.toFixed(2)}
                        onChange={(e) => {
                           const newRows = [...stoiRows];
                           newRows[idx].equivInput = e.target.value;
                           const eqVal = parseFloat(e.target.value);
                           if (!isNaN(eqVal) && limitingRate > 0 && row.conc > 0) {
                              newRows[idx].flow = (eqVal * limitingRate) / row.conc;
                           }
                           setStoiRows(newRows);
                        }}
                        onBlur={() => {
                           const newRows = [...stoiRows];
                           newRows[idx].equivInput = undefined;
                           setStoiRows(newRows);
                        }}
                        className="border border-emerald-300 dark:border-emerald-800 rounded px-1 py-0.5 w-14 text-right text-emerald-700 dark:text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">eq.</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
          <button 
            onClick={handleAddReagent}
            className="w-full py-1.5 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer font-medium"
          >
            + Add Reagent
          </button>
          
          <div 
            className="w-full py-2 text-xs text-center font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 rounded cursor-grab hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition-colors shadow-sm mt-4"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', 'stoiResult');
              e.dataTransfer.effectAllowed = 'move';
            }}
            title="Drag to canvas"
          >
            Drag Stoichiometry Result to Canvas
          </div>
        </div>
      </Card>

      {/* Volume Calculator */}
      <Card title="Reactor Volume" icon={Beaker} isOpen={openCalc === 'volume'} onToggle={() => toggle('volume')}>
        <UnitInput label="Inner Diameter (ID)" value={volID} onChange={setVolID} unit={volIDUnit} onUnitChange={setVolIDUnit} unitOptions={['mm', '"']} />
        <UnitInput label="Tubing Length" value={volL} onChange={setVolL} unit={volLUnit} onUnitChange={setVolLUnit} unitOptions={['cm', 'm']} />
        <ResultBox 
          label="Volume" 
          value={getVolumeMl(volID, volIDUnit, volL, volLUnit).toFixed(3)} 
          unit="mL" 
          dragData={{ 
            calcType: 'volume', 
            idVal: volID, 
            idUnit: volIDUnit, 
            length: volL, 
            lengthUnit: volLUnit 
          }}
        />
      </Card>

      {/* Residence Time */}
      <Card title="Residence Time" icon={Timer} isOpen={openCalc === 'residenceTime'} onToggle={() => toggle('residenceTime')}>
        <UnitInput label="Inner Diameter (ID)" value={resID} onChange={setResID} unit={resIDUnit} onUnitChange={setResIDUnit} unitOptions={['mm', '"']} />
        <UnitInput label="Tubing Length" value={resL} onChange={setResL} unit={resLUnit} onUnitChange={setResLUnit} unitOptions={['cm', 'm']} />
        <Input label="Flow Rate (Q)" value={resQ} onChange={setResQ} unit="mL/min" />
        <ResultBox 
          label="Time" 
          value={resQ > 0 ? formatTime(getVolumeMl(resID, resIDUnit, resL, resLUnit) / resQ) : '0 s'} 
          unit="" 
          dragData={{ 
            calcType: 'residenceTime', 
            idVal: resID, 
            idUnit: resIDUnit, 
            length: resL, 
            lengthUnit: resLUnit, 
            flowRate: resQ 
          }}
        />
      </Card>

      {/* Tubing Length */}
      <Card title="Tubing Length" icon={MoveDiagonal} isOpen={openCalc === 'tubingLength'} onToggle={() => toggle('tubingLength')}>
        <UnitInput label="Inner Diameter (ID)" value={lenID} onChange={setLenID} unit={lenIDUnit} onUnitChange={setLenIDUnit} unitOptions={['mm', '"']} />
        <Input label="Flow Rate (Q)" value={lenQ} onChange={setLenQ} unit="mL/min" />
        <UnitInput label="Target Residence Time" value={lenT} onChange={setLenT} unit={lenTUnit} onUnitChange={setLenTUnit} unitOptions={['s', 'min']} />
        <ResultBox 
          label="Length" 
          value={parseIDToMm(lenID, lenIDUnit) > 0 ? ((lenQ * parseTimeToMin(lenT, lenTUnit)) / (Math.PI * Math.pow(parseIDToMm(lenID, lenIDUnit) / 2, 2))).toFixed(2) : '0.00'} 
          unit="m" 
          dragData={{ 
            calcType: 'tubingLength', 
            idVal: lenID, 
            idUnit: lenIDUnit, 
            flowRate: lenQ, 
            time: lenT, 
            timeUnit: lenTUnit 
          }}
        />
      </Card>

      {/* Flow Rate */}
      <Card title="Flow Rate" icon={Droplets} isOpen={openCalc === 'flowRate'} onToggle={() => toggle('flowRate')}>
        <UnitInput label="Inner Diameter (ID)" value={flowID} onChange={setFlowID} unit={flowIDUnit} onUnitChange={setFlowIDUnit} unitOptions={['mm', '"']} />
        <UnitInput label="Tubing Length" value={flowL} onChange={setFlowL} unit={flowLUnit} onUnitChange={setFlowLUnit} unitOptions={['cm', 'm']} />
        <UnitInput label="Target Residence Time" value={flowT} onChange={setFlowT} unit={flowTUnit} onUnitChange={setFlowTUnit} unitOptions={['s', 'min']} />
        <ResultBox 
          label="Flow Rate" 
          value={parseTimeToMin(flowT, flowTUnit) > 0 ? (getVolumeMl(flowID, flowIDUnit, flowL, flowLUnit) / parseTimeToMin(flowT, flowTUnit)).toFixed(3) : '0.00'} 
          unit="mL/min" 
          dragData={{ 
            calcType: 'flowRate', 
            idVal: flowID, 
            idUnit: flowIDUnit, 
            length: flowL, 
            lengthUnit: flowLUnit, 
            time: flowT, 
            timeUnit: flowTUnit 
          }}
        />
      </Card>

      {/* Space Time Yield */}
      <Card title="Space Time Yield (STY)" icon={Beaker} isOpen={openCalc === 'sty'} onToggle={() => toggle('sty')}>
        <Input label="Reactor Volume" value={styVol} onChange={setStyVol} unit="mL" />
        <Input label="Flow Rate" value={styQ} onChange={setStyQ} unit="mL/min" />
        <Input label="Product Concentration" value={styConc} onChange={setStyConc} unit="M (mol/L)" />
        <Input label="Product Molecular Weight" value={styMW} onChange={setStyMW} unit="g/mol" />
        <Input label="Yield" value={styYield} onChange={setStyYield} unit="%" />
        <ResultBox 
          label="STY" 
          value={styVol > 0 ? ((styQ * (styConc / 1000) * styMW * (styYield / 100) * 60) / (styVol / 1000)).toFixed(1) : '0.00'} 
          unit="g / (L·h)" 
          dragData={{ calcType: 'sty', volume: styVol, flowRate: styQ, conc: styConc, mw: styMW, yield: styYield }}
        />
      </Card>

      {/* Unit Converter */}
      <Card title="Unit Converter (Inches ↔ mm)" icon={Ruler} isOpen={openCalc === 'unitConverter'} onToggle={() => toggle('unitConverter')}>
        <UnitConverter />
      </Card>
    </div>
  );
}

export default function Calculators() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  if (!isSidebarOpen) {
    return (
      <div className="w-12 h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-2 flex flex-col items-center shadow-sm shrink-0 transition-colors">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Expand Calculators"
        >
          <Calculator size={20} />
        </button>
        <div className="mt-4" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
           <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Calculators</span>
         </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-80 shrink-0 shadow-sm relative transition-colors">
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Calculator size={20} className="text-emerald-600 dark:text-emerald-400"/>
          Calculators
        </h2>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Collapse Calculators"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <CalculatorsContent />
    </div>
  );
}

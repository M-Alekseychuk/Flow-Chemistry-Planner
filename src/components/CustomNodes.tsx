import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import {
  parseFractionalInches,
  decimalToFractionalInches,
  parseIDToMm,
  parseLengthToM,
  parseTimeToMin,
  formatTime,
} from './Calculators';
import { getFeedColorForNode } from '../lib/simulation';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) => {
  const { setEdges } = useReactFlow();
  const { flowRateUnit } = useAppContext();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onLengthChange = (e: any) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: { ...edge.data, length: e.target.value },
          };
        }
        return edge;
      })
    );
  };

  const onUnitChange = (e: any) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: { ...edge.data, unit: e.target.value },
          };
        }
        return edge;
      })
    );
  };

  // Helper to parse ID to mm
  const parseEdgeIDToMm = (val: string) => {
    if (!val) return 1.5875;
    const str = val.toString().trim();
    if (data?.diameterUnit === 'mm') return parseFloat(str) || 1.5875;
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (den) return (num / den) * 25.4;
      }
    }
    const parsed = parseFloat(str);
    return !isNaN(parsed) ? (data?.diameterUnit === 'mm' ? parsed : parsed * 25.4) : 1.5875;
  };

  const idMm = parseEdgeIDToMm(data?.innerDiameter || '1/16');
  const lengthVal = parseFloat(data?.length) || 0;
  const lengthInCm = data?.unit === 'm' ? lengthVal * 100 : lengthVal;
  const radiusInCm = (idMm / 10) / 2;
  const tubingVolMl = Math.PI * Math.pow(radiusInCm, 2) * lengthInCm;

  const flowRateMlMin = data?.simData?.flow || 0;
  const resTimeMin = flowRateMlMin > 0 ? tubingVolMl / flowRateMlMin : 0;

  const formatResTime = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0.0 s';
    const totalSecs = minutes * 60;
    if (totalSecs < 59.95) {
      return `${totalSecs.toFixed(1)} s`;
    }
    let mins = Math.floor(minutes);
    let secs = Math.round((minutes - mins) * 60);
    if (secs >= 60) {
      mins += 1;
      secs = 0;
    }
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs} s`;
  };

  const displayFlowRate = () => {
    if (flowRateUnit === 'L/h') {
      const flowLh = flowRateMlMin * 0.06;
      return `${flowLh.toFixed(2)} L/h`;
    }
    if (flowRateUnit === 'L/h') {
      const flowLh = flowRateMlMin * 0.06;
      return `${flowLh.toFixed(2)} L/h`;
    }
    return `${flowRateMlMin.toFixed(2)} mL/min`;
  };

  const isFlowing = flowRateMlMin > 0;
  const streamColor = data?.simData?.streamColor || data?.streamColor || (isFlowing ? '#1d4ed8' : '#64748b');
  const streamGlowColor = data?.simData?.streamGlowColor || data?.streamGlowColor || streamColor;
  const isMixed = Boolean(data?.simData?.isMixed || data?.isMixed);
  const streamName = data?.simData?.streamName || (isMixed ? 'Mixed Stream' : 'Stream');

  return (
    <>
      {/* Subtle ambient fluid glow when active */}
      {isFlowing && (
        <path
          d={edgePath}
          fill="none"
          stroke={streamGlowColor}
          strokeWidth={5}
          strokeOpacity={0.35}
          strokeLinecap="round"
          className="pointer-events-none transition-all duration-300"
          style={{ filter: 'blur(2px)' }}
        />
      )}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: streamColor,
          strokeWidth: isFlowing ? 1.8 : 1.4,
          strokeDasharray: isFlowing ? '6, 4' : '4, 4',
          strokeOpacity: isFlowing ? 1 : 0.8,
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] border border-slate-200/90 dark:border-slate-700/80 backdrop-blur-xs flex flex-col text-[8px] hover:border-slate-400 dark:hover:border-slate-500 transition-all overflow-hidden group/edge relative"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setEdges((edges) => edges.filter((e) => e.id !== id));
            }}
            className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950/90 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover/edge:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200/80 dark:border-red-800/80 cursor-pointer shadow-xs"
            title="Delete Connection"
          >
            <X size={8} />
          </button>
          <div className="flex items-center px-1 py-0.5">
            <span className="text-slate-400 dark:text-slate-400 font-mono scale-[0.8] mr-0.5">L</span>
            <input
              type="number"
              value={data?.length || ''}
              onChange={onLengthChange}
              className="w-9 border-none outline-none text-right bg-transparent text-slate-700 dark:text-slate-200 font-medium p-0 m-0 h-3.5 focus:bg-slate-50 dark:focus:bg-slate-700"
            />
            <select
              value={data?.unit || 'cm'}
              onChange={onUnitChange}
              className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0 m-0 h-3.5 pr-0.5 font-mono scale-[0.85]"
            >
              <option value="cm" className="bg-white dark:bg-slate-800">cm</option>
              <option value="m" className="bg-white dark:bg-slate-800">m</option>
            </select>
          </div>
          <div className="flex items-center border-t border-slate-100 dark:border-slate-700/60 px-1 py-0.5 bg-slate-50/70 dark:bg-slate-800/80">
            <span className="text-slate-400 dark:text-slate-400 font-mono scale-[0.8] mr-0.5">ID</span>
            <input
              type="text"
              value={data?.innerDiameter || ''}
              onChange={(e: any) => {
                setEdges((edges) =>
                  edges.map((edge) => {
                    if (edge.id === id) {
                      return {
                        ...edge,
                        data: { ...edge.data, innerDiameter: e.target.value },
                      };
                    }
                    return edge;
                  })
                );
              }}
              className="w-9 border-none outline-none text-right bg-transparent text-slate-700 dark:text-slate-200 font-medium p-0 m-0 h-3.5 focus:bg-white dark:focus:bg-slate-700"
              placeholder="1/16"
            />
            <select
              value={data?.diameterUnit || '"'}
              onChange={(e: any) => {
                setEdges((edges) =>
                  edges.map((edge) => {
                    if (edge.id === id) {
                      return {
                        ...edge,
                        data: { ...edge.data, diameterUnit: e.target.value },
                      };
                    }
                    return edge;
                  })
                );
              }}
              className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0 m-0 h-3.5 pr-0.5 font-mono scale-[0.85]"
            >
              <option value='"' className="bg-white dark:bg-slate-800">"</option>
              <option value="mm" className="bg-white dark:bg-slate-800">mm</option>
            </select>
          </div>
          <div className="flex items-center border-t border-slate-100 dark:border-slate-700/60 px-1 py-0.5 bg-slate-50/70 dark:bg-slate-800/80">
            <span className="text-slate-400 dark:text-slate-400 font-mono scale-[0.8] mr-0.5">Mat</span>
            <select
              value={data?.material || 'PFA'}
              onChange={(e: any) => {
                setEdges((edges) =>
                  edges.map((edge) => {
                    if (edge.id === id) {
                      return {
                        ...edge,
                        data: { ...edge.data, material: e.target.value },
                      };
                    }
                    return edge;
                  })
                );
              }}
              className="w-[52px] bg-transparent outline-none cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-0 m-0 h-3.5 pr-0.5 scale-[0.85]"
            >
              <option value="PFA" className="bg-white dark:bg-slate-800">PFA</option>
              <option value="PTFE" className="bg-white dark:bg-slate-800">PTFE</option>
              <option value="FEP" className="bg-white dark:bg-slate-800">FEP</option>
              <option value="ETFE" className="bg-white dark:bg-slate-800">ETFE</option>
              <option value="PEEK" className="bg-white dark:bg-slate-800">PEEK</option>
              <option value="SS" className="bg-white dark:bg-slate-800">Stainless Steel</option>
              <option value="Hastelloy" className="bg-white dark:bg-slate-800">Hastelloy</option>
            </select>
          </div>
          <div 
            className="flex flex-col border-t border-slate-200/60 dark:border-slate-700/60 p-1 font-mono text-[7px] leading-tight"
            style={{ backgroundColor: `${streamColor}14` }}
          >
            {flowRateMlMin > 0 && <span title="Flow Rate" className="font-semibold" style={{ color: streamColor }}><span className="text-slate-400 dark:text-slate-400 font-normal">Q:</span> {displayFlowRate()}</span>}
            {data?.simData?.conc > 0 && <span title="Concentration"><span className="text-slate-400 dark:text-slate-400">C:</span> {data.simData.conc.toFixed(3)} M</span>}
            <span title="Tubing Volume"><span className="text-slate-400 dark:text-slate-400">Vol:</span> {tubingVolMl.toFixed(3)} mL</span>
            {flowRateMlMin > 0 && <span title="Residence Time" className="font-semibold text-teal-700 dark:text-teal-300"><span className="text-slate-400 dark:text-slate-400 font-normal">τ:</span> {formatResTime(resTimeMin)}</span>}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const MicroReactorSvg = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,10 L5,10 L5,2 L10,2 L10,18 L15,18 L15,2 L20,2 L20,18 L25,18 L25,2 L30,2 L30,18 L35,18 L35,10 L40,10" strokeLinejoin="round" />
  </svg>
);

const ColumnReactorSvg = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,12 L6,12 M34,12 L40,12" strokeWidth="1.5" />
    <rect x="9" y="6" width="22" height="12" fill="#f1f5f9" stroke="currentColor" strokeWidth="1.2" />
    <rect x="6" y="3" width="3" height="18" fill="currentColor" rx="0.5" />
    <rect x="31" y="3" width="3" height="18" fill="currentColor" rx="0.5" />
  </svg>
);

const CoilReactorSvg = () => (
  <svg width="40" height="22" viewBox="0 0 40 22" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,11 L4,11" />
    <path d="M36,11 L40,11" />
    <path 
      d="M4,11 C4,2 8,2 8,11 C8,20 12,20 12,11 C12,2 16,2 16,11 C16,20 20,20 20,11 C20,2 24,2 24,11 C24,20 28,20 28,11 C28,2 32,2 32,11 C32,20 36,20 36,11" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

const SampleLoopSvg = () => (
  <svg width="30" height="26" viewBox="0 0 30 26" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="15" cy="10" r="8" />
    <path d="M7,10 L7,23 M23,10 L23,23 M0,23 L10,23 M20,23 L30,23" />
    <rect x="5" y="21" width="4" height="4" fill="currentColor" />
    <rect x="21" y="21" width="4" height="4" fill="currentColor" />
  </svg>
);

const TubeInTubeSvg = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10,25 L10,10 A5,5 0 0,1 20,10 L20,25" stroke="#ef4444" />
    <path d="M5,25 L5,10 A10,10 0 0,1 25,10 L25,25" />
    <circle cx="5" cy="20" r="2" fill="currentColor" />
    <circle cx="25" cy="15" r="2" fill="currentColor" />
    <circle cx="25" cy="22" r="2" fill="currentColor" />
    <rect x="0" y="10" width="4" height="8" rx="2" fill="#fca5a5" stroke="currentColor" strokeWidth="1"/>
    <text x="2" y="15" fontSize="4" fill="currentColor" stroke="none" transform="rotate(-90 2,15)">Gas</text>
  </svg>
);

const PackedBedSvg = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="4" width="30" height="12" fill="#fde047" stroke="currentColor" />
    <path d="M0,10 L5,10 M35,10 L40,10 M5,2 L5,18 M35,2 L35,18" strokeWidth="2" />
    <circle cx="10" cy="8" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="20" cy="7" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="25" cy="13" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="30" cy="9" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="22" cy="10" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
    <circle cx="28" cy="6" r="1.5" fill="currentColor" opacity="0.3" stroke="none" />
  </svg>
);

const ColumnReactor2Svg = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="4" width="30" height="12" fill="#fef08a" stroke="currentColor" />
    <path d="M0,10 L5,10 M35,10 L40,10" strokeWidth="2" />
    <rect x="3" y="2" width="2" height="16" fill="currentColor" />
    <rect x="35" y="2" width="2" height="16" fill="currentColor" />
  </svg>
);

const CstrSvg = () => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="0" y="2" width="60" height="16" fill="white" />
    {[10, 20, 30, 40, 50].map((x) => (
      <g key={x}>
        <circle cx={x} cy="10" r="4" fill="white" />
        <path d={`M${x},10 L${x},6 M${x-2},12 L${x+2},12`} />
      </g>
    ))}
  </svg>
);

const SyringePumpSvg = () => (
  <svg width="40" height="16" viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="10" y="4" width="20" height="8" fill="white" />
    <path d="M30,8 L40,8" />
    <path d="M5,4 L10,4 M5,12 L10,12" />
    <rect x="3" y="2" width="2" height="12" fill="white" />
    <rect x="5" y="5" width="5" height="6" fill="currentColor" opacity="0.3" stroke="none" />
    <path d="M0,8 L3,8" />
    <path d="M12,4 L12,12 M15,4 L15,12 M18,4 L18,12 M21,4 L21,12 M24,4 L24,12 M27,4 L27,12" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

const PumpSvg = ({ text }: { text: string }) => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="15" cy="12" r="9" className="fill-white dark:fill-slate-800" />
    <path d="M0,12 L6,12 M24,12 L30,12" />
    <path d="M15,3 L20,12 L15,21" />
    <text x="21" y="21" fontSize="10" fill="currentColor" stroke="none" fontWeight="bold">{text}</text>
  </svg>
);

const PeristalticPumpSvg = () => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Base stand */}
    <path d="M9,22 L21,22 M11,22 L13,19 M19,22 L17,19 M13,19 L17,19" strokeWidth="1.2" />
    
    {/* Main circular housing track */}
    <circle cx="15" cy="11" r="8" className="fill-white dark:fill-slate-800" strokeWidth="1.4" />
    
    {/* Tubing loop coming into top of housing */}
    <path d="M13,1.5 L13,5.5 A 6.5 6.5 0 1 0 17,5.5 L17,1.5" strokeWidth="1.2" />

    {/* Rotor triangle hub */}
    <polygon points="15,6.2 11.2,12.8 18.8,12.8" strokeWidth="1" />

    {/* 3 Rollers */}
    <circle cx="15" cy="6.2" r="1.8" className="fill-white dark:fill-slate-800" strokeWidth="1.2" />
    <circle cx="11.2" cy="12.8" r="1.8" className="fill-white dark:fill-slate-800" strokeWidth="1.2" />
    <circle cx="18.8" cy="12.8" r="1.8" className="fill-white dark:fill-slate-800" strokeWidth="1.2" />

    {/* Flow process connection lines */}
    <path d="M0,11 L7,11 M23,11 L30,11" strokeWidth="1.2" />
  </svg>
);

const GearPumpSvg = () => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Base stand */}
    <path d="M9,22 L21,22 M11,22 L13,19.5 M19,22 L17,19.5 M13,19.5 L17,19.5" strokeWidth="1.2" />
    
    {/* Outer vertical housing body with arched top and bottom */}
    <path 
      d="M10,3 Q15,1 20,3 L20,17 Q15,19.5 10,17 Z" 
      className="fill-white dark:fill-slate-800" 
      strokeWidth="1.4" 
    />
    
    {/* Side inlet/outlet port blocks */}
    <rect x="5" y="7" width="5" height="6" rx="0.5" className="fill-white dark:fill-slate-800" strokeWidth="1.2" />
    <rect x="20" y="7" width="5" height="6" rx="0.5" className="fill-white dark:fill-slate-800" strokeWidth="1.2" />

    {/* Internal stacked intermeshing gear circles */}
    <circle cx="15" cy="6.8" r="3.2" strokeWidth="1.2" />
    <circle cx="15" cy="13.2" r="3.2" strokeWidth="1.2" />
    
    {/* Gear central axles */}
    <circle cx="15" cy="6.8" r="0.8" className="fill-current" />
    <circle cx="15" cy="13.2" r="0.8" className="fill-current" />

    {/* Flow process connection lines */}
    <path d="M0,10 L5,10 M25,10 L30,10" strokeWidth="1.2" />
  </svg>
);

const MfcSvg = () => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,10 L30,10" />
    <rect x="10" y="2" width="10" height="6" fill="currentColor" />
    <path d="M15,8 L15,10" />
    <text x="15" y="20" fontSize="7" fill="currentColor" stroke="none" textAnchor="middle">MFC</text>
    <text x="15" y="26" fontSize="5" fill="currentColor" stroke="none" textAnchor="middle">(mL/min)</text>
  </svg>
);

const BprSvg = () => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,10 L5,10 M25,10 L30,10" />
    <polygon points="5,5 5,15 15,10" fill="currentColor" />
    <polygon points="25,5 25,15 15,10" fill="currentColor" />
    <text x="15" y="20" fontSize="7" fill="currentColor" stroke="none" textAnchor="middle">BPR</text>
    <text x="15" y="26" fontSize="5" fill="currentColor" stroke="none" textAnchor="middle">(psi)</text>
  </svg>
);

const SwitchingValveSvg = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,10 L5,10 M25,10 L30,10" />
    <polygon points="5,5 5,15 15,10" fill="white" />
    <polygon points="25,5 25,15 15,10" fill="white" />
  </svg>
);

const SafetyValveSvg = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,10 L5,10 M25,10 L30,10" />
    <polygon points="5,5 5,15 15,10" fill="white" />
    <polygon points="25,5 25,15 15,10" fill="white" />
    <path d="M12,12 Q15,7 18,12 Q21,17 18,12" strokeWidth="1" />
    <text x="15" y="13.5" fontSize="8" fill="currentColor" stroke="none" textAnchor="middle" fontWeight="bold">S</text>
  </svg>
);

const RegulatorValveSvg = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,10 L5,10 M25,10 L30,10" />
    <polygon points="5,5 5,15 15,10" fill="white" />
    <polygon points="25,5 25,15 15,10" fill="white" />
    <path d="M15,10 L15,3 M10,3 L20,3" />
    <path d="M11,1 L19,1 A5,5 0 0,0 11,1" strokeWidth="0.5" />
  </svg>
);

const GaugeSvg = ({ text }: { text: string }) => (
  <svg width="20" height="26" viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="10" cy="10" r="8" fill="white" />
    <text x="10" y="13.5" fontSize="10" fill="currentColor" stroke="none" textAnchor="middle">{text}</text>
    <path d="M10,18 L10,25" />
    <path d="M5,25 L15,25" />
  </svg>
);

const TMixerSvg = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5,5 L15,5 M5,15 L15,15 L15,5 M15,10 L25,10" strokeWidth="2.5" strokeLinecap="square" />
    <path d="M0,5 L5,5 M0,15 L5,15 M25,10 L30,10" />
  </svg>
);

const YMixerSvg = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5,5 L15,10 M5,15 L15,10 M15,10 L25,10" strokeWidth="2.5" strokeLinecap="square" />
    <path d="M0,5 L5,5 M0,15 L5,15 M25,10 L30,10" />
  </svg>
);

const StaticMixerSvg = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,5 L8,5 M0,15 L8,15 M8,5 L12,10 L8,15 M12,10 L32,10 M32,10 L40,10" strokeWidth="1.5" />
    <rect x="12" y="5" width="20" height="10" fill="white" stroke="currentColor" />
    <path d="M14,6 L18,14 M18,6 L22,14 M22,6 L26,14 M26,6 L30,14" strokeWidth="1" />
  </svg>
);

const PhotoreactorSvg = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Central Vertical Lamp Cylinder (Glowing Light Source) */}
    <rect x="16" y="2" width="8" height="24" rx="4" fill="#6ee7b7" className="dark:fill-emerald-500" stroke="#059669" strokeWidth="1.2" />
    <ellipse cx="20" cy="3" rx="4" ry="1.2" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
    <ellipse cx="19.2" cy="2.5" rx="2" ry="0.6" fill="white" opacity="0.8" />

    {/* Helical Glass Coil Tube wrapping around the central lamp cylinder */}
    <ellipse cx="20" cy="7.5" rx="10" ry="1.8" fill="#e0f2fe" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="20" cy="10" rx="10" ry="1.8" fill="#e0f2fe" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="20" cy="12.5" rx="10" ry="1.8" fill="#e0f2fe" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="20" cy="15" rx="10" ry="1.8" fill="#e0f2fe" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="20" cy="17.5" rx="10" ry="1.8" fill="#e0f2fe" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="20" cy="20" rx="10" ry="1.8" fill="#e0f2fe" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.2" />

    {/* Process connection lines */}
    <path d="M0,20 L10,20" stroke="currentColor" strokeWidth="1.2" />
    <path d="M30,7.5 L40,7.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const ThreePortValveSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,6 L12,6 M0,18 L12,18 M12,6 L12,18 M12,12 L24,12" strokeWidth="1.5" />
    <polygon points="12,12 16,16 8,16" fill="currentColor" />
  </svg>
);

const FourPortValveSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,12 L24,12 M12,0 L12,24" />
    <polygon points="12,5 16,12 12,19 8,12" fill="currentColor" />
  </svg>
);

const ZaiputSvg = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M0,7 L5,7 M0,13 L5,13 M35,7 L40,7 M35,13 L40,13" />
    <rect x="5" y="4" width="30" height="12" fill="white" />
    <rect x="5" y="10" width="30" height="6" fill="#fde047" stroke="none" />
    <rect x="5" y="4" width="30" height="6" fill="#93c5fd" stroke="none" />
    <rect x="5" y="4" width="30" height="12" fill="none" />
    <path d="M5,10 L35,10" />
  </svg>
);

const FlaskSvg = () => (
  <svg width="20" height="26" viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7,5 L7,12 Q3,15 3,22 A7,7 0 0,0 17,22 Q17,15 13,12 L13,5 Z" fill="white" />
    <path d="M5,5 L15,5" />
    <path d="M8,2 L8,5 M12,2 L12,5" strokeWidth="1" />
  </svg>
);

const FractionCollectorSvg = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="36" height="20" fill="white" />
    <rect x="6" y="8" width="5" height="12" rx="2" fill="currentColor" />
    <rect x="13" y="8" width="5" height="12" rx="2" fill="currentColor" />
    <rect x="20" y="8" width="5" height="12" rx="2" fill="currentColor" />
    <circle cx="31" cy="14" r="4" />
    <text x="31" y="17" fontSize="7" fill="currentColor" stroke="none" textAnchor="middle">P</text>
  </svg>
);

const GasBottleSvg = () => (
  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Base stand */}
    <path d="M2,23 L13,23" strokeWidth="1.2" />
    
    {/* Gas Cylinder Main Body (Wider and taller) */}
    <path 
      d="M3,23 L3,10 C3,7.5 5,6 7.5,6 C10,6 12,7.5 12,10 L12,23 Z" 
      className="fill-white dark:fill-slate-800" 
      strokeWidth="1.4" 
    />

    {/* Cylinder Neck */}
    <path d="M7.5,6 L7.5,3.8" strokeWidth="1.2" />

    {/* Top Main Valve Shutoff T-Handle */}
    <path d="M6,2.8 L9,2.8 M7.5,2.8 L7.5,3.8" strokeWidth="1.1" />

    {/* Regulator Horizontal Manifold Block */}
    <path d="M7.5,4.8 L16,4.8" strokeWidth="1.2" />

    {/* Dual Pressure Regulators (Smaller circular gauges on top) */}
    <circle cx="11.5" cy="2.2" r="1.6" className="fill-white dark:fill-slate-800" strokeWidth="1.1" />
    <path d="M11.5,2.2 L12.2,1.3" strokeWidth="0.9" />

    <circle cx="15.5" cy="2.2" r="1.6" className="fill-white dark:fill-slate-800" strokeWidth="1.1" />
    <path d="M15.5,2.2 L16.2,1.3" strokeWidth="0.9" />

    {/* Regulator Knob */}
    <path d="M13.5,4.8 L13.5,6.5 M12.5,6.5 L14.5,6.5" strokeWidth="0.9" />

    {/* Gas Outlet Process Delivery Line */}
    <path d="M16,4.8 L20,4.8 L20,10 L30,10" strokeWidth="1.2" />
  </svg>
);

// Generic Local Input component for nodes
const NodeInput = ({ value, placeholder, onChange, style, className, type = "text", step = "any" }: any) => {
  const [localVal, setLocalVal] = useState(value !== undefined && value !== null ? value.toString() : '');
  
  useEffect(() => {
    const nextVal = value !== undefined && value !== null ? value.toString() : '';
    if (localVal !== nextVal && (type !== 'number' || parseFloat(localVal) !== parseFloat(nextVal))) {
      setLocalVal(nextVal);
    }
  }, [value, type]);

  const inputSize = Math.max(localVal.toString().length || 1, placeholder?.length || 1, 1);

  return (
    <input 
      type={type === 'number' ? 'text' : type}
      inputMode={type === 'number' ? 'decimal' : undefined}
      step={step}
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => {
        const sanitized = e.target.value.replace(/,/g, '.');
        setLocalVal(sanitized);
        if (type === 'number') {
          const parsed = parseFloat(sanitized);
          if (!isNaN(parsed)) onChange(sanitized);
          else if (sanitized === '') onChange('');
        } else {
          onChange(sanitized);
        }
      }}
      onBlur={(e) => {
        const sanitized = e.target.value.replace(/,/g, '.');
        setLocalVal(sanitized);
        if (type === 'number') {
           const parsed = parseFloat(sanitized);
           if (!isNaN(parsed)) onChange(parsed);
           else if (sanitized === '') onChange('');
        } else {
           onChange(sanitized);
        }
      }}
      style={{ ...style, width: `${Math.max(inputSize * 1.2 + 2, 8)}ch`, minWidth: '45px', boxSizing: 'content-box' }}
      className={`nodrag outline-none placeholder:opacity-50 ${className}`} 
    />
  );
};

const ReagentNode = ({ id, data }: any) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const { stoiRows, setStoiRows, isDarkMode, isMultiColorStreams } = useAppContext();
  
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const updateData = (field: string, val: any) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n));
  };

  // Find corresponding row in stoiRows (by rowId, by matching name, or by feed node index)
  const allFeedNodes = getNodes().filter((n: any) => n.type === 'reagent' || n.type === 'stoiReagent');
  const feedIndex = allFeedNodes.findIndex((n: any) => n.id === id);
  const matchedRow = (stoiRows && stoiRows.length > 0)
    ? (stoiRows.find((r: any) => data.rowId !== undefined && String(r.id) === String(data.rowId))
      || (data.name ? stoiRows.find((r: any) => r.name?.trim().toLowerCase() === data.name.trim().toLowerCase()) : null)
      || (feedIndex >= 0 && feedIndex < stoiRows.length ? stoiRows[feedIndex] : null))
    : null;

  // Values synchronized with matched row (or fallback to node data)
  const currentName = matchedRow?.name !== undefined ? matchedRow.name : (data.name || '');
  const currentMolarity = matchedRow?.conc !== undefined ? matchedRow.conc : (data.molarity || '');
  const currentSolvent = matchedRow?.solvent !== undefined ? matchedRow.solvent : (data.solvent || '');

  const onNameChange = (val: string) => {
    updateData('name', val);
    if (matchedRow && stoiRows) {
      const newRows = stoiRows.map((r: any) => String(r.id) === String(matchedRow.id) ? { ...r, name: val } : r);
      setStoiRows(newRows);
    }
  };

  const onMolarityChange = (val: any) => {
    updateData('molarity', val);
    if (matchedRow && stoiRows) {
      const parsed = parseFloat(val);
      const newRows = stoiRows.map((r: any) => String(r.id) === String(matchedRow.id) ? { ...r, conc: isNaN(parsed) ? 0 : parsed } : r);
      setStoiRows(newRows);
    }
  };

  const onSolventChange = (val: string) => {
    updateData('solvent', val);
    if (matchedRow && stoiRows) {
      const newRows = stoiRows.map((r: any) => String(r.id) === String(matchedRow.id) ? { ...r, solvent: val } : r);
      setStoiRows(newRows);
    }
  };

  const feedColor = getFeedColorForNode(
    { type: 'reagent', id, data: { ...data, rowId: matchedRow?.id || data.rowId, name: currentName } },
    getNodes(),
    stoiRows,
    isMultiColorStreams
  );

  // Background and border styling matching the outgoing stream color
  const containerBg = isDarkMode ? `${feedColor.stroke}24` : `${feedColor.stroke}18`;
  const containerBorder = `${feedColor.stroke}66`;
  const innerBorder = `${feedColor.stroke}44`;
  const accentColor = feedColor.stroke;

  return (
    <div 
      style={{
        backgroundColor: containerBg,
        borderColor: containerBorder,
      }}
      className="px-2.5 py-2 shadow-sm rounded-xl border flex flex-col gap-1 w-fit relative group font-sans transition-all duration-200 hover:shadow-md"
    >
      <button 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950/90 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200/80 dark:border-red-800/80 cursor-pointer shadow-xs"
        title="Delete"
      >
        <X size={10} />
      </button>

      <div className="flex flex-col gap-1 text-[8.5px]">
        <NodeInput 
          placeholder="Reagent Name"
          value={currentName} 
          onChange={onNameChange}
          style={{ borderColor: innerBorder }}
          className="border bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 rounded-md px-1.5 py-0.5 font-bold tracking-tight text-center" 
        />
        <div className="flex items-center gap-1">
          <div 
            style={{ borderColor: innerBorder }}
            className="flex items-center gap-0.5 bg-white/90 dark:bg-slate-900/90 border rounded-md px-1 py-0.5"
          >
            <span style={{ color: accentColor }} className="font-mono text-[7.5px] font-bold">M</span>
            <NodeInput 
              type="number"
              placeholder="0.0"
              value={currentMolarity} 
              onChange={onMolarityChange}
              className="bg-transparent text-slate-900 dark:text-slate-100 text-center font-mono w-10 text-[8px] outline-none" 
            />
          </div>
          <div 
            style={{ borderColor: innerBorder }}
            className="flex items-center gap-0.5 bg-white/90 dark:bg-slate-900/90 border rounded-md px-1 py-0.5"
          >
            <span style={{ color: accentColor }} className="font-mono text-[7.5px] font-bold">Solv</span>
            <NodeInput 
              placeholder="Solvent"
              value={currentSolvent} 
              onChange={onSolventChange}
              className="bg-transparent text-slate-900 dark:text-slate-100 text-center font-normal w-12 text-[8px] outline-none" 
            />
          </div>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ backgroundColor: feedColor.stroke, top: '50%' }}
        className="w-2.5 h-2.5 border-2 border-white dark:border-slate-800 rounded-full shadow-xs transition-transform hover:scale-125" 
      />
    </div>
  );
};

const StoiReagentNode = ({ id, data }: any) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const { stoiRows, setStoiRows, isDarkMode, isMultiColorStreams } = useAppContext();
  
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const allFeedNodes = getNodes().filter((n: any) => n.type === 'reagent' || n.type === 'stoiReagent');
  const feedIndex = allFeedNodes.findIndex((n: any) => n.id === id);
  const row = (stoiRows && stoiRows.length > 0)
    ? (stoiRows.find((r: any) => data.rowId !== undefined && String(r.id) === String(data.rowId))
      || (data.name ? stoiRows.find((r: any) => r.name?.trim().toLowerCase() === data.name.trim().toLowerCase()) : null)
      || (feedIndex >= 0 && feedIndex < stoiRows.length ? stoiRows[feedIndex] : null))
    : null;

  if (!row) {
    return (
      <div className="px-2.5 py-2 shadow-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col gap-0.5 min-w-[95px] relative group font-sans text-[8px] text-slate-400 italic">
         <button onClick={onDelete} className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 cursor-pointer shadow-xs">
            <X size={10} />
         </button>
         Feed Solution
      </div>
    );
  }

  const feedColor = getFeedColorForNode({ type: 'stoiReagent', data: { ...data, rowId: row.id, name: row.name }, id }, getNodes(), stoiRows, isMultiColorStreams);

  const updateRow = (field: string, val: number | string) => {
    const newRows = stoiRows.map((r: any) => String(r.id) === String(row.id) ? { ...r, [field]: val } : r);
    setStoiRows(newRows);
    if (field === 'name') {
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, name: val, rowId: row.id } } : n));
    }
  };

  const limitingRow = stoiRows.find((r: any) => r.isLimiting) || stoiRows[0] || { conc: 1, flow: 1 };
  const limitingRate = limitingRow.conc * limitingRow.flow;
  const rate = row.conc * row.flow;
  const equiv = limitingRate > 0 ? rate / limitingRate : 0;

  const containerBg = isDarkMode ? `${feedColor.stroke}24` : `${feedColor.stroke}18`;
  const containerBorder = `${feedColor.stroke}66`;
  const innerBorder = `${feedColor.stroke}44`;
  const accentColor = feedColor.stroke;

  return (
    <div 
      style={{
        backgroundColor: containerBg,
        borderColor: containerBorder,
      }}
      className="px-2.5 py-2 shadow-sm rounded-xl border flex flex-col gap-1 w-fit relative group font-sans transition-all duration-200 hover:shadow-md"
    >
      <button 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 cursor-pointer shadow-xs"
        title="Delete"
      >
        <X size={10} />
      </button>

      <div className="flex flex-col gap-1 text-[8.5px]">
        <NodeInput 
          placeholder="Name"
          value={row.name || ''} 
          onChange={(val: any) => updateRow('name', val)}
          style={{ borderColor: innerBorder }}
          className="border bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 rounded-md px-1.5 py-0.5 font-bold tracking-tight text-center" 
        />
        
        <div className="flex justify-between items-center gap-1.5">
          <span style={{ color: accentColor }} className="font-bold text-[8px]">
            C <span className="opacity-70 font-mono text-[7.5px]">(M)</span>
          </span>
          <NodeInput 
            type="number"
            step="0.1"
            value={row.conc} 
            onChange={(val: any) => updateRow('conc', val)}
            style={{ borderColor: innerBorder }}
            className="border bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 rounded-md px-1 py-0.5 min-w-0 text-right font-mono text-[8px] w-12" 
          />
        </div>

        <div className="flex justify-between items-center gap-1.5">
          <span style={{ color: accentColor }} className="font-bold text-[8px]">
            Q <span className="opacity-70 font-mono text-[7.5px]">(mL/m)</span>
          </span>
          <NodeInput 
            type="number"
            step="0.1"
            value={row.flow} 
            onChange={(val: any) => updateRow('flow', val)}
            style={{ borderColor: innerBorder }}
            className="border bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 rounded-md px-1 py-0.5 min-w-0 text-right font-mono text-[8px] w-12" 
          />
        </div>

        <div className="flex justify-between items-center gap-1.5">
          <span style={{ color: accentColor }} className="font-bold text-[8px]">
            Eq <span className="opacity-70 font-mono text-[7.5px]">(equiv)</span>
          </span>
          {row.isLimiting ? (
             <span className="font-bold px-1 py-0.5 min-w-0 text-right text-slate-900 dark:text-slate-100 font-mono text-[8px]">1.00</span>
          ) : (
             <input
                type="number"
                step="0.1"
                value={row.equivInput !== undefined ? row.equivInput : equiv.toFixed(2)}
                size={Math.max(row.equivInput?.toString().length || 4, equiv.toFixed(2).length || 4)}
                onChange={(e) => {
                    const val = e.target.value;
                    const newRows = [...stoiRows];
                    const idx = newRows.findIndex((r: any) => r.id === row.id);
                    if (idx !== -1) {
                        newRows[idx].equivInput = val;
                        const eqVal = parseFloat(val);
                        if (!isNaN(eqVal) && limitingRate > 0 && row.conc > 0) {
                            newRows[idx].flow = (eqVal * limitingRate) / row.conc;
                        }
                        setStoiRows(newRows);
                    }
                }}
                onBlur={() => {
                    const newRows = [...stoiRows];
                    const idx = newRows.findIndex((r: any) => r.id === row.id);
                    if (idx !== -1) {
                        newRows[idx].equivInput = undefined;
                        setStoiRows(newRows);
                    }
                }}
                style={{ borderColor: innerBorder }}
                className="nodrag border bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 rounded-md px-1 py-0.5 text-right font-bold outline-none min-w-0 font-mono text-[8px] w-12"
             />
          )}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ backgroundColor: feedColor.stroke, top: '50%' }}
        className="w-2.5 h-2.5 border-2 border-white dark:border-slate-800 rounded-full shadow-xs transition-transform hover:scale-125" 
      />
    </div>
  );
};

const CalcResultNode = ({ id, data }: any) => {
  const { setNodes, setEdges } = useReactFlow();
  
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const updateData = (field: string, val: any) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n));
  };

  // Determine current units with smart backwards compatibility
  const idUnit = data.idUnit || (typeof data.idVal === 'string' && data.idVal.includes('/') ? '"' : (data.idVal ? 'mm' : '"'));
  const lengthUnit = data.lengthUnit || 'm';
  const timeUnit = data.timeUnit || 'min';

  // Toggle ID unit between " and mm with exact value conversion
  const toggleIdUnit = () => {
    if (idUnit === '"') {
      const decInches = parseFractionalInches(data.idVal);
      const mmVal = parseFloat((decInches * 25.4).toFixed(4));
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, idUnit: 'mm', idVal: mmVal } } : n));
    } else {
      const mm = parseFloat(data.idVal) || 0;
      const decInches = mm / 25.4;
      const frac = decimalToFractionalInches(decInches).replace(/"$/, '');
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, idUnit: '"', idVal: frac } } : n));
    }
  };

  // Toggle Length unit between m and cm with exact value conversion
  const toggleLengthUnit = () => {
    const curVal = parseFloat(data.length) || 0;
    if (lengthUnit === 'm') {
      const cmVal = parseFloat((curVal * 100).toFixed(2));
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, lengthUnit: 'cm', length: cmVal } } : n));
    } else {
      const mVal = parseFloat((curVal / 100).toFixed(4));
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, lengthUnit: 'm', length: mVal } } : n));
    }
  };

  // Toggle Time unit between min and s with exact value conversion
  const toggleTimeUnit = () => {
    const curVal = parseFloat(data.time) || 0;
    if (timeUnit === 'min') {
      const sVal = Math.round(curVal * 60);
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, timeUnit: 's', time: sVal } } : n));
    } else {
      const minVal = parseFloat((curVal / 60).toFixed(2));
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, timeUnit: 'min', time: minVal } } : n));
    }
  };

  const idInMm = parseIDToMm(data.idVal, idUnit);
  const lengthInM = parseLengthToM(parseFloat(data.length) || 0, lengthUnit);
  const timeInMin = parseTimeToMin(parseFloat(data.time) || 0, timeUnit);
  const flowRate = parseFloat(data.flowRate) || 0;
  const calcType = data.calcType;
  
  let result = "0.00";
  let unit = "";
  let title = "";
  let inputs: any[] = [];

  if (calcType === 'volume') {
    title = "Volume";
    const volMl = Math.PI * Math.pow(idInMm / 2, 2) * lengthInM;
    result = volMl.toFixed(3);
    unit = "mL";
    inputs = [
      { label: `ID(${idUnit})`, field: "idVal", val: data.idVal, onUnitToggle: toggleIdUnit, isText: idUnit === '"' },
      { label: `L(${lengthUnit})`, field: "length", val: data.length, onUnitToggle: toggleLengthUnit },
    ];
  } else if (calcType === 'residenceTime') {
    title = "Res. Time";
    const volMl = Math.PI * Math.pow(idInMm / 2, 2) * lengthInM;
    const resMin = flowRate > 0 ? volMl / flowRate : 0;
    result = formatTime(resMin);
    unit = "";
    inputs = [
      { label: `ID(${idUnit})`, field: "idVal", val: data.idVal, onUnitToggle: toggleIdUnit, isText: idUnit === '"' },
      { label: `L(${lengthUnit})`, field: "length", val: data.length, onUnitToggle: toggleLengthUnit },
      { label: "Q(mL/min)", field: "flowRate", val: data.flowRate },
    ];
  } else if (calcType === 'tubingLength') {
    title = "Length";
    const lenM = idInMm > 0 ? (flowRate * timeInMin) / (Math.PI * Math.pow(idInMm / 2, 2)) : 0;
    result = lenM.toFixed(2);
    unit = "m";
    inputs = [
      { label: `ID(${idUnit})`, field: "idVal", val: data.idVal, onUnitToggle: toggleIdUnit, isText: idUnit === '"' },
      { label: "Q(mL/min)", field: "flowRate", val: data.flowRate },
      { label: `T(${timeUnit})`, field: "time", val: data.time, onUnitToggle: toggleTimeUnit },
    ];
  } else if (calcType === 'flowRate') {
    title = "Flow Rate";
    const volMl = Math.PI * Math.pow(idInMm / 2, 2) * lengthInM;
    const qVal = timeInMin > 0 ? volMl / timeInMin : 0;
    result = qVal.toFixed(3);
    unit = "mL/min";
    inputs = [
      { label: `ID(${idUnit})`, field: "idVal", val: data.idVal, onUnitToggle: toggleIdUnit, isText: idUnit === '"' },
      { label: `L(${lengthUnit})`, field: "length", val: data.length, onUnitToggle: toggleLengthUnit },
      { label: `T(${timeUnit})`, field: "time", val: data.time, onUnitToggle: toggleTimeUnit },
    ];
  } else if (calcType === 'sty') {
    title = "STY";
    const styVol = parseFloat(data.volume) || 0;
    const styQ = parseFloat(data.flowRate) || 0;
    const styConc = parseFloat(data.conc) || 0;
    const styMW = parseFloat(data.mw) || 0;
    const styYield = parseFloat(data.yield) || 0;
    result = styVol > 0 ? ((styQ * (styConc / 1000) * styMW * (styYield / 100) * 60) / (styVol / 1000)).toFixed(1) : '0.00';
    unit = "g/(L·h)";
    inputs = [
      { label: "Vol(mL)", field: "volume", val: data.volume },
      { label: "Q(mL/min)", field: "flowRate", val: data.flowRate },
      { label: "C(M)", field: "conc", val: data.conc },
      { label: "MW(g/mol)", field: "mw", val: data.mw },
      { label: "Yield(%)", field: "yield", val: data.yield },
    ];
  }

  return (
    <div className="px-2.5 py-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] rounded-xl bg-orange-100/80 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-800/80 flex flex-col gap-1 min-w-[100px] relative group text-slate-800 dark:text-slate-100 transition-all duration-200 hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.08)]">
      <button 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 cursor-pointer shadow-xs"
      >
        <X size={10} />
      </button>
      
      <div className="text-[8.5px] font-bold text-orange-900 dark:text-orange-200 border-b border-orange-200 dark:border-orange-800/60 pb-1 mb-0.5 text-center leading-tight tracking-tight">
        {title}: <span className="font-mono text-orange-700 dark:text-orange-400 font-bold">{result}</span> <span className="text-orange-900/60 dark:text-orange-300/60 font-normal text-[7.5px] font-mono">{unit}</span>
      </div>
      
      <div className="flex flex-col gap-1 text-[7.5px]">
        {inputs.map(inp => (
          <div key={inp.field} className="flex items-center justify-between gap-1.5">
            {inp.onUnitToggle ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inp.onUnitToggle();
                }}
                className="text-orange-800/80 dark:text-orange-300/80 font-mono text-[7.5px] hover:text-orange-950 dark:hover:text-orange-100 hover:underline cursor-pointer transition-colors"
                title="Click to toggle unit"
              >
                {inp.label}
              </button>
            ) : (
              <span className="text-orange-800/80 dark:text-orange-300/80 font-mono text-[7.5px]">{inp.label}</span>
            )}
            <NodeInput 
              type={inp.isText ? "text" : "number"}
              value={inp.val} 
              onChange={(val: any) => updateData(inp.field, val)}
              className="border border-orange-300 dark:border-orange-800 rounded-md px-1 py-0.5 focus:border-orange-500 bg-white dark:bg-slate-900 text-orange-950 dark:text-orange-100 w-11 text-right font-mono text-[7.5px]" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const StoiResultNode = ({ id, data }: any) => {
  const { setNodes, setEdges } = useReactFlow();
  const { stoiRows } = useAppContext();
  
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const rows = stoiRows || [];
  const limitingRow = rows.find((r: any) => r.isLimiting) || rows[0] || { conc: 1, flow: 1 };
  const limitingRate = limitingRow.conc * limitingRow.flow;

  return (
    <div className="px-2.5 py-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] rounded-xl bg-indigo-50/80 dark:bg-indigo-950/70 border border-indigo-200/90 dark:border-indigo-800/80 flex flex-col gap-1 min-w-[105px] relative group text-slate-800 dark:text-slate-100 transition-all duration-200 hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.08)]">
      <button 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 cursor-pointer shadow-xs"
      >
        <X size={10} />
      </button>
      
      <div className="text-[8.5px] font-bold text-indigo-950 dark:text-indigo-300 border-b border-indigo-200/80 dark:border-indigo-800/60 pb-1 mb-0.5 text-center leading-tight tracking-tight">Stoichiometry Summary</div>
      
      <div className="flex flex-col gap-0.5 text-[7px]">
        {rows.map((row: any, idx: number) => {
          const rate = row.conc * row.flow;
          const equiv = limitingRate > 0 ? rate / limitingRate : 0;
          return (
            <div key={row.id} className="flex items-center justify-between gap-2 border-b border-indigo-100/60 dark:border-indigo-800/40 last:border-0 pb-0.5 last:pb-0">
              <span className={`font-medium ${row.isLimiting ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>R{idx + 1} {row.isLimiting && '(Lim)'}</span>
              <span className="text-indigo-950 dark:text-indigo-200 font-bold font-mono">{equiv.toFixed(2)} eq</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FreeTextNode = ({ id, data }: any) => {
  const { setNodes } = useReactFlow();
  const [text, setText] = useState(data?.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (data?.text !== undefined && data?.text !== text) {
      setText(data.text);
    }
  }, [data?.text]);

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                text: newText,
              },
            }
          : n
      )
    );
  };

  return (
    <div className="px-3 py-2.5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] rounded-xl bg-amber-50/85 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 w-fit min-w-[130px] max-w-[380px] relative group font-sans transition-all duration-150 hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.08)]">
      <button 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 cursor-pointer shadow-xs"
        title="Delete"
      >
        <X size={10} />
      </button>

      {/* Auto-sizing Grid: Invisible duplicate expands container height and width naturally to match text */}
      <div className="grid grid-cols-1 grid-rows-1">
        <div
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words text-sm leading-relaxed p-0 min-h-[36px] font-sans pointer-events-none select-none"
        >
          {(text || 'Enter note...') + '\n'}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Enter note..."
          rows={1}
          className="nodrag nopan col-start-1 row-start-1 resize-none overflow-hidden bg-transparent w-full h-full text-slate-800 dark:text-amber-100 text-sm leading-relaxed placeholder:text-amber-900/40 dark:placeholder:text-amber-200/40 outline-none p-0 font-sans"
        />
      </div>
    </div>
  );
};

const NodeWrapper = ({ id, label, CustomSvg, data, inputs = 1, outputs = 1, hasTemperature = false, hasVolume = false, hasWavelength = false, hasLength = false, regulatorConfig, children }: any) => {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const updateData = (field: string, val: any) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n));
  };

  const hasMultipleInputs = inputs > 1;
  const hasMultipleOutputs = outputs > 1;

  const isNotesVisible = data?.showNotes || (data?.notes && data?.notes.length > 0);

  const handleTargetClass = "w-2 h-2 !bg-slate-400 dark:!bg-slate-500 border border-white dark:border-slate-850 rounded-full shadow-2xs transition-transform hover:scale-125";
  const handleSourceClass = "w-2 h-2 !bg-emerald-500 dark:!bg-emerald-400 border border-white dark:border-slate-850 rounded-full shadow-2xs transition-transform hover:scale-125";

  return (
    <div className="px-2.5 py-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] rounded-xl bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 flex flex-col items-center justify-center gap-1.5 min-w-[76px] relative group text-slate-800 dark:text-slate-100 transition-all duration-200 hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_16px_-2px_rgba(0,0,0,0.5)]">
      <button 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-red-50 dark:bg-red-950/90 text-red-600 dark:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200/80 dark:border-red-800/80 cursor-pointer shadow-xs"
        title="Delete"
      >
        <X size={10} />
      </button>

      {inputs > 3 ? (
        <>
          {Array.from({ length: inputs }).map((_, idx) => (
            <Handle
              key={`in${idx + 1}`}
              type="target"
              position={Position.Left}
              id={`in${idx + 1}`}
              style={{ top: `${((idx + 1) / (inputs + 1)) * 100}%` }}
              className={handleTargetClass}
            />
          ))}
        </>
      ) : inputs === 3 ? (
        <>
          <Handle type="target" position={Position.Left} id="in1" style={{ top: '25%' }} className={handleTargetClass} />
          <Handle type="target" position={Position.Left} id="in2" style={{ top: '50%' }} className={handleTargetClass} />
          <Handle type="target" position={Position.Left} id="in3" style={{ top: '75%' }} className={handleTargetClass} />
        </>
      ) : inputs === 2 ? (
        <>
          <Handle type="target" position={Position.Left} id="in1" style={{ top: '30%' }} className={handleTargetClass} />
          <Handle type="target" position={Position.Left} id="in2" style={{ top: '70%' }} className={handleTargetClass} />
        </>
      ) : inputs === 1 ? (
        <Handle type="target" position={Position.Left} style={{ top: '50%' }} className={handleTargetClass} />
      ) : null}

      <div className="flex items-center justify-center min-h-[32px] h-auto my-0 w-full relative shrink-0">
        {CustomSvg && <CustomSvg />}
      </div>
      
      {typeof label === 'string' && label.trim().length > 0 ? (
        <span className="text-[9.5px] font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap text-center max-w-full px-1 overflow-hidden text-ellipsis leading-tight tracking-tight">
          {label}
        </span>
      ) : typeof label !== 'string' ? (
        label
      ) : null}
      {data?.details && <span className="text-[8px] font-normal text-slate-400 dark:text-slate-400">{data.details}</span>}
      
      {hasVolume && (
        <div className="flex items-center gap-1 mt-0.5 text-[8px]">
          <NodeInput 
            type="number"
            placeholder="Vol"
            value={data?.volume || ''}
            onChange={(val: any) => updateData('volume', val)}
            className="border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 rounded-md px-1.5 py-0.5 w-11 text-center font-mono text-[8px] focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-400"
          />
          <select
            value={data?.volumeUnit || 'mL'}
            onChange={(e: any) => updateData('volumeUnit', e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[7.5px] font-mono"
          >
            <option value="mL" className="bg-white dark:bg-slate-800">mL</option>
            <option value="µL" className="bg-white dark:bg-slate-800">µL</option>
            <option value="L" className="bg-white dark:bg-slate-800">L</option>
          </select>
        </div>
      )}

      {hasLength && (
        <div className="flex items-center gap-1 mt-0.5 text-[8px]">
          <NodeInput 
            type="number"
            placeholder="L"
            value={data?.length || ''}
            onChange={(val: any) => updateData('length', val)}
            className="border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 rounded-md px-1.5 py-0.5 w-11 text-center font-mono text-[8px] focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-400"
          />
          <select
            value={data?.lengthUnit || 'm'}
            onChange={(e: any) => updateData('lengthUnit', e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[7.5px] font-mono"
          >
            <option value="m" className="bg-white dark:bg-slate-800">m</option>
            <option value="cm" className="bg-white dark:bg-slate-800">cm</option>
          </select>
        </div>
      )}

      {hasWavelength && (
        <div className="flex items-center gap-1 mt-0.5 text-[8px]">
          <NodeInput 
            type="number"
            placeholder="λ"
            value={data?.wavelength || ''}
            onChange={(val: any) => updateData('wavelength', val)}
            className="border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 rounded-md px-1.5 py-0.5 w-11 text-center font-mono text-[8px] focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-400"
          />
          <span className="text-slate-400 dark:text-slate-400 font-mono text-[7.5px]">nm</span>
        </div>
      )}

      {hasTemperature && (
        <div className="flex items-center gap-1 mt-0.5 text-[8px]">
          <NodeInput 
            type="number"
            placeholder="T"
            value={data?.temperature || ''}
            onChange={(val: any) => updateData('temperature', val)}
            className="border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 rounded-md px-1.5 py-0.5 w-11 text-center font-mono text-[8px] focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-400"
          />
          <span className="text-slate-400 dark:text-slate-400 font-mono text-[7.5px]">°C</span>
        </div>
      )}

      {regulatorConfig && (
        <div className="flex items-center gap-1 mt-1 text-[8px] nodrag bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5">
          <NodeInput 
            type={regulatorConfig.inputType || "number"}
            placeholder={regulatorConfig.placeholder || "0"}
            value={data?.regulatorValue ?? ''}
            onChange={(val: any) => updateData('regulatorValue', val)}
            className="w-11 text-center font-mono focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 bg-transparent py-0 text-[8px]" 
          />
          <select
            value={data?.regulatorUnit || regulatorConfig.defaultUnit}
            onChange={(e: any) => updateData('regulatorUnit', e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[7.5px] py-0 font-medium border-l border-slate-200 dark:border-slate-700 pl-1 font-mono"
          >
            {regulatorConfig.units.map((unit: string) => (
              <option key={unit} value={unit} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{unit}</option>
            ))}
          </select>
        </div>
      )}

      {children}

      {isNotesVisible ? (
        <div className="w-full relative group/notes mt-1">
          <textarea
            className="nodrag text-[8.5px] bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5 w-full resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none focus:border-slate-400 overflow-hidden leading-snug"
            placeholder="Notes..."
            rows={1}
            value={data?.notes || ''}
            onInput={(e) => {
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            onChange={(e) => updateData('notes', e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
          />
          <button 
            onClick={() => {
              updateData('notes', '');
              updateData('showNotes', false);
            }}
            className="absolute -top-1.5 -right-1.5 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded-full p-0.5 opacity-0 group-hover/notes:opacity-100 transition-opacity z-10 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shadow-xs"
            title="Remove Notes"
          >
            <X size={8} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => updateData('showNotes', true)}
          className="text-[7.5px] text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-1 flex items-center justify-center w-full py-0.5 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-md transition-colors cursor-pointer"
          title="Add Notes"
        >
          + Note
        </button>
      )}

      {outputs > 3 ? (
        <>
          {Array.from({ length: outputs }).map((_, idx) => (
            <Handle
              key={`out${idx + 1}`}
              type="source"
              position={Position.Right}
              id={`out${idx + 1}`}
              style={{ top: `${((idx + 1) / (outputs + 1)) * 100}%` }}
              className={handleSourceClass}
            />
          ))}
        </>
      ) : outputs === 3 ? (
        <>
          <Handle type="source" position={Position.Right} id="out1" style={{ top: '25%' }} className={handleSourceClass} />
          <Handle type="source" position={Position.Right} id="out2" style={{ top: '50%' }} className={handleSourceClass} />
          <Handle type="source" position={Position.Right} id="out3" style={{ top: '75%' }} className={handleSourceClass} />
        </>
      ) : outputs === 2 ? (
        <>
          <Handle type="source" position={Position.Right} id="out1" style={{ top: '30%' }} className={handleSourceClass} />
          <Handle type="source" position={Position.Right} id="out2" style={{ top: '70%' }} className={handleSourceClass} />
        </>
      ) : outputs === 1 ? (
        <Handle type="source" position={Position.Right} style={{ top: '50%' }} className={handleSourceClass} />
      ) : null}
    </div>
  );
};

const PUMP_TYPES = [
  { id: 'syringe', label: 'Syringe Pump', Svg: SyringePumpSvg },
  { id: 'hplc', label: 'HPLC Pump', Svg: () => <PumpSvg text="H" /> },
  { id: 'peristaltic', label: 'Peristaltic Pump', Svg: PeristalticPumpSvg },
  { id: 'diaphragm', label: 'Diaphragm Pump', Svg: () => <PumpSvg text="D" /> },
  { id: 'gear', label: 'Gear Pump', Svg: GearPumpSvg },
];

const PumpNode = (props: any) => {
  const { setNodes } = useReactFlow();

  const currentType = props.data?.pumpType || (
    props.type === 'hplcPump' ? 'hplc' :
    props.type === 'peristalticPump' ? 'peristaltic' :
    props.type === 'diaphragmPump' ? 'diaphragm' :
    props.type === 'gearPump' ? 'gear' : 'syringe'
  );

  const matched = PUMP_TYPES.find(p => p.id === currentType) || PUMP_TYPES[0];

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                pumpType: newType,
              },
            }
          : n
      )
    );
  };

  const PumpSelectHeader = (
    <div className="flex items-center justify-center my-0.5 nodrag">
      <select
        value={matched.id}
        onChange={handleTypeChange}
        className="nodrag text-[9px] font-bold text-slate-800 dark:text-slate-100 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5 outline-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors text-center max-w-[110px]"
      >
        {PUMP_TYPES.map((pt) => (
          <option key={pt.id} value={pt.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">
            {pt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <NodeWrapper
      {...props}
      label={PumpSelectHeader}
      CustomSvg={matched.Svg}
      regulatorConfig={{ defaultUnit: 'mL/min', units: ['mL/min', 'uL/min'] }}
    />
  );
};

const MIXER_TYPES = [
  { id: 'tMixer', label: 'T-Mixer', Svg: TMixerSvg, inputs: 2 },
  { id: 'yMixer', label: 'Y-Mixer', Svg: YMixerSvg, inputs: 2 },
  { id: 'staticMixer', label: 'Static Mixer', Svg: StaticMixerSvg, inputs: 2 },
  { id: 'fourPortValve', label: '4-way Mixer', Svg: FourPortValveSvg, inputs: 3 },
];

const MixerNode = (props: any) => {
  const { setNodes } = useReactFlow();

  const currentType = props.data?.mixerType || (
    props.type === 'tMixer' ? 'tMixer' :
    props.type === 'staticMixer' ? 'staticMixer' :
    props.type === 'fourPortValve' ? 'fourPortValve' : 'yMixer'
  );

  const matched = MIXER_TYPES.find(m => m.id === currentType) || MIXER_TYPES[0];

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                mixerType: newType,
              },
            }
          : n
      )
    );
  };

  const MixerSelectHeader = (
    <div className="flex items-center justify-center my-0.5 nodrag">
      <select
        value={matched.id}
        onChange={handleTypeChange}
        className="nodrag text-[9px] font-bold text-slate-800 dark:text-slate-100 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5 outline-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors text-center max-w-[110px]"
      >
        {MIXER_TYPES.map((mt) => (
          <option key={mt.id} value={mt.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">
            {mt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <NodeWrapper
      {...props}
      label={MixerSelectHeader}
      CustomSvg={matched.Svg}
      inputs={matched.inputs}
      outputs={1}
      hasTemperature={true}
    />
  );
};

const REACTOR_TYPES = [
  { id: 'coilReactor', label: 'Coil Reactor', Svg: CoilReactorSvg, inputs: 1, outputs: 1, hasLength: true, hasVolume: true },
  { id: 'microReactor', label: 'Micro Reactor', Svg: MicroReactorSvg, inputs: 1, outputs: 1, hasVolume: true },
  { id: 'columnReactor', label: 'Column Reactor', Svg: ColumnReactorSvg, inputs: 1, outputs: 1, hasVolume: true },
  { id: 'photoreactor', label: 'Photoreactor', Svg: PhotoreactorSvg, inputs: 1, outputs: 1, hasWavelength: true, hasVolume: true },
  { id: 'tubeInTube', label: 'Tube-in-tube Reactor', Svg: TubeInTubeSvg, inputs: 2, outputs: 2, hasVolume: true },
  { id: 'packedBed', label: 'Packed Bed Reactor', Svg: PackedBedSvg, inputs: 1, outputs: 1, hasVolume: true },
  { id: 'cstr', label: 'CSTR', Svg: CstrSvg, inputs: 1, outputs: 1, hasVolume: true },
];

const ReactorNode = (props: any) => {
  const { setNodes } = useReactFlow();

  const currentType = props.data?.reactorType || (
    props.type === 'microReactor' ? 'microReactor' :
    props.type === 'columnReactor' ? 'columnReactor' :
    props.type === 'photoreactor' ? 'photoreactor' :
    props.type === 'tubeInTube' ? 'tubeInTube' :
    props.type === 'packedBed' ? 'packedBed' :
    props.type === 'cstr' ? 'cstr' : 'coilReactor'
  );

  const matched = REACTOR_TYPES.find(r => r.id === currentType) || REACTOR_TYPES[0];

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                reactorType: newType,
              },
            }
          : n
      )
    );
  };

  const ReactorSelectHeader = (
    <div className="flex items-center justify-center my-0.5 nodrag">
      <select
        value={matched.id}
        onChange={handleTypeChange}
        className="nodrag text-[9px] font-bold text-slate-800 dark:text-slate-100 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5 outline-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors text-center max-w-[115px]"
      >
        {REACTOR_TYPES.map((rt) => (
          <option key={rt.id} value={rt.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">
            {rt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <NodeWrapper
      {...props}
      label={ReactorSelectHeader}
      CustomSvg={matched.Svg}
      inputs={matched.inputs}
      outputs={matched.outputs}
      hasVolume={matched.hasVolume}
      hasLength={matched.hasLength}
      hasWavelength={matched.hasWavelength}
    />
  );
};

const GasBottleNode = (props: any) => {
  const { setNodes } = useReactFlow();

  const updateData = (field: string, val: any) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                [field]: val,
              },
            }
          : n
      )
    );
  };

  return (
    <NodeWrapper
      {...props}
      label="Gas Bottle"
      CustomSvg={GasBottleSvg}
      inputs={0}
      outputs={1}
    >
      <div className="flex flex-col gap-1 w-full mt-1 nodrag">
        <div className="flex items-center gap-1 text-[8px] bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5">
          <span className="text-slate-400 dark:text-slate-400 font-mono scale-[0.85]">Gas</span>
          <NodeInput
            type="text"
            placeholder="N2"
            value={props.data?.gas ?? ''}
            onChange={(val: any) => updateData('gas', val)}
            className="w-full bg-transparent text-center font-mono focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none text-[8px] py-0 font-medium"
          />
        </div>
        <div className="flex items-center gap-1 text-[8px] bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5">
          <span className="text-slate-400 dark:text-slate-400 font-mono scale-[0.85]">P</span>
          <NodeInput
            type="number"
            placeholder="10"
            value={props.data?.pressure ?? ''}
            onChange={(val: any) => updateData('pressure', val)}
            className="w-9 text-center font-mono focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 bg-transparent outline-none text-[8px] py-0 font-medium"
          />
          <select
            value={props.data?.pressureUnit || 'bar'}
            onChange={(e: any) => updateData('pressureUnit', e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[7.5px] py-0 font-medium border-l border-slate-200 dark:border-slate-700 pl-1 font-mono"
          >
            <option value="bar" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">bar</option>
            <option value="psi" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">psi</option>
            <option value="MPa" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">MPa</option>
          </select>
        </div>
      </div>
    </NodeWrapper>
  );
};

const GenericCustomModuleSvg = () => (
  <svg width="36" height="32" viewBox="0 0 36 32" fill="none" className="stroke-slate-700 dark:stroke-slate-200">
    <rect x="4" y="4" width="28" height="24" rx="4" strokeWidth="1.8" className="fill-emerald-50/60 dark:fill-emerald-950/40" />
    <circle cx="12" cy="16" r="3" strokeWidth="1.5" />
    <path d="M19 12H27M19 16H27M19 20H24" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CustomModuleNode = (props: any) => {
  const { setNodes } = useReactFlow();
  const { customModules } = useAppContext();

  const templateId = props.data?.templateId;
  const liveTemplate = customModules?.find((m: any) => m.id === templateId);
  const config = liveTemplate || props.data?.customConfig || {
    name: props.data?.label || 'Custom Module',
    inputs: 1,
    outputs: 1,
    fields: [],
    iconPreset: 'generic',
  };

  // Keep embedded customConfig synced if template was edited
  useEffect(() => {
    if (liveTemplate && JSON.stringify(props.data?.customConfig) !== JSON.stringify(liveTemplate)) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === props.id
            ? { ...n, data: { ...n.data, customConfig: liveTemplate } }
            : n
        )
      );
    }
  }, [liveTemplate, props.id, props.data?.customConfig, setNodes]);

  const updateFieldValue = (fieldId: string, val: any) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                fieldValues: {
                  ...((n.data?.fieldValues as Record<string, any>) || {}),
                  [fieldId]: val,
                },
              },
            }
          : n
      )
    );
  };

  const updateFieldUnit = (fieldId: string, unit: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                fieldUnits: {
                  ...((n.data?.fieldUnits as Record<string, any>) || {}),
                  [fieldId]: unit,
                },
              },
            }
          : n
      )
    );
  };

  const currentImageSize = props.data?.imageSize ?? config.imageSize ?? 48;

  const setImageSize = (newSize: number) => {
    const clamped = Math.max(24, Math.min(180, newSize));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === props.id
          ? {
              ...n,
              data: {
                ...n.data,
                imageSize: clamped,
              },
            }
          : n
      )
    );
  };

  const renderGraphic = () => {
    if (config.imageUrl) {
      return (
        <div className="flex flex-col items-center justify-center relative w-full group/img py-0.5">
          <img
            src={config.imageUrl}
            alt={config.name}
            style={{
              maxHeight: `${currentImageSize}px`,
              maxWidth: `${Math.round(currentImageSize * 1.8)}px`,
            }}
            className="w-auto h-auto object-contain rounded select-none pointer-events-none transition-all duration-150 block"
          />
          {/* Subtle on-canvas resize nudge controls on hover */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 shadow-md border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity z-20 nodrag">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageSize(currentImageSize - 8);
              }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Make picture smaller"
            >
              −
            </button>
            <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 select-none px-0.5">
              {currentImageSize}px
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageSize(currentImageSize + 8);
              }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Make picture larger"
            >
              +
            </button>
          </div>
        </div>
      );
    }
    switch (config.iconPreset) {
      case 'pump':
        return <SyringePumpSvg />;
      case 'reactor':
        return <CoilReactorSvg />;
      case 'vessel':
        return <FlaskSvg />;
      case 'sensor':
        return <GaugeSvg text="S" />;
      case 'valve':
        return <FourPortValveSvg />;
      default:
        return <GenericCustomModuleSvg />;
    }
  };

  const fields = config.fields || [];

  return (
    <NodeWrapper
      {...props}
      label={config.name}
      CustomSvg={renderGraphic}
      inputs={typeof config.inputs === 'number' ? config.inputs : 1}
      outputs={typeof config.outputs === 'number' ? config.outputs : 1}
    >

      {fields.length > 0 && (
        <div className="flex flex-col gap-1 w-full mt-1 nodrag">
          {fields.map((field: any) => {
            const currentVal = props.data?.fieldValues?.[field.id] ?? field.defaultValue ?? '';
            const unitOptions = field.unit
              ? field.unit.split(',').map((u: string) => u.trim()).filter(Boolean)
              : [];
            const currentUnit = props.data?.fieldUnits?.[field.id] || unitOptions[0] || '';
            const selectOptions = field.options && field.options.length > 0
              ? field.options
              : unitOptions;

            return (
              <div
                key={field.id}
                className="flex items-center justify-between gap-1 text-[8px] bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/80 rounded-md px-1.5 py-0.5"
              >
                {field.label && (
                  <span className="text-slate-400 dark:text-slate-400 font-mono text-[7.5px] whitespace-nowrap shrink-0">
                    {field.label}
                  </span>
                )}

                {field.type === 'select' ? (
                  <select
                    value={currentVal || (selectOptions[0] ?? '')}
                    onChange={(e) => updateFieldValue(field.id, e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-800 dark:text-slate-100 text-[8px] py-0 font-medium font-mono w-full text-right"
                  >
                    {selectOptions.map((opt: string) => (
                      <option key={opt} value={opt} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <NodeInput
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder || (field.type === 'number' ? '0' : '...')}
                    value={currentVal}
                    onChange={(val: any) => updateFieldValue(field.id, val)}
                    className={`${
                      field.type === 'number' ? 'w-11' : 'w-16'
                    } text-center font-mono focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 bg-transparent outline-none text-[8px] py-0 font-medium min-w-0 flex-1`}
                  />
                )}

                {field.type !== 'select' && unitOptions.length > 1 && (
                  <select
                    value={currentUnit}
                    onChange={(e) => updateFieldUnit(field.id, e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[7.5px] py-0 font-medium border-l border-slate-200 dark:border-slate-700 pl-1 font-mono shrink-0"
                  >
                    {unitOptions.map((u: string) => (
                      <option key={u} value={u} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                        {u}
                      </option>
                    ))}
                  </select>
                )}

                {field.type !== 'select' && unitOptions.length === 1 && (
                  <span className="text-slate-400 dark:text-slate-400 font-mono text-[7.5px] pl-0.5 shrink-0">
                    {unitOptions[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </NodeWrapper>
  );
};

export const edgeTypes = {
  custom: CustomEdge,
};

export const CustomNodes = {
  reactor: ReactorNode,
  microReactor: ReactorNode,
  columnReactor: ReactorNode,
  coilReactor: ReactorNode,
  photoreactor: ReactorNode,
  tubeInTube: ReactorNode,
  packedBed: ReactorNode,
  cstr: ReactorNode,
  sampleLoop: (props: any) => <NodeWrapper label="Sample Loop" CustomSvg={SampleLoopSvg} hasVolume={true} {...props} />,
  
  pump: PumpNode,
  syringePump: PumpNode,
  hplcPump: PumpNode,
  peristalticPump: PumpNode,
  diaphragmPump: PumpNode,
  gearPump: PumpNode,

  gasBottle: GasBottleNode,

  mfc: (props: any) => <NodeWrapper label="Mass Flow Controller" CustomSvg={MfcSvg} regulatorConfig={{ defaultUnit: 'mL/min', units: ['mL/min', 'sccm'] }} {...props} />,
  bpr: (props: any) => <NodeWrapper label="Back Pressure Reg." CustomSvg={BprSvg} regulatorConfig={{ defaultUnit: 'psi', units: ['psi', 'bar', 'MPa'] }} {...props} />,
  pressureGauge: (props: any) => <NodeWrapper label="Pressure Sensor" CustomSvg={() => <GaugeSvg text="P" />} regulatorConfig={{ defaultUnit: 'bar', units: ['bar', 'psi'] }} {...props} />,
  tempSensor: (props: any) => <NodeWrapper label="Temperature Sensor" CustomSvg={() => <GaugeSvg text="T" />} inputs={1} outputs={1} regulatorConfig={{ defaultUnit: '°C', units: ['°C', 'K', '°F'] }} {...props} />,

  mixer: MixerNode,
  tMixer: MixerNode,
  yMixer: MixerNode,
  staticMixer: MixerNode,
  fourPortValve: MixerNode,
  zaiput: (props: any) => <NodeWrapper label="Membrane Separator" CustomSvg={ZaiputSvg} inputs={1} outputs={2} {...props} />,
  collectionFlask: (props: any) => <NodeWrapper label="Collection Flask" CustomSvg={FlaskSvg} outputs={0} {...props} />,
  fractionCollector: (props: any) => <NodeWrapper label="Fraction Collector" CustomSvg={FractionCollectorSvg} outputs={0} {...props} />,
  reagent: ReagentNode,
  stoiReagent: StoiReagentNode,
  calcResult: CalcResultNode,
  stoiResult: StoiResultNode,
  freeText: FreeTextNode,
  customModule: CustomModuleNode,
};


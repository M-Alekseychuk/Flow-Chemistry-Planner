import React, { useState } from 'react';
import { Menu, ChevronLeft, Wrench, Calculator as CalculatorIcon } from 'lucide-react';
import { NodePaletteContent } from './NodePalette';
import { CalculatorsContent } from './Calculators';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'equipment' | 'calculators'>('equipment');

  if (!isOpen) {
    return (
      <div className="w-12 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-2 flex flex-col items-center justify-between shadow-sm shrink-0 transition-colors">
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="mt-4" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
              {activeTab === 'equipment' ? 'Equipment' : 'Calculators'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm shrink-0 transition-colors relative z-10">
      <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-200 dark:bg-slate-800/80 p-0.5 rounded-lg gap-0.5">
           <button 
             onClick={() => setActiveTab('equipment')}
             className={`h-8 flex items-center gap-1.5 px-3 text-xs font-medium rounded-md transition-colors ${activeTab === 'equipment' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Wrench size={14} />
             Equipment
           </button>
           <button 
             onClick={() => setActiveTab('calculators')}
             className={`h-8 flex items-center gap-1.5 px-3 text-xs font-medium rounded-md transition-colors ${activeTab === 'calculators' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <CalculatorIcon size={14} />
             Calculators
           </button>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
         {activeTab === 'equipment' ? <NodePaletteContent /> : <CalculatorsContent />}
      </div>
    </div>
  );
}

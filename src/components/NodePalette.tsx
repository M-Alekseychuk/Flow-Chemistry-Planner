import React, { useState } from 'react';
import { NodeType, CustomModuleTemplate } from '../types';
import { ChevronDown, ChevronUp, ChevronLeft, Menu, Star, Plus, Edit3, Trash2, Sparkles } from 'lucide-react';
import { useAppContext } from '../AppContext';
import CustomModuleModal from './CustomModuleModal';

export const CATEGORIES = [
  {
    name: 'General',
    items: [
      { type: 'reagent', label: 'Feed Solution', description: 'Inlet feed solution or reagent reservoir providing starting materials to the pumps.' },
      { type: 'pump', label: 'Pump', description: 'Fluid delivery pump. Select specific pump type (Syringe, HPLC, Peristaltic, Diaphragm, Gear) directly on the module.' },
      { type: 'mixer', label: 'Mixer', description: 'Fluid mixer. Select specific mixer type (T-Mixer, Y-Mixer, Static Mixer, 4-way Mixer) directly on the module.' },
      { type: 'reactor', label: 'Reactor', description: 'Chemical or physical reactor. Select specific reactor type (Coil, Micro, Column, Photoreactor, Tube-in-tube, Packed Bed, CSTR) directly on the module.' },
      { type: 'collectionFlask', label: 'Collection Flask', description: 'A vessel to collect the final product or waste stream.' },
      { type: 'freeText', label: 'Free Text Note', description: 'A simple text box for annotating your flow diagram.' },
    ]
  },
  {
    name: 'Regulators',
    items: [
      { type: 'mfc', label: 'Mass Flow Controller', description: 'Accurately measures and controls the flow of gases.' },
      { type: 'bpr', label: 'Back Pressure Reg.', description: 'Maintains a set pressure upstream. Crucial for keeping gases dissolved in liquids or superheating solvents.' },
      { type: 'pressureGauge', label: 'Pressure Sensor', description: 'Provides a visual readout of the fluid pressure.' },
      { type: 'tempSensor', label: 'Temperature Sensor', description: 'Monitors fluid temperature in-line.' },
    ]
  },
  {
    name: 'Others',
    items: [
      { type: 'sampleLoop', label: 'Sample Loop', description: 'A fixed volume of tubing used to introduce a specific sample volume into the flow.' },
      { type: 'gasBottle', label: 'Gas Bottle', description: 'Gas cylinder supply module with freely editable gas type and pressure.' },
      { type: 'zaiput', label: 'Membrane Separator', description: 'A membrane-based continuous liquid-liquid separator. Excellent for extracting aqueous/organic phases in-line.' },
      { type: 'fractionCollector', label: 'Fraction Collector', description: 'Automated device to collect small aliquots of product over time.' },
    ]
  }
];

export function NodePaletteContent() {
  const {
    favorites,
    toggleFavorite,
    customModules,
    addCustomModule,
    updateCustomModule,
    deleteCustomModule,
  } = useAppContext();

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'General': true,
    'Regulators': true,
    'Others': true,
    'Custom Modules': true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CustomModuleTemplate | null>(null);

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onCustomModuleDragStart = (event: React.DragEvent, mod: CustomModuleTemplate) => {
    event.dataTransfer.setData('application/reactflow', 'customModule');
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        label: mod.name,
        templateId: mod.id,
        customConfig: mod,
      })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleOpenCreate = () => {
    setEditingModule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: CustomModuleTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingModule(mod);
    setIsModalOpen(true);
  };

  const handleSaveCustomModule = (moduleData: Omit<CustomModuleTemplate, 'id' | 'createdAt'>) => {
    if (editingModule) {
      updateCustomModule(editingModule.id, moduleData);
    } else {
      addCustomModule(moduleData);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pr-3">
      {/* Create Custom Module Button */}
      <button
        onClick={handleOpenCreate}
        className="w-full h-8 mb-4 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
      >
        <Plus size={15} />
        <span>Create Custom Module</span>
      </button>

      {/* Custom Modules Category */}
      <div className="mb-4">
        <button
          onClick={() => toggleCategory('Custom Modules')}
          className="w-full flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} />
            Custom Modules ({customModules?.length || 0})
          </span>
          {openCategories['Custom Modules'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openCategories['Custom Modules'] && (
          <div className="flex flex-col gap-2">
            {(!customModules || customModules.length === 0) ? (
              <div
                onClick={handleOpenCreate}
                className="border border-dashed border-slate-300 dark:border-slate-700 rounded-md p-2.5 text-center text-xs text-slate-400 dark:text-slate-500 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
              >
                No custom modules yet. Click to build your own pump, reactor, or sensor!
              </div>
            ) : (
              customModules.map((mod: CustomModuleTemplate) => (
                <div
                  key={mod.id}
                  className="bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 rounded-md p-2 text-sm text-slate-700 dark:text-slate-200 cursor-grab hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group"
                  onDragStart={(event) => onCustomModuleDragStart(event, mod)}
                  draggable
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {mod.imageUrl ? (
                      <img
                        src={mod.imageUrl}
                        alt={mod.name}
                        className="w-6 h-6 object-contain rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 p-0.5"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
                        {(mod.iconPreset || 'mod').slice(0, 3)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-xs leading-tight">{mod.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {mod.inputs} In · {mod.outputs} Out
                        {mod.fields?.length ? ` · ${mod.fields.length} fld` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 ml-1 shrink-0">
                    <button
                      onClick={(e) => handleOpenEdit(mod, e)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded transition-colors cursor-pointer"
                      title="Edit custom module"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteCustomModule(mod.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                      title="Delete custom module"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite(mod.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-slate-300 dark:text-slate-600 hover:text-amber-500 p-1 rounded transition-colors cursor-pointer"
                      title={favorites.includes(mod.id) ? "Remove favorite mark" : "Mark as favorite"}
                    >
                      <Star
                        size={13}
                        className={
                          favorites.includes(mod.id)
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400"
                        }
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Built-in Categories */}
      {CATEGORIES.map(category => (
        <div key={category.name} className="mb-4">
          <button 
            onClick={() => toggleCategory(category.name)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {category.name}
            {openCategories[category.name] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openCategories[category.name] && (
            <div className="flex flex-col gap-2">
              {category.items.map(item => (
                <div
                  key={item.type}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md p-2 text-sm text-slate-700 dark:text-slate-200 cursor-grab hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group"
                  onDragStart={(event) => onDragStart(event, item.type)}
                  draggable
                >
                  <span>{item.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(item.type);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:scale-110 transition-all ml-2 cursor-pointer p-0.5 rounded focus:outline-none"
                    title={favorites.includes(item.type) ? "Remove favorite mark" : "Mark as favorite"}
                  >
                    <Star 
                      size={14} 
                      className={favorites.includes(item.type) ? "fill-amber-400 text-amber-500" : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400"} 
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <CustomModuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomModule}
        initialData={editingModule}
      />
    </div>
  );
}

export default function NodePalette() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="w-12 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-2 flex flex-col items-center shadow-sm shrink-0 transition-colors">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-1.5 hover:bg-slate-200 dark:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Expand Palette"
        >
          <Menu size={20} />
        </button>
        <div className="mt-4" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
           <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Equipment</span>
         </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto relative shrink-0 shadow-sm flex flex-col transition-colors">
      <div className="flex items-center justify-between p-4 pb-0 mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Equipment</h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Collapse Palette"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <NodePaletteContent />
    </div>
  );
}

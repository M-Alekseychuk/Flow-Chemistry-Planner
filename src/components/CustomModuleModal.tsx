import React, { useState, useRef, useEffect } from 'react';
import { CustomModuleTemplate, CustomModuleField } from '../types';
import { X, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Sliders, ArrowRightLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CustomModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: Omit<CustomModuleTemplate, 'id' | 'createdAt'>) => void;
  initialData?: CustomModuleTemplate | null;
}

const ICON_PRESETS: Array<{ id: CustomModuleTemplate['iconPreset']; label: string }> = [
  { id: 'generic', label: 'Generic Box' },
  { id: 'pump', label: 'Pump' },
  { id: 'reactor', label: 'Reactor Coil' },
  { id: 'vessel', label: 'Flask / Vessel' },
  { id: 'sensor', label: 'Sensor Gauge' },
  { id: 'valve', label: 'Multi-port Valve' },
];

export default function CustomModuleModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CustomModuleModalProps) {
  const [name, setName] = useState('Custom Pump');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageSize, setImageSize] = useState<number>(48);
  const [iconPreset, setIconPreset] = useState<CustomModuleTemplate['iconPreset']>('generic');
  const [inputs, setInputs] = useState<number>(1);
  const [outputs, setOutputs] = useState<number>(1);
  const [fields, setFields] = useState<CustomModuleField[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setImageUrl(initialData.imageUrl);
        setImageSize(initialData.imageSize ?? 48);
        setIconPreset(initialData.iconPreset || 'generic');
        setInputs(initialData.inputs);
        setOutputs(initialData.outputs);
        setFields(initialData.fields ? JSON.parse(JSON.stringify(initialData.fields)) : []);
      } else {
        setName('Special Pump');
        setDescription('');
        setImageUrl(undefined);
        setImageSize(48);
        setIconPreset('pump');
        setInputs(1);
        setOutputs(1);
        setFields([
          {
            id: uuidv4(),
            label: 'Q',
            type: 'number',
            unit: 'mL/min, uL/min',
            placeholder: '1.0',
            defaultValue: '',
            isFlowSource: true,
          },
        ]);
      }
      setUploadError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (file.type === 'image/svg+xml') {
        setImageUrl(result);
        return;
      }

      // Resize raster images to max 220x220 to keep localStorage fast & lightweight
      const img = new Image();
      img.onload = () => {
        const maxDim = 220;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          setImageUrl(canvas.toDataURL('image/png', 0.9));
        } else {
          setImageUrl(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const addPresetField = (preset: 'flow' | 'temp' | 'pressure' | 'volume' | 'rpm' | 'text' | 'select') => {
    const newField: CustomModuleField = {
      id: uuidv4(),
      label: '',
      type: 'text',
      unit: '',
      placeholder: '',
      defaultValue: '',
      isFlowSource: false,
    };

    if (preset === 'flow') {
      newField.label = 'Q';
      newField.type = 'number';
      newField.unit = 'mL/min, uL/min';
      newField.placeholder = '1.0';
      newField.isFlowSource = !fields.some((f) => f.isFlowSource);
    } else if (preset === 'temp') {
      newField.label = 'T';
      newField.type = 'number';
      newField.unit = '°C, K';
      newField.placeholder = '25';
    } else if (preset === 'pressure') {
      newField.label = 'P';
      newField.type = 'number';
      newField.unit = 'bar, psi';
      newField.placeholder = '5';
    } else if (preset === 'volume') {
      newField.label = 'Vol';
      newField.type = 'number';
      newField.unit = 'mL, µL';
      newField.placeholder = '10';
    } else if (preset === 'rpm') {
      newField.label = 'Speed';
      newField.type = 'number';
      newField.unit = 'rpm';
      newField.placeholder = '500';
    } else if (preset === 'text') {
      newField.label = 'Param';
      newField.type = 'text';
      newField.unit = '';
      newField.placeholder = 'Value';
    } else if (preset === 'select') {
      newField.label = 'Mode';
      newField.type = 'select';
      newField.unit = 'Mode A, Mode B';
      newField.options = ['Mode A', 'Mode B'];
    }

    setFields((prev) => [...prev, newField]);
  };

  const updateField = (id: string, patch: Partial<CustomModuleField>) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== id) {
          // Only one field needs to be flow source if user enables isFlowSource
          if (patch.isFlowSource) return { ...f, isFlowSource: false };
          return f;
        }
        const updated = { ...f, ...patch };
        if (updated.type === 'select' && typeof patch.unit === 'string') {
          updated.options = patch.unit
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return updated;
      })
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      imageUrl,
      imageSize,
      iconPreset,
      inputs,
      outputs,
      fields,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {initialData ? 'Edit Custom Module' : 'Create Custom Module'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Grid: Basic Info + Live Preview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {/* Left 3 cols: Name, Picture, In/Out Ports */}
            <div className="md:col-span-3 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Module Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Peristaltic Pump P-100, Ultrasonic Cell..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Picture Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Module Picture / Graphic
                </label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleImageUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={18} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {imageUrl ? 'Replace uploaded picture' : 'Upload picture (PNG, JPG, SVG)'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Click or drag & drop image file
                      </span>
                    </div>
                  </div>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl(undefined)}
                      className="px-2.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                )}

                {/* Image Size Adjustment Control */}
                {imageUrl && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Sliders size={13} className="text-emerald-600 dark:text-emerald-400" />
                        Image Size on Canvas
                      </label>
                      <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {imageSize} px
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: 'Compact', size: 36 },
                        { label: 'Default', size: 48 },
                        { label: 'Medium', size: 64 },
                        { label: 'Large', size: 88 },
                        { label: 'XL', size: 112 },
                      ].map((preset) => (
                        <button
                          key={preset.size}
                          type="button"
                          onClick={() => setImageSize(preset.size)}
                          className={`px-2 py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                            imageSize === preset.size
                              ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {preset.label} ({preset.size}px)
                        </button>
                      ))}
                    </div>

                    {/* Range slider + nudge buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setImageSize((s) => Math.max(24, s - 4))}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                        title="Smaller"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="24"
                        max="140"
                        step="2"
                        value={imageSize}
                        onChange={(e) => setImageSize(parseInt(e.target.value, 10))}
                        className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setImageSize((s) => Math.min(140, s + 4))}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                        title="Larger"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback Schematic Icon Selector when no image is uploaded */}
                {!imageUrl && (
                  <div className="mt-2">
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Or choose a fallback schematic symbol:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ICON_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setIconPreset(preset.id)}
                          className={`px-2 py-1 text-[11px] rounded-md border transition-colors cursor-pointer ${
                            iconPreset === preset.id
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Inlets & Outlets */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Inlet Ports (Left)
                  </label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setInputs(num)}
                        className={`flex-1 py-1 text-xs font-bold rounded border transition-colors cursor-pointer ${
                          inputs === num
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Outlet Ports (Right)
                  </label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOutputs(num)}
                        className={`flex-1 py-1 text-xs font-bold rounded border transition-colors cursor-pointer ${
                          outputs === num
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 2 cols: Live Node Preview */}
            <div className="md:col-span-2 flex flex-col">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Live Canvas Preview
              </label>
              <div className="flex-1 min-h-[180px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-35 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                  }}
                />
                {/* Simulated Node Card */}
                <div className="px-3 py-2 shadow-md rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 min-w-[85px] relative z-10 text-slate-800 dark:text-slate-100">
                  {/* Left Input Handles */}
                  {Array.from({ length: inputs }).map((_, idx) => (
                    <div
                      key={`in-${idx}`}
                      style={{ top: `${((idx + 1) * 100) / (inputs + 1)}%` }}
                      className="w-2 h-2 rounded-full bg-slate-500 absolute -left-1 -translate-y-1/2 border border-white dark:border-slate-900"
                      title={`Inlet ${idx + 1}`}
                    />
                  ))}

                  {/* Graphic */}
                  <div className="flex items-center justify-center min-h-[34px] my-1">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        style={{
                          maxHeight: `${imageSize}px`,
                          maxWidth: `${Math.round(imageSize * 1.8)}px`,
                        }}
                        className="w-auto h-auto object-contain rounded transition-all duration-150"
                      />
                    ) : (
                      <div className="w-9 h-8 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                        {iconPreset?.slice(0, 4)}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 text-center max-w-[110px] truncate">
                    {name || 'Module Name'}
                  </span>

                  {/* Fields Preview */}
                  {fields.length > 0 && (
                    <div className="flex flex-col gap-1 w-full mt-1">
                      {fields.map((f) => {
                        const unitList = f.unit
                          ? f.unit.split(',').map((u) => u.trim()).filter(Boolean)
                          : [];
                        return (
                          <div
                            key={f.id}
                            className="flex items-center justify-between gap-1 text-[8px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"
                          >
                            {f.label && (
                              <span className="text-slate-400 font-mono">{f.label}</span>
                            )}
                            <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">
                              {f.type === 'select'
                                ? unitList[0] || 'Option'
                                : f.placeholder || (f.type === 'number' ? '0' : '...')}
                            </span>
                            {f.type !== 'select' && unitList.length > 0 && (
                              <span className="text-slate-400 font-mono border-l border-slate-200 dark:border-slate-700 pl-1">
                                {unitList[0]}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <span className="text-[8px] text-slate-400 mt-0.5">+ Note</span>

                  {/* Right Output Handles */}
                  {Array.from({ length: outputs }).map((_, idx) => (
                    <div
                      key={`out-${idx}`}
                      style={{ top: `${((idx + 1) * 100) / (outputs + 1)}%` }}
                      className="w-2 h-2 rounded-full bg-emerald-500 absolute -right-1 -translate-y-1/2 border border-white dark:border-slate-900"
                      title={`Outlet ${idx + 1}`}
                    />
                  ))}
                </div>

                <span className="text-[10px] text-slate-400 mt-3 z-10">
                  {inputs} In · {outputs} Out · {fields.length} Field{fields.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Custom Text & Parameter Fields */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders size={13} className="text-emerald-500" />
                  Module Input Fields & Parameters
                </h3>
                <p className="text-[11px] text-slate-400">
                  Define what text boxes, numbers, or unit selectors appear on this module.
                </p>
              </div>
            </div>

            {/* Quick-add buttons */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => addPresetField('flow')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Flow Rate (Q)
              </button>
              <button
                type="button"
                onClick={() => addPresetField('temp')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Temperature (T)
              </button>
              <button
                type="button"
                onClick={() => addPresetField('pressure')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Pressure (P)
              </button>
              <button
                type="button"
                onClick={() => addPresetField('volume')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Volume (Vol)
              </button>
              <button
                type="button"
                onClick={() => addPresetField('rpm')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Speed (RPM)
              </button>
              <button
                type="button"
                onClick={() => addPresetField('text')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Custom Text Field
              </button>
              <button
                type="button"
                onClick={() => addPresetField('select')}
                className="px-2 py-1 text-xs font-medium rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Dropdown List
              </button>
            </div>

            {/* Field rows */}
            {fields.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No fields added yet. Click one of the buttons above to add text or numeric inputs to your module.
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs"
                  >
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="e.g. Q, RPM, Name"
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as CustomModuleField['type'],
                            isFlowSource: e.target.value === 'number' ? field.isFlowSource : false,
                          })
                        }
                        className="w-full px-1.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      >
                        <option value="number">Number</option>
                        <option value="text">Text</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        {field.type === 'select' ? 'Choices (comma-separated)' : 'Unit(s) (comma-separated)'}
                      </label>
                      <input
                        type="text"
                        value={field.unit || ''}
                        onChange={(e) => updateField(field.id, { unit: e.target.value })}
                        placeholder={field.type === 'select' ? 'Option A, Option B' : 'e.g. mL/min, uL/min or rpm'}
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="0"
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>

                    <div className="col-span-1 flex flex-col items-end justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                        title="Remove field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {field.type === 'number' && (
                      <div className="col-span-12 flex items-center gap-2 pt-0.5">
                        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(field.isFlowSource)}
                            onChange={(e) => updateField(field.id, { isFlowSource: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>
                            Use this value as a <strong>Pump Flow Rate Source</strong> in tubing simulations
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

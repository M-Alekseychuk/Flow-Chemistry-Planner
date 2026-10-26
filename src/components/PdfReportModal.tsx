import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { X, Upload, Camera, Image as ImageIcon, Trash2, FileText, Check, Download, Layers } from 'lucide-react';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (setupPhoto: string | null, setupPhotoCaption: string) => Promise<void>;
  project: Project | null;
  nodesCount: number;
  isExporting: boolean;
}

export default function PdfReportModal({
  isOpen,
  onClose,
  onExport,
  project,
  nodesCount,
  isExporting,
}: PdfReportModalProps) {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(
    (project?.flowData as any)?.setupPhoto || null
  );
  const [caption, setCaption] = useState<string>(
    (project?.flowData as any)?.setupPhotoCaption || ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setCaption('');
  };

  const handleGenerate = async () => {
    await onExport(photoDataUrl, caption);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Export PDF Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheme diagram with optional laboratory setup photo attached at the end
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Document Layout Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
                Document Structure
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {photoDataUrl ? '2 Pages Total' : '1 Page'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Page 1</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Flow Scheme Diagram</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {nodesCount} modules configured
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border transition-all ${
                  photoDataUrl
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80'
                    : 'bg-white/60 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Page 2 (Attached)</span>
                  {photoDataUrl && <Check size={12} className="text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px]">
                  {photoDataUrl ? 'Actual Setup Photo' : 'No photo attached yet'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {photoDataUrl ? 'Attached at document end' : 'Optional'}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Attachment Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera size={14} className="text-emerald-600 dark:text-emerald-400" />
                Attach Photo of Actual Setup (Optional)
              </span>
              {photoDataUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Remove Photo</span>
                </button>
              )}
            </label>

            {!photoDataUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={onFileInputChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Upload size={18} />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-0.5">
                  Click or drag &amp; drop setup photo here
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Attach a picture of your physical reactor rig or laboratory assembly. It will appear at the end of the PDF right after the flow scheme.
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Supports PNG, JPG, WebP
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Photo Preview */}
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 overflow-hidden flex items-center justify-center">
                  <img
                    src={photoDataUrl}
                    alt="Actual Laboratory Setup"
                    className="max-h-56 w-auto max-w-full object-contain rounded-lg shadow-xs"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-700 dark:text-slate-200 backdrop-blur-xs rounded-md shadow-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                    >
                      Change Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={onFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Caption Input */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Photo Caption / Equipment Notes (Printed beneath picture)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Continuous coiled tube reactor setup in Hood 2 with HPLC pump and 10 bar BPR"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="h-8 px-3.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isExporting}
            className="h-8 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span>{isExporting ? 'Generating PDF...' : photoDataUrl ? 'Generate PDF with Setup Photo' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

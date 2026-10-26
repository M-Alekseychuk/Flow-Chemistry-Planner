import React, { useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import {
  processImageFileToBase64,
  DEFAULT_LOGO_URL,
  DEFAULT_FALLBACK_SVG,
  DEFAULT_LOGO_HEIGHT,
  MIN_LOGO_HEIGHT,
  MAX_LOGO_HEIGHT,
} from '../lib/branding';
import {
  Palette,
  Upload,
  RotateCcw,
  Check,
  X,
  FileImage,
  Eye,
  ShieldCheck,
  Sun,
  Moon,
  Grid,
  Maximize2,
  Sliders,
  BookmarkCheck,
} from 'lucide-react';

export default function BrandingModal() {
  const {
    customLogo,
    systemDefaultLogo,
    activeLogo,
    setCustomLogo,
    resetCustomLogo,
    setSystemDefaultLogo,
    isBrandingModalOpen,
    setIsBrandingModalOpen,
    logoHeight = DEFAULT_LOGO_HEIGHT,
    setLogoHeight,
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedLogo, setStagedLogo] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'grid'>('light');
  const [imageMeta, setImageMeta] = useState<{
    width?: number;
    height?: number;
    format?: string;
    sizeKB?: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isBrandingModalOpen) return null;

  const currentEffectiveLogo = stagedLogo || activeLogo || DEFAULT_LOGO_URL;
  const isCustomActive = Boolean(customLogo);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    try {
      const result = await processImageFileToBase64(file, 1400, 4);
      setStagedLogo(result.dataUrl);
      setImageMeta({
        width: result.width,
        height: result.height,
        format: result.format,
        sizeKB: Math.round(file.size / 1024),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image file.');
    }
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

  const handleSave = () => {
    if (stagedLogo) {
      setCustomLogo(stagedLogo);
      setStagedLogo(null);
      setSuccessToast('Custom logo saved successfully! Reports and headers updated.');
      setTimeout(() => {
        setSuccessToast(null);
        setIsBrandingModalOpen(false);
      }, 1200);
    } else {
      setIsBrandingModalOpen(false);
    }
  };

  const handleSetAsDefault = () => {
    const targetLogo = stagedLogo || customLogo || activeLogo;
    if (targetLogo) {
      setSystemDefaultLogo(targetLogo);
      if (stagedLogo) {
        setCustomLogo(stagedLogo);
        setStagedLogo(null);
      }
      setSuccessToast('Current logo saved as the permanent software default!');
      setTimeout(() => {
        setSuccessToast(null);
      }, 2500);
    }
  };

  const handleResetToDefault = () => {
    resetCustomLogo();
    setLogoHeight(DEFAULT_LOGO_HEIGHT);
    setStagedLogo(null);
    setImageMeta(null);
    setSuccessToast('Reset to default built-in logo and standard size.');
    setTimeout(() => {
      setSuccessToast(null);
      setIsBrandingModalOpen(false);
    }, 1200);
  };

  const handleClose = () => {
    setStagedLogo(null);
    setErrorMsg(null);
    setIsBrandingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Organization &amp; Lab Branding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize the application logo and size for the header, canvas, and exported lab reports
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Success Banner */}
          {successToast && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3.5 py-2.5 rounded-lg text-xs font-semibold animate-fadeIn">
              <Check size={16} />
              <span>{successToast}</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Current Branding Status:
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                stagedLogo
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : isCustomActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {stagedLogo
                ? 'Unsaved Preview'
                : isCustomActive
                ? 'Custom Organization Logo Active'
                : systemDefaultLogo
                ? 'Permanent System Default Active'
                : 'Default Logo Active (OPCP - Open Process Chemistry Project)'}
            </span>
          </div>

          {/* Live Preview Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Eye size={13} className="text-emerald-600 dark:text-emerald-400" />
                Live Logo Preview
              </span>
              {/* Background Theme Switcher for Preview */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    previewBg === 'light'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Preview on Light background"
                >
                  <Sun size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    previewBg === 'dark'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Preview on Dark background"
                >
                  <Moon size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('grid')}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    previewBg === 'grid'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Preview on Transparent / Checkerboard grid"
                >
                  <Grid size={12} />
                </button>
              </div>
            </div>

            <div
              className={`h-32 flex items-center justify-center p-4 transition-colors ${
                previewBg === 'light'
                  ? 'bg-white'
                  : previewBg === 'dark'
                  ? 'bg-slate-900'
                  : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 dark:bg-slate-950'
              }`}
            >
              <img
                src={currentEffectiveLogo}
                alt="Active Logo Preview"
                style={{ height: `${Math.min(logoHeight * 1.3, 100)}px` }}
                className="max-h-24 max-w-[320px] w-auto h-auto object-contain transition-all duration-150"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FALLBACK_SVG;
                }}
              />
            </div>

            {imageMeta && (
              <div className="px-3 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {imageMeta.format} • {imageMeta.width}×{imageMeta.height}px
                </span>
                <span>{imageMeta.sizeKB} KB (Stored in offline localStorage)</span>
              </div>
            )}
          </div>

          {/* Logo Display Size Control Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Logo Size &amp; Scale
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  {logoHeight}px
                </span>
                {logoHeight !== DEFAULT_LOGO_HEIGHT && (
                  <button
                    type="button"
                    onClick={() => setLogoHeight(DEFAULT_LOGO_HEIGHT)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    title="Reset size to default 36px"
                  >
                    Reset Size
                  </button>
                )}
              </div>
            </div>

            {/* Slider with Percentage Delta */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Smaller ({MIN_LOGO_HEIGHT}px)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {logoHeight === DEFAULT_LOGO_HEIGHT
                    ? 'Default Size (36px)'
                    : logoHeight > DEFAULT_LOGO_HEIGHT
                    ? `+${Math.round(((logoHeight - DEFAULT_LOGO_HEIGHT) / DEFAULT_LOGO_HEIGHT) * 100)}% Larger`
                    : `-${Math.round(((DEFAULT_LOGO_HEIGHT - logoHeight) / DEFAULT_LOGO_HEIGHT) * 100)}% Smaller`}
                </span>
                <span>Bigger ({MAX_LOGO_HEIGHT}px)</span>
              </div>
              <input
                type="range"
                min={MIN_LOGO_HEIGHT}
                max={MAX_LOGO_HEIGHT}
                step={2}
                value={logoHeight}
                onChange={(e) => setLogoHeight(Number(e.target.value))}
                className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Quick Size Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1 font-medium">Presets:</span>
              {[
                { label: 'Compact', size: 28 },
                { label: 'Default', size: 36 },
                { label: 'Medium', size: 44 },
                { label: 'Large', size: 52 },
                { label: 'Extra Large', size: 60 },
              ].map((preset) => (
                <button
                  key={preset.size}
                  type="button"
                  onClick={() => setLogoHeight(preset.size)}
                  className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors cursor-pointer ${
                    logoHeight === preset.size
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {preset.label} ({preset.size}px)
                </button>
              ))}
            </div>

            {/* Simulated Header Scale Appearance */}
            <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center justify-between">
                <span>Application Header Appearance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono lowercase">live responsive</span>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-sky-300 via-sky-200 to-emerald-300 dark:from-slate-800 dark:to-emerald-950/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between overflow-hidden shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white/95 rounded-md px-2 py-0.5 shadow-2xs flex items-center justify-center border border-white/60">
                    <img
                      src={currentEffectiveLogo}
                      alt="Header Preview"
                      style={{ height: `${logoHeight}px`, maxHeight: `${logoHeight}px` }}
                      className="max-w-[200px] w-auto object-contain transition-all duration-150"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_FALLBACK_SVG;
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Flow Chemistry Designer
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-blue-300/80 bg-blue-50/90 text-blue-600 dark:bg-blue-950/60 dark:border-blue-700/60 dark:text-blue-300">
                      v1.2.0
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                  Header View
                </span>
              </div>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              onChange={onFileInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Upload size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drag &amp; drop your logo file
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                PNG, SVG, JPG, or WebP • Read as self-contained Base64 data
              </span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg p-2.5">
              {errorMsg}
            </p>
          )}

          {/* Environment & Report Integration Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-900 dark:text-emerald-200">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="leading-relaxed">
              <strong>Offline &amp; Report Ready:</strong> Your logo is converted client-side into a self-contained Base64 Data URL and stored in <code className="font-mono bg-emerald-100/80 dark:bg-emerald-900/80 px-1 py-0.5 rounded">localStorage</code> under <code className="font-mono bg-emerald-100/80 dark:bg-emerald-900/80 px-1 py-0.5 rounded">app_custom_logo</code>. It works completely offline with zero CORS restrictions in both web browsers and desktop Electron builds, and is embedded into all exported PDF and HTML lab reports.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div>
            {(isCustomActive || stagedLogo) && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="h-8 flex items-center gap-1.5 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-red-300 transition-colors cursor-pointer"
                title="Reset to default built-in logo"
              >
                <RotateCcw size={13} />
                <span>Reset to Default Logo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetAsDefault}
              className="h-8 flex items-center gap-1.5 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100/70 transition-colors cursor-pointer"
              title="Save the currently displayed logo as the permanent software default"
            >
              <BookmarkCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Make Default</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="h-8 flex items-center px-3.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!stagedLogo && !isCustomActive}
              className={`h-8 flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer ${
                stagedLogo
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check size={14} />
              <span>Save as Active Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

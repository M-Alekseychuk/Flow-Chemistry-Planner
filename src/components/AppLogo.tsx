import React from 'react';
import { useAppContext } from '../AppContext';
import { DEFAULT_FALLBACK_SVG } from '../lib/branding';
import { Camera, Sparkles } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  maxHeight?: string;
  showCustomizeHint?: boolean;
}

export default function AppLogo({
  className = '',
  maxHeight,
  showCustomizeHint = true,
}: AppLogoProps) {
  const { activeLogo, customLogo, setIsBrandingModalOpen, logoHeight = 36 } = useAppContext();

  // If maxHeight prop is provided (e.g. in reports or miniature cards), use that; otherwise use reactive logoHeight
  const imgStyle = maxHeight ? {} : { height: `${logoHeight}px`, maxHeight: `${logoHeight}px` };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsBrandingModalOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsBrandingModalOpen(true);
        }
      }}
      className={`group relative flex items-center justify-center bg-white/95 dark:bg-white/95 rounded-lg px-2 py-1 shadow-2xs border border-white/60 dark:border-slate-700/60 transition-all hover:shadow-sm hover:scale-[1.02] cursor-pointer shrink-0 select-none mr-3 ${className}`}
      title="Click to customize application branding logo and size"
    >
      <img
        src={activeLogo}
        alt="Flow Chemistry Designer Branding Logo"
        style={imgStyle}
        className={`${maxHeight ? maxHeight : ''} max-w-[280px] w-auto h-auto object-contain transition-all duration-150`}
        onError={(e) => {
          e.currentTarget.src = DEFAULT_FALLBACK_SVG;
        }}
      />

      {showCustomizeHint && (
        <div className="absolute inset-0 bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white backdrop-blur-[2px] transition-opacity duration-150 shadow-md">
          <Camera size={13} className="text-emerald-400" />
          <span>Change Logo &amp; Size</span>
        </div>
      )}

      {customLogo && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"
          title="Custom organization logo active"
        />
      )}
    </div>
  );
}

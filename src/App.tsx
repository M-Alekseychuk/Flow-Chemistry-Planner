import React from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppLogo from './components/AppLogo';
import BrandingModal from './components/BrandingModal';
import ChemistryToolsModal from './components/chemistryTools/ChemistryToolsModal';
import { AppProvider, useAppContext } from './AppContext';
import { ArrowLeft, Sun, Moon, Grid, Palette } from 'lucide-react';

const MainLayout = () => {
  const {
    currentProjectId,
    closeProject,
    currentProject,
    isDarkMode,
    toggleDarkMode,
    flowRateUnit,
    toggleFlowRateUnit,
    isGridSnap,
    toggleGridSnap,
    isMultiColorStreams,
    toggleStreamColorMode,
  } = useAppContext();

  return (
    <div className={`flex flex-col h-screen font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-800'}`}>
      {/* Header */}
      <header className={`min-h-14 py-1.5 flex items-center px-4 sm:px-6 shadow-md z-10 shrink-0 border-b transition-colors ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-800 to-emerald-950 border-emerald-900/50 text-slate-100' 
          : 'bg-gradient-to-r from-sky-300 to-emerald-300 border-sky-400/20 text-slate-900'
      }`}>
        <AppLogo />
        
        {currentProjectId && (
          <button 
            onClick={closeProject}
            className={`h-8 w-8 flex items-center justify-center mr-3 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-700/60 text-slate-200' : 'hover:bg-black/10 text-slate-900'
            }`}
            title="Back to Projects"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className={`text-xl font-semibold tracking-wide flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <span className="hidden sm:inline">Flow Chemistry Designer</span>
          <span className="sm:hidden">Flow Chem</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-blue-300/80 bg-blue-50/90 text-blue-600 dark:bg-blue-950/60 dark:border-blue-700/60 dark:text-blue-300">
            v1.0.0
          </span>
          {currentProjectId && currentProject && (
            <span className={`text-sm font-normal px-2 py-0.5 rounded ml-1 truncate max-w-[140px] md:max-w-[240px] ${
              isDarkMode ? 'bg-slate-700/80 text-emerald-300' : 'bg-black/15 text-slate-900'
            }`}>
              {currentProject.name}
            </span>
          )}
        </h1>
        <div className="ml-auto text-sm flex items-center gap-2 sm:gap-3">
          <span className={`hidden xl:inline ${isDarkMode ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
            Process Design &amp; Stoichiometry
          </span>
          <button
            onClick={toggleFlowRateUnit}
            className={`h-8 px-3 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isDarkMode 
                ? 'bg-emerald-950/80 border-emerald-800 hover:bg-emerald-900 text-emerald-300 shadow-inner' 
                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800 shadow-sm'
            }`}
            title="Toggle Flow Rate Display Unit (mL/min <-> L/h)"
          >
            <span className="font-mono">{flowRateUnit}</span>
          </button>
          <button
            onClick={toggleGridSnap}
            className={`h-8 px-3 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isGridSnap
                ? isDarkMode
                  ? 'bg-emerald-950/80 border-emerald-800 hover:bg-emerald-900 text-emerald-300 shadow-inner'
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800 shadow-sm'
                : isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-400 opacity-70'
                  : 'bg-white/60 border-slate-200 hover:bg-white/80 text-slate-500 opacity-70'
            }`}
            title={isGridSnap ? 'Grid Snap: On (Click to turn off)' : 'Grid Snap: Off (Click to turn on)'}
          >
            <Grid size={15} className={isGridSnap ? (isDarkMode ? 'text-emerald-300' : 'text-emerald-600') : 'text-slate-400'} />
            <span className="hidden sm:inline">Grid Snap: {isGridSnap ? 'On' : 'Off'}</span>
          </button>
          <button
            onClick={toggleStreamColorMode}
            className={`h-8 px-3 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isMultiColorStreams
                ? isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-300'
                  : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700 shadow-sm'
                : isDarkMode
                  ? 'bg-blue-950/80 border-blue-800 hover:bg-blue-900 text-blue-300 shadow-inner'
                  : 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-900 shadow-sm'
            }`}
            title={isMultiColorStreams ? 'Stream Colors: Multi-Color (Click for Color-Blind Friendly Uniform Blue)' : 'Stream Colors: Uniform (Color-Blind Friendly Cobalt Blue - Click for Multi-Color)'}
          >
            <Palette size={15} className={!isMultiColorStreams ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') : 'text-slate-400'} />
            <span className="hidden sm:inline">Streams: {isMultiColorStreams ? 'Multi-Color' : 'Uniform (Accessible)'}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className={`h-8 px-3 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-300 shadow-inner' 
                : 'bg-white/80 border-slate-200/80 hover:bg-white text-slate-700 shadow-sm'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <>
                <Sun size={16} className="text-amber-400" />
                <span className="hidden md:inline text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-slate-700" />
                <span className="hidden md:inline text-slate-700">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      {currentProjectId ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Center: Canvas */}
          <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 transition-colors">
            <FlowCanvas />
          </div>
        </div>
      ) : (
        <Dashboard />
      )}

      {/* Organization & Lab Branding Modal */}
      <BrandingModal />

      {/* Chemistry Engineering Tools Modal */}
      <ChemistryToolsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

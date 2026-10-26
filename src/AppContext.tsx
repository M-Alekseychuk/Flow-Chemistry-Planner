import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, CustomModuleTemplate } from './types';
import { v4 as uuidv4 } from 'uuid';
import {
  getStoredCustomLogo,
  setStoredCustomLogo,
  removeStoredCustomLogo,
  getStoredSystemDefaultLogo,
  setStoredSystemDefaultLogo,
  getActiveLogo,
  CUSTOM_LOGO_STORAGE_KEY,
  SYSTEM_DEFAULT_LOGO_KEY,
  getStoredLogoHeight,
  setStoredLogoHeight,
  CUSTOM_LOGO_HEIGHT_KEY,
  DEFAULT_LOGO_HEIGHT,
} from './lib/branding';

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  const [stoiRows, setStoiRows] = useState([
    { id: 1, name: 'Reagent 1', conc: 1.0, flow: 1.0, isLimiting: true }
  ]);

  // Customizable Branding Logo State
  const [customLogo, setCustomLogoState] = useState<string | null>(() => getStoredCustomLogo());
  const [systemDefaultLogo, setSystemDefaultLogoState] = useState<string | null>(() => getStoredSystemDefaultLogo());
  const [logoHeight, setLogoHeightState] = useState<number>(() => getStoredLogoHeight());
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  // Sync custom logo, system default logo, and logo height across windows / tabs / events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CUSTOM_LOGO_STORAGE_KEY) {
        setCustomLogoState(getStoredCustomLogo());
      } else if (e.key === SYSTEM_DEFAULT_LOGO_KEY) {
        setSystemDefaultLogoState(getStoredSystemDefaultLogo());
      } else if (e.key === CUSTOM_LOGO_HEIGHT_KEY) {
        setLogoHeightState(getStoredLogoHeight());
      }
    };
    const handleCustomEvent = (e: any) => {
      setCustomLogoState(e.detail || null);
    };
    const handleDefaultLogoEvent = (e: any) => {
      setSystemDefaultLogoState(e.detail || null);
    };
    const handleHeightEvent = (e: any) => {
      setLogoHeightState(typeof e.detail === 'number' ? e.detail : DEFAULT_LOGO_HEIGHT);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('app_custom_logo_changed', handleCustomEvent as EventListener);
    window.addEventListener('app_default_logo_changed', handleDefaultLogoEvent as EventListener);
    window.addEventListener('app_logo_height_changed', handleHeightEvent as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('app_custom_logo_changed', handleCustomEvent as EventListener);
      window.removeEventListener('app_default_logo_changed', handleDefaultLogoEvent as EventListener);
      window.removeEventListener('app_logo_height_changed', handleHeightEvent as EventListener);
    };
  }, []);

  const setCustomLogo = (dataUrl: string) => {
    setStoredCustomLogo(dataUrl);
    setCustomLogoState(dataUrl);
  };

  const setSystemDefaultLogo = (dataUrl: string) => {
    setStoredSystemDefaultLogo(dataUrl);
    setSystemDefaultLogoState(dataUrl);
  };

  const resetCustomLogo = () => {
    removeStoredCustomLogo();
    setCustomLogoState(null);
  };

  const setLogoHeight = (height: number) => {
    setStoredLogoHeight(height);
    setLogoHeightState(height);
  };

  const activeLogo = getActiveLogo(customLogo);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('flow-projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.filter(p => {
            if (!p || !p.id || seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [deletedProjects, setDeletedProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('flow-deleted-projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.filter(p => {
            if (!p || !p.id || seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('flow-darkmode');
    return saved === 'true';
  });

  const [isGridSnap, setIsGridSnap] = useState<boolean>(() => {
    const saved = localStorage.getItem('flow-grid-snap');
    return saved !== 'false'; // Default to enabled
  });

  const [flowRateUnit, setFlowRateUnit] = useState<'mL/min' | 'L/h'>(() => {
    const saved = localStorage.getItem('flow-rate-unit');
    return (saved === 'L/h' ? 'L/h' : 'mL/min');
  });

  useEffect(() => {
    localStorage.setItem('flow-grid-snap', isGridSnap ? 'true' : 'false');
  }, [isGridSnap]);

  const toggleGridSnap = () => {
    setIsGridSnap(prev => !prev);
  };

  const [isMultiColorStreams, setIsMultiColorStreams] = useState<boolean>(() => {
    const saved = localStorage.getItem('flow-stream-colors-mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('flow-stream-colors-mode', isMultiColorStreams ? 'true' : 'false');
  }, [isMultiColorStreams]);

  const toggleStreamColorMode = () => {
    setIsMultiColorStreams(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('flow-rate-unit', flowRateUnit);
  }, [flowRateUnit]);

  const toggleFlowRateUnit = () => {
    setFlowRateUnit(prev => prev === 'mL/min' ? 'L/h' : 'mL/min');
  };

  useEffect(() => {
    localStorage.setItem('flow-darkmode', isDarkMode ? 'true' : 'false');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('flow-favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('flow-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (nodeType: string) => {
    setFavorites(prev => 
      prev.includes(nodeType) ? prev.filter(t => t !== nodeType) : [...prev, nodeType]
    );
  };

  const [customModules, setCustomModules] = useState<CustomModuleTemplate[]>(() => {
    const saved = localStorage.getItem('flow-custom-modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('flow-custom-modules', JSON.stringify(customModules));
    } catch (e) {
      console.error('Failed to save custom modules to localStorage:', e);
    }
  }, [customModules]);

  const addCustomModule = useCallback((moduleData: Omit<CustomModuleTemplate, 'id' | 'createdAt'>) => {
    const newMod: CustomModuleTemplate = {
      ...moduleData,
      id: `custom_${uuidv4()}`,
      createdAt: Date.now(),
    };
    setCustomModules(prev => [...prev, newMod]);
    return newMod;
  }, []);

  const updateCustomModule = useCallback((id: string, moduleData: Partial<CustomModuleTemplate>) => {
    setCustomModules(prev => prev.map(m => m.id === id ? { ...m, ...moduleData } : m));
  }, []);

  const deleteCustomModule = useCallback((id: string) => {
    setCustomModules(prev => prev.filter(m => m.id !== id));
    setFavorites(prev => prev.filter(f => f !== id));
  }, []);

  const importCustomModules = useCallback((modulesToImport: CustomModuleTemplate[]) => {
    if (!modulesToImport || !Array.isArray(modulesToImport) || modulesToImport.length === 0) return;
    setCustomModules(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const existingNames = new Map(prev.map(m => [m.name?.trim().toLowerCase(), m]));
      const newModules = [...prev];
      let changed = false;

      for (const rawMod of modulesToImport) {
        if (!rawMod || typeof rawMod !== 'object' || !rawMod.name) continue;
        
        const modNameKey = rawMod.name.trim().toLowerCase();
        const modId = rawMod.id || `custom_${uuidv4()}`;

        if (existingIds.has(modId) || existingNames.has(modNameKey)) {
          continue;
        }

        const normalizedMod: CustomModuleTemplate = {
          id: modId,
          name: rawMod.name.trim(),
          description: rawMod.description || '',
          imageUrl: rawMod.imageUrl || undefined,
          imageSize: typeof rawMod.imageSize === 'number' ? rawMod.imageSize : 48,
          iconPreset: rawMod.iconPreset || 'generic',
          inputs: typeof rawMod.inputs === 'number' ? rawMod.inputs : 1,
          outputs: typeof rawMod.outputs === 'number' ? rawMod.outputs : 1,
          fields: Array.isArray(rawMod.fields) ? rawMod.fields : [],
          createdAt: rawMod.createdAt || Date.now(),
        };

        newModules.push(normalizedMod);
        existingIds.add(modId);
        existingNames.set(modNameKey, normalizedMod);
        changed = true;
      }

      return changed ? newModules : prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('flow-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('flow-deleted-projects', JSON.stringify(deletedProjects));
  }, [deletedProjects]);

  const saveProject = useCallback((projectData: Partial<Project>) => {
    setCurrentProjectId(currId => {
      const effectiveId = currId || projectData.id;
      if (effectiveId) {
        setProjects(prev => {
          const exists = prev.some(p => p.id === effectiveId);
          if (exists) {
            return prev.map(p => 
              p.id === effectiveId ? { ...p, ...projectData, updatedAt: Date.now() } : p
            );
          } else {
            const newProject: Project = {
              id: effectiveId,
              name: projectData.name || 'Untitled Project',
              createdAt: projectData.createdAt || Date.now(),
              updatedAt: Date.now(),
              comments: projectData.comments || '',
              flowData: projectData.flowData || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 }, stoiRows: [] }
            };
            return [...prev.filter(p => p.id !== effectiveId), newProject];
          }
        });
        return effectiveId;
      } else {
        const newId = uuidv4();
        const newProject: Project = {
          id: newId,
          name: projectData.name || 'Untitled Project',
          createdAt: projectData.createdAt || Date.now(),
          updatedAt: Date.now(),
          comments: projectData.comments || '',
          flowData: projectData.flowData || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 }, stoiRows: [] }
        };
        setProjects(prev => [...prev.filter(p => p.id !== newId), newProject]);
        return newId;
      }
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const targetProject = prev.find(p => p.id === id);
      if (targetProject) {
        const deletedItem = { ...targetProject, deletedAt: Date.now() };
        setDeletedProjects(dPrev => [...dPrev.filter(dp => dp.id !== id), deletedItem]);
      }
      return prev.filter(p => p.id !== id);
    });
    setCurrentProjectId(currId => currId === id ? null : currId);
  }, []);

  const restoreProject = useCallback((id: string) => {
    setDeletedProjects(dPrev => {
      const targetProject = dPrev.find(p => p.id === id);
      if (targetProject) {
        const { deletedAt, ...restoredItem } = targetProject;
        setProjects(prev => [...prev.filter(p => p.id !== id), restoredItem]);
      }
      return dPrev.filter(p => p.id !== id);
    });
  }, []);

  const permanentlyDeleteProject = useCallback((id: string) => {
    setDeletedProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const emptyBin = useCallback(() => {
    setDeletedProjects([]);
  }, []);

  const openProject = useCallback((id: string) => {
    setCurrentProjectId(id);
    setProjects(prev => {
      const project = prev.find(p => p.id === id);
      if (project) {
        if (project.flowData.stoiRows) {
          setStoiRows(project.flowData.stoiRows);
        }
        const explicitModules = Array.isArray(project.flowData.customModules) ? project.flowData.customModules : [];
        const nodeModules = (project.flowData.nodes || [])
          .filter((n: any) => n.type === 'customModule' && n.data?.customConfig)
          .map((n: any) => n.data.customConfig);
        const allMods = [...explicitModules, ...nodeModules];
        if (allMods.length > 0) {
          importCustomModules(allMods);
        }
      }
      return prev;
    });
  }, [importCustomModules]);

  const closeProject = useCallback(() => {
    setCurrentProjectId(null);
  }, []);

  const updateProjectMeta = useCallback((id: string, name: string, comments: string) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, name, comments, updatedAt: Date.now() } : p
    ));
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  return (
    <AppContext.Provider value={{ 
      stoiRows, setStoiRows,
      projects, deletedProjects, currentProjectId, currentProject,
      saveProject, deleteProject, restoreProject, permanentlyDeleteProject, emptyBin, openProject, closeProject, updateProjectMeta,
      favorites, toggleFavorite,
      customModules, addCustomModule, updateCustomModule, deleteCustomModule, importCustomModules,
      isDarkMode, toggleDarkMode,
      flowRateUnit, toggleFlowRateUnit,
      isGridSnap, toggleGridSnap,
      isMultiColorStreams, toggleStreamColorMode, setIsMultiColorStreams,
      customLogo, systemDefaultLogo, activeLogo, setCustomLogo, resetCustomLogo, setSystemDefaultLogo,
      logoHeight, setLogoHeight,
      isBrandingModalOpen, setIsBrandingModalOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { Project } from '../types';
import { Plus, Trash2, Edit3, FolderOpen, RotateCcw, Archive, AlertTriangle, Check, Undo2, FlaskConical, Upload } from 'lucide-react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { CustomNodes, edgeTypes } from './CustomNodes';
import ChemistryToolsHub from './chemistryTools/ChemistryToolsHub';
import { v4 as uuidv4 } from 'uuid';

const MiniCanvas = ({ project }: { project: Project }) => {
  const nodes = useMemo(() => {
    const raw = project.flowData?.nodes || [];
    const seen = new Set<string>();
    return raw.filter((n: any) => {
      if (!n || !n.id || seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }, [project.flowData?.nodes]);

  const edges = useMemo(() => {
    const raw = project.flowData?.edges || [];
    const seen = new Set<string>();
    return raw.filter((e: any) => {
      if (!e || !e.id || seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [project.flowData?.edges]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 pointer-events-none relative overflow-hidden rounded-l-md border-r border-slate-200 dark:border-slate-800">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={CustomNodes}
          edgeTypes={edgeTypes}
          fitView
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          elementsSelectable={false}
          nodesConnectable={false}
          nodesDraggable={false}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default function Dashboard() {
  const { 
    projects, 
    deletedProjects, 
    saveProject, 
    deleteProject, 
    restoreProject, 
    permanentlyDeleteProject, 
    emptyBin, 
    openProject, 
    updateProjectMeta,
    customLogo,
    importCustomModules,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'projects' | 'bin' | 'tools'>('projects');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editComments, setEditComments] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; undoId?: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const uniqueProjects = useMemo(() => {
    const seen = new Set<string>();
    return (projects || []).filter(p => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [projects]);

  const uniqueDeletedProjects = useMemo(() => {
    const seen = new Set<string>();
    return (deletedProjects || []).filter(p => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [deletedProjects]);

  const showToast = (text: string, undoId?: string) => {
    setToastMessage({ text, undoId });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleCreateNew = () => {
    saveProject({
      name: 'New Project',
      comments: ''
    });
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow && (flow.nodes || flow.flowData?.nodes)) {
            const rawFileName = file.name.replace(/\.json$/i, '');
            const cleanName = rawFileName.replace(/^Flow_Designer_/i, '').replace(/_/g, ' ') || 'Imported Project';

            const nodes = flow.nodes || flow.flowData?.nodes || [];
            const edges = flow.edges || flow.flowData?.edges || [];
            const viewport = flow.viewport || flow.flowData?.viewport || { x: 0, y: 0, zoom: 1 };
            let stoiRows = flow.stoiRows || flow.flowData?.stoiRows || [];

            // If stoiRows is empty but project has feed nodes on canvas, populate stoiRows so sidebar displays them
            const feedNodes = nodes.filter((n: any) => n.type === 'reagent' || n.type === 'stoiReagent');
            if (feedNodes.length > 0) {
              if (stoiRows.length === 0) {
                stoiRows = feedNodes.map((fn: any, idx: number) => ({
                  id: fn.data?.rowId || idx + 1,
                  name: fn.data?.name || `Feed Solution ${idx + 1}`,
                  conc: parseFloat(fn.data?.molarity) || 1.0,
                  flow: 1.0,
                  solvent: fn.data?.solvent || '',
                  isLimiting: idx === 0,
                }));
              } else {
                feedNodes.forEach((fn: any, idx: number) => {
                  const matched = stoiRows.find((r: any) => fn.data?.rowId !== undefined && String(r.id) === String(fn.data.rowId))
                    || stoiRows.find((r: any) => fn.data?.name && r.name?.trim().toLowerCase() === fn.data.name.trim().toLowerCase())
                    || (idx < stoiRows.length ? stoiRows[idx] : null);
                  if (matched && fn.data?.solvent && !matched.solvent) {
                    matched.solvent = fn.data.solvent;
                  }
                });
              }
            }

            // Extract custom modules to register in sidebar
            const explicitModules = Array.isArray(flow.customModules)
              ? flow.customModules
              : (Array.isArray(flow.flowData?.customModules) ? flow.flowData.customModules : []);
            const modulesFromNodes = nodes
              .filter((n: any) => n.type === 'customModule' && n.data?.customConfig)
              .map((n: any) => n.data.customConfig);
            const combinedModules = [...explicitModules, ...modulesFromNodes];
            if (combinedModules.length > 0) {
              importCustomModules(combinedModules);
            }

            const newProjId = uuidv4();
            const newProject: Project = {
              id: newProjId,
              name: flow.name || cleanName,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              comments: flow.comments || 'Imported from JSON',
              flowData: {
                nodes,
                edges,
                viewport,
                stoiRows,
                customModules: combinedModules.length > 0 ? combinedModules : undefined,
              }
            };

            saveProject(newProject);
            openProject(newProjId);
            showToast(`Imported "${newProject.name}" successfully!`);
          } else {
            showToast('Invalid flow file format.');
          }
        } catch (err) {
          console.error('Failed to import JSON project:', err);
          showToast('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleEditClick = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditName(p.name);
    setEditComments(p.comments);
  };

  const handleSaveEdit = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    updateProjectMeta(p.id, editName, editComments);
    setEditingId(null);
  };

  const handleDelete = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(p.id);
    showToast(`Moved "${p.name}" to Bin.`, p.id);
  };

  const handleRestore = (p: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    restoreProject(p.id);
    showToast(`Restored "${p.name}" to Projects.`);
  };

  const handlePermanentDelete = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Permanently',
      message: `Are you sure you want to permanently delete "${p.name}"? This action cannot be undone.`,
      onConfirm: () => {
        permanentlyDeleteProject(p.id);
        showToast(`Permanently deleted "${p.name}".`);
      }
    });
  };

  const handleEmptyBin = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Empty Bin',
      message: 'Are you sure you want to empty the Bin? All items inside will be permanently deleted.',
      onConfirm: () => {
        emptyBin();
        showToast('Bin emptied.');
      }
    });
  };

  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-y-auto p-4 sm:p-8 transition-colors relative">
      <div className="max-w-5xl mx-auto">
        {/* Toast Banner */}
        {toastMessage && (
          <div className="mb-6 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between transition-all animate-fadeIn">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Check size={16} className="text-emerald-400 dark:text-emerald-600" />
              <span>{toastMessage.text}</span>
            </div>
            {toastMessage.undoId && (
              <button
                onClick={() => {
                  const target = deletedProjects.find(dp => dp.id === toastMessage.undoId);
                  if (target) handleRestore(target);
                  setToastMessage(null);
                }}
                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer"
              >
                <Undo2 size={14} />
                Undo
              </button>
            )}
          </div>
        )}

        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 sm:pb-0 sm:border-0">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <FolderOpen size={18} />
              <span>Projects</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'projects'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {uniqueProjects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'bin'
                  ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Trash2 size={18} />
              <span>Bin</span>
              {uniqueDeletedProjects.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'bin'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                }`}>
                  {uniqueDeletedProjects.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <FlaskConical size={18} />
              <span>Chemistry Tools</span>
            </button>
          </div>

          <div>
            {activeTab === 'projects' && (
              <div className="flex items-center gap-2">
                <label className="h-8 flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95">
                  <Upload size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Import JSON Project</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
                <button
                  onClick={handleCreateNew}
                  className="h-8 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus size={16} />
                  <span>New Project</span>
                </button>
              </div>
            )}
            {activeTab === 'bin' && deletedProjects.length > 0 && (
              <button
                onClick={handleEmptyBin}
                className="h-8 flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <Trash2 size={15} />
                <span>Empty Bin</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Active Projects */}
        {activeTab === 'projects' && (
          <div>
            {uniqueProjects.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <FolderOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No projects yet</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Create a new flow chemistry project or import an existing JSON project to get started.</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-md font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs">
                    <Upload size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Import JSON Project</span>
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Plus size={18} />
                    New Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {uniqueProjects.map((p: Project) => (
                  <div 
                    key={p.id}
                    className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row h-48 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group overflow-hidden"
                  >
                    <div className="sm:w-2/5 h-24 sm:h-full shrink-0 border-b sm:border-b-0 border-slate-200 dark:border-slate-800">
                      <MiniCanvas project={p} />
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      {editingId === p.id ? (
                        <div className="flex flex-col gap-2 h-full">
                          <input 
                            type="text" 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="font-semibold text-slate-800 dark:text-slate-100 border-b border-emerald-500 outline-none pb-1 bg-transparent"
                            autoFocus
                          />
                          <textarea
                            value={editComments}
                            onChange={e => setEditComments(e.target.value)}
                            className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 flex-1 resize-none outline-none focus:border-emerald-500"
                            placeholder="Add comments..."
                          />
                          <div className="flex justify-end mt-1">
                            <button 
                              onClick={(e) => handleSaveEdit(p, e)}
                              className="text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded hover:bg-emerald-200 dark:hover:bg-emerald-800 font-medium transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-start mb-1 shrink-0">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg truncate pr-2">{p.name}</h3>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => handleEditClick(p, e)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Details"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(p, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                title="Move to Bin"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono shrink-0">
                            Created: {new Date(p.createdAt).toLocaleDateString()}<br/>
                            Edited: {new Date(p.updatedAt).toLocaleDateString()}
                          </p>
                          <div className="flex-1 min-h-0 overflow-hidden">
                            {p.comments ? (
                              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{p.comments}</p>
                            ) : (
                              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No comments</p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2 justify-start shrink-0">
                            <button
                              onClick={() => openProject(p.id)}
                              className="h-8 text-xs bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 rounded-lg font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer flex items-center"
                            >
                              Go to Project
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Trash Bin */}
        {activeTab === 'bin' && (
          uniqueDeletedProjects.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
              <Trash2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Trash Bin is empty</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
                Projects moved to the bin will appear here. You can restore them anytime or delete them permanently.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uniqueDeletedProjects.map((p: Project) => (
                <div 
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row h-48 opacity-90 hover:opacity-100 transition-all overflow-hidden"
                >
                  <div className="sm:w-2/5 h-24 sm:h-full shrink-0 border-b sm:border-b-0 border-slate-200 dark:border-slate-800 grayscale">
                    <MiniCanvas project={p} />
                  </div>
                  
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-1 shrink-0">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg truncate pr-2">{p.name}</h3>
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded font-medium shrink-0">
                          In Bin
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono shrink-0">
                        Deleted: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'Recently'}
                      </p>
                      <div className="flex-1 min-h-0 overflow-hidden">
                        {p.comments ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{p.comments}</p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">No comments</p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={(e) => handleRestore(p, e)}
                          className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                        <button
                          onClick={(e) => handlePermanentDelete(p, e)}
                          className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 px-2.5 py-1.5 rounded font-medium transition-colors cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 size={14} />
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {/* Tab 3: Chemistry Tools */}
        {activeTab === 'tools' && (
          <ChemistryToolsHub />
        )}
      </div>

      {/* Confirm Modal */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

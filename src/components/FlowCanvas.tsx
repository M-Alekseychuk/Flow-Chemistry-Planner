import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeChange,
  Panel,
  SelectionMode,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { CustomNodes, edgeTypes } from './CustomNodes';
import { useAppContext } from '../AppContext';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Undo, Redo, Download, Hand, MousePointer, MoveHorizontal, MoveVertical } from 'lucide-react';
import { runSimulation } from '../lib/simulation';
import { CATEGORIES } from './NodePalette';
import { exportBrandedPdf } from '../lib/reportGenerator';
import PdfReportModal from './PdfReportModal';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const Flow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isExporting, setIsExporting] = useState<'pdf' | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const { 
    stoiRows, 
    setStoiRows, 
    saveProject, 
    currentProject, 
    isDarkMode, 
    isGridSnap, 
    customLogo, 
    flowRateUnit, 
    isMultiColorStreams,
    customModules,
    importCustomModules,
  } = useAppContext();

  const [historyLength, setHistoryLength] = useState({ past: 0, future: 0 });
  const historyRef = useRef<{
    past: Array<{ nodes: Node[], edges: Edge[] }>;
    future: Array<{ nodes: Node[], edges: Edge[] }>;
  }>({ past: [], future: [] });

  const isUndoRedoRef = useRef(false);
  const isInitializingRef = useRef(true);
  const prevNodesRef = useRef<Node[]>([]);
  const prevEdgesRef = useRef<Edge[]>([]);

  const loadedProjectIdRef = useRef<string | null>(null);

  // Load project data only when currentProject ID changes
  useEffect(() => {
    if (!currentProject?.id || !currentProject?.flowData) return;
    if (loadedProjectIdRef.current === currentProject.id) return;

    loadedProjectIdRef.current = currentProject.id;
    isInitializingRef.current = true;
    prevNodesRef.current = [];
    prevEdgesRef.current = [];
    historyRef.current = { past: [], future: [] };
    setHistoryLength({ past: 0, future: 0 });

    const { nodes: pNodes, edges: pEdges, viewport, stoiRows: pStoiRows, customModules: pCustomModules } = currentProject.flowData;
    
    // Ensure feed solution nodes and stoiRows are aligned
    const feedNodes = (pNodes || []).filter((n: any) => n.type === 'reagent' || n.type === 'stoiReagent');
    let effectiveStoiRows = Array.isArray(pStoiRows) && pStoiRows.length > 0 ? [...pStoiRows] : [];

    if (feedNodes.length > 0) {
      if (effectiveStoiRows.length === 0) {
        effectiveStoiRows = feedNodes.map((fn: any, idx: number) => ({
          id: fn.data?.rowId || idx + 1,
          name: fn.data?.name || `Feed Solution ${idx + 1}`,
          conc: parseFloat(fn.data?.molarity) || 1.0,
          flow: 1.0,
          solvent: fn.data?.solvent || '',
          isLimiting: idx === 0,
        }));
      } else {
        feedNodes.forEach((fn: any, idx: number) => {
          const matched = effectiveStoiRows.find((r: any) => fn.data?.rowId !== undefined && String(r.id) === String(fn.data.rowId))
            || effectiveStoiRows.find((r: any) => fn.data?.name && r.name?.trim().toLowerCase() === fn.data.name.trim().toLowerCase())
            || (idx < effectiveStoiRows.length ? effectiveStoiRows[idx] : null);
          if (matched) {
            if (fn.data?.solvent && !matched.solvent) {
              matched.solvent = fn.data.solvent;
            }
          }
        });
      }
      setStoiRows(effectiveStoiRows);
    } else if (pStoiRows) {
      setStoiRows(pStoiRows);
    }

    const sanitizedNodes: Node[] = [];
    const seenNodeIds = new Set<string>();
    (pNodes || []).forEach((n: any) => {
      if (n && n.id) {
        if (!seenNodeIds.has(n.id)) {
          seenNodeIds.add(n.id);
          sanitizedNodes.push(n);
        } else {
          sanitizedNodes.push({ ...n, id: uuidv4() });
        }
      }
    });

    const sanitizedEdges: Edge[] = [];
    const seenEdgeIds = new Set<string>();
    (pEdges || []).forEach((e: any) => {
      if (e && e.id) {
        if (!seenEdgeIds.has(e.id)) {
          seenEdgeIds.add(e.id);
          sanitizedEdges.push(e);
        } else {
          sanitizedEdges.push({ ...e, id: uuidv4() });
        }
      }
    });

    setNodes(sanitizedNodes);
    setEdges(sanitizedEdges);

    // Extract custom modules from flowData and nodes to ensure they appear in the sidebar
    const modulesFromNodes = (pNodes || [])
      .filter((n: any) => n.type === 'customModule' && n.data?.customConfig)
      .map((n: any) => n.data.customConfig);
    const explicitModules = Array.isArray(pCustomModules) ? pCustomModules : [];
    const combined = [...explicitModules, ...modulesFromNodes];
    if (combined.length > 0) {
      importCustomModules(combined);
    }

    if (reactFlowInstance && viewport) {
      reactFlowInstance.setViewport(viewport);
    }

    prevNodesRef.current = JSON.parse(JSON.stringify(pNodes || []));
    prevEdgesRef.current = JSON.parse(JSON.stringify(pEdges || []));

    const timer = setTimeout(() => {
      isInitializingRef.current = false;
    }, 200);
    return () => clearTimeout(timer);
  }, [currentProject?.id]);

  // Global Undo / Redo functionality
  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;

    isUndoRedoRef.current = true;

    const previousState = historyRef.current.past.pop()!;
    const currentState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    historyRef.current.future.push(currentState);

    setNodes(previousState.nodes);
    setEdges(previousState.edges);

    prevNodesRef.current = JSON.parse(JSON.stringify(previousState.nodes));
    prevEdgesRef.current = JSON.parse(JSON.stringify(previousState.edges));

    setHistoryLength({
      past: historyRef.current.past.length,
      future: historyRef.current.future.length,
    });
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;

    isUndoRedoRef.current = true;

    const nextState = historyRef.current.future.pop()!;
    const currentState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    historyRef.current.past.push(currentState);

    setNodes(nextState.nodes);
    setEdges(nextState.edges);

    prevNodesRef.current = JSON.parse(JSON.stringify(nextState.nodes));
    prevEdgesRef.current = JSON.parse(JSON.stringify(nextState.edges));

    setHistoryLength({
      past: historyRef.current.past.length,
      future: historyRef.current.future.length,
    });
  }, [nodes, edges, setNodes, setEdges]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  // Measure node height / width for accurate center-based alignment (handles are at top: 50%)
  const getNodeHeight = useCallback((node: Node): number => {
    const domNode = document.querySelector(`.react-flow__node[data-id="${node.id}"]`) as HTMLElement;
    if (domNode && domNode.offsetHeight > 0) {
      return domNode.offsetHeight;
    }
    if ((node as any).measured?.height) {
      return (node as any).measured.height;
    }
    if (node.height) {
      return node.height;
    }
    if (node.type === 'reagent') return 110;
    if (node.type === 'stoiReagent') return 150;
    if (node.type === 'freeText') return 50;
    return 140;
  }, []);

  const getNodeWidth = useCallback((node: Node): number => {
    const domNode = document.querySelector(`.react-flow__node[data-id="${node.id}"]`) as HTMLElement;
    if (domNode && domNode.offsetWidth > 0) {
      return domNode.offsetWidth;
    }
    if ((node as any).measured?.width) {
      return (node as any).measured.width;
    }
    if (node.width) {
      return node.width;
    }
    return 100;
  }, []);

  // Selected nodes count and alignment utilities
  const selectedCount = useMemo(() => nodes.filter(n => n.selected).length, [nodes]);

  const alignSelectedHorizontally = useCallback(() => {
    const selected = nodes.filter(n => n.selected);
    if (selected.length < 2) return;

    // Center handles are at top: 50% of each node card.
    // Calculate the target center Y coordinate based on the primary selected node.
    const primaryNode = selected[0];
    const primaryHeight = getNodeHeight(primaryNode);
    let targetCenterY = primaryNode.position.y + primaryHeight / 2;

    if (isGridSnap) {
      targetCenterY = Math.round(targetCenterY / 16) * 16;
    }

    historyRef.current.past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    historyRef.current.future = [];
    setHistoryLength({ past: historyRef.current.past.length, future: 0 });

    setNodes(nds => nds.map(n => {
      if (n.selected) {
        const h = getNodeHeight(n);
        return {
          ...n,
          position: {
            ...n.position,
            // Align node so that its 50% handle lands exactly on targetCenterY
            y: Math.round(targetCenterY - h / 2),
          }
        };
      }
      return n;
    }));
  }, [nodes, edges, isGridSnap, getNodeHeight, setNodes]);

  const alignSelectedVertically = useCallback(() => {
    const selected = nodes.filter(n => n.selected);
    if (selected.length < 2) return;

    const primaryNode = selected[0];
    const primaryWidth = getNodeWidth(primaryNode);
    let targetCenterX = primaryNode.position.x + primaryWidth / 2;

    if (isGridSnap) {
      targetCenterX = Math.round(targetCenterX / 16) * 16;
    }

    historyRef.current.past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    historyRef.current.future = [];
    setHistoryLength({ past: historyRef.current.past.length, future: 0 });

    setNodes(nds => nds.map(n => {
      if (n.selected) {
        const w = getNodeWidth(n);
        return {
          ...n,
          position: {
            ...n.position,
            x: Math.round(targetCenterX - w / 2),
          }
        };
      }
      return n;
    }));
  }, [nodes, edges, isGridSnap, getNodeWidth, setNodes]);

  // Center-aligned drag snapping: When Grid Snap is ON, snaps each node's center (where handles are)
  // to the 16px grid lines. This ensures different sized modules dragged to the same row align in a 100% straight line!
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    if (isGridSnap) {
      const adjustedChanges = changes.map(change => {
        if (change.type === 'position' && change.position) {
          const nodeObj = nodes.find(n => n.id === change.id) || ({ id: change.id } as Node);
          const h = getNodeHeight(nodeObj);
          
          // Snap horizontal X to 16px grid
          const snappedX = Math.round(change.position.x / 16) * 16;

          // Snap vertical center (where handles are) to 16px grid
          const currentCenterY = change.position.y + h / 2;
          const snappedCenterY = Math.round(currentCenterY / 16) * 16;
          const snappedY = Math.round(snappedCenterY - h / 2);

          return {
            ...change,
            position: {
              x: snappedX,
              y: snappedY,
            }
          };
        }
        return change;
      });
      onNodesChange(adjustedChanges);
    } else {
      onNodesChange(changes);
    }
  }, [isGridSnap, nodes, getNodeHeight, onNodesChange]);

  // Canvas event listener for programmatic node additions and updates (e.g. from Chemistry Tools)
  useEffect(() => {
    const handleAddNode = (e: any) => {
      const newNode = e.detail;
      if (!newNode || !newNode.id) return;

      let position = newNode.position || { x: 400, y: 200 };
      if (reactFlowInstance) {
        try {
          const viewport = reactFlowInstance.getViewport();
          if (viewport && viewport.zoom && reactFlowWrapper.current) {
            const centerX = (-viewport.x + reactFlowWrapper.current.clientWidth / 2) / viewport.zoom;
            const centerY = (-viewport.y + reactFlowWrapper.current.clientHeight / 2) / viewport.zoom;
            if (!isNaN(centerX) && !isNaN(centerY)) {
              position = {
                x: Math.round(centerX - 60 + (Math.random() * 40 - 20)),
                y: Math.round(centerY - 30 + (Math.random() * 40 - 20))
              };
            }
          }
        } catch (err) {
          // fallback to newNode.position
        }
      }

      const nodeToAdd = { ...newNode, position };
      setNodes((currentNodes) => {
        if (currentNodes.some((n: any) => n.id === nodeToAdd.id)) {
          return currentNodes;
        }
        return [...currentNodes, nodeToAdd];
      });
    };

    const handleApplyNode = (e: any) => {
      const { id, dataPatch } = e.detail || {};
      if (!id || !dataPatch) return;

      setNodes((currentNodes) => currentNodes.map((n: any) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...(n.data || {}),
              ...dataPatch
            }
          };
        }
        return n;
      }));
    };

    window.addEventListener('app_add_canvas_node', handleAddNode);
    window.addEventListener('app_apply_canvas_node', handleApplyNode);
    return () => {
      window.removeEventListener('app_add_canvas_node', handleAddNode);
      window.removeEventListener('app_apply_canvas_node', handleApplyNode);
    };
  }, [reactFlowInstance, setNodes]);

  // History tracking observer effect
  useEffect(() => {
    if (isInitializingRef.current) {
      prevNodesRef.current = JSON.parse(JSON.stringify(nodes));
      prevEdgesRef.current = JSON.parse(JSON.stringify(edges));
      return;
    }

    if (isUndoRedoRef.current) {
      prevNodesRef.current = JSON.parse(JSON.stringify(nodes));
      prevEdgesRef.current = JSON.parse(JSON.stringify(edges));
      isUndoRedoRef.current = false;
      return;
    }

    const isDragging = nodes.some((n: any) => n.dragging);
    if (isDragging) {
      return;
    }

    const handler = setTimeout(() => {
      const nodesChanged = JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes);
      const edgesChanged = JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges);

      if (nodesChanged || edgesChanged) {
        const pastClone = JSON.parse(JSON.stringify(prevNodesRef.current));
        const edgesClone = JSON.parse(JSON.stringify(prevEdgesRef.current));

        historyRef.current.past.push({ nodes: pastClone, edges: edgesClone });
        historyRef.current.future = []; // Clear redo stack on new action

        setHistoryLength({
          past: historyRef.current.past.length,
          future: historyRef.current.future.length
        });

        prevNodesRef.current = JSON.parse(JSON.stringify(nodes));
        prevEdgesRef.current = JSON.parse(JSON.stringify(edges));
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [nodes, edges]);

  // Auto-save effect
  useEffect(() => {
    if (reactFlowInstance) {
      const timer = setTimeout(() => {
        const flow = reactFlowInstance.toObject();
        saveProject({
          flowData: {
            nodes: flow.nodes,
            edges: flow.edges,
            viewport: flow.viewport,
            stoiRows,
            customModules,
          }
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, stoiRows, customModules]);

  // Synchronize canvas feed solution nodes with sidebar stoiRows
  useEffect(() => {
    if (!stoiRows || stoiRows.length === 0 || isInitializingRef.current) return;

    setNodes((currentNodes) => {
      let hasChanges = false;
      const feedNodes = currentNodes.filter(n => n.type === 'reagent' || n.type === 'stoiReagent');
      if (feedNodes.length === 0) return currentNodes;

      const nextNodes = currentNodes.map(node => {
        if (node.type !== 'reagent' && node.type !== 'stoiReagent') return node;

        const feedIndex = feedNodes.findIndex(n => n.id === node.id);
        const targetRow = stoiRows.find((r: any) => node.data?.rowId !== undefined && String(r.id) === String(node.data.rowId))
          || (node.data?.name ? stoiRows.find((r: any) => r.name?.trim().toLowerCase() === node.data.name.trim().toLowerCase()) : null)
          || (feedIndex >= 0 && feedIndex < stoiRows.length ? stoiRows[feedIndex] : null);

        if (targetRow) {
          const currentName = node.data?.name ?? '';
          const currentMolarity = node.data?.molarity !== undefined ? node.data.molarity : '';
          const currentSolvent = node.data?.solvent ?? '';
          const currentRowId = node.data?.rowId;

          const rowName = targetRow.name ?? '';
          const rowConc = targetRow.conc !== undefined ? targetRow.conc : '';
          const rowSolvent = targetRow.solvent ?? currentSolvent;

          const numCurrent = Number(currentMolarity);
          const numRow = Number(rowConc);
          const bothEmpty = (currentMolarity === '' || currentMolarity === undefined) && (rowConc === '' || rowConc === undefined);
          const isConcDiff = !bothEmpty && (
            isNaN(numCurrent) !== isNaN(numRow) || (!isNaN(numCurrent) && !isNaN(numRow) && Math.abs(numCurrent - numRow) > 1e-6)
          );

          if (
            currentName !== rowName ||
            String(currentRowId) !== String(targetRow.id) ||
            (node.type === 'reagent' && (isConcDiff || currentSolvent !== rowSolvent))
          ) {
            hasChanges = true;
            return {
              ...node,
              data: {
                ...node.data,
                rowId: targetRow.id,
                name: rowName,
                molarity: rowConc !== '' ? rowConc : currentMolarity,
                solvent: rowSolvent,
              }
            };
          }
        }
        return node;
      });

      return hasChanges ? nextNodes : currentNodes;
    });
  }, [stoiRows, setNodes]);

  const simulatedEdges = useMemo(() => {
    return runSimulation(nodes, edges, stoiRows, isMultiColorStreams);
  }, [nodes, edges, stoiRows, isMultiColorStreams]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => {
      const incomingEdges = eds.filter(e => e.target === params.source);
      let material = 'PFA';
      if (incomingEdges.length > 0 && incomingEdges[0].data?.material) {
        material = incomingEdges[0].data.material;
      }
      return addEdge({ ...params, type: 'custom', animated: true, style: { stroke: '#1d4ed8', strokeWidth: 1.8 }, data: { material } } as any, eds);
    }),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (isGridSnap) {
        position.x = Math.round(position.x / 16) * 16;
        const estH = type === 'reagent' ? 110 : type === 'stoiReagent' ? 150 : 140;
        const centerY = position.y + estH / 2;
        const snappedCenterY = Math.round(centerY / 16) * 16;
        position.y = Math.round(snappedCenterY - estH / 2);
      }
      
      let data: any = { label: `${type} node` };
      if (type === 'calcResult' || type === 'stoiResult' || type === 'stoiReagent' || type === 'customModule') {
        const jsonStr = event.dataTransfer.getData('application/json');
        if (jsonStr) {
           data = JSON.parse(jsonStr);
        }
      } else if (type === 'reagent') {
        const jsonStr = event.dataTransfer.getData('application/json');
        if (jsonStr) {
          try {
            data = JSON.parse(jsonStr);
          } catch (e) {
            // fallback
          }
        }
        if (!data.rowId) {
          const nextIdx = (stoiRows?.length || 0) + 1;
          const newRowId = Date.now();
          const newRow = {
            id: newRowId,
            name: data.name || `Reagent ${nextIdx}`,
            conc: parseFloat(data.molarity) || 1.0,
            flow: 1.0,
            solvent: data.solvent || '',
            isLimiting: (stoiRows?.length || 0) === 0,
          };
          setStoiRows([...(stoiRows || []), newRow]);
          data = {
            ...data,
            rowId: newRowId,
            name: newRow.name,
            molarity: newRow.conc,
            solvent: newRow.solvent,
          };
        }
      }

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, isGridSnap, stoiRows, setStoiRows]
  );

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();

      // Collect customModule templates from canvas nodes and app customModules
      const nodeCustomConfigs = (flow.nodes || [])
        .filter((n: any) => n.type === 'customModule' && n.data?.customConfig)
        .map((n: any) => n.data.customConfig);

      const allModulesMap = new Map<string, any>();
      (customModules || []).forEach((m: any) => {
        if (m?.id) allModulesMap.set(m.id, m);
      });
      nodeCustomConfigs.forEach((m: any) => {
        if (m?.id && !allModulesMap.has(m.id)) {
          allModulesMap.set(m.id, m);
        }
      });

      const exportData = {
        ...flow,
        stoiRows,
        customModules: Array.from(allModulesMap.values()),
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", currentProject?.name ? `Flow_Designer_${currentProject.name}.json` : "Flow_Designer_project.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }, [reactFlowInstance, stoiRows, currentProject?.name, customModules]);

  const onRestore = useCallback((event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (flow.stoiRows) {
              setStoiRows(flow.stoiRows);
            }

            // Extract custom modules from both flow.customModules and flow.nodes
            const modulesFromNodes = (flow.nodes || [])
              .filter((n: any) => n.type === 'customModule' && n.data?.customConfig)
              .map((n: any) => n.data.customConfig);
            const explicitModules = Array.isArray(flow.customModules) ? flow.customModules : [];
            const combined = [...explicitModules, ...modulesFromNodes];
            if (combined.length > 0) {
              importCustomModules(combined);
            }

            reactFlowInstance.setViewport({ x, y, zoom });
          }
        } catch (err) {
          console.error('Failed to parse flow JSON file:', err);
        }
      };
      reader.readAsText(file);
    }
    // reset input so the same file can be selected again
    event.target.value = null;
  }, [setNodes, setEdges, reactFlowInstance, setStoiRows, importCustomModules]);

  const onExportPdf = useCallback(async (setupPhoto?: string | null, setupPhotoCaption?: string) => {
    if (!reactFlowWrapper.current || nodes.length === 0) return;
    const viewportNode = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewportNode) return;

    try {
      setIsExporting('pdf');
      await exportBrandedPdf({
        project: currentProject,
        nodes,
        edges,
        customLogo,
        viewportElement: viewportNode,
        isDarkMode,
        setupPhoto,
        setupPhotoCaption,
      });

      // Save setupPhoto and caption with project data if provided
      if (setupPhoto !== undefined) {
        saveProject({
          flowData: {
            nodes,
            edges,
            viewport: reactFlowInstance?.getViewport(),
            stoiRows,
            setupPhoto: setupPhoto || undefined,
            setupPhotoCaption: setupPhotoCaption || undefined,
          }
        });
      }
    } catch (err) {
      console.error('Failed to export PDF report', err);
    } finally {
      setIsExporting(null);
    }
  }, [nodes, edges, currentProject, isDarkMode, customLogo, reactFlowInstance, stoiRows, saveProject]);

  return (
    <div className={`w-full h-full ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={simulatedEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={CustomNodes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'custom' }}
        deleteKeyCode={null}
        selectionOnDrag={isSelectMode}
        panOnDrag={!isSelectMode}
        selectionMode={SelectionMode.Partial}
        snapToGrid={false}
        snapGrid={[16, 16]}
        fitView
      >
        <Controls showInteractive={false} />
        <Background color={isDarkMode ? "#334155" : "#cbd5e1"} gap={16} />
        
        {/* Floating Glassmorphism Toolbar */}
        <Panel position="top-center" className="mt-3 pointer-events-auto select-none max-w-[calc(100vw-340px)] sm:max-w-none">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 dark:shadow-black/30">
            {/* Undo / Redo controls */}
            <div className="flex items-center gap-0.5 bg-slate-100/70 dark:bg-slate-800/70 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button 
                onClick={undo}
                disabled={historyLength.past === 0}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  historyLength.past > 0 
                    ? 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs active:scale-95' 
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo size={14} />
                <span className="hidden sm:inline">Undo</span>
              </button>
              <button 
                onClick={redo}
                disabled={historyLength.future === 0}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  historyLength.future > 0 
                    ? 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs active:scale-95' 
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo size={14} />
                <span className="hidden sm:inline">Redo</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="w-px h-5 bg-slate-200/90 dark:bg-slate-700/80 mx-0.5" />

            {/* Mode selection (Pan vs Select) */}
            <div className="flex items-center gap-0.5 bg-slate-100/70 dark:bg-slate-800/70 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button 
                onClick={() => setIsSelectMode(false)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isSelectMode 
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs' 
                    : 'hover:bg-white/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="Pan Canvas (Hold and drag)"
              >
                <Hand size={14} />
                <span className="hidden sm:inline">Pan</span>
              </button>
              <button 
                onClick={() => setIsSelectMode(true)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelectMode 
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs' 
                    : 'hover:bg-white/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="Select Nodes (Box drag to select)"
              >
                <MousePointer size={14} />
                <span className="hidden sm:inline">Select</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="w-px h-5 bg-slate-200/90 dark:bg-slate-700/80 mx-0.5" />

            {/* Alignment tools (visible whenever 2+ nodes are selected) */}
            {selectedCount >= 2 && (
              <>
                <div className="flex items-center gap-0.5 bg-sky-50 dark:bg-sky-950/70 p-0.5 rounded-xl border border-sky-200/70 dark:border-sky-800/70 animate-fade-in">
                  <button
                    onClick={alignSelectedHorizontally}
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-white dark:hover:bg-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title={`Align ${selectedCount} selected modules in a straight horizontal line`}
                  >
                    <MoveHorizontal size={14} />
                    <span>Align Straight</span>
                  </button>
                  <button
                    onClick={alignSelectedVertically}
                    className="h-8 px-2 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-white dark:hover:bg-slate-800 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                    title={`Align ${selectedCount} selected modules vertically`}
                  >
                    <MoveVertical size={14} />
                  </button>
                </div>
                <div className="w-px h-5 bg-slate-200/90 dark:bg-slate-700/80 mx-0.5" />
              </>
            )}

            {/* PDF Report Button */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              disabled={isExporting !== null}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="PDF Report - Export high-resolution diagram with optional physical setup photo"
            >
              <Download size={14} />
              <span>{isExporting === 'pdf' ? 'Exporting...' : 'PDF Report'}</span>
            </button>

            {/* Subtle Divider */}
            <div className="w-px h-5 bg-slate-200/90 dark:bg-slate-700/80 mx-0.5 hidden md:block" />

            {/* Export JSON */}
            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={onSave} 
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
                title="Export canvas diagram data as JSON backup"
              >
                Export JSON
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* PDF Report Export Modal with Setup Photo Attachment */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onExport={onExportPdf}
        project={currentProject}
        nodesCount={nodes.length}
        isExporting={isExporting === 'pdf'}
      />
    </div>
  );
};

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

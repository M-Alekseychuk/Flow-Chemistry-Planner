export interface StreamColor {
  stroke: string;
  glow: string;
  name: string;
}

// Distinct, vibrant colors for independent Feed Solutions
export const FEED_STREAM_PALETTE: StreamColor[] = [
  { stroke: '#2563eb', glow: '#60a5fa', name: 'Blue Stream' },       // Feed 1: Royal Blue
  { stroke: '#ea580c', glow: '#fb923c', name: 'Orange Stream' },     // Feed 2: Deep Orange
  { stroke: '#059669', glow: '#34d399', name: 'Emerald Stream' },    // Feed 3: Emerald Green
  { stroke: '#7c3aed', glow: '#a78bfa', name: 'Violet Stream' },     // Feed 4: Violet / Purple
  { stroke: '#e11d48', glow: '#fb7185', name: 'Rose Stream' },       // Feed 5: Crimson Rose
  { stroke: '#0284c7', glow: '#38bdf8', name: 'Sky Stream' },        // Feed 6: Sky Cyan
  { stroke: '#d97706', glow: '#fbbf24', name: 'Amber Stream' },      // Feed 7: Gold / Amber
  { stroke: '#0d9488', glow: '#2dd4bf', name: 'Teal Stream' },       // Feed 8: Deep Teal
  { stroke: '#c026d3', glow: '#e879f9', name: 'Fuchsia Stream' },    // Feed 9: Fuchsia
  { stroke: '#4f46e5', glow: '#818cf8', name: 'Indigo Stream' },     // Feed 10: Indigo
];

// Distinct, eye-catching colors for Mixed Streams
export const MIXED_STREAM_PALETTE: StreamColor[] = [
  { stroke: '#0891b2', glow: '#22d3ee', name: 'Cyan Mix' },          // Mix 1: Cyan / Aqua
  { stroke: '#9333ea', glow: '#c084fc', name: 'Purple Mix' },        // Mix 2: Purple / Violet
  { stroke: '#15803d', glow: '#4ade80', name: 'Forest Mix' },        // Mix 3: Deep Green
  { stroke: '#db2777', glow: '#f472b6', name: 'Magenta Mix' },       // Mix 4: Magenta / Pink
  { stroke: '#b45309', glow: '#fbbf24', name: 'Amber Mix' },         // Mix 5: Amber Gold
  { stroke: '#4338ca', glow: '#818cf8', name: 'Indigo Mix' },        // Mix 6: Indigo
  { stroke: '#b91c1c', glow: '#f87171', name: 'Ruby Mix' },          // Mix 7: Ruby
  { stroke: '#0f766e', glow: '#2dd4bf', name: 'Dark Teal Mix' },     // Mix 8: Dark Teal
];

// Accessible, high-contrast Cobalt Blue - optimized for all types of color vision deficiency (Protanopia, Deuteranopia, Tritanopia, Monochromacy)
export const UNIFORM_STREAM_COLOR: StreamColor = {
  stroke: '#1d4ed8', // Cobalt Blue (WCAG AAA contrast on light canvas, vivid on dark backgrounds)
  glow: '#60a5fa',
  name: 'Uniform Stream (Accessible Blue)',
};

export function getFeedColorForNode(
  node: any, 
  nodes: any[] = [], 
  stoiRows: any[] = [], 
  isMultiColor: boolean = true
): StreamColor {
  if (!isMultiColor) {
    return UNIFORM_STREAM_COLOR;
  }
  if (node.type === 'stoiReagent' || node.type === 'reagent') {
    let rowIdx = -1;
    if (stoiRows && stoiRows.length > 0) {
      rowIdx = stoiRows.findIndex((r: any) => 
        (node.data?.rowId !== undefined && String(r.id) === String(node.data.rowId)) ||
        (node.data?.name && r.name?.trim().toLowerCase() === node.data.name.trim().toLowerCase())
      );
    }
    if (rowIdx === -1) {
      const feedNodes = nodes.filter(n => n.type === 'stoiReagent' || n.type === 'reagent');
      rowIdx = feedNodes.findIndex(n => n.id === node.id);
    }
    const idx = Math.max(0, rowIdx);
    return FEED_STREAM_PALETTE[idx % FEED_STREAM_PALETTE.length];
  }
  // Standalone pump or source
  const pureSources = nodes.filter(n => n.type?.toLowerCase().includes('pump') || n.type === 'gasBottle');
  const srcIdx = pureSources.findIndex(n => n.id === node.id);
  const feedCount = (stoiRows?.length || 0) > 0 ? stoiRows.length : nodes.filter(n => n.type === 'reagent' || n.type === 'stoiReagent').length;
  return FEED_STREAM_PALETTE[(Math.max(0, srcIdx) + feedCount) % FEED_STREAM_PALETTE.length];
}

function getMixedColor(sources: Set<string>): StreamColor {
  const sorted = Array.from(sources).sort().join('::');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = (hash * 31 + sorted.charCodeAt(i)) & 0xffffffff;
  }
  const idx = Math.abs(hash) % MIXED_STREAM_PALETTE.length;
  return MIXED_STREAM_PALETTE[idx];
}

export function runSimulation(
  nodes: any[], 
  edges: any[], 
  stoiRows: any[], 
  isMultiColor: boolean = true
) {
  // Build graph
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const incomingEdges = new Map<string, any[]>();
  const outgoingEdges = new Map<string, any[]>();
  
  nodes.forEach(n => {
    incomingEdges.set(n.id, []);
    outgoingEdges.set(n.id, []);
  });
  
  edges.forEach(e => {
    if (incomingEdges.has(e.target)) incomingEdges.get(e.target)!.push(e);
    if (outgoingEdges.has(e.source)) outgoingEdges.get(e.source)!.push(e);
  });
  
  // Find sources (nodes with no incoming edges)
  let queue = nodes.filter(n => incomingEdges.get(n.id)?.length === 0);
  const processedNodes = new Set<string>();
  
  // Store computed values at nodes (outputs)
  const nodeOutputFlow = new Map<string, number>(); // mL/min
  const nodeOutputConc = new Map<string, number>(); // M (molarity)
  
  // Store computed values at edges
  const edgeFlow = new Map<string, number>();
  const edgeConc = new Map<string, number>();
  const edgePressureDrop = new Map<string, number>(); // bar
  
  // Stream color and feed origin tracking
  const nodeFeedSources = new Map<string, Set<string>>();
  const edgeFeedSources = new Map<string, Set<string>>();
  const edgeStreamColor = new Map<string, StreamColor>();
  const edgeIsMixed = new Map<string, boolean>();

  // Helper to check if a customModule acts as a flow pump/source
  const getCustomModuleFlow = (node: any): number => {
    const fields = node.data?.customConfig?.fields || [];
    const flowField = fields.find((f: any) => f.isFlowSource);
    if (!flowField) return 0;
    const rawVal = node.data?.fieldValues?.[flowField.id] ?? flowField.defaultValue ?? '';
    let flow = parseFloat(rawVal) || 0;
    const selectedUnit = node.data?.fieldUnits?.[flowField.id] || (flowField.unit ? flowField.unit.split(',')[0].trim() : 'mL/min');
    if (selectedUnit === 'uL/min' || selectedUnit === 'µL/min') {
      flow /= 1000;
    } else if (selectedUnit === 'L/h') {
      flow = (flow * 1000) / 60;
    }
    return flow;
  };

  // Helper to get flow and conc from a source node
  const getSourceData = (node: any) => {
    let flow = 0;
    let conc = 0;
    if (node.type === 'stoiReagent' || node.type === 'reagent') {
      const row = stoiRows?.find(r => 
        (node.data?.rowId !== undefined && String(r.id) === String(node.data.rowId)) ||
        (node.data?.name && r.name?.trim().toLowerCase() === node.data.name.trim().toLowerCase())
      );
      if (row) {
        flow = parseFloat(row.flow) || 0;
        conc = parseFloat(row.conc) || 0;
      } else if (node.type === 'reagent') {
        conc = parseFloat(node.data?.molarity) || 0;
      }
    } else if (node.type.toLowerCase().includes('pump') || node.type === 'mfc') {
      flow = parseFloat(node.data?.regulatorValue) || 0;
      if (node.data?.regulatorUnit === 'uL/min') flow /= 1000;
    } else if (node.type === 'customModule') {
      flow = getCustomModuleFlow(node);
    }
    return { flow, conc };
  };

  // Helper to get feed ID for a pure source node
  const getSourceFeedId = (node: any) => {
    if (node.type === 'stoiReagent' || node.type === 'reagent') {
      const row = stoiRows?.find(r => 
        (node.data?.rowId !== undefined && String(r.id) === String(node.data.rowId)) ||
        (node.data?.name && r.name?.trim().toLowerCase() === node.data.name.trim().toLowerCase())
      );
      return `feed_${row ? row.id : (node.data?.rowId || node.id)}`;
    }
    return `source_${node.id}`;
  };

  // Topological sort & calculate forward (Flow, Conc, and Stream Origins)
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (processedNodes.has(node.id)) continue;
    
    // Check if all incoming edges have computed flows
    const inEdges = incomingEdges.get(node.id)!;
    const allInputsReady = inEdges.every(e => edgeFlow.has(e.id));
    if (!allInputsReady && inEdges.length > 0) {
      queue.push(node); // Put back to process later
      continue;
    }
    
    processedNodes.add(node.id);
    
    let totalFlow = 0;
    let totalMoles = 0; // flow * conc
    
    let currentSources = new Set<string>();
    let currentColor: StreamColor;
    let currentIsMixed = false;

    if (inEdges.length === 0) {
      // It's a pure source (Feed Solution or stand-alone Pump)
      const { flow, conc } = getSourceData(node);
      totalFlow = flow;
      totalMoles = flow * conc;
      if (totalFlow === 0) {
        // preserve concentration even if there's no flow yet
        totalMoles = conc; 
      }
      const feedId = getSourceFeedId(node);
      currentSources.add(feedId);
      currentColor = isMultiColor ? getFeedColorForNode(node, nodes, stoiRows, true) : UNIFORM_STREAM_COLOR;
      currentIsMixed = false;
    } else {
      // Downstream node: sum up incoming flows, moles, and collect incoming stream origins
      inEdges.forEach(e => {
        const f = edgeFlow.get(e.id) || 0;
        const c = edgeConc.get(e.id) || 0;
        totalFlow += f;
        totalMoles += f * c;

        const srcs = edgeFeedSources.get(e.id);
        if (srcs) {
          srcs.forEach(s => currentSources.add(s));
        }
      });
      
      if (node.type.toLowerCase().includes('pump') || node.type === 'mfc' || node.type === 'customModule') {
         const { flow } = getSourceData(node);
         if (flow > 0) {
           totalFlow = flow;
           if (inEdges.length > 0) {
             const flowPerInEdge = totalFlow / inEdges.length;
             inEdges.forEach(e => {
               edgeFlow.set(e.id, flowPerInEdge);
             });
             const c = edgeConc.get(inEdges[0].id) || 0;
             totalMoles = totalFlow * c;
           }
         }
      }

      // Check if this node merges streams (e.g. mixer, T-mixer, Y-mixer, static mixer, or 2+ different feed sources)
      const isMixerNode = node.type.toLowerCase().includes('mixer') || node.type === 'fourPortValve';
      const isMultiInput = inEdges.length > 1;
      const isMultiSource = currentSources.size > 1;

      if (!isMultiColor) {
        currentColor = UNIFORM_STREAM_COLOR;
        currentIsMixed = false;
      } else if ((isMixerNode && isMultiInput) || isMultiSource) {
        // Streams merge into a newly colored mixed stream!
        currentColor = getMixedColor(currentSources);
        currentIsMixed = true;
      } else {
        // Pass through existing single stream color
        const firstEdgeColor = edgeStreamColor.get(inEdges[0]?.id) || FEED_STREAM_PALETTE[0];
        const firstIsMixed = edgeIsMixed.get(inEdges[0]?.id) || false;
        currentColor = firstEdgeColor;
        currentIsMixed = firstIsMixed;
      }
    }
    
    const outConc = totalFlow > 0 ? totalMoles / totalFlow : (inEdges.length === 0 ? getSourceData(node).conc : 0);
    
    nodeOutputFlow.set(node.id, totalFlow);
    nodeOutputConc.set(node.id, outConc);
    nodeFeedSources.set(node.id, currentSources);
    
    // Propagate to outgoing edges
    const outEdges = outgoingEdges.get(node.id)!;
    const flowPerEdge = outEdges.length > 0 ? totalFlow / outEdges.length : 0;
    
    outEdges.forEach(e => {
      edgeFlow.set(e.id, flowPerEdge);
      edgeConc.set(e.id, outConc);
      edgeFeedSources.set(e.id, currentSources);
      edgeStreamColor.set(e.id, currentColor);
      edgeIsMixed.set(e.id, currentIsMixed);
      
      // Calculate pressure drop for this edge
      // Hagen-Poiseuille: dP = 128 * mu * L * Q / (pi * d^4)
      let L = parseFloat(e.data?.length) || 0;
      if (e.data?.unit === 'cm') L /= 100;
      
      let dStr = e.data?.innerDiameter || '1/16';
      let dMm = 0;
      if (dStr.includes('/')) {
        const parts = dStr.split('/');
        if (parts.length === 2) dMm = (parseFloat(parts[0]) / parseFloat(parts[1])) * 25.4;
      } else {
        dMm = parseFloat(dStr) || 1.5875;
      }
      if (e.data?.diameterUnit === 'mm') dMm = parseFloat(dStr) || 1.5875;
      
      const d = dMm / 1000; // in meters
      const Q_m3_s = (flowPerEdge / 60) * 1e-6; // mL/min to m^3/s
      
      let dP_bar = 0;
      if (d > 0 && L > 0) {
         const dP_Pa = (128 * 1e-3 * L * Q_m3_s) / (Math.PI * Math.pow(d, 4));
         dP_bar = dP_Pa / 1e5; // Pa to bar
      }
      
      edgePressureDrop.set(e.id, dP_bar);
      
      // Add target to queue
      if (!queue.includes(nodeMap.get(e.target)!)) {
        queue.push(nodeMap.get(e.target)!);
      }
    });
  }
  
  // Now update edges with simulation data and stream colors
  return edges.map(e => {
    const color = edgeStreamColor.get(e.id) || { stroke: '#94a3b8', glow: '#cbd5e1', name: 'Connecting Line' };
    const isMixed = edgeIsMixed.get(e.id) || false;
    const sources = Array.from(edgeFeedSources.get(e.id) || []);

    return {
      ...e,
      data: {
        ...e.data,
        streamColor: color.stroke,
        streamGlowColor: color.glow,
        streamName: color.name,
        isMixed,
        sources,
        simData: {
          flow: edgeFlow.get(e.id) || 0,
          conc: edgeConc.get(e.id) || 0,
          pressureDrop: edgePressureDrop.get(e.id) || 0,
          streamColor: color.stroke,
          streamGlowColor: color.glow,
          streamName: color.name,
          isMixed,
          sources,
        }
      }
    };
  });
}

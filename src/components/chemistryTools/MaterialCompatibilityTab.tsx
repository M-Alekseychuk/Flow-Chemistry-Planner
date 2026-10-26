import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle, 
  Search, 
  Filter, 
  Layers, 
  FlaskConical, 
  Eye, 
  ArrowRight, 
  Check, 
  Copy, 
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  FLOW_MATERIALS, 
  CHEMICAL_SUBSTANCES, 
  COMPATIBILITY_DATA, 
  getMaterialCompatibility,
  ChemicalCategory,
  FlowMaterial,
  ChemicalSubstance,
  CompatibilityRating,
  RatingDetail,
  matchSubstanceFromFeed
} from '../../lib/materialCompatibilityData';
import { useAppContext } from '../../AppContext';

export default function MaterialCompatibilityTab() {
  const { currentProject, stoiRows } = useAppContext();

  const [activeView, setActiveView] = useState<'matrix' | 'inspector' | 'streamChecker' | 'materialsGuide'>('matrix');
  const [selectedCategory, setSelectedCategory] = useState<ChemicalCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChemicalId, setSelectedChemicalId] = useState<string>('hcl');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ss316');
  const [ratingFilter, setRatingFilter] = useState<'all' | CompatibilityRating>('all');
  const [copiedNote, setCopiedNote] = useState(false);

  // Filtered chemicals based on category and search
  const filteredChemicals = useMemo(() => {
    return CHEMICAL_SUBSTANCES.filter((chem) => {
      const matchesCategory = selectedCategory === 'all' || chem.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        chem.name.toLowerCase().includes(q) ||
        chem.formula.toLowerCase().includes(q) ||
        (chem.cas && chem.cas.includes(q)) ||
        chem.description.toLowerCase().includes(q);
      
      if (!matchesCategory || !matchesSearch) return false;

      if (ratingFilter !== 'all') {
        const row = COMPATIBILITY_DATA[chem.id];
        if (!row) return false;
        // Check if any material has this rating
        return Object.values(row).some(r => r.rating === ratingFilter);
      }

      return true;
    });
  }, [selectedCategory, searchQuery, ratingFilter]);

  const selectedChemical = useMemo(() => {
    return CHEMICAL_SUBSTANCES.find(c => c.id === selectedChemicalId) || CHEMICAL_SUBSTANCES[0];
  }, [selectedChemicalId]);

  const selectedMaterial = useMemo(() => {
    return FLOW_MATERIALS.find(m => m.id === selectedMaterialId) || FLOW_MATERIALS[0];
  }, [selectedMaterialId]);

  const currentPairRating = useMemo(() => {
    return getMaterialCompatibility(selectedChemical.id, selectedMaterial.id);
  }, [selectedChemical, selectedMaterial]);

  // Diagram Analysis: detect streams in the current project
  const streamAudit = useMemo(() => {
    if (!currentProject?.flowData) {
      return { totalEdges: 0, checkedStreams: [], warningCount: 0 };
    }

    const { nodes, edges } = currentProject.flowData;
    const feedNodes = (nodes || []).filter((n: any) => n.type === 'reagent' || n.type === 'stoiReagent');
    const checkedStreams: Array<{
      edgeId: string;
      sourceName: string;
      targetName: string;
      material: string;
      matchedChemical?: ChemicalSubstance;
      rating?: RatingDetail;
      isDangerous: boolean;
    }> = [];

    let warningCount = 0;

    (edges || []).forEach((edge: any) => {
      const sourceNode = (nodes || []).find((n: any) => n.id === edge.source);
      const targetNode = (nodes || []).find((n: any) => n.id === edge.target);
      const materialCode = (edge.data?.material || 'PFA').toLowerCase();
      
      // Determine what chemical is in this stream:
      // Try to match from source node name, solvent, or stoiRows
      let chemCandidate: ChemicalSubstance | undefined;

      if (sourceNode?.data?.solvent) {
        chemCandidate = matchSubstanceFromFeed(sourceNode.data.solvent);
      }
      if (!chemCandidate && sourceNode?.data?.name) {
        chemCandidate = matchSubstanceFromFeed(sourceNode.data.name);
      }
      if (!chemCandidate && stoiRows && stoiRows.length > 0) {
        for (const row of stoiRows) {
          if (row.solvent) {
            chemCandidate = matchSubstanceFromFeed(row.solvent);
            if (chemCandidate) break;
          }
          if (row.name) {
            chemCandidate = matchSubstanceFromFeed(row.name);
            if (chemCandidate) break;
          }
        }
      }

      // Default to water if feed was found but generic
      if (!chemCandidate && sourceNode && (sourceNode.type === 'reagent' || sourceNode.type === 'stoiReagent')) {
        chemCandidate = matchSubstanceFromFeed('water');
      }

      let rating: RatingDetail | undefined;
      let isDangerous = false;

      if (chemCandidate) {
        rating = getMaterialCompatibility(chemCandidate.id, materialCode);
        if (rating.rating === 'D' || rating.rating === 'C') {
          isDangerous = true;
          warningCount++;
        }
      }

      checkedStreams.push({
        edgeId: edge.id,
        sourceName: sourceNode?.data?.label || sourceNode?.data?.name || sourceNode?.id || 'Source',
        targetName: targetNode?.data?.label || targetNode?.data?.name || targetNode?.id || 'Target',
        material: edge.data?.material || 'PFA',
        matchedChemical: chemCandidate,
        rating,
        isDangerous
      });
    });

    return {
      totalEdges: edges?.length || 0,
      checkedStreams,
      warningCount
    };
  }, [currentProject, stoiRows]);

  const handleCopySummary = () => {
    const text = `Flow Chemistry Material Compatibility:
Chemical: ${selectedChemical.name} (${selectedChemical.formula})
Material: ${selectedMaterial.name}
Rating: ${currentPairRating.rating} - ${currentPairRating.ratingLabel}
Max Recommended Temp: ${currentPairRating.maxTemp}
Notes: ${currentPairRating.notes || 'N/A'}
${currentPairRating.hazard ? `Hazard: ${currentPairRating.hazard}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  // Helper for styling rating badge
  const getRatingBadge = (rating: CompatibilityRating, withLabel: boolean = false) => {
    switch (rating) {
      case 'A':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-bold rounded-md px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800`}>
            <ShieldCheck size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>A</span>
            {withLabel && <span className="font-sans font-medium text-[11px] ml-0.5">Excellent</span>}
          </span>
        );
      case 'B':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-bold rounded-md px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800`}>
            <CheckCircle2 size={12} className="shrink-0 text-blue-600 dark:text-blue-400" />
            <span>B</span>
            {withLabel && <span className="font-sans font-medium text-[11px] ml-0.5">Good</span>}
          </span>
        );
      case 'C':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-bold rounded-md px-1.5 py-0.5 text-xs bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800`}>
            <AlertTriangle size={12} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>C</span>
            {withLabel && <span className="font-sans font-medium text-[11px] ml-0.5">Caution</span>}
          </span>
        );
      case 'D':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-bold rounded-md px-1.5 py-0.5 text-xs bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800`}>
            <ShieldX size={12} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>D</span>
            {withLabel && <span className="font-sans font-medium text-[11px] ml-0.5">Incompatible</span>}
          </span>
        );
      default:
        return (
          <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            ?
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveView('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'matrix'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Compatibility Matrix</span>
          </button>
          <button
            onClick={() => setActiveView('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'inspector'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye size={14} />
            <span>Pairwise Inspector</span>
          </button>
          <button
            onClick={() => setActiveView('streamChecker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'streamChecker'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Active Stream Audit</span>
            {streamAudit.warningCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {streamAudit.warningCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('materialsGuide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'materialsGuide'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FlaskConical size={14} />
            <span>Materials Guide ({FLOW_MATERIALS.length})</span>
          </button>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Ratings:</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> A: Excellent
          </span>
          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> B: Good
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> C: Caution
          </span>
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> D: Incompatible
          </span>
        </div>
      </div>

      {/* VIEW 1: FULL COMPATIBILITY MATRIX */}
      {activeView === 'matrix' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
            {/* Category Segmented Filter */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All Chemicals' },
                  { id: 'solvent', label: 'Solvents' },
                  { id: 'acid', label: 'Acids' },
                  { id: 'base', label: 'Bases' },
                  { id: 'reagent', label: 'Reagents & Oxidizers' }
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input & Severity Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter chemical, formula, or CAS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="D">Show Hazards (D: Incompatible)</option>
                <option value="C">Show Caution (C: Fair)</option>
                <option value="A">Show Safe (A: Excellent)</option>
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[620px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700 dark:text-slate-200 min-w-[200px] border-r border-slate-200 dark:border-slate-700 sticky left-0 z-30 bg-slate-100 dark:bg-slate-800">
                      Chemical Substance
                    </th>
                    <th className="p-2.5 font-semibold text-slate-600 dark:text-slate-300 w-24 border-r border-slate-200 dark:border-slate-700 text-center">
                      Class
                    </th>
                    {FLOW_MATERIALS.map((mat) => (
                      <th
                        key={mat.id}
                        className="p-2.5 font-semibold text-slate-700 dark:text-slate-200 text-center min-w-[80px] border-r border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedMaterialId(mat.id);
                          setActiveView('inspector');
                        }}
                        title={`Click to inspect ${mat.name} (${mat.category})`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-[11px] text-cyan-700 dark:text-cyan-400">
                            {mat.shortName}
                          </span>
                          <span className="text-[9px] font-normal text-slate-400 dark:text-slate-400">
                            {mat.maxPressureBar} bar
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredChemicals.length === 0 ? (
                    <tr>
                      <td colSpan={FLOW_MATERIALS.length + 2} className="p-8 text-center text-slate-400">
                        No chemical substances match your current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredChemicals.map((chem) => (
                      <tr 
                        key={chem.id} 
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Chemical Info Column (Sticky Left) */}
                        <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 z-10">
                          <div className="flex items-center justify-between gap-1">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{chem.name}</span>
                                {chem.hazardNote && (
                                  <AlertTriangle size={13} className="text-amber-500 shrink-0" title={chem.hazardNote} />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>{chem.formula}</span>
                                {chem.cas && <span>· CAS {chem.cas}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedChemicalId(chem.id);
                                setActiveView('inspector');
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded transition-opacity cursor-pointer"
                              title="Inspect this chemical across all materials"
                            >
                              <ExternalLink size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Class Badge */}
                        <td className="p-2 text-center border-r border-slate-200 dark:border-slate-700">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                            chem.category === 'acid' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                              : chem.category === 'base'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                              : chem.category === 'reagent'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          }`}>
                            {chem.category}
                          </span>
                        </td>

                        {/* Material Columns */}
                        {FLOW_MATERIALS.map((mat) => {
                          const ratingDetail = getMaterialCompatibility(chem.id, mat.id);
                          return (
                            <td
                              key={mat.id}
                              onClick={() => {
                                setSelectedChemicalId(chem.id);
                                setSelectedMaterialId(mat.id);
                                setActiveView('inspector');
                              }}
                              className="p-1.5 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                              title={`${chem.name} + ${mat.name}: ${ratingDetail.rating} (${ratingDetail.ratingLabel})\nMax Temp: ${ratingDetail.maxTemp}\n${ratingDetail.notes || ''}`}
                            >
                              <div className="flex items-center justify-center">
                                {getRatingBadge(ratingDetail.rating)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Showing {filteredChemicals.length} chemical substances across {FLOW_MATERIALS.length} reactor materials.</span>
              <span className="italic">Click any cell to open deep-dive breakdown in Pairwise Inspector.</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PAIRWISE INSPECTOR */}
      {activeView === 'inspector' && (
        <div className="space-y-5">
          {/* Selectors Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Chemical Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Chemical / Reagent
              </label>
              <select
                value={selectedChemicalId}
                onChange={(e) => setSelectedChemicalId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <optgroup label="Organic & Aqueous Solvents">
                  {CHEMICAL_SUBSTANCES.filter(c => c.category === 'solvent').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.formula})</option>
                  ))}
                </optgroup>
                <optgroup label="Mineral & Organic Acids">
                  {CHEMICAL_SUBSTANCES.filter(c => c.category === 'acid').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.formula})</option>
                  ))}
                </optgroup>
                <optgroup label="Bases & Alkalis">
                  {CHEMICAL_SUBSTANCES.filter(c => c.category === 'base').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.formula})</option>
                  ))}
                </optgroup>
                <optgroup label="Reactive Reagents & Oxidizers">
                  {CHEMICAL_SUBSTANCES.filter(c => c.category === 'reagent').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.formula})</option>
                  ))}
                </optgroup>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {selectedChemical.description}
              </p>
            </div>

            {/* Material Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Flow Material / Tubing / Seal
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <optgroup label="Fluoropolymers">
                  {FLOW_MATERIALS.filter(m => m.category === 'Fluoropolymer').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.maxPressureBar} bar max)</option>
                  ))}
                </optgroup>
                <optgroup label="Engineering Polymers">
                  {FLOW_MATERIALS.filter(m => m.category === 'Polymer').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.maxPressureBar} bar max)</option>
                  ))}
                </optgroup>
                <optgroup label="Corrosion-Resistant Metal Alloys">
                  {FLOW_MATERIALS.filter(m => m.category === 'Metal Alloy').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.maxPressureBar} bar max)</option>
                  ))}
                </optgroup>
                <optgroup label="Inorganics, Glass & Ceramics">
                  {FLOW_MATERIALS.filter(m => m.category === 'Inorganic / Ceramic').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.maxPressureBar} bar max)</option>
                  ))}
                </optgroup>
                <optgroup label="Elastomer Seals & O-Rings">
                  {FLOW_MATERIALS.filter(m => m.category === 'Elastomer Seal').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.maxPressureBar} bar max)</option>
                  ))}
                </optgroup>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {selectedMaterial.typicalUse}
              </p>
            </div>
          </div>

          {/* Compatibility Verdict Card */}
          <div className={`p-5 rounded-2xl border transition-all ${
            currentPairRating.rating === 'A'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
              : currentPairRating.rating === 'B'
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
              : currentPairRating.rating === 'C'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl font-mono ${
                  currentPairRating.rating === 'A'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md'
                    : currentPairRating.rating === 'B'
                    ? 'bg-blue-600 text-white shadow-blue-600/30 shadow-md'
                    : currentPairRating.rating === 'C'
                    ? 'bg-amber-500 text-white shadow-amber-500/30 shadow-md'
                    : 'bg-rose-600 text-white shadow-rose-600/30 shadow-md'
                }`}>
                  {currentPairRating.rating}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Rating: {currentPairRating.ratingLabel}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                      Max Temp: {currentPairRating.maxTemp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Compatibility evaluation between <span className="font-semibold">{selectedChemical.name}</span> and <span className="font-semibold">{selectedMaterial.name}</span>.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 self-start md:self-auto cursor-pointer transition-all"
              >
                {copiedNote ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedNote ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>
            </div>

            {/* Technical Mechanism & Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <Info size={14} className="text-cyan-600" />
                  <span>Chemical Behavior &amp; Degradation Notes</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentPairRating.notes || 'No adverse degradation observed under typical continuous flow operating conditions.'}
                </p>
                {currentPairRating.hazard && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                    <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Hazard Warning:</strong> {currentPairRating.hazard}</span>
                  </div>
                )}
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Engineering Operating Limits</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Material Pressure Rating:</span>
                    <span className="font-mono font-semibold">{selectedMaterial.maxPressureBar} bar</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Continuous Temp Window:</span>
                    <span className="font-mono font-semibold">{selectedMaterial.minTempCelsius}°C to {selectedMaterial.maxTempCelsius}°C</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Optical Transmission:</span>
                    <span className="font-medium">{selectedMaterial.transparency}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Primary Vulnerability:</span>
                    <span className="text-[11px] text-right max-w-[200px] text-slate-600 dark:text-slate-300">{selectedMaterial.primaryVulnerabilities}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Comparison Across All Materials for Selected Chemical */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Full Material Spectrum for {selectedChemical.name}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {FLOW_MATERIALS.map((mat) => {
                const r = getMaterialCompatibility(selectedChemical.id, mat.id);
                const isCurrent = mat.id === selectedMaterial.id;
                return (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                      <span className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">
                        {mat.shortName}
                      </span>
                      {getRatingBadge(r.rating)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {r.maxTemp}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVE STREAM AUDIT (DIAGRAM-LINKED) */}
      {activeView === 'streamChecker' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Diagram Tubing &amp; Stream Verification
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-semibold">
                  {streamAudit.totalEdges} Stream Connections
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Audits all active tubing connections on your canvas against the feed solutions and solvents in your project.
              </p>
            </div>

            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              streamAudit.warningCount === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {streamAudit.warningCount === 0 ? (
                <>
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>All Tubing Streams Verified Safe</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} className="text-rose-600" />
                  <span>{streamAudit.warningCount} Chemical Incompatibility Alert{streamAudit.warningCount > 1 ? 's' : ''} Detected!</span>
                </>
              )}
            </div>
          </div>

          {/* Streams Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {streamAudit.checkedStreams.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FlaskConical size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-medium">No connection tubing edges found in current diagram.</p>
                <p className="text-xs text-slate-500 mt-1">Connect equipment modules on the canvas to audit stream compatibility.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Stream Connection</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Tubing Material</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Carried Substance</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-center">Compatibility</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Safety Analysis &amp; Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {streamAudit.checkedStreams.map((s, idx) => (
                      <tr key={idx} className={s.isDangerous ? 'bg-rose-50/40 dark:bg-rose-950/20' : 'hover:bg-slate-50/50'}>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[120px]">{s.sourceName}</span>
                            <ArrowRight size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{s.targetName}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                            {s.material}
                          </span>
                        </td>
                        <td className="p-3">
                          {s.matchedChemical ? (
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">{s.matchedChemical.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono ml-1">({s.matchedChemical.formula})</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Generic stream</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {s.rating ? getRatingBadge(s.rating.rating, true) : <span className="text-slate-400">?</span>}
                        </td>
                        <td className="p-3">
                          {s.rating?.hazard ? (
                            <div className="text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1 text-[11px]">
                              <AlertTriangle size={13} className="shrink-0" />
                              <span>{s.rating.hazard}</span>
                            </div>
                          ) : s.rating?.notes ? (
                            <span className="text-slate-600 dark:text-slate-300 text-[11px]">{s.rating.notes}</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Nominal flow compatibility.</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: MATERIALS GUIDE & TECHNICAL SPECS */}
      {activeView === 'materialsGuide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FLOW_MATERIALS.map((mat) => (
            <div
              key={mat.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {mat.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {mat.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  {mat.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Pressure:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{mat.maxPressureBar} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temp Range:</span>
                    <span className="font-mono font-semibold">{mat.minTempCelsius}°C to {mat.maxTempCelsius}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Optical Property:</span>
                    <span className="font-medium">{mat.transparency}</span>
                  </div>
                </div>

                <div className="text-[11px] space-y-1.5">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Typical Flow Use: </span>
                    <span className="text-slate-500 dark:text-slate-400">{mat.typicalUse}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">Known Vulnerabilities: </span>
                    <span className="text-slate-500 dark:text-slate-400">{mat.primaryVulnerabilities}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedMaterialId(mat.id);
                    setActiveView('inspector');
                  }}
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Chemicals</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

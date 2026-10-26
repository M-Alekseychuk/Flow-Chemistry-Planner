# AI Coding Agents Operating Guidelines (`AGENTS.md`)

Welcome, AI Engineer. This file establishes the operational constitution, design patterns, and engineering invariants for building, refactoring, and maintaining **Flow Chemistry Designer**.

---

## 1. Prime Directives & Anti-Breakage Rules

1. **Maintain Two-Way Feed Synchronization**:
   - `stoiRows` in `AppContext` and canvas feed nodes (`reagent` / `stoiReagent`) must always stay synchronized.
   - Do not disconnect `rowId` or remove name/concentration/solvent reconciliation in `FlowCanvas.tsx` and `CustomNodes.tsx`.

2. **No Redundant Procedure Report**:
   - The interactive HTML procedure report was intentionally removed based on direct user feedback (see `docs/memory/decisions.md` ADR-002).
   - Do not re-add HTML procedure report generation or procedure report buttons unless explicitly requested by the user from scratch.
   - Keep the PDF report generator (`src/lib/reportGenerator.ts`) clean and functional.

3. **Colorblind Accessibility Invariant**:
   - The stream color mode toggle (`isMultiColorStreams`) must always support both vibrant color-tracing and the high-contrast uniform slate stroke (`#1e293b`).

4. **Port & Runtime**:
   - The development server runs on **port 3000** (`vite --port=3000 --host=0.0.0.0`).
   - Do not introduce native blocking dialogs (`window.alert`, `window.confirm`, `window.prompt`) as they freeze in embedded sandbox iframes.

5. **Client-Authoritative Architecture**:
   - Do not add mock backend endpoints or external database servers unless requested. State resides in `localStorage` and JSON file exports.

---

## 2. Directory & Component Boundaries

```
src/
├── components/          # Pure React UI components
│   ├── chemistryTools/  # Specialized chemistry calculators & tables
│   ├── CustomNodes.tsx  # React Flow node definitions (Pumps, Reactors, Feed, etc.)
│   ├── FlowCanvas.tsx   # React Flow canvas wrapper, undo/redo, auto-save
│   ├── Dashboard.tsx    # Project management and JSON file import
│   ├── Calculators.tsx  # Sidebar calculators and Feed Solutions table
│   └── NodePalette.tsx  # Draggable equipment catalog
├── lib/                 # Core domain logic, simulation & PDF rendering
│   ├── simulation.ts    # Hydraulic solver and topological sorting engine
│   ├── reportGenerator.ts # Vector PDF generation using jsPDF
│   └── branding.ts      # Logo caching and dimension management
├── AppContext.tsx       # Global application state and event dispatch
└── types.ts             # Source-of-truth TypeScript definitions
```

---

## 3. Engineering Workflows & Validation

Before finalizing any changes or ending a turn:
1. **Lint & Type Check**:
   ```bash
   npm run lint # Runs tsc --noEmit
   ```
   Must pass with zero TypeScript compilation errors.
2. **Build Verification**:
   ```bash
   npm run build
   ```
   Must produce a clean, optimized Vite distribution bundle.
3. **No Unused Imports**:
   Always remove unused icon imports or orphaned helpers when editing components.

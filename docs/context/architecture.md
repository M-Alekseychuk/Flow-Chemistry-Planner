# Architecture & System Design

## Overview
**Flow Chemistry Designer** is a browser-based, high-performance visual diagramming and engineering calculation suite tailored for flow chemists, process development engineers, and continuous manufacturing specialists. It provides an intuitive nodal interface for modeling continuous reactors, pumps, mixers, pressure regulators, and analytical sensors, coupled with real-time fluid dynamics simulations, stoichiometry tracking, and branded report exports.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 (TypeScript) | Reactive functional UI with hooks |
| **Bundler / Dev Server** | Vite 6 | Fast HMR and optimized production bundles |
| **Canvas & Graph Engine** | `@xyflow/react` (v12) | Interactive nodal flow canvas, topological graph processing |
| **Styling** | Tailwind CSS v4 | Utility-first styling with dark/light mode support |
| **Icons** | Lucide React | Clean, domain-appropriate UI and module icons |
| **Reporting / Export** | `jspdf`, `html-to-image` | High-resolution branded PDF export and canvas rasterization |
| **State Persistence** | `localStorage` + JSON Import/Export | Client-authoritative zero-database local persistence |

---

## Component Hierarchy & Directory Architecture

```
src/
├── App.tsx                     # Top-level shell with Navbar, dark mode toggle, stream color switch
├── AppContext.tsx              # Global state provider (projects, custom modules, stoiRows, branding)
├── main.tsx                    # React root entry point
├── types.ts                    # Core TypeScript domain definitions and schemas
├── lib/
│   ├── branding.ts             # Custom lab logo persistence, sizing, and default fallback
│   ├── chemistryToolsData.ts   # Solvent libraries, tubing gauges, and Antoine coefficients
│   ├── defaultLogo.ts          # Embedded default logo data
│   ├── reportGenerator.ts      # Vector PDF generation engine with canvas capture
│   └── simulation.ts           # Topological sort, fluid dynamics, and stream color propagation
└── components/
    ├── AppLogo.tsx             # Responsive navbar logo with custom branding modal trigger
    ├── BrandingModal.tsx       # Logo upload, sizing slider, and preview modal
    ├── Calculators.tsx         # Sidebar Calculators tab (Feed Solutions, Vol, Res Time, STY, Converter)
    ├── CustomModuleModal.tsx   # Modal for creating/editing reusable custom equipment
    ├── CustomNodes.tsx         # Custom React Flow node components (Reactors, Pumps, Mixers, Feed Solutions)
    ├── Dashboard.tsx           # Project manager (cards, edit metadata, delete/restore, JSON import)
    ├── FlowCanvas.tsx          # Main React Flow interactive canvas, toolbar, undo/redo, auto-save
    ├── NodePalette.tsx         # Sidebar Equipment tab with draggable built-in and custom modules
    ├── PdfReportModal.tsx      # Branded PDF report configuration and export modal
    ├── Sidebar.tsx             # Collapsible left panel switching between Equipment & Calculators
    └── chemistryTools/         # Specialized chemical calculation modal utilities
        ├── CapillaryPressureCalculator.tsx
        ├── ChemistryToolsHub.tsx
        ├── MiscibilityMatrix.tsx
        ├── PressureBoilingPointCalculator.tsx
        └── SolventMixingCalculator.tsx
```

---

## State Flow & Data Contracts

```
                   ┌───────────────────────────────┐
                   │          AppContext           │
                   │  - projects, currentProject   │
                   │  - stoiRows (Feed Solutions)  │
                   │  - customModules (Templates)  │
                   │  - isDarkMode, flowRateUnit   │
                   │  - isMultiColorStreams        │
                   └───────────────┬───────────────┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│     Sidebar      │                              │    FlowCanvas    │
│ - NodePalette    │ ─── Drag & Drop (Nodes) ───► │ - React Flow     │
│ - Calculators    │ ◄── Two-Way Synchronization ─► - Nodes & Edges  │
│   (stoiRows)     │     (Feed Solution names)    │ - runSimulation  │
└──────────────────┘                              └─────────┬────────┘
                                                            │
                                                            ▼
                                                  ┌──────────────────┐
                                                  │ PDF Report Modal │
                                                  │ - Canvas capture │
                                                  │ - jsPDF Document │
                                                  └──────────────────┘
```

### Key State Contracts:
1. **Feed Solution Two-Way Synchronization**:
   - `stoiRows` in `AppContext` drives the sidebar feed solutions list.
   - Canvas feed nodes (`reagent` and `stoiReagent`) reference `stoiRows` by `rowId`, name, or topological order.
   - Changes in either location reflect across both instantly without requiring manual refresh.
2. **Project Persistence**:
   - Project changes debounce to `localStorage` under `flow-projects`.
   - Projects can be exported to complete JSON files and imported directly from the main Dashboard.

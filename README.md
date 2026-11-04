# Flow Chemistry Designer

A browser-based visual diagramming, hydraulic modeling, and process engineering calculation suite designed specifically for continuous flow chemistry and process development.

---

## Key Features

- **Interactive Flow Process Canvas**:
  - Drag-and-drop nodal builder powered by `@xyflow/react`.
  - Comprehensive equipment library: Coil Reactors, Microreactors, Column Reactors, Photoreactors, Tube-in-Tube, CSTRs, Packed Beds, Syringe Pumps, HPLC Pumps, Peristaltic Pumps, Gear Pumps, Mass Flow Controllers (MFC), Back-Pressure Regulators (BPR), Pressure/Temperature Sensors, and Liquid-Liquid Membrane Separators (Zaiput).
  - Multi-level Undo/Redo (`Cmd+Z` / `Ctrl+Z`, `Cmd+Shift+Z` / `Ctrl+Y`) and snap-to-grid support.
  - Interactive tubing edges with in-line physical dimensions (inner diameter, length, material) and real-time hydraulic metrics.

- **Real-Time Hydraulic & Stoichiometric Simulation**:
  - Forward topological sort simulating volumetric flow rates ($Q$), residence times ($\tau$), concentrations ($C$), and Hagen-Poiseuille pressure drops ($\Delta P$).
  - Stoichiometric equivalence balancer automatically calculating pump delivery rates from concentration and limiting reagent benchmarks.
  - Two-way real-time synchronization between the sidebar **Feed Solutions** table and canvas modules.

- **Accessibility & Custom Stream Modes**:
  - Multi-color stream path tracing with color inheritance and mixed-stream detection.
  - Dedicated **Accessible Uniform Mode** switch for colorblind compatibility.
  - Light and Dark mode with responsive contrast.

- **Specialized Flow Chemistry Tools Hub**:
  - Solvent Miscibility Matrix.
  - Pressure-Boiling Point (Antoine equation) superheating calculator.
  - Capillary hydraulic pressure loss estimator.
  - Binary solvent volume contraction utility.

- **Custom Equipment Builder**:
  - Build custom modules with tailored ports (0 to 4 inputs/outputs), bespoke fields, unit selectors, and custom uploaded equipment photos.
  - Embedded portability: Custom modules travel with exported project JSON files.

- **Branded Executive PDF Export**:
  - High-resolution vector diagrams paired with equipment Bill of Materials (BOM), operating conditions, and customizable lab logo branding.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
```bash
git clone <repository-url>
cd flow-chemistry-designer
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type-Checking & Verification
```bash
npm run lint    # Runs tsc --noEmit
npm run build   # Builds production bundle
```

---

## Core Documentation Structure

```
docs/
├── context/
│   ├── architecture.md           # High-level architecture and component hierarchy
│   ├── domain-flow-chemistry.md  # Chemical engineering formulas and physics
│   └── system-patterns.md        # Architectural invariants and synchronization contracts
├── spec/
│   ├── data-models.md            # TypeScript data models and storage keys
│   ├── simulation-engine.md      # Topological sort and hydraulic solver specification
│   └── features-spec.md          # Comprehensive features breakdown
├── memory/
│   ├── decisions.md              # Architecture Decision Records (ADRs)
│   └── state-reference.md        # Active runtime state and verification checklist
└── task/
    ├── backlog.md                # Future roadmap and planned enhancements
    └── completed.md              # Changelog and completed milestones
```

---

## License
MIT

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](package.json)

# Flow Chemistry Designer

A beginner-friendly, graphical continuous flow chemistry planning tool that allows for visualization of complex setups by dragging standardized (or custom) modules onto a canvas and connecting them.

---

## Key Features

- **Interactive Flow Process Canvas**:
  - Drag-and-drop nodal builder powered by `@xyflow/react`.
  - Comprehensive equipment library: Coil Reactors, Microreactors, Column Reactors, Photoreactors, Tube-in-Tube, CSTRs, Packed Beds, Syringe Pumps, HPLC Pumps, Peristaltic Pumps, Gear Pumps, Mass Flow Controllers (MFC), Back-Pressure Regulators (BPR), Pressure/Temperature Sensors, 4-Port Switching Valves, Liquid-Liquid Membrane Separators (Zaiput), Collection Flasks, Fraction Collectors, and Free Text Notes.
  - Center-preserving snap-to-grid support and horizontal/vertical auto-alignment utilities for multi-selected modules.
  - Interactive tubing edges with in-line physical dimensions (inner diameter in fractional inches or mm, length in cm or m, material: PFA, PTFE, FEP, ETFE, PEEK, Stainless Steel, Hastelloy) and real-time hydraulic metrics.
  - Toolbar with Pan mode, Box Selection mode, and multi-level Undo/Redo support.

- **Real-Time Hydraulic & Stoichiometric Simulation**:
  - Forward topological sort simulating volumetric flow rates ($Q$), residence times ($\tau$), concentrations ($C$), and fluid stream velocity.
  - Stoichiometric equivalence balancer automatically calculating pump delivery rates from concentration, stoichiometry ratios, and limiting reagent benchmarks.
  - Two-way real-time synchronization between the sidebar **Feed Solutions** table and canvas modules.

- **Built-in Engineering & Stoichiometry Calculators**:
  - Dedicated side-panel calculators for continuous processing:
    - **Reactor Volume**: Calculate required reactor sizing from target flow rate and residence time ($V = Q \cdot \tau$).
    - **Residence Time**: Compute residence times ($\tau = V / Q$) across various reactor geometries.
    - **Tubing Length & Internal Volume**: Estimate capillary tubing volume from inner diameter and physical length ($L = V / (\pi r^2)$).
    - **Total Flow Rate**: Calculate overall pump delivery requirements ($Q = V / \tau$).
    - **Space Time Yield (STY)**: Quantify volumetric productivity ($\text{kg} \cdot \text{m}^{-3} \cdot \text{h}^{-1}$) for reaction optimization and scale-up.
    - **Fluidic Unit Converter**: Instant bi-directional conversion between fractional/decimal inches and millimeters.
  - **Draggable Calculation Result Badges**: Drag any calculator output directly onto the canvas as an active live readout node.

- **Specialized Flow Chemistry Tools Hub**:
  - **Solvent Miscibility & Biphasic Extraction Matrix**: 32-solvent interactive matrix inspecting pairwise miscibility (Miscible, Partially Miscible, Immiscible), phase boundary formation, relative layer ordering (upper vs lower phase), and dielectric polarity differences for liquid-liquid extraction (LLE) in flow.
  - **Pressure-Boiling Point (Antoine VLE) & BPR Sizing Calculator**: Model solvent superheating in pressurized capillary microreactors up to 400°C; delineates subcooled liquid safe zones from flash evaporation risk zones with automated BPR setpoint recommendations.
  - **Capillary Hydraulic Pressure Loss Estimator**: Hagen-Poiseuille equation calculating pressure drops ($\Delta P$), laminar flow regimes, and shear rates through tubing segments.
  - **Solvent Mixing Contraction & Density Utility**: Non-ideal fluid thermodynamics engine calculating volume shrinkage, excess molar volume ($V^E$), and mixed density caused by intermolecular packing and hydrogen bonding.
  - **Wetted Materials & Chemical Compatibility Matrix**: Comprehensive chemical resistance ratings (A - Excellent, B - Good, C - Fair, D - Severe Effect) for 12 construction materials (PFA, PTFE, FEP, ETFE, PEEK, 316L Stainless Steel, Hastelloy C-276, Glass, Silicon Carbide, Titanium, Kalrez, Viton, EPDM) against diverse solvent classes, mineral acids, superbases, halogens, and oxidizers.

- **Custom Equipment Builder**:
  - Build custom modules with tailored ports (0 to 4 inputs/outputs), bespoke fields (text, number, select with unit selectors), and custom flow-source designation.
  - Equipment photo upload with dynamic card height auto-adjustment and direct on-canvas hover sizing controls (`[−] / [+]`).
  - Fallback schematic symbol presets (pump, reactor, vessel, sensor, valve, generic).
  - Embedded portability: Custom modules travel embedded within exported project JSON files.

- **Accessibility, Branding & Workspace Customization**:
  - Multi-color stream path tracing with color inheritance and mixed-stream detection.
  - Dedicated **Accessible Uniform Mode** switch for colorblind compatibility.
  - Global Light and Dark mode with responsive contrast.
  - Flow rate unit toggle (`mL/min` $\leftrightarrow$ `L/h`).
  - Custom organization logo upload with persistent storage, aspect-ratio preservation, and adjustable header height slider (24px to 64px).

- **Project Management & Portability**:
  - Multi-project dashboard with creation, renaming, and project descriptions/comments.
  - Full project JSON export and import for seamless offline sharing and backups.
  - Project Recycle Bin with restore and permanent deletion capabilities.
  - 100% offline

- **High-Resolution Branded PDF Export**:
  - Ultra-crisp 350+ DPI vector schematic diagram
  - Clean header displaying project name, project description, export date, and the software's active logo in the top-right corner.
  - **Physical Setup Photo Documentation**: Optional Page 2 attachment allowing physical laboratory or fume hood assembly photos to be embedded alongside the flow scheme with descriptive captions.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation

Either install latest version release (.exe)

or

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (Port 3000)
npm run dev

# 3. Type-check & lint
npm run lint

# 4. Production build
npm run build
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

## 🔒 Offline & Data Privacy

This application runs **100% locally**. Nothing is ever sent to external servers or third-party cloud services. Local calculations and saved sessions reside solely on youe device.

---

## 📄 License

GNU General Public License (GPL-3.0; https://www.gnu.org/licenses/gpl-3.0.html)

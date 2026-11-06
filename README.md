# Flow Chemistry Designer

A beginner friendly, graphical continuous flow chemistry planning tool that allows for visuallizion of complex setups by draging standardized (or custom) modules onto a canvas and conncting them. 

---

## Key Features

- **Interactive Flow Process Canvas**:
  - Drag-and-drop nodal builder powered by `@xyflow/react`.
  - Comprehensive equipment library: Coil Reactors, Microreactors, Column Reactors, Photoreactors, Tube-in-Tube, CSTRs, Packed Beds, Syringe Pumps, HPLC Pumps, Peristaltic Pumps, Gear Pumps, Mass Flow Controllers (MFC), Back-Pressure Regulators (BPR), Pressure/Temperature Sensors, and Liquid-Liquid Membrane Separators (Zaiput).
  - Snap-to-grid support.
  - Interactive tubing edges with in-line physical dimensions (inner diameter, length, material) and real-time hydraulic metrics.

- **Real-Time Hydraulic & Stoichiometric Simulation**:
  - Forward topological sort simulating volumetric flow rates ($Q$), residence times ($\tau$), and concentrations ($C$).
  - Stoichiometric equivalence balancer automatically calculating pump delivery rates from concentration and limiting reagent.
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

- **High-resolution PDF Export**:
  - High-resolution vector diagrams displaying operating parameters, branded customizable lab logo.

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

## License

GNU General Public License (GPL-3.0; https://www.gnu.org/licenses/gpl-3.0.html)

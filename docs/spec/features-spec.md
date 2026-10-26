# Features Specification

## 1. Project Management & Dashboard (`src/components/Dashboard.tsx`)
- **Project Cards**: Display project name, creation date, modification date, node count, edge count, and preview summary.
- **Inline Renaming**: Double-click or click edit icon to rename projects in place.
- **Recycle Bin**: Soft delete moves projects to a dedicated Bin view, allowing restore or permanent purge.
- **Direct JSON Import**: Button in the main menu dashboard imports `.json` scheme files directly, creating new projects with preserved viewports, nodes, edges, custom modules, and stoichiometry rows.
- **Project Search**: Real-time text filter across project titles and comments.

---

## 2. Interactive Flow Canvas (`src/components/FlowCanvas.tsx`)
- **Drag & Drop**: Modules dragged from the sidebar snap cleanly into position.
- **Snap to Grid**: Optional 16px grid snapping toggle in header.
- **Interactive Tubing Edges**:
  - In-line editable tubing dimensions (Inner Diameter: fractional inches `1/16"`, `1/8"`, `1/4"` or metric `mm`; Length: `cm` or `m`).
  - Material selector (`PFA`, `PTFE`, `Stainless Steel`, `PEEK`).
  - Real-time simulation badge displaying Flow Rate ($Q$), Residence Time ($\tau$), Concentration ($C$), Internal Volume ($V$), and Pressure Drop ($\Delta P$).
- **Undo / Redo**: Multi-level history stack with keyboard shortcuts (`Cmd+Z` / `Ctrl+Z`, `Cmd+Shift+Z` / `Ctrl+Y`).
- **Global Unit Switcher**: Instant toggle between `mL/min` and continuous pilot scale `L/h`.
- **Stream Color Mode Switcher**: Seamless switch between vibrant multi-color stream tracing and accessible uniform line styling.

---

## 3. Flow Chemistry Engineering Calculators (`src/components/Calculators.tsx`)
- **Feed Solutions (Reagents) & Stoichiometry**:
  - Live table of starting solutions with Concentration ($M$), Flow Rate ($\text{mL/min}$), and Carrier Solvent.
  - Limiting reagent selection and automatic stoichiometric equivalence calculation.
  - Interactive equivalence input: changing equivalents automatically updates the required pump flow rate.
  - Draggable directly onto the canvas as synchronized feed solution modules.
- **Residence Time Calculator**: Compute $\tau$ from internal diameter, length, and flow rate.
- **Tubing Length Calculator**: Calculate required tubing length for a target residence time and flow rate.
- **Flow Rate Calculator**: Determine needed flow rate given reactor volume and reaction time.
- **Space-Time Yield (STY)**: Calculate productivity in $\text{g}/(\text{L}\cdot\text{h})$ based on molecular weight, yield %, flow, and volume.
- **Two-Way Fractional Inch / Millimeter Converter**: Exact decimal and fractional conversions with quick presets (`1/16"`, `1/8"`, `1/4"`, etc.).

---

## 4. Specialized Chemistry Tools Hub (`src/components/chemistryTools/`)
- **Pressure-Boiling Point Calculator**: Solvents superheating curves based on Antoine coefficients across adjustable back-pressures.
- **Solvent Miscibility Matrix**: Comprehensive table of common flow chemistry solvents showing mutual solubility and biphasic extraction pairs.
- **Capillary Pressure Drop Estimator**: Hydraulic resistance estimation for various tubing gauges and solvent viscosities.
- **Solvent Mixing Contraction Utility**: Quantitative volume contraction calculator for mixed organic-aqueous flow streams.
- **Material Compatibility Matrix & Stream Auditor**: Compatibility evaluations for 12 wetted flow materials (PFA, PTFE, FEP, PEEK, SS316, Hastelloy C-276, Glass/Quartz, SiC, Titanium, FFKM, FKM, EPDM) across 31 chemicals (solvents, mineral/organic acids, bases, and reactive flow reagents like SOCl₂, Br₂, peroxides, and hydrides), with real-time active canvas diagram stream auditing.

---

## 5. Custom Module Designer (`src/components/CustomModuleModal.tsx`)
- Build customized equipment with bespoke port layouts (0 to 4 inputs and outputs).
- Add custom fields (numeric with units, text, or dropdown selections).
- Choose graphic representations: vector icon presets (Pump, Reactor, Vessel, Sensor, Valve, Generic) or upload laboratory equipment photos/diagrams.
- Custom modules automatically persist in localStorage and package within exported project JSONs.

---

## 6. Branded Executive PDF Report Generation (`src/lib/reportGenerator.ts`)
- **Vector Layout**: High-resolution canvas capture combined with scalable typography and tables.
- **Custom Branding**: Lab logo upload with display height tuning, custom report title, project metadata, and optional physical setup photo attachment.
- **BOM & Equipment Inventory**: Formatted table listing all reactors, pumps, sensors, regulators, and tubing lengths used in the flow campaign.

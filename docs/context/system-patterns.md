# System Patterns & Invariants

## Core Invariants

### 1. Two-Way State Synchronization (Sidebar &harr; Canvas)
Feed solutions configured in the sidebar (`AppContext.stoiRows`) must remain in lockstep with feed solution nodes placed on the React Flow canvas (`reagent` and `stoiReagent`).

- **Identification Priority**:
  1. Strict or string-coerced ID: `String(row.id) === String(node.data.rowId)`
  2. Case-insensitive exact name match: `row.name.trim().toLowerCase() === node.data.name.trim().toLowerCase()`
  3. Ordered feed index fallback: matching the $i$-th canvas feed node to $i$-th sidebar row.
- **Bi-directional Invariance**:
  - Editing in the sidebar (`Calculators.tsx`) triggers immediate state update on canvas node inputs.
  - Editing directly inside canvas node inputs updates `stoiRows` in `AppContext`.
  - Adding a new feed solution on canvas automatically provisions a row in `stoiRows`.

### 2. Topological Simulation Engine (`runSimulation`)
- Edges represent physical fluid transfer lines.
- Simulation runs forward through a directed acyclic graph (DAG) topological sort starting from roots (nodes with 0 incoming connections, e.g., pumps, feed solutions, gas bottles).
- Downstream nodes sum upstream volumetric flows:
  $$Q_{out} = \sum Q_{in}$$
  Concentrations undergo conservation of mass mixing:
  $$C_{out} = \frac{\sum (Q_{in} \cdot C_{in})}{Q_{out}}$$
- If a downstream node is an active pump or MFC, it overrides and establishes its own defined discharge rate.

### 3. Stream Color Inheritance & Accessible Uniform Mode
- Pure streams originating from a feed source carry that feed's signature color through all serial tubing connections.
- When two or more distinct streams converge into a mixer, the downstream edge transitions to a hash-deterministic **Mixed Stream** color palette.
- **Colorblind-Safe Uniform Mode**: The global toggle in the top navbar swaps multi-color streams with a high-contrast, accessible deep slate `#1e293b` / `#334155` stream with clear directional stroke dash arrays.

### 4. Zero-Data-Loss JSON Project Schema
- Project JSON export captures `nodes`, `edges`, `viewport`, `stoiRows`, and all embedded `customModules`.
- Projects imported from the main Dashboard reconstruct all components, populate the sidebar custom module registry, and restore exact canvas viewports.

### 5. High-Resolution Vector PDF Generation
- PDF generation rasterizes only the canvas diagram at high DPI ($2\times$ scale), combining it with vector text, metadata tables, and laboratory branding into a publication-grade PDF document.

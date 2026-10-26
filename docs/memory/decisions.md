# Architecture Decision Records (ADRs)

## ADR-001: Adoption of `@xyflow/react` (React Flow v12)
- **Status**: Accepted
- **Context**: Flow chemistry setups require custom drag handles, non-standard port orientations, in-line edge metrics (pressure, residence time, flow rate), and bidirectional edge styling.
- **Decision**: Use `@xyflow/react` with custom SVG nodes and custom edges (`CustomEdge`) rather than plain canvas or SVG wrappers.
- **Consequences**: Provides battle-tested zooming, panning, drag events, handle positioning, and export-readiness while keeping modular component logic cleanly in React.

---

## ADR-002: Removal of Static HTML Procedure Report in Favor of Vector PDF Export
- **Status**: Accepted
- **Context**: A previous interactive HTML procedure report option was attempted, but user feedback confirmed that an interactive HTML export was redundant and confusing compared to high-resolution publication-ready PDF exports.
- **Decision**: Completely decommission the HTML procedure report option from both the canvas toolbar and dashboard cards. Concentrate all reporting investment into high-resolution vector PDF export via `jspdf` and `html-to-image`.
- **Consequences**: Cleaner UX, less cognitive overhead for users, fewer moving parts, and reliable printing/archival for lab notebooks.

---

## ADR-003: Bi-directional Two-Way Sync for Feed Solutions
- **Status**: Accepted
- **Context**: Users frequently configure reagents in the sidebar calculator and expect canvas feed solution modules to reflect renamed solutions (e.g. *Bromide*, *Turbo Grignard*, *Borate*) and vice-versa.
- **Decision**: Implement a unified binding between `AppContext.stoiRows` and canvas nodes (`reagent` and `stoiReagent`). Canvas nodes read the matched `stoiRow` name, concentration, and solvent, and propagate updates back to `stoiRows` in real time.
- **Consequences**: Zero desynchronization between stoichiometry tables and flow schemes.

---

## ADR-004: Colorblind-Safe Accessible Uniform Stream Mode
- **Status**: Accepted
- **Context**: While multi-color stream tracing is aesthetically vibrant, users with red-green or blue-yellow color vision deficiencies need a clear, uniform line display.
- **Decision**: Provide a global toggle in the navbar to switch between multi-color stream tracing and an accessible high-contrast uniform slate stroke (`#1e293b` / `#334155`) with dashed directional lines.
- **Consequences**: Complete compliance with accessibility standards without sacrificing multi-color stream visualization for users who prefer it.

---

## ADR-005: Embedded Custom Module Templates in Project JSON
- **Status**: Accepted
- **Context**: When sharing flow files between colleagues, custom user-defined equipment modules must not disappear or render as generic boxes on other machines.
- **Decision**: Project export packages all referenced `customModules` definitions directly inside the project JSON file, and importing automatically registers them into the user's sidebar.
- **Consequences**: Seamless portability across devices and researchers.

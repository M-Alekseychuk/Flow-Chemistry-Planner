# Completed Milestones & Changelog

## Milestone v1.2.0 — Default Branding Transition & Compatibility Hub

### 1. Default Branding: Open Process Chemistry Project (OPCP)
- Adopted OPCP (Open Process Chemistry Project) as the standard default built-in logo for the application.
- Bundled offline-first Base64 encoded logo in `src/lib/defaultLogo.ts` and static asset in `public/logo.png`.
- Preserved full user agency: users can upload custom organization/laboratory logos or restore the built-in OPCP default at any time via the Branding modal.
- Updated version indicator to `v1.2.0` across the application UI, header, and package manifest.

## Milestone v1.1 — Usability, Synchronization & Architecture Establishment

### 1. Feed Solution Two-Way Synchronization
- Synchronized sidebar Feed Solutions table with canvas feed solution nodes (`reagent` and `stoiReagent`).
- Editing reagent names, concentrations, or solvents on either the sidebar or canvas reflects in real time across the entire diagram.
- Added **Feed Solution** directly into the **Equipment** palette under *General* category.

### 2. Accessible Uniform Stream Option
- Implemented stream color switch in the top navbar next to the theme toggle.
- Added colorblind-compatible uniform stream styling (`#1e293b` / `#334155`) with high-contrast dashed direction lines.
- Feed solution modules dynamically inherit the background and border tints of their outgoing stream without cluttered text labels.

### 3. Dashboard Import & Custom Module Hydration
- Moved JSON project import to the main Dashboard view for a more logical workflow.
- Fixed custom module hydration: imported JSON files register embedded custom modules directly into the sidebar Custom Modules category.

### 4. Decommissioning of Redundant Procedure Report
- Removed the experimental HTML procedure report option from both canvas toolbar and dashboard cards as requested.
- Preserved and enhanced publication-ready high-resolution branded vector PDF export (`jspdf`).

### 5. Core-Doc Documentation Architecture
- Established comprehensive documentation repository (`docs/context/`, `docs/spec/`, `docs/memory/`, `docs/task/`).
- Added root `AGENTS.md`, `CLAUDE.md`, and `README.md`.
- Added boundary validation script in `scripts/check-boundaries.sh`.

### 6. Wetted Material Compatibility Matrix & Stream Auditor
- Added dedicated **Material Compatibility** tab inside the Chemistry Tools Hub (`src/components/chemistryTools/MaterialCompatibilityTab.tsx`).
- Created comprehensive chemical compatibility database across 12 wetted flow materials (PFA, PTFE, FEP, PEEK, SS316, Hastelloy C-276, Borosilicate Glass/Quartz, SiC, Titanium, FFKM, FKM, EPDM) and 31 chemicals (solvents, mineral acids, organic acids, alkalis, and reactive flow reagents).
- Features 4 distinct views: Full Interactive Compatibility Matrix with search/filter, Pairwise Chemical Inspector with degradation notes & operating limits, Active Diagram Stream Auditor detecting tubing incompatibilities on the canvas, and Technical Materials Specification Guide.

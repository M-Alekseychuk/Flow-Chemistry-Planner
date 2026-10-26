# Task Backlog & Roadmap

## Planned Features & Enhancements

### 1. Canvas & Diagramming
- [ ] **Multi-selection & Group Dragging**: Support box-selection of multiple nodes and moving sub-circuits simultaneously.
- [ ] **Curved vs Orthogonal Tubing**: Provide a toggle for orthogonal (Manhattan / 90-degree) routing versus smooth Bezier curves.
- [ ] **Sub-circuit Templates**: Ability to save and reuse common configurations (e.g. "Grignard Addition Setup", "Photochemical Oxidation Loop").

### 2. Physical & Chemical Simulation
- [ ] **Reaction Kinetics Integration**: Simple Arrhenius kinetic model ($k = A e^{-E_a/RT}$) estimating conversion based on reactor temperature and residence time.
- [ ] **Gas-Liquid Slug Flow Estimator**: Taylor flow slug length and interfacial mass transfer coefficient ($k_L a$) estimations.
- [ ] **Solvent Viscosity Temperature Derating**: Viscosity curves adjusting Hagen-Poiseuille pressure loss across heated/chilled reactor stages.

### 3. Data & Export
- [ ] **CSV / Excel BOM Export**: Dedicated CSV export of equipment bill of materials and operating conditions for procurement and pilot plant technicians.
- [ ] **JSON Schema Validation**: Formal JSON Schema validator displaying descriptive errors if user uploads a malformed or corrupted file.
- [ ] **Keyboard Canvas Pan**: Quick canvas panning using Spacebar + Drag.

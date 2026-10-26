# Simulation Engine Specification

## Overview
The simulation engine (`src/lib/simulation.ts`) transforms a static visual flow diagram into an active hydraulic network model. It operates on the nodes, edges, and stoichiometry configuration to compute volumetric flow rates, molar concentrations, fluid pressure drops, and color-coded stream identity paths.

---

## 1. Topological Graph Traversal

### Algorithm
1. **Adjacency Construction**:
   Build incoming (`incomingEdges`) and outgoing (`outgoingEdges`) maps for all nodes.
2. **Roots Identification**:
   Identify root nodes where `inEdges.length === 0`. Pure sources include:
   - Feed Solutions (`reagent`, `stoiReagent`)
   - Standalone Pumps (`pump`, `hplcPump`, etc.)
   - Gas Bottles (`gasBottle`)
3. **Queue Processing**:
   Enqueue all root nodes. As each node executes:
   - Verify that all incoming edges have resolved flows. If not, re-queue until upstream dependencies satisfy.
   - Compute the node's total outgoing volumetric flow rate and mass balance.
   - Distribute outgoing flow equally across outgoing edges:
     $$Q_{edge} = \frac{Q_{node}}{N_{out}}$$
   - Enqueue downstream target nodes.
4. **Cycle Tolerance**:
   A visited set (`processedNodes`) ensures terminating execution even if visual cycles or recirculation loops are drawn.

---

## 2. Mass Balance & Fluid Mixing

### Node Outflow Calculation:
- **Pumps & Mass Flow Controllers (Active Driving Sources)**:
  $$Q_{out} = Q_{regulator}$$
  If input edges supply fluid to a pump, the pump drives this discharge rate forward.
- **Mixers & Passive Nodes (Pass-Through)**:
  $$Q_{out} = \sum_{j \in in} Q_{j}$$
  $$C_{out} = \frac{\sum_{j \in in} (Q_{j} \cdot C_{j})}{Q_{out}}$$
  If $Q_{out} = 0$, concentration preserves static initial values.

---

## 3. Stream Color Propagation & Identity

### Feed Color Palette
Feed solutions receive distinct, highly saturated colors in order of creation:
1. `Blue Stream` (`#2563eb`)
2. `Orange Stream` (`#ea580c`)
3. `Emerald Stream` (`#059669`)
4. `Violet Stream` (`#7c3aed`)
5. `Rose Stream` (`#e11d48`)
6. `Sky Stream` (`#0284c7`)
7. `Amber Stream` (`#d97706`)
8. `Teal Stream` (`#0d9488`)
9. `Fuchsia Stream` (`#c026d3`)
10. `Indigo Stream` (`#4f46e5`)

### Stream Convergence:
- When a single feed stream traverses piping, downstream edges retain that feed's specific color.
- When two or more unique feed streams converge into a mixer:
  $$\text{IsMixed} = \text{true}$$
  The stream color shifts to a deterministic composite palette based on a hash of the merged feed origins.
- In **Accessible Uniform Mode**, all streams render in deep slate `#1e293b` / `#334155` with distinct dash spacing for maximum contrast and universal colorblind safety.

---

## 4. Hydraulic Pressure Loss Calculation
For every interconnecting tubing edge:
1. Convert inner diameter from fractional inches (e.g. `1/16"`, `1/8"`) or millimeters to meters.
2. Convert length from centimeters or meters to meters.
3. Apply Hagen-Poiseuille formula:
   $$\Delta P_{Pa} = \frac{128 \, \mu \, L \, Q_{m^3/s}}{\pi \, d^4}$$
   $$\Delta P_{bar} = \frac{\Delta P_{Pa}}{10^5}$$
4. Output is rendered directly on the edge label in real time.

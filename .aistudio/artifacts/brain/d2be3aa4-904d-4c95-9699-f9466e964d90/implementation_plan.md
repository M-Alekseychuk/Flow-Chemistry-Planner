# Implementation Plan: Replace Glossary with Flow Chemistry Tools

This plan outlines replacing the Equipment Glossary with an interactive **Chemistry Tools** suite directly on the Dashboard, implementing the calculations and tools selected by the user.

## User Review Required
> [!IMPORTANT]
> - **Replacing Glossary**: The static "Equipment Glossary" tab on the Dashboard will be replaced with a multi-utility **Chemistry Tools** tab.
> - **Tools Suite**:
>   1. **Solvent Mixing & Contraction Calculator**: Volume and mass ratios, non-ideal shrinkage percentage, final mixture density, and excess volume curves.
>   2. **Pressure Boiling Point & BPR Sizing Calculator**: Elevated boiling points under reactor back-pressure, safe operating limits, and required BPR pressure for target superheating.
>   3. **Solvent Miscibility & Biphasic Extraction Matrix**: Pairwise miscibility lookup, upper/lower phase density determination, dielectric constants, and full grid view.
>   4. **Capillary Pressure Drop & Reynolds Flow Regime**: Hagen-Poiseuille pressure drop (bar and psi), fluid velocity, Reynolds number, and standard PEEK tubing presets.

---

## Proposed Changes

### 1. Data Models & Physics Calculations (`src/lib/chemistryToolsData.ts`)
Create a calculation and scientific data engine:
- **Solvent Database**:
  - Pure solvent thermophysical parameters: density ($\text{g/mL}$ at 20/25°C), molar mass, boiling point at 1 atm, dynamic viscosity ($\text{cP}$), dielectric constant ($\varepsilon$), and Antoine parameters ($A, B, C$) or enthalpy of vaporization ($\Delta H_{\text{vap}}$).
  - Common solvents included: Water, Methanol, Ethanol, Isopropanol (IPA), Acetonitrile (MeCN), Tetrahydrofuran (THF), Acetone, DMF, DMSO, Dichloromethane (DCM), Ethyl Acetate (EtOAc), Toluene, Hexane, Heptane, 1,4-Dioxane, Chloroform, Diethyl Ether.
- **Excess Volume & Contraction Modeling**:
  - Excess molar volume polynomial / Redlich-Kister coefficients for common aqueous-organic mixtures (Water+EtOH, Water+MeOH, Water+MeCN, Water+THF, Water+Acetone, Water+IPA, etc.).
  - Calculates:
    - Ideal unmixed volume sum vs actual contracted volume.
    - Contraction percentage: $\Delta V\% = \frac{V_{\text{mix}} - V_{\text{ideal}}}{V_{\text{ideal}}} \times 100\%$.
    - Mixture density: $\rho_{\text{mix}} = \frac{m_{\text{total}}}{V_{\text{mix}}}$.
    - Mass fractions ($w_A, w_B$) and mole fractions ($x_A, x_B$).
- **Pressure-Boiling Point Calculations**:
  - Antoine vapor pressure equation: $\log_{10}(P) = A - \frac{B}{T + C}$.
  - Two-way solver:
    - Given back-pressure $P$ $\rightarrow$ elevated boiling point $T_b(P)$ and safe operating ceiling ($T_b - 10^\circ\text{C}$).
    - Given reaction temperature $T_{\text{rxn}}$ $\rightarrow$ minimum Back-Pressure Regulator (BPR) setting needed to avoid vaporization/gas slugs.
- **Solvent Miscibility Matrix**:
  - Curated pairwise miscibility dataset (Miscible, Immiscible, Partially Miscible).
  - Relative density comparison indicating which solvent forms the upper vs lower phase in biphasic flow or extraction.
- **Microfluidic Hydraulics**:
  - Hagen-Poiseuille equation: $\Delta P = \frac{128 \mu L Q}{\pi D^4}$.
  - Reynolds number: $\text{Re} = \frac{\rho v D}{\mu}$.
  - Standard PEEK tubing color code presets (Red 0.13 mm, Yellow 0.18 mm, Blue 0.25 mm, Orange 0.50 mm, Green 0.75 mm, etc.).

---

### 2. Chemistry Tools UI Components (`src/components/chemistryTools/`)
Create modular components with a clean tabbed layout:
- `ChemistryToolsHub.tsx`: Main container with navigation buttons:
  - Solvent Mixing & Contraction
  - Pressure & Boiling Point
  - Miscibility Matrix
  - Capillary Pressure & Reynolds
- `SolventMixingCalculator.tsx`:
  - Select Solvent A and Solvent B with instant search/dropdown.
  - Dual modes: **Volume Ratio** (mL + mL or ratio) and **Mass Ratio** (wt% / g).
  - Metric summary cards: Total Unmixed Volume, Final Mixed Volume, Shrinkage %, Final Density ($\text{g/mL}$).
  - Visual composition bar and contraction graph across 0–100% mixture fraction.
- `PressureBoilingPointCalculator.tsx`:
  - Solvent selector or custom boiling point input.
  - Interactive pressure slider & manual input (bar / psi).
  - Visual temperature gauge showing ambient boiling point vs elevated boiling point under pressure.
  - Inverse mode: Input target reaction temperature to get minimum recommended BPR rating.
- `MiscibilityMatrix.tsx`:
  - Pairwise Inspector: Select two solvents to view miscibility, upper/lower phase visualization, and dielectric constants.
  - Full interactive filterable grid matrix.
- `CapillaryPressureCalculator.tsx`:
  - Tubing length, internal diameter (with quick PEEK color code selector), flow rate ($\text{mL/min}$ or $\mu\text{L/min}$), and viscosity (with auto-fill from selected solvent).
  - Outputs: Pressure drop ($\Delta P$ in bar and psi), linear fluid velocity ($\text{m/s}$), residence time, and Reynolds number with laminar/turbulent badge.

---

### 3. Dashboard Integration (`src/components/Dashboard.tsx`)
- In `Dashboard.tsx`:
  - Replace `activeTab === 'glossary'` with `activeTab === 'tools'`.
  - Update navigation button from "Glossary" with `BookOpen` icon to "Chemistry Tools" with `FlaskConical` icon.
  - Render the `<ChemistryToolsHub />` component in the tools view.

---

## Verification Plan

### Automated Verification
- Run `compile_applet` to check TypeScript compilation and bundle validity.
- Run `lint_applet` to ensure clean code standards.

### Manual Verification
- **Solvent Contraction Test**: Select Water + Ethanol at 50:50 volume ratio; verify volume shrinkage displays ~3.5% to 4% and final density is ~0.93 g/mL.
- **Mass Ratio Mode**: Switch to mass ratio (e.g. 50 g + 50 g Water/Ethanol) and verify accurate conversions.
- **Pressure-Boiling Point Test**: Select DCM ($T_b = 39.8^\circ\text{C}$); verify elevated boiling point at 10 bar is calculated > $100^\circ\text{C}$.
- **Miscibility Matrix Test**: Check Water + Ethyl Acetate (partially miscible, EtOAc top layer) and Water + DCM (immiscible, DCM bottom layer).
- **Capillary Hydraulics Test**: Test standard 1 m, 0.5 mm ID coil at 2 mL/min water; verify pressure drop and Reynolds number (< 2000, laminar flow).
- **Dark/Light Mode**: Check styling across both dark and light modes.

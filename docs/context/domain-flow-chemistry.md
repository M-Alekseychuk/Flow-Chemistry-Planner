# Flow Chemistry & Chemical Engineering Principles

## 1. Fundamental Quantities

### Residence Time ($\tau$)
Residence time represents the average duration that a reaction fluid element spends inside an active reactor volume.
$$\tau = \frac{V_R}{Q_{total}}$$
Where:
- $V_R$ is internal reactor volume ($\text{mL}$ or $\text{mm}^3$).
- $Q_{total}$ is total combined volumetric flow rate entering the reactor ($\text{mL/min}$).

### Tubing Internal Volume
For cylindrical tubing (PEEK, PFA, PTFE, Stainless Steel):
$$V = \pi \cdot \left(\frac{d_{ID}}{2}\right)^2 \cdot L$$
Where:
- $d_{ID}$ is the inner diameter (converted from fractional inches or $\text{mm}$ to $\text{cm}$).
- $L$ is tubing length ($\text{cm}$ or $\text{m}$).

---

## 2. Stoichiometry & Equivalence Balancing

Continuous flow reactions operate at steady-state molar flux rather than static batch molar ratios.

$$\text{Molar Flow Rate } \dot{n}_i = C_i \times Q_i \quad [\text{mmol/min}]$$

The **Limiting Reagent** ($lim$) dictates stoichiometric equivalents:
$$\text{Equivalents of Reagent } i = \frac{\dot{n}_i}{\dot{n}_{lim}} = \frac{C_i \cdot Q_i}{C_{lim} \cdot Q_{lim}}$$

When an engineer adjusts the desired equivalents on the canvas or sidebar, the required pump volumetric flow rate $Q_i$ is recalculated dynamically:
$$Q_i = \text{Equivalents} \times \frac{C_{lim} \cdot Q_{lim}}{C_i}$$

---

## 3. Laminar Fluid Dynamics & Capillary Pressure Drop

In microreactors and microbore capillary tubing, flow is almost strictly laminar ($\text{Re} \ll 2100$). The pressure drop across an interconnecting capillary edge is governed by the **Hagen-Poiseuille equation**:

$$\Delta P = \frac{128 \, \mu \, L \, Q}{\pi \, d_{ID}^4}$$

Where:
- $\mu$ is fluid dynamic viscosity ($\text{Pa}\cdot\text{s}$, typically $\approx 1.0 \times 10^{-3} \, \text{Pa}\cdot\text{s}$ for water/dilute solutions).
- $L$ is tubing length ($\text{m}$).
- $Q$ is volumetric flow rate ($\text{m}^3/\text{s}$).
- $d_{ID}$ is internal diameter ($\text{m}$).
- $\Delta P$ is pressure drop ($\text{Pa}$, converted to $\text{bar}$ or $\text{psi}$).

**Key Flow Chemistry Insight**: Pressure drop scales inversely with the *fourth power* of inner diameter ($d^4$). A reduction from $1.0\,\text{mm}$ to $0.5\,\text{mm}$ ID increases hydraulic backpressure by a factor of 16 for the same length and flow rate.

---

## 4. Space-Time Yield ($STY$)

Space-Time Yield characterizes volumetric reactor productivity per unit time:
$$STY = \frac{\text{Mass of Product Isolated } (\text{g})}{\text{Reactor Volume } (\text{L}) \times \text{Time } (\text{h})}$$
In continuous flow at steady state:
$$STY = \frac{Q_{total} \times (C_{reagent} / 1000) \times MW_{product} \times (\text{Yield} / 100) \times 60}{V_{reactor} / 1000} \quad \left[\frac{\text{g}}{\text{L} \cdot \text{h}}\right]$$

---

## 5. Solvent Excess & Miscibility

- **Binary Liquid Contraction**: When mixing organic solvents with aqueous buffers (e.g., Ethanol + Water), volumetric contraction of up to 4% occurs due to hydrogen-bonding network reorganization.
- **Pressurized Boiling Points**: Using back-pressure regulators (BPR), solvents can be superheated beyond their atmospheric boiling point without boiling, according to the **Antoine equation**:
  $$\log_{10}(P_{sat}) = A - \frac{B}{T + C}$$

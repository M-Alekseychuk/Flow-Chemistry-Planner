// Chemistry & Flow Reactor Physical Constants & Models

export interface SolventData {
  id: string;
  name: string;
  formula: string;
  cas: string;
  molarMass: number; // g/mol
  density: number; // g/mL at 20-25°C
  boilingPoint: number; // °C at 1 atm (1.01325 bar)
  viscosity: number; // cP (mPa·s) at 20°C
  dielectricConstant: number; // ε at 20°C
  // Antoine parameters: log10(P_mmHg) = A - (B / (T_celsius + C))
  // Valid temperature range [tMin, tMax] in °C
  antoine: {
    A: number;
    B: number;
    C: number;
    tMin: number;
    tMax: number;
  };
  safetyNotes?: string;
  color: string;
}

export const SOLVENTS: SolventData[] = [
  {
    id: 'water',
    name: 'Water',
    formula: 'H₂O',
    cas: '7732-18-5',
    molarMass: 18.015,
    density: 0.9982,
    boilingPoint: 100.0,
    viscosity: 1.002,
    dielectricConstant: 80.1,
    antoine: { A: 8.07131, B: 1730.63, C: 233.426, tMin: 1, tMax: 100 },
    color: '#0284c7'
  },
  {
    id: 'methanol',
    name: 'Methanol (MeOH)',
    formula: 'CH₃OH',
    cas: '67-56-1',
    molarMass: 32.04,
    density: 0.7914,
    boilingPoint: 64.7,
    viscosity: 0.544,
    dielectricConstant: 32.7,
    antoine: { A: 7.87863, B: 1473.11, C: 230.0, tMin: -11, tMax: 83 },
    color: '#0d9488'
  },
  {
    id: 'ethanol',
    name: 'Ethanol (EtOH)',
    formula: 'C₂H₅OH',
    cas: '64-17-5',
    molarMass: 46.07,
    density: 0.7893,
    boilingPoint: 78.37,
    viscosity: 1.200,
    dielectricConstant: 24.5,
    antoine: { A: 8.20417, B: 1642.89, C: 230.3, tMin: -3, tMax: 96 },
    color: '#10b981'
  },
  {
    id: 'isopropanol',
    name: 'Isopropanol (IPA)',
    formula: 'C₃H₈O',
    cas: '67-63-0',
    molarMass: 60.10,
    density: 0.7854,
    boilingPoint: 82.5,
    viscosity: 2.050,
    dielectricConstant: 19.9,
    antoine: { A: 8.11778, B: 1580.92, C: 219.61, tMin: 0, tMax: 101 },
    color: '#14b8a6'
  },
  {
    id: 'acetonitrile',
    name: 'Acetonitrile (MeCN)',
    formula: 'CH₃CN',
    cas: '75-05-8',
    molarMass: 41.05,
    density: 0.7860,
    boilingPoint: 81.6,
    viscosity: 0.369,
    dielectricConstant: 37.5,
    antoine: { A: 7.0735, B: 1279.2, C: 224.0, tMin: -10, tMax: 100 },
    color: '#6366f1'
  },
  {
    id: 'thf',
    name: 'Tetrahydrofuran (THF)',
    formula: 'C₄H₈O',
    cas: '109-99-9',
    molarMass: 72.11,
    density: 0.8876,
    boilingPoint: 66.0,
    viscosity: 0.480,
    dielectricConstant: 7.58,
    antoine: { A: 6.99515, B: 1202.29, C: 226.25, tMin: 23, tMax: 100 },
    color: '#8b5cf6'
  },
  {
    id: 'acetone',
    name: 'Acetone',
    formula: 'C₃H₆O',
    cas: '67-64-1',
    molarMass: 58.08,
    density: 0.7910,
    boilingPoint: 56.1,
    viscosity: 0.320,
    dielectricConstant: 20.7,
    antoine: { A: 7.02447, B: 1161.0, C: 224.0, tMin: -13, tMax: 55 },
    color: '#f59e0b'
  },
  {
    id: 'dcm',
    name: 'Dichloromethane (DCM)',
    formula: 'CH₂Cl₂',
    cas: '75-09-2',
    molarMass: 84.93,
    density: 1.3266,
    boilingPoint: 39.6,
    viscosity: 0.440,
    dielectricConstant: 8.93,
    antoine: { A: 7.08036, B: 1138.91, C: 231.45, tMin: -40, tMax: 40 },
    color: '#ef4444'
  },
  {
    id: 'ethyl_acetate',
    name: 'Ethyl Acetate (EtOAc)',
    formula: 'C₄H₈O₂',
    cas: '141-78-6',
    molarMass: 88.11,
    density: 0.9020,
    boilingPoint: 77.1,
    viscosity: 0.450,
    dielectricConstant: 6.02,
    antoine: { A: 7.09808, B: 1238.71, C: 217.0, tMin: 16, tMax: 76 },
    color: '#eab308'
  },
  {
    id: 'dmf',
    name: 'N,N-Dimethylformamide (DMF)',
    formula: 'C₃H₇NO',
    cas: '68-12-2',
    molarMass: 73.09,
    density: 0.9440,
    boilingPoint: 153.0,
    viscosity: 0.920,
    dielectricConstant: 36.7,
    antoine: { A: 6.7725, B: 1475.0, C: 200.0, tMin: 50, tMax: 160 },
    color: '#ec4899'
  },
  {
    id: 'dmso',
    name: 'Dimethyl Sulfoxide (DMSO)',
    formula: 'C₂H₆OS',
    cas: '67-68-5',
    molarMass: 78.13,
    density: 1.1004,
    boilingPoint: 189.0,
    viscosity: 1.996,
    dielectricConstant: 46.7,
    antoine: { A: 7.1856, B: 1667.0, C: 200.0, tMin: 20, tMax: 190 },
    color: '#a855f7'
  },
  {
    id: 'toluene',
    name: 'Toluene',
    formula: 'C₇H₈',
    cas: '108-88-3',
    molarMass: 92.14,
    density: 0.8669,
    boilingPoint: 110.6,
    viscosity: 0.590,
    dielectricConstant: 2.38,
    antoine: { A: 6.95464, B: 1344.8, C: 219.48, tMin: 35, tMax: 111 },
    color: '#84cc16'
  },
  {
    id: 'hexane',
    name: 'n-Hexane',
    formula: 'C₆H₁₄',
    cas: '110-54-3',
    molarMass: 86.18,
    density: 0.6548,
    boilingPoint: 68.7,
    viscosity: 0.300,
    dielectricConstant: 1.88,
    antoine: { A: 6.87776, B: 1171.53, C: 224.37, tMin: 13, tMax: 70 },
    color: '#06b6d4'
  },
  {
    id: 'heptane',
    name: 'n-Heptane',
    formula: 'C₇H₁₆',
    cas: '142-82-5',
    molarMass: 100.20,
    density: 0.6840,
    boilingPoint: 98.4,
    viscosity: 0.390,
    dielectricConstant: 1.92,
    antoine: { A: 6.9024, B: 1268.12, C: 216.99, tMin: 26, tMax: 99 },
    color: '#0ea5e9'
  },
  {
    id: 'dioxane',
    name: '1,4-Dioxane',
    formula: 'C₄H₈O₂',
    cas: '123-91-1',
    molarMass: 88.11,
    density: 1.0337,
    boilingPoint: 101.1,
    viscosity: 1.200,
    dielectricConstant: 2.21,
    antoine: { A: 7.0276, B: 1308.0, C: 216.0, tMin: 20, tMax: 105 },
    color: '#3b82f6'
  },
  {
    id: 'chloroform',
    name: 'Chloroform (CHCl₃)',
    formula: 'CHCl₃',
    cas: '67-66-3',
    molarMass: 119.38,
    density: 1.4890,
    boilingPoint: 61.2,
    viscosity: 0.560,
    dielectricConstant: 4.81,
    antoine: { A: 6.95465, B: 1170.97, C: 226.23, tMin: -10, tMax: 60 },
    color: '#f43f5e'
  },
  {
    id: 'ether',
    name: 'Diethyl Ether (Et₂O)',
    formula: 'C₄H₁₀O',
    cas: '60-29-7',
    molarMass: 74.12,
    density: 0.7134,
    boilingPoint: 34.6,
    viscosity: 0.230,
    dielectricConstant: 4.33,
    antoine: { A: 6.9862, B: 1090.64, C: 231.2, tMin: -15, tMax: 35 },
    color: '#d97706'
  },
  {
    id: '2methf',
    name: '2-Methyltetrahydrofuran (2-MeTHF)',
    formula: 'C₅H₁₀O',
    cas: '96-47-9',
    molarMass: 86.13,
    density: 0.8540,
    boilingPoint: 80.2,
    viscosity: 0.460,
    dielectricConstant: 6.97,
    antoine: { A: 7.012, B: 1245.0, C: 222.0, tMin: 10, tMax: 85 },
    color: '#10b981'
  }
];

// Helper to find solvent by ID
export function getSolvent(id: string): SolventData {
  return SOLVENTS.find(s => s.id === id) || SOLVENTS[0];
}

// ==========================================
// 1. SOLVENT MIXING CONTRACTION & DENSITY ENGINE
// ==========================================

// Redlich-Kister polynomial parameters for Excess Molar Volume:
// V_E = x1 * x2 * [ A0 + A1*(x1 - x2) + A2*(x1 - x2)^2 ] (cm³/mol)
interface RedlichKisterCoefficients {
  A0: number;
  A1: number;
  A2: number;
}

const REDLICH_KISTER_DATA: Record<string, RedlichKisterCoefficients> = {
  // Water + Alcohols (significant hydrogen-bonding volume contraction)
  'water:ethanol': { A0: -4.18, A1: -1.02, A2: -0.65 },
  'water:methanol': { A0: -3.95, A1: -1.50, A2: -0.55 },
  'water:isopropanol': { A0: -6.20, A1: -2.80, A2: -1.10 },
  // Water + Polar aprotic
  'water:acetonitrile': { A0: -2.85, A1: -0.92, A2: -0.41 },
  'water:acetone': { A0: -4.40, A1: -1.25, A2: -0.72 },
  'water:thf': { A0: -6.50, A1: -2.10, A2: -1.40 },
  'water:dioxane': { A0: -3.75, A1: -1.10, A2: -0.80 },
  'water:dmf': { A0: -4.80, A1: -1.30, A2: -0.60 },
  'water:dmso': { A0: -5.40, A1: -1.80, A2: -0.90 },
  // Organics
  'methanol:acetone': { A0: -0.50, A1: 0.10, A2: 0.05 },
  'ethanol:ethyl_acetate': { A0: -0.80, A1: -0.20, A2: 0.00 },
  'methanol:chloroform': { A0: -0.95, A1: -0.40, A2: 0.10 },
  'dcm:methanol': { A0: -0.65, A1: -0.15, A2: 0.00 }
};

export function getExcessMolarVolume(solventAId: string, solventBId: string, xA: number): number {
  if (solventAId === solventBId) return 0;
  const xB = 1 - xA;
  if (xA <= 0 || xB <= 0) return 0;

  const key1 = `${solventAId}:${solventBId}`;
  const key2 = `${solventBId}:${solventAId}`;

  let coeff = REDLICH_KISTER_DATA[key1];
  let deltaX = xA - xB;

  if (!coeff && REDLICH_KISTER_DATA[key2]) {
    coeff = REDLICH_KISTER_DATA[key2];
    deltaX = xB - xA; // Swap signs for odd powers
  }

  if (coeff) {
    return xA * xB * (coeff.A0 + coeff.A1 * deltaX + coeff.A2 * deltaX * deltaX);
  }

  // If both are water-miscible or general organic pairs, provide conservative regular solution estimate
  const sA = getSolvent(solventAId);
  const sB = getSolvent(solventBId);

  if ((sA.id === 'water' && sB.dielectricConstant > 15) || (sB.id === 'water' && sA.dielectricConstant > 15)) {
    // Generic water-polar contraction estimate
    return xA * xB * -3.2;
  }

  // Slight contraction / near-ideal
  return xA * xB * -0.2;
}

export interface MixtureCalculationResult {
  solventA: SolventData;
  solventB: SolventData;
  volumeA: number; // mL
  volumeB: number; // mL
  massA: number; // g
  massB: number; // g
  molesA: number;
  molesB: number;
  moleFractionA: number; // xA
  moleFractionB: number; // xB
  massFractionA: number; // wt%
  massFractionB: number; // wt%
  volFractionA: number; // v%
  volFractionB: number; // v%
  unmixedVolume: number; // mL
  actualMixedVolume: number; // mL
  volumeChange: number; // mL (negative for contraction)
  shrinkagePercent: number; // % (e.g. -3.6%)
  idealDensity: number; // g/mL
  finalDensity: number; // g/mL
  densityDifferencePercent: number; // %
  curvePoints: Array<{
    fractionA: number; // 0 to 1
    shrinkagePercent: number;
    mixedDensity: number;
  }>;
}

export function calculateSolventMixture(
  solventAId: string,
  solventBId: string,
  inputMode: 'volume' | 'mass',
  valA: number,
  valB: number
): MixtureCalculationResult {
  const sA = getSolvent(solventAId);
  const sB = getSolvent(solventBId);

  const safeValA = Math.max(0.001, isNaN(valA) ? 50 : valA);
  const safeValB = Math.max(0.001, isNaN(valB) ? 50 : valB);

  let volA: number;
  let volB: number;
  let massA: number;
  let massB: number;

  if (inputMode === 'volume') {
    volA = safeValA;
    volB = safeValB;
    massA = volA * sA.density;
    massB = volB * sB.density;
  } else {
    massA = safeValA;
    massB = safeValB;
    volA = massA / sA.density;
    volB = massB / sB.density;
  }

  const molesA = massA / sA.molarMass;
  const molesB = massB / sB.molarMass;
  const totalMoles = molesA + molesB;

  const moleFractionA = molesA / totalMoles;
  const moleFractionB = molesB / totalMoles;

  const totalMass = massA + massB;
  const massFractionA = (massA / totalMass) * 100;
  const massFractionB = (massB / totalMass) * 100;

  const unmixedVolume = volA + volB;
  const volFractionA = (volA / unmixedVolume) * 100;
  const volFractionB = (volB / unmixedVolume) * 100;

  // Excess molar volume (cm³/mol or mL/mol)
  const vExcessMolar = getExcessMolarVolume(solventAId, solventBId, moleFractionA);
  const totalExcessVolume = totalMoles * vExcessMolar; // mL

  // Mixed volume
  const actualMixedVolume = Math.max(0.001, unmixedVolume + totalExcessVolume);
  const volumeChange = actualMixedVolume - unmixedVolume;
  const shrinkagePercent = (volumeChange / unmixedVolume) * 100;

  const idealDensity = totalMass / unmixedVolume;
  const finalDensity = totalMass / actualMixedVolume;
  const densityDifferencePercent = ((finalDensity - idealDensity) / idealDensity) * 100;

  // Generate 21 curve points (0% to 100% of A)
  const curvePoints: Array<{ fractionA: number; shrinkagePercent: number; mixedDensity: number }> = [];
  const totalVolRef = 100; // 100 mL normalized base

  for (let i = 0; i <= 20; i++) {
    const fA = i / 20;
    const vA_step = fA * totalVolRef;
    const vB_step = (1 - fA) * totalVolRef;
    const mA_step = vA_step * sA.density;
    const mB_step = vB_step * sB.density;
    const nA_step = mA_step / sA.molarMass;
    const nB_step = mB_step / sB.molarMass;
    const nTot = nA_step + nB_step;
    const xA_step = nTot > 0 ? nA_step / nTot : fA;

    const vE_molar = getExcessMolarVolume(solventAId, solventBId, xA_step);
    const totVE = nTot * vE_molar;
    const vMix_step = Math.max(0.001, totalVolRef + totVE);
    const shrink_step = ((vMix_step - totalVolRef) / totalVolRef) * 100;
    const dens_step = (mA_step + mB_step) / vMix_step;

    curvePoints.push({
      fractionA: fA,
      shrinkagePercent: shrink_step,
      mixedDensity: dens_step
    });
  }

  return {
    solventA: sA,
    solventB: sB,
    volumeA: volA,
    volumeB: volB,
    massA,
    massB,
    molesA,
    molesB,
    moleFractionA,
    moleFractionB,
    massFractionA,
    massFractionB,
    volFractionA,
    volFractionB,
    unmixedVolume,
    actualMixedVolume,
    volumeChange,
    shrinkagePercent,
    idealDensity,
    finalDensity,
    densityDifferencePercent,
    curvePoints
  };
}

// ==========================================
// 2. PRESSURE BOILING POINT & BPR SIZING
// ==========================================

/**
 * Calculates elevated boiling point under back-pressure using Antoine equation:
 * log10(P_mmHg) = A - B / (T_C + C)
 * => T_C = B / (A - log10(P_mmHg)) - C
 * 
 * 1 bar = 750.062 mmHg
 */
export function calculateElevatedBoilingPoint(solventId: string, pressureBar: number): {
  boilingPointCelsius: number;
  boilingPointAmbient: number;
  pressureBar: number;
  pressurePsi: number;
  safeOperatingCeiling: number; // Tb - 10°C (recommended flow reactor limit)
  superheatingPotential: number; // Tb(P) - Tb(ambient)
} {
  const solvent = getSolvent(solventId);
  const pBar = Math.max(0.05, pressureBar);
  const pPsi = pBar * 14.5038;
  const pMmHg = pBar * 750.062;

  const { A, B, C } = solvent.antoine;
  const denominator = A - Math.log10(pMmHg);

  let tbElevated = solvent.boilingPoint;
  if (denominator > 0.1) {
    tbElevated = B / denominator - C;
  } else {
    // Extrapolation guard
    tbElevated = solvent.boilingPoint + Math.log(pBar) * 35;
  }

  const safeCeiling = tbElevated - 10;
  const superheatingPotential = tbElevated - solvent.boilingPoint;

  return {
    boilingPointCelsius: Number(tbElevated.toFixed(1)),
    boilingPointAmbient: solvent.boilingPoint,
    pressureBar: pBar,
    pressurePsi: Number(pPsi.toFixed(1)),
    safeOperatingCeiling: Number(safeCeiling.toFixed(1)),
    superheatingPotential: Number(superheatingPotential.toFixed(1))
  };
}

/**
 * Given target reaction temperature, calculates minimum required BPR pressure
 * to suppress boiling and avoid bubble/cavitation slug formation.
 */
export function calculateRequiredBPR(solventId: string, reactionTempCelsius: number): {
  solvent: SolventData;
  targetTemp: number;
  vaporPressureBar: number;
  recommendedBprBar: number; // Vapor pressure + 2 to 3 bar safety margin
  recommendedBprPsi: number;
  ambientBoilingPoint: number;
  isSuperheated: boolean;
} {
  const solvent = getSolvent(solventId);
  const { A, B, C } = solvent.antoine;

  // log10(P_mmHg) = A - B / (T + C)
  const logP = A - B / (reactionTempCelsius + C);
  const pMmHg = Math.pow(10, logP);
  const vaporPressureBar = Math.max(0.01, pMmHg / 750.062);

  // Safety margin: 2.5 bar above vapor pressure (standard flow chemistry rule of thumb)
  // to avoid degassing and dissolved gas release
  const recommendedBprBar = Math.max(1.0, Number((vaporPressureBar + 2.5).toFixed(1)));
  const recommendedBprPsi = Number((recommendedBprBar * 14.5038).toFixed(1));

  return {
    solvent,
    targetTemp: reactionTempCelsius,
    vaporPressureBar: Number(vaporPressureBar.toFixed(2)),
    recommendedBprBar,
    recommendedBprPsi,
    ambientBoilingPoint: solvent.boilingPoint,
    isSuperheated: reactionTempCelsius > solvent.boilingPoint
  };
}

// ==========================================
// 3. SOLVENT MISCIBILITY MATRIX
// ==========================================

export type MiscibilityType = 'miscible' | 'immiscible' | 'partially';

// Curated pairwise miscibility lookup
// Any pair not explicitly listed defaults to checking solubility heuristics
const MISCIBILITY_OVERRIDES: Record<string, MiscibilityType> = {
  // Water pairs
  'water:methanol': 'miscible',
  'water:ethanol': 'miscible',
  'water:isopropanol': 'miscible',
  'water:acetonitrile': 'miscible',
  'water:thf': 'miscible',
  'water:acetone': 'miscible',
  'water:dmf': 'miscible',
  'water:dmso': 'miscible',
  'water:dioxane': 'miscible',
  'water:dcm': 'immiscible',
  'water:chloroform': 'immiscible',
  'water:toluene': 'immiscible',
  'water:hexane': 'immiscible',
  'water:heptane': 'immiscible',
  'water:ether': 'partially', // ~6.9% w/w water in ether
  'water:ethyl_acetate': 'partially', // ~3.3% w/w water in EtOAc
  'water:2methf': 'partially', // ~4.1% w/w

  // DCM pairs
  'dcm:hexane': 'miscible',
  'dcm:heptane': 'miscible',
  'dcm:toluene': 'miscible',
  'dcm:ethyl_acetate': 'miscible',
  'dcm:methanol': 'miscible',
  'dcm:ethanol': 'miscible',
  'dcm:thf': 'miscible',
  'dcm:acetone': 'miscible',
  'dcm:ether': 'miscible',
  'dcm:chloroform': 'miscible',

  // Hexane / Heptane pairs
  'hexane:methanol': 'partially', // slightly miscible at RT
  'hexane:ethanol': 'miscible',
  'hexane:isopropanol': 'miscible',
  'hexane:acetonitrile': 'immiscible',
  'hexane:dmf': 'immiscible',
  'hexane:dmso': 'immiscible',
  'hexane:ethyl_acetate': 'miscible',
  'hexane:thf': 'miscible',
  'hexane:toluene': 'miscible',
  'hexane:ether': 'miscible',

  'heptane:methanol': 'partially',
  'heptane:ethanol': 'miscible',
  'heptane:acetonitrile': 'immiscible',
  'heptane:dmf': 'immiscible',
  'heptane:dmso': 'immiscible',
  'heptane:ethyl_acetate': 'miscible',
  'heptane:toluene': 'miscible',

  // Acetonitrile pairs
  'acetonitrile:toluene': 'miscible',
  'acetonitrile:ethyl_acetate': 'miscible',
  'acetonitrile:thf': 'miscible',
  'acetonitrile:dcm': 'miscible',
  'acetonitrile:chloroform': 'miscible',
  'acetonitrile:ether': 'miscible',

  // DMSO & DMF pairs
  'dmso:toluene': 'miscible',
  'dmso:ethyl_acetate': 'miscible',
  'dmso:ether': 'partially',
  'dmf:ether': 'miscible',
  'dmf:toluene': 'miscible'
};

export function getMiscibility(solventAId: string, solventBId: string): {
  status: MiscibilityType;
  description: string;
  upperPhase?: SolventData; // When immiscible or partially miscible, lighter phase
  lowerPhase?: SolventData; // Dense phase
  densityDelta?: number;
  dielectricDelta: number;
} {
  if (solventAId === solventBId) {
    const s = getSolvent(solventAId);
    return {
      status: 'miscible',
      description: 'Identical pure solvent (100% homogeneous).',
      dielectricDelta: 0
    };
  }

  const sA = getSolvent(solventAId);
  const sB = getSolvent(solventBId);

  const key1 = `${solventAId}:${solventBId}`;
  const key2 = `${solventBId}:${solventAId}`;

  let status: MiscibilityType = MISCIBILITY_OVERRIDES[key1] || MISCIBILITY_OVERRIDES[key2] || 'miscible';

  // Density phase arrangement
  const isALighter = sA.density < sB.density;
  const upperPhase = isALighter ? sA : sB;
  const lowerPhase = isALighter ? sB : sA;
  const densityDelta = Math.abs(sA.density - sB.density);
  const dielectricDelta = Math.abs(sA.dielectricConstant - sB.dielectricConstant);

  let description = '';
  if (status === 'miscible') {
    description = 'Completely miscible at all ratios at 20–25°C. Single homogeneous phase.';
  } else if (status === 'immiscible') {
    description = `Immiscible. Forms sharp biphasic boundary. Upper phase: ${upperPhase.name} (ρ=${upperPhase.density} g/mL), Lower phase: ${lowerPhase.name} (ρ=${lowerPhase.density} g/mL).`;
  } else {
    description = `Partially miscible. Mutual limited solubility (~3–15 wt%). Upper phase: ${upperPhase.name}, Lower phase: ${lowerPhase.name}.`;
  }

  return {
    status,
    description,
    upperPhase: status !== 'miscible' ? upperPhase : undefined,
    lowerPhase: status !== 'miscible' ? lowerPhase : undefined,
    densityDelta: Number(densityDelta.toFixed(4)),
    dielectricDelta: Number(dielectricDelta.toFixed(1))
  };
}

// ==========================================
// 4. CAPILLARY PRESSURE DROP & REYNOLDS ENGINE
// ==========================================

export interface TubingPreset {
  name: string;
  idMm: number; // Inner diameter in mm
  idInches: string;
  colorName: string;
  colorHex: string;
  typicalUse: string;
}

export const PEEK_TUBING_PRESETS: TubingPreset[] = [
  { name: 'Red PEEK', idMm: 0.13, idInches: '0.005"', colorName: 'Red', colorHex: '#ef4444', typicalUse: 'High backpressure, low dead volume UHPLC/micro-reactors' },
  { name: 'Yellow PEEK', idMm: 0.18, idInches: '0.007"', colorName: 'Yellow', colorHex: '#eab308', typicalUse: 'Analytical connections, micro-mixing tees' },
  { name: 'Blue PEEK', idMm: 0.25, idInches: '0.010"', colorName: 'Blue', colorHex: '#3b82f6', typicalUse: 'Standard analytical flow lines, small coil reactors' },
  { name: 'Orange PEEK', idMm: 0.50, idInches: '0.020"', colorName: 'Orange', colorHex: '#f97316', typicalUse: 'Standard prep/lab-scale flow coil reactors (0.5–10 mL/min)' },
  { name: 'Green PEEK', idMm: 0.75, idInches: '0.030"', colorName: 'Green', colorHex: '#10b981', typicalUse: 'Prep-scale tubing, high flow rates, low backpressure' },
  { name: 'Black PEEK', idMm: 1.00, idInches: '0.040"', colorName: 'Black', colorHex: '#1e293b', typicalUse: 'Pilot / feed lines, low viscous resistance' },
  { name: '1/16" PTFE (Thin)', idMm: 0.80, idInches: '0.031"', colorName: 'Translucent', colorHex: '#94a3b8', typicalUse: 'Fluoropolymer tubing, high chemical resistance' },
  { name: '1/8" PTFE (Pilot)', idMm: 1.60, idInches: '0.063"', colorName: 'Clear White', colorHex: '#cbd5e1', typicalUse: 'Larger volume residence coils (5–50 mL)' }
];

export interface CapillaryCalculations {
  innerDiameterMm: number;
  lengthMeters: number;
  flowRateMlMin: number;
  viscosityCp: number; // cP = mPa·s
  densityGml: number; // g/mL
  // Outputs
  internalVolumeMl: number;
  crossSectionAreaMm2: number;
  linearVelocityMps: number; // m/s
  residenceTimeSeconds: number;
  pressureDropBar: number;
  pressureDropPsi: number;
  reynoldsNumber: number;
  flowRegime: 'laminar' | 'transitional' | 'turbulent';
  shearRateSecInv: number; // 1/s
  pressureSeverity: 'safe' | 'caution' | 'critical'; // fitting safety
  fittingRecommendation: string;
}

export function calculateCapillaryHydraulics(
  innerDiameterMm: number,
  lengthMeters: number,
  flowRateMlMin: number,
  viscosityCp: number,
  densityGml: number
): CapillaryCalculations {
  const d_mm = Math.max(0.01, innerDiameterMm);
  const L_m = Math.max(0.01, lengthMeters);
  const Q_mlMin = Math.max(0.001, flowRateMlMin);
  const mu_cP = Math.max(0.01, viscosityCp);
  const rho_gMl = Math.max(0.1, densityGml);

  // SI conversions:
  // d in meters
  const d_m = d_mm * 1e-3;
  // radius
  const r_m = d_m / 2;
  // cross sectional area in m²
  const A_m2 = Math.PI * r_m * r_m;
  const crossSectionAreaMm2 = A_m2 * 1e6;

  // Volumetric flow rate in m³/s
  // 1 mL/min = (1e-6 m³) / (60 s) = 1.66667e-8 m³/s
  const Q_m3s = (Q_mlMin * 1e-6) / 60;

  // Internal volume in mL
  // V = A * L (m³ * 1e6 mL/m³)
  const internalVolumeMl = A_m2 * L_m * 1e6;

  // Linear velocity: v = Q / A (m/s)
  const linearVelocityMps = Q_m3s / A_m2;

  // Residence time in seconds: V / Q
  const residenceTimeSeconds = (internalVolumeMl / Q_mlMin) * 60;

  // Dynamic viscosity in Pa·s (1 cP = 1e-3 Pa·s)
  const mu_Pas = mu_cP * 1e-3;

  // Density in kg/m³ (1 g/mL = 1000 kg/m³)
  const rho_kgM3 = rho_gMl * 1000;

  // Hagen-Poiseuille equation for pressure drop in laminar cylindrical pipe:
  // ΔP = (128 * μ * L * Q) / (π * D⁴)
  const deltaP_Pa = (128 * mu_Pas * L_m * Q_m3s) / (Math.PI * Math.pow(d_m, 4));

  // Convert Pa to bar (1 bar = 1e5 Pa) and psi (1 bar = 14.5038 psi)
  const pressureDropBar = deltaP_Pa / 1e5;
  const pressureDropPsi = pressureDropBar * 14.5038;

  // Reynolds number: Re = (ρ * v * D) / μ
  const reynoldsNumber = (rho_kgM3 * linearVelocityMps * d_m) / mu_Pas;

  let flowRegime: 'laminar' | 'transitional' | 'turbulent' = 'laminar';
  if (reynoldsNumber < 2100) {
    flowRegime = 'laminar';
  } else if (reynoldsNumber <= 4000) {
    flowRegime = 'transitional';
  } else {
    flowRegime = 'turbulent';
  }

  // Wall shear rate: γ_dot = 8 * v / d (1/s)
  const shearRateSecInv = (8 * linearVelocityMps) / d_m;

  // Severity and fitting recommendation
  let pressureSeverity: 'safe' | 'caution' | 'critical' = 'safe';
  let fittingRecommendation = 'Standard finger-tight PEEK fittings (good up to 25–35 bar).';

  if (pressureDropBar > 70) {
    pressureSeverity = 'critical';
    fittingRecommendation = 'CRITICAL: High pressure! Requires high-pressure stainless steel swaged ferrules (rated 200+ bar). Finger-tight PEEK fittings will blow out!';
  } else if (pressureDropBar > 25) {
    pressureSeverity = 'caution';
    fittingRecommendation = 'CAUTION: Exceeds standard finger-tight PEEK limit (~25–35 bar). Use two-piece PEEK ferrules with tightening tool, or stainless steel fittings.';
  }

  return {
    innerDiameterMm: d_mm,
    lengthMeters: L_m,
    flowRateMlMin: Q_mlMin,
    viscosityCp: mu_cP,
    densityGml: rho_gMl,
    internalVolumeMl: Number(internalVolumeMl.toFixed(3)),
    crossSectionAreaMm2: Number(crossSectionAreaMm2.toFixed(4)),
    linearVelocityMps: Number(linearVelocityMps.toFixed(3)),
    residenceTimeSeconds: Number(residenceTimeSeconds.toFixed(1)),
    pressureDropBar: Number(pressureDropBar.toFixed(2)),
    pressureDropPsi: Number(pressureDropPsi.toFixed(1)),
    reynoldsNumber: Number(reynoldsNumber.toFixed(1)),
    flowRegime,
    shearRateSecInv: Number(shearRateSecInv.toFixed(0)),
    pressureSeverity,
    fittingRecommendation
  };
}

// Dynamic Viscosity vs Temperature (Andrade / Arrhenius Equation)
// μ(T) = μ₀ * exp( B * (1/T_K - 1/T_0K) )
export function calculateTemperatureViscosity(
  nominalViscosityCp: number,
  tempCelsius: number,
  bParam: number = 1500
): {
  viscosityCp: number;
  percentChange: number;
} {
  const nominal = Math.max(0.01, nominalViscosityCp);
  const tKelvin = Math.max(150, tempCelsius + 273.15); // Safeguard against <= 0 K
  const t0Kelvin = 293.15; // 20°C reference point
  const b = Math.max(500, bParam);

  const exponent = b * ((1 / tKelvin) - (1 / t0Kelvin));
  const correctedViscosity = nominal * Math.exp(exponent);
  const clampedViscosity = Math.max(0.01, Math.min(200, correctedViscosity));
  const percentChange = ((clampedViscosity - nominal) / nominal) * 100;

  return {
    viscosityCp: Number(clampedViscosity.toFixed(3)),
    percentChange: Number(percentChange.toFixed(1))
  };
}

// Calculate vapor pressure in bar at a specific temperature using Antoine parameters
export function getVaporPressureBar(solventId: string, tempCelsius: number): number {
  const s = getSolvent(solventId);
  const { A, B, C } = s.antoine;
  const clampedTemp = Math.max(-50, Math.min(300, tempCelsius));
  const log10P_mmHg = A - (B / (clampedTemp + C));
  const p_mmHg = Math.pow(10, log10P_mmHg);
  const p_bar = p_mmHg / 750.06;
  return Number(Math.max(0.001, p_bar).toFixed(3));
}

export interface VlePoint {
  temp: number;
  pressureBar: number;
}

// Generate an array of points for plotting P-T vapor-liquid equilibrium boundary
export function generateVleCurveData(
  solventId: string,
  minTemp: number = 0,
  maxTemp: number = 220,
  steps: number = 45
): VlePoint[] {
  const points: VlePoint[] = [];
  const stepSize = (maxTemp - minTemp) / steps;
  for (let i = 0; i <= steps; i++) {
    const t = minTemp + i * stepSize;
    const p = getVaporPressureBar(solventId, t);
    points.push({ temp: Number(t.toFixed(1)), pressureBar: p });
  }
  return points;
}


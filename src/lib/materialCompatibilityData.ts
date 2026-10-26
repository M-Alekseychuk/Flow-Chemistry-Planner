// Flow Chemistry Material Compatibility Database
// Chemical compatibility data across standard flow reactor materials, tubing, fittings, and seals.

export type CompatibilityRating = 'A' | 'B' | 'C' | 'D';

export interface RatingDetail {
  rating: CompatibilityRating;
  ratingLabel: string; // 'Excellent', 'Good', 'Fair / Caution', 'Incompatible'
  maxTemp: string; // e.g. '250°C', 'Ambient', 'Not Recommended'
  notes?: string;
  hazard?: string;
}

export type MaterialCategory = 'Fluoropolymer' | 'Polymer' | 'Metal Alloy' | 'Inorganic / Ceramic' | 'Elastomer Seal';

export interface FlowMaterial {
  id: string;
  name: string;
  shortName: string;
  category: MaterialCategory;
  description: string;
  maxPressureBar: number;
  maxTempCelsius: number;
  minTempCelsius: number;
  transparency: 'Transparent' | 'Translucent' | 'Opaque';
  typicalUse: string;
  primaryVulnerabilities: string;
}

export type ChemicalCategory = 'solvent' | 'acid' | 'base' | 'reagent';

export interface ChemicalSubstance {
  id: string;
  name: string;
  commonName?: string;
  formula: string;
  cas?: string;
  category: ChemicalCategory;
  categoryLabel: string;
  description: string;
  typicalFlowUse: string;
  hazardNote?: string;
}

export interface CompatibilityRecord {
  chemicalId: string;
  ratings: Record<string, RatingDetail>;
}

// 1. Master Flow Chemistry Materials Catalog
export const FLOW_MATERIALS: FlowMaterial[] = [
  {
    id: 'pfa',
    name: 'PFA (Perfluoroalkoxy Alkane)',
    shortName: 'PFA',
    category: 'Fluoropolymer',
    description: 'Translucent fluoropolymer tubing; high chemical inertness and continuous service up to 260°C.',
    maxPressureBar: 35,
    maxTempCelsius: 260,
    minTempCelsius: -200,
    transparency: 'Translucent',
    typicalUse: 'Standard flow tubing, coil reactors, reagent feed lines, visual bubble inspection.',
    primaryVulnerabilities: 'Molten alkali metals, elemental fluorine gas, extreme alkyl lithiums at elevated temperatures.'
  },
  {
    id: 'ptfe',
    name: 'PTFE (Polytetrafluoroethylene / Teflon)',
    shortName: 'PTFE',
    category: 'Fluoropolymer',
    description: 'Universal chemical inertness, low friction, used for reactor bodies, valve rotors, and thick tubing.',
    maxPressureBar: 20,
    maxTempCelsius: 260,
    minTempCelsius: -200,
    transparency: 'Opaque',
    typicalUse: 'Valve plugs, reactor liners, diaphragm pump heads, low-pressure tubing.',
    primaryVulnerabilities: 'Cold flow / creep under high mechanical clamping pressure, molten alkali metals.'
  },
  {
    id: 'fep',
    name: 'FEP (Fluorinated Ethylene Propylene)',
    shortName: 'FEP',
    category: 'Fluoropolymer',
    description: 'Optically clear fluoropolymer tubing with high UV/visible light transmission for photochemistry.',
    maxPressureBar: 30,
    maxTempCelsius: 200,
    minTempCelsius: -200,
    transparency: 'Transparent',
    typicalUse: 'Photochemical flow reactors, UV-C/UV-A/Blue LED coil reactors, spectrophotometer flow cells.',
    primaryVulnerabilities: 'Slightly lower thermal limit (200°C) than PFA/PTFE; attacked by molten alkali metals.'
  },
  {
    id: 'peek',
    name: 'PEEK (Polyether Ether Ketone)',
    shortName: 'PEEK',
    category: 'Polymer',
    description: 'High-strength engineering thermoplastic rated for HPLC high-pressure tubing and finger-tight fittings.',
    maxPressureBar: 350,
    maxTempCelsius: 220,
    minTempCelsius: -60,
    transparency: 'Opaque',
    typicalUse: 'High-pressure chromatography fittings, ferrules, check valves, HPLC pump heads, backpressure regulators.',
    primaryVulnerabilities: 'Dissolved by conc. sulfuric acid (H₂SO₄); heavily swollen/cracked by THF, DCM, chloroform, conc. HNO₃.'
  },
  {
    id: 'ss316',
    name: 'Stainless Steel 316 / 316L',
    shortName: 'SS316',
    category: 'Metal Alloy',
    description: 'High mechanical integrity and thermal conductivity for high-pressure, high-temperature continuous reactors.',
    maxPressureBar: 400,
    maxTempCelsius: 400,
    minTempCelsius: -196,
    transparency: 'Opaque',
    typicalUse: 'High-pressure tubular reactors, catalytic packed-bed cartridges, Swagelok swaged fittings, BPR bodies.',
    primaryVulnerabilities: 'Severe pitting corrosion and stress cracking from chloride ions (HCl, SOCl₂, brine), brominating agents, and reducing acids.'
  },
  {
    id: 'hastelloy',
    name: 'Hastelloy C-276 / C-22',
    shortName: 'Hastelloy',
    category: 'Metal Alloy',
    description: 'Nickel-molybdenum-chromium superalloy engineered specifically for aggressive chloride and acidic environments.',
    maxPressureBar: 400,
    maxTempCelsius: 450,
    minTempCelsius: -196,
    transparency: 'Opaque',
    typicalUse: 'Corrosive acid flow reactors, halogenation reactions, wet chlorine processing, pilot-scale flow skids.',
    primaryVulnerabilities: 'Extremely high cost; attacked by dry chlorine at very high temperatures.'
  },
  {
    id: 'glass',
    name: 'Borosilicate Glass 3.3 / Quartz',
    shortName: 'Glass / Quartz',
    category: 'Inorganic / Ceramic',
    description: 'Optically transparent microreactors and chips providing inert surfaces and direct reaction visualization.',
    maxPressureBar: 25,
    maxTempCelsius: 200,
    minTempCelsius: -50,
    transparency: 'Transparent',
    typicalUse: 'Glass microfluidic chips, photochemical jacketed reactors, optical monitoring windows, static mixing chips.',
    primaryVulnerabilities: 'Rapidly etched and dissolved by hydrofluoric acid (HF) and hot concentrated caustic solutions (NaOH, KOH).'
  },
  {
    id: 'sic',
    name: 'Silicon Carbide (SiC)',
    shortName: 'SiC',
    category: 'Inorganic / Ceramic',
    description: 'Premium ceramic with extraordinary thermal conductivity (120+ W/m·K) and universal chemical resistance.',
    maxPressureBar: 100,
    maxTempCelsius: 300,
    minTempCelsius: -60,
    transparency: 'Opaque',
    typicalUse: 'Corning Advanced-Flow Reactors, extreme exothermic reactions, hazardous chemistry under high throughput.',
    primaryVulnerabilities: 'Brittle to mechanical shock; attacked only by molten alkali hydroxides at >500°C.'
  },
  {
    id: 'titanium',
    name: 'Titanium (Grade 2 / Grade 5)',
    shortName: 'Titanium',
    category: 'Metal Alloy',
    description: 'Lightweight, biocompatible metal with exceptional resistance to wet chlorine, hypochlorite, and sea water.',
    maxPressureBar: 350,
    maxTempCelsius: 300,
    minTempCelsius: -100,
    transparency: 'Opaque',
    typicalUse: 'Hypochlorite oxidations, chloride brine feeds, specialized biocatalysis reactors.',
    primaryVulnerabilities: 'Catastrophically attacked by dry halogens (spontaneous ignition risk in dry Cl₂), hydrofluoric acid, and concentrated reducing acids.'
  },
  {
    id: 'ffkm',
    name: 'FFKM (Kalrez / Chemraz Perfluoroelastomer)',
    shortName: 'FFKM (Kalrez)',
    category: 'Elastomer Seal',
    description: 'The highest chemical-resistance elastomer available for O-rings, check valves, and pump diaphragms.',
    maxPressureBar: 300,
    maxTempCelsius: 315,
    minTempCelsius: -40,
    transparency: 'Opaque',
    typicalUse: 'Critical HPLC pump check valve seals, dynamic reactor O-rings, BPR diaphragm seals with aggressive mixtures.',
    primaryVulnerabilities: 'High cost; slower elastic recovery at cryogenic temperatures.'
  },
  {
    id: 'fkm',
    name: 'FKM (Viton Fluoroelastomer)',
    shortName: 'FKM (Viton)',
    category: 'Elastomer Seal',
    description: 'Standard chemical O-ring seal; excellent for hydrocarbons, mineral oils, and dilute mineral acids.',
    maxPressureBar: 200,
    maxTempCelsius: 200,
    minTempCelsius: -20,
    transparency: 'Opaque',
    typicalUse: 'General lab pump seals, non-polar solvent fluid paths, pneumatic fittings.',
    primaryVulnerabilities: 'Rapid destruction and severe swelling by ketones (acetone, MEK), esters (ethyl acetate), amines, THF, and DMF.'
  },
  {
    id: 'epdm',
    name: 'EPDM (Ethylene Propylene Diene Monomer)',
    shortName: 'EPDM',
    category: 'Elastomer Seal',
    description: 'Elastomer seal with outstanding resistance to polar solvents (acetone, alcohols), hot water, and strong alkalis.',
    maxPressureBar: 150,
    maxTempCelsius: 150,
    minTempCelsius: -50,
    transparency: 'Opaque',
    typicalUse: 'Aqueous basic feeds, acetone/ketone solvent lines, steam sterilization lines.',
    primaryVulnerabilities: 'Completely incompatible with non-polar hydrocarbons (hexanes, toluene), chlorinated solvents (DCM), and mineral oils.'
  }
];

// 2. Master Chemical Substances Catalog (Solvents, Acids, Bases, Reactive Reagents)
export const CHEMICAL_SUBSTANCES: ChemicalSubstance[] = [
  // --- Solvents ---
  {
    id: 'water',
    name: 'Water / Aqueous Buffers',
    formula: 'H₂O',
    cas: '7732-18-5',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Ubiquitous polar protic carrier solvent for biphasic reactions, neutralizations, and biocatalysis.',
    typicalFlowUse: 'Aqueous reagent streams, liquid-liquid extractions, workup quenches.'
  },
  {
    id: 'methanol',
    name: 'Methanol (MeOH)',
    formula: 'CH₃OH',
    cas: '67-56-1',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Light polar protic solvent; common in transesterifications, Suzuki couplings, and wash sequences.',
    typicalFlowUse: 'Reagent carrier, nucleophile in solvolysis, catalytic hydrogenation solvent.'
  },
  {
    id: 'ethanol',
    name: 'Ethanol (EtOH)',
    formula: 'C₂H₅OH',
    cas: '64-17-5',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Green polar protic solvent; high biocompatibility, common in pharmaceutical flow routes.',
    typicalFlowUse: 'Biocatalysis, sustainable reductions, flow crystallization.'
  },
  {
    id: 'acetonitrile',
    name: 'Acetonitrile (MeCN)',
    formula: 'CH₃CN',
    cas: '75-05-8',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Versatile dipolar aprotic solvent with low viscosity; widely used in automated flow synthesis & HPLC.',
    typicalFlowUse: 'Peptide coupling, cross-coupling reactions, electrochemical flow synthesis.'
  },
  {
    id: 'thf',
    name: 'Tetrahydrofuran (THF)',
    formula: 'C₄H₈O',
    cas: '109-99-9',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Moderately polar cyclic ether; essential for organometallic flow chemistry (Grignard, organolithiums).',
    typicalFlowUse: 'Grignard generation, cryogenic deprotonations, hydride reductions.',
    hazardNote: 'CAUTION: Swells PEEK fittings and destroys Viton seals. Use PFA, PTFE, or Stainless Steel.'
  },
  {
    id: 'dcm',
    name: 'Dichloromethane (DCM)',
    formula: 'CH₂Cl₂',
    cas: '75-09-2',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Non-flammable chlorinated solvent with excellent dissolving power for organic compounds.',
    typicalFlowUse: 'Halogenations, Swern oxidations, peptide couplings, extraction streams.',
    hazardNote: 'CAUTION: Aggressively swells PEEK and destroys EPDM and Viton. Use PFA or Stainless Steel.'
  },
  {
    id: 'chloroform',
    name: 'Chloroform',
    formula: 'CHCl₃',
    cas: '67-66-3',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Chlorinated solvent; dissolves broad classes of alkaloids, lipids, and synthetic precursors.',
    typicalFlowUse: 'Specialized flow extractions, carbene generation.',
    hazardNote: 'Degrades PEEK under pressure. Incompatible with standard elastomer seals (Viton/EPDM).'
  },
  {
    id: 'dmf',
    name: 'N,N-Dimethylformamide (DMF)',
    formula: 'C₃H₇NO',
    cas: '68-12-2',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'High-boiling dipolar aprotic solvent for nucleophilic substitutions and peptide synthesis.',
    typicalFlowUse: 'Solid-phase peptide synthesis (SPPS), high-temperature SNAr substitutions.',
    hazardNote: 'Attacks Viton seals and softens standard plastics; requires PFA or Kalrez.'
  },
  {
    id: 'dmso',
    name: 'Dimethyl Sulfoxide (DMSO)',
    formula: 'C₂H₆OS',
    cas: '67-68-5',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Superb solvent for difficult polar substrates, heterocycles, and Swern oxidations.',
    typicalFlowUse: 'Heterocyclic synthesis, biological assays, oxidation reactions.',
    hazardNote: 'Can cause mild swelling of PEEK at elevated temperatures (>80°C).'
  },
  {
    id: 'acetone',
    name: 'Acetone',
    formula: 'C₃H₆O',
    cas: '67-64-1',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Low-boiling polar solvent, common for washing, Jones oxidations, and precipitation flow.',
    typicalFlowUse: 'Cleaning sequences, precipitation crystallizations.',
    hazardNote: 'CRITICAL: Instantly destroys Viton (FKM) seals! EPDM or FFKM must be used.'
  },
  {
    id: 'ethyl_acetate',
    name: 'Ethyl Acetate (EtOAc)',
    formula: 'C₄H₈O₂',
    cas: '141-78-6',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Popular ester solvent with low toxicity and moderate polarity.',
    typicalFlowUse: 'Continuous liquid-liquid extraction (Zaiput separator), flow purifications.',
    hazardNote: 'Attacks Viton (FKM) seals. Use Kalrez (FFKM) or PTFE.'
  },
  {
    id: 'toluene',
    name: 'Toluene',
    formula: 'C₇H₈',
    cas: '108-88-3',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Non-polar aromatic solvent for high-temperature flow reactions and Diels-Alder syntheses.',
    typicalFlowUse: 'Thermally driven cyclizations, organometallic reactions, biphasic phase-transfer catalysis.',
    hazardNote: 'Destroys EPDM seals completely. Viton, Kalrez, and PFA are compatible.'
  },
  {
    id: 'hexane',
    name: 'Hexanes / Heptane',
    formula: 'C₆H₁₄ / C₇H₁₆',
    cas: '110-54-3',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Non-polar alkane solvents used in organolithium delivery and flow extractions.',
    typicalFlowUse: 'Alkyl lithium feed streams, extraction of non-polar products.',
    hazardNote: 'Severely swells and degrades EPDM seals.'
  },
  {
    id: 'dioxane',
    name: '1,4-Dioxane',
    formula: 'C₄H₈O₂',
    cas: '123-91-1',
    category: 'solvent',
    categoryLabel: 'Solvent',
    description: 'Aprotic diether with high boiling point (101°C); common in Buchwald-Hartwig couplings.',
    typicalFlowUse: 'Cross-couplings, palladium-catalyzed flow reactions, elevated temperature flow.',
    hazardNote: 'Swelling risk for PEEK at high temperature; destroys Viton.'
  },

  // --- Acids ---
  {
    id: 'hcl',
    name: 'Hydrochloric Acid (HCl, 37% Conc.)',
    formula: 'HCl (aq)',
    cas: '7647-01-0',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Aggressive mineral acid releasing chloride ions; widely used for protonation and chlorinations.',
    typicalFlowUse: 'In-line quenching of organolithiums, salt formations, Fischer indole syntheses.',
    hazardNote: 'CRITICAL: Destroys SS316 via rapid chloride pitting corrosion! Use Hastelloy C-276, PFA, Glass, or SiC.'
  },
  {
    id: 'h2so4',
    name: 'Sulfuric Acid (H₂SO₄, 98% Conc.)',
    formula: 'H₂SO₄',
    cas: '7664-93-9',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Extremely strong dehydrating and sulfonating mineral acid with violent heat of dilution.',
    typicalFlowUse: 'Continuous nitrations, sulfonations, acid-catalyzed dehydrations.',
    hazardNote: 'CRITICAL: Completely dissolves and carbonizes PEEK! SS316 corrodes. Use SiC, PFA, Glass, or Hastelloy.'
  },
  {
    id: 'hno3',
    name: 'Nitric Acid (HNO₃, 68% Conc.)',
    formula: 'HNO₃',
    cas: '7697-37-2',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Powerful oxidizing mineral acid used for energetic materials and aromatic nitrations.',
    typicalFlowUse: 'Microreactor continuous nitration, oxidation of alcohols, aromatic functionalization.',
    hazardNote: 'Attacks PEEK and Viton. SS316 undergoes passivation at RT but corrodes at >50°C. SiC, PFA, and Glass are optimal.'
  },
  {
    id: 'hf',
    name: 'Hydrofluoric Acid (HF, 48%)',
    formula: 'HF (aq)',
    cas: '7664-39-3',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Extremely hazardous fluorinating acid with dangerous dermal toxicity and silica-etching properties.',
    typicalFlowUse: 'Fluorinations, deprotection of silyl ethers, glass surface functionalization.',
    hazardNote: 'FATAL TO GLASS: Rapidly dissolves and etches borosilicate glass/quartz! Corrodes titanium. Use SiC, PFA, or PTFE.'
  },
  {
    id: 'tfa',
    name: 'Trifluoroacetic Acid (TFA)',
    formula: 'CF₃COOH',
    cas: '76-05-1',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Strong organic acid (pKa 0.23); standard in Boc deprotections and peptide synthesis.',
    typicalFlowUse: 'Continuous Boc cleavage, peptide cleavage, acid-mediated cyclizations.',
    hazardNote: 'Swells PEEK slightly over time; attacks EPDM. PFA, Glass, and Hastelloy are excellent.'
  },
  {
    id: 'acetic_acid',
    name: 'Glacial Acetic Acid (AcOH)',
    formula: 'CH₃COOH',
    cas: '64-19-7',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Common weak organic acid carrier and buffer in continuous flow condensations.',
    typicalFlowUse: 'Imine/enamine formations, buffering in cross-couplings, Paal-Knorr syntheses.'
  },
  {
    id: 'aqua_regia',
    name: 'Aqua Regia (HCl : HNO₃ 3:1)',
    formula: 'HNO₃ + 3 HCl',
    category: 'acid',
    categoryLabel: 'Acid',
    description: 'Super-oxidizing acid mixture generating nitrosyl chloride (NOCl) and nascent chlorine.',
    typicalFlowUse: 'Catalyst digestions, extreme oxidations, metal dissolution.',
    hazardNote: 'CRITICAL: Rapidly corrodes Stainless Steel, Titanium, and PEEK! Use SiC, Glass, or Fluoropolymers (PFA/PTFE).'
  },

  // --- Bases ---
  {
    id: 'naoh',
    name: 'Sodium Hydroxide (NaOH, 50% aq)',
    formula: 'NaOH (aq)',
    cas: '1310-73-2',
    category: 'base',
    categoryLabel: 'Base',
    description: 'Strong inorganic base; standard reagent for saponifications and biphasic quenches.',
    typicalFlowUse: 'Ester hydrolyses, Cannizzaro reactions, in-line acid quenches.',
    hazardNote: 'Hot concentrated NaOH slowly etches borosilicate glass channels over time. Metals, PEEK, and fluoropolymers are unaffected.'
  },
  {
    id: 'koh',
    name: 'Potassium Hydroxide (KOH, Alcoholic / aq)',
    formula: 'KOH',
    cas: '1310-58-3',
    category: 'base',
    categoryLabel: 'Base',
    description: 'Strong alkali with high solubility in alcohols; used for dehydrohalogenations and hydrolyses.',
    typicalFlowUse: 'Nucleophilic additions, deprotonations, continuous saponification.',
    hazardNote: 'Alcoholic KOH severely etches glass at elevated temperatures.'
  },
  {
    id: 'nbuli',
    name: 'n-Butyllithium / LDA (Organolithiums)',
    formula: 'n-BuLi in hexanes',
    cas: '109-72-8',
    category: 'base',
    categoryLabel: 'Base',
    description: 'Extremely pyrophoric superbase for fast cryogenic deprotonations and halogen-metal exchange.',
    typicalFlowUse: 'Continuous ortho-lithiation, flash chemistry in microreactors at -78°C to 20°C.',
    hazardNote: 'Pyrophoric! Can degrade fluoropolymers at elevated temperatures (>80°C). SS316, Hastelloy, and PEEK are standard.'
  },
  {
    id: 'tea',
    name: 'Triethylamine (TEA) / DIPEA',
    formula: '(C₂H₅)₃N / i-Pr₂NEt',
    cas: '121-44-8',
    category: 'base',
    categoryLabel: 'Base',
    description: 'Non-nucleophilic tertiary amine bases widely used as acid scavengers in flow couplings.',
    typicalFlowUse: 'Amide couplings, Buchwald reactions, acylations, in-line neutralization.',
    hazardNote: 'Attacks Viton (FKM) seals causing swelling. Use EPDM or Kalrez (FFKM).'
  },
  {
    id: 'ammonia',
    name: 'Ammonium Hydroxide / NH₃ (aq)',
    formula: 'NH₄OH / NH₃',
    cas: '1336-21-6',
    category: 'base',
    categoryLabel: 'Base',
    description: 'Aqueous ammonia base and nucleophile for aminolysis and salt formation.',
    typicalFlowUse: 'Ammonolysis of esters, nucleophilic aromatic substitutions (SNAr).'
  },
  {
    id: 'sodium_methoxide',
    name: 'Sodium Methoxide (NaOMe in MeOH)',
    formula: 'CH₃ONa',
    cas: '124-41-4',
    category: 'base',
    categoryLabel: 'Base',
    description: 'Strong alkoxide base in methanol; standard for transesterifications and condensation reactions.',
    typicalFlowUse: 'Claisen condensations, biodiesel synthesis, deprotections.'
  },

  // --- Reactive Reagents & Oxidizers ---
  {
    id: 'socl2',
    name: 'Thionyl Chloride (SOCl₂)',
    formula: 'SOCl₂',
    cas: '7719-09-7',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Fuming liquid halogenating reagent releasing gaseous SO₂ and HCl upon reaction.',
    typicalFlowUse: 'Continuous acid chloride generation, chlorinations, dehydrations.',
    hazardNote: 'CRITICAL: Generates anhydrous and wet HCl! Stainless Steel 316 undergoes extreme pitting. Use Hastelloy, Glass, or PFA.'
  },
  {
    id: 'oxalyl_chloride',
    name: 'Oxalyl Chloride ((COCl)₂)',
    formula: '(COCl)₂',
    cas: '79-37-8',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Volatile chlorinating reagent and key component of Swern oxidations.',
    typicalFlowUse: 'Continuous Swern oxidations, Vilsmeier-Haack reagents, acid chloride synthesis.',
    hazardNote: 'Produces vigorous gas evolution (CO, CO₂, HCl). High backpressure and chloride corrosion risk for SS316.'
  },
  {
    id: 'bromine',
    name: 'Bromine (Br₂) / NBS',
    formula: 'Br₂',
    cas: '7726-95-6',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Dense red-brown liquid; extremely corrosive halogenating agent for additions and substitutions.',
    typicalFlowUse: 'Continuous electrophilic brominations, allylic/benzylic Wohl-Ziegler bromination.',
    hazardNote: 'Rapidly corrodes Titanium and Stainless Steel! Severe attack on EPDM and Viton. Use Glass, SiC, or PFA.'
  },
  {
    id: 'h2o2',
    name: 'Hydrogen Peroxide (H₂O₂, 30–50%)',
    formula: 'H₂O₂ (aq)',
    cas: '7722-84-1',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Green oxidizer generating only water as byproduct; highly exothermic decomposition in flow.',
    typicalFlowUse: 'Epoxidations, sulfide to sulfoxide oxidations, Baeyer-Villiger oxidations.',
    hazardNote: 'Heavy metals (unpassivated SS316, iron, copper) catalytically decompose H₂O₂ causing pressure spikes. Glass, SiC, and Passivated PFA are ideal.'
  },
  {
    id: 'mcpba',
    name: 'm-Chloroperoxybenzoic Acid (mCPBA)',
    formula: 'C₇H₅ClO₃',
    cas: '937-14-3',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Peroxy acid oxidizer widely used in solution (DCM/EtOAc) for epoxidations.',
    typicalFlowUse: 'Continuous Prilezhaev epoxidation, oxidation of imines to oxaziridines.',
    hazardNote: 'Organic solutions of mCPBA attack standard elastomer seals and unpassivated steels.'
  },
  {
    id: 'nabh4',
    name: 'Sodium Borohydride / DIBAL-H (Hydrides)',
    formula: 'NaBH₄ / [(CH₃)₂CHCH₂]₂AlH',
    cas: '16940-66-2',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Reducing hydride reagents for rapid reduction of aldehydes, ketones, and esters in flow.',
    typicalFlowUse: 'Carbonyl reductions, reductive aminations in flow.',
    hazardNote: 'DIBAL-H in toluene/hexanes destroys EPDM. Incompatible with water-moist lines (releases H₂).'
  },
  {
    id: 'bleach',
    name: 'Sodium Hypochlorite (NaOCl / Bleach)',
    formula: 'NaOCl (aq)',
    cas: '7681-52-9',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'Common oxidative reagent used for TEMPO-mediated alcohol oxidations in continuous flow.',
    typicalFlowUse: 'TEMPO alcohol oxidation to aldehydes, chlorinations, wastewater treatment.',
    hazardNote: 'Attacks Stainless Steel 316. Titanium, Hastelloy C, Glass, and PFA are highly resistant.'
  },
  {
    id: 'h2_gas',
    name: 'Hydrogen Gas (H₂ / Flow Hydrogenation)',
    formula: 'H₂ (gas)',
    cas: '1333-74-0',
    category: 'reagent',
    categoryLabel: 'Reactive Reagent',
    description: 'High-pressure gas feed for packed-bed catalytic flow hydrogenators (e.g. H-Cube).',
    typicalFlowUse: 'Alkene/alkyne reductions, nitro group reduction, debenzylation.',
    hazardNote: 'High permeability through thin plastic tubing; requires stainless steel or Hastelloy high-pressure lines.'
  }
];

// Helper to construct RatingDetail
const R = (
  rating: CompatibilityRating, 
  maxTemp: string, 
  notes?: string, 
  hazard?: string
): RatingDetail => {
  const labels: Record<CompatibilityRating, string> = {
    'A': 'Excellent',
    'B': 'Good',
    'C': 'Fair / Caution',
    'D': 'Incompatible'
  };
  return {
    rating,
    ratingLabel: labels[rating],
    maxTemp,
    notes,
    hazard
  };
};

// 3. Matrix Compatibility Data
export const COMPATIBILITY_DATA: Record<string, Record<string, RatingDetail>> = {
  // --- Solvents ---
  water: {
    pfa: R('A', '260°C', 'Completely inert.'),
    ptfe: R('A', '260°C', 'Completely inert.'),
    fep: R('A', '200°C', 'Completely inert.'),
    peek: R('A', '200°C', 'Excellent mechanical stability in aqueous media.'),
    ss316: R('A', '300°C', 'Compatible; avoid stagnant high chloride.'),
    hastelloy: R('A', '400°C', 'Completely inert.'),
    glass: R('A', '200°C', 'Standard lab material.'),
    sic: R('A', '300°C', 'Superior thermal conduction in water.'),
    titanium: R('A', '300°C', 'Immune to aqueous corrosion.'),
    ffkm: R('A', '300°C', 'No swelling.'),
    fkm: R('A', '150°C', 'Good for ambient water.'),
    epdm: R('A', '150°C', 'Excellent for hot water and steam.')
  },
  methanol: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '150°C', 'Standard HPLC mobile phase.'),
    ss316: R('A', '250°C', 'Good; ensure pure solvent without chlorides.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('C', '40°C', 'Swelling and hardening over prolonged exposure.'),
    epdm: R('A', '100°C', 'Excellent with polar alcohols.')
  },
  ethanol: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '150°C', 'Stable.'),
    ss316: R('A', '250°C', 'Stable.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('B', '50°C', 'Minor swelling.'),
    epdm: R('A', '100°C', 'Excellent resistance.')
  },
  acetonitrile: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '120°C', 'Standard reverse-phase HPLC carrier.'),
    ss316: R('A', '250°C', 'Inert.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('C', '40°C', 'Moderate swelling; seals may weep under pressure.'),
    epdm: R('B', '60°C', 'Acceptable for short-term runs.')
  },
  thf: {
    pfa: R('A', '260°C', 'Inert; gold standard for organometallic flow.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert; transparent for organometallic monitoring.'),
    peek: R('C', 'Ambient', 'Swelling & softening under pressure; PEEK tubing can burst or blow out of fittings!', 'Blowout risk under pressure'),
    ss316: R('A', '250°C', 'Excellent mechanical resistance in THF.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton is rapidly dissolved and swollen by THF!', 'Catastrophic seal failure'),
    epdm: R('D', 'Not Recommended', 'Severe swelling and mechanical degradation.', 'Severe swelling')
  },
  dcm: {
    pfa: R('A', '200°C', 'Inert.'),
    ptfe: R('A', '200°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('D', 'Not Recommended', 'PEEK swells aggressively in DCM; dimensional changes cause leaks and blockage.', 'Severe swelling & softening'),
    ss316: R('A', '200°C', 'Excellent.'),
    hastelloy: R('A', '250°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '250°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton swells drastically (>100% volume change).', 'Seal destruction'),
    epdm: R('D', 'Not Recommended', 'Rapid embrittlement and disintegration.', 'Seal destruction')
  },
  chloroform: {
    pfa: R('A', '200°C', 'Inert.'),
    ptfe: R('A', '200°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('C', 'Ambient', 'Moderate swelling and extraction of oligomers over time.'),
    ss316: R('A', '200°C', 'Inert.'),
    hastelloy: R('A', '250°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '250°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Moderate swelling.'),
    epdm: R('D', 'Not Recommended', 'Incompatible; rapid degradation.')
  },
  dmf: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '140°C', 'Good resistance; minor swelling at >120°C.'),
    ss316: R('A', '250°C', 'Inert.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton is attacked by polar amides like DMF/DMAc.', 'Severe attack'),
    epdm: R('B', '80°C', 'Fair resistance to polar amides.')
  },
  dmso: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('B', '100°C', 'Acceptable up to 100°C; slight swelling at elevated temp.'),
    ss316: R('A', '250°C', 'Inert.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Attacked and swollen by DMSO.', 'Seal failure'),
    epdm: R('A', '100°C', 'Excellent resistance to DMSO.')
  },
  acetone: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '100°C', 'Compatible.'),
    ss316: R('A', '250°C', 'Inert.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'CRITICAL: Acetone dissolves/degrades Viton O-rings rapidly!', 'Immediate seal dissolution'),
    epdm: R('A', '100°C', 'Excellent; the preferred seal for ketones.')
  },
  ethyl_acetate: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '120°C', 'Compatible.'),
    ss316: R('A', '250°C', 'Inert.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton swells excessively and loses tensile strength.', 'Seal failure'),
    epdm: R('B', '60°C', 'Moderate resistance.')
  },
  toluene: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '150°C', 'Excellent.'),
    ss316: R('A', '300°C', 'Inert.'),
    hastelloy: R('A', '350°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('A', '100°C', 'Excellent with aromatics.'),
    epdm: R('D', 'Not Recommended', 'CRITICAL: Toluene severely swells and shreds EPDM!', 'Severe swelling & leakage')
  },
  hexane: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('A', '150°C', 'Inert.'),
    ss316: R('A', '300°C', 'Inert.'),
    hastelloy: R('A', '350°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('A', '120°C', 'Excellent with non-polar alkanes.'),
    epdm: R('D', 'Not Recommended', 'EPDM is destroyed by aliphatic hydrocarbons.', 'Degradation')
  },
  dioxane: {
    pfa: R('A', '260°C', 'Inert.'),
    ptfe: R('A', '260°C', 'Inert.'),
    fep: R('A', '200°C', 'Inert.'),
    peek: R('B', '80°C', 'Slight swelling at elevated temperature.'),
    ss316: R('A', '250°C', 'Inert.'),
    hastelloy: R('A', '300°C', 'Inert.'),
    glass: R('A', '200°C', 'Inert.'),
    sic: R('A', '300°C', 'Inert.'),
    titanium: R('A', '200°C', 'Inert.'),
    ffkm: R('A', '260°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Severe swelling.'),
    epdm: R('D', 'Not Recommended', 'Severe swelling.')
  },

  // --- Acids ---
  hcl: {
    pfa: R('A', '200°C', 'Completely inert to concentrated HCl.'),
    ptfe: R('A', '200°C', 'Completely inert to concentrated HCl.'),
    fep: R('A', '180°C', 'Completely inert.'),
    peek: R('B', '60°C', 'Resistant at ambient; minor attack at >60°C.'),
    ss316: R('D', 'Not Recommended', 'CRITICAL: Severe chloride pitting corrosion and stress cracking! Never use SS316 with HCl.', 'Severe pitting corrosion & leak'),
    hastelloy: R('A', '150°C', 'Engineered specifically for high chloride / HCl flow streams.'),
    glass: R('A', '150°C', 'Standard inert material for HCl reactions.'),
    sic: R('A', '250°C', 'Completely immune to HCl.'),
    titanium: R('D', 'Not Recommended', 'Attacked by reducing acids (HCl) with rapid corrosion.', 'Severe corrosion'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('B', '60°C', 'Fair with aqueous HCl up to 60°C.'),
    epdm: R('B', '60°C', 'Fair with aqueous HCl.')
  },
  h2so4: {
    pfa: R('A', '220°C', 'Inert even to fuming H₂SO₄.'),
    ptfe: R('A', '220°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('D', 'Not Recommended', 'CRITICAL: PEEK dissolves and sulfonates immediately in conc. H₂SO₄! Turns dark black.', 'Immediate dissolution & destruction'),
    ss316: R('C', 'Ambient', 'Rapid corrosion if diluted; pure 98% passivates at RT but corrodes at >40°C.', 'High corrosion rate'),
    hastelloy: R('A', '120°C', 'Excellent resistance to H₂SO₄ across all concentrations.'),
    glass: R('A', '180°C', 'Inert.'),
    sic: R('A', '250°C', 'Universal resistance to hot H₂SO₄.'),
    titanium: R('D', 'Not Recommended', 'Rapidly dissolved by sulfuric acid.', 'Severe attack'),
    ffkm: R('A', '220°C', 'Inert.'),
    fkm: R('B', '50°C', 'Moderate resistance to conc. acid.'),
    epdm: R('C', 'Ambient', 'Subject to oxidation by 98% H₂SO₄.')
  },
  hno3: {
    pfa: R('A', '200°C', 'Inert to red fuming and concentrated HNO₃.'),
    ptfe: R('A', '200°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('D', 'Not Recommended', 'CRITICAL: Concentrated HNO₃ oxidizes and degrades PEEK polymers rapidly.', 'Rapid oxidation & embrittlement'),
    ss316: R('B', '50°C', 'Passivates at ambient (<50°C); corrodes at elevated temperature.'),
    hastelloy: R('B', '80°C', 'Good resistance; inspect for hot oxidizing attack.'),
    glass: R('A', '180°C', 'Inert.'),
    sic: R('A', '250°C', 'Immune to nitric acid.'),
    titanium: R('A', '100°C', 'Excellent resistance (strongly passivated by HNO₃).'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Oxidative degradation over time.'),
    epdm: R('D', 'Not Recommended', 'Oxidized and destroyed by conc. HNO₃.', 'Severe degradation')
  },
  hf: {
    pfa: R('A', '180°C', 'Inert; preferred tubing for HF delivery.'),
    ptfe: R('A', '180°C', 'Inert; universal liner for HF flow.'),
    fep: R('A', '160°C', 'Inert.'),
    peek: R('B', 'Ambient', 'Fair at room temperature; avoid elevated temp.'),
    ss316: R('D', 'Not Recommended', 'Attacked and corroded rapidly.', 'Pitting and failure'),
    hastelloy: R('C', 'Ambient', 'Moderate attack; requires special C-22 or Monel.'),
    glass: R('D', 'Not Recommended', 'CRITICAL: HF rapidly dissolves and etches borosilicate glass! Reactor rupture risk.', 'Catastrophic dissolution of glass'),
    sic: R('A', '200°C', 'SiC microreactors are completely resistant to HF!'),
    titanium: R('D', 'Not Recommended', 'Violently attacked by HF!', 'Violent dissolution'),
    ffkm: R('A', '180°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Fair at dilute concentrations.'),
    epdm: R('B', 'Ambient', 'Fair.')
  },
  tfa: {
    pfa: R('A', '200°C', 'Inert.'),
    ptfe: R('A', '200°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('B', 'Ambient', 'Minor swelling over prolonged contact; usable for Boc deprotection.'),
    ss316: R('B', '60°C', 'Acceptable at ambient; corrodes at >60°C.'),
    hastelloy: R('A', '150°C', 'Inert.'),
    glass: R('A', '150°C', 'Inert.'),
    sic: R('A', '200°C', 'Inert.'),
    titanium: R('B', 'Ambient', 'Acceptable.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Moderate swelling.'),
    epdm: R('D', 'Not Recommended', 'Degraded by strong organic acids.')
  },
  acetic_acid: {
    pfa: R('A', '220°C', 'Inert.'),
    ptfe: R('A', '220°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('A', '120°C', 'Inert.'),
    ss316: R('A', '100°C', 'Good resistance to glacial acetic acid.'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('A', '180°C', 'Inert.'),
    sic: R('A', '250°C', 'Inert.'),
    titanium: R('A', '150°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Mild swelling with glacial AcOH.'),
    epdm: R('A', '100°C', 'Excellent resistance to organic acids.')
  },
  aqua_regia: {
    pfa: R('A', '150°C', 'Inert.'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('D', 'Not Recommended', 'CRITICAL: Rapidly carbonizes and oxidizes PEEK.', 'Total destruction'),
    ss316: R('D', 'Not Recommended', 'CRITICAL: Rapid, violent corrosion of stainless steel.', 'Extreme corrosion'),
    hastelloy: R('D', 'Not Recommended', 'Severe corrosion from nascent chlorine / NOCl.', 'Corrosion failure'),
    glass: R('A', '150°C', 'Inert.'),
    sic: R('A', '200°C', 'Inert.'),
    titanium: R('D', 'Not Recommended', 'Severely attacked.', 'Severe attack'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Destroyed immediately.', 'Seal destruction'),
    epdm: R('D', 'Not Recommended', 'Destroyed immediately.', 'Seal destruction')
  },

  // --- Bases ---
  naoh: {
    pfa: R('A', '220°C', 'Inert.'),
    ptfe: R('A', '220°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('A', '150°C', 'Excellent resistance to strong alkalis.'),
    ss316: R('A', '120°C', 'Good; susceptible to caustic embrittlement only at >120°C.'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('C', 'Ambient', 'Hot caustic solutions slowly etch and thin borosilicate glass walls over time!', 'Glass etching & thinning'),
    sic: R('A', '150°C', 'Highly resistant (attacked only by molten NaOH at >500°C).'),
    titanium: R('A', '100°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Attacked by strong bases at elevated temperatures.'),
    epdm: R('A', '120°C', 'Excellent resistance to strong aqueous bases.')
  },
  koh: {
    pfa: R('A', '220°C', 'Inert.'),
    ptfe: R('A', '220°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('A', '150°C', 'Inert.'),
    ss316: R('A', '120°C', 'Inert.'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('C', 'Ambient', 'Alcoholic KOH etches and frosts glass surfaces quickly.', 'Glass surface etching'),
    sic: R('A', '150°C', 'Inert.'),
    titanium: R('A', '100°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Attacked by concentrated bases.'),
    epdm: R('A', '120°C', 'Excellent.')
  },
  nbuli: {
    pfa: R('B', '40°C', 'Acceptable at ambient/cryo; avoid >80°C where fluoropolymers can be dehalogenated.'),
    ptfe: R('B', '40°C', 'Acceptable at ambient/cryo.'),
    fep: R('B', '40°C', 'Acceptable at ambient/cryo.'),
    peek: R('A', 'Ambient', 'Standard material for organometallic flash chemistry microreactors.'),
    ss316: R('A', '150°C', 'Inert to organolithiums.'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('A', 'Ambient', 'Inert (keep anhydrous).'),
    sic: R('A', '150°C', 'Inert.'),
    titanium: R('A', '100°C', 'Inert.'),
    ffkm: R('A', '100°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton is degraded by alkyl lithium superbases.', 'Degradation'),
    epdm: R('D', 'Not Recommended', 'Carrier alkane solvents (hexanes) swell EPDM.', 'Severe swelling')
  },
  tea: {
    pfa: R('A', '220°C', 'Inert.'),
    ptfe: R('A', '220°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('A', '150°C', 'Inert.'),
    ss316: R('A', '200°C', 'Inert.'),
    hastelloy: R('A', '250°C', 'Inert.'),
    glass: R('A', '180°C', 'Inert.'),
    sic: R('A', '250°C', 'Inert.'),
    titanium: R('A', '150°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton is attacked by aliphatic amines (TEA, DIPEA).', 'Amine embrittlement'),
    epdm: R('A', '100°C', 'Excellent resistance to amines.')
  },
  ammonia: {
    pfa: R('A', '200°C', 'Inert.'),
    ptfe: R('A', '200°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('A', '120°C', 'Inert.'),
    ss316: R('A', '150°C', 'Inert (avoid copper alloys).'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('A', '100°C', 'Inert.'),
    sic: R('A', '200°C', 'Inert.'),
    titanium: R('A', '150°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Attacked by amines.'),
    epdm: R('A', '100°C', 'Excellent.')
  },
  sodium_methoxide: {
    pfa: R('A', '200°C', 'Inert.'),
    ptfe: R('A', '200°C', 'Inert.'),
    fep: R('A', '180°C', 'Inert.'),
    peek: R('A', '120°C', 'Inert.'),
    ss316: R('A', '150°C', 'Inert.'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('B', 'Ambient', 'Slow etching at elevated temperature.'),
    sic: R('A', '200°C', 'Inert.'),
    titanium: R('A', '100°C', 'Inert.'),
    ffkm: R('A', '200°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Moderate swelling.'),
    epdm: R('A', '100°C', 'Excellent.')
  },

  // --- Reactive Reagents & Oxidizers ---
  socl2: {
    pfa: R('A', '150°C', 'Inert; preferred tubing for acid chloride synthesis.'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('C', 'Ambient', 'Attacked at elevated temperature; releases corrosive HCl.', 'Chemical attack over time'),
    ss316: R('D', 'Not Recommended', 'CRITICAL: Severe pitting and stress corrosion cracking from chloride species!', 'Catastrophic pitting & leak'),
    hastelloy: R('A', '150°C', 'Recommended metal alloy for continuous chlorinations.'),
    glass: R('A', '150°C', 'Inert.'),
    sic: R('A', '200°C', 'Completely immune.'),
    titanium: R('D', 'Not Recommended', 'Attacked by chlorides and thionyl chloride.', 'Severe corrosion'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Destroyed by thionyl chloride.', 'Seal degradation'),
    epdm: R('D', 'Not Recommended', 'Destroyed immediately.', 'Seal degradation')
  },
  oxalyl_chloride: {
    pfa: R('A', '120°C', 'Inert.'),
    ptfe: R('A', '120°C', 'Inert.'),
    fep: R('A', '100°C', 'Inert.'),
    peek: R('C', 'Ambient', 'Tolerable at low temperature; high pressure gas evolution occurs.', 'Stress cracking risk'),
    ss316: R('D', 'Not Recommended', 'Chloride attack and corrosion of stainless steel.', 'Pitting corrosion'),
    hastelloy: R('A', '120°C', 'Inert.'),
    glass: R('A', '100°C', 'Inert.'),
    sic: R('A', '150°C', 'Inert.'),
    titanium: R('D', 'Not Recommended', 'Attacked by reactive acid chlorides.', 'Corrosion'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Destroyed by oxalyl chloride.', 'Seal failure'),
    epdm: R('D', 'Not Recommended', 'Destroyed.', 'Seal failure')
  },
  bromine: {
    pfa: R('A', '150°C', 'Inert.'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('D', 'Not Recommended', 'CRITICAL: Bromine chemically attacks and degrades PEEK polymers.', 'Chemical attack & embrittlement'),
    ss316: R('D', 'Not Recommended', 'CRITICAL: Severe halogen pitting corrosion on SS316.', 'Severe pitting'),
    hastelloy: R('B', '60°C', 'Acceptable at ambient; inspect for wet bromine attack.'),
    glass: R('A', '150°C', 'Inert.'),
    sic: R('A', '200°C', 'Inert.'),
    titanium: R('D', 'Not Recommended', 'CRITICAL FIRE RISK: Titanium can spontaneously ignite in dry halogen gases (Br₂, Cl₂)!', 'Spontaneous combustion hazard'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('D', 'Not Recommended', 'Viton is attacked by elemental halogens.', 'Seal degradation'),
    epdm: R('D', 'Not Recommended', 'Rapidly oxidized and destroyed.', 'Seal destruction')
  },
  h2o2: {
    pfa: R('A', '150°C', 'Inert (non-catalytic surface).'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('B', '50°C', 'Acceptable at ambient; oxidized at >50°C.'),
    ss316: R('B', 'Ambient', 'Requires meticulous passivation; unpassivated iron decomposes H₂O₂ exothermically!', 'Catalytic decomposition risk'),
    hastelloy: R('A', '80°C', 'Passivated Hastelloy is stable.'),
    glass: R('A', '120°C', 'Inert (excellent non-catalytic surface).'),
    sic: R('A', '150°C', 'Immune to peroxide oxidation.'),
    titanium: R('A', '60°C', 'Passivated.'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('B', 'Ambient', 'Acceptable for dilute H₂O₂.'),
    epdm: R('C', 'Ambient', 'Oxidized by concentrated perhydrol (>30%).')
  },
  mcpba: {
    pfa: R('A', '150°C', 'Inert.'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('B', 'Ambient', 'Acceptable in solution; observe for swelling by co-solvent (DCM).'),
    ss316: R('B', 'Ambient', 'Tolerable in organic solution.'),
    hastelloy: R('A', '100°C', 'Inert.'),
    glass: R('A', '120°C', 'Inert.'),
    sic: R('A', '150°C', 'Inert.'),
    titanium: R('A', '80°C', 'Inert.'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('C', 'Ambient', 'Swollen by carrier solvent (DCM/EtOAc).'),
    epdm: R('D', 'Not Recommended', 'Organic peroxides degrade EPDM.')
  },
  nabh4: {
    pfa: R('A', '150°C', 'Inert.'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('A', '100°C', 'Inert.'),
    ss316: R('A', '150°C', 'Inert.'),
    hastelloy: R('A', '200°C', 'Inert.'),
    glass: R('A', '120°C', 'Inert.'),
    sic: R('A', '200°C', 'Inert.'),
    titanium: R('A', '100°C', 'Inert.'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('B', 'Ambient', 'Acceptable.'),
    epdm: R('B', 'Ambient', 'Acceptable for aqueous NaBH₄; avoid DIBAL in toluene.')
  },
  bleach: {
    pfa: R('A', '150°C', 'Inert.'),
    ptfe: R('A', '150°C', 'Inert.'),
    fep: R('A', '120°C', 'Inert.'),
    peek: R('B', '50°C', 'Acceptable at ambient; oxidized by hot bleach.'),
    ss316: R('D', 'Not Recommended', 'CRITICAL: Severe pitting and crevice corrosion from hypochlorite and chlorides.', 'Pitting corrosion'),
    hastelloy: R('A', '100°C', 'Excellent resistance to hypochlorite solutions.'),
    glass: R('A', '100°C', 'Inert.'),
    sic: R('A', '150°C', 'Inert.'),
    titanium: R('A', '100°C', 'Titanium is extraordinarily resistant to wet chlorine and bleach.'),
    ffkm: R('A', '150°C', 'Inert.'),
    fkm: R('B', '50°C', 'Good.'),
    epdm: R('B', '50°C', 'Acceptable.')
  },
  h2_gas: {
    pfa: R('B', '80°C', 'Permeable to hydrogen gas under high pressure; minor leak hazard.', 'Gas permeation'),
    ptfe: R('B', '80°C', 'Permeable to hydrogen gas under high pressure.'),
    fep: R('B', '80°C', 'Permeable under high pressure.'),
    peek: R('A', '150°C', 'Low gas permeability; good for high-pressure H₂.'),
    ss316: R('A', '300°C', 'Standard high-pressure hydrogen line (check for embrittlement at >350°C).'),
    hastelloy: R('A', '350°C', 'Excellent high-pressure hydrogen resistance.'),
    glass: R('B', 'Ambient', 'High pressure gas risk; requires blast shielding for glass!'),
    sic: R('A', '250°C', 'High integrity.'),
    titanium: R('C', 'Ambient', 'Susceptible to titanium hydride embrittlement under high H₂ pressure.', 'Hydride embrittlement'),
    ffkm: R('A', '200°C', 'Inert (watch for explosive decompression if rapidly vented).'),
    fkm: R('B', '100°C', 'Acceptable.'),
    epdm: R('A', '100°C', 'Good.')
  }
};

// Quick helper to fetch rating detail for any substance and material
export function getMaterialCompatibility(chemicalId: string, materialId: string): RatingDetail {
  const row = COMPATIBILITY_DATA[chemicalId];
  if (row && row[materialId]) {
    return row[materialId];
  }
  // Default fallback if pair not explicitly enumerated
  return {
    rating: 'B',
    ratingLabel: 'Good (Assumed)',
    maxTemp: 'Ambient',
    notes: 'Standard laboratory conditions. Verify with manufacturer.'
  };
}

// Find chemical by id or fuzzy match name
export function findChemical(query: string): ChemicalSubstance | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return CHEMICAL_SUBSTANCES.find(c => 
    c.id.toLowerCase() === q ||
    c.name.toLowerCase() === q ||
    c.name.toLowerCase().includes(q) ||
    (c.formula && c.formula.toLowerCase() === q) ||
    (c.cas && c.cas === q)
  );
}

// Match user-entered or feed node string to chemical
export function matchSubstanceFromFeed(feedNameOrSolvent: string): ChemicalSubstance | undefined {
  if (!feedNameOrSolvent) return undefined;
  const str = feedNameOrSolvent.trim().toLowerCase();
  
  // Direct ID check
  const direct = CHEMICAL_SUBSTANCES.find(c => c.id === str);
  if (direct) return direct;

  // Name inclusions
  for (const c of CHEMICAL_SUBSTANCES) {
    if (str.includes(c.id)) return c;
    const cleanName = c.name.toLowerCase();
    if (cleanName.includes(str) || str.includes(cleanName.split(' ')[0])) {
      return c;
    }
    if (c.formula && c.formula.toLowerCase() === str) {
      return c;
    }
  }
  return undefined;
}

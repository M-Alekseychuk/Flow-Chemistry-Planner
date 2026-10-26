# Data Models & Schemas

## TypeScript Definitions (`src/types.ts`)

### 1. Project Entity
```typescript
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  comments?: string;
  deletedAt?: number; // Present when soft-deleted to Bin
  flowData: FlowData;
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  stoiRows?: StoiRow[];
  customModules?: CustomModuleTemplate[];
}
```

### 2. Stoichiometry Feed Row (`StoiRow`)
```typescript
export interface StoiRow {
  id: string | number;
  name: string;
  conc: number;          // Molarity in M (mol/L)
  flow: number;          // Flow rate in mL/min
  solvent?: string;      // Carrier solvent, e.g., 'THF', 'DCM', 'Water'
  isLimiting: boolean;   // True if chosen as limiting stoichiometric benchmark
  equivInput?: string;   // Transient user input buffer when typing equivalents
}
```

### 3. Custom Module System
```typescript
export interface CustomModuleField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  unit?: string;         // e.g. "rpm", "bar", or "mL/min, uL/min"
  placeholder?: string;
  defaultValue?: string;
  options?: string[];    // Used when type === 'select'
  isFlowSource?: boolean;// When true, drives canvas flow simulation
}

export interface CustomModuleTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;     // Base64 data URL
  imageSize?: number;    // Display height in px (24-140px, default 48)
  iconPreset?: 'pump' | 'reactor' | 'vessel' | 'sensor' | 'valve' | 'generic';
  inputs: number;        // 0 to 4 target handles
  outputs: number;       // 0 to 4 source handles
  fields: CustomModuleField[];
  createdAt: number;
}
```

### 4. Edge Simulation Data (`SimData`)
```typescript
export interface SimData {
  flow: number;          // Flow rate in mL/min
  conc: number;          // Concentration in M
  pressureDrop: number;  // Hagen-Poiseuille hydraulic loss in bar
  streamColor: string;   // Hex color code of stream
  streamGlowColor: string; // Accent glow hex color
  streamName: string;    // 'Blue Stream', 'Orange Stream', or 'Mixed Stream'
  isMixed: boolean;      // True if originating from multiple distinct feed sources
  sources: string[];     // Array of origin feed IDs
}
```

### 5. Node Types Supported
- **Reactors**: `reactor`, `microReactor`, `columnReactor`, `coilReactor`, `photoreactor`, `tubeInTube`, `packedBed`, `cstr`
- **Pumps**: `pump`, `syringePump`, `hplcPump`, `peristalticPump`, `diaphragmPump`, `gearPump`
- **Regulators & Sensors**: `mfc`, `bpr`, `pressureGauge`, `tempSensor`
- **Mixers**: `mixer`, `tMixer`, `yMixer`, `staticMixer`, `fourPortValve`
- **Feed Solutions & Collectors**: `reagent`, `stoiReagent`, `gasBottle`, `sampleLoop`, `zaiput`, `collectionFlask`, `fractionCollector`
- **Calculations & Annotations**: `calcResult`, `stoiResult`, `freeText`, `customModule`

---

## LocalStorage Key Registry

| Key | Type | Description |
| :--- | :--- | :--- |
| `flow-projects` | `Project[]` | Active user projects |
| `flow-deleted-projects` | `Project[]` | Soft-deleted projects in Bin |
| `flow-custom-modules` | `CustomModuleTemplate[]` | User-defined custom equipment library |
| `flow-favorites` | `string[]` | Favorite node types pinned in palette |
| `flow-darkmode` | `'true' \| 'false'` | Light vs Dark theme selection |
| `flow-grid-snap` | `'true' \| 'false'` | Snap-to-grid toggle on canvas |
| `flow-rate-unit` | `'mL/min' \| 'L/h'` | Preferred volumetric flow unit |
| `flow-stream-colors-mode`| `'true' \| 'false'` | Multi-color stream vs accessible uniform mode |
| `flow_app_custom_logo` | `string` | Base64 PNG/JPG of custom branding logo |
| `flow_app_logo_height` | `number` | Logo display height in pixels (default: 32) |

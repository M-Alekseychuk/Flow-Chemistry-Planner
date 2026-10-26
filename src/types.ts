export type NodeType = 
  | 'reactor'
  | 'microReactor'
  | 'columnReactor'
  | 'coilReactor'
  | 'photoreactor'
  | 'sampleLoop'
  | 'tubeInTube'
  | 'packedBed'
  | 'cstr'
  | 'pump'
  | 'syringePump'
  | 'hplcPump'
  | 'peristalticPump'
  | 'diaphragmPump'
  | 'gearPump'
  | 'gasBottle'
  | 'mfc'
  | 'bpr'
  | 'pressureGauge'
  | 'tempSensor'
  | 'mixer'
  | 'tMixer'
  | 'yMixer'
  | 'staticMixer'
  | 'fourPortValve'
  | 'zaiput'
  | 'collectionFlask'
  | 'fractionCollector'
  | 'reagent'
  | 'calcResult'
  | 'stoiResult'
  | 'customModule';

export interface CustomModuleField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  unit?: string; // Single unit e.g. "rpm" or comma-separated selectable units e.g. "mL/min, uL/min"
  placeholder?: string;
  defaultValue?: string;
  options?: string[]; // Used when type === 'select'
  isFlowSource?: boolean; // When true, drives canvas flow rate simulation
}

export interface CustomModuleTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; // Data URL of uploaded image
  imageSize?: number; // Size in px (e.g. 24px - 140px, default 48)
  iconPreset?: 'pump' | 'reactor' | 'vessel' | 'sensor' | 'valve' | 'generic';
  inputs: number; // 0 to 4
  outputs: number; // 0 to 4
  fields: CustomModuleField[];
  createdAt: number;
}

export type CalculatorType = 
  | 'stoichiometry'
  | 'volume'
  | 'residenceTime'
  | 'tubingLength'
  | 'flowRate'
  | 'unitConverter'
  | 'sty';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  comments: string;
  flowData: {
    nodes: any[];
    edges: any[];
    viewport: any;
    stoiRows: any[];
    customModules?: CustomModuleTemplate[];
    setupPhoto?: string;
    setupPhotoCaption?: string;
  };
}

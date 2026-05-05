export enum CrackKind {
  Structural = 'structural',
  Thermal = 'thermal',
  Shrinkage = 'shrinkage',
  Crazing = 'crazing'
}

export enum CrackPattern {
  Linear = 'linear',
  Branching = 'branching',
  Network = 'network',
  Random = 'random',
  Map = 'map'
}

export enum CrackSeverity {
  Minor = 'minor',
  Moderate = 'moderate',
  Severe = 'severe'
}

export enum SurfaceType {
  Wall = 'wall',
  Slab = 'slab',
  Pavement = 'pavement'
}

export enum LocationType {
  Wall = 'Wall',
  Beam = 'Beam',
  Column = 'Column',
  Slab = 'Slab/Ceiling',
  Floor = 'Floor/Pavement'
}

export interface AIClassification {
  kind: CrackKind;
  pattern: CrackPattern;
  severity: CrackSeverity;
  surface: SurfaceType;
}

export interface QuestionnaireState {
  location: LocationType;
  answers: Record<string, string | boolean>;
}

export interface DiagnosisResult {
  type: string;
  confidence: 'High' | 'Medium' | 'Low';
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  root_cause: string;
  override_reason?: string;
  action_plan: {
    immediate: string;
    repair: string;
    prevention: string;
  };
}

export interface AppState {
  ai_classification: AIClassification | null;
  questionnaire: QuestionnaireState | null;
  diagnosis: DiagnosisResult | null;
}

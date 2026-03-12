export interface Solution {
  id: string;
  name: string;
  description: string;
  leafCount: number;
  spineCount: number;
  leafModel: string;
  spineModel: string | null;
  maxCapacity: number;
  scalable: boolean;
  notes: string[];
}

export interface CalculationResult {
  serverCount: number;
  solutions: Solution[];
}

export enum NetworkTier {
  Direct = 'Direct',
  SingleLeaf = 'Single Leaf',
  SpineLeaf = 'Spine-Leaf',
}
export type Unit = {
  id: string;
  name: string;
  // Minimum tier cost for display
  baseCost: number;
  // Tiered pricing map: model count -> total unit cost
  costTiers: Record<number, number>;
  modelsPerUnit: { min: number; max: number };
  wounds: number;
  toughness: number;
  save: number;
  invulnSave?: number;
  wargear?: string[];
  abilities?: string[];
};

export type UnitInstance = {
  id: string;
  unitId: string;
  name: string;
  currentModels: number;
  totalModels: number;
  wounds: number;
  maxWounds: number;
  isDead: boolean;
};

export const ULTRAMARINES_UNITS: Unit[] = [
  {
    id: "intercessor-squad",
    name: "Intercessor Squad",
    baseCost: 80,
    costTiers: { 5: 80, 10: 160 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 2,
    toughness: 4,
    save: 3,
  },
  {
    id: "desolation-squad",
    name: "Desolation Squad",
    baseCost: 200,
    costTiers: { 5: 200 },
    modelsPerUnit: { min: 5, max: 5 },
    wounds: 2,
    toughness: 4,
    save: 3,
  },
  {
    id: "tactical-squad",
    name: "Tactical Squad",
    baseCost: 140,
    costTiers: { 10: 140 },
    modelsPerUnit: { min: 10, max: 10 },
    wounds: 2,
    toughness: 4,
    save: 3,
  },
  {
    id: "terminator-assault-squad",
    name: "Terminator Assault Squad",
    baseCost: 180,
    costTiers: { 5: 180, 10: 360 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 3,
    toughness: 5,
    save: 2,
    invulnSave: 4,
  },
];

// Common alias for consumers selecting by faction
export const UNITS = ULTRAMARINES_UNITS;

export function getUnitById(id: string): Unit | undefined {
  return ULTRAMARINES_UNITS.find((u) => u.id === id);
}

export function getUnitsByType(): Unit[] {
  return ULTRAMARINES_UNITS;
}

export function calculateUnitCost(unit: Unit, modelCount: number): number {
  if (unit.costTiers[modelCount] != null) return unit.costTiers[modelCount];
  const sizes = Object.keys(unit.costTiers)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
  const within = sizes.filter((n) => n >= unit.modelsPerUnit.min && n <= unit.modelsPerUnit.max);
  if (within.length === 0) return 0;
  let closest = within[0];
  let bestDiff = Math.abs(modelCount - closest);
  for (const n of within) {
    const diff = Math.abs(modelCount - n);
    if (diff < bestDiff) {
      bestDiff = diff;
      closest = n;
    }
  }
  return unit.costTiers[closest] ?? 0;
}

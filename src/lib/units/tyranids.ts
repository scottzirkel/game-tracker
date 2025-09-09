export type Unit = {
  id: string;
  name: string;
  baseCost: number;
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

export const TYRANIDS_UNITS: Unit[] = [
  {
    id: "termagants",
    name: "Termagants",
    baseCost: 60,
    costTiers: { 10: 60, 20: 120 },
    modelsPerUnit: { min: 10, max: 20 },
    wounds: 1,
    toughness: 3,
    save: 5,
  },
  {
    id: "hormagaunts",
    name: "Hormagaunts",
    baseCost: 65,
    costTiers: { 10: 65, 20: 130 },
    modelsPerUnit: { min: 10, max: 20 },
    wounds: 1,
    toughness: 3,
    save: 5,
  },
  {
    id: "genestealers",
    name: "Genestealers",
    baseCost: 75,
    costTiers: { 5: 75, 10: 150 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 2,
    toughness: 4,
    save: 5,
  },
];

// Common alias for consumers selecting by faction
export const UNITS = TYRANIDS_UNITS;

export function getUnitById(id: string): Unit | undefined {
  return TYRANIDS_UNITS.find((u) => u.id === id);
}

export function getUnitsByType(): Unit[] {
  return TYRANIDS_UNITS;
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

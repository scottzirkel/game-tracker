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

export const CHAOS_MARINES_UNITS: Unit[] = [
  {
    id: "legionaries",
    name: "Legionaries",
    baseCost: 90,
    costTiers: { 5: 90, 10: 170 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 2,
    toughness: 4,
    save: 3,
  },
  {
    id: "chaos-terminator-squad",
    name: "Chaos Terminator Squad",
    baseCost: 180,
    costTiers: { 5: 180, 10: 360 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 3,
    toughness: 5,
    save: 2,
  },
  {
    id: "chosen",
    name: "Chosen",
    baseCost: 125,
    costTiers: { 5: 125, 10: 250 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 3,
    toughness: 4,
    save: 3,
  },
];

// Common alias for consumers selecting by faction
export const UNITS = CHAOS_MARINES_UNITS;

export function getUnitById(id: string): Unit | undefined {
  return CHAOS_MARINES_UNITS.find((u) => u.id === id);
}

export function getUnitsByType(): Unit[] {
  return CHAOS_MARINES_UNITS;
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

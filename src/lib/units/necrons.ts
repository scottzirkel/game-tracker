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

export const NECRONS_UNITS: Unit[] = [
  {
    id: "necron-warriors",
    name: "Necron Warriors",
    baseCost: 90,
    costTiers: { 10: 90, 20: 200 },
    modelsPerUnit: { min: 10, max: 20 },
    wounds: 1,
    toughness: 4,
    save: 4,
  },
  {
    id: "immortals",
    name: "Immortals",
    baseCost: 70,
    costTiers: { 5: 70, 10: 150 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 1,
    toughness: 5,
    save: 3,
  },
  {
    id: "lychguard",
    name: "Lychguard",
    baseCost: 85,
    costTiers: { 5: 85, 10: 170 },
    modelsPerUnit: { min: 5, max: 10 },
    wounds: 2,
    toughness: 5,
    save: 3,
    invulnSave: 4,
  },
];

// Common alias for consumers selecting by faction
export const UNITS = NECRONS_UNITS;

export function getUnitById(id: string): Unit | undefined {
  return NECRONS_UNITS.find((u) => u.id === id);
}

export function getUnitsByType(): Unit[] {
  return NECRONS_UNITS;
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

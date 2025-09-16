export type UnitType =
  | "HQ"
  | "Troops"
  | "Elites"
  | "Fast Attack"
  | "Heavy Support"
  | "Transport"
  | "Lord of War";

export type Unit = {
  id: string;
  name: string;
  // baseCost is the minimum tier cost, used for display in lists
  baseCost: number;
  // costTiers map model count -> total unit cost at that size
  costTiers: Record<number, number>;
  modelsPerUnit: {
    min: number;
    max: number;
  };
  wounds: number;
  toughness: number;
  save: number;
  invulnSave?: number;
  type?: UnitType;
  wargear?: string[];
  abilities?: string[];
};

export type UnitInstance = {
  id: string;
  unitId: string;
  name: string; // Custom name for this instance
  currentModels: number;
  totalModels: number;
  wounds: number; // Current wounds on damaged model
  maxWounds: number; // Max wounds per model
  isDead: boolean;
};

export const CUSTODES_UNITS: Unit[] = [
  // HQ and Characters
  {
    id: "blade-champion",
    name: "Blade Champion",
    costTiers: { 1: 120 },
    baseCost: 120,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 6,
    toughness: 6,
    save: 2,
    invulnSave: 4,
  },
  {
    id: "custodian-guard-shield-captain",
    name: "Custodian Guard - Shield Captain",
    costTiers: { 1: 130 },
    baseCost: 130,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 6,
    toughness: 6,
    save: 2,
    invulnSave: 4,
  },
  {
    id: "allarus-shield-captain",
    name: "Allarus Custodians - Shield Captain",
    costTiers: { 1: 130 },
    baseCost: 130,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 6,
    toughness: 6,
    save: 2,
    invulnSave: 4,
  },
  {
    id: "shield-captain-dawneagle",
    name: "Shield Captain on Dawneagle",
    costTiers: { 1: 150 },
    baseCost: 150,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 8,
    toughness: 6,
    save: 2,
    invulnSave: 4,
  },
  {
    id: "trajann-valoris",
    name: "Trajann Valoris",
    costTiers: { 1: 140 },
    baseCost: 140,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 8,
    toughness: 6,
    save: 2,
    invulnSave: 3,
  },

  // Troops
  {
    id: "custodian-guard",
    name: "Custodian Guard",
    type: "Troops",
    costTiers: { 4: 170, 5: 215 },
    baseCost: 170,
    modelsPerUnit: { min: 4, max: 5 },
    wounds: 4,
    toughness: 6,
    save: 2,
    invulnSave: 4,
    wargear: ["Guardian Spear", "Sentinel Blade & Storm Shield"],
  },

  // Elites
  {
    id: "allarus-custodians",
    name: "Allarus Custodians",
    type: "Elites",
    costTiers: { 2: 120, 3: 180, 4: 300, 5: 300, 6: 320 },
    baseCost: 120,
    modelsPerUnit: { min: 2, max: 6 },
    wounds: 4,
    toughness: 6,
    save: 2,
    invulnSave: 4,
    abilities: ["Deep Strike"],
    wargear: ["Castellan Axe", "Guardian Spear"],
  },
  {
    id: "custodian-wardens",
    name: "Custodian Wardens",
    type: "Elites",
    costTiers: { 4: 210, 5: 260 },
    baseCost: 210,
    modelsPerUnit: { min: 4, max: 5 },
    wounds: 4,
    toughness: 6,
    save: 2,
    invulnSave: 4,
    wargear: ["Castellan Axe", "Guardian Spear"],
  },
  {
    id: "venerable-contemptor-dreadnought",
    name: "Venerable Contemptor Dreadnought",
    type: "Elites",
    costTiers: { 1: 170 },
    baseCost: 170,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 10,
    toughness: 9,
    save: 2,
    invulnSave: 4,
  },

  // Fast Attack
  {
    id: "vertus-praetors",
    name: "Vertus Praetors",
    type: "Fast Attack",
    costTiers: { 2: 150, 3: 225 },
    baseCost: 150,
    modelsPerUnit: { min: 2, max: 3 },
    wounds: 6,
    toughness: 6,
    save: 2,
    invulnSave: 4,
    abilities: ["Deep Strike"],
    wargear: ["Interceptor Lance", "Salvo Launcher"],
  },
  {
    id: "venerable-land-raider",
    name: "Venerable Land Raider",
    type: "Heavy Support",
    costTiers: { 1: 240 },
    baseCost: 240,
    modelsPerUnit: { min: 1, max: 1 },
    wounds: 16,
    toughness: 12,
    save: 2,
  },
];

// Common alias for consumers selecting by faction
export const UNITS = CUSTODES_UNITS;

// Utility functions
export function getUnitById(id: string): Unit | undefined {
  return CUSTODES_UNITS.find((unit) => unit.id === id);
}

export function getUnitsByType(type: UnitType): Unit[] {
  return CUSTODES_UNITS.filter((unit) => unit.type === type);
}

export function calculateUnitCost(unit: Unit, modelCount: number): number {
  // Tiered pricing: exact match if available
  if (unit.costTiers[modelCount] != null) return unit.costTiers[modelCount];
  // Fallback: choose the nearest defined tier within min/max
  const sizes = Object.keys(unit.costTiers)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
  const within = sizes.filter((n) => n >= unit.modelsPerUnit.min && n <= unit.modelsPerUnit.max);
  if (within.length === 0) return 0;
  // Find closest size
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

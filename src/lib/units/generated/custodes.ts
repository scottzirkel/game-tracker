export type StatProfile = {
  name: string;
  movement?: number;
  wounds: number;
  toughness: number;
  save: number;
  invulnSave?: number;
  leadership?: number;
  objectiveControl?: number;
};

export type Unit = {
  id: string;
  name: string;
  baseCost: number;
  costTiers: Record<number, number>;
  modelsPerUnit: { min: number; max: number };
  statProfiles: StatProfile[];
  keywords?: string[];
};

export const UNITS: Unit[] = [
  {
    id: "agamatus-custodians-000001560",
    name: "Agamatus Custodians",
    baseCost: 225,
    costTiers: {"3":225,"6":450},
    modelsPerUnit: { min: 3, max: 6 },
    statProfiles: [{"name":"Agamatus Custodians","wounds":4,"toughness":6,"save":2,"movement":12,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Mounted","Fly","Imperium","Agamatus Custodians"],
  },
  {
    id: "aleya-000002088",
    name: "Aleya",
    baseCost: 65,
    costTiers: {"1":65},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Aleya","wounds":4,"toughness":3,"save":3,"movement":6,"invulnSave":5,"leadership":6,"objectiveControl":1}],
    keywords: ["Infantry","Character","Epic Hero","Imperium","Anathema Psykana","Aleya"],
  },
  {
    id: "allarus-custodians-000001453",
    name: "Allarus Custodians",
    baseCost: 120,
    costTiers: {"2":120,"3":180,"5":300,"6":320},
    modelsPerUnit: { min: 2, max: 6 },
    statProfiles: [{"name":"Allarus Custodians","wounds":4,"toughness":7,"save":2,"movement":5,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Allarus Custodians","Imperium","Infantry","Terminator"],
  },
  {
    id: "anathema-psykana-rhino-000002524",
    name: "Anathema Psykana Rhino",
    baseCost: 75,
    costTiers: {"1":75},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Anathema Psykana Rhino","wounds":10,"toughness":9,"save":3,"movement":12,"leadership":6,"objectiveControl":2}],
    keywords: ["Vehicle","Anathema Psykana","Dedicated Transport","Smoke","Imperium","Rhino","Transport"],
  },
  {
    id: "aquilon-custodians-000001558",
    name: "Aquilon Custodians",
    baseCost: 195,
    costTiers: {"3":195,"6":390},
    modelsPerUnit: { min: 3, max: 6 },
    statProfiles: [{"name":"Aquilon Custodians","wounds":4,"toughness":7,"save":2,"movement":5,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Terminator","Infantry","Imperium","Aquilon Custodians"],
  },
  {
    id: "ares-gunship-000001680",
    name: "Ares Gunship",
    baseCost: 580,
    costTiers: {"1":580},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Ares Gunship","wounds":22,"toughness":12,"save":2,"movement":20,"invulnSave":5,"leadership":6,"objectiveControl":0}],
    keywords: ["Fly","Ares Gunship","Aircraft","Imperium","Vehicle"],
  },
  {
    id: "blade-champion-000002518",
    name: "Blade Champion",
    baseCost: 120,
    costTiers: {"1":120},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Blade Champion","wounds":6,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Imperium","Character","Infantry","Blade Champion"],
  },
  {
    id: "caladius-grav-tank-000001460",
    name: "Caladius Grav-tank",
    baseCost: 215,
    costTiers: {"1":215},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Caladius Grav-tank","wounds":14,"toughness":11,"save":2,"movement":10,"invulnSave":5,"leadership":6,"objectiveControl":4}],
    keywords: ["Fly","Imperium","Caladius Grav-tank","Vehicle"],
  },
  {
    id: "contemptor-achillus-dreadnought-000001458",
    name: "Contemptor-achillus Dreadnought",
    baseCost: 155,
    costTiers: {"1":155},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Contemptor-achillus Dreadnought","wounds":10,"toughness":9,"save":2,"movement":6,"invulnSave":5,"leadership":6,"objectiveControl":3}],
    keywords: ["Vehicle","Walker","Imperium","Contemptor-Achillus Dreadnought"],
  },
  {
    id: "contemptor-galatus-dreadnought-000001557",
    name: "Contemptor-galatus Dreadnought",
    baseCost: 165,
    costTiers: {"1":165},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Contemptor-galatus Dreadnought","wounds":10,"toughness":9,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":3}],
    keywords: ["Contemptor-Galatus Dreadnought","Imperium","Walker","Vehicle"],
  },
  {
    id: "coronus-grav-carrier-000001461",
    name: "Coronus Grav-carrier",
    baseCost: 200,
    costTiers: {"1":200},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Coronus Grav-carrier","wounds":16,"toughness":12,"save":2,"movement":12,"invulnSave":5,"leadership":6,"objectiveControl":5}],
    keywords: ["Fly","Imperium","Coronus Grav-carrier","Vehicle","Transport"],
  },
  {
    id: "custodian-guard-000000882",
    name: "Custodian Guard",
    baseCost: 170,
    costTiers: {"4":170,"5":215},
    modelsPerUnit: { min: 4, max: 5 },
    statProfiles: [{"name":"Custodian Guard","wounds":3,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Battleline","Infantry","Imperium","Custodian Guard"],
  },
  {
    id: "custodian-guard-with-adrasite-and-pyrithite-spears-000001559",
    name: "Custodian Guard With Adrasite And Pyrithite Spears",
    baseCost: 250,
    costTiers: {"5":250},
    modelsPerUnit: { min: 5, max: 5 },
    statProfiles: [{"name":"Custodian Guard With Adrasite And Pyrithite Spears","wounds":3,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Infantry","Imperium","Custodian Guard with Adrasite and Pyrithite Spears"],
  },
  {
    id: "custodian-wardens-000001450",
    name: "Custodian Wardens",
    baseCost: 210,
    costTiers: {"4":210,"5":260},
    modelsPerUnit: { min: 4, max: 5 },
    statProfiles: [{"name":"Custodian Wardens","wounds":3,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Infantry","Imperium","Custodian Wardens"],
  },
  {
    id: "knight-centura-000002520",
    name: "Knight-centura",
    baseCost: 55,
    costTiers: {"1":55},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Knight-centura","wounds":4,"toughness":3,"save":3,"movement":6,"invulnSave":5,"leadership":6,"objectiveControl":1}],
    keywords: ["Infantry","Imperium","Character","Knight-Centura","Anathema Psykana"],
  },
  {
    id: "orion-assault-dropship-000001564",
    name: "Orion Assault Dropship",
    baseCost: 690,
    costTiers: {"1":690},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Orion Assault Dropship","wounds":22,"toughness":12,"save":2,"movement":20,"invulnSave":5,"leadership":6,"objectiveControl":0}],
    keywords: ["Orion Assault Dropship","Aircraft","Imperium","Transport","Vehicle","Fly"],
  },
  {
    id: "pallas-grav-attack-000001562",
    name: "Pallas Grav-attack",
    baseCost: 105,
    costTiers: {"1":105},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Pallas Grav-attack","wounds":9,"toughness":8,"save":2,"movement":12,"invulnSave":5,"leadership":6,"objectiveControl":2}],
    keywords: ["Pallas Grav-attack","Imperium","Fly","Vehicle"],
  },
  {
    id: "prosecutors-000002521",
    name: "Prosecutors",
    baseCost: 40,
    costTiers: {"4":40,"5":50,"9":90,"10":100},
    modelsPerUnit: { min: 4, max: 10 },
    statProfiles: [{"name":"Prosecutors","wounds":1,"toughness":3,"save":3,"movement":6,"leadership":6,"objectiveControl":2}],
    keywords: ["Prosecutors","Infantry","Imperium","Anathema Psykana"],
  },
  {
    id: "sagittarum-custodians-000001563",
    name: "Sagittarum Custodians",
    baseCost: 225,
    costTiers: {"5":225},
    modelsPerUnit: { min: 5, max: 5 },
    statProfiles: [{"name":"Sagittarum Custodians","wounds":3,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Sagittarum Custodians","Infantry","Imperium"],
  },
  {
    id: "shield-captain-000001447",
    name: "Shield-captain",
    baseCost: 130,
    costTiers: {"1":130},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Shield-captain","wounds":6,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Character","Imperium","Shield-Captain","Infantry"],
  },
  {
    id: "shield-captain-in-allarus-terminator-armour-000001448",
    name: "Shield-captain In Allarus Terminator Armour",
    baseCost: 130,
    costTiers: {"1":130},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Shield-captain In Allarus Terminator Armour","wounds":7,"toughness":7,"save":2,"movement":5,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Infantry","Character","Terminator","Imperium","Shield-Captain"],
  },
  {
    id: "shield-captain-on-dawneagle-jetbike-000001449",
    name: "Shield-captain On Dawneagle Jetbike",
    baseCost: 150,
    costTiers: {"1":150},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Shield-captain On Dawneagle Jetbike","wounds":8,"toughness":7,"save":2,"movement":12,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Mounted","Character","Fly","Imperium","Dawneagle Jetbike","Shield-Captain"],
  },
  {
    id: "telemon-heavy-dreadnought-000001479",
    name: "Telemon Heavy Dreadnought",
    baseCost: 225,
    costTiers: {"1":225},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Telemon Heavy Dreadnought","wounds":12,"toughness":10,"save":2,"movement":8,"invulnSave":4,"leadership":6,"objectiveControl":4}],
    keywords: ["Vehicle","Telemon Heavy Dreadnought","Imperium","Walker"],
  },
  {
    id: "trajann-valoris-000001446",
    name: "Trajann Valoris",
    baseCost: 140,
    costTiers: {"1":140},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Trajann Valoris","wounds":7,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":5,"objectiveControl":2}],
    keywords: ["Imperium","Epic Hero","Character","Infantry","Trajann Valoris"],
  },
  {
    id: "valerian-000002519",
    name: "Valerian",
    baseCost: 110,
    costTiers: {"1":110},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Valerian","wounds":6,"toughness":6,"save":2,"movement":6,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Epic Hero","Shield-Captain","Infantry","Imperium","Valerian","Character"],
  },
  {
    id: "venatari-custodians-000001561",
    name: "Venatari Custodians",
    baseCost: 165,
    costTiers: {"3":165,"6":330},
    modelsPerUnit: { min: 3, max: 6 },
    statProfiles: [{"name":"Venatari Custodians","wounds":3,"toughness":6,"save":2,"movement":10,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Fly","Imperium","Jump Pack","Venatari Custodians","Infantry"],
  },
  {
    id: "venerable-contemptor-dreadnought-000000883",
    name: "Venerable Contemptor Dreadnought",
    baseCost: 170,
    costTiers: {"1":170},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Venerable Contemptor Dreadnought","wounds":10,"toughness":9,"save":2,"movement":6,"invulnSave":5,"leadership":6,"objectiveControl":3}],
    keywords: ["Venerable Contemptor Dreadnought","Imperium","Walker","Vehicle"],
  },
  {
    id: "venerable-land-raider-000000884",
    name: "Venerable Land Raider",
    baseCost: 240,
    costTiers: {"1":240},
    modelsPerUnit: { min: 1, max: 1 },
    statProfiles: [{"name":"Venerable Land Raider","wounds":16,"toughness":12,"save":2,"movement":10,"leadership":6,"objectiveControl":5}],
    keywords: ["Imperium","Venerable Land Raider","Smoke","Transport","Vehicle"],
  },
  {
    id: "vertus-praetors-000001454",
    name: "Vertus Praetors",
    baseCost: 150,
    costTiers: {"2":150,"3":225},
    modelsPerUnit: { min: 2, max: 3 },
    statProfiles: [{"name":"Vertus Praetors","wounds":5,"toughness":7,"save":2,"movement":12,"invulnSave":4,"leadership":6,"objectiveControl":2}],
    keywords: ["Imperium","Fly","Mounted","Vertus Praetors"],
  },
  {
    id: "vigilators-000002522",
    name: "Vigilators",
    baseCost: 50,
    costTiers: {"4":50,"5":65,"9":115,"10":125},
    modelsPerUnit: { min: 4, max: 10 },
    statProfiles: [{"name":"Vigilators","wounds":1,"toughness":3,"save":3,"movement":6,"leadership":6,"objectiveControl":1}],
    keywords: ["Anathema Psykana","Imperium","Vigilators","Infantry"],
  },
  {
    id: "witchseekers-000002523",
    name: "Witchseekers",
    baseCost: 50,
    costTiers: {"4":50,"5":65,"9":115,"10":125},
    modelsPerUnit: { min: 4, max: 10 },
    statProfiles: [{"name":"Witchseekers","wounds":1,"toughness":3,"save":3,"movement":6,"leadership":6,"objectiveControl":1}],
    keywords: ["Anathema Psykana","Imperium","Infantry","Witchseekers"],
  },
];

export function getUnitById(id: string): Unit | undefined {
  return UNITS.find(u => u.id === id);
}

export function calculateUnitCost(unit: Unit, modelCount: number): number {
  if (unit.costTiers[modelCount] != null) return unit.costTiers[modelCount];
  const sizes = Object.keys(unit.costTiers).map(n => parseInt(n, 10)).sort((a,b)=>a-b);
  const within = sizes.filter(n => n >= unit.modelsPerUnit.min && n <= unit.modelsPerUnit.max);
  if (within.length === 0) return 0;
  let closest = within[0]; let best = Math.abs(modelCount - closest);
  for (const n of within) { const d = Math.abs(modelCount - n); if (d < best) { best = d; closest = n; } }
  return unit.costTiers[closest] ?? 0;
}

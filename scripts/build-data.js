/*
  Build-time generator: reads CSVs under data/raw and emits per-faction unit TS modules under src/lib/units/generated.
  CSVs are pipe-delimited. Expected files:
  - data/raw/Datasheets.csv (id|name|faction_id|...)
  - data/raw/Datasheets_models.csv (datasheet_id|line|name|M|T|Sv|inv_sv|...|W|...)
  - data/raw/Datasheets_models_cost.csv (datasheet_id|line|description|cost)
*/
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(process.cwd(), 'data', 'raw');
const OUT_DIR = path.join(process.cwd(), 'src', 'lib', 'units', 'generated');
const OVERRIDES_DIR = path.join(process.cwd(), 'data', 'overrides');

const FACTION_MAP = {
  AC: { key: 'custodes', label: 'Adeptus Custodes' },
  SM: { key: 'ultramarines', label: 'Space Marines' },
  CSM: { key: 'chaosMarines', label: 'Chaos Space Marines' },
  NEC: { key: 'necrons', label: 'Necrons' },
  TYR: { key: 'tyranids', label: 'Tyranids' },
};

function readCsv(file) {
  const full = path.join(RAW_DIR, file);
  const text = fs.readFileSync(full, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { header: [], rows: [] };
  // Remove BOM
  lines[0] = lines[0].replace(/^\uFEFF/, '');
  const header = lines[0].split('|');
  const rows = lines.slice(1).map((ln) => ln.split('|'));
  return { header, rows };
}

function indexBy(rows, header, keyName) {
  const idx = header.indexOf(keyName);
  const map = new Map();
  for (const cols of rows) {
    const k = cols[idx];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(cols);
  }
  return map;
}

function parseSave(s) {
  if (!s) return undefined;
  const m = /^(\d+)/.exec(s);
  return m ? parseInt(m[1], 10) : undefined;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFactionFile(fKey, units) {
  ensureDir(OUT_DIR);
  const outPath = path.join(OUT_DIR, `${fKey}.ts`);
  units.sort((a, b) => a.name.localeCompare(b.name));
  const lines = [];
  lines.push(`export type Unit = {`);
  lines.push(`  id: string;`);
  lines.push(`  name: string;`);
  lines.push(`  baseCost: number;`);
  lines.push(`  costTiers: Record<number, number>;`);
  lines.push(`  modelsPerUnit: { min: number; max: number };`);
  lines.push(`  wounds: number;`);
  lines.push(`  toughness: number;`);
  lines.push(`  save: number;`);
  lines.push(`  invulnSave?: number;`);
  lines.push(`};`);
  lines.push('');
  lines.push(`export const UNITS: Unit[] = [`);
  for (const u of units) {
    lines.push('  {');
    lines.push(`    id: ${JSON.stringify(u.id)},`);
    lines.push(`    name: ${JSON.stringify(u.name)},`);
    lines.push(`    baseCost: ${u.baseCost},`);
    lines.push(`    costTiers: ${JSON.stringify(u.costTiers)},`);
    lines.push(`    modelsPerUnit: { min: ${u.modelsPerUnit.min}, max: ${u.modelsPerUnit.max} },`);
    lines.push(`    wounds: ${u.wounds},`);
    lines.push(`    toughness: ${u.toughness},`);
    lines.push(`    save: ${u.save},`);
    if (u.invulnSave != null) lines.push(`    invulnSave: ${u.invulnSave},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  lines.push(`export function getUnitById(id: string): Unit | undefined {`);
  lines.push(`  return UNITS.find(u => u.id === id);`);
  lines.push(`}`);
  lines.push('');
  lines.push(`export function calculateUnitCost(unit: Unit, modelCount: number): number {`);
  lines.push(`  if (unit.costTiers[modelCount] != null) return unit.costTiers[modelCount];`);
  lines.push(`  const sizes = Object.keys(unit.costTiers).map(n => parseInt(n, 10)).sort((a,b)=>a-b);`);
  lines.push(`  const within = sizes.filter(n => n >= unit.modelsPerUnit.min && n <= unit.modelsPerUnit.max);`);
  lines.push(`  if (within.length === 0) return 0;`);
  lines.push(`  let closest = within[0]; let best = Math.abs(modelCount - closest);`);
  lines.push(`  for (const n of within) { const d = Math.abs(modelCount - n); if (d < best) { best = d; closest = n; } }`);
  lines.push(`  return unit.costTiers[closest] ?? 0;`);
  lines.push(`}`);

  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
}

function main() {
  const ds = readCsv('Datasheets.csv');
  const models = readCsv('Datasheets_models.csv');
  const costs = readCsv('Datasheets_models_cost.csv');

  const dsIdx = {
    id: ds.header.indexOf('id'),
    name: ds.header.indexOf('name'),
    faction: ds.header.indexOf('faction_id'),
    legend: ds.header.indexOf('legend'),
  };

  const mIdx = {
    dsid: models.header.indexOf('datasheet_id'),
    line: models.header.indexOf('line'),
    T: models.header.indexOf('T'),
    W: models.header.indexOf('W'),
    Sv: models.header.indexOf('Sv'),
    inv: models.header.indexOf('inv_sv'),
  };

  const cIdx = {
    dsid: costs.header.indexOf('datasheet_id'),
    desc: costs.header.indexOf('description'),
    cost: costs.header.indexOf('cost'),
  };

  const modelByDs = indexBy(models.rows, models.header, 'datasheet_id');
  const costByDs = indexBy(costs.rows, costs.header, 'datasheet_id');

  const unitsByFaction = new Map(Object.keys(FACTION_MAP).map(k => [FACTION_MAP[k].key, []]));

  for (const row of ds.rows) {
    const id = row[dsIdx.id];
    const name = row[dsIdx.name];
    const factionId = row[dsIdx.faction];
    const legend = row[dsIdx.legend] || '';
    const f = FACTION_MAP[factionId];
    if (!f) continue; // skip factions we don't target
    if (/legend/i.test(legend)) continue; // skip legends

    // Build tiers
    const crows = costByDs.get(id) || [];
    const tiers = {};
    for (const cr of crows) {
      const desc = cr[cIdx.desc];
      const m = desc && desc.match(/(\d+)\s+models?/i);
      const count = m ? parseInt(m[1], 10) : (/(^|\b)1\s+model\b/i.test(desc) ? 1 : undefined);
      if (count != null) {
        const costVal = parseInt(cr[cIdx.cost], 10);
        if (!Number.isNaN(costVal)) tiers[count] = costVal;
      }
    }
    if (Object.keys(tiers).length === 0) {
      // If no cost tiers (e.g., missing in file), skip; we only expose units we can price.
      continue;
    }
    const sizes = Object.keys(tiers).map(n => parseInt(n, 10));
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);

    // Stats from first line
    const mrows = modelByDs.get(id) || [];
    let T = 4, W = 1, Sv = 3, inv;
    if (mrows.length) {
      // choose the first row with a numeric W
      const pick = mrows.find(r => /\d/.test(r[mIdx.W])) || mrows[0];
      T = parseInt((pick[mIdx.T] || '').replace(/\D/g, ''), 10) || T;
      W = parseInt((pick[mIdx.W] || '').replace(/\D/g, ''), 10) || W;
      Sv = parseSave(pick[mIdx.Sv]) || Sv;
      const invParsed = parseSave(pick[mIdx.inv]);
      if (invParsed != null) inv = invParsed;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const unit = {
      id: `${slug}-${id}`,
      name,
      baseCost: tiers[min],
      costTiers: tiers,
      modelsPerUnit: { min, max },
      wounds: W,
      toughness: T,
      save: Sv,
    };
    if (inv != null) unit.invulnSave = inv;

    unitsByFaction.get(f.key).push(unit);
  }

  // Emit files
  for (const [fKey, list] of unitsByFaction.entries()) {
    // Apply optional overrides
    try {
      const ovPath = path.join(OVERRIDES_DIR, `${fKey}.json`);
      if (fs.existsSync(ovPath)) {
        const ov = JSON.parse(fs.readFileSync(ovPath, 'utf8'));
        if (ov && Array.isArray(ov.overrides)) {
          for (const o of ov.overrides) {
            const idx = list.findIndex(u => u.name === o.name || u.id === o.id);
            if (idx >= 0) {
              const target = list[idx];
              const merged = { ...target };
              if (o.costTiers) {
                merged.costTiers = { ...merged.costTiers, ...o.costTiers };
                const sizes = Object.keys(merged.costTiers).map(n => parseInt(n, 10));
                if (sizes.length) {
                  const min = Math.min(...sizes);
                  const max = Math.max(...sizes);
                  merged.modelsPerUnit = { min, max };
                  merged.baseCost = merged.costTiers[min];
                }
              }
              if (o.modelsPerUnit) merged.modelsPerUnit = o.modelsPerUnit;
              if (o.baseCost != null) merged.baseCost = o.baseCost;
              if (o.wounds != null) merged.wounds = o.wounds;
              if (o.toughness != null) merged.toughness = o.toughness;
              if (o.save != null) merged.save = o.save;
              if (o.invulnSave != null) merged.invulnSave = o.invulnSave;
              list[idx] = merged;
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Overrides error for ${fKey}:`, e.message);
    }

    writeFactionFile(fKey, list);
  }
  console.log(`Generated faction files at ${OUT_DIR}`);
}

main();

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

function parseMovement(s) {
  if (!s) return undefined;
  const m = /^(\d+)/.exec(s);
  return m ? parseInt(m[1], 10) : undefined;
}

function parseLeadership(s) {
  if (!s) return undefined;
  const m = /^(\d+)/.exec(s);
  return m ? parseInt(m[1], 10) : undefined;
}

function parseOC(s) {
  if (!s) return undefined;
  const num = parseInt(s, 10);
  return Number.isNaN(num) ? undefined : num;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFactionFile(fKey, units) {
  ensureDir(OUT_DIR);
  const outPath = path.join(OUT_DIR, `${fKey}.ts`);
  units.sort((a, b) => a.name.localeCompare(b.name));
  const lines = [];
  lines.push(`export type StatProfile = {`);
  lines.push(`  name: string;`);
  lines.push(`  movement?: number;`);
  lines.push(`  wounds: number;`);
  lines.push(`  toughness: number;`);
  lines.push(`  save: number;`);
  lines.push(`  invulnSave?: number;`);
  lines.push(`  leadership?: number;`);
  lines.push(`  objectiveControl?: number;`);
  lines.push(`};`);
  lines.push('');
  lines.push(`export type Unit = {`);
  lines.push(`  id: string;`);
  lines.push(`  name: string;`);
  lines.push(`  baseCost: number;`);
  lines.push(`  costTiers: Record<number, number>;`);
  lines.push(`  modelsPerUnit: { min: number; max: number };`);
  lines.push(`  statProfiles: StatProfile[];`);
  lines.push(`  keywords?: string[];`);
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
    lines.push(`    statProfiles: ${JSON.stringify(u.statProfiles)},`);
    if (u.keywords && u.keywords.length > 0) lines.push(`    keywords: ${JSON.stringify(u.keywords)},`);
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
  const keywords = readCsv('Datasheets_keywords.csv');

  const dsIdx = {
    id: ds.header.indexOf('id'),
    name: ds.header.indexOf('name'),
    faction: ds.header.indexOf('faction_id'),
    legend: ds.header.indexOf('legend'),
  };

  const mIdx = {
    dsid: models.header.indexOf('datasheet_id'),
    line: models.header.indexOf('line'),
    name: models.header.indexOf('name'),
    M: models.header.indexOf('M'),
    T: models.header.indexOf('T'),
    W: models.header.indexOf('W'),
    Sv: models.header.indexOf('Sv'),
    inv: models.header.indexOf('inv_sv'),
    Ld: models.header.indexOf('Ld'),
    OC: models.header.indexOf('OC'),
  };

  const cIdx = {
    dsid: costs.header.indexOf('datasheet_id'),
    desc: costs.header.indexOf('description'),
    cost: costs.header.indexOf('cost'),
  };

  const kIdx = {
    dsid: keywords.header.indexOf('datasheet_id'),
    keyword: keywords.header.indexOf('keyword'),
    isFaction: keywords.header.indexOf('is_faction_keyword'),
  };

  const modelByDs = indexBy(models.rows, models.header, 'datasheet_id');
  const costByDs = indexBy(costs.rows, costs.header, 'datasheet_id');
  const keywordByDs = indexBy(keywords.rows, keywords.header, 'datasheet_id');

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

    // Stats from all model rows
    const mrows = modelByDs.get(id) || [];
    const statProfiles = [];
    for (const row of mrows) {
      const M = parseMovement(row[mIdx.M]);
      const T = parseInt((row[mIdx.T] || '').replace(/\D/g, ''), 10) || 4;
      const W = parseInt((row[mIdx.W] || '').replace(/\D/g, ''), 10) || 1;
      const Sv = parseSave(row[mIdx.Sv]) || 3;
      const invParsed = parseSave(row[mIdx.inv]);
      const Ld = parseLeadership(row[mIdx.Ld]);
      const OC = parseOC(row[mIdx.OC]);
      
      const profile = {
        name: row[mIdx.name] || 'Model',
        wounds: W,
        toughness: T,
        save: Sv,
      };
      if (M != null) profile.movement = M;
      if (invParsed != null) profile.invulnSave = invParsed;
      if (Ld != null) profile.leadership = Ld;
      if (OC != null) profile.objectiveControl = OC;
      
      statProfiles.push(profile);
    }
    
    // If no profiles found, create a default one
    if (statProfiles.length === 0) {
      statProfiles.push({
        name: 'Model',
        wounds: 1,
        toughness: 4,
        save: 3,
      });
    }

    // Extract keywords
    const krows = keywordByDs.get(id) || [];
    const keywordList = [];
    for (const kr of krows) {
      const keyword = kr[kIdx.keyword];
      const isFaction = kr[kIdx.isFaction] === 'true';
      if (keyword && !isFaction) { // Only include non-faction keywords
        keywordList.push(keyword);
      }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const unit = {
      id: `${slug}-${id}`,
      name,
      baseCost: tiers[min],
      costTiers: tiers,
      modelsPerUnit: { min, max },
      statProfiles: statProfiles,
    };
    if (keywordList.length > 0) unit.keywords = keywordList;

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
              if (o.movement != null) merged.movement = o.movement;
              if (o.wounds != null) merged.wounds = o.wounds;
              if (o.toughness != null) merged.toughness = o.toughness;
              if (o.save != null) merged.save = o.save;
              if (o.invulnSave != null) merged.invulnSave = o.invulnSave;
              if (o.leadership != null) merged.leadership = o.leadership;
              if (o.objectiveControl != null) merged.objectiveControl = o.objectiveControl;
              if (o.keywords) merged.keywords = o.keywords;
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

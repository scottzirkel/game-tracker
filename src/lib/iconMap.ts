import type { Faction } from './factions';

// Expected filenames to be placed under `public/icons/`
// You can replace filenames if you prefer different assets.
const ICON_FILES: Record<Faction, string> = {
  Ultramarines: 'ultramarines.svg',
  'Adeptus Custodes': 'adeptus-custodes.svg',
  'Chaos Marines': 'chaos-marines.svg',
  Necrons: 'necrons.svg',
  Tyranids: 'tyranids.svg',
};

export function iconPathForFaction(f: Faction) {
  return `/icons/${ICON_FILES[f]}`;
}


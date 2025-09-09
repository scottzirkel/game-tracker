import type { Faction } from './factions';

export type Detachment = {
  name: string;
  enhancements: string[]; // names only; rules text intentionally omitted
};

// Per-faction enhancement name pools (sourced from BSData catalogs, Sept 2025)
const ENHANCEMENTS_BY_FACTION: Record<Faction, string[]> = {
  Ultramarines: [
    // Space Marines detachment enhancements (union of codex + chapter supplements)
    'Adept of the Codex',
    'Artificer Armour',
    'Beacon Angelis',
    'Fire Discipline',
    'Gift of Foresight',
    'Icon of the Angel',
    'Osseus Key',
    'Rage-Fuelled Warrior',
    'Speed of the Primarch',
    'The Honour Vehement',
    'Thief of Secrets',
  ],
  'Adeptus Custodes': [
    'Aegis Projector',
    "Castellan's Mark",
    'Champion of the Imperium',
    'From the Hall of Armouries',
    'Gift of Terran Artifice',
    'Panoptispex',
    'Radiant Mantle',
    'Raptor Blade',
  ],
  'Chaos Marines': [
    'Eager for Vengeance',
    'Eye of Abaddon',
    'Eye of Tzeentch',
    'Intoxicating Elixir',
    'Orbs of Unlife',
    'Talisman of Burning Blood',
    "Warmaster's Gift",
  ],
  Necrons: [
    'Dimensional Overseer',
    'Dimensional Sanctum',
    'Eldritch Nightmare',
    'Eternal Madness',
    'Ingrained Superiority',
    'Nether-realm Casket',
    'Phasal Subjugator',
    'Soulless Reaper',
    'Veil of Darkness',
  ],
  Tyranids: [
    'Adaptive Biology',
    'Alien Cunning',
    'Biophagic Flow (Aura)',
    'Instinctive Defense',
    'Parasitic Biomorphology',
    'Perfectly Adapted',
    'Regenerating Monstrosity',
    'Synaptic Linchpin',
  ],
};

// Detachment lists with enhancement pools attached (enhancements are per faction; specific detachment mapping varies by codex).
export const DETACHMENTS: Record<Faction, Detachment[]> = {
  Ultramarines: [
    { name: 'Gladius Task Force', enhancements: ['Artificer Armour', 'The Honour Vehement', 'Adept of the Codex', 'Fire Discipline'] },
    { name: 'Black Spear Task Force', enhancements: ['Thief of Secrets', 'Beacon Angelis', 'Osseus Key', 'The Tome of Ectoclades'] },
    { name: 'Unforgiven Task Force', enhancements: ['Shroud of Heroes', 'Stubborn Tenacity', 'Weapons of the First Legion', 'Pennant of Remembrance'] },
    { name: 'Stormlance Task Force', enhancements: ['Feinting Withdrawal', 'Fury of the Storm', 'Portents of Wisdom', "Hunter's Instincts"] },
    { name: '1st Company Task Force', enhancements: ['Fear Made Manifest [Aura]', 'Iron Resolve', 'Rites of War', "The Imperium's Sword"] },
    { name: 'Inner Circle Task Force', enhancements: ['Eye of the Unseen', 'Champion of the Deathwing', 'Singular Will', 'Deathwing Assault'] },
    { name: 'Liberator Assault Group', enhancements: ['Icon of the Angel', 'Speed of the Primarch', 'Rage-Fuelled Warrior', 'Gift of Foresight'] },
    { name: 'Anvil Siege Force', enhancements: ['Architect of War', 'Fleet Commander', 'Indomitable Fury', 'Stoic Defender'] },
    { name: 'Ironstorm Spearhead', enhancements: ['Adept of the Omnissiah', 'Master of the Machine War', 'Target Augury Web', 'The Flesh is Weak'] },
    { name: 'Firestorm Assault Force', enhancements: ['Adamantine Mantle', 'Champion of Humanity', 'Forged in Battle', 'War-tempered Artifice'] },
    { name: 'Vanguard Spearhead', enhancements: ['Execute and Redeploy', 'Ghostweave Cloak', 'Shadow War Veteran', 'The Blade Driven Deep'] },
    { name: 'Company of Hunters', enhancements: ['Master-crafted Weapon', 'Mounted Strategist', 'Master of Manoeuvre', 'Recon Hunter'] },
    { name: 'The Lost Brethren', enhancements: ['Blood Shard', "Sanguinius' Grace", 'To Slay the Warmaster', 'Vengeful Onslaught'] },
    { name: 'The Angelic Host', enhancements: ["Archangel's Shard", 'Artisan of War', 'Gleaming Pinions', 'Visage of Death'] },
    { name: "Lion's Blade Task Force", enhancements: ENHANCEMENTS_BY_FACTION.Ultramarines }, // fallback if missing in catalog
  ],
  'Adeptus Custodes': [
    { name: 'Auric Champions', enhancements: ENHANCEMENTS_BY_FACTION['Adeptus Custodes'] },
    { name: 'Lions of the Emperor', enhancements: ENHANCEMENTS_BY_FACTION['Adeptus Custodes'] },
    { name: 'Null Maiden Vigil', enhancements: ENHANCEMENTS_BY_FACTION['Adeptus Custodes'] },
    { name: 'Shield Host', enhancements: ENHANCEMENTS_BY_FACTION['Adeptus Custodes'] },
    { name: 'Solar Spearhead', enhancements: ENHANCEMENTS_BY_FACTION['Adeptus Custodes'] },
    { name: 'Talons of the Emperor', enhancements: ENHANCEMENTS_BY_FACTION['Adeptus Custodes'] },
  ],
  'Chaos Marines': [
    { name: 'Pactbound Zealots', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Veterans of the Long War', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Deceptors', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Renegade Raiders', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Dread Talons', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Fellhammer Siege-host', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Chaos Cult', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Soulforged Warpack', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Creations of Bile', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
    { name: 'Cabal of Chaos', enhancements: ENHANCEMENTS_BY_FACTION['Chaos Marines'] },
  ],
  Necrons: [
    { name: 'Awakened Dynasty', enhancements: ENHANCEMENTS_BY_FACTION.Necrons },
    { name: 'Annihilation Legion', enhancements: ENHANCEMENTS_BY_FACTION.Necrons },
    { name: 'Canoptek Court', enhancements: ENHANCEMENTS_BY_FACTION.Necrons },
    { name: 'Hypercrypt Legion', enhancements: ENHANCEMENTS_BY_FACTION.Necrons },
    { name: 'Obeisance Phalanx', enhancements: ENHANCEMENTS_BY_FACTION.Necrons },
  ],
  Tyranids: [
    { name: 'Invasion Fleet', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Crusher Stampede', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Assimilation Swarm', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Synaptic Nexus', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Unending Swarm', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Vanguard Onslaught', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Warrior Bioform Onslaught', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
    { name: 'Subterranean Assault', enhancements: ENHANCEMENTS_BY_FACTION.Tyranids },
  ],
};

export type { Detachment as DetachmentInfo };

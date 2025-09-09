export type Faction =
  | 'Ultramarines'
  | 'Adeptus Custodes'
  | 'Chaos Marines'
  | 'Necrons'
  | 'Tyranids';

export const FACTIONS: Faction[] = [
  'Ultramarines',
  'Adeptus Custodes',
  'Chaos Marines',
  'Necrons',
  'Tyranids',
];

export type Theme = {
  plateFrom: string;
  plateTo: string;
  plateBorder: string;
  primaryFrom: string;
  primaryTo: string;
  primaryBorder: string;
  // Text colors intended for use over the primary gradient background
  primaryText: string; // e.g., 'text-white' or 'text-amber-950'
  primaryMutedText: string; // e.g., 'text-gray-200' or 'text-amber-950/70'
  secondaryFrom: string;
  secondaryTo: string;
  secondaryBorder: string;
  accentHazard: string; // tailwind utility for opacity, we keep stripe color constant
};

export const THEMES: Record<Faction, Theme> = {
  Ultramarines: {
    plateFrom: 'from-blue-900/70',
    plateTo: 'to-blue-700/40',
    plateBorder: 'border-blue-300/30',
    primaryFrom: 'from-blue-900',
    primaryTo: 'to-blue-700',
    primaryBorder: 'border-blue-400/50',
    primaryText: 'text-white',
    primaryMutedText: 'text-gray-200',
    secondaryFrom: 'from-slate-800',
    secondaryTo: 'to-slate-900',
    secondaryBorder: 'border-slate-400/40',
    accentHazard: 'opacity-70',
  },
  'Adeptus Custodes': {
    plateFrom: 'from-yellow-700/60',
    plateTo: 'to-amber-400/30',
    plateBorder: 'border-amber-200/60',
    primaryFrom: 'from-yellow-700',
    primaryTo: 'to-amber-500',
    primaryBorder: 'border-amber-300/70',
    primaryText: 'text-amber-950',
    primaryMutedText: 'text-amber-950/70',
    secondaryFrom: 'from-zinc-800',
    secondaryTo: 'to-zinc-900',
    secondaryBorder: 'border-zinc-400/40',
    accentHazard: 'opacity-80',
  },
  'Chaos Marines': {
    plateFrom: 'from-red-900/70',
    plateTo: 'to-red-700/40',
    plateBorder: 'border-red-300/30',
    primaryFrom: 'from-red-900',
    primaryTo: 'to-red-700',
    primaryBorder: 'border-red-400/60',
    primaryText: 'text-white',
    primaryMutedText: 'text-gray-200',
    secondaryFrom: 'from-neutral-800',
    secondaryTo: 'to-neutral-900',
    secondaryBorder: 'border-neutral-400/40',
    accentHazard: 'opacity-80',
  },
  Necrons: {
    plateFrom: 'from-emerald-900/70',
    plateTo: 'to-emerald-700/40',
    plateBorder: 'border-emerald-300/30',
    primaryFrom: 'from-emerald-900',
    primaryTo: 'to-emerald-700',
    primaryBorder: 'border-emerald-400/60',
    primaryText: 'text-white',
    primaryMutedText: 'text-gray-200',
    secondaryFrom: 'from-stone-800',
    secondaryTo: 'to-stone-900',
    secondaryBorder: 'border-stone-400/40',
    accentHazard: 'opacity-70',
  },
  Tyranids: {
    plateFrom: 'from-purple-900/70',
    plateTo: 'to-fuchsia-700/40',
    plateBorder: 'border-fuchsia-300/30',
    primaryFrom: 'from-purple-900',
    primaryTo: 'to-fuchsia-700',
    primaryBorder: 'border-fuchsia-400/60',
    primaryText: 'text-white',
    primaryMutedText: 'text-gray-200',
    secondaryFrom: 'from-slate-800',
    secondaryTo: 'to-slate-900',
    secondaryBorder: 'border-slate-400/40',
    accentHazard: 'opacity-70',
  },
};

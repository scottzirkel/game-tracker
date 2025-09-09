// Centralized exports for unit data by faction.
// Usage example:
//   import { custodes, ultramarines } from '@/lib/units';
//   const shieldCaptain = custodes.getUnitById('shield-captain');

// Prefer generated data (from CSVs in data/raw) over hand-authored stubs
export * as custodes from './generated/custodes';
export * as ultramarines from './generated/ultramarines';
export * as chaosMarines from './generated/chaosMarines';
export * as necrons from './generated/necrons';
export * as tyranids from './generated/tyranids';

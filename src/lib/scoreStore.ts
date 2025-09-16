import type { Faction } from '../lib/factions';

export type PlayerState = {
  name?: 'Tim' | 'Scott' | 'Randy' | 'Anthony';
  faction?: Faction;
  detachment?: string;
  enhancement?: string;
  currentSecondary?: string;
  secondaryPlan?: 'Fixed' | 'Tactical';
  fixedSecondaries?: string[]; // if Fixed, choose two
  primary: number;
  victoryPoints: number;
  secondary: number;
  commandPoints: number;
};

export type ScoreState = {
  battleRound: number;
  phase: 'Command' | 'Movement' | 'Shooting' | 'Charge' | 'Fight';
  gameActive: boolean;
  left: PlayerState;
  right: PlayerState;
};

const isDevEnv = process.env.NODE_ENV !== 'production';

const createPlayerState = (defaults: Partial<PlayerState> = {}): PlayerState => {
  const base = {
    name: undefined,
    faction: undefined,
    detachment: '',
    enhancement: '',
    currentSecondary: '',
    secondaryPlan: 'Tactical',
    fixedSecondaries: [],
    primary: 0,
    secondary: 0,
    commandPoints: 0,
    ...defaults,
  } satisfies Partial<PlayerState>;

  return {
    ...base,
    victoryPoints: Math.max(0, (base.primary ?? 0) + (base.secondary ?? 0)),
  } as PlayerState;
};

export const createDefaultScoreState = (): ScoreState => ({
  battleRound: 1,
  phase: 'Command',
  gameActive: false,
  left: createPlayerState(
    isDevEnv
      ? { name: 'Scott', faction: 'Adeptus Custodes' }
      : {},
  ),
  right: createPlayerState(
    isDevEnv
      ? { name: 'Tim', faction: 'Ultramarines' }
      : {},
  ),
});

type Listener = (state: ScoreState) => void;

class Store {
  private state: ScoreState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = createDefaultScoreState();
  }

  getState() {
    return this.state;
  }

  setState(partial: Partial<ScoreState>) {
    // Shallow-merge, then compute victory = primary + secondary
    const mergedLeft = { ...this.state.left, ...(partial.left || {}) } as PlayerState;
    const mergedRight = { ...this.state.right, ...(partial.right || {}) } as PlayerState;
    mergedLeft.victoryPoints = Math.max(0, (mergedLeft.primary || 0) + (mergedLeft.secondary || 0));
    mergedRight.victoryPoints = Math.max(0, (mergedRight.primary || 0) + (mergedRight.secondary || 0));

    const next: ScoreState = {
      ...this.state,
      ...partial,
      left: mergedLeft,
      right: mergedRight,
    };
    this.state = next;
    this.emit();
    return this.state;
  }

  reset() {
    this.state = createDefaultScoreState();
    this.emit();
    return this.state;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this.state);
  }
}

// Singleton instance via module scope
export const scoreStore = new Store();

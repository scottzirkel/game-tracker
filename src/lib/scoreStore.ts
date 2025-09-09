import { FACTIONS, Faction } from '../lib/factions';

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
  phase: 'Command' | 'Moving' | 'Shooting' | 'Rush' | 'Fight';
  gameActive: boolean;
  left: PlayerState;
  right: PlayerState;
};

type Listener = (state: ScoreState) => void;

class Store {
  private state: ScoreState;
  private listeners = new Set<Listener>();

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    this.state = {
      battleRound: 1,
      phase: 'Command',
      gameActive: isDev ? true : false,
      left: isDev
        ? {
            name: 'Scott',
            faction: 'Adeptus Custodes',
            detachment: '',
            enhancement: '',
            currentSecondary: '',
            secondaryPlan: 'Tactical',
            fixedSecondaries: [],
            primary: 0,
            victoryPoints: 0,
            secondary: 0,
            commandPoints: 0,
          }
        : {
            name: undefined,
            faction: undefined,
            detachment: '',
            enhancement: '',
            currentSecondary: '',
            secondaryPlan: 'Tactical',
            fixedSecondaries: [],
            primary: 0,
            victoryPoints: 0,
            secondary: 0,
            commandPoints: 0,
          },
      right: isDev
        ? {
            name: 'Tim',
            faction: 'Ultramarines',
            detachment: '',
            enhancement: '',
            currentSecondary: '',
            secondaryPlan: 'Tactical',
            fixedSecondaries: [],
            primary: 0,
            victoryPoints: 0,
            secondary: 0,
            commandPoints: 0,
          }
        : {
            name: undefined,
            faction: undefined,
            detachment: '',
            enhancement: '',
            currentSecondary: '',
            secondaryPlan: 'Tactical',
            fixedSecondaries: [],
            primary: 0,
            victoryPoints: 0,
            secondary: 0,
            commandPoints: 0,
          },
    };
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

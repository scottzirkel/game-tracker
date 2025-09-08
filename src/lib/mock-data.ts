/**
 * Mock data for development and testing
 * Includes sample battles, armies, tournaments, and users
 */

import {
  User,
  Army,
  Battle,
  Tournament,
  Faction,
  BattleStatus,
  BattleType,
  TournamentStatus,
  TournamentFormat,
  PlayerScores,
  DEFAULT_TOURNAMENT_RULES
} from '../types/api';

// Sample Users
export const mockUsers: User[] = [
  {
    id: 'usr_player1',
    username: 'captain_valoris',
    email: 'valoris@custodes.imperium',
    display_name: 'Captain Valoris',
    role: 'player',
    profile_image_url: 'https://cdn.example.com/avatars/valoris.jpg',
    tournament_wins: 3,
    total_battles: 15,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z'
  },
  {
    id: 'usr_player2',
    username: 'dark_angel_azrael',
    email: 'azrael@darkangels.astartes',
    display_name: 'Supreme Grand Master Azrael',
    role: 'player',
    profile_image_url: 'https://cdn.example.com/avatars/azrael.jpg',
    tournament_wins: 7,
    total_battles: 28,
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2025-01-15T10:30:00Z'
  },
  {
    id: 'usr_organizer1',
    username: 'tournament_master',
    email: 'organizer@warhammer-events.com',
    display_name: 'Tournament Master',
    role: 'organizer',
    tournament_wins: 0,
    total_battles: 0,
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2025-01-15T10:30:00Z'
  }
];

// Sample Factions
export const mockFactions: Faction[] = [
  {
    id: 'fac_custodes',
    name: 'Adeptus Custodes',
    lore: 'The Emperor\'s elite guardians, genetically enhanced beyond even Space Marines.',
    color_scheme: {
      primary: '#DAA520', // Gold
      secondary: '#8B0000', // Dark Red
      accent: '#000000'    // Black
    },
    available_detachments: [
      'Lions of the Emperor',
      'Custodian Warhost',
      'Talons of the Emperor'
    ]
  },
  {
    id: 'fac_dark_angels',
    name: 'Dark Angels',
    lore: 'First Legion of the Space Marines, keepers of dark secrets from the Horus Heresy.',
    color_scheme: {
      primary: '#013220', // Dark Green
      secondary: '#FFFDD0', // Cream
      accent: '#8B0000'     // Dark Red
    },
    available_detachments: [
      'Wrath of the Rock',
      'Inner Circle Task Force',
      'Deathwing Assault Force'
    ]
  },
  {
    id: 'fac_necrons',
    name: 'Necrons',
    lore: 'Ancient robotic warriors awakening from millions of years of slumber.',
    color_scheme: {
      primary: '#2F4F2F', // Dark Slate Gray
      secondary: '#00FF00', // Lime Green
      accent: '#C0C0C0'     // Silver
    },
    available_detachments: [
      'Awakened Dynasty',
      'Hypercrypt Legion',
      'Canoptek Court'
    ]
  }
];

// Sample Armies
export const mockArmies: Army[] = [
  {
    id: 'army_custodes_01',
    name: 'ADEPTUS CUSTODES',
    faction_id: 'fac_custodes',
    detachment: 'LIONS OF THE EMPEROR',
    owner_id: 'usr_player1',
    points_value: 2000,
    army_list: {
      units: [
        {
          name: 'Captain-General Trajann Valoris',
          points: 160,
          keywords: ['CHARACTER', 'INFANTRY', 'CUSTODES', 'CAPTAIN-GENERAL'],
          abilities: ['Leader', 'Invulnerable Save 4+', 'Moment Shackle']
        },
        {
          name: 'Custodian Guard Squad',
          points: 150,
          keywords: ['INFANTRY', 'CUSTODES', 'CUSTODIAN GUARD'],
          abilities: ['Guardian Spears', 'Sworn Guardians']
        },
        {
          name: 'Allarus Custodians',
          points: 180,
          keywords: ['INFANTRY', 'TERMINATOR', 'CUSTODES', 'ALLARUS'],
          abilities: ['Deep Strike', 'Castellan Axe']
        },
        {
          name: 'Vertus Praetors',
          points: 240,
          keywords: ['MOUNTED', 'CUSTODES', 'VERTUS PRAETORS'],
          abilities: ['Turbo-boost', 'Salvo Launcher']
        }
      ]
    },
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2025-01-10T15:30:00Z'
  },
  {
    id: 'army_dark_angels_01',
    name: 'DARK ANGELS',
    faction_id: 'fac_dark_angels',
    detachment: 'WRATH OF THE ROCK',
    owner_id: 'usr_player2',
    points_value: 2000,
    army_list: {
      units: [
        {
          name: 'Azrael',
          points: 140,
          keywords: ['CHARACTER', 'INFANTRY', 'CHAPTER MASTER', 'AZRAEL'],
          abilities: ['Leader', 'Lion Helm', 'Sword of Secrets']
        },
        {
          name: 'Intercessor Squad',
          points: 95,
          keywords: ['INFANTRY', 'ADEPTUS ASTARTES', 'INTERCESSORS'],
          abilities: ['Bolt Rifles', 'Combat Squads']
        },
        {
          name: 'Deathwing Terminators',
          points: 205,
          keywords: ['INFANTRY', 'TERMINATOR', 'DEATHWING'],
          abilities: ['Deep Strike', 'Storm Bolter', 'Power Fist']
        },
        {
          name: 'Ravenwing Black Knights',
          points: 150,
          keywords: ['MOUNTED', 'RAVENWING', 'BLACK KNIGHTS'],
          abilities: ['Turbo-boost', 'Plasma Talons']
        }
      ]
    },
    created_at: '2024-11-15T14:20:00Z',
    updated_at: '2025-01-08T11:45:00Z'
  }
];

// Sample Battle (matches the UI state)
export const mockBattle: Battle = {
  id: 'btl_current_battle',
  tournament_id: 'trn_winter_championship',
  status: 'in_progress' as BattleStatus,
  battle_type: 'matched_play' as BattleType,
  mission: {
    name: 'Sweep and Clear',
    primary_objectives: ['Control Objectives'],
    secondary_objectives: ['Bring It Down', 'Assassinate'],
    deployment: 'Dawn of War'
  },
  current_round: 1,
  max_rounds: 5,
  turn_time_limit: 1800, // 30 minutes
  current_turn: {
    player_id: 'usr_player1',
    phase: 'movement',
    start_time: '2025-01-15T14:30:00Z',
    time_remaining: 1650
  },
  players: [
    {
      user_id: 'usr_player1',
      army_id: 'army_custodes_01',
      position: 'left',
      scores: {
        victory_points: 3,
        primary: 3,
        secondary: 0,
        linchpin: 0,
        challenge: 0
      } as PlayerScores,
      command_points: 1,
      stratagems_used: ['Rapid Fire']
    },
    {
      user_id: 'usr_player2',
      army_id: 'army_dark_angels_01',
      position: 'right',
      scores: {
        victory_points: 4,
        primary: 4,
        secondary: 0,
        linchpin: 0,
        challenge: 0
      } as PlayerScores,
      command_points: 2,
      stratagems_used: ['Fury of the Lion']
    }
  ],
  created_at: '2025-01-15T14:00:00Z',
  updated_at: '2025-01-15T14:35:00Z'
};

// Sample Tournaments
export const mockTournaments: Tournament[] = [
  {
    id: 'trn_winter_championship',
    name: 'Winter 40K Championship',
    organizer_id: 'usr_organizer1',
    status: 'active' as TournamentStatus,
    format: 'swiss' as TournamentFormat,
    max_participants: 32,
    current_participants: 24,
    entry_fee: 25.00,
    prize_pool: 800.00,
    start_date: '2025-02-01T09:00:00Z',
    end_date: '2025-02-01T18:00:00Z',
    rounds: [
      {
        round_number: 1,
        pairings: [
          {
            battle_id: 'btl_current_battle',
            player1_id: 'usr_player1',
            player2_id: 'usr_player2',
            table_number: 1
          },
          {
            battle_id: 'btl_round1_2',
            player1_id: 'usr_player3',
            player2_id: 'usr_player4',
            table_number: 2
          }
        ]
      }
    ],
    rules: {
      points_limit: 2000,
      time_limit: 1800,
      allowed_factions: ['all'],
      special_rules: ['No Fortifications', 'Comp Scoring']
    },
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-15T10:30:00Z'
  },
  {
    id: 'trn_spring_open',
    name: 'Spring Open Tournament',
    organizer_id: 'usr_organizer1',
    status: 'registration' as TournamentStatus,
    format: 'single_elimination' as TournamentFormat,
    max_participants: 16,
    current_participants: 8,
    entry_fee: 15.00,
    prize_pool: 240.00,
    start_date: '2025-03-15T09:00:00Z',
    end_date: '2025-03-15T17:00:00Z',
    rounds: [],
    rules: DEFAULT_TOURNAMENT_RULES,
    created_at: '2025-01-10T12:00:00Z',
    updated_at: '2025-01-15T10:30:00Z'
  }
];

// Mock Battle Progression Data
export const mockBattleProgression = {
  rounds: [
    {
      round: 1,
      player1_scores: { victory_points: 3, secondary: 0, linchpin: 0, challenge: 0 },
      player2_scores: { victory_points: 4, secondary: 0, linchpin: 0, challenge: 0 },
      duration: 1800, // 30 minutes
      events: [
        { time: '14:00', event: 'Battle started', player: null },
        { time: '14:15', event: 'First blood', player: 'usr_player2' },
        { time: '14:30', event: 'Objective secured', player: 'usr_player1' }
      ]
    }
  ],
  statistics: {
    total_stratagems_used: 3,
    total_command_points_spent: 4,
    longest_turn: 450, // 7.5 minutes
    shortest_turn: 180, // 3 minutes
    average_turn_time: 315 // 5.25 minutes
  }
};

// Sample WebSocket Messages
export const mockWebSocketMessages = {
  scoreUpdate: {
    type: 'score_update' as const,
    battle_id: 'btl_current_battle',
    player_id: 'usr_player1',
    scores: {
      victory_points: 6,
      primary: 6,
      secondary: 2,
      linchpin: 0,
      challenge: 1
    },
    timestamp: '2025-01-15T15:30:00Z'
  },
  roundAdvance: {
    type: 'round_advance' as const,
    battle_id: 'btl_current_battle',
    current_round: 2,
    timestamp: '2025-01-15T15:00:00Z'
  },
  timerUpdate: {
    type: 'timer_update' as const,
    battle_id: 'btl_current_battle',
    current_turn: {
      player_id: 'usr_player2',
      phase: 'shooting',
      start_time: '2025-01-15T15:30:00Z',
      time_remaining: 1200
    },
    timestamp: '2025-01-15T15:30:00Z'
  }
};

// Helper functions for generating mock data
export const MockDataHelpers = {
  /**
   * Generate a random battle ID
   */
  generateBattleId(): string {
    return `btl_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a random army ID
   */
  generateArmyId(): string {
    return `army_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a random user ID
   */
  generateUserId(): string {
    return `usr_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create a mock battle with random data
   */
  createRandomBattle(overrides: Partial<Battle> = {}): Battle {
    return {
      ...mockBattle,
      id: this.generateBattleId(),
      current_round: Math.floor(Math.random() * 5) + 1,
      status: ['setup', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as BattleStatus,
      ...overrides
    };
  },

  /**
   * Create mock player scores
   */
  createRandomScores(): PlayerScores {
    return {
      victory_points: Math.floor(Math.random() * 20),
      primary: Math.floor(Math.random() * 15),
      secondary: Math.floor(Math.random() * 10),
      linchpin: Math.floor(Math.random() * 5),
      challenge: Math.floor(Math.random() * 3)
    };
  },

  /**
   * Update battle scores to simulate progression
   */
  simulateBattleProgression(battle: Battle, roundsToAdvance: number = 1): Battle {
    const updatedBattle = { ...battle };
    updatedBattle.current_round = Math.min(battle.current_round + roundsToAdvance, battle.max_rounds);
    
    // Randomly increase scores
    updatedBattle.players = battle.players.map(player => ({
      ...player,
      scores: {
        victory_points: player.scores.victory_points + Math.floor(Math.random() * 3),
        primary: player.scores.primary + Math.floor(Math.random() * 2),
        secondary: player.scores.secondary + Math.floor(Math.random() * 2),
        linchpin: player.scores.linchpin + (Math.random() > 0.8 ? 1 : 0),
        challenge: player.scores.challenge + (Math.random() > 0.9 ? 1 : 0)
      },
      command_points: Math.max(0, player.command_points - Math.floor(Math.random() * 2))
    }));

    return updatedBattle;
  }
};

// Export all mock data as a collection
export const mockData = {
  users: mockUsers,
  factions: mockFactions,
  armies: mockArmies,
  battle: mockBattle,
  tournaments: mockTournaments,
  battleProgression: mockBattleProgression,
  websocketMessages: mockWebSocketMessages
};
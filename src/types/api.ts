/**
 * TypeScript interfaces for the Warhammer 40K Battle Tracker API
 * Generated from OpenAPI specification
 */

// Base types
export type BattleStatus = 'setup' | 'in_progress' | 'completed' | 'cancelled';
export type BattleType = 'matched_play' | 'crusade' | 'narrative';
export type TournamentStatus = 'draft' | 'registration' | 'active' | 'completed' | 'cancelled';
export type TournamentFormat = 'swiss' | 'single_elimination' | 'double_elimination';
export type PlayerPosition = 'left' | 'right';
export type BattlePhase = 'command' | 'movement' | 'psychic' | 'shooting' | 'charge' | 'fight' | 'morale';
export type UserRole = 'player' | 'organizer' | 'admin';

// User Management
export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: UserRole;
  profile_image_url?: string;
  tournament_wins: number;
  total_battles: number;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: User;
}

// Army Management
export interface Unit {
  name: string;
  points: number;
  keywords: string[];
  abilities: string[];
}

export interface ArmyList {
  units: Unit[];
}

export interface Army {
  id: string;
  name: string;
  faction_id: string;
  detachment: string;
  owner_id: string;
  points_value: number;
  army_list: ArmyList;
  created_at: string;
  updated_at: string;
}

export interface CreateArmyRequest {
  name: string;
  faction_id: string;
  detachment: string;
  points_value: number;
  army_list: ArmyList;
}

export interface UpdateArmyRequest {
  name?: string;
  detachment?: string;
  points_value?: number;
  army_list?: ArmyList;
}

// Battle Management
export interface Mission {
  name: string;
  primary_objectives: string[];
  secondary_objectives: string[];
  deployment: string;
}

export interface PlayerScores {
  victory_points: number;
  primary: number;
  secondary: number;
  linchpin: number;
  challenge: number;
}

export interface CurrentTurn {
  player_id: string;
  phase: BattlePhase;
  start_time: string;
  time_remaining: number;
}

export interface BattlePlayer {
  user_id: string;
  army_id: string;
  position: PlayerPosition;
  scores: PlayerScores;
  command_points: number;
  stratagems_used: string[];
}

export interface Battle {
  id: string;
  tournament_id?: string;
  status: BattleStatus;
  battle_type: BattleType;
  mission: Mission;
  current_round: number;
  max_rounds: number;
  turn_time_limit: number;
  current_turn: CurrentTurn;
  players: [BattlePlayer, BattlePlayer];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateBattleRequest {
  tournament_id?: string;
  battle_type: BattleType;
  mission: Mission;
  players: Array<{
    user_id: string;
    army_id: string;
    position: PlayerPosition;
  }>;
  max_rounds?: number;
  turn_time_limit?: number;
}

export interface UpdateBattleRequest {
  action: 'update_scores' | 'advance_phase' | 'use_stratagem';
  player_id: string;
  scores?: PlayerScores;
  phase?: BattlePhase;
  stratagem?: string;
}

export interface CompleteBattleRequest {
  winner_id?: string;
  final_scores?: Record<string, PlayerScores>;
}

// Tournament Management
export interface Pairing {
  battle_id: string;
  player1_id: string;
  player2_id: string;
  table_number: number;
}

export interface TournamentRound {
  round_number: number;
  pairings: Pairing[];
}

export interface TournamentRules {
  points_limit: number;
  time_limit: number;
  allowed_factions: string[];
  special_rules: string[];
}

export interface Tournament {
  id: string;
  name: string;
  organizer_id: string;
  status: TournamentStatus;
  format: TournamentFormat;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  end_date: string;
  rounds: TournamentRound[];
  rules: TournamentRules;
  created_at: string;
  updated_at: string;
}

export interface CreateTournamentRequest {
  name: string;
  format: TournamentFormat;
  max_participants: number;
  entry_fee: number;
  start_date: string;
  end_date: string;
  rules: TournamentRules;
}

export interface RegisterForTournamentRequest {
  army_id: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  error: ApiError;
  timestamp: string;
  request_id: string;
}

export interface Pagination {
  limit: number;
  has_more: boolean;
  next_cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'score_update' | 'round_advance' | 'timer_update' | 'battle_complete' | 'player_disconnected';
  battle_id: string;
  timestamp: string;
}

export interface ScoreUpdateMessage extends WebSocketMessage {
  type: 'score_update';
  player_id: string;
  scores: PlayerScores;
}

export interface RoundAdvanceMessage extends WebSocketMessage {
  type: 'round_advance';
  current_round: number;
}

export interface TimerUpdateMessage extends WebSocketMessage {
  type: 'timer_update';
  current_turn: CurrentTurn;
}

export interface BattleCompleteMessage extends WebSocketMessage {
  type: 'battle_complete';
  winner_id?: string;
  final_scores: Record<string, PlayerScores>;
}

export interface PlayerDisconnectedMessage extends WebSocketMessage {
  type: 'player_disconnected';
  player_id: string;
}

export type WebSocketMessageUnion = 
  | ScoreUpdateMessage 
  | RoundAdvanceMessage 
  | TimerUpdateMessage 
  | BattleCompleteMessage 
  | PlayerDisconnectedMessage;

// API Client Configuration
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStore {
  load: () => Promise<Partial<TokenPair> | null> | Partial<TokenPair> | null;
  save: (tokens: TokenPair) => Promise<void> | void;
  clear: () => Promise<void> | void;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  apiKey?: string;
  tokenStore?: TokenStore;
  onTokensChanged?: (tokens: Partial<TokenPair>) => void;
}

// Query Parameters
export interface ListBattlesParams {
  player_id?: string;
  status?: BattleStatus;
  tournament_id?: string;
  limit?: number;
  cursor?: string;
}

export interface ListArmiesParams {
  owner_id?: string;
  faction_id?: string;
  limit?: number;
  cursor?: string;
}

export interface ListTournamentsParams {
  status?: TournamentStatus;
  organizer_id?: string;
  limit?: number;
  cursor?: string;
}

// Faction Data (can be extended with official 40K faction data)
export interface Faction {
  id: string;
  name: string;
  lore: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  available_detachments: string[];
}

// Common Constants
export const BATTLE_PHASES: BattlePhase[] = [
  'command',
  'movement', 
  'psychic',
  'shooting',
  'charge',
  'fight',
  'morale'
];

export const DEFAULT_TOURNAMENT_RULES: TournamentRules = {
  points_limit: 2000,
  time_limit: 1800, // 30 minutes
  allowed_factions: ['all'],
  special_rules: []
};

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
  
  // Battles
  BATTLES: '/battles',
  BATTLE_DETAIL: (id: string) => `/battles/${id}`,
  ADVANCE_ROUND: (id: string) => `/battles/${id}/advance-round`,
  COMPLETE_BATTLE: (id: string) => `/battles/${id}/complete`,
  
  // Armies
  ARMIES: '/armies',
  ARMY_DETAIL: (id: string) => `/armies/${id}`,
  
  // Tournaments
  TOURNAMENTS: '/tournaments',
  TOURNAMENT_DETAIL: (id: string) => `/tournaments/${id}`,
  TOURNAMENT_REGISTER: (id: string) => `/tournaments/${id}/register`,
  TOURNAMENT_PAIRINGS: (id: string) => `/tournaments/${id}/generate-pairings`,
} as const;

// WebSocket Connection
export interface WebSocketConnection {
  url: string;
  token: string;
  battleId: string;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

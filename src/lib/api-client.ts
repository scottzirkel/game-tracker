/**
 * API Client for Warhammer 40K Battle Tracker
 * Provides type-safe methods for all API interactions
 */

import {
  ApiClientConfig,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Battle,
  CreateBattleRequest,
  UpdateBattleRequest,
  CompleteBattleRequest,
  Army,
  CreateArmyRequest,
  UpdateArmyRequest,
  Tournament,
  CreateTournamentRequest,
  RegisterForTournamentRequest,
  PaginatedResponse,
  ListBattlesParams,
  ListArmiesParams,
  ListTournamentsParams,
  API_ENDPOINTS,
  WebSocketConnection,
  WebSocketMessageUnion,
  ErrorResponse,
  TokenPair
} from '../types/api';

export class WarhammerApiClient {
  private config: ApiClientConfig;
  private accessToken?: string;
  private refreshToken?: string;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseUrl: 'https://api.warhammer-tracker.com/v1',
      timeout: 10000,
      retries: 3,
      ...config,
    };
  }

  // Authentication Methods
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('POST', API_ENDPOINTS.REGISTER, request);
    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('POST', API_ENDPOINTS.LOGIN, request);
    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<AuthResponse>('POST', API_ENDPOINTS.REFRESH, {
      refresh_token: this.refreshToken,
    });

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async logout(): Promise<void> {
    await this.makeRequest('POST', '/auth/logout');
    this.clearTokens();
  }

  // Battle Management Methods
  async createBattle(request: CreateBattleRequest): Promise<Battle> {
    const response = await this.makeRequest<{ battle: Battle }>('POST', API_ENDPOINTS.BATTLES, request);
    return response.battle;
  }

  async getBattle(battleId: string): Promise<Battle> {
    const response = await this.makeRequest<{ battle: Battle }>('GET', API_ENDPOINTS.BATTLE_DETAIL(battleId));
    return response.battle;
  }

  async updateBattle(battleId: string, request: UpdateBattleRequest): Promise<Battle> {
    const response = await this.makeRequest<{ battle: Battle }>('PATCH', API_ENDPOINTS.BATTLE_DETAIL(battleId), request);
    return response.battle;
  }

  async advanceBattleRound(battleId: string): Promise<Battle> {
    const response = await this.makeRequest<{ battle: Battle }>('POST', API_ENDPOINTS.ADVANCE_ROUND(battleId));
    return response.battle;
  }

  async completeBattle(battleId: string, request: CompleteBattleRequest): Promise<Battle> {
    const response = await this.makeRequest<{ battle: Battle }>('POST', API_ENDPOINTS.COMPLETE_BATTLE(battleId), request);
    return response.battle;
  }

  async listBattles(params: ListBattlesParams = {}): Promise<PaginatedResponse<Battle>> {
    const queryString = this.buildQueryString(params);
    return this.makeRequest<PaginatedResponse<Battle>>('GET', `${API_ENDPOINTS.BATTLES}?${queryString}`);
  }

  // Army Management Methods
  async createArmy(request: CreateArmyRequest): Promise<Army> {
    const response = await this.makeRequest<{ army: Army }>('POST', API_ENDPOINTS.ARMIES, request);
    return response.army;
  }

  async getArmy(armyId: string): Promise<Army> {
    const response = await this.makeRequest<{ army: Army }>('GET', API_ENDPOINTS.ARMY_DETAIL(armyId));
    return response.army;
  }

  async updateArmy(armyId: string, request: UpdateArmyRequest): Promise<Army> {
    const response = await this.makeRequest<{ army: Army }>('PUT', API_ENDPOINTS.ARMY_DETAIL(armyId), request);
    return response.army;
  }

  async deleteArmy(armyId: string): Promise<void> {
    await this.makeRequest('DELETE', API_ENDPOINTS.ARMY_DETAIL(armyId));
  }

  async listArmies(params: ListArmiesParams = {}): Promise<PaginatedResponse<Army>> {
    const queryString = this.buildQueryString(params);
    return this.makeRequest<PaginatedResponse<Army>>('GET', `${API_ENDPOINTS.ARMIES}?${queryString}`);
  }

  // Tournament Management Methods
  async createTournament(request: CreateTournamentRequest): Promise<Tournament> {
    const response = await this.makeRequest<{ tournament: Tournament }>('POST', API_ENDPOINTS.TOURNAMENTS, request);
    return response.tournament;
  }

  async getTournament(tournamentId: string): Promise<Tournament> {
    const response = await this.makeRequest<{ tournament: Tournament }>('GET', API_ENDPOINTS.TOURNAMENT_DETAIL(tournamentId));
    return response.tournament;
  }

  async registerForTournament(tournamentId: string, request: RegisterForTournamentRequest): Promise<Tournament> {
    const response = await this.makeRequest<{ tournament: Tournament }>('POST', API_ENDPOINTS.TOURNAMENT_REGISTER(tournamentId), request);
    return response.tournament;
  }

  async listTournaments(params: ListTournamentsParams = {}): Promise<PaginatedResponse<Tournament>> {
    const queryString = this.buildQueryString(params);
    return this.makeRequest<PaginatedResponse<Tournament>>('GET', `${API_ENDPOINTS.TOURNAMENTS}?${queryString}`);
  }

  async generateTournamentPairings(tournamentId: string): Promise<Tournament> {
    const response = await this.makeRequest<{ tournament: Tournament }>('POST', API_ENDPOINTS.TOURNAMENT_PAIRINGS(tournamentId));
    return response.tournament;
  }

  // WebSocket Connection Management
  createWebSocketConnection(battleId: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (!this.accessToken) {
        reject(new Error('Authentication required for WebSocket connection'));
        return;
      }

      const wsUrl = this.config.baseUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');
      
      const url = `${wsUrl}/ws/battles/${battleId}`;
      // Include the bearer token via the Sec-WebSocket-Protocol header to avoid leaking it in URLs.
      // The server must accept and validate the `bearer.<token>` protocol format.
      const protocols = this.accessToken ? [`bearer.${this.accessToken}`] : undefined;
      const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);

      ws.onopen = () => {
        console.log(`Connected to battle ${battleId} WebSocket`);
        resolve(ws);
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessageUnion = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    });
  }

  private handleWebSocketMessage(message: WebSocketMessageUnion): void {
    // This can be overridden by consumers or handled via event system
    console.log('Received WebSocket message:', message);
    
    // Emit custom events for different message types
    const event = new CustomEvent(`ws:${message.type}`, {
      detail: message,
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  // Token Management
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.persistTokens({ accessToken, refreshToken });
  }

  private clearTokens(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.clearPersistedTokens();
  }

  public async loadTokensFromStorage(): Promise<void> {
    const store = this.config.tokenStore;
    if (!store) return;
    try {
      const result = await Promise.resolve(store.load());
      if (!result) return;
      if (result.accessToken) this.accessToken = result.accessToken;
      if (result.refreshToken) this.refreshToken = result.refreshToken;
      this.notifyTokenChange({ accessToken: this.accessToken, refreshToken: this.refreshToken });
    } catch (error) {
      console.warn('Failed to load tokens from configured store', error);
    }
  }

  private persistTokens(tokens: TokenPair): void {
    if (this.config.tokenStore) {
      void this.config.tokenStore.save(tokens);
    }
    this.notifyTokenChange(tokens);
  }

  private clearPersistedTokens(): void {
    if (this.config.tokenStore) {
      void this.config.tokenStore.clear();
    }
    this.notifyTokenChange({ accessToken: undefined, refreshToken: undefined });
  }

  private notifyTokenChange(tokens: Partial<TokenPair>): void {
    this.config.onTokensChanged?.(tokens);
  }

  // HTTP Request Management
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    attempt: number = 0
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestConfig);

      if (response.status === 401 && this.refreshToken && attempt === 0) {
        // Token might be expired, try to refresh
        try {
          await this.refreshAccessToken();
          return this.makeRequest<T>(method, endpoint, data, attempt + 1);
        } catch (refreshError) {
          this.clearTokens();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorResponse: ErrorResponse = await response.json();
        throw new ApiError(errorResponse.error.code, errorResponse.error.message, response.status, errorResponse.error.details);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (attempt < this.config.retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(method, endpoint, data, attempt + 1);
      }

      throw new ApiError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network request failed',
        0
      );
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }

  // Configuration Methods
  public setBaseUrl(url: string): void {
    this.config.baseUrl = url;
  }

  public setTimeout(timeout: number): void {
    this.config.timeout = timeout;
  }

  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// Custom Error Class
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Singleton instance for global use
export const apiClient = new WarhammerApiClient();

// React Hook for API Client (if using React)
export function useApiClient() {
  return apiClient;
}

// Utility functions for common operations
export const ApiUtils = {
  /**
   * Format battle duration for display
   */
  formatBattleDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Format time remaining in a readable format
   */
  formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate total victory points for a player
   */
  calculateTotalVictoryPoints(scores: { victory_points: number; secondary: number; linchpin: number; challenge: number }): number {
    return scores.victory_points + scores.secondary + scores.linchpin + scores.challenge;
  },

  /**
   * Determine battle winner based on scores
   */
  determineBattleWinner(players: Array<{ user_id: string; scores: any }>): string | null {
    if (players.length !== 2) return null;
    
    const [player1, player2] = players;
    const score1 = this.calculateTotalVictoryPoints(player1.scores);
    const score2 = this.calculateTotalVictoryPoints(player2.scores);
    
    if (score1 > score2) return player1.user_id;
    if (score2 > score1) return player2.user_id;
    return null; // Tie
  },

  /**
   * Validate army points value
   */
  isValidPointsValue(points: number, limit: number): boolean {
    return points > 0 && points <= limit;
  },
};

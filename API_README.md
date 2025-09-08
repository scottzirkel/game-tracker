# Warhammer 40K Battle Tracker API

A comprehensive REST API for managing Warhammer 40K battles, tournaments, and army lists with real-time tracking capabilities.

## 🚀 Quick Start

### Authentication
```typescript
import { apiClient } from './src/lib/api-client';

// Register a new user
const user = await apiClient.register({
  username: 'captain_valoris',
  email: 'valoris@custodes.imperium',
  password: 'secure_password',
  display_name: 'Captain Valoris'
});

// Login
const auth = await apiClient.login({
  username: 'captain_valoris',
  password: 'secure_password'
});
```

### Battle Management
```typescript
// Create a new battle
const battle = await apiClient.createBattle({
  battle_type: 'matched_play',
  mission: {
    name: 'Sweep and Clear',
    primary_objectives: ['Control Objectives'],
    secondary_objectives: ['Bring It Down'],
    deployment: 'Dawn of War'
  },
  players: [
    {
      user_id: 'usr_player1',
      army_id: 'army_custodes',
      position: 'left'
    },
    {
      user_id: 'usr_player2', 
      army_id: 'army_dark_angels',
      position: 'right'
    }
  ],
  max_rounds: 5,
  turn_time_limit: 1800
});

// Update battle scores
const updatedBattle = await apiClient.updateBattle(battle.id, {
  action: 'update_scores',
  player_id: 'usr_player1',
  scores: {
    victory_points: 6,
    secondary: 3,
    linchpin: 1,
    challenge: 0,
    primary: 6
  }
});

// Advance to next round
const advancedBattle = await apiClient.advanceBattleRound(battle.id);
```

### Real-time Updates
```typescript
// Connect to battle WebSocket
const ws = await apiClient.createWebSocketConnection(battle.id);

// Listen for score updates
window.addEventListener('ws:score_update', (event) => {
  const message = event.detail;
  console.log(`Player ${message.player_id} scored ${message.scores.victory_points} VP`);
});

// Listen for round advances
window.addEventListener('ws:round_advance', (event) => {
  const message = event.detail;
  console.log(`Advanced to round ${message.current_round}`);
});
```

## 📋 API Overview

### Core Entities

#### Battle
The central entity representing a Warhammer 40K game between two players.

**Key Features:**
- Real-time score tracking
- Turn timer management  
- Round progression
- Mission objectives
- Command point tracking
- Stratagem usage logging

**Battle States:**
- `setup`: Initial configuration
- `in_progress`: Active gameplay
- `completed`: Battle finished
- `cancelled`: Battle terminated early

#### Army
Represents a player's army list and configuration.

**Components:**
- Faction and detachment selection
- Unit roster with points values
- Keyword and ability tracking
- Army validation against points limits

#### Tournament
Multi-player competitive events with bracket management.

**Tournament Types:**
- Swiss system (all players play set number of rounds)
- Single elimination (knockout format)
- Double elimination (second chance bracket)

**Features:**
- Registration management
- Automatic pairing generation
- Live standings
- Prize pool tracking

### Authentication & Authorization

The API uses JWT-based authentication with role-based access control:

- **Players**: Can create battles, manage armies, register for tournaments
- **Organizers**: Can create/manage tournaments, generate pairings
- **Admins**: Full system access

### Real-time Features

WebSocket connections provide live updates for:
- Score changes during battles
- Timer countdowns
- Round progression
- Player connection status
- Tournament bracket updates

## 🛠 Technical Architecture

### API Design Principles

1. **RESTful Design**: Clear resource-oriented URLs
2. **Stateless**: Each request contains all necessary information
3. **Idempotent Operations**: Safe to retry requests
4. **Consistent Error Handling**: Standardized error responses
5. **Versioned API**: `/v1` prefix for future compatibility

### Data Models

#### Core Models Structure
```
User
├── armies[]
└── tournaments[] (as participant)

Battle
├── tournament (optional)
├── players[2]
│   ├── user
│   ├── army  
│   ├── scores
│   └── command_points
└── current_turn

Tournament
├── organizer (User)
├── participants[] (Users)
├── rounds[]
│   └── pairings[] (Battles)
└── rules
```

### Performance Optimizations

#### Caching Strategy
- **Battle State**: 30-second Redis cache
- **Tournament Data**: 5-minute cache
- **Army Lists**: 1-hour cache
- **User Profiles**: 15-minute cache

#### Database Indexing
```sql
-- Battle queries
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_tournament ON battles(tournament_id, status);
CREATE INDEX idx_battles_player ON battles USING gin(players);

-- Tournament queries  
CREATE INDEX idx_tournaments_status ON tournaments(status, start_date);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);

-- Army queries
CREATE INDEX idx_armies_owner ON armies(owner_id);
CREATE INDEX idx_armies_faction ON armies(faction_id);
```

#### WebSocket Scaling
- Redis pub/sub for multi-server scaling
- Connection pooling (max 1000 per server)
- Automatic reconnection with exponential backoff
- Message queuing for offline players

### Security Measures

#### Authentication Security
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Secure token rotation on refresh
- Rate limiting: 1000 requests/hour per user

#### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- API key authentication for server-to-server

#### Audit Logging
- All battle state changes
- Tournament modifications
- Authentication events
- Suspicious activity detection

## 📊 API Endpoints Summary

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Battle Management  
- `GET /battles` - List battles with filters
- `POST /battles` - Create new battle
- `GET /battles/{id}` - Get battle details
- `PATCH /battles/{id}` - Update battle state
- `POST /battles/{id}/advance-round` - Advance round
- `POST /battles/{id}/complete` - Complete battle

### Army Management
- `GET /armies` - List armies
- `POST /armies` - Create army
- `GET /armies/{id}` - Get army details
- `PUT /armies/{id}` - Update army
- `DELETE /armies/{id}` - Delete army

### Tournament Management
- `GET /tournaments` - List tournaments
- `POST /tournaments` - Create tournament
- `GET /tournaments/{id}` - Get tournament details
- `POST /tournaments/{id}/register` - Register for tournament
- `POST /tournaments/{id}/generate-pairings` - Generate pairings

### WebSocket
- `WSS /ws/battles/{id}?token={jwt}` - Real-time battle updates

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Redis (for caching)
- PostgreSQL (recommended) or MySQL

### Installation
```bash
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```bash
# API Configuration
API_BASE_URL=https://api.warhammer-tracker.com/v1
API_TIMEOUT=10000

# Database
DATABASE_URL=postgresql://user:pass@localhost/warhammer_tracker

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# WebSocket
WS_PORT=3001
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# API tests with coverage
npm run test:api --coverage
```

### Mock Data
The project includes comprehensive mock data for development:

```typescript
import { mockData } from './src/lib/mock-data';

// Use mock battle data
const battle = mockData.battle;

// Simulate battle progression
const updatedBattle = MockDataHelpers.simulateBattleProgression(battle, 2);
```

## 📈 Rate Limits

- **General API**: 1000 requests/hour per user
- **Battle Updates**: 60 requests/minute per battle
- **WebSocket**: 10 concurrent connections per user
- **Authentication**: 5 login attempts/minute per IP

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "BATTLE_NOT_FOUND",
    "message": "The specified battle could not be found",
    "details": {
      "battle_id": "btl_invalid"
    }
  },
  "timestamp": "2025-01-15T14:45:00Z",
  "request_id": "req_abc123"
}
```

### Common Error Codes
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions  
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (422) - Invalid request data
- `BATTLE_NOT_FOUND` (404) - Battle does not exist
- `TOURNAMENT_FULL` (409) - Tournament at capacity
- `INVALID_BATTLE_STATE` (409) - Invalid state transition

## 📝 Contributing

### API Design Guidelines

1. **Consistent Naming**: Use kebab-case for URLs, camelCase for JSON
2. **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
3. **Status Codes**: Use appropriate HTTP status codes
4. **Versioning**: Include version in URL path (`/v1/`)
5. **Documentation**: Update OpenAPI spec for all changes

### Adding New Endpoints

1. Update OpenAPI specification (`openapi.yaml`)
2. Add TypeScript interfaces (`src/types/api.ts`)
3. Implement in API client (`src/lib/api-client.ts`)  
4. Create mock data (`src/lib/mock-data.ts`)
5. Add tests and documentation

## 📚 Additional Resources

- [OpenAPI Specification](./openapi.yaml) - Complete API documentation
- [TypeScript Types](./src/types/api.ts) - Frontend type definitions
- [API Client](./src/lib/api-client.ts) - JavaScript/TypeScript client
- [Mock Data](./src/lib/mock-data.ts) - Development and testing data
- [Warhammer 40K Rules](https://warhammer40000.com) - Official game rules

## 🤝 Support

For API support and questions:
- Email: api-support@warhammer-tracker.com
- Documentation: https://docs.warhammer-tracker.com
- Issues: https://github.com/warhammer-tracker/api/issues

---

*This API is designed to support competitive Warhammer 40K gaming with real-time battle tracking, comprehensive tournament management, and seamless integration capabilities.*
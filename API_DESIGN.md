# Warhammer 40K Battle Tracker API Design

## Overview

This API design supports a comprehensive Warhammer 40K battle tracking system with real-time capabilities, tournament management, and persistent battle records. The design follows RESTful principles with WebSocket support for real-time updates.

## Base URL
```
https://api.warhammer-tracker.com/v1
```

## Authentication

The API uses JWT-based authentication with refresh tokens.

### Auth Endpoints

```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/profile
```

**Registration Request:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securepassword",
  "display_name": "Captain Player"
}
```

**Login Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def502001234567890abcdef...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_abc123",
    "username": "player123",
    "email": "player@example.com",
    "display_name": "Captain Player",
    "role": "player",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

## Data Models

### User Model
```json
{
  "id": "usr_abc123",
  "username": "player123",
  "email": "player@example.com",
  "display_name": "Captain Player",
  "role": "player", // "player", "organizer", "admin"
  "profile_image_url": "https://cdn.example.com/avatars/123.jpg",
  "tournament_wins": 5,
  "total_battles": 23,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Army Model
```json
{
  "id": "army_xyz789",
  "name": "ADEPTUS CUSTODES",
  "faction_id": "fac_custodes",
  "detachment": "LIONS OF THE EMPEROR",
  "owner_id": "usr_abc123",
  "points_value": 2000,
  "army_list": {
    "units": [
      {
        "name": "Captain-General Trajann Valoris",
        "points": 160,
        "keywords": ["CHARACTER", "INFANTRY", "CUSTODES"],
        "abilities": ["Leader", "Invulnerable Save 4+"]
      }
    ]
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Battle Model
```json
{
  "id": "btl_def456",
  "tournament_id": "trn_ghi789", // null for casual games
  "status": "in_progress", // "setup", "in_progress", "completed", "cancelled"
  "battle_type": "matched_play", // "matched_play", "crusade", "narrative"
  "mission": {
    "name": "Sweep and Clear",
    "primary_objectives": ["Control Objectives"],
    "secondary_objectives": ["Bring It Down", "Assassinate"],
    "deployment": "Dawn of War"
  },
  "current_round": 1,
  "max_rounds": 5,
  "turn_time_limit": 1800, // seconds (30 minutes)
  "current_turn": {
    "player_id": "usr_abc123",
    "phase": "movement", // "command", "movement", "psychic", "shooting", "charge", "fight", "morale"
    "start_time": "2025-01-15T14:30:00Z",
    "time_remaining": 1650
  },
  "players": [
    {
      "user_id": "usr_abc123",
      "army_id": "army_xyz789",
      "position": "left", // "left", "right"
      "scores": {
        "victory_points": 3,
        "primary": 3,
        "secondary": 0,
        "linchpin": 0,
        "challenge": 0
      },
      "command_points": 1,
      "stratagems_used": ["Rapid Fire", "Counter-Offensive"]
    },
    {
      "user_id": "usr_def456",
      "army_id": "army_abc123",
      "position": "right",
      "scores": {
        "victory_points": 4,
        "primary": 4,
        "secondary": 0,
        "linchpin": 0,
        "challenge": 0
      },
      "command_points": 2,
      "stratagems_used": ["Fury of the Lion"]
    }
  ],
  "created_at": "2025-01-15T14:00:00Z",
  "updated_at": "2025-01-15T14:35:00Z",
  "completed_at": null
}
```

### Tournament Model
```json
{
  "id": "trn_ghi789",
  "name": "Winter 40K Championship",
  "organizer_id": "usr_organizer",
  "status": "active", // "draft", "registration", "active", "completed", "cancelled"
  "format": "swiss", // "swiss", "single_elimination", "double_elimination"
  "max_participants": 32,
  "current_participants": 24,
  "entry_fee": 25.00,
  "prize_pool": 800.00,
  "start_date": "2025-02-01T09:00:00Z",
  "end_date": "2025-02-01T18:00:00Z",
  "rounds": [
    {
      "round_number": 1,
      "pairings": [
        {
          "battle_id": "btl_round1_1",
          "player1_id": "usr_abc123",
          "player2_id": "usr_def456",
          "table_number": 1
        }
      ]
    }
  ],
  "rules": {
    "points_limit": 2000,
    "time_limit": 1800,
    "allowed_factions": ["all"],
    "special_rules": []
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## API Endpoints

### Battle Management

#### Create Battle
```http
POST /battles
```

**Request:**
```json
{
  "tournament_id": "trn_ghi789", // optional
  "battle_type": "matched_play",
  "mission": {
    "name": "Sweep and Clear",
    "deployment": "Dawn of War"
  },
  "players": [
    {
      "user_id": "usr_abc123",
      "army_id": "army_xyz789",
      "position": "left"
    },
    {
      "user_id": "usr_def456", 
      "army_id": "army_abc123",
      "position": "right"
    }
  ],
  "max_rounds": 5,
  "turn_time_limit": 1800
}
```

**Response: 201 Created**
```json
{
  "battle": {
    "id": "btl_def456",
    "status": "setup",
    // ... full battle model
  }
}
```

#### Get Battle Details
```http
GET /battles/{battle_id}
```

**Response: 200 OK**
```json
{
  "battle": {
    // ... full battle model with current state
  }
}
```

#### Update Battle State
```http
PATCH /battles/{battle_id}
```

**Request:**
```json
{
  "action": "update_scores",
  "player_id": "usr_abc123",
  "scores": {
    "victory_points": 5,
    "secondary": 2
  }
}
```

**Response: 200 OK**
```json
{
  "battle": {
    // ... updated battle model
  }
}
```

#### Advance Battle Round
```http
POST /battles/{battle_id}/advance-round
```

**Response: 200 OK**
```json
{
  "battle": {
    "current_round": 2,
    // ... updated battle state
  }
}
```

#### Complete Battle
```http
POST /battles/{battle_id}/complete
```

**Request:**
```json
{
  "winner_id": "usr_def456", // optional
  "final_scores": {
    "usr_abc123": {
      "victory_points": 45,
      "secondary": 12
    },
    "usr_def456": {
      "victory_points": 67,
      "secondary": 15
    }
  }
}
```

#### Get Player's Battles
```http
GET /battles?player_id={user_id}&status=in_progress&limit=10&offset=0
```

### Army Management

#### Create Army
```http
POST /armies
```

**Request:**
```json
{
  "name": "ADEPTUS CUSTODES",
  "faction_id": "fac_custodes",
  "detachment": "LIONS OF THE EMPEROR",
  "points_value": 2000,
  "army_list": {
    "units": [
      {
        "name": "Captain-General Trajann Valoris",
        "points": 160,
        "keywords": ["CHARACTER", "INFANTRY", "CUSTODES"]
      }
    ]
  }
}
```

#### Get User's Armies
```http
GET /armies?owner_id={user_id}
```

#### Update Army
```http
PUT /armies/{army_id}
```

#### Delete Army
```http
DELETE /armies/{army_id}
```

### Tournament Management

#### Create Tournament
```http
POST /tournaments
```

**Request:**
```json
{
  "name": "Winter 40K Championship",
  "format": "swiss",
  "max_participants": 32,
  "entry_fee": 25.00,
  "start_date": "2025-02-01T09:00:00Z",
  "rules": {
    "points_limit": 2000,
    "time_limit": 1800
  }
}
```

#### Register for Tournament
```http
POST /tournaments/{tournament_id}/register
```

**Request:**
```json
{
  "army_id": "army_xyz789"
}
```

#### Get Tournament Details
```http
GET /tournaments/{tournament_id}
```

#### Generate Tournament Pairings
```http
POST /tournaments/{tournament_id}/generate-pairings
```

### Real-time Updates (WebSocket)

#### Connection
```
WSS /ws/battles/{battle_id}?token={jwt_token}
```

#### Message Types

**Score Update:**
```json
{
  "type": "score_update",
  "battle_id": "btl_def456",
  "player_id": "usr_abc123",
  "scores": {
    "victory_points": 6,
    "secondary": 3
  },
  "timestamp": "2025-01-15T14:45:00Z"
}
```

**Round Advance:**
```json
{
  "type": "round_advance",
  "battle_id": "btl_def456",
  "current_round": 3,
  "timestamp": "2025-01-15T15:00:00Z"
}
```

**Timer Update:**
```json
{
  "type": "timer_update",
  "battle_id": "btl_def456",
  "current_turn": {
    "player_id": "usr_abc123",
    "phase": "shooting",
    "time_remaining": 1200
  },
  "timestamp": "2025-01-15T14:50:00Z"
}
```

## Error Handling

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
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `BATTLE_NOT_FOUND` (404)
- `TOURNAMENT_FULL` (409)
- `INVALID_BATTLE_STATE` (409)

## Rate Limiting

- **General API**: 1000 requests per hour per user
- **Battle Updates**: 60 requests per minute per battle
- **WebSocket Connections**: 10 concurrent connections per user

Headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## Pagination

List endpoints support cursor-based pagination:

**Request:**
```http
GET /battles?limit=20&cursor=eyJpZCI6ImJ0bF9kZWY0NTYifQ%3D%3D
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "has_more": true,
    "next_cursor": "eyJpZCI6ImJ0bF9naGk3ODkifQ%3D%3D"
  }
}
```

## Performance Considerations

### Caching Strategy
- **Battle State**: Redis cache with 30-second TTL
- **Tournament Data**: 5-minute TTL
- **Army Lists**: 1-hour TTL
- **User Profiles**: 15-minute TTL

### Database Optimization
- Index on `battles.status` and `battles.current_round`
- Index on `tournaments.status` and `tournaments.start_date`
- Composite index on `battles.tournament_id, battles.status`

### WebSocket Scaling
- Use Redis pub/sub for multi-server WebSocket scaling
- Connection pooling with maximum 1000 connections per server
- Automatic reconnection with exponential backoff

## Security Measures

### Authentication
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Token rotation on refresh

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Tournament organizers can manage their tournaments
- Players can only modify their own armies and battles

### Data Validation
- Input sanitization on all endpoints
- Schema validation using JSON Schema
- Rate limiting per user and IP address
- CORS configuration for web clients

### Audit Logging
- All battle state changes logged
- Tournament registration/modification events
- Failed authentication attempts
- Suspicious activity detection

This API design provides a comprehensive foundation for the Warhammer 40K battle tracker, supporting both casual games and tournament play with real-time updates and robust state management.
---
title: "Authentication"
description: "Add authentication to your game server with JWT and Session providers"
---

The `@esengine/server` package includes a pluggable authentication system that supports JWT, session-based auth, and custom providers.

## Installation

Authentication is included in the server package:

```bash
npm install @esengine/server jsonwebtoken
```

> Note: `jsonwebtoken` is an optional peer dependency, required only for JWT authentication.

## Quick Start

### JWT Authentication

```typescript
import { createServer } from '@esengine/server'
import { withAuth, createJwtAuthProvider, withRoomAuth, requireAuth } from '@esengine/server/auth'

// Create JWT provider
const jwtProvider = createJwtAuthProvider({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600, // 1 hour
})

// Wrap server with authentication
const server = withAuth(await createServer({ port: 3000 }), {
    provider: jwtProvider,
    extractCredentials: (req) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        return url.searchParams.get('token')
    },
})

// Define authenticated room
class GameRoom extends withRoomAuth(Room, { requireAuth: true }) {
    onJoin(player) {
        console.log(`${player.user?.name} joined!`)
    }
}

server.define('game', GameRoom)
await server.start()
```

## Auth Providers

### JWT Provider

Use JSON Web Tokens for stateless authentication:

```typescript
import { createJwtAuthProvider } from '@esengine/server/auth'

const jwtProvider = createJwtAuthProvider({
    // Required: secret key
    secret: 'your-secret-key',

    // Optional: algorithm (default: HS256)
    algorithm: 'HS256',

    // Optional: expiration in seconds (default: 3600)
    expiresIn: 3600,

    // Optional: issuer for validation
    issuer: 'my-game-server',

    // Optional: audience for validation
    audience: 'my-game-client',

    // Optional: custom user extraction
    getUser: async (payload) => {
        // Fetch user from database
        return await db.users.findById(payload.sub)
    },
})

// Sign a token (for login endpoints)
const token = jwtProvider.sign({
    sub: user.id,
    name: user.name,
    roles: ['player'],
})

// Decode without verification (for debugging)
const payload = jwtProvider.decode(token)
```

### Session Provider

Use server-side sessions for stateful authentication:

```typescript
import { createSessionAuthProvider, type ISessionStorage } from '@esengine/server/auth'

// Custom storage implementation
const storage: ISessionStorage = {
    async get<T>(key: string): Promise<T | null> {
        return await redis.get(key)
    },
    async set<T>(key: string, value: T): Promise<void> {
        await redis.set(key, value)
    },
    async delete(key: string): Promise<boolean> {
        return await redis.del(key) > 0
    },
}

const sessionProvider = createSessionAuthProvider({
    storage,
    sessionTTL: 86400000, // 24 hours in ms

    // Optional: validate user on each request
    validateUser: (user) => !user.banned,
})

// Create session (for login endpoints)
const sessionId = await sessionProvider.createSession(user, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
})

// Revoke session (for logout)
await sessionProvider.revoke(sessionId)
```

## Server Auth Mixin

The `withAuth` function wraps your server to add authentication:

```typescript
import { withAuth } from '@esengine/server/auth'

const server = withAuth(baseServer, {
    // Required: auth provider
    provider: jwtProvider,

    // Required: extract credentials from request
    extractCredentials: (req) => {
        // From query string
        return new URL(req.url, 'http://localhost').searchParams.get('token')

        // Or from headers
        // return req.headers['authorization']?.replace('Bearer ', '')
    },

    // Optional: handle auth failure
    onAuthFailed: (conn, error) => {
        console.log(`Auth failed: ${error}`)
    },
})
```

### Accessing Auth Context

After authentication, the auth context is available on connections:

```typescript
import { getAuthContext } from '@esengine/server/auth'

server.onConnect = (conn) => {
    const auth = getAuthContext(conn)

    if (auth.isAuthenticated) {
        console.log(`User ${auth.userId} connected`)
        console.log(`Roles: ${auth.roles}`)
    }
}
```

## Room Auth Mixin

The `withRoomAuth` function adds authentication checks to rooms:

```typescript
import { withRoomAuth, type AuthPlayer } from '@esengine/server/auth'

interface User {
    id: string
    name: string
    roles: string[]
}

class GameRoom extends withRoomAuth<User>(Room, {
    // Require authentication to join
    requireAuth: true,

    // Optional: require specific roles
    allowedRoles: ['player', 'premium'],

    // Optional: role check mode ('any' or 'all')
    roleCheckMode: 'any',
}) {
    // player has .auth and .user properties
    onJoin(player: AuthPlayer<User>) {
        console.log(`${player.user?.name} joined`)
        console.log(`Is premium: ${player.auth.hasRole('premium')}`)
    }

    // Optional: custom auth validation
    async onAuth(player: AuthPlayer<User>): Promise<boolean> {
        // Additional validation logic
        if (player.auth.hasRole('banned')) {
            return false
        }
        return true
    }

    @onMessage('Chat')
    handleChat(data: { text: string }, player: AuthPlayer<User>) {
        this.broadcast('Chat', {
            from: player.user?.name ?? 'Guest',
            text: data.text,
        })
    }
}
```

### AuthPlayer Interface

Players in auth rooms have additional properties:

```typescript
interface AuthPlayer<TUser> extends Player {
    // Full auth context
    readonly auth: IAuthContext<TUser>

    // User info (shortcut for auth.user)
    readonly user: TUser | null
}
```

### Room Auth Helpers

```typescript
class GameRoom extends withRoomAuth<User>(Room) {
    someMethod() {
        // Get player by user ID
        const player = this.getPlayerByUserId('user-123')

        // Get all players with a role
        const admins = this.getPlayersByRole('admin')

        // Get player with auth info
        const authPlayer = this.getAuthPlayer(playerId)
    }
}
```

## Auth Decorators

### @requireAuth

Mark message handlers as requiring authentication:

```typescript
import { requireAuth, requireRole, onMessage } from '@esengine/server/auth'

class GameRoom extends withRoomAuth(Room) {
    @requireAuth()
    @onMessage('Trade')
    handleTrade(data: TradeData, player: AuthPlayer) {
        // Only authenticated players can trade
    }

    @requireAuth({ allowGuest: true })
    @onMessage('Chat')
    handleChat(data: ChatData, player: AuthPlayer) {
        // Guests can also chat
    }
}
```

### @requireRole

Require specific roles for message handlers:

```typescript
class AdminRoom extends withRoomAuth(Room) {
    @requireRole('admin')
    @onMessage('Ban')
    handleBan(data: BanData, player: AuthPlayer) {
        // Only admins can ban
    }

    @requireRole(['moderator', 'admin'])
    @onMessage('Mute')
    handleMute(data: MuteData, player: AuthPlayer) {
        // Moderators OR admins can mute
    }

    @requireRole(['verified', 'premium'], { mode: 'all' })
    @onMessage('SpecialFeature')
    handleSpecial(data: any, player: AuthPlayer) {
        // Requires BOTH verified AND premium roles
    }
}
```

## Auth Context API

The auth context provides various methods for checking authentication state:

```typescript
interface IAuthContext<TUser> {
    // Authentication state
    readonly isAuthenticated: boolean
    readonly user: TUser | null
    readonly userId: string | null
    readonly roles: ReadonlyArray<string>
    readonly authenticatedAt: number | null
    readonly expiresAt: number | null

    // Role checking
    hasRole(role: string): boolean
    hasAnyRole(roles: string[]): boolean
    hasAllRoles(roles: string[]): boolean
}
```

The `AuthContext` class (implementation) also provides:

```typescript
class AuthContext<TUser> implements IAuthContext<TUser> {
    // Set authentication from result
    setAuthenticated(result: AuthResult<TUser>): void

    // Clear authentication state
    clear(): void
}
```

## Testing

Use the mock auth provider for unit tests:

```typescript
import { createMockAuthProvider } from '@esengine/server/auth/testing'

// Create mock provider with preset users
const mockProvider = createMockAuthProvider({
    users: [
        { id: '1', name: 'Alice', roles: ['player'] },
        { id: '2', name: 'Bob', roles: ['admin', 'player'] },
    ],
    autoCreate: true, // Create users for unknown tokens
})

// Use in tests
const server = withAuth(testServer, {
    provider: mockProvider,
    extractCredentials: (req) => req.headers['x-token'],
})

// Verify with user ID as token
const result = await mockProvider.verify('1')
// result.user = { id: '1', name: 'Alice', roles: ['player'] }

// Add/remove users dynamically
mockProvider.addUser({ id: '3', name: 'Charlie', roles: ['guest'] })
mockProvider.removeUser('3')

// Revoke tokens
await mockProvider.revoke('1')

// Reset to initial state
mockProvider.clear()
```

## Error Handling

Auth errors include error codes for programmatic handling:

```typescript
type AuthErrorCode =
    | 'INVALID_CREDENTIALS'       // Invalid username/password
    | 'INVALID_TOKEN'             // Token is malformed or invalid
    | 'EXPIRED_TOKEN'             // Token has expired
    | 'USER_NOT_FOUND'            // User lookup failed
    | 'ACCOUNT_DISABLED'          // User account is disabled
    | 'RATE_LIMITED'              // Too many requests
    | 'INSUFFICIENT_PERMISSIONS'  // Insufficient permissions

// In your auth failure handler
const server = withAuth(baseServer, {
    provider: jwtProvider,
    extractCredentials,
    onAuthFailed: (conn, error) => {
        switch (error.errorCode) {
            case 'EXPIRED_TOKEN':
                conn.send('AuthError', { code: 'TOKEN_EXPIRED' })
                break
            case 'INVALID_TOKEN':
                conn.send('AuthError', { code: 'INVALID_TOKEN' })
                break
            default:
                conn.close()
        }
    },
})
```

## Complete Example

Here's a complete example with JWT authentication:

```typescript
// server.ts
import { createServer } from '@esengine/server'
import {
    withAuth,
    withRoomAuth,
    createJwtAuthProvider,
    requireAuth,
    requireRole,
    type AuthPlayer,
} from '@esengine/server/auth'

// Types
interface User {
    id: string
    name: string
    roles: string[]
}

// JWT Provider
const jwtProvider = createJwtAuthProvider<User>({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600,
    getUser: async (payload) => ({
        id: payload.sub as string,
        name: payload.name as string,
        roles: (payload.roles as string[]) ?? [],
    }),
})

// Create authenticated server
const server = withAuth(
    await createServer({ port: 3000 }),
    {
        provider: jwtProvider,
        extractCredentials: (req) => {
            return new URL(req.url ?? '', 'http://localhost')
                .searchParams.get('token')
        },
    }
)

// Game Room with auth
class GameRoom extends withRoomAuth<User>(Room, {
    requireAuth: true,
    allowedRoles: ['player'],
}) {
    onCreate() {
        console.log('Game room created')
    }

    onJoin(player: AuthPlayer<User>) {
        console.log(`${player.user?.name} joined!`)
        this.broadcast('PlayerJoined', {
            id: player.id,
            name: player.user?.name,
        })
    }

    @requireAuth()
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: AuthPlayer<User>) {
        // Handle movement
    }

    @requireRole('admin')
    @onMessage('Kick')
    handleKick(data: { playerId: string }, player: AuthPlayer<User>) {
        const target = this.getPlayer(data.playerId)
        if (target) {
            this.kick(target, 'Kicked by admin')
        }
    }
}

server.define('game', GameRoom)
await server.start()
```

## Best Practices

1. **Secure your secrets**: Never hardcode JWT secrets. Use environment variables.

2. **Set reasonable expiration**: Balance security and user experience when setting token TTL.

3. **Validate on critical actions**: Use `@requireAuth` on sensitive message handlers.

4. **Use role-based access**: Implement proper role hierarchy for admin functions.

5. **Handle token refresh**: Implement token refresh logic for long sessions.

6. **Log auth events**: Track login attempts and failures for security monitoring.

7. **Test auth flows**: Use `MockAuthProvider` to test authentication scenarios.

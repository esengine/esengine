---
title: "Rate Limiting"
description: "Protect your game server from abuse with configurable rate limiting"
---

The `@esengine/server` package includes a pluggable rate limiting system to protect against DDoS attacks, message flooding, and other abuse.

## Installation

Rate limiting is included in the server package:

```bash
npm install @esengine/server
```

## Quick Start

```typescript
import { Room, onMessage } from '@esengine/server'
import { withRateLimit, rateLimit, noRateLimit } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room, {
    messagesPerSecond: 10,
    burstSize: 20,
    onLimited: (player, type, result) => {
        player.send('Error', {
            code: 'RATE_LIMITED',
            retryAfter: result.retryAfter,
        })
    },
}) {
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: Player) {
        // Protected by rate limit (10 msg/s default)
    }

    @rateLimit({ messagesPerSecond: 1 })
    @onMessage('Trade')
    handleTrade(data: TradeData, player: Player) {
        // Stricter limit for trading
    }

    @noRateLimit()
    @onMessage('Heartbeat')
    handleHeartbeat(data: any, player: Player) {
        // No rate limit for heartbeat
    }
}
```

## Rate Limit Strategies

### Token Bucket (Default)

The token bucket algorithm allows burst traffic while maintaining long-term rate limits. Tokens are added at a fixed rate, and each request consumes tokens.

```typescript
import { withRateLimit } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room, {
    strategy: 'token-bucket',
    messagesPerSecond: 10, // Refill rate
    burstSize: 20,         // Bucket capacity
}) { }
```

**How it works:**
```
Config: rate=10/s, burstSize=20

[0s]   Bucket full: 20 tokens
[0s]   15 messages → allowed, 5 remaining
[0.5s] Refill 5 tokens → 10 tokens
[0.5s] 8 messages → allowed, 2 remaining
[0.6s] Refill 1 token → 3 tokens
[0.6s] 5 messages → 3 allowed, 2 rejected
```

**Best for:** Most general use cases, balances burst tolerance with protection.

### Sliding Window

The sliding window algorithm precisely tracks requests within a time window. More accurate than fixed window but uses slightly more memory.

```typescript
class GameRoom extends withRateLimit(Room, {
    strategy: 'sliding-window',
    messagesPerSecond: 10,
    burstSize: 10,
}) { }
```

**Best for:** When you need precise rate limiting without burst tolerance.

### Fixed Window

The fixed window algorithm divides time into fixed intervals and counts requests per interval. Simple and memory-efficient but allows 2x burst at window boundaries.

```typescript
class GameRoom extends withRateLimit(Room, {
    strategy: 'fixed-window',
    messagesPerSecond: 10,
    burstSize: 10,
}) { }
```

**Best for:** Simple scenarios where boundary burst is acceptable.

## Configuration

### Room Configuration

```typescript
import { withRateLimit } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room, {
    // Messages allowed per second (default: 10)
    messagesPerSecond: 10,

    // Burst capacity / bucket size (default: 20)
    burstSize: 20,

    // Strategy: 'token-bucket' | 'sliding-window' | 'fixed-window'
    strategy: 'token-bucket',

    // Callback when rate limited
    onLimited: (player, messageType, result) => {
        player.send('RateLimited', {
            type: messageType,
            retryAfter: result.retryAfter,
        })
    },

    // Disconnect on rate limit (default: false)
    disconnectOnLimit: false,

    // Disconnect after N consecutive limits (0 = never)
    maxConsecutiveLimits: 10,

    // Custom key function (default: player.id)
    getKey: (player) => player.id,

    // Cleanup interval in ms (default: 60000)
    cleanupInterval: 60000,
}) { }
```

### Per-Message Configuration

Use decorators to configure rate limits for specific messages:

```typescript
import { rateLimit, noRateLimit, rateLimitMessage } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room) {
    // Custom rate limit for this message
    @rateLimit({ messagesPerSecond: 1, burstSize: 2 })
    @onMessage('Trade')
    handleTrade(data: TradeData, player: Player) { }

    // This message costs 5 tokens
    @rateLimit({ cost: 5 })
    @onMessage('ExpensiveAction')
    handleExpensive(data: any, player: Player) { }

    // Exempt from rate limiting
    @noRateLimit()
    @onMessage('Heartbeat')
    handleHeartbeat(data: any, player: Player) { }

    // Alternative: specify message type explicitly
    @rateLimitMessage('SpecialAction', { messagesPerSecond: 2 })
    @onMessage('SpecialAction')
    handleSpecial(data: any, player: Player) { }
}
```

## Combining with Authentication

Rate limiting works seamlessly with the authentication system:

```typescript
import { withRoomAuth } from '@esengine/server/auth'
import { withRateLimit } from '@esengine/server/ratelimit'

// Apply both mixins
class GameRoom extends withRateLimit(
    withRoomAuth(Room, { requireAuth: true }),
    { messagesPerSecond: 10 }
) {
    onJoin(player: AuthPlayer) {
        console.log(`${player.user?.name} joined with rate limit protection`)
    }
}
```

## Rate Limit Result

When a message is rate limited, the callback receives a result object:

```typescript
interface RateLimitResult {
    // Whether the request was allowed
    allowed: boolean

    // Remaining quota
    remaining: number

    // When the quota resets (timestamp)
    resetAt: number

    // How long to wait before retrying (ms)
    retryAfter?: number
}
```

## Accessing Rate Limit Context

You can access the rate limit context for any player:

```typescript
import { getPlayerRateLimitContext } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room) {
    someMethod(player: Player) {
        const context = this.getRateLimitContext(player)

        // Check without consuming
        const status = context?.check()
        console.log(`Remaining: ${status?.remaining}`)

        // Get consecutive limit count
        console.log(`Consecutive limits: ${context?.consecutiveLimitCount}`)
    }
}

// Or use the standalone function
const context = getPlayerRateLimitContext(player)
```

## Custom Strategies

You can use the strategies directly for custom implementations:

```typescript
import {
    TokenBucketStrategy,
    SlidingWindowStrategy,
    FixedWindowStrategy,
    createTokenBucketStrategy,
} from '@esengine/server/ratelimit'

// Create strategy directly
const strategy = createTokenBucketStrategy({
    rate: 10,      // tokens per second
    capacity: 20,  // max tokens
})

// Check and consume
const result = strategy.consume('player-123')
if (result.allowed) {
    // Process message
} else {
    // Rate limited, wait result.retryAfter ms
}

// Check without consuming
const status = strategy.getStatus('player-123')

// Reset a key
strategy.reset('player-123')

// Cleanup expired records
strategy.cleanup()
```

## Rate Limit Context

The `RateLimitContext` class manages rate limiting for a single player:

```typescript
import { RateLimitContext, TokenBucketStrategy } from '@esengine/server/ratelimit'

const strategy = new TokenBucketStrategy({ rate: 10, capacity: 20 })
const context = new RateLimitContext('player-123', strategy)

// Check without consuming
context.check()

// Consume quota
context.consume()

// Consume with cost
context.consume(undefined, 5)

// Consume for specific message type
context.consume('Trade')

// Set per-message strategy
context.setMessageStrategy('Trade', new TokenBucketStrategy({ rate: 1, capacity: 2 }))

// Reset
context.reset()

// Get consecutive limit count
console.log(context.consecutiveLimitCount)
```

## Room Lifecycle Hook

You can override the `onRateLimited` hook for custom handling:

```typescript
class GameRoom extends withRateLimit(Room) {
    onRateLimited(player: Player, messageType: string, result: RateLimitResult) {
        // Log the event
        console.log(`Player ${player.id} rate limited on ${messageType}`)

        // Send custom error
        player.send('SystemMessage', {
            type: 'warning',
            message: `Slow down! Try again in ${result.retryAfter}ms`,
        })
    }
}
```

## Best Practices

1. **Start with token bucket**: It's the most flexible algorithm for games.

2. **Set appropriate limits**: Consider your game's mechanics:
   - Movement messages: Higher limits (20-60/s)
   - Chat messages: Lower limits (1-5/s)
   - Trade/purchase: Very low limits (0.5-1/s)

3. **Use burst capacity**: Allow short bursts for responsive gameplay:
   ```typescript
   messagesPerSecond: 10,
   burstSize: 30, // Allow 3s worth of burst
   ```

4. **Exempt critical messages**: Don't rate limit heartbeats or system messages:
   ```typescript
   @noRateLimit()
   @onMessage('Heartbeat')
   handleHeartbeat() { }
   ```

5. **Combine with auth**: Rate limit by user ID for authenticated users:
   ```typescript
   getKey: (player) => player.auth?.userId ?? player.id
   ```

6. **Monitor and adjust**: Log rate limit events to tune your limits:
   ```typescript
   onLimited: (player, type, result) => {
       metrics.increment('rate_limit', { messageType: type })
   }
   ```

7. **Graceful degradation**: Send informative errors instead of just disconnecting:
   ```typescript
   onLimited: (player, type, result) => {
       player.send('Error', {
           code: 'RATE_LIMITED',
           message: 'Too many requests',
           retryAfter: result.retryAfter,
       })
   }
   ```

## Complete Example

```typescript
import { Room, onMessage, type Player } from '@esengine/server'
import { withRoomAuth, type AuthPlayer } from '@esengine/server/auth'
import {
    withRateLimit,
    rateLimit,
    noRateLimit,
    type RateLimitResult,
} from '@esengine/server/ratelimit'

interface User {
    id: string
    name: string
    premium: boolean
}

// Combine auth and rate limit
class GameRoom extends withRateLimit(
    withRoomAuth<User>(Room, { requireAuth: true }),
    {
        messagesPerSecond: 10,
        burstSize: 30,
        strategy: 'token-bucket',

        // Use user ID for rate limiting
        getKey: (player) => (player as AuthPlayer<User>).user?.id ?? player.id,

        // Handle rate limits
        onLimited: (player, type, result) => {
            player.send('Error', {
                code: 'RATE_LIMITED',
                messageType: type,
                retryAfter: result.retryAfter,
            })
        },

        // Disconnect after 20 consecutive rate limits
        maxConsecutiveLimits: 20,
    }
) {
    onCreate() {
        console.log('Room created with auth + rate limit protection')
    }

    onJoin(player: AuthPlayer<User>) {
        this.broadcast('PlayerJoined', { name: player.user?.name })
    }

    // High-frequency movement (default rate limit)
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: AuthPlayer<User>) {
        this.broadcast('PlayerMoved', { id: player.id, ...data })
    }

    // Low-frequency trading (strict limit)
    @rateLimit({ messagesPerSecond: 0.5, burstSize: 2 })
    @onMessage('Trade')
    handleTrade(data: TradeData, player: AuthPlayer<User>) {
        // Process trade...
    }

    // Chat with moderate limit
    @rateLimit({ messagesPerSecond: 2, burstSize: 5 })
    @onMessage('Chat')
    handleChat(data: { text: string }, player: AuthPlayer<User>) {
        this.broadcast('Chat', {
            from: player.user?.name,
            text: data.text,
        })
    }

    // System messages - no limit
    @noRateLimit()
    @onMessage('Heartbeat')
    handleHeartbeat(data: any, player: Player) {
        player.send('Pong', { time: Date.now() })
    }

    // Custom rate limit handling
    onRateLimited(player: Player, messageType: string, result: RateLimitResult) {
        console.warn(`[RateLimit] Player ${player.id} limited on ${messageType}`)
    }
}
```

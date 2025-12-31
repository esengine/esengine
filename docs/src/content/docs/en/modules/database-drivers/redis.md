---
title: "Redis Connection"
description: "Redis connection management, auto-reconnect, key prefix"
---

## Configuration Options

```typescript
interface RedisConnectionConfig {
    /** Redis host */
    host?: string

    /** Redis port */
    port?: number

    /** Authentication password */
    password?: string

    /** Database number */
    db?: number

    /** Key prefix */
    keyPrefix?: string

    /** Auto-reconnect (default true) */
    autoReconnect?: boolean

    /** Reconnect interval (ms, default 5000) */
    reconnectInterval?: number

    /** Maximum reconnect attempts (default 10) */
    maxReconnectAttempts?: number
}
```

## Complete Example

```typescript
import { createRedisConnection, RedisConnectionToken } from '@esengine/database-drivers'

const redis = createRedisConnection({
    host: 'localhost',
    port: 6379,
    password: 'your-password',
    db: 0,
    keyPrefix: 'game:',
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
})

// Event listeners
redis.on('connected', () => {
    console.log('Redis connected')
})

redis.on('disconnected', () => {
    console.log('Redis disconnected')
})

redis.on('error', (event) => {
    console.error('Redis error:', event.error)
})

// Connect
await redis.connect()

// Check status
console.log('Connected:', redis.isConnected())
console.log('Ping:', await redis.ping())
```

## IRedisConnection Interface

```typescript
interface IRedisConnection {
    /** Connection ID */
    readonly id: string

    /** Connection state */
    readonly state: ConnectionState

    /** Establish connection */
    connect(): Promise<void>

    /** Disconnect */
    disconnect(): Promise<void>

    /** Check if connected */
    isConnected(): boolean

    /** Test connection */
    ping(): Promise<boolean>

    /** Get value */
    get(key: string): Promise<string | null>

    /** Set value (optional TTL in seconds) */
    set(key: string, value: string, ttl?: number): Promise<void>

    /** Delete key */
    del(key: string): Promise<boolean>

    /** Check if key exists */
    exists(key: string): Promise<boolean>

    /** Set expiration (seconds) */
    expire(key: string, seconds: number): Promise<boolean>

    /** Get remaining TTL (seconds) */
    ttl(key: string): Promise<number>

    /** Get native client (advanced usage) */
    getNativeClient(): Redis
}
```

## Usage Examples

### Basic Operations

```typescript
// Set value
await redis.set('user:1:name', 'John')

// Set value with expiration (1 hour)
await redis.set('session:abc123', 'user-data', 3600)

// Get value
const name = await redis.get('user:1:name')

// Check if key exists
const exists = await redis.exists('user:1:name')

// Delete key
await redis.del('user:1:name')

// Get remaining TTL
const ttl = await redis.ttl('session:abc123')
```

### Key Prefix

When `keyPrefix` is configured, all operations automatically add the prefix:

```typescript
const redis = createRedisConnection({
    host: 'localhost',
    keyPrefix: 'game:'
})

// Actual key is 'game:user:1'
await redis.set('user:1', 'data')

// Actual key queried is 'game:user:1'
const data = await redis.get('user:1')
```

### Advanced Operations

Use native client for advanced operations:

```typescript
const client = redis.getNativeClient()

// Using Pipeline
const pipeline = client.pipeline()
pipeline.set('key1', 'value1')
pipeline.set('key2', 'value2')
pipeline.set('key3', 'value3')
await pipeline.exec()

// Using Transactions
const multi = client.multi()
multi.incr('counter')
multi.get('counter')
const results = await multi.exec()

// Using Lua Scripts
const result = await client.eval(
    `return redis.call('get', KEYS[1])`,
    1,
    'mykey'
)
```

## Integration with Transaction System

```typescript
import { createRedisConnection } from '@esengine/database-drivers'
import { RedisStorage, TransactionManager } from '@esengine/transaction'

const redis = createRedisConnection({
    host: 'localhost',
    port: 6379,
    keyPrefix: 'tx:'
})
await redis.connect()

// Create transaction storage
const storage = new RedisStorage({
    factory: () => redis.getNativeClient(),
    prefix: 'tx:'
})

const txManager = new TransactionManager({ storage })
```

## Connection State

```typescript
type ConnectionState =
    | 'disconnected'  // Not connected
    | 'connecting'    // Connecting
    | 'connected'     // Connected
    | 'disconnecting' // Disconnecting
    | 'error'         // Error state
```

## Events

| Event | Description |
|-------|-------------|
| `connected` | Connection established |
| `disconnected` | Connection closed |
| `reconnecting` | Reconnecting |
| `reconnected` | Reconnection successful |
| `error` | Error occurred |

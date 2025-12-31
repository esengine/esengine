---
title: "Database Drivers"
description: "MongoDB, Redis connection management and driver abstraction"
---

`@esengine/database-drivers` is ESEngine's database connection management layer, providing unified connection management for MongoDB, Redis, and more.

## Features

- **Connection Pool** - Automatic connection pool management
- **Auto Reconnect** - Automatic reconnection on disconnect
- **Event Notification** - Connection state change events
- **Type Decoupling** - Simplified interfaces, no dependency on native driver types
- **Shared Connections** - Single connection shared across modules

## Installation

```bash
npm install @esengine/database-drivers
```

**Peer Dependencies:**
```bash
npm install mongodb    # For MongoDB support
npm install ioredis    # For Redis support
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  @esengine/database-drivers (Layer 1)                           │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │   MongoConnection   │  │   RedisConnection   │               │
│  │   - Pool management │  │   - Auto-reconnect  │               │
│  │   - Auto-reconnect  │  │   - Key prefix      │               │
│  │   - Event emitter   │  │   - Event emitter   │               │
│  └──────────┬──────────┘  └─────────────────────┘               │
│             │                                                    │
│  ┌──────────▼──────────┐                                        │
│  │ IMongoCollection<T> │  ← Type-safe interface                 │
│  │ (Adapter pattern)   │    decoupled from mongodb types        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────┐  ┌───────────────────────┐
│  @esengine/database   │  │ @esengine/transaction │
│  (Repository pattern) │  │ (Distributed tx)      │
└───────────────────────┘  └───────────────────────┘
```

## Quick Start

### MongoDB Connection

```typescript
import { createMongoConnection } from '@esengine/database-drivers'

// Create connection
const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game',
    pool: {
        minSize: 5,
        maxSize: 20
    },
    autoReconnect: true
})

// Listen to events
mongo.on('connected', () => console.log('MongoDB connected'))
mongo.on('disconnected', () => console.log('MongoDB disconnected'))
mongo.on('error', (e) => console.error('Error:', e.error))

// Connect
await mongo.connect()

// Use collections
const users = mongo.collection<User>('users')
await users.insertOne({ name: 'John', score: 100 })

const user = await users.findOne({ name: 'John' })

// Disconnect when done
await mongo.disconnect()
```

### Redis Connection

```typescript
import { createRedisConnection } from '@esengine/database-drivers'

const redis = createRedisConnection({
    host: 'localhost',
    port: 6379,
    keyPrefix: 'game:',
    autoReconnect: true
})

await redis.connect()

// Basic operations
await redis.set('session:123', 'data', 3600)  // With TTL
const value = await redis.get('session:123')

await redis.disconnect()
```

## Service Container Integration

```typescript
import { ServiceContainer } from '@esengine/ecs-framework'
import {
    createMongoConnection,
    MongoConnectionToken,
    RedisConnectionToken
} from '@esengine/database-drivers'

const services = new ServiceContainer()

// Register connections
const mongo = createMongoConnection({ uri: '...', database: 'game' })
await mongo.connect()
services.register(MongoConnectionToken, mongo)

// Retrieve in other modules
const connection = services.get(MongoConnectionToken)
const users = connection.collection('users')
```

## Documentation

- [MongoDB Connection](/en/modules/database-drivers/mongo/) - MongoDB configuration details
- [Redis Connection](/en/modules/database-drivers/redis/) - Redis configuration details
- [Service Tokens](/en/modules/database-drivers/tokens/) - Dependency injection integration

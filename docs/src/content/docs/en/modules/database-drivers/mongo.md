---
title: "MongoDB Connection"
description: "MongoDB connection management, connection pooling, auto-reconnect"
---

## Configuration Options

```typescript
interface MongoConnectionConfig {
    /** MongoDB connection URI */
    uri: string

    /** Database name */
    database: string

    /** Connection pool configuration */
    pool?: {
        minSize?: number      // Minimum connections
        maxSize?: number      // Maximum connections
        acquireTimeout?: number  // Connection acquire timeout (ms)
        maxLifetime?: number     // Maximum connection lifetime (ms)
    }

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
import { createMongoConnection, MongoConnectionToken } from '@esengine/database-drivers'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game',
    pool: {
        minSize: 5,
        maxSize: 20,
        acquireTimeout: 5000,
        maxLifetime: 300000
    },
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
})

// Event listeners
mongo.on('connected', () => {
    console.log('MongoDB connected')
})

mongo.on('disconnected', () => {
    console.log('MongoDB disconnected')
})

mongo.on('reconnecting', () => {
    console.log('MongoDB reconnecting...')
})

mongo.on('reconnected', () => {
    console.log('MongoDB reconnected')
})

mongo.on('error', (event) => {
    console.error('MongoDB error:', event.error)
})

// Connect
await mongo.connect()

// Check status
console.log('Connected:', mongo.isConnected())
console.log('Ping:', await mongo.ping())
```

## IMongoConnection Interface

```typescript
interface IMongoConnection {
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

    /** Get typed collection */
    collection<T extends object>(name: string): IMongoCollection<T>

    /** Get database interface */
    getDatabase(): IMongoDatabase

    /** Get native client (advanced usage) */
    getNativeClient(): MongoClientType

    /** Get native database (advanced usage) */
    getNativeDatabase(): Db
}
```

## IMongoCollection Interface

Type-safe collection interface, decoupled from native MongoDB types:

```typescript
interface IMongoCollection<T extends object> {
    readonly name: string

    // Query
    findOne(filter: object, options?: FindOptions): Promise<T | null>
    find(filter: object, options?: FindOptions): Promise<T[]>
    countDocuments(filter?: object): Promise<number>

    // Insert
    insertOne(doc: T): Promise<InsertOneResult>
    insertMany(docs: T[]): Promise<InsertManyResult>

    // Update
    updateOne(filter: object, update: object): Promise<UpdateResult>
    updateMany(filter: object, update: object): Promise<UpdateResult>
    findOneAndUpdate(
        filter: object,
        update: object,
        options?: FindOneAndUpdateOptions
    ): Promise<T | null>

    // Delete
    deleteOne(filter: object): Promise<DeleteResult>
    deleteMany(filter: object): Promise<DeleteResult>

    // Index
    createIndex(
        spec: Record<string, 1 | -1>,
        options?: IndexOptions
    ): Promise<string>
}
```

## Usage Examples

### Basic CRUD

```typescript
interface User {
    id: string
    name: string
    email: string
    score: number
}

const users = mongo.collection<User>('users')

// Insert
await users.insertOne({
    id: '1',
    name: 'John',
    email: 'john@example.com',
    score: 100
})

// Query
const user = await users.findOne({ name: 'John' })

const topUsers = await users.find(
    { score: { $gte: 100 } },
    { sort: { score: -1 }, limit: 10 }
)

// Update
await users.updateOne(
    { id: '1' },
    { $inc: { score: 10 } }
)

// Delete
await users.deleteOne({ id: '1' })
```

### Batch Operations

```typescript
// Batch insert
await users.insertMany([
    { id: '1', name: 'Alice', email: 'alice@example.com', score: 100 },
    { id: '2', name: 'Bob', email: 'bob@example.com', score: 200 },
    { id: '3', name: 'Carol', email: 'carol@example.com', score: 150 }
])

// Batch update
await users.updateMany(
    { score: { $lt: 100 } },
    { $set: { status: 'inactive' } }
)

// Batch delete
await users.deleteMany({ status: 'inactive' })
```

### Index Management

```typescript
// Create indexes
await users.createIndex({ email: 1 }, { unique: true })
await users.createIndex({ score: -1 })
await users.createIndex({ name: 1, score: -1 })
```

## Integration with Other Modules

### With @esengine/database

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { UserRepository, createRepository } from '@esengine/database'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// Use UserRepository
const userRepo = new UserRepository(mongo)
await userRepo.register({ username: 'john', password: '123456' })

// Use generic repository
const playerRepo = createRepository<Player>(mongo, 'players')
```

### With @esengine/transaction

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { createMongoStorage, TransactionManager } from '@esengine/transaction'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// Create transaction storage (shared connection)
const storage = createMongoStorage(mongo)
await storage.ensureIndexes()

const txManager = new TransactionManager({ storage })
```

---
"@esengine/database-drivers": minor
"@esengine/database": minor
"@esengine/transaction": minor
---

feat: add database layer architecture

Added new database packages with layered architecture:

**@esengine/database-drivers (Layer 1)**
- MongoDB connection with pool management, auto-reconnect, events
- Redis connection with auto-reconnect, key prefix
- Type-safe `IMongoCollection<T>` interface decoupled from mongodb types
- Service tokens for dependency injection (`MongoConnectionToken`, `RedisConnectionToken`)

**@esengine/database (Layer 2)**
- Generic `Repository<T>` with CRUD, pagination, soft delete
- `UserRepository` with registration, authentication, role management
- Password hashing utilities using scrypt
- Query operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$like`, `$regex`

**@esengine/transaction**
- Refactored `MongoStorage` to use shared connection from `@esengine/database-drivers`
- Removed factory pattern in favor of shared connection (breaking change)
- Simplified API: `createMongoStorage(connection, options?)`

Example usage:
```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { UserRepository } from '@esengine/database'
import { createMongoStorage, TransactionManager } from '@esengine/transaction'

// Create shared connection
const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// Use for database operations
const userRepo = new UserRepository(mongo)
await userRepo.register({ username: 'john', password: '123456' })

// Use for transactions (same connection)
const storage = createMongoStorage(mongo)
const txManager = new TransactionManager({ storage })
```

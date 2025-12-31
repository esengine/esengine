---
title: "Database Repository"
description: "Repository pattern database layer with CRUD, pagination, and soft delete"
---

`@esengine/database` is ESEngine's database operation layer, providing type-safe CRUD operations based on the Repository pattern.

## Features

- **Repository Pattern** - Generic CRUD operations with type safety
- **Pagination** - Built-in pagination support
- **Soft Delete** - Optional soft delete with restore
- **User Management** - Ready-to-use UserRepository
- **Password Security** - Secure password hashing with scrypt

## Installation

```bash
npm install @esengine/database @esengine/database-drivers
```

## Quick Start

### Basic Repository

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { Repository, createRepository } from '@esengine/database'

// Define entity
interface Player {
    id: string
    name: string
    score: number
    createdAt: Date
    updatedAt: Date
}

// Create connection
const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// Create repository
const playerRepo = createRepository<Player>(mongo, 'players')

// CRUD operations
const player = await playerRepo.create({
    name: 'John',
    score: 0
})

const found = await playerRepo.findById(player.id)

await playerRepo.update(player.id, { score: 100 })

await playerRepo.delete(player.id)
```

### Custom Repository

```typescript
import { Repository, BaseEntity } from '@esengine/database'
import type { IMongoConnection } from '@esengine/database-drivers'

interface Player extends BaseEntity {
    name: string
    score: number
    rank?: string
}

class PlayerRepository extends Repository<Player> {
    constructor(connection: IMongoConnection) {
        super(connection, 'players')
    }

    async findTopPlayers(limit: number = 10): Promise<Player[]> {
        return this.findMany({
            sort: { score: 'desc' },
            limit
        })
    }

    async findByRank(rank: string): Promise<Player[]> {
        return this.findMany({
            where: { rank }
        })
    }
}

// Usage
const playerRepo = new PlayerRepository(mongo)
const topPlayers = await playerRepo.findTopPlayers(5)
```

### User Repository

```typescript
import { UserRepository } from '@esengine/database'

const userRepo = new UserRepository(mongo)

// Register new user
const user = await userRepo.register({
    username: 'john',
    password: 'securePassword123',
    email: 'john@example.com'
})

// Authenticate
const authenticated = await userRepo.authenticate('john', 'securePassword123')
if (authenticated) {
    console.log('Login successful:', authenticated.username)
}

// Change password
await userRepo.changePassword(user.id, 'securePassword123', 'newPassword456')

// Role management
await userRepo.addRole(user.id, 'admin')
await userRepo.removeRole(user.id, 'admin')

// Find users
const admins = await userRepo.findByRole('admin')
const john = await userRepo.findByUsername('john')
```

### Pagination

```typescript
const result = await playerRepo.findPaginated(
    { page: 1, pageSize: 20 },
    {
        where: { rank: 'gold' },
        sort: { score: 'desc' }
    }
)

console.log(result.data)        // Player[]
console.log(result.total)       // Total count
console.log(result.totalPages)  // Total pages
console.log(result.hasNext)     // Has next page
console.log(result.hasPrev)     // Has previous page
```

### Soft Delete

```typescript
// Enable soft delete
const playerRepo = createRepository<Player>(mongo, 'players', true)

// Delete (marks as deleted)
await playerRepo.delete(playerId)

// Find excludes soft-deleted by default
const players = await playerRepo.findMany()

// Include soft-deleted records
const allPlayers = await playerRepo.findMany({
    includeSoftDeleted: true
})

// Restore soft-deleted record
await playerRepo.restore(playerId)
```

### Query Options

```typescript
// Complex queries
const players = await playerRepo.findMany({
    where: {
        score: { $gte: 100 },
        rank: { $in: ['gold', 'platinum'] },
        name: { $like: 'John%' }
    },
    sort: {
        score: 'desc',
        name: 'asc'
    },
    limit: 10,
    offset: 0
})

// OR conditions
const players = await playerRepo.findMany({
    where: {
        $or: [
            { score: { $gte: 1000 } },
            { rank: 'legendary' }
        ]
    }
})
```

## Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal | `{ score: { $eq: 100 } }` |
| `$ne` | Not equal | `{ status: { $ne: 'banned' } }` |
| `$gt` | Greater than | `{ score: { $gt: 50 } }` |
| `$gte` | Greater or equal | `{ level: { $gte: 10 } }` |
| `$lt` | Less than | `{ age: { $lt: 18 } }` |
| `$lte` | Less or equal | `{ price: { $lte: 100 } }` |
| `$in` | In array | `{ rank: { $in: ['gold', 'platinum'] } }` |
| `$nin` | Not in array | `{ status: { $nin: ['banned'] } }` |
| `$like` | Pattern match | `{ name: { $like: '%john%' } }` |
| `$regex` | Regex match | `{ email: { $regex: '@gmail.com$' } }` |

## Documentation

- [Repository API](/en/modules/database/repository/) - Repository detailed API
- [User Management](/en/modules/database/user/) - UserRepository usage
- [Query Syntax](/en/modules/database/query/) - Query condition syntax

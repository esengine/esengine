---
title: "Repository API"
description: "Generic repository interface, CRUD operations, pagination, soft delete"
---

## Creating a Repository

### Using Factory Function

```typescript
import { createRepository } from '@esengine/database'

const playerRepo = createRepository<Player>(mongo, 'players')

// Enable soft delete
const playerRepo = createRepository<Player>(mongo, 'players', true)
```

### Extending Repository

```typescript
import { Repository, BaseEntity } from '@esengine/database'

interface Player extends BaseEntity {
    name: string
    score: number
}

class PlayerRepository extends Repository<Player> {
    constructor(connection: IMongoConnection) {
        super(connection, 'players', false)  // Third param: enable soft delete
    }

    // Add custom methods
    async findTopPlayers(limit: number): Promise<Player[]> {
        return this.findMany({
            sort: { score: 'desc' },
            limit
        })
    }
}
```

## BaseEntity Interface

All entities must extend `BaseEntity`:

```typescript
interface BaseEntity {
    id: string
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date  // Used for soft delete
}
```

## Query Methods

### findById

```typescript
const player = await repo.findById('player-123')
```

### findOne

```typescript
const player = await repo.findOne({
    where: { name: 'John' }
})

const topPlayer = await repo.findOne({
    sort: { score: 'desc' }
})
```

### findMany

```typescript
// Simple query
const players = await repo.findMany({
    where: { rank: 'gold' }
})

// Complex query
const players = await repo.findMany({
    where: {
        score: { $gte: 100 },
        rank: { $in: ['gold', 'platinum'] }
    },
    sort: { score: 'desc', name: 'asc' },
    limit: 10,
    offset: 0
})
```

### findPaginated

```typescript
const result = await repo.findPaginated(
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

### count

```typescript
const count = await repo.count({
    where: { rank: 'gold' }
})
```

### exists

```typescript
const exists = await repo.exists({
    where: { email: 'john@example.com' }
})
```

## Create Methods

### create

```typescript
const player = await repo.create({
    name: 'John',
    score: 0
})
// Automatically generates id, createdAt, updatedAt
```

### createMany

```typescript
const players = await repo.createMany([
    { name: 'Alice', score: 100 },
    { name: 'Bob', score: 200 },
    { name: 'Carol', score: 150 }
])
```

## Update Methods

### update

```typescript
const updated = await repo.update('player-123', {
    score: 200,
    rank: 'gold'
})
// Automatically updates updatedAt
```

## Delete Methods

### delete

```typescript
// Hard delete
await repo.delete('player-123')

// Soft delete (if enabled)
// Actually sets the deletedAt field
```

### deleteMany

```typescript
const count = await repo.deleteMany({
    where: { score: { $lt: 10 } }
})
```

## Soft Delete

### Enabling Soft Delete

```typescript
const repo = createRepository<Player>(mongo, 'players', true)
```

### Query Behavior

```typescript
// Excludes soft-deleted records by default
const players = await repo.findMany()

// Include soft-deleted records
const allPlayers = await repo.findMany({
    includeSoftDeleted: true
})
```

### Restore Records

```typescript
await repo.restore('player-123')
```

## QueryOptions

```typescript
interface QueryOptions<T> {
    /** Query conditions */
    where?: WhereCondition<T>

    /** Sorting */
    sort?: Partial<Record<keyof T, 'asc' | 'desc'>>

    /** Limit count */
    limit?: number

    /** Offset */
    offset?: number

    /** Include soft-deleted records (only when soft delete is enabled) */
    includeSoftDeleted?: boolean
}
```

## PaginatedResult

```typescript
interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}
```

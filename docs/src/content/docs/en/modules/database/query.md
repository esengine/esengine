---
title: "Query Syntax"
description: "Query condition operators and syntax"
---

## Basic Queries

### Exact Match

```typescript
await repo.findMany({
    where: {
        name: 'John',
        status: 'active'
    }
})
```

### Using Operators

```typescript
await repo.findMany({
    where: {
        score: { $gte: 100 },
        rank: { $in: ['gold', 'platinum'] }
    }
})
```

## Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal | `{ score: { $eq: 100 } }` |
| `$ne` | Not equal | `{ status: { $ne: 'banned' } }` |
| `$gt` | Greater than | `{ score: { $gt: 50 } }` |
| `$gte` | Greater than or equal | `{ level: { $gte: 10 } }` |
| `$lt` | Less than | `{ age: { $lt: 18 } }` |
| `$lte` | Less than or equal | `{ price: { $lte: 100 } }` |
| `$in` | In array | `{ rank: { $in: ['gold', 'platinum'] } }` |
| `$nin` | Not in array | `{ status: { $nin: ['banned', 'suspended'] } }` |
| `$like` | Pattern match | `{ name: { $like: '%john%' } }` |
| `$regex` | Regex match | `{ email: { $regex: '@gmail.com$' } }` |

## Logical Operators

### $or

```typescript
await repo.findMany({
    where: {
        $or: [
            { score: { $gte: 1000 } },
            { rank: 'legendary' }
        ]
    }
})
```

### $and

```typescript
await repo.findMany({
    where: {
        $and: [
            { score: { $gte: 100 } },
            { score: { $lte: 500 } }
        ]
    }
})
```

### Combined Usage

```typescript
await repo.findMany({
    where: {
        status: 'active',
        $or: [
            { rank: 'gold' },
            { score: { $gte: 1000 } }
        ]
    }
})
```

## Pattern Matching

### $like Syntax

- `%` - Matches any sequence of characters
- `_` - Matches single character

```typescript
// Starts with 'John'
{ name: { $like: 'John%' } }

// Ends with 'son'
{ name: { $like: '%son' } }

// Contains 'oh'
{ name: { $like: '%oh%' } }

// Second character is 'o'
{ name: { $like: '_o%' } }
```

### $regex Syntax

Uses standard regular expressions:

```typescript
// Starts with 'John' (case insensitive)
{ name: { $regex: '^john' } }

// Gmail email
{ email: { $regex: '@gmail\\.com$' } }

// Contains numbers
{ username: { $regex: '\\d+' } }
```

## Sorting

```typescript
await repo.findMany({
    sort: {
        score: 'desc',  // Descending
        name: 'asc'     // Ascending
    }
})
```

## Pagination

### Using limit/offset

```typescript
// First page
await repo.findMany({
    limit: 20,
    offset: 0
})

// Second page
await repo.findMany({
    limit: 20,
    offset: 20
})
```

### Using findPaginated

```typescript
const result = await repo.findPaginated(
    { page: 2, pageSize: 20 },
    { sort: { createdAt: 'desc' } }
)
```

## Complete Examples

```typescript
// Find active gold players with scores between 100-1000
// Sort by score descending, get top 10
const players = await repo.findMany({
    where: {
        status: 'active',
        rank: 'gold',
        score: { $gte: 100, $lte: 1000 }
    },
    sort: { score: 'desc' },
    limit: 10
})

// Search for users with 'john' in username or gmail email
const users = await repo.findMany({
    where: {
        $or: [
            { username: { $like: '%john%' } },
            { email: { $regex: '@gmail\\.com$' } }
        ]
    }
})
```

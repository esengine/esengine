---
"@esengine/transaction": major
---

## Breaking Changes

### Storage API Simplification

RedisStorage and MongoStorage now use **factory pattern only** for connection management. The direct client injection option has been removed.

**Before (removed):**
```typescript
// Direct client injection - NO LONGER SUPPORTED
const storage = new RedisStorage({ client: redisClient });
const storage = new MongoStorage({ client: mongoClient, database: 'game' });
```

**After (factory pattern only):**
```typescript
// RedisStorage
const storage = new RedisStorage({
    factory: () => new Redis('redis://localhost:6379'),
    prefix: 'tx:',
    transactionTTL: 86400,
});

// MongoStorage
const storage = new MongoStorage({
    factory: async () => {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        return client;
    },
    database: 'game',
});
```

### New Features

- **Lazy Connection**: Connection is established on first operation, not at construction time
- **Automatic Cleanup**: Support `await using` syntax (TypeScript 5.2+) for automatic resource cleanup
- **Explicit Close**: Call `storage.close()` when done, or use `await using` for automatic disposal

### Migration Guide

1. Replace `client` option with `factory` function
2. Add `storage.close()` call when done, or use `await using`
3. For MongoStorage, ensure factory returns a connected client

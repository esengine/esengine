---
title: "Storage Layer"
description: "Transaction storage interface and implementations: MemoryStorage, RedisStorage, MongoStorage"
---

## Storage Interface

All storage implementations must implement the `ITransactionStorage` interface:

```typescript
interface ITransactionStorage {
    // Distributed lock
    acquireLock(key: string, ttl: number): Promise<string | null>;
    releaseLock(key: string, token: string): Promise<boolean>;

    // Transaction log
    saveTransaction(tx: TransactionLog): Promise<void>;
    getTransaction(id: string): Promise<TransactionLog | null>;
    updateTransactionState(id: string, state: TransactionState): Promise<void>;
    updateOperationState(txId: string, opIndex: number, state: string, error?: string): Promise<void>;
    getPendingTransactions(serverId?: string): Promise<TransactionLog[]>;
    deleteTransaction(id: string): Promise<void>;

    // Data operations
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
}
```

## MemoryStorage

In-memory storage, suitable for development and testing.

```typescript
import { MemoryStorage } from '@esengine/transaction';

const storage = new MemoryStorage({
    maxTransactions: 1000,  // Maximum transaction log count
});

const manager = new TransactionManager({ storage });
```

### Characteristics

- ✅ No external dependencies
- ✅ Fast, good for debugging
- ❌ Data only stored in memory
- ❌ No true distributed locking
- ❌ Data lost on restart

### Test Helpers

```typescript
// Clear all data
storage.clear();

// Get transaction count
console.log(storage.transactionCount);
```

## RedisStorage

Redis storage, suitable for production distributed systems.

```typescript
import Redis from 'ioredis';
import { RedisStorage } from '@esengine/transaction';

const redis = new Redis('redis://localhost:6379');

const storage = new RedisStorage({
    client: redis,
    prefix: 'tx:',              // Key prefix
    transactionTTL: 86400,      // Transaction log TTL (seconds)
});

const manager = new TransactionManager({ storage });
```

### Characteristics

- ✅ High-performance distributed locking
- ✅ Fast read/write
- ✅ Supports TTL auto-expiration
- ✅ Suitable for high concurrency
- ❌ Requires Redis server

### Distributed Lock Implementation

Uses Redis `SET NX EX` for distributed locking:

```typescript
// Acquire lock (atomic operation)
SET tx:lock:player:123 <token> NX EX 10

// Release lock (Lua script for atomicity)
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

### Key Structure

```
tx:lock:{key}           - Distributed locks
tx:tx:{id}              - Transaction logs
tx:server:{id}:txs      - Server transaction index
tx:data:{key}           - Business data
```

## MongoStorage

MongoDB storage, suitable for scenarios requiring persistence and complex queries.

```typescript
import { MongoClient } from 'mongodb';
import { MongoStorage } from '@esengine/transaction';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('game');

const storage = new MongoStorage({
    db,
    transactionCollection: 'transactions',  // Transaction log collection
    dataCollection: 'transaction_data',     // Business data collection
    lockCollection: 'transaction_locks',    // Lock collection
});

// Create indexes (run on first startup)
await storage.ensureIndexes();

const manager = new TransactionManager({ storage });
```

### Characteristics

- ✅ Persistent storage
- ✅ Supports complex queries
- ✅ Transaction logs are traceable
- ✅ Suitable for audit requirements
- ❌ Slightly lower performance than Redis
- ❌ Requires MongoDB server

### Index Structure

```javascript
// transactions collection
{ state: 1 }
{ 'metadata.serverId': 1 }
{ createdAt: 1 }

// transaction_locks collection
{ expireAt: 1 }  // TTL index

// transaction_data collection
{ expireAt: 1 }  // TTL index
```

### Distributed Lock Implementation

Uses MongoDB unique index for distributed locking:

```typescript
// Acquire lock
db.transaction_locks.insertOne({
    _id: 'player:123',
    token: '<token>',
    expireAt: new Date(Date.now() + 10000)
});

// If key exists, check if expired
db.transaction_locks.updateOne(
    { _id: 'player:123', expireAt: { $lt: new Date() } },
    { $set: { token: '<token>', expireAt: new Date(Date.now() + 10000) } }
);
```

## Storage Selection Guide

| Scenario | Recommended Storage | Reason |
|----------|---------------------|--------|
| Development/Testing | MemoryStorage | No dependencies, fast startup |
| Single-machine Production | RedisStorage | High performance, simple |
| Distributed System | RedisStorage | True distributed locking |
| Audit Required | MongoStorage | Persistent logs |
| Mixed Requirements | Redis + Mongo | Redis for locks, Mongo for logs |

## Custom Storage

Implement `ITransactionStorage` interface to create custom storage:

```typescript
import { ITransactionStorage, TransactionLog, TransactionState } from '@esengine/transaction';

class MyCustomStorage implements ITransactionStorage {
    async acquireLock(key: string, ttl: number): Promise<string | null> {
        // Implement distributed lock acquisition
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        // Implement distributed lock release
    }

    async saveTransaction(tx: TransactionLog): Promise<void> {
        // Save transaction log
    }

    // ... implement other methods
}
```

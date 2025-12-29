---
title: "Transaction System"
description: "Game transaction system with distributed support for shop purchases, player trading, and more"
---

`@esengine/transaction` provides comprehensive game transaction capabilities based on the Saga pattern, supporting shop purchases, player trading, multi-step tasks, and distributed transactions with Redis/MongoDB.

## Overview

The transaction system solves common data consistency problems in games:

| Scenario | Problem | Solution |
|----------|---------|----------|
| Shop Purchase | Payment succeeded but item not delivered | Atomic transaction with auto-rollback |
| Player Trade | One party transferred items but other didn't receive | Saga compensation mechanism |
| Cross-Server | Data inconsistency across servers | Distributed lock + transaction log |

## Installation

```bash
npm install @esengine/transaction
```

Optional dependencies (install based on storage needs):
```bash
npm install ioredis   # Redis storage
npm install mongodb   # MongoDB storage
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Transaction Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  TransactionManager         - Manages transaction lifecycle      │
│  TransactionContext         - Encapsulates operations and state  │
│  SagaOrchestrator           - Distributed Saga orchestrator      │
├─────────────────────────────────────────────────────────────────┤
│                    Storage Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  MemoryStorage              - In-memory (dev/test)               │
│  RedisStorage               - Redis (distributed lock + cache)   │
│  MongoStorage               - MongoDB (persistent log)           │
├─────────────────────────────────────────────────────────────────┤
│                    Operation Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  CurrencyOperation          - Currency operations                │
│  InventoryOperation         - Inventory operations               │
│  TradeOperation             - Trade operations                   │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Basic Usage

```typescript
import {
    TransactionManager,
    MemoryStorage,
    CurrencyOperation,
    InventoryOperation,
} from '@esengine/transaction';

// Create transaction manager
const manager = new TransactionManager({
    storage: new MemoryStorage(),
    defaultTimeout: 10000,
});

// Execute transaction
const result = await manager.run((tx) => {
    // Deduct gold
    tx.addOperation(new CurrencyOperation({
        type: 'deduct',
        playerId: 'player1',
        currency: 'gold',
        amount: 100,
    }));

    // Add item
    tx.addOperation(new InventoryOperation({
        type: 'add',
        playerId: 'player1',
        itemId: 'sword_001',
        quantity: 1,
    }));
});

if (result.success) {
    console.log('Purchase successful!');
} else {
    console.log('Purchase failed:', result.error);
}
```

### Player Trading

```typescript
import { TradeOperation } from '@esengine/transaction';

const result = await manager.run((tx) => {
    tx.addOperation(new TradeOperation({
        tradeId: 'trade_001',
        partyA: {
            playerId: 'player1',
            items: [{ itemId: 'sword', quantity: 1 }],
        },
        partyB: {
            playerId: 'player2',
            currencies: [{ currency: 'gold', amount: 1000 }],
        },
    }));
}, { timeout: 30000 });
```

### Using Redis Storage

```typescript
import Redis from 'ioredis';
import { TransactionManager, RedisStorage } from '@esengine/transaction';

const redis = new Redis('redis://localhost:6379');
const storage = new RedisStorage({ client: redis });

const manager = new TransactionManager({ storage });
```

### Using MongoDB Storage

```typescript
import { MongoClient } from 'mongodb';
import { TransactionManager, MongoStorage } from '@esengine/transaction';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('game');

const storage = new MongoStorage({ db });
await storage.ensureIndexes();

const manager = new TransactionManager({ storage });
```

## Room Integration

```typescript
import { Room } from '@esengine/server';
import { withTransactions, CurrencyOperation, RedisStorage } from '@esengine/transaction';

class GameRoom extends withTransactions(Room, {
    storage: new RedisStorage({ client: redisClient }),
}) {
    @onMessage('Buy')
    async handleBuy(data: { itemId: string }, player: Player) {
        const result = await this.runTransaction((tx) => {
            tx.addOperation(new CurrencyOperation({
                type: 'deduct',
                playerId: player.id,
                currency: 'gold',
                amount: getItemPrice(data.itemId),
            }));
        });

        if (result.success) {
            player.send('buy_success', { itemId: data.itemId });
        } else {
            player.send('buy_failed', { error: result.error });
        }
    }
}
```

## Documentation

- [Core Concepts](/en/modules/transaction/core/) - Transaction context, manager, Saga pattern
- [Storage Layer](/en/modules/transaction/storage/) - MemoryStorage, RedisStorage, MongoStorage
- [Operations](/en/modules/transaction/operations/) - Currency, inventory, trade operations
- [Distributed Transactions](/en/modules/transaction/distributed/) - Saga orchestrator, cross-server transactions
- [API Reference](/en/modules/transaction/api/) - Complete API documentation

## Service Tokens

For dependency injection:

```typescript
import {
    TransactionManagerToken,
    TransactionStorageToken,
} from '@esengine/transaction';

const manager = services.get(TransactionManagerToken);
```

## Best Practices

### 1. Operation Granularity

```typescript
// ✅ Good: Fine-grained operations, easy to rollback
tx.addOperation(new CurrencyOperation({ type: 'deduct', ... }));
tx.addOperation(new InventoryOperation({ type: 'add', ... }));

// ❌ Bad: Coarse-grained operation, hard to partially rollback
tx.addOperation(new ComplexPurchaseOperation({ ... }));
```

### 2. Timeout Settings

```typescript
// Simple operations: short timeout
await manager.run(tx => { ... }, { timeout: 5000 });

// Complex trades: longer timeout
await manager.run(tx => { ... }, { timeout: 30000 });

// Cross-server: even longer timeout
await manager.run(tx => { ... }, { timeout: 60000, distributed: true });
```

### 3. Error Handling

```typescript
const result = await manager.run((tx) => { ... });

if (!result.success) {
    // Log the error
    logger.error('Transaction failed', {
        transactionId: result.transactionId,
        error: result.error,
        duration: result.duration,
    });

    // Notify user
    player.send('error', { message: getErrorMessage(result.error) });
}
```

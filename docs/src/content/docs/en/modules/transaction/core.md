---
title: "Core Concepts"
description: "Transaction system core concepts: context, manager, and Saga pattern"
---

## Transaction State

A transaction can be in the following states:

```typescript
type TransactionState =
    | 'pending'     // Waiting to execute
    | 'executing'   // Executing
    | 'committed'   // Committed
    | 'rolledback'  // Rolled back
    | 'failed'      // Failed
```

## TransactionContext

The transaction context encapsulates transaction state, operations, and execution logic.

### Creating Transactions

```typescript
import { TransactionManager } from '@esengine/transaction';

const manager = new TransactionManager();

// Method 1: Manual management with begin()
const tx = manager.begin({ timeout: 5000 });
tx.addOperation(op1);
tx.addOperation(op2);
const result = await tx.execute();

// Method 2: Automatic management with run()
const result = await manager.run((tx) => {
    tx.addOperation(op1);
    tx.addOperation(op2);
});
```

### Chaining Operations

```typescript
const result = await manager.run((tx) => {
    tx.addOperation(new CurrencyOperation({ ... }))
      .addOperation(new InventoryOperation({ ... }))
      .addOperation(new InventoryOperation({ ... }));
});
```

### Context Data

Operations can share data through the context:

```typescript
class CustomOperation extends BaseOperation<MyData, MyResult> {
    async execute(ctx: ITransactionContext): Promise<OperationResult<MyResult>> {
        // Read data set by previous operations
        const previousResult = ctx.get<number>('previousValue');

        // Set data for subsequent operations
        ctx.set('myResult', { value: 123 });

        return this.success({ ... });
    }
}
```

## TransactionManager

The transaction manager is responsible for creating, executing, and recovering transactions.

### Configuration Options

```typescript
interface TransactionManagerConfig {
    storage?: ITransactionStorage;    // Storage instance
    defaultTimeout?: number;          // Default timeout (ms)
    serverId?: string;                // Server ID (for distributed)
    autoRecover?: boolean;            // Auto-recover pending transactions
}

const manager = new TransactionManager({
    storage: new RedisStorage({ client: redis }),
    defaultTimeout: 10000,
    serverId: 'server-1',
    autoRecover: true,
});
```

### Distributed Locking

```typescript
// Acquire lock
const token = await manager.acquireLock('player:123:inventory', 10000);

if (token) {
    try {
        // Perform operations
        await doSomething();
    } finally {
        // Release lock
        await manager.releaseLock('player:123:inventory', token);
    }
}

// Or use withLock for convenience
await manager.withLock('player:123:inventory', async () => {
    await doSomething();
}, 10000);
```

### Transaction Recovery

Recover pending transactions after server restart:

```typescript
const manager = new TransactionManager({
    storage: new RedisStorage({ client: redis }),
    serverId: 'server-1',
});

// Recover pending transactions
const recoveredCount = await manager.recover();
console.log(`Recovered ${recoveredCount} transactions`);
```

## Saga Pattern

The transaction system uses the Saga pattern. Each operation must implement `execute` and `compensate` methods:

```typescript
interface ITransactionOperation<TData, TResult> {
    readonly name: string;
    readonly data: TData;

    // Validate preconditions
    validate(ctx: ITransactionContext): Promise<boolean>;

    // Forward execution
    execute(ctx: ITransactionContext): Promise<OperationResult<TResult>>;

    // Compensate (rollback)
    compensate(ctx: ITransactionContext): Promise<void>;
}
```

### Execution Flow

```
Begin Transaction
    │
    ▼
┌─────────────────────┐
│  validate(op1)      │──fail──► Return failure
└─────────────────────┘
    │success
    ▼
┌─────────────────────┐
│  execute(op1)       │──fail──┐
└─────────────────────┘        │
    │success                    │
    ▼                          │
┌─────────────────────┐        │
│  validate(op2)      │──fail──┤
└─────────────────────┘        │
    │success                    │
    ▼                          │
┌─────────────────────┐        │
│  execute(op2)       │──fail──┤
└─────────────────────┘        │
    │success                    ▼
    ▼                  ┌─────────────────────┐
Commit Transaction     │  compensate(op1)    │
                       └─────────────────────┘
                               │
                               ▼
                       Return failure (rolled back)
```

### Custom Operations

```typescript
import { BaseOperation, ITransactionContext, OperationResult } from '@esengine/transaction';

interface UpgradeData {
    playerId: string;
    itemId: string;
    targetLevel: number;
}

interface UpgradeResult {
    newLevel: number;
}

class UpgradeOperation extends BaseOperation<UpgradeData, UpgradeResult> {
    readonly name = 'upgrade';

    private _previousLevel: number = 0;

    async validate(ctx: ITransactionContext): Promise<boolean> {
        // Validate item exists and can be upgraded
        const item = await this.getItem(ctx);
        return item !== null && item.level < this.data.targetLevel;
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult<UpgradeResult>> {
        const item = await this.getItem(ctx);
        if (!item) {
            return this.failure('Item not found', 'ITEM_NOT_FOUND');
        }

        this._previousLevel = item.level;
        item.level = this.data.targetLevel;
        await this.saveItem(ctx, item);

        return this.success({ newLevel: item.level });
    }

    async compensate(ctx: ITransactionContext): Promise<void> {
        const item = await this.getItem(ctx);
        if (item) {
            item.level = this._previousLevel;
            await this.saveItem(ctx, item);
        }
    }

    private async getItem(ctx: ITransactionContext) {
        // Get item from storage
    }

    private async saveItem(ctx: ITransactionContext, item: any) {
        // Save item to storage
    }
}
```

## Transaction Result

```typescript
interface TransactionResult<T = unknown> {
    success: boolean;           // Whether succeeded
    transactionId: string;      // Transaction ID
    results: OperationResult[]; // Operation results
    data?: T;                   // Final data
    error?: string;             // Error message
    duration: number;           // Execution time (ms)
}

const result = await manager.run((tx) => { ... });

console.log(`Transaction ${result.transactionId}`);
console.log(`Success: ${result.success}`);
console.log(`Duration: ${result.duration}ms`);

if (!result.success) {
    console.log(`Error: ${result.error}`);
}
```

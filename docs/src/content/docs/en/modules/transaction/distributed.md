---
title: "Distributed Transactions"
description: "Saga orchestrator and cross-server transaction support"
---

## Saga Orchestrator

`SagaOrchestrator` is used to orchestrate distributed transactions across servers.

### Basic Usage

```typescript
import { SagaOrchestrator, RedisStorage } from '@esengine/transaction';

const orchestrator = new SagaOrchestrator({
    storage: new RedisStorage({ client: redis }),
    timeout: 30000,
    serverId: 'orchestrator-1',
});

const result = await orchestrator.execute([
    {
        name: 'deduct_currency',
        serverId: 'game-server-1',
        data: { playerId: 'player1', amount: 100 },
        execute: async (data) => {
            // Call game server API to deduct currency
            const response = await gameServerApi.deductCurrency(data);
            return { success: response.ok };
        },
        compensate: async (data) => {
            // Call game server API to restore currency
            await gameServerApi.addCurrency(data);
        },
    },
    {
        name: 'add_item',
        serverId: 'inventory-server-1',
        data: { playerId: 'player1', itemId: 'sword' },
        execute: async (data) => {
            const response = await inventoryServerApi.addItem(data);
            return { success: response.ok };
        },
        compensate: async (data) => {
            await inventoryServerApi.removeItem(data);
        },
    },
]);

if (result.success) {
    console.log('Saga completed successfully');
} else {
    console.log('Saga failed:', result.error);
    console.log('Completed steps:', result.completedSteps);
    console.log('Failed at:', result.failedStep);
}
```

### Configuration Options

```typescript
interface SagaOrchestratorConfig {
    storage?: ITransactionStorage;  // Storage instance
    timeout?: number;               // Timeout in milliseconds
    serverId?: string;              // Orchestrator server ID
}
```

### Saga Step

```typescript
interface SagaStep<T = unknown> {
    name: string;                   // Step name
    serverId?: string;              // Target server ID
    data: T;                        // Step data
    execute: (data: T) => Promise<OperationResult>;    // Execute function
    compensate: (data: T) => Promise<void>;            // Compensate function
}
```

### Saga Result

```typescript
interface SagaResult {
    success: boolean;       // Whether succeeded
    sagaId: string;         // Saga ID
    completedSteps: string[]; // Completed steps
    failedStep?: string;    // Failed step
    error?: string;         // Error message
    duration: number;       // Execution time (ms)
}
```

## Execution Flow

```
Start Saga
    │
    ▼
┌─────────────────────┐
│  Step 1: execute    │──fail──┐
└─────────────────────┘        │
    │success                    │
    ▼                          │
┌─────────────────────┐        │
│  Step 2: execute    │──fail──┤
└─────────────────────┘        │
    │success                    │
    ▼                          │
┌─────────────────────┐        │
│  Step 3: execute    │──fail──┤
└─────────────────────┘        │
    │success                    ▼
    ▼                  ┌─────────────────────┐
Saga Complete          │  Step 2: compensate │
                       └─────────────────────┘
                               │
                               ▼
                       ┌─────────────────────┐
                       │  Step 1: compensate │
                       └─────────────────────┘
                               │
                               ▼
                       Saga Failed (compensated)
```

## Saga Logs

The orchestrator records detailed execution logs:

```typescript
interface SagaLog {
    id: string;                     // Saga ID
    state: SagaLogState;            // State
    steps: SagaStepLog[];           // Step logs
    createdAt: number;              // Creation time
    updatedAt: number;              // Update time
    metadata?: Record<string, unknown>;
}

type SagaLogState =
    | 'pending'       // Waiting to execute
    | 'running'       // Executing
    | 'completed'     // Completed
    | 'compensating'  // Compensating
    | 'compensated'   // Compensated
    | 'failed'        // Failed

interface SagaStepLog {
    name: string;                   // Step name
    serverId?: string;              // Server ID
    state: SagaStepState;           // State
    startedAt?: number;             // Start time
    completedAt?: number;           // Completion time
    error?: string;                 // Error message
}

type SagaStepState =
    | 'pending'       // Waiting to execute
    | 'executing'     // Executing
    | 'completed'     // Completed
    | 'compensating'  // Compensating
    | 'compensated'   // Compensated
    | 'failed'        // Failed
```

### Query Saga Logs

```typescript
const log = await orchestrator.getSagaLog('saga_xxx');

if (log) {
    console.log('Saga state:', log.state);
    for (const step of log.steps) {
        console.log(`  ${step.name}: ${step.state}`);
    }
}
```

## Cross-Server Transaction Examples

### Scenario: Cross-Server Purchase

A player purchases an item on a game server, with currency on an account server and items on an inventory server.

```typescript
const orchestrator = new SagaOrchestrator({
    storage: redisStorage,
    serverId: 'purchase-orchestrator',
});

async function crossServerPurchase(
    playerId: string,
    itemId: string,
    price: number
): Promise<SagaResult> {
    return orchestrator.execute([
        // Step 1: Deduct balance on account server
        {
            name: 'deduct_balance',
            serverId: 'account-server',
            data: { playerId, amount: price },
            execute: async (data) => {
                const result = await accountService.deduct(data.playerId, data.amount);
                return { success: result.ok, error: result.error };
            },
            compensate: async (data) => {
                await accountService.refund(data.playerId, data.amount);
            },
        },

        // Step 2: Add item on inventory server
        {
            name: 'add_item',
            serverId: 'inventory-server',
            data: { playerId, itemId },
            execute: async (data) => {
                const result = await inventoryService.addItem(data.playerId, data.itemId);
                return { success: result.ok, error: result.error };
            },
            compensate: async (data) => {
                await inventoryService.removeItem(data.playerId, data.itemId);
            },
        },

        // Step 3: Record purchase log
        {
            name: 'log_purchase',
            serverId: 'log-server',
            data: { playerId, itemId, price, timestamp: Date.now() },
            execute: async (data) => {
                await logService.recordPurchase(data);
                return { success: true };
            },
            compensate: async (data) => {
                await logService.cancelPurchase(data);
            },
        },
    ]);
}
```

### Scenario: Cross-Server Trade

Two players on different servers trade with each other.

```typescript
async function crossServerTrade(
    playerA: { id: string; server: string; items: string[] },
    playerB: { id: string; server: string; items: string[] }
): Promise<SagaResult> {
    const steps: SagaStep[] = [];

    // Remove items from player A
    for (const itemId of playerA.items) {
        steps.push({
            name: `remove_${playerA.id}_${itemId}`,
            serverId: playerA.server,
            data: { playerId: playerA.id, itemId },
            execute: async (data) => {
                return await inventoryService.removeItem(data.playerId, data.itemId);
            },
            compensate: async (data) => {
                await inventoryService.addItem(data.playerId, data.itemId);
            },
        });
    }

    // Add items to player B (from A)
    for (const itemId of playerA.items) {
        steps.push({
            name: `add_${playerB.id}_${itemId}`,
            serverId: playerB.server,
            data: { playerId: playerB.id, itemId },
            execute: async (data) => {
                return await inventoryService.addItem(data.playerId, data.itemId);
            },
            compensate: async (data) => {
                await inventoryService.removeItem(data.playerId, data.itemId);
            },
        });
    }

    // Similarly handle player B's items...

    return orchestrator.execute(steps);
}
```

## Recovering Incomplete Sagas

Recover incomplete Sagas after server restart:

```typescript
const orchestrator = new SagaOrchestrator({
    storage: redisStorage,
    serverId: 'my-orchestrator',
});

// Recover incomplete Sagas (will execute compensation)
const recoveredCount = await orchestrator.recover();
console.log(`Recovered ${recoveredCount} sagas`);
```

## Best Practices

### 1. Idempotency

Ensure all operations are idempotent:

```typescript
{
    execute: async (data) => {
        // Use unique ID to ensure idempotency
        const result = await service.process(data.requestId, data);
        return { success: result.ok };
    },
    compensate: async (data) => {
        // Compensation must also be idempotent
        await service.rollback(data.requestId);
    },
}
```

### 2. Timeout Handling

Set appropriate timeout values:

```typescript
const orchestrator = new SagaOrchestrator({
    timeout: 60000,  // Cross-server operations need longer timeout
});
```

### 3. Monitoring and Alerts

Log Saga execution results:

```typescript
const result = await orchestrator.execute(steps);

if (!result.success) {
    // Send alert
    alertService.send({
        type: 'saga_failed',
        sagaId: result.sagaId,
        failedStep: result.failedStep,
        error: result.error,
    });

    // Log details
    const log = await orchestrator.getSagaLog(result.sagaId);
    logger.error('Saga failed', { log });
}
```

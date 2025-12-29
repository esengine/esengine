---
title: "分布式事务"
description: "Saga 编排器和跨服务器事务支持"
---

## Saga 编排器

`SagaOrchestrator` 用于编排跨服务器的分布式事务。

### 基本用法

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
            // 调用游戏服务器 API 扣除货币
            const response = await gameServerApi.deductCurrency(data);
            return { success: response.ok };
        },
        compensate: async (data) => {
            // 调用游戏服务器 API 恢复货币
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

### 配置选项

```typescript
interface SagaOrchestratorConfig {
    storage?: ITransactionStorage;  // 存储实例
    timeout?: number;               // 超时时间（毫秒）
    serverId?: string;              // 编排器服务器 ID
}
```

### Saga 步骤

```typescript
interface SagaStep<T = unknown> {
    name: string;                   // 步骤名称
    serverId?: string;              // 目标服务器 ID
    data: T;                        // 步骤数据
    execute: (data: T) => Promise<OperationResult>;    // 执行函数
    compensate: (data: T) => Promise<void>;            // 补偿函数
}
```

### Saga 结果

```typescript
interface SagaResult {
    success: boolean;       // 是否成功
    sagaId: string;         // Saga ID
    completedSteps: string[]; // 已完成的步骤
    failedStep?: string;    // 失败的步骤
    error?: string;         // 错误信息
    duration: number;       // 执行时间（毫秒）
}
```

## 执行流程

```
开始 Saga
    │
    ▼
┌─────────────────────┐
│  Step 1: execute    │──失败──┐
└─────────────────────┘        │
    │成功                       │
    ▼                          │
┌─────────────────────┐        │
│  Step 2: execute    │──失败──┤
└─────────────────────┘        │
    │成功                       │
    ▼                          │
┌─────────────────────┐        │
│  Step 3: execute    │──失败──┤
└─────────────────────┘        │
    │成功                       ▼
    ▼                  ┌─────────────────────┐
Saga 完成              │  Step 2: compensate │
                       └─────────────────────┘
                               │
                               ▼
                       ┌─────────────────────┐
                       │  Step 1: compensate │
                       └─────────────────────┘
                               │
                               ▼
                       Saga 失败（已补偿）
```

## Saga 日志

编排器会记录详细的执行日志：

```typescript
interface SagaLog {
    id: string;                     // Saga ID
    state: SagaLogState;            // 状态
    steps: SagaStepLog[];           // 步骤日志
    createdAt: number;              // 创建时间
    updatedAt: number;              // 更新时间
    metadata?: Record<string, unknown>;
}

type SagaLogState =
    | 'pending'       // 等待执行
    | 'running'       // 执行中
    | 'completed'     // 已完成
    | 'compensating'  // 补偿中
    | 'compensated'   // 已补偿
    | 'failed'        // 失败

interface SagaStepLog {
    name: string;                   // 步骤名称
    serverId?: string;              // 服务器 ID
    state: SagaStepState;           // 状态
    startedAt?: number;             // 开始时间
    completedAt?: number;           // 完成时间
    error?: string;                 // 错误信息
}

type SagaStepState =
    | 'pending'       // 等待执行
    | 'executing'     // 执行中
    | 'completed'     // 已完成
    | 'compensating'  // 补偿中
    | 'compensated'   // 已补偿
    | 'failed'        // 失败
```

### 查询 Saga 日志

```typescript
const log = await orchestrator.getSagaLog('saga_xxx');

if (log) {
    console.log('Saga state:', log.state);
    for (const step of log.steps) {
        console.log(`  ${step.name}: ${step.state}`);
    }
}
```

## 跨服务器事务示例

### 场景：跨服购买

玩家在游戏服务器购买物品，货币在账户服务器，物品在背包服务器。

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
        // 步骤 1：在账户服务器扣款
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

        // 步骤 2：在背包服务器添加物品
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

        // 步骤 3：记录购买日志
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

### 场景：跨服交易

两个玩家在不同服务器上进行交易。

```typescript
async function crossServerTrade(
    playerA: { id: string; server: string; items: string[] },
    playerB: { id: string; server: string; items: string[] }
): Promise<SagaResult> {
    const steps: SagaStep[] = [];

    // 移除 A 的物品
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

    // 添加物品到 B
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

    // 类似地处理 B 的物品...

    return orchestrator.execute(steps);
}
```

## 恢复未完成的 Saga

服务器重启后恢复未完成的 Saga：

```typescript
const orchestrator = new SagaOrchestrator({
    storage: redisStorage,
    serverId: 'my-orchestrator',
});

// 恢复未完成的 Saga（会执行补偿）
const recoveredCount = await orchestrator.recover();
console.log(`Recovered ${recoveredCount} sagas`);
```

## 最佳实践

### 1. 幂等性

确保所有操作都是幂等的：

```typescript
{
    execute: async (data) => {
        // 使用唯一 ID 确保幂等
        const result = await service.process(data.requestId, data);
        return { success: result.ok };
    },
    compensate: async (data) => {
        // 补偿也要幂等
        await service.rollback(data.requestId);
    },
}
```

### 2. 超时处理

设置合适的超时时间：

```typescript
const orchestrator = new SagaOrchestrator({
    timeout: 60000,  // 跨服务器操作需要更长超时
});
```

### 3. 监控和告警

记录 Saga 执行结果：

```typescript
const result = await orchestrator.execute(steps);

if (!result.success) {
    // 发送告警
    alertService.send({
        type: 'saga_failed',
        sagaId: result.sagaId,
        failedStep: result.failedStep,
        error: result.error,
    });

    // 记录详细日志
    const log = await orchestrator.getSagaLog(result.sagaId);
    logger.error('Saga failed', { log });
}
```

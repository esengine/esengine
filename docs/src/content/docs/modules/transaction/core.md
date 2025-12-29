---
title: "核心概念"
description: "事务系统的核心概念：事务上下文、事务管理器、Saga 模式"
---

## 事务状态

事务有以下几种状态：

```typescript
type TransactionState =
    | 'pending'     // 等待执行
    | 'executing'   // 执行中
    | 'committed'   // 已提交
    | 'rolledback'  // 已回滚
    | 'failed'      // 失败
```

## TransactionContext

事务上下文封装了事务的状态、操作和执行逻辑。

### 创建事务

```typescript
import { TransactionManager } from '@esengine/transaction';

const manager = new TransactionManager();

// 方式 1：使用 begin() 手动管理
const tx = manager.begin({ timeout: 5000 });
tx.addOperation(op1);
tx.addOperation(op2);
const result = await tx.execute();

// 方式 2：使用 run() 自动管理
const result = await manager.run((tx) => {
    tx.addOperation(op1);
    tx.addOperation(op2);
});
```

### 链式添加操作

```typescript
const result = await manager.run((tx) => {
    tx.addOperation(new CurrencyOperation({ ... }))
      .addOperation(new InventoryOperation({ ... }))
      .addOperation(new InventoryOperation({ ... }));
});
```

### 上下文数据

操作之间可以通过上下文共享数据：

```typescript
class CustomOperation extends BaseOperation<MyData, MyResult> {
    async execute(ctx: ITransactionContext): Promise<OperationResult<MyResult>> {
        // 读取之前操作设置的数据
        const previousResult = ctx.get<number>('previousValue');

        // 设置数据供后续操作使用
        ctx.set('myResult', { value: 123 });

        return this.success({ ... });
    }
}
```

## TransactionManager

事务管理器负责创建、执行和恢复事务。

### 配置选项

```typescript
interface TransactionManagerConfig {
    storage?: ITransactionStorage;    // 存储实例
    defaultTimeout?: number;          // 默认超时（毫秒）
    serverId?: string;                // 服务器 ID（分布式用）
    autoRecover?: boolean;            // 自动恢复未完成事务
}

const manager = new TransactionManager({
    storage: new RedisStorage({ client: redis }),
    defaultTimeout: 10000,
    serverId: 'server-1',
    autoRecover: true,
});
```

### 分布式锁

```typescript
// 获取锁
const token = await manager.acquireLock('player:123:inventory', 10000);

if (token) {
    try {
        // 执行操作
        await doSomething();
    } finally {
        // 释放锁
        await manager.releaseLock('player:123:inventory', token);
    }
}

// 或使用 withLock 简化
await manager.withLock('player:123:inventory', async () => {
    await doSomething();
}, 10000);
```

### 事务恢复

服务器重启时恢复未完成的事务：

```typescript
const manager = new TransactionManager({
    storage: new RedisStorage({ client: redis }),
    serverId: 'server-1',
});

// 恢复未完成的事务
const recoveredCount = await manager.recover();
console.log(`Recovered ${recoveredCount} transactions`);
```

## Saga 模式

事务系统采用 Saga 模式，每个操作必须实现 `execute` 和 `compensate` 方法：

```typescript
interface ITransactionOperation<TData, TResult> {
    readonly name: string;
    readonly data: TData;

    // 验证前置条件
    validate(ctx: ITransactionContext): Promise<boolean>;

    // 正向执行
    execute(ctx: ITransactionContext): Promise<OperationResult<TResult>>;

    // 补偿操作（回滚）
    compensate(ctx: ITransactionContext): Promise<void>;
}
```

### 执行流程

```
开始事务
    │
    ▼
┌─────────────────────┐
│  validate(op1)      │──失败──► 返回失败
└─────────────────────┘
    │成功
    ▼
┌─────────────────────┐
│  execute(op1)       │──失败──┐
└─────────────────────┘        │
    │成功                       │
    ▼                          │
┌─────────────────────┐        │
│  validate(op2)      │──失败──┤
└─────────────────────┘        │
    │成功                       │
    ▼                          │
┌─────────────────────┐        │
│  execute(op2)       │──失败──┤
└─────────────────────┘        │
    │成功                       ▼
    ▼                  ┌─────────────────────┐
提交事务               │  compensate(op1)    │
                       └─────────────────────┘
                               │
                               ▼
                       返回失败（已回滚）
```

### 自定义操作

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
        // 验证物品存在且可升级
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
        // 从存储获取物品
    }

    private async saveItem(ctx: ITransactionContext, item: any) {
        // 保存物品到存储
    }
}
```

## 事务结果

```typescript
interface TransactionResult<T = unknown> {
    success: boolean;           // 是否成功
    transactionId: string;      // 事务 ID
    results: OperationResult[]; // 各操作结果
    data?: T;                   // 最终数据
    error?: string;             // 错误信息
    duration: number;           // 执行时间（毫秒）
}

const result = await manager.run((tx) => { ... });

console.log(`Transaction ${result.transactionId}`);
console.log(`Success: ${result.success}`);
console.log(`Duration: ${result.duration}ms`);

if (!result.success) {
    console.log(`Error: ${result.error}`);
}
```

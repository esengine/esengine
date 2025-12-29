---
title: "事务系统 (Transaction)"
description: "游戏事务处理系统，支持商店购买、玩家交易、分布式事务"
---

`@esengine/transaction` 提供完整的游戏事务处理能力，基于 Saga 模式实现，支持商店购买、玩家交易、多步骤任务等场景，并提供 Redis/MongoDB 分布式事务支持。

## 概述

事务系统解决游戏中常见的数据一致性问题：

| 场景 | 问题 | 解决方案 |
|------|------|----------|
| 商店购买 | 扣款成功但物品未发放 | 原子事务，失败自动回滚 |
| 玩家交易 | 一方物品转移另一方未收到 | Saga 补偿机制 |
| 跨服操作 | 多服务器数据不一致 | 分布式锁 + 事务日志 |

## 安装

```bash
npm install @esengine/transaction
```

可选依赖（根据存储需求安装）：
```bash
npm install ioredis   # Redis 存储
npm install mongodb   # MongoDB 存储
```

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Transaction Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  TransactionManager         - 事务管理器，协调事务生命周期        │
│  TransactionContext         - 事务上下文，封装操作和状态          │
│  SagaOrchestrator           - 分布式 Saga 编排器                 │
├─────────────────────────────────────────────────────────────────┤
│                    Storage Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  MemoryStorage              - 内存存储（开发/测试）               │
│  RedisStorage               - Redis（分布式锁 + 缓存）            │
│  MongoStorage               - MongoDB（持久化日志）               │
├─────────────────────────────────────────────────────────────────┤
│                    Operation Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  CurrencyOperation          - 货币操作                           │
│  InventoryOperation         - 背包操作                           │
│  TradeOperation             - 交易操作                           │
└─────────────────────────────────────────────────────────────────┘
```

## 快速开始

### 基础用法

```typescript
import {
    TransactionManager,
    MemoryStorage,
    CurrencyOperation,
    InventoryOperation,
} from '@esengine/transaction';

// 创建事务管理器
const manager = new TransactionManager({
    storage: new MemoryStorage(),
    defaultTimeout: 10000,
});

// 执行事务
const result = await manager.run((tx) => {
    // 扣除金币
    tx.addOperation(new CurrencyOperation({
        type: 'deduct',
        playerId: 'player1',
        currency: 'gold',
        amount: 100,
    }));

    // 添加物品
    tx.addOperation(new InventoryOperation({
        type: 'add',
        playerId: 'player1',
        itemId: 'sword_001',
        quantity: 1,
    }));
});

if (result.success) {
    console.log('购买成功！');
} else {
    console.log('购买失败：', result.error);
}
```

### 玩家交易

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

### 使用 Redis 存储

```typescript
import Redis from 'ioredis';
import { TransactionManager, RedisStorage } from '@esengine/transaction';

const redis = new Redis('redis://localhost:6379');
const storage = new RedisStorage({ client: redis });

const manager = new TransactionManager({ storage });
```

### 使用 MongoDB 存储

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

## 与 Room 集成

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

## 文档导航

- [核心概念](/modules/transaction/core/) - 事务上下文、管理器、Saga 模式
- [存储层](/modules/transaction/storage/) - MemoryStorage、RedisStorage、MongoStorage
- [操作类](/modules/transaction/operations/) - 货币、背包、交易操作
- [分布式事务](/modules/transaction/distributed/) - Saga 编排器、跨服务器事务
- [API 参考](/modules/transaction/api/) - 完整 API 文档

## 服务令牌

用于依赖注入：

```typescript
import {
    TransactionManagerToken,
    TransactionStorageToken,
} from '@esengine/transaction';

const manager = services.get(TransactionManagerToken);
```

## 最佳实践

### 1. 操作粒度

```typescript
// ✅ 好：细粒度操作，便于回滚
tx.addOperation(new CurrencyOperation({ type: 'deduct', ... }));
tx.addOperation(new InventoryOperation({ type: 'add', ... }));

// ❌ 差：粗粒度操作，难以部分回滚
tx.addOperation(new ComplexPurchaseOperation({ ... }));
```

### 2. 超时设置

```typescript
// 简单操作：短超时
await manager.run(tx => { ... }, { timeout: 5000 });

// 复杂交易：长超时
await manager.run(tx => { ... }, { timeout: 30000 });

// 跨服务器：更长超时
await manager.run(tx => { ... }, { timeout: 60000, distributed: true });
```

### 3. 错误处理

```typescript
const result = await manager.run((tx) => { ... });

if (!result.success) {
    // 记录日志
    logger.error('Transaction failed', {
        transactionId: result.transactionId,
        error: result.error,
        duration: result.duration,
    });

    // 通知用户
    player.send('error', { message: getErrorMessage(result.error) });
}
```

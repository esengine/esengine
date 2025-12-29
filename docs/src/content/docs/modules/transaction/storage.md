---
title: "存储层"
description: "事务存储接口和实现：MemoryStorage、RedisStorage、MongoStorage"
---

## 存储接口

所有存储实现都需要实现 `ITransactionStorage` 接口：

```typescript
interface ITransactionStorage {
    // 生命周期
    close?(): Promise<void>;

    // 分布式锁
    acquireLock(key: string, ttl: number): Promise<string | null>;
    releaseLock(key: string, token: string): Promise<boolean>;

    // 事务日志
    saveTransaction(tx: TransactionLog): Promise<void>;
    getTransaction(id: string): Promise<TransactionLog | null>;
    updateTransactionState(id: string, state: TransactionState): Promise<void>;
    updateOperationState(txId: string, opIndex: number, state: string, error?: string): Promise<void>;
    getPendingTransactions(serverId?: string): Promise<TransactionLog[]>;
    deleteTransaction(id: string): Promise<void>;

    // 数据操作
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
}
```

## MemoryStorage

内存存储，适用于开发和测试环境。

```typescript
import { MemoryStorage } from '@esengine/transaction';

const storage = new MemoryStorage({
    maxTransactions: 1000,  // 最大事务日志数量
});

const manager = new TransactionManager({ storage });
```

### 特点

- ✅ 无需外部依赖
- ✅ 快速，适合开发调试
- ❌ 数据仅保存在内存中
- ❌ 不支持真正的分布式锁
- ❌ 服务重启后数据丢失

### 测试辅助

```typescript
// 清空所有数据
storage.clear();

// 获取事务数量
console.log(storage.transactionCount);
```

## RedisStorage

Redis 存储，适用于生产环境的分布式系统。使用工厂模式实现惰性连接。

```typescript
import Redis from 'ioredis';
import { RedisStorage } from '@esengine/transaction';

// 工厂模式：惰性连接，首次操作时才创建连接
const storage = new RedisStorage({
    factory: () => new Redis('redis://localhost:6379'),
    prefix: 'tx:',              // 键前缀
    transactionTTL: 86400,      // 事务日志过期时间（秒）
});

const manager = new TransactionManager({ storage });

// 使用后关闭连接
await storage.close();

// 或使用 await using 自动关闭 (TypeScript 5.2+)
await using storage = new RedisStorage({
    factory: () => new Redis('redis://localhost:6379')
});
// 作用域结束时自动关闭
```

### 特点

- ✅ 高性能分布式锁
- ✅ 快速读写
- ✅ 支持 TTL 自动过期
- ✅ 适合高并发场景
- ❌ 需要 Redis 服务器

### 分布式锁实现

使用 Redis `SET NX EX` 实现分布式锁：

```typescript
// 获取锁（原子操作）
SET tx:lock:player:123 <token> NX EX 10

// 释放锁（Lua 脚本保证原子性）
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

### 键结构

```
tx:lock:{key}           - 分布式锁
tx:tx:{id}              - 事务日志
tx:server:{id}:txs      - 服务器事务索引
tx:data:{key}           - 业务数据
```

## MongoStorage

MongoDB 存储，适用于需要持久化和复杂查询的场景。使用工厂模式实现惰性连接。

```typescript
import { MongoClient } from 'mongodb';
import { MongoStorage } from '@esengine/transaction';

// 工厂模式：惰性连接，首次操作时才创建连接
const storage = new MongoStorage({
    factory: async () => {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        return client;
    },
    database: 'game',
    transactionCollection: 'transactions',  // 事务日志集合
    dataCollection: 'transaction_data',     // 业务数据集合
    lockCollection: 'transaction_locks',    // 锁集合
});

// 创建索引（首次运行时执行）
await storage.ensureIndexes();

const manager = new TransactionManager({ storage });

// 使用后关闭连接
await storage.close();

// 或使用 await using 自动关闭 (TypeScript 5.2+)
await using storage = new MongoStorage({ ... });
```

### 特点

- ✅ 持久化存储
- ✅ 支持复杂查询
- ✅ 事务日志可追溯
- ✅ 适合需要审计的场景
- ❌ 相比 Redis 性能略低
- ❌ 需要 MongoDB 服务器

### 索引结构

```javascript
// transactions 集合
{ state: 1 }
{ 'metadata.serverId': 1 }
{ createdAt: 1 }

// transaction_locks 集合
{ expireAt: 1 }  // TTL 索引

// transaction_data 集合
{ expireAt: 1 }  // TTL 索引
```

### 分布式锁实现

使用 MongoDB 唯一索引实现分布式锁：

```typescript
// 获取锁
db.transaction_locks.insertOne({
    _id: 'player:123',
    token: '<token>',
    expireAt: new Date(Date.now() + 10000)
});

// 如果键已存在，检查是否过期
db.transaction_locks.updateOne(
    { _id: 'player:123', expireAt: { $lt: new Date() } },
    { $set: { token: '<token>', expireAt: new Date(Date.now() + 10000) } }
);
```

## 存储选择指南

| 场景 | 推荐存储 | 理由 |
|------|----------|------|
| 开发/测试 | MemoryStorage | 无依赖，快速启动 |
| 单机生产 | RedisStorage | 高性能，简单 |
| 分布式系统 | RedisStorage | 真正的分布式锁 |
| 需要审计 | MongoStorage | 持久化日志 |
| 混合需求 | Redis + Mongo | Redis 做锁，Mongo 做日志 |

## 自定义存储

实现 `ITransactionStorage` 接口创建自定义存储：

```typescript
import { ITransactionStorage, TransactionLog, TransactionState } from '@esengine/transaction';

class MyCustomStorage implements ITransactionStorage {
    async acquireLock(key: string, ttl: number): Promise<string | null> {
        // 实现分布式锁获取逻辑
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        // 实现分布式锁释放逻辑
    }

    async saveTransaction(tx: TransactionLog): Promise<void> {
        // 保存事务日志
    }

    // ... 实现其他方法
}
```

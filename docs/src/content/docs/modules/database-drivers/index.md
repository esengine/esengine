---
title: "数据库驱动"
description: "MongoDB、Redis 等数据库的连接管理和驱动封装"
---

`@esengine/database-drivers` 是 ESEngine 的数据库连接管理层，提供 MongoDB、Redis 等数据库的统一连接管理。

## 特性

- **连接池管理** - 自动管理连接池，优化资源使用
- **自动重连** - 连接断开时自动重连
- **事件通知** - 连接状态变化事件
- **类型解耦** - 简化接口，不依赖原生驱动类型
- **共享连接** - 单一连接可供多个模块共享

## 安装

```bash
npm install @esengine/database-drivers
```

**对等依赖：**
```bash
npm install mongodb    # MongoDB 支持
npm install ioredis    # Redis 支持
```

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│  @esengine/database-drivers (Layer 1)                           │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │   MongoConnection   │  │   RedisConnection   │               │
│  │   - 连接池管理      │  │   - 自动重连        │               │
│  │   - 自动重连        │  │   - Key 前缀        │               │
│  │   - 事件发射器      │  │   - 事件发射器      │               │
│  └──────────┬──────────┘  └─────────────────────┘               │
│             │                                                    │
│  ┌──────────▼──────────┐                                        │
│  │ IMongoCollection<T> │  ← 类型安全接口                         │
│  │ (适配器模式)        │    与 mongodb 类型解耦                   │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────┐  ┌───────────────────────┐
│  @esengine/database   │  │ @esengine/transaction │
│  (仓库模式)           │  │ (分布式事务)          │
└───────────────────────┘  └───────────────────────┘
```

## 快速开始

### MongoDB 连接

```typescript
import { createMongoConnection } from '@esengine/database-drivers'

// 创建连接
const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game',
    pool: {
        minSize: 5,
        maxSize: 20
    },
    autoReconnect: true
})

// 监听事件
mongo.on('connected', () => console.log('MongoDB 已连接'))
mongo.on('disconnected', () => console.log('MongoDB 已断开'))
mongo.on('error', (e) => console.error('错误:', e.error))

// 建立连接
await mongo.connect()

// 使用集合
const users = mongo.collection<User>('users')
await users.insertOne({ name: 'John', score: 100 })

const user = await users.findOne({ name: 'John' })

// 完成后断开连接
await mongo.disconnect()
```

### Redis 连接

```typescript
import { createRedisConnection } from '@esengine/database-drivers'

const redis = createRedisConnection({
    host: 'localhost',
    port: 6379,
    keyPrefix: 'game:',
    autoReconnect: true
})

await redis.connect()

// 基本操作
await redis.set('session:123', 'data', 3600)  // 带 TTL
const value = await redis.get('session:123')

await redis.disconnect()
```

## 服务容器集成

```typescript
import { ServiceContainer } from '@esengine/ecs-framework'
import {
    createMongoConnection,
    MongoConnectionToken,
    RedisConnectionToken
} from '@esengine/database-drivers'

const services = new ServiceContainer()

// 注册连接
const mongo = createMongoConnection({ uri: '...', database: 'game' })
await mongo.connect()
services.register(MongoConnectionToken, mongo)

// 在其他模块中获取
const connection = services.get(MongoConnectionToken)
const users = connection.collection('users')
```

## 文档

- [MongoDB 连接](/modules/database-drivers/mongo/) - MongoDB 连接详细配置
- [Redis 连接](/modules/database-drivers/redis/) - Redis 连接详细配置
- [服务令牌](/modules/database-drivers/tokens/) - 依赖注入集成

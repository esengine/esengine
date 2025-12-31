---
title: "Redis 连接"
description: "Redis 连接管理、自动重连、键前缀"
---

## 配置选项

```typescript
interface RedisConnectionConfig {
    /** Redis 主机 */
    host?: string

    /** Redis 端口 */
    port?: number

    /** 认证密码 */
    password?: string

    /** 数据库编号 */
    db?: number

    /** 键前缀 */
    keyPrefix?: string

    /** 是否自动重连（默认 true） */
    autoReconnect?: boolean

    /** 重连间隔（毫秒，默认 5000） */
    reconnectInterval?: number

    /** 最大重连次数（默认 10） */
    maxReconnectAttempts?: number
}
```

## 完整示例

```typescript
import { createRedisConnection, RedisConnectionToken } from '@esengine/database-drivers'

const redis = createRedisConnection({
    host: 'localhost',
    port: 6379,
    password: 'your-password',
    db: 0,
    keyPrefix: 'game:',
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
})

// 事件监听
redis.on('connected', () => {
    console.log('Redis 已连接')
})

redis.on('disconnected', () => {
    console.log('Redis 已断开')
})

redis.on('error', (event) => {
    console.error('Redis 错误:', event.error)
})

// 连接
await redis.connect()

// 检查状态
console.log('已连接:', redis.isConnected())
console.log('Ping:', await redis.ping())
```

## IRedisConnection 接口

```typescript
interface IRedisConnection {
    /** 连接 ID */
    readonly id: string

    /** 连接状态 */
    readonly state: ConnectionState

    /** 建立连接 */
    connect(): Promise<void>

    /** 断开连接 */
    disconnect(): Promise<void>

    /** 检查是否已连接 */
    isConnected(): boolean

    /** 测试连接 */
    ping(): Promise<boolean>

    /** 获取值 */
    get(key: string): Promise<string | null>

    /** 设置值（可选 TTL，单位秒） */
    set(key: string, value: string, ttl?: number): Promise<void>

    /** 删除键 */
    del(key: string): Promise<boolean>

    /** 检查键是否存在 */
    exists(key: string): Promise<boolean>

    /** 设置过期时间（秒） */
    expire(key: string, seconds: number): Promise<boolean>

    /** 获取剩余过期时间（秒） */
    ttl(key: string): Promise<number>

    /** 获取原生客户端（高级用法） */
    getNativeClient(): Redis
}
```

## 使用示例

### 基本操作

```typescript
// 设置值
await redis.set('user:1:name', 'John')

// 设置带过期时间的值（1 小时）
await redis.set('session:abc123', 'user-data', 3600)

// 获取值
const name = await redis.get('user:1:name')

// 检查键是否存在
const exists = await redis.exists('user:1:name')

// 删除键
await redis.del('user:1:name')

// 获取剩余过期时间
const ttl = await redis.ttl('session:abc123')
```

### 键前缀

配置 `keyPrefix` 后，所有操作自动添加前缀：

```typescript
const redis = createRedisConnection({
    host: 'localhost',
    keyPrefix: 'game:'
})

// 实际操作的键是 'game:user:1'
await redis.set('user:1', 'data')

// 实际查询的键是 'game:user:1'
const data = await redis.get('user:1')
```

### 高级操作

使用原生客户端进行高级操作：

```typescript
const client = redis.getNativeClient()

// 使用 Pipeline
const pipeline = client.pipeline()
pipeline.set('key1', 'value1')
pipeline.set('key2', 'value2')
pipeline.set('key3', 'value3')
await pipeline.exec()

// 使用事务
const multi = client.multi()
multi.incr('counter')
multi.get('counter')
const results = await multi.exec()

// 使用 Lua 脚本
const result = await client.eval(
    `return redis.call('get', KEYS[1])`,
    1,
    'mykey'
)
```

## 与事务系统集成

```typescript
import { createRedisConnection } from '@esengine/database-drivers'
import { RedisStorage, TransactionManager } from '@esengine/transaction'

const redis = createRedisConnection({
    host: 'localhost',
    port: 6379,
    keyPrefix: 'tx:'
})
await redis.connect()

// 创建事务存储
const storage = new RedisStorage({
    factory: () => redis.getNativeClient(),
    prefix: 'tx:'
})

const txManager = new TransactionManager({ storage })
```

## 连接状态

```typescript
type ConnectionState =
    | 'disconnected'  // 未连接
    | 'connecting'    // 连接中
    | 'connected'     // 已连接
    | 'disconnecting' // 断开中
    | 'error'         // 错误状态
```

## 事件

| 事件 | 描述 |
|------|------|
| `connected` | 连接成功 |
| `disconnected` | 连接断开 |
| `reconnecting` | 正在重连 |
| `reconnected` | 重连成功 |
| `error` | 发生错误 |

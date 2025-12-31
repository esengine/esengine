---
title: "MongoDB 连接"
description: "MongoDB 连接管理、连接池、自动重连"
---

## 配置选项

```typescript
interface MongoConnectionConfig {
    /** MongoDB 连接 URI */
    uri: string

    /** 数据库名称 */
    database: string

    /** 连接池配置 */
    pool?: {
        minSize?: number      // 最小连接数
        maxSize?: number      // 最大连接数
        acquireTimeout?: number  // 获取连接超时（毫秒）
        maxLifetime?: number     // 连接最大生命周期（毫秒）
    }

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
import { createMongoConnection, MongoConnectionToken } from '@esengine/database-drivers'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game',
    pool: {
        minSize: 5,
        maxSize: 20,
        acquireTimeout: 5000,
        maxLifetime: 300000
    },
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
})

// 事件监听
mongo.on('connected', () => {
    console.log('MongoDB 已连接')
})

mongo.on('disconnected', () => {
    console.log('MongoDB 已断开')
})

mongo.on('reconnecting', () => {
    console.log('MongoDB 正在重连...')
})

mongo.on('reconnected', () => {
    console.log('MongoDB 重连成功')
})

mongo.on('error', (event) => {
    console.error('MongoDB 错误:', event.error)
})

// 连接
await mongo.connect()

// 检查状态
console.log('已连接:', mongo.isConnected())
console.log('Ping:', await mongo.ping())
```

## IMongoConnection 接口

```typescript
interface IMongoConnection {
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

    /** 获取类型化集合 */
    collection<T extends object>(name: string): IMongoCollection<T>

    /** 获取数据库接口 */
    getDatabase(): IMongoDatabase

    /** 获取原生客户端（高级用法） */
    getNativeClient(): MongoClientType

    /** 获取原生数据库（高级用法） */
    getNativeDatabase(): Db
}
```

## IMongoCollection 接口

类型安全的集合接口，与原生 MongoDB 类型解耦：

```typescript
interface IMongoCollection<T extends object> {
    readonly name: string

    // 查询
    findOne(filter: object, options?: FindOptions): Promise<T | null>
    find(filter: object, options?: FindOptions): Promise<T[]>
    countDocuments(filter?: object): Promise<number>

    // 插入
    insertOne(doc: T): Promise<InsertOneResult>
    insertMany(docs: T[]): Promise<InsertManyResult>

    // 更新
    updateOne(filter: object, update: object): Promise<UpdateResult>
    updateMany(filter: object, update: object): Promise<UpdateResult>
    findOneAndUpdate(
        filter: object,
        update: object,
        options?: FindOneAndUpdateOptions
    ): Promise<T | null>

    // 删除
    deleteOne(filter: object): Promise<DeleteResult>
    deleteMany(filter: object): Promise<DeleteResult>

    // 索引
    createIndex(
        spec: Record<string, 1 | -1>,
        options?: IndexOptions
    ): Promise<string>
}
```

## 使用示例

### 基本 CRUD

```typescript
interface User {
    id: string
    name: string
    email: string
    score: number
}

const users = mongo.collection<User>('users')

// 插入
await users.insertOne({
    id: '1',
    name: 'John',
    email: 'john@example.com',
    score: 100
})

// 查询
const user = await users.findOne({ name: 'John' })

const topUsers = await users.find(
    { score: { $gte: 100 } },
    { sort: { score: -1 }, limit: 10 }
)

// 更新
await users.updateOne(
    { id: '1' },
    { $inc: { score: 10 } }
)

// 删除
await users.deleteOne({ id: '1' })
```

### 批量操作

```typescript
// 批量插入
await users.insertMany([
    { id: '1', name: 'Alice', email: 'alice@example.com', score: 100 },
    { id: '2', name: 'Bob', email: 'bob@example.com', score: 200 },
    { id: '3', name: 'Carol', email: 'carol@example.com', score: 150 }
])

// 批量更新
await users.updateMany(
    { score: { $lt: 100 } },
    { $set: { status: 'inactive' } }
)

// 批量删除
await users.deleteMany({ status: 'inactive' })
```

### 索引管理

```typescript
// 创建索引
await users.createIndex({ email: 1 }, { unique: true })
await users.createIndex({ score: -1 })
await users.createIndex({ name: 1, score: -1 })
```

## 与其他模块集成

### 与 @esengine/database 集成

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { UserRepository, createRepository } from '@esengine/database'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// 使用 UserRepository
const userRepo = new UserRepository(mongo)
await userRepo.register({ username: 'john', password: '123456' })

// 使用通用仓库
const playerRepo = createRepository<Player>(mongo, 'players')
```

### 与 @esengine/transaction 集成

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { createMongoStorage, TransactionManager } from '@esengine/transaction'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// 创建事务存储（共享连接）
const storage = createMongoStorage(mongo)
await storage.ensureIndexes()

const txManager = new TransactionManager({ storage })
```

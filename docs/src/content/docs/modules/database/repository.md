---
title: "Repository API"
description: "泛型仓库接口，CRUD 操作、分页、软删除"
---

## 创建仓库

### 使用工厂函数

```typescript
import { createRepository } from '@esengine/database'

const playerRepo = createRepository<Player>(mongo, 'players')

// 启用软删除
const playerRepo = createRepository<Player>(mongo, 'players', true)
```

### 继承 Repository

```typescript
import { Repository, BaseEntity } from '@esengine/database'

interface Player extends BaseEntity {
    name: string
    score: number
}

class PlayerRepository extends Repository<Player> {
    constructor(connection: IMongoConnection) {
        super(connection, 'players', false)  // 第三个参数：启用软删除
    }

    // 添加自定义方法
    async findTopPlayers(limit: number): Promise<Player[]> {
        return this.findMany({
            sort: { score: 'desc' },
            limit
        })
    }
}
```

## BaseEntity 接口

所有实体必须继承 `BaseEntity`：

```typescript
interface BaseEntity {
    id: string
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date  // 软删除时使用
}
```

## 查询方法

### findById

```typescript
const player = await repo.findById('player-123')
```

### findOne

```typescript
const player = await repo.findOne({
    where: { name: 'John' }
})

const topPlayer = await repo.findOne({
    sort: { score: 'desc' }
})
```

### findMany

```typescript
// 简单查询
const players = await repo.findMany({
    where: { rank: 'gold' }
})

// 复杂查询
const players = await repo.findMany({
    where: {
        score: { $gte: 100 },
        rank: { $in: ['gold', 'platinum'] }
    },
    sort: { score: 'desc', name: 'asc' },
    limit: 10,
    offset: 0
})
```

### findPaginated

```typescript
const result = await repo.findPaginated(
    { page: 1, pageSize: 20 },
    {
        where: { rank: 'gold' },
        sort: { score: 'desc' }
    }
)

console.log(result.data)        // Player[]
console.log(result.total)       // 总数量
console.log(result.totalPages)  // 总页数
console.log(result.hasNext)     // 是否有下一页
console.log(result.hasPrev)     // 是否有上一页
```

### count

```typescript
const count = await repo.count({
    where: { rank: 'gold' }
})
```

### exists

```typescript
const exists = await repo.exists({
    where: { email: 'john@example.com' }
})
```

## 创建方法

### create

```typescript
const player = await repo.create({
    name: 'John',
    score: 0
})
// 自动生成 id, createdAt, updatedAt
```

### createMany

```typescript
const players = await repo.createMany([
    { name: 'Alice', score: 100 },
    { name: 'Bob', score: 200 },
    { name: 'Carol', score: 150 }
])
```

## 更新方法

### update

```typescript
const updated = await repo.update('player-123', {
    score: 200,
    rank: 'gold'
})
// 自动更新 updatedAt
```

## 删除方法

### delete

```typescript
// 普通删除
await repo.delete('player-123')

// 软删除（如果启用）
// 实际是设置 deletedAt 字段
```

### deleteMany

```typescript
const count = await repo.deleteMany({
    where: { score: { $lt: 10 } }
})
```

## 软删除

### 启用软删除

```typescript
const repo = createRepository<Player>(mongo, 'players', true)
```

### 查询行为

```typescript
// 默认排除软删除记录
const players = await repo.findMany()

// 包含软删除记录
const allPlayers = await repo.findMany({
    includeSoftDeleted: true
})
```

### 恢复记录

```typescript
await repo.restore('player-123')
```

## QueryOptions

```typescript
interface QueryOptions<T> {
    /** 查询条件 */
    where?: WhereCondition<T>

    /** 排序 */
    sort?: Partial<Record<keyof T, 'asc' | 'desc'>>

    /** 限制数量 */
    limit?: number

    /** 偏移量 */
    offset?: number

    /** 包含软删除记录（仅在启用软删除时有效） */
    includeSoftDeleted?: boolean
}
```

## PaginatedResult

```typescript
interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}
```

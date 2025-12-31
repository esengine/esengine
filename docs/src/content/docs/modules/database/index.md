---
title: "数据库仓库"
description: "Repository 模式的数据库操作层，支持 CRUD、分页、软删除"
---

`@esengine/database` 是 ESEngine 的数据库操作层，基于 Repository 模式提供类型安全的 CRUD 操作。

## 特性

- **Repository 模式** - 泛型 CRUD 操作，类型安全
- **分页查询** - 内置分页支持
- **软删除** - 可选的软删除与恢复
- **用户管理** - 开箱即用的 UserRepository
- **密码安全** - 使用 scrypt 的密码哈希工具

## 安装

```bash
npm install @esengine/database @esengine/database-drivers
```

## 快速开始

### 基本仓库

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { Repository, createRepository } from '@esengine/database'

// 定义实体
interface Player {
    id: string
    name: string
    score: number
    createdAt: Date
    updatedAt: Date
}

// 创建连接
const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

// 创建仓库
const playerRepo = createRepository<Player>(mongo, 'players')

// CRUD 操作
const player = await playerRepo.create({
    name: 'John',
    score: 0
})

const found = await playerRepo.findById(player.id)

await playerRepo.update(player.id, { score: 100 })

await playerRepo.delete(player.id)
```

### 自定义仓库

```typescript
import { Repository, BaseEntity } from '@esengine/database'
import type { IMongoConnection } from '@esengine/database-drivers'

interface Player extends BaseEntity {
    name: string
    score: number
    rank?: string
}

class PlayerRepository extends Repository<Player> {
    constructor(connection: IMongoConnection) {
        super(connection, 'players')
    }

    async findTopPlayers(limit: number = 10): Promise<Player[]> {
        return this.findMany({
            sort: { score: 'desc' },
            limit
        })
    }

    async findByRank(rank: string): Promise<Player[]> {
        return this.findMany({
            where: { rank }
        })
    }

    async incrementScore(playerId: string, amount: number): Promise<Player | null> {
        const player = await this.findById(playerId)
        if (!player) return null
        return this.update(playerId, { score: player.score + amount })
    }
}

// 使用
const playerRepo = new PlayerRepository(mongo)
const topPlayers = await playerRepo.findTopPlayers(5)
```

### 用户仓库

```typescript
import { UserRepository } from '@esengine/database'

const userRepo = new UserRepository(mongo)

// 注册新用户
const user = await userRepo.register({
    username: 'john',
    password: 'securePassword123',
    email: 'john@example.com'
})

// 认证
const authenticated = await userRepo.authenticate('john', 'securePassword123')
if (authenticated) {
    console.log('登录成功:', authenticated.username)
}

// 修改密码
await userRepo.changePassword(user.id, 'securePassword123', 'newPassword456')

// 角色管理
await userRepo.addRole(user.id, 'admin')
await userRepo.removeRole(user.id, 'admin')

// 查询用户
const admins = await userRepo.findByRole('admin')
const john = await userRepo.findByUsername('john')
```

## 文档

- [仓库 API](/modules/database/repository/) - Repository 详细 API
- [用户管理](/modules/database/user/) - UserRepository 用法
- [查询语法](/modules/database/query/) - 查询条件语法

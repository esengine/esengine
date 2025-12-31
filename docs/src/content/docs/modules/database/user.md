---
title: "用户管理"
description: "UserRepository 用户注册、认证、角色管理"
---

## 概述

`UserRepository` 提供开箱即用的用户管理功能：

- 用户注册与认证
- 密码哈希（使用 scrypt）
- 角色管理
- 账户状态管理

## 快速开始

```typescript
import { createMongoConnection } from '@esengine/database-drivers'
import { UserRepository } from '@esengine/database'

const mongo = createMongoConnection({
    uri: 'mongodb://localhost:27017',
    database: 'game'
})
await mongo.connect()

const userRepo = new UserRepository(mongo)
```

## 用户注册

```typescript
const user = await userRepo.register({
    username: 'john',
    password: 'securePassword123',
    email: 'john@example.com',      // 可选
    displayName: 'John Doe',         // 可选
    roles: ['player']                // 可选，默认 []
})

console.log(user)
// {
//   id: 'uuid-...',
//   username: 'john',
//   email: 'john@example.com',
//   displayName: 'John Doe',
//   roles: ['player'],
//   status: 'active',
//   createdAt: Date,
//   updatedAt: Date
// }
```

**注意**：`register` 返回的 `SafeUser` 不包含密码哈希。

## 用户认证

```typescript
const user = await userRepo.authenticate('john', 'securePassword123')

if (user) {
    console.log('登录成功:', user.username)
} else {
    console.log('用户名或密码错误')
}
```

## 密码管理

### 修改密码

```typescript
const success = await userRepo.changePassword(
    userId,
    'oldPassword123',
    'newPassword456'
)

if (success) {
    console.log('密码修改成功')
} else {
    console.log('原密码错误')
}
```

### 重置密码

```typescript
// 管理员直接重置密码
const success = await userRepo.resetPassword(userId, 'newPassword123')
```

## 角色管理

### 添加角色

```typescript
await userRepo.addRole(userId, 'admin')
await userRepo.addRole(userId, 'moderator')
```

### 移除角色

```typescript
await userRepo.removeRole(userId, 'moderator')
```

### 查询角色

```typescript
// 查找所有管理员
const admins = await userRepo.findByRole('admin')

// 检查用户是否有某角色
const user = await userRepo.findById(userId)
const isAdmin = user?.roles.includes('admin')
```

## 查询用户

### 按用户名查找

```typescript
const user = await userRepo.findByUsername('john')
```

### 按邮箱查找

```typescript
const user = await userRepo.findByEmail('john@example.com')
```

### 按角色查找

```typescript
const admins = await userRepo.findByRole('admin')
```

### 使用继承的方法

```typescript
// 分页查询
const result = await userRepo.findPaginated(
    { page: 1, pageSize: 20 },
    {
        where: { status: 'active' },
        sort: { createdAt: 'desc' }
    }
)

// 复杂查询
const users = await userRepo.findMany({
    where: {
        status: 'active',
        roles: { $in: ['admin', 'moderator'] }
    }
})
```

## 账户状态

```typescript
type UserStatus = 'active' | 'inactive' | 'banned' | 'suspended'
```

### 更新状态

```typescript
await userRepo.update(userId, { status: 'banned' })
```

### 查询特定状态

```typescript
const activeUsers = await userRepo.findMany({
    where: { status: 'active' }
})

const bannedUsers = await userRepo.findMany({
    where: { status: 'banned' }
})
```

## 类型定义

### UserEntity

```typescript
interface UserEntity extends BaseEntity {
    username: string
    passwordHash: string
    email?: string
    displayName?: string
    roles: string[]
    status: UserStatus
    lastLoginAt?: Date
}
```

### SafeUser

```typescript
type SafeUser = Omit<UserEntity, 'passwordHash'>
```

### CreateUserParams

```typescript
interface CreateUserParams {
    username: string
    password: string
    email?: string
    displayName?: string
    roles?: string[]
}
```

## 密码工具

独立的密码工具函数：

```typescript
import { hashPassword, verifyPassword } from '@esengine/database'

// 哈希密码
const hash = await hashPassword('myPassword123')

// 验证密码
const isValid = await verifyPassword('myPassword123', hash)
```

### 安全说明

- 使用 Node.js 内置的 `scrypt` 算法
- 自动生成随机盐值
- 默认使用安全的迭代参数
- 哈希格式：`salt:hash`（均为 hex 编码）

## 扩展 UserRepository

```typescript
import { UserRepository, UserEntity } from '@esengine/database'

interface GameUser extends UserEntity {
    level: number
    experience: number
    coins: number
}

class GameUserRepository extends UserRepository {
    // 重写集合名
    constructor(connection: IMongoConnection) {
        super(connection, 'game_users')
    }

    // 添加游戏相关方法
    async addExperience(userId: string, amount: number): Promise<GameUser | null> {
        const user = await this.findById(userId) as GameUser | null
        if (!user) return null

        const newExp = user.experience + amount
        const newLevel = Math.floor(newExp / 1000) + 1

        return this.update(userId, {
            experience: newExp,
            level: newLevel
        }) as Promise<GameUser | null>
    }

    async findTopPlayers(limit: number = 10): Promise<GameUser[]> {
        return this.findMany({
            sort: { level: 'desc', experience: 'desc' },
            limit
        }) as Promise<GameUser[]>
    }
}
```

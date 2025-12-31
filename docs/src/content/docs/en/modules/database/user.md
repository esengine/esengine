---
title: "User Management"
description: "UserRepository for user registration, authentication, and role management"
---

## Overview

`UserRepository` provides out-of-the-box user management features:

- User registration and authentication
- Password hashing (using scrypt)
- Role management
- Account status management

## Quick Start

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

## User Registration

```typescript
const user = await userRepo.register({
    username: 'john',
    password: 'securePassword123',
    email: 'john@example.com',      // Optional
    displayName: 'John Doe',         // Optional
    roles: ['player']                // Optional, defaults to []
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

**Note**: `register` returns a `SafeUser` which excludes the password hash.

## User Authentication

```typescript
const user = await userRepo.authenticate('john', 'securePassword123')

if (user) {
    console.log('Login successful:', user.username)
} else {
    console.log('Invalid username or password')
}
```

## Password Management

### Change Password

```typescript
const success = await userRepo.changePassword(
    userId,
    'oldPassword123',
    'newPassword456'
)

if (success) {
    console.log('Password changed successfully')
} else {
    console.log('Invalid current password')
}
```

### Reset Password

```typescript
// Admin directly resets password
const success = await userRepo.resetPassword(userId, 'newPassword123')
```

## Role Management

### Add Role

```typescript
await userRepo.addRole(userId, 'admin')
await userRepo.addRole(userId, 'moderator')
```

### Remove Role

```typescript
await userRepo.removeRole(userId, 'moderator')
```

### Query Roles

```typescript
// Find all admins
const admins = await userRepo.findByRole('admin')

// Check if user has a role
const user = await userRepo.findById(userId)
const isAdmin = user?.roles.includes('admin')
```

## Querying Users

### Find by Username

```typescript
const user = await userRepo.findByUsername('john')
```

### Find by Email

```typescript
const user = await userRepo.findByEmail('john@example.com')
```

### Find by Role

```typescript
const admins = await userRepo.findByRole('admin')
```

### Using Inherited Methods

```typescript
// Paginated query
const result = await userRepo.findPaginated(
    { page: 1, pageSize: 20 },
    {
        where: { status: 'active' },
        sort: { createdAt: 'desc' }
    }
)

// Complex query
const users = await userRepo.findMany({
    where: {
        status: 'active',
        roles: { $in: ['admin', 'moderator'] }
    }
})
```

## Account Status

```typescript
type UserStatus = 'active' | 'inactive' | 'banned' | 'suspended'
```

### Update Status

```typescript
await userRepo.update(userId, { status: 'banned' })
```

### Query by Status

```typescript
const activeUsers = await userRepo.findMany({
    where: { status: 'active' }
})

const bannedUsers = await userRepo.findMany({
    where: { status: 'banned' }
})
```

## Type Definitions

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

## Password Utilities

Standalone password utility functions:

```typescript
import { hashPassword, verifyPassword } from '@esengine/database'

// Hash password
const hash = await hashPassword('myPassword123')

// Verify password
const isValid = await verifyPassword('myPassword123', hash)
```

### Security Notes

- Uses Node.js built-in `scrypt` algorithm
- Automatically generates random salt
- Uses secure iteration parameters by default
- Hash format: `salt:hash` (both hex encoded)

## Extending UserRepository

```typescript
import { UserRepository, UserEntity } from '@esengine/database'

interface GameUser extends UserEntity {
    level: number
    experience: number
    coins: number
}

class GameUserRepository extends UserRepository {
    // Override collection name
    constructor(connection: IMongoConnection) {
        super(connection, 'game_users')
    }

    // Add game-related methods
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

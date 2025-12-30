---
title: "认证系统"
description: "使用 JWT 和 Session 提供者为游戏服务器添加认证功能"
---

`@esengine/server` 包内置了可插拔的认证系统，支持 JWT、会话认证和自定义提供者。

## 安装

认证功能已包含在 server 包中：

```bash
npm install @esengine/server jsonwebtoken
```

> 注意：`jsonwebtoken` 是可选的 peer dependency，仅在使用 JWT 认证时需要。

## 快速开始

### JWT 认证

```typescript
import { createServer } from '@esengine/server'
import { withAuth, createJwtAuthProvider, withRoomAuth, requireAuth } from '@esengine/server/auth'

// 创建 JWT 提供者
const jwtProvider = createJwtAuthProvider({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600, // 1 小时
})

// 用认证包装服务器
const server = withAuth(await createServer({ port: 3000 }), {
    provider: jwtProvider,
    extractCredentials: (req) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        return url.searchParams.get('token')
    },
})

// 定义需要认证的房间
class GameRoom extends withRoomAuth(Room, { requireAuth: true }) {
    onJoin(player) {
        console.log(`${player.user?.name} 加入了游戏！`)
    }
}

server.define('game', GameRoom)
await server.start()
```

## 认证提供者

### JWT 提供者

使用 JSON Web Tokens 实现无状态认证：

```typescript
import { createJwtAuthProvider } from '@esengine/server/auth'

const jwtProvider = createJwtAuthProvider({
    // 必填：密钥
    secret: 'your-secret-key',

    // 可选：算法（默认：HS256）
    algorithm: 'HS256',

    // 可选：过期时间（秒，默认：3600）
    expiresIn: 3600,

    // 可选：签发者（用于验证）
    issuer: 'my-game-server',

    // 可选：受众（用于验证）
    audience: 'my-game-client',

    // 可选：自定义用户提取
    getUser: async (payload) => {
        // 从数据库获取用户
        return await db.users.findById(payload.sub)
    },
})

// 签发令牌（用于登录接口）
const token = jwtProvider.sign({
    sub: user.id,
    name: user.name,
    roles: ['player'],
})

// 解码但不验证（用于调试）
const payload = jwtProvider.decode(token)
```

### 自定义提供者

你可以通过实现 `IAuthProvider` 接口来创建自定义认证提供者，以集成任何认证系统（如 OAuth、LDAP、自定义数据库认证等）。

#### IAuthProvider 接口

```typescript
interface IAuthProvider<TUser = unknown, TCredentials = unknown> {
    /** 提供者名称 */
    readonly name: string;

    /** 验证凭证 */
    verify(credentials: TCredentials): Promise<AuthResult<TUser>>;

    /** 刷新令牌（可选） */
    refresh?(token: string): Promise<AuthResult<TUser>>;

    /** 撤销令牌（可选） */
    revoke?(token: string): Promise<boolean>;
}

interface AuthResult<TUser> {
    success: boolean;
    user?: TUser;
    error?: string;
    errorCode?: AuthErrorCode;
    token?: string;
    expiresAt?: number;
}

type AuthErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'EXPIRED_TOKEN'
    | 'INVALID_TOKEN'
    | 'USER_NOT_FOUND'
    | 'ACCOUNT_DISABLED'
    | 'RATE_LIMITED'
    | 'INSUFFICIENT_PERMISSIONS';
```

#### 自定义提供者示例

**示例 1：数据库密码认证**

```typescript
import type { IAuthProvider, AuthResult } from '@esengine/server/auth'

interface User {
    id: string
    username: string
    roles: string[]
}

interface PasswordCredentials {
    username: string
    password: string
}

class DatabaseAuthProvider implements IAuthProvider<User, PasswordCredentials> {
    readonly name = 'database'

    async verify(credentials: PasswordCredentials): Promise<AuthResult<User>> {
        const { username, password } = credentials

        // 从数据库查询用户
        const user = await db.users.findByUsername(username)
        if (!user) {
            return {
                success: false,
                error: '用户不存在',
                errorCode: 'USER_NOT_FOUND'
            }
        }

        // 验证密码（使用 bcrypt 等库）
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
            return {
                success: false,
                error: '密码错误',
                errorCode: 'INVALID_CREDENTIALS'
            }
        }

        // 检查账号状态
        if (user.disabled) {
            return {
                success: false,
                error: '账号已禁用',
                errorCode: 'ACCOUNT_DISABLED'
            }
        }

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                roles: user.roles
            }
        }
    }
}
```

**示例 2：OAuth/第三方认证**

```typescript
import type { IAuthProvider, AuthResult } from '@esengine/server/auth'

interface OAuthUser {
    id: string
    email: string
    name: string
    provider: string
    roles: string[]
}

interface OAuthCredentials {
    provider: 'google' | 'github' | 'discord'
    accessToken: string
}

class OAuthProvider implements IAuthProvider<OAuthUser, OAuthCredentials> {
    readonly name = 'oauth'

    async verify(credentials: OAuthCredentials): Promise<AuthResult<OAuthUser>> {
        const { provider, accessToken } = credentials

        try {
            // 根据提供商验证 token
            const profile = await this.fetchUserProfile(provider, accessToken)

            // 查找或创建本地用户
            let user = await db.users.findByOAuth(provider, profile.id)
            if (!user) {
                user = await db.users.create({
                    oauthProvider: provider,
                    oauthId: profile.id,
                    email: profile.email,
                    name: profile.name,
                    roles: ['player']
                })
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    provider,
                    roles: user.roles
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'OAuth 验证失败',
                errorCode: 'INVALID_TOKEN'
            }
        }
    }

    private async fetchUserProfile(provider: string, token: string) {
        switch (provider) {
            case 'google':
                return fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json())
            case 'github':
                return fetch('https://api.github.com/user', {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json())
            // 其他提供商...
            default:
                throw new Error(`不支持的提供商: ${provider}`)
        }
    }
}
```

**示例 3：API Key 认证**

```typescript
import type { IAuthProvider, AuthResult } from '@esengine/server/auth'

interface ApiUser {
    id: string
    name: string
    roles: string[]
    rateLimit: number
}

class ApiKeyAuthProvider implements IAuthProvider<ApiUser, string> {
    readonly name = 'api-key'

    private revokedKeys = new Set<string>()

    async verify(apiKey: string): Promise<AuthResult<ApiUser>> {
        if (!apiKey || !apiKey.startsWith('sk_')) {
            return {
                success: false,
                error: 'API Key 格式无效',
                errorCode: 'INVALID_TOKEN'
            }
        }

        if (this.revokedKeys.has(apiKey)) {
            return {
                success: false,
                error: 'API Key 已被撤销',
                errorCode: 'INVALID_TOKEN'
            }
        }

        // 从数据库查询 API Key
        const keyData = await db.apiKeys.findByKey(apiKey)
        if (!keyData) {
            return {
                success: false,
                error: 'API Key 不存在',
                errorCode: 'INVALID_CREDENTIALS'
            }
        }

        // 检查过期
        if (keyData.expiresAt && keyData.expiresAt < Date.now()) {
            return {
                success: false,
                error: 'API Key 已过期',
                errorCode: 'EXPIRED_TOKEN'
            }
        }

        return {
            success: true,
            user: {
                id: keyData.userId,
                name: keyData.name,
                roles: keyData.roles,
                rateLimit: keyData.rateLimit
            },
            expiresAt: keyData.expiresAt
        }
    }

    async revoke(apiKey: string): Promise<boolean> {
        this.revokedKeys.add(apiKey)
        await db.apiKeys.revoke(apiKey)
        return true
    }
}
```

#### 使用自定义提供者

```typescript
import { createServer } from '@esengine/server'
import { withAuth } from '@esengine/server/auth'

// 创建自定义提供者
const dbAuthProvider = new DatabaseAuthProvider()

// 或使用 OAuth 提供者
const oauthProvider = new OAuthProvider()

// 使用自定义提供者
const server = withAuth(await createServer({ port: 3000 }), {
    provider: dbAuthProvider, // 或 oauthProvider

    // 从 WebSocket 连接请求中提取凭证
    extractCredentials: (req) => {
        const url = new URL(req.url, 'http://localhost')

        // 对于数据库认证：从查询参数获取
        const username = url.searchParams.get('username')
        const password = url.searchParams.get('password')
        if (username && password) {
            return { username, password }
        }

        // 对于 OAuth：从 token 参数获取
        const provider = url.searchParams.get('provider')
        const accessToken = url.searchParams.get('access_token')
        if (provider && accessToken) {
            return { provider, accessToken }
        }

        // 对于 API Key：从请求头获取
        const apiKey = req.headers['x-api-key']
        if (apiKey) {
            return apiKey as string
        }

        return null
    },

    onAuthFailure: (conn, error) => {
        console.log(`认证失败: ${error.errorCode} - ${error.error}`)
    }
})

await server.start()
```

#### 组合多个提供者

你可以创建一个复合提供者来支持多种认证方式：

```typescript
import type { IAuthProvider, AuthResult } from '@esengine/server/auth'

interface MultiAuthCredentials {
    type: 'jwt' | 'oauth' | 'apikey' | 'password'
    data: unknown
}

class MultiAuthProvider implements IAuthProvider<User, MultiAuthCredentials> {
    readonly name = 'multi'

    constructor(
        private jwtProvider: JwtAuthProvider<User>,
        private oauthProvider: OAuthProvider,
        private apiKeyProvider: ApiKeyAuthProvider,
        private dbProvider: DatabaseAuthProvider
    ) {}

    async verify(credentials: MultiAuthCredentials): Promise<AuthResult<User>> {
        switch (credentials.type) {
            case 'jwt':
                return this.jwtProvider.verify(credentials.data as string)
            case 'oauth':
                return this.oauthProvider.verify(credentials.data as OAuthCredentials)
            case 'apikey':
                return this.apiKeyProvider.verify(credentials.data as string)
            case 'password':
                return this.dbProvider.verify(credentials.data as PasswordCredentials)
            default:
                return {
                    success: false,
                    error: '不支持的认证类型',
                    errorCode: 'INVALID_CREDENTIALS'
                }
        }
    }
}
```

### Session 提供者

使用服务端会话实现有状态认证：

```typescript
import { createSessionAuthProvider, type ISessionStorage } from '@esengine/server/auth'

// 自定义存储实现
const storage: ISessionStorage = {
    async get<T>(key: string): Promise<T | null> {
        return await redis.get(key)
    },
    async set<T>(key: string, value: T): Promise<void> {
        await redis.set(key, value)
    },
    async delete(key: string): Promise<boolean> {
        return await redis.del(key) > 0
    },
}

const sessionProvider = createSessionAuthProvider({
    storage,
    sessionTTL: 86400000, // 24 小时（毫秒）

    // 可选：每次请求时验证用户
    validateUser: (user) => !user.banned,
})

// 创建会话（用于登录接口）
const sessionId = await sessionProvider.createSession(user, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
})

// 撤销会话（用于登出）
await sessionProvider.revoke(sessionId)
```

## 服务器认证 Mixin

`withAuth` 函数用于包装服务器添加认证功能：

```typescript
import { withAuth } from '@esengine/server/auth'

const server = withAuth(baseServer, {
    // 必填：认证提供者
    provider: jwtProvider,

    // 必填：从请求中提取凭证
    extractCredentials: (req) => {
        // 从查询字符串获取
        return new URL(req.url, 'http://localhost').searchParams.get('token')

        // 或从请求头获取
        // return req.headers['authorization']?.replace('Bearer ', '')
    },

    // 可选：处理认证失败
    onAuthFailed: (conn, error) => {
        console.log(`认证失败: ${error}`)
    },
})
```

### 访问认证上下文

认证后，可以从连接获取认证上下文：

```typescript
import { getAuthContext } from '@esengine/server/auth'

server.onConnect = (conn) => {
    const auth = getAuthContext(conn)

    if (auth.isAuthenticated) {
        console.log(`用户 ${auth.userId} 已连接`)
        console.log(`角色: ${auth.roles}`)
    }
}
```

## 房间认证 Mixin

`withRoomAuth` 函数为房间添加认证检查：

```typescript
import { withRoomAuth, type AuthPlayer } from '@esengine/server/auth'

interface User {
    id: string
    name: string
    roles: string[]
}

class GameRoom extends withRoomAuth<User>(Room, {
    // 要求认证才能加入
    requireAuth: true,

    // 可选：要求特定角色
    allowedRoles: ['player', 'premium'],

    // 可选：角色检查模式（'any' 或 'all'）
    roleCheckMode: 'any',
}) {
    // player 拥有 .auth 和 .user 属性
    onJoin(player: AuthPlayer<User>) {
        console.log(`${player.user?.name} 加入了`)
        console.log(`是否高级会员: ${player.auth.hasRole('premium')}`)
    }

    // 可选：自定义认证验证
    async onAuth(player: AuthPlayer<User>): Promise<boolean> {
        // 额外的验证逻辑
        if (player.auth.hasRole('banned')) {
            return false
        }
        return true
    }

    @onMessage('Chat')
    handleChat(data: { text: string }, player: AuthPlayer<User>) {
        this.broadcast('Chat', {
            from: player.user?.name ?? '访客',
            text: data.text,
        })
    }
}
```

### AuthPlayer 接口

认证房间中的玩家拥有额外属性：

```typescript
interface AuthPlayer<TUser> extends Player {
    // 完整认证上下文
    readonly auth: IAuthContext<TUser>

    // 用户信息（auth.user 的快捷方式）
    readonly user: TUser | null
}
```

### 房间认证辅助方法

```typescript
class GameRoom extends withRoomAuth<User>(Room) {
    someMethod() {
        // 通过用户 ID 获取玩家
        const player = this.getPlayerByUserId('user-123')

        // 获取拥有特定角色的所有玩家
        const admins = this.getPlayersByRole('admin')

        // 获取带认证信息的玩家
        const authPlayer = this.getAuthPlayer(playerId)
    }
}
```

## 认证装饰器

### @requireAuth

标记消息处理器需要认证：

```typescript
import { requireAuth, requireRole, onMessage } from '@esengine/server/auth'

class GameRoom extends withRoomAuth(Room) {
    @requireAuth()
    @onMessage('Trade')
    handleTrade(data: TradeData, player: AuthPlayer) {
        // 只有已认证玩家才能交易
    }

    @requireAuth({ allowGuest: true })
    @onMessage('Chat')
    handleChat(data: ChatData, player: AuthPlayer) {
        // 访客也可以聊天
    }
}
```

### @requireRole

要求特定角色才能访问消息处理器：

```typescript
class AdminRoom extends withRoomAuth(Room) {
    @requireRole('admin')
    @onMessage('Ban')
    handleBan(data: BanData, player: AuthPlayer) {
        // 只有管理员才能封禁
    }

    @requireRole(['moderator', 'admin'])
    @onMessage('Mute')
    handleMute(data: MuteData, player: AuthPlayer) {
        // 版主或管理员可以禁言
    }

    @requireRole(['verified', 'premium'], { mode: 'all' })
    @onMessage('SpecialFeature')
    handleSpecial(data: any, player: AuthPlayer) {
        // 需要同时拥有 verified 和 premium 角色
    }
}
```

## 认证上下文 API

认证上下文提供多种检查认证状态的方法：

```typescript
interface IAuthContext<TUser> {
    // 认证状态
    readonly isAuthenticated: boolean
    readonly user: TUser | null
    readonly userId: string | null
    readonly roles: ReadonlyArray<string>
    readonly authenticatedAt: number | null
    readonly expiresAt: number | null

    // 角色检查
    hasRole(role: string): boolean
    hasAnyRole(roles: string[]): boolean
    hasAllRoles(roles: string[]): boolean
}
```

`AuthContext` 类（实现类）还提供：

```typescript
class AuthContext<TUser> implements IAuthContext<TUser> {
    // 从认证结果设置认证状态
    setAuthenticated(result: AuthResult<TUser>): void

    // 清除认证状态
    clear(): void
}
```

## 测试

使用模拟认证提供者进行单元测试：

```typescript
import { createMockAuthProvider } from '@esengine/server/auth/testing'

// 创建带预设用户的模拟提供者
const mockProvider = createMockAuthProvider({
    users: [
        { id: '1', name: 'Alice', roles: ['player'] },
        { id: '2', name: 'Bob', roles: ['admin', 'player'] },
    ],
    autoCreate: true, // 为未知令牌创建用户
})

// 在测试中使用
const server = withAuth(testServer, {
    provider: mockProvider,
    extractCredentials: (req) => req.headers['x-token'],
})

// 使用用户 ID 作为令牌进行验证
const result = await mockProvider.verify('1')
// result.user = { id: '1', name: 'Alice', roles: ['player'] }

// 动态添加/移除用户
mockProvider.addUser({ id: '3', name: 'Charlie', roles: ['guest'] })
mockProvider.removeUser('3')

// 撤销令牌
await mockProvider.revoke('1')

// 重置到初始状态
mockProvider.clear()
```

## 错误处理

认证错误包含错误码用于程序化处理：

```typescript
type AuthErrorCode =
    | 'INVALID_CREDENTIALS'       // 用户名/密码无效
    | 'INVALID_TOKEN'             // 令牌格式错误或无效
    | 'EXPIRED_TOKEN'             // 令牌已过期
    | 'USER_NOT_FOUND'            // 用户查找失败
    | 'ACCOUNT_DISABLED'          // 用户账号已禁用
    | 'RATE_LIMITED'              // 请求过于频繁
    | 'INSUFFICIENT_PERMISSIONS'  // 权限不足

// 在认证失败处理器中
const server = withAuth(baseServer, {
    provider: jwtProvider,
    extractCredentials,
    onAuthFailed: (conn, error) => {
        switch (error.errorCode) {
            case 'EXPIRED_TOKEN':
                conn.send('AuthError', { code: 'TOKEN_EXPIRED' })
                break
            case 'INVALID_TOKEN':
                conn.send('AuthError', { code: 'INVALID_TOKEN' })
                break
            default:
                conn.close()
        }
    },
})
```

## 完整示例

以下是使用 JWT 认证的完整示例：

```typescript
// server.ts
import { createServer } from '@esengine/server'
import {
    withAuth,
    withRoomAuth,
    createJwtAuthProvider,
    requireAuth,
    requireRole,
    type AuthPlayer,
} from '@esengine/server/auth'

// 类型定义
interface User {
    id: string
    name: string
    roles: string[]
}

// JWT 提供者
const jwtProvider = createJwtAuthProvider<User>({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600,
    getUser: async (payload) => ({
        id: payload.sub as string,
        name: payload.name as string,
        roles: (payload.roles as string[]) ?? [],
    }),
})

// 创建带认证的服务器
const server = withAuth(
    await createServer({ port: 3000 }),
    {
        provider: jwtProvider,
        extractCredentials: (req) => {
            return new URL(req.url ?? '', 'http://localhost')
                .searchParams.get('token')
        },
    }
)

// 带认证的游戏房间
class GameRoom extends withRoomAuth<User>(Room, {
    requireAuth: true,
    allowedRoles: ['player'],
}) {
    onCreate() {
        console.log('游戏房间已创建')
    }

    onJoin(player: AuthPlayer<User>) {
        console.log(`${player.user?.name} 加入了！`)
        this.broadcast('PlayerJoined', {
            id: player.id,
            name: player.user?.name,
        })
    }

    @requireAuth()
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: AuthPlayer<User>) {
        // 处理移动
    }

    @requireRole('admin')
    @onMessage('Kick')
    handleKick(data: { playerId: string }, player: AuthPlayer<User>) {
        const target = this.getPlayer(data.playerId)
        if (target) {
            this.kick(target, '被管理员踢出')
        }
    }
}

server.define('game', GameRoom)
await server.start()
```

## 最佳实践

1. **保护密钥安全**：永远不要硬编码 JWT 密钥，使用环境变量。

2. **设置合理的过期时间**：在安全性和用户体验之间平衡令牌 TTL。

3. **在关键操作上验证**：在敏感消息处理器上使用 `@requireAuth`。

4. **使用基于角色的访问控制**：为管理功能实现适当的角色层级。

5. **处理令牌刷新**：为长会话实现令牌刷新逻辑。

6. **记录认证事件**：跟踪登录尝试和失败以进行安全监控。

7. **测试认证流程**：使用 `MockAuthProvider` 测试认证场景。

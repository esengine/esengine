---
title: "HTTP 路由"
description: "HTTP REST API 路由功能，支持与 WebSocket 共用端口"
---

`@esengine/server` 内置了轻量级的 HTTP 路由功能，可以与 WebSocket 服务共用同一端口，方便实现 REST API。

## 快速开始

### 内联路由定义

最简单的方式是在创建服务器时直接定义 HTTP 路由：

```typescript
import { createServer } from '@esengine/server'

const server = await createServer({
    port: 3000,
    http: {
        '/api/health': (req, res) => {
            res.json({ status: 'ok', time: Date.now() })
        },
        '/api/users': {
            GET: (req, res) => {
                res.json({ users: [] })
            },
            POST: async (req, res) => {
                const body = req.body as { name: string }
                res.status(201).json({ id: '1', name: body.name })
            }
        }
    },
    cors: true  // 启用 CORS
})

await server.start()
```

### 文件路由

对于较大的项目，推荐使用文件路由。创建 `src/http` 目录，每个文件对应一个路由：

```typescript
// src/http/login.ts
import { defineHttp } from '@esengine/server'

interface LoginBody {
    username: string
    password: string
}

export default defineHttp<LoginBody>({
    method: 'POST',
    handler(req, res) {
        const { username, password } = req.body as LoginBody

        // 验证用户...
        if (username === 'admin' && password === '123456') {
            res.json({ token: 'jwt-token-here', userId: 'user-1' })
        } else {
            res.error(401, '用户名或密码错误')
        }
    }
})
```

```typescript
// server.ts
import { createServer } from '@esengine/server'

const server = await createServer({
    port: 3000,
    httpDir: './src/http',   // HTTP 路由目录
    httpPrefix: '/api',       // 路由前缀
    cors: true
})

await server.start()
// 路由: POST /api/login
```

## defineHttp 定义

`defineHttp` 用于定义类型安全的 HTTP 处理器：

```typescript
import { defineHttp } from '@esengine/server'

interface CreateUserBody {
    username: string
    email: string
    password: string
}

export default defineHttp<CreateUserBody>({
    // HTTP 方法（默认 POST）
    method: 'POST',

    // 处理函数
    handler(req, res) {
        const body = req.body as CreateUserBody
        // 处理请求...
        res.status(201).json({ id: 'new-user-id' })
    }
})
```

### 支持的 HTTP 方法

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'
```

## HttpRequest 对象

HTTP 请求对象包含以下属性：

```typescript
interface HttpRequest {
    /** 原始 Node.js IncomingMessage */
    raw: IncomingMessage

    /** HTTP 方法 */
    method: string

    /** 请求路径 */
    path: string

    /** 路由参数（从 URL 路径提取，如 /users/:id） */
    params: Record<string, string>

    /** 查询参数 */
    query: Record<string, string>

    /** 请求头 */
    headers: Record<string, string | string[] | undefined>

    /** 解析后的请求体 */
    body: unknown

    /** 客户端 IP */
    ip: string
}
```

### 使用示例

```typescript
export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // 获取查询参数
        const page = parseInt(req.query.page ?? '1')
        const limit = parseInt(req.query.limit ?? '10')

        // 获取请求头
        const authHeader = req.headers.authorization

        // 获取客户端 IP
        console.log('Request from:', req.ip)

        res.json({ page, limit })
    }
})
```

### 请求体解析

请求体会根据 `Content-Type` 自动解析：

- `application/json` - 解析为 JSON 对象
- `application/x-www-form-urlencoded` - 解析为键值对对象
- 其他 - 保持原始字符串

```typescript
export default defineHttp<{ name: string; age: number }>({
    method: 'POST',
    handler(req, res) {
        // body 已自动解析
        const { name, age } = req.body as { name: string; age: number }
        res.json({ received: { name, age } })
    }
})
```

## HttpResponse 对象

HTTP 响应对象提供链式 API：

```typescript
interface HttpResponse {
    /** 原始 Node.js ServerResponse */
    raw: ServerResponse

    /** 设置状态码 */
    status(code: number): HttpResponse

    /** 设置响应头 */
    header(name: string, value: string): HttpResponse

    /** 发送 JSON 响应 */
    json(data: unknown): void

    /** 发送文本响应 */
    text(data: string): void

    /** 发送错误响应 */
    error(code: number, message: string): void
}
```

### 使用示例

```typescript
export default defineHttp({
    method: 'POST',
    handler(req, res) {
        // 设置状态码和自定义头
        res
            .status(201)
            .header('X-Custom-Header', 'value')
            .json({ created: true })
    }
})
```

```typescript
export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // 发送错误响应
        res.error(404, '资源不存在')
        // 等价于: res.status(404).json({ error: '资源不存在' })
    }
})
```

```typescript
export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // 发送纯文本
        res.text('Hello, World!')
    }
})
```

## 文件路由规范

### 命名转换

文件名会自动转换为路由路径：

| 文件路径 | 路由路径（prefix=/api） |
|---------|----------------------|
| `login.ts` | `/api/login` |
| `users/profile.ts` | `/api/users/profile` |
| `users/[id].ts` | `/api/users/:id` |
| `game/room/[roomId].ts` | `/api/game/room/:roomId` |

### 动态路由参数

使用 `[param]` 语法定义动态参数：

```typescript
// src/http/users/[id].ts
import { defineHttp } from '@esengine/server'

export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // 直接从 params 获取路由参数
        const { id } = req.params
        res.json({ userId: id })
    }
})
```

多个参数的情况：

```typescript
// src/http/users/[userId]/posts/[postId].ts
import { defineHttp } from '@esengine/server'

export default defineHttp({
    method: 'GET',
    handler(req, res) {
        const { userId, postId } = req.params
        res.json({ userId, postId })
    }
})
```

### 跳过规则

以下文件会被自动跳过：

- 以 `_` 开头的文件（如 `_helper.ts`）
- `index.ts` / `index.js` 文件
- 非 `.ts` / `.js` / `.mts` / `.mjs` 文件

### 目录结构示例

```
src/
└── http/
    ├── _utils.ts        # 跳过（下划线开头）
    ├── index.ts         # 跳过（index 文件）
    ├── health.ts        # GET /api/health
    ├── login.ts         # POST /api/login
    ├── register.ts      # POST /api/register
    └── users/
        ├── index.ts     # 跳过
        ├── list.ts      # GET /api/users/list
        └── [id].ts      # GET /api/users/:id
```

## CORS 配置

### 快速启用

```typescript
const server = await createServer({
    port: 3000,
    cors: true  // 使用默认配置
})
```

### 自定义配置

```typescript
const server = await createServer({
    port: 3000,
    cors: {
        // 允许的来源
        origin: ['http://localhost:5173', 'https://myapp.com'],
        // 或使用通配符
        // origin: '*',
        // origin: true,  // 反射请求来源

        // 允许的 HTTP 方法
        methods: ['GET', 'POST', 'PUT', 'DELETE'],

        // 允许的请求头
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

        // 是否允许携带凭证（cookies）
        credentials: true,

        // 预检请求缓存时间（秒）
        maxAge: 86400
    }
})
```

### CorsOptions 类型

```typescript
interface CorsOptions {
    /** 允许的来源：字符串、字符串数组、true（反射）或 '*' */
    origin?: string | string[] | boolean

    /** 允许的 HTTP 方法 */
    methods?: string[]

    /** 允许的请求头 */
    allowedHeaders?: string[]

    /** 是否允许携带凭证 */
    credentials?: boolean

    /** 预检请求缓存时间（秒） */
    maxAge?: number
}
```

## 路由合并

文件路由和内联路由可以同时使用，内联路由优先级更高：

```typescript
const server = await createServer({
    port: 3000,
    httpDir: './src/http',
    httpPrefix: '/api',

    // 内联路由会与文件路由合并
    http: {
        '/health': (req, res) => res.json({ status: 'ok' }),
        '/api/special': (req, res) => res.json({ special: true })
    }
})
```

## 与 WebSocket 共用端口

HTTP 路由与 WebSocket 服务自动共用同一端口：

```typescript
const server = await createServer({
    port: 3000,
    // WebSocket 相关配置
    apiDir: './src/api',
    msgDir: './src/msg',

    // HTTP 相关配置
    httpDir: './src/http',
    httpPrefix: '/api',
    cors: true
})

await server.start()

// 同一端口 3000：
// - WebSocket: ws://localhost:3000
// - HTTP API:  http://localhost:3000/api/*
```

## 完整示例

### 游戏服务器登录 API

```typescript
// src/http/auth/login.ts
import { defineHttp } from '@esengine/server'
import { createJwtAuthProvider } from '@esengine/server/auth'

interface LoginRequest {
    username: string
    password: string
}

interface LoginResponse {
    token: string
    userId: string
    expiresAt: number
}

const jwtProvider = createJwtAuthProvider({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600
})

export default defineHttp<LoginRequest>({
    method: 'POST',
    async handler(req, res) {
        const { username, password } = req.body as LoginRequest

        // 验证用户
        const user = await db.users.findByUsername(username)
        if (!user || !await verifyPassword(password, user.passwordHash)) {
            res.error(401, '用户名或密码错误')
            return
        }

        // 生成 JWT
        const token = jwtProvider.sign({
            sub: user.id,
            name: user.username,
            roles: user.roles
        })

        const response: LoginResponse = {
            token,
            userId: user.id,
            expiresAt: Date.now() + 3600 * 1000
        }

        res.json(response)
    }
})
```

### 游戏数据查询 API

```typescript
// src/http/game/leaderboard.ts
import { defineHttp } from '@esengine/server'

export default defineHttp({
    method: 'GET',
    async handler(req, res) {
        const limit = parseInt(req.query.limit ?? '10')
        const offset = parseInt(req.query.offset ?? '0')

        const players = await db.players.findMany({
            sort: { score: 'desc' },
            limit,
            offset
        })

        res.json({
            data: players,
            pagination: { limit, offset }
        })
    }
})
```

## 中间件

### 中间件类型

中间件是在路由处理前后执行的函数：

```typescript
type HttpMiddleware = (
    req: HttpRequest,
    res: HttpResponse,
    next: () => Promise<void>
) => void | Promise<void>
```

### 内置中间件

```typescript
import {
    requestLogger,
    bodyLimit,
    responseTime,
    requestId,
    securityHeaders
} from '@esengine/server'

const server = await createServer({
    port: 3000,
    http: { /* ... */ },
    // 全局中间件通过 createHttpRouter 配置
})
```

#### requestLogger - 请求日志

```typescript
import { requestLogger } from '@esengine/server'

// 记录请求和响应时间
requestLogger()

// 同时记录请求体
requestLogger({ logBody: true })
```

#### bodyLimit - 请求体大小限制

```typescript
import { bodyLimit } from '@esengine/server'

// 限制请求体为 1MB
bodyLimit(1024 * 1024)
```

#### responseTime - 响应时间头

```typescript
import { responseTime } from '@esengine/server'

// 自动添加 X-Response-Time 响应头
responseTime()
```

#### requestId - 请求 ID

```typescript
import { requestId } from '@esengine/server'

// 自动生成并添加 X-Request-ID 响应头
requestId()

// 自定义头名称
requestId('X-Trace-ID')
```

#### securityHeaders - 安全头

```typescript
import { securityHeaders } from '@esengine/server'

// 添加常用安全响应头
securityHeaders()

// 自定义配置
securityHeaders({
    hidePoweredBy: true,
    frameOptions: 'DENY',
    noSniff: true
})
```

### 自定义中间件

```typescript
import type { HttpMiddleware } from '@esengine/server'

// 认证中间件
const authMiddleware: HttpMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        res.error(401, 'Unauthorized')
        return  // 不调用 next()，终止请求
    }

    // 验证 token...
    (req as any).userId = 'decoded-user-id'

    await next()  // 继续执行后续中间件和处理器
}
```

### 使用中间件

#### 使用 createHttpRouter

```typescript
import { createHttpRouter, requestLogger, bodyLimit } from '@esengine/server'

const router = createHttpRouter({
    '/api/users': (req, res) => res.json([]),
    '/api/admin': {
        GET: {
            handler: (req, res) => res.json({ admin: true }),
            middlewares: [adminAuthMiddleware]  // 路由级中间件
        }
    }
}, {
    middlewares: [requestLogger(), bodyLimit(1024 * 1024)],  // 全局中间件
    timeout: 30000  // 全局超时 30 秒
})
```

## 请求超时

### 全局超时

```typescript
import { createHttpRouter } from '@esengine/server'

const router = createHttpRouter({
    '/api/data': async (req, res) => {
        // 如果处理超过 30 秒，自动返回 408 Request Timeout
        await someSlowOperation()
        res.json({ data: 'result' })
    }
}, {
    timeout: 30000  // 30 秒
})
```

### 路由级超时

```typescript
const router = createHttpRouter({
    '/api/quick': (req, res) => res.json({ fast: true }),

    '/api/slow': {
        POST: {
            handler: async (req, res) => {
                await verySlowOperation()
                res.json({ done: true })
            },
            timeout: 120000  // 这个路由允许 2 分钟
        }
    }
}, {
    timeout: 10000  // 全局 10 秒（被路由级覆盖）
})
```

## 最佳实践

1. **使用 defineHttp** - 获得更好的类型提示和代码组织
2. **统一错误处理** - 使用 `res.error()` 返回一致的错误格式
3. **启用 CORS** - 前后端分离时必须配置
4. **目录组织** - 按功能模块组织 HTTP 路由文件
5. **验证输入** - 始终验证 `req.body` 和 `req.query` 的内容
6. **状态码规范** - 遵循 HTTP 状态码规范（200、201、400、401、404、500 等）
7. **使用中间件** - 通过中间件实现认证、日志、限流等横切关注点
8. **设置超时** - 避免慢请求阻塞服务器

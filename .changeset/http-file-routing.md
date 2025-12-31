---
"@esengine/server": minor
"@esengine/rpc": patch
---

feat(server): add HTTP file-based routing support / 添加 HTTP 文件路由支持

New feature that allows organizing HTTP routes in separate files, similar to API and message handlers.
新功能：支持将 HTTP 路由组织在独立文件中，类似于 API 和消息处理器的文件路由方式。

```typescript
// src/http/login.ts
import { defineHttp } from '@esengine/server'

export default defineHttp<{ username: string; password: string }>({
    method: 'POST',
    handler(req, res) {
        const { username, password } = req.body
        res.json({ token: '...', userId: '...' })
    }
})
```

Server configuration / 服务器配置:

```typescript
const server = await createServer({
    port: 8080,
    httpDir: 'src/http',      // HTTP routes directory / HTTP 路由目录
    httpPrefix: '/api',        // Route prefix / 路由前缀
    cors: true,
})
```

File naming convention / 文件命名规则:
- `login.ts` → POST /api/login
- `users/profile.ts` → POST /api/users/profile
- `users/[id].ts` → POST /api/users/:id (dynamic routes / 动态路由)
- Set `method: 'GET'` in defineHttp for GET requests / 在 defineHttp 中设置 `method: 'GET'` 以处理 GET 请求

Also includes / 还包括:
- `defineHttp<TBody>()` helper for type-safe route definitions / 类型安全的路由定义辅助函数
- Support for merging file routes with inline `http` config / 支持文件路由与内联 `http` 配置合并
- RPC server supports attaching to existing HTTP server via `server` option / RPC 服务器支持通过 `server` 选项附加到现有 HTTP 服务器

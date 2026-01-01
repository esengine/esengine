---
"@esengine/server": minor
---

feat(server): HTTP 路由增强 | HTTP router enhancement

**新功能 | New Features**
- 路由参数支持：`/users/:id` → `req.params.id` | Route parameters: `/users/:id` → `req.params.id`
- 中间件支持：全局和路由级中间件 | Middleware support: global and route-level
- 请求超时控制：全局和路由级超时 | Request timeout: global and route-level

**内置中间件 | Built-in Middleware**
- `requestLogger()` - 请求日志 | Request logging
- `bodyLimit()` - 请求体大小限制 | Body size limit
- `responseTime()` - 响应时间头 | Response time header
- `requestId()` - 请求 ID | Request ID
- `securityHeaders()` - 安全头 | Security headers

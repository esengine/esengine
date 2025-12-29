---
"@esengine/server": minor
---

feat(server): 添加可插拔认证系统 | add pluggable authentication system

- 新增 JWT 认证提供者 (`createJwtAuthProvider`)
- 新增 Session 认证提供者 (`createSessionAuthProvider`)
- 新增服务器认证 mixin (`withAuth`)
- 新增房间认证 mixin (`withRoomAuth`)
- 新增认证装饰器 (`@requireAuth`, `@requireRole`)
- 新增测试工具 (`MockAuthProvider`)
- 导出路径: `@esengine/server/auth`, `@esengine/server/auth/testing`

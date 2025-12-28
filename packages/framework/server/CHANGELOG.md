# @esengine/server

## 1.1.1

### Patch Changes

- [#368](https://github.com/esengine/esengine/pull/368) [`66d5dc2`](https://github.com/esengine/esengine/commit/66d5dc27f740cc81b0645bde61dabf665743a5a0) Thanks [@esengine](https://github.com/esengine)! - fix: 修复发布缺少 dist 目录 | fix missing dist in published packages

## 1.1.0

### Minor Changes

- [#366](https://github.com/esengine/esengine/pull/366) [`b6f1235`](https://github.com/esengine/esengine/commit/b6f1235239c049abc62b6827554eb941e73dae65) Thanks [@esengine](https://github.com/esengine)! - feat(server): 添加游戏服务器框架与房间系统 | add game server framework with Room system

    **@esengine/server** - 游戏服务器框架 | Game server framework
    - 文件路由系统 | File-based routing
    - Room 生命周期管理 (onCreate, onJoin, onLeave, onTick, onDispose) | Room lifecycle management
    - `@onMessage` 装饰器处理消息 | Message handler decorator
    - 玩家管理与断线处理 | Player management with auto-disconnect
    - 内置 JoinRoom/LeaveRoom API | Built-in room APIs
    - defineApi/defineMsg 类型安全辅助函数 | Type-safe helper functions

    **create-esengine-server** - CLI 脚手架工具 | CLI scaffolding tool
    - 生成 shared/server/client 项目结构 | Creates project structure
    - 类型安全的协议定义 | Type-safe protocol definitions
    - 包含 GameRoom 示例实现 | Includes example implementation

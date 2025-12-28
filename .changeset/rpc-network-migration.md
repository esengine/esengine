---
"@esengine/rpc": minor
"@esengine/network": minor
---

## @esengine/rpc

### 新增 | Added

- 新增类型安全的 RPC 库，支持 WebSocket 通信
- 新增 `RpcClient` 类：connect/disconnect, call/send/on/off/once 方法
- 新增 `RpcServer` 类：Node.js WebSocket 服务端
- 新增编解码系统：支持 JSON 和 MessagePack
- 新增 TextEncoder/TextDecoder polyfill，兼容微信小游戏平台
- 新增 WebSocketAdapter 接口，支持跨平台 WebSocket 抽象

---

- Add type-safe RPC library with WebSocket support
- Add `RpcClient` class with connect/disconnect, call/send/on/off/once methods
- Add `RpcServer` class for Node.js WebSocket server
- Add codec system with JSON and MessagePack support
- Add TextEncoder/TextDecoder polyfill for WeChat platform compatibility
- Add WebSocketAdapter interface for cross-platform WebSocket abstraction

## @esengine/network

### 变更 | Changed

- 重构 NetworkService：拆分为 `RpcService<P>` 基类和 `GameNetworkService` 游戏服务类
- 新增 `gameProtocol`：类型安全的 API (join/leave) 和消息 (input/sync/spawn/despawn)
- 新增类型安全的便捷方法：sendInput(), onSync(), onSpawn(), onDespawn()
- 更新 NetworkPlugin 使用新的服务架构
- 移除 TSRPC 依赖，改用 @esengine/rpc

---

- Refactor NetworkService into `RpcService<P>` base class and `GameNetworkService`
- Add `gameProtocol` with type-safe API (join/leave) and messages (input/sync/spawn/despawn)
- Add type-safe convenience methods: sendInput(), onSync(), onSpawn(), onDespawn()
- Update NetworkPlugin to use new service architecture
- Remove TSRPC dependency, migrate to @esengine/rpc

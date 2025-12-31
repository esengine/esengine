# @esengine/rpc

## 1.1.2

### Patch Changes

- feat(server): add HTTP file-based routing support

    New feature that allows organizing HTTP routes in separate files, similar to API and message handlers:

    ```typescript
    // src/http/login.ts
    import { defineHttp } from '@esengine/server';

    export default defineHttp<{ username: string; password: string }>({
        method: 'POST',
        handler(req, res) {
            const { username, password } = req.body;
            // ... authentication logic
            res.json({ token: '...', userId: '...' });
        }
    });
    ```

    Server configuration:

    ```typescript
    const server = await createServer({
        port: 8080,
        httpDir: 'src/http', // HTTP routes directory
        httpPrefix: '/api', // Route prefix
        cors: true
    });
    ```

    File naming convention:
    - `login.ts` → POST /api/login
    - `users/profile.ts` → POST /api/users/profile
    - `users/[id].ts` → POST /api/users/:id (dynamic routes)
    - Set `method: 'GET'` in defineHttp for GET requests

    Also includes:
    - `defineHttp<TBody>()` helper function for type-safe route definitions
    - Support for merging file routes with inline `http` config
    - RPC server now supports attaching to existing HTTP server via `server` option

## 1.1.1

### Patch Changes

- [#374](https://github.com/esengine/esengine/pull/374) [`a000cc0`](https://github.com/esengine/esengine/commit/a000cc07d7cebe8ccbfa983fde610296bfba2f1b) Thanks [@esengine](https://github.com/esengine)! - feat: export RpcClient and connect from main entry point

    Re-export `RpcClient`, `connect`, and related types from the main entry point for better compatibility with bundlers (Cocos Creator, Vite, etc.) that may have issues with subpath exports.

    ```typescript
    // Now works in all environments:
    import { rpc, RpcClient, connect } from '@esengine/rpc';

    // Subpath import still supported:
    import { RpcClient } from '@esengine/rpc/client';
    ```

## 1.1.0

### Minor Changes

- [#364](https://github.com/esengine/esengine/pull/364) [`7940f58`](https://github.com/esengine/esengine/commit/7940f581a681ba8f990cf536ecf9246d8f13a638) Thanks [@esengine](https://github.com/esengine)! - ## @esengine/rpc

    ### 新增 | Added
    - 新增类型安全的 RPC 库，支持 WebSocket 通信
    - 新增 `RpcClient` 类：connect/disconnect, call/send/on/off/once 方法
    - 新增 `RpcServer` 类：Node.js WebSocket 服务端
    - 新增编解码系统：支持 JSON 和 MessagePack
    - 新增 TextEncoder/TextDecoder polyfill，兼容微信小游戏平台
    - 新增 WebSocketAdapter 接口，支持跨平台 WebSocket 抽象

    ***
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

    ***
    - Refactor NetworkService into `RpcService<P>` base class and `GameNetworkService`
    - Add `gameProtocol` with type-safe API (join/leave) and messages (input/sync/spawn/despawn)
    - Add type-safe convenience methods: sendInput(), onSync(), onSpawn(), onDespawn()
    - Update NetworkPlugin to use new service architecture
    - Remove TSRPC dependency, migrate to @esengine/rpc

    ## @esengine/cli

    ### 变更 | Changed
    - 更新 Node.js 适配器使用 `@esengine/rpc` 和 `@esengine/network`
    - 生成的服务器代码改用 `RpcServer` + `gameProtocol`
    - 添加 `ws` 和 `@types/ws` 依赖
    - 更新 README 模板中的客户端连接示例

    ***
    - Update Node.js adapter to use `@esengine/rpc` and `@esengine/network`
    - Generated server code now uses `RpcServer` + `gameProtocol`
    - Add `ws` and `@types/ws` dependencies
    - Update client connection example in README template

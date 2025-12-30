# @esengine/server

## 4.0.0

### Patch Changes

- Updated dependencies [[`1f3a76a`](https://github.com/esengine/esengine/commit/1f3a76aabea2d3eb8a5eb8b73e29127da57e2028)]:
    - @esengine/ecs-framework@2.7.0

## 3.0.0

### Minor Changes

- feat(ecs): 添加 @NetworkEntity 装饰器，支持自动广播实体生成/销毁

    ### 新功能

    **@NetworkEntity 装饰器**
    - 标记组件为网络实体，自动广播 spawn/despawn 消息
    - 支持 `autoSpawn` 和 `autoDespawn` 配置选项
    - 通过事件系统（`ECSEventType.COMPONENT_ADDED` / `ECSEventType.ENTITY_DESTROYED`）实现

    **ECSRoom 增强**
    - 新增 `enableAutoNetworkEntity` 配置选项（默认启用）
    - 自动监听组件添加和实体销毁事件
    - 简化 GameRoom 实现，无需手动回调

    ### 改进

    **Entity 事件**
    - `Entity.destroy()` 现在发出 `entity:destroyed` 事件
    - `Entity.active` 变化时发出 `entity:enabled` / `entity:disabled` 事件
    - 使用 `ECSEventType` 常量替代硬编码字符串

    ### 使用示例

    ```typescript
    import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

    @ECSComponent('Enemy')
    @NetworkEntity('Enemy')
    class EnemyComponent extends Component {
        @sync('float32') x: number = 0;
        @sync('float32') y: number = 0;
    }

    // 服务端
    const entity = scene.createEntity('Enemy');
    entity.addComponent(new EnemyComponent()); // 自动广播 spawn
    entity.destroy(); // 自动广播 despawn
    ```

### Patch Changes

- Updated dependencies []:
    - @esengine/ecs-framework@2.6.0

## 2.0.0

### Minor Changes

- [#390](https://github.com/esengine/esengine/pull/390) [`1f297ac`](https://github.com/esengine/esengine/commit/1f297ac769e37700f72fb4425639af7090898256) Thanks [@esengine](https://github.com/esengine)! - feat: ECS 网络状态同步系统

    ## @esengine/ecs-framework

    新增 `@sync` 装饰器和二进制编解码器，支持基于 Component 的网络状态同步：

    ```typescript
    import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

    @ECSComponent('Player')
    class PlayerComponent extends Component {
        @sync('string') name: string = '';
        @sync('uint16') score: number = 0;
        @sync('float32') x: number = 0;
        @sync('float32') y: number = 0;
    }
    ```

    ### 新增导出
    - `sync` - 标记需要同步的字段装饰器
    - `SyncType` - 支持的同步类型
    - `SyncOperation` - 同步操作类型（FULL/DELTA/SPAWN/DESPAWN）
    - `encodeSnapshot` / `decodeSnapshot` - 批量编解码
    - `encodeSpawn` / `decodeSpawn` - 实体生成编解码
    - `encodeDespawn` / `processDespawn` - 实体销毁编解码
    - `ChangeTracker` - 字段级变更追踪
    - `initChangeTracker` / `clearChanges` / `hasChanges` - 变更追踪工具函数

    ### 内部方法标记

    将以下方法标记为 `@internal`，用户应通过 `Core.update()` 驱动更新：
    - `Scene.update()`
    - `SceneManager.update()`
    - `WorldManager.updateAll()`

    ## @esengine/network

    新增 `ComponentSyncSystem`，基于 `@sync` 装饰器自动同步组件状态：

    ```typescript
    import { ComponentSyncSystem } from '@esengine/network';

    // 服务端：编码状态
    const data = syncSystem.encodeAllEntities(false);

    // 客户端：解码状态
    syncSystem.applySnapshot(data);
    ```

    ### 修复
    - 将 `@esengine/ecs-framework` 从 devDependencies 移到 peerDependencies

    ## @esengine/server

    新增 `ECSRoom`，带有 ECS World 支持的房间基类：

    ```typescript
    import { ECSRoom } from '@esengine/server/ecs';

    // 服务端启动
    Core.create();
    setInterval(() => Core.update(1 / 60), 16);

    // 定义房间
    class GameRoom extends ECSRoom {
        onCreate() {
            this.addSystem(new PhysicsSystem());
        }

        onJoin(player: Player) {
            const entity = this.createPlayerEntity(player.id);
            entity.addComponent(new PlayerComponent());
        }
    }
    ```

    ### 设计
    - 每个 `ECSRoom` 在 `Core.worldManager` 中创建独立的 World
    - `Core.update()` 统一更新 Time 和所有 World
    - `onTick()` 只处理状态同步逻辑

### Patch Changes

- Updated dependencies [[`1f297ac`](https://github.com/esengine/esengine/commit/1f297ac769e37700f72fb4425639af7090898256)]:
    - @esengine/ecs-framework@2.5.0

## 1.3.0

### Minor Changes

- [#388](https://github.com/esengine/esengine/pull/388) [`afdeb00`](https://github.com/esengine/esengine/commit/afdeb00b4df9427e7f03b91558bf95804a837b70) Thanks [@esengine](https://github.com/esengine)! - feat(server): 添加可插拔速率限制系统 | add pluggable rate limiting system
    - 新增令牌桶策略 (`TokenBucketStrategy`) - 推荐用于一般场景
    - 新增滑动窗口策略 (`SlidingWindowStrategy`) - 精确跟踪
    - 新增固定窗口策略 (`FixedWindowStrategy`) - 简单高效
    - 新增房间速率限制 mixin (`withRateLimit`)
    - 新增速率限制装饰器 (`@rateLimit`, `@noRateLimit`)
    - 新增按消息类型限流装饰器 (`@rateLimitMessage`, `@noRateLimitMessage`)
    - 支持与认证系统组合使用
    - 导出路径: `@esengine/server/ratelimit`

## 1.2.0

### Minor Changes

- [#386](https://github.com/esengine/esengine/pull/386) [`61a13ba`](https://github.com/esengine/esengine/commit/61a13baca2e1e8fba14e23d439521ec0e6b7ca6e) Thanks [@esengine](https://github.com/esengine)! - feat(server): 添加可插拔认证系统 | add pluggable authentication system
    - 新增 JWT 认证提供者 (`createJwtAuthProvider`)
    - 新增 Session 认证提供者 (`createSessionAuthProvider`)
    - 新增服务器认证 mixin (`withAuth`)
    - 新增房间认证 mixin (`withRoomAuth`)
    - 新增认证装饰器 (`@requireAuth`, `@requireRole`)
    - 新增测试工具 (`MockAuthProvider`)
    - 导出路径: `@esengine/server/auth`, `@esengine/server/auth/testing`

## 1.1.4

### Patch Changes

- Updated dependencies [[`a000cc0`](https://github.com/esengine/esengine/commit/a000cc07d7cebe8ccbfa983fde610296bfba2f1b)]:
    - @esengine/rpc@1.1.1

## 1.1.3

### Patch Changes

- [#372](https://github.com/esengine/esengine/pull/372) [`9c41181`](https://github.com/esengine/esengine/commit/9c4118187539e39ead48ef2fa7af3ff45285fde5) Thanks [@esengine](https://github.com/esengine)! - fix: expose `id` property on ServerConnection type

    TypeScript was not properly resolving the inherited `id` property from the base `Connection` interface in some module resolution scenarios. This fix explicitly declares the `id` property on `ServerConnection` to ensure it's always visible to consumers.

## 1.1.2

### Patch Changes

- [#370](https://github.com/esengine/esengine/pull/370) [`18df9d1`](https://github.com/esengine/esengine/commit/18df9d1cda4d4cf3095841d93125f9d41ce214f1) Thanks [@esengine](https://github.com/esengine)! - fix: allow define() to be called before start()

    Previously, calling `server.define()` before `server.start()` would throw an error because `roomManager` was initialized inside `start()`. This fix moves the `roomManager` initialization to `createServer()`, allowing the expected usage pattern:

    ```typescript
    const server = await createServer({ port: 3000 });
    server.define('world', WorldRoom); // Now works correctly
    await server.start();
    ```

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

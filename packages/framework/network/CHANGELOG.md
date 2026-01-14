# @esengine/network

## 13.0.1

### Patch Changes

- Updated dependencies [[`3364107`](https://github.com/esengine/esengine/commit/33641075d1a96523d27bed59abf28c026ba34a90)]:
    - @esengine/ecs-framework-math@2.10.2

## 13.0.0

### Patch Changes

- Updated dependencies [[`4e66bd8`](https://github.com/esengine/esengine/commit/4e66bd8e2be80b366a7723dcc48b99df0457aed4)]:
    - @esengine/blueprint@4.5.0
    - @esengine/ecs-framework-math@2.10.1

## 12.0.0

### Patch Changes

- Updated dependencies [[`fa593a3`](https://github.com/esengine/esengine/commit/fa593a3c69292207800750f8106f418465cb7c0f)]:
    - @esengine/ecs-framework-math@2.10.0

## 11.0.0

### Patch Changes

- Updated dependencies [[`bffe90b`](https://github.com/esengine/esengine/commit/bffe90b6a17563cc90709faf339b229dc3abd22d)]:
    - @esengine/ecs-framework-math@2.9.0

## 10.0.0

### Minor Changes

- [#440](https://github.com/esengine/esengine/pull/440) [`30173f0`](https://github.com/esengine/esengine/commit/30173f076415c9770a429b236b8bab95a2fdc498) Thanks [@esengine](https://github.com/esengine)! - feat(network): 添加定点数网络同步支持 | Add fixed-point network sync support

    **@esengine/network** - 新增定点数同步模块 | Add fixed-point sync module
    - 新增 `FixedSnapshotBuffer`：定点数快照缓冲区 | Add `FixedSnapshotBuffer`: fixed-point snapshot buffer
    - 新增 `FixedClientPrediction`：定点数客户端预测 | Add `FixedClientPrediction`: fixed-point client prediction
    - 支持确定性帧同步和状态回滚 | Support deterministic lockstep and state rollback

### Patch Changes

- Updated dependencies [[`30173f0`](https://github.com/esengine/esengine/commit/30173f076415c9770a429b236b8bab95a2fdc498)]:
    - @esengine/ecs-framework-math@2.8.0

## 9.0.0

### Patch Changes

- Updated dependencies [[`0d33cf0`](https://github.com/esengine/esengine/commit/0d33cf00977d16e6282931aba2cf771ec2c84c6b)]:
    - @esengine/blueprint@4.4.0

## 8.0.0

### Patch Changes

- Updated dependencies [[`c2acd14`](https://github.com/esengine/esengine/commit/c2acd14fce83af6cd116b3f2e40607229ccc3d6e)]:
    - @esengine/blueprint@4.3.0

## 7.0.0

### Patch Changes

- Updated dependencies [[`2e84942`](https://github.com/esengine/esengine/commit/2e84942ea14c5326620398add05840fa8bea16f8)]:
    - @esengine/blueprint@4.2.0

## 6.0.0

### Patch Changes

- Updated dependencies [[`caf3be7`](https://github.com/esengine/esengine/commit/caf3be72cdcc730492c63abe5f1715893f3579ac)]:
    - @esengine/blueprint@4.1.0

## 5.0.3

### Patch Changes

- Updated dependencies [[`902c0a1`](https://github.com/esengine/esengine/commit/902c0a10749f80bd8f499b44154646379d359704)]:
    - @esengine/rpc@1.1.3

## 5.0.2

### Patch Changes

- Updated dependencies []:
    - @esengine/rpc@1.1.2

## 5.0.1

### Patch Changes

- Updated dependencies [[`3e5b778`](https://github.com/esengine/esengine/commit/3e5b7783beec08e247f7525184935401923ecde8)]:
    - @esengine/ecs-framework@2.7.1
    - @esengine/blueprint@4.0.1

## 5.0.0

### Patch Changes

- Updated dependencies [[`1f3a76a`](https://github.com/esengine/esengine/commit/1f3a76aabea2d3eb8a5eb8b73e29127da57e2028)]:
    - @esengine/ecs-framework@2.7.0
    - @esengine/blueprint@4.0.0

## 4.0.1

### Patch Changes

- Updated dependencies [[`04b08f3`](https://github.com/esengine/esengine/commit/04b08f3f073d69beb8f4be399c774bea0acb612e)]:
    - @esengine/ecs-framework@2.6.1
    - @esengine/blueprint@3.0.1

## 4.0.0

### Patch Changes

- Updated dependencies []:
    - @esengine/ecs-framework@2.6.0
    - @esengine/blueprint@3.0.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`a08a84b`](https://github.com/esengine/esengine/commit/a08a84b7db28e1140cbc637d442552747ad81c76)]:
    - @esengine/ecs-framework@2.5.1
    - @esengine/blueprint@2.0.1

## 3.0.0

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
    - @esengine/blueprint@2.0.0

## 2.2.0

### Minor Changes

- [#379](https://github.com/esengine/esengine/pull/379) [`fb8bde6`](https://github.com/esengine/esengine/commit/fb8bde64856ef71ea8e20906496682ccfb27f9b3) Thanks [@esengine](https://github.com/esengine)! - feat(network): 网络模块增强

    ### 新增功能
    - **客户端预测 (NetworkPredictionSystem)**
        - 本地输入预测和服务器校正
        - 平滑的校正偏移应用
        - 可配置移动速度、校正阈值等
    - **兴趣区域管理 (NetworkAOISystem)**
        - 基于网格的 AOI 实现
        - 观察者进入/离开事件
        - 同步数据过滤
    - **状态增量压缩 (StateDeltaCompressor)**
        - 只发送变化的字段
        - 可配置变化阈值
        - 定期完整快照
    - **断线重连**
        - 自动重连机制
        - Token 认证
        - 完整状态恢复

    ### 协议增强
    - 添加输入序列号和时间戳
    - 添加速度和角速度字段
    - 添加自定义数据字段
    - 新增重连协议

    ### 文档
    - 添加客户端预测文档（中英文）
    - 添加 AOI 文档（中英文）
    - 添加增量压缩文档（中英文）

## 2.1.1

### Patch Changes

- Updated dependencies [[`a000cc0`](https://github.com/esengine/esengine/commit/a000cc07d7cebe8ccbfa983fde610296bfba2f1b)]:
    - @esengine/rpc@1.1.1

## 2.1.0

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

### Patch Changes

- Updated dependencies [[`7940f58`](https://github.com/esengine/esengine/commit/7940f581a681ba8f990cf536ecf9246d8f13a638)]:
    - @esengine/rpc@1.1.0

# @esengine/network

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

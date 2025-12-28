# @esengine/cli

## 1.6.0

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

## 1.5.0

### Minor Changes

- [#359](https://github.com/esengine/esengine/pull/359) [`aed91db`](https://github.com/esengine/esengine/commit/aed91dbe4507459f8ac0563ee933e44fd4c9fea6) Thanks [@esengine](https://github.com/esengine)! - feat(cli): 添加 update 命令用于更新 ESEngine 包
    - 新增 `esengine update` 命令检查并更新 @esengine/\* 包到最新版本
    - 支持 `--check` 参数仅检查可用更新而不安装
    - 支持 `--yes` 参数跳过确认提示
    - 显示包更新状态，对比当前版本与最新版本
    - 更新时保留版本前缀（^ 或 ~）

## 1.3.0

### Minor Changes

- [#354](https://github.com/esengine/esengine/pull/354) [`1e240e8`](https://github.com/esengine/esengine/commit/1e240e86f2f75672c3609c9d86238a9ec08ebb4e) Thanks [@esengine](https://github.com/esengine)! - feat(cli): 增强 Node.js 服务端适配器

    **@esengine/cli:**
    - 添加 @esengine/network-server 依赖支持
    - 生成完整的 ECS 游戏服务器项目结构
    - 组件使用 @ECSComponent 装饰器注册
    - tsconfig 启用 experimentalDecorators

    **@esengine/network-server:**
    - 支持 ESM/CJS 双格式导出
    - 添加 ws@8.18.0 解决 Node.js 24 兼容性问题

## 1.2.1

### Patch Changes

- [#352](https://github.com/esengine/esengine/pull/352) [`33e98b9`](https://github.com/esengine/esengine/commit/33e98b9a750f9fe684c36f1937c1afa38da36315) Thanks [@esengine](https://github.com/esengine)! - fix(cli): 修复 Cocos Creator 3.x 项目检测逻辑
    - 优先检查 package.json 中的 creator.version 字段
    - 添加 .creator 和 settings 目录检测
    - 重构检测代码，提取通用辅助函数

## 1.2.0

### Minor Changes

- [`d66c180`](https://github.com/esengine/esengine/commit/d66c18041ebffa67b4dd12a026075e22dc1f5d36) Thanks [@esengine](https://github.com/esengine)! - feat(cli): 添加模块管理命令
    - 新增 `list` 命令：按分类显示可用模块
    - 新增 `add [modules...]` 命令：添加模块到项目，支持交互式选择
    - 新增 `remove [modules...]` 命令：从项目移除模块，支持确认提示

## 1.1.0

### Minor Changes

- [#339](https://github.com/esengine/esengine/pull/339) [`c4f7a13`](https://github.com/esengine/esengine/commit/c4f7a13b74e523eb4257a883e2e35c7b329522d4) Thanks [@esengine](https://github.com/esengine)! - feat(cli): 添加 CLI 工具用于将 ECS 框架集成到现有项目
    - 支持 Cocos Creator 2.x/3.x、LayaAir 3.x、Node.js 平台
    - 自动检测项目类型
    - 生成完整配置的 ECSManager（调试模式、远程调试、WebSocket URL）
    - 自动安装依赖（支持 npm/yarn/pnpm）
    - 针对不同平台生成正确的装饰器和生命周期方法

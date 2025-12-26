# @esengine/cli

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

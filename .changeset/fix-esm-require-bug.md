---
"@esengine/ecs-framework": patch
---

fix(ecs): 修复 ESM 环境下 require 不存在的问题

- 新增 `RuntimeConfig` 模块，作为运行时环境配置的独立存储
- `Core.runtimeEnvironment` 和 `Scene.runtimeEnvironment` 现在都从 `RuntimeConfig` 读取
- 移除 `Scene.ts` 中的 `require()` 调用，解决 Node.js ESM 环境下的兼容性问题

此修复解决了在 Node.js ESM 环境（如游戏服务端）中使用 `scene.isServer` 时报错 `ReferenceError: require is not defined` 的问题。

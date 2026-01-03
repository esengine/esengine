---
"@esengine/blueprint": minor
---

feat(blueprint): 重构装饰器系统，移除 Reflect 依赖 | Refactor decorator system, remove Reflect dependency

**@esengine/blueprint**

- 移除 `Reflect.getMetadata` 依赖，装饰器现在要求显式指定类型 | Removed `Reflect.getMetadata` dependency, decorators now require explicit type specification
- 简化 `BlueprintProperty` 和 `BlueprintMethod` 装饰器的元数据结构 | Simplified metadata structure for `BlueprintProperty` and `BlueprintMethod` decorators
- 新增 `inferPinType` 工具函数用于类型推断 | Added `inferPinType` utility function for type inference
- 优化组件节点生成器以适配新的元数据结构 | Optimized component node generator for new metadata structure

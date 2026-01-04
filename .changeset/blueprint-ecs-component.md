---
"@esengine/blueprint": minor
---

refactor(blueprint): BlueprintComponent 和 BlueprintSystem 重构为标准 ECS 模式

- BlueprintComponent 使用 @ECSComponent 装饰器注册
- BlueprintSystem 继承标准 System 基类
- 简化组件 API，移除冗余方法
- 优化 VM 生命周期管理

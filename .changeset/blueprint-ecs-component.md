---
"@esengine/blueprint": minor
---

feat(blueprint): 添加 Add Component 节点支持 + ECS 模式重构

新功能：
- 为每个 @BlueprintExpose 组件自动生成 Add_ComponentName 节点
- Add 节点支持设置初始属性值
- 添加通用 ECS_AddComponent 节点用于动态添加组件
- 添加 registerComponentClass() 用于手动注册组件类

重构：
- BlueprintComponent 使用 @ECSComponent 装饰器注册
- BlueprintSystem 继承标准 System 基类
- 简化组件 API，优化 VM 生命周期管理

---
"@esengine/blueprint": minor
---

feat(blueprint): 添加 Add Component 节点支持 + 变量节点 + ECS 模式重构

新功能：
- 为每个 @BlueprintExpose 组件自动生成 Add_ComponentName 节点
- Add 节点支持设置初始属性值
- 添加通用 ECS_AddComponent 节点用于动态添加组件
- @BlueprintExpose 装饰的组件自动注册，无需手动调用 registerComponentClass()
- 添加变量节点：GetVariable, SetVariable, GetBoolVariable, GetFloatVariable, GetIntVariable, GetStringVariable

重构：
- BlueprintComponent 使用 @ECSComponent 装饰器注册
- BlueprintSystem 继承标准 System 基类
- 简化组件 API，优化 VM 生命周期管理
- ExecutionContext.getComponentClass() 自动查找 @BlueprintExpose 注册的组件

# @esengine/blueprint

## 4.2.0

### Minor Changes

- [#433](https://github.com/esengine/esengine/pull/433) [`2e84942`](https://github.com/esengine/esengine/commit/2e84942ea14c5326620398add05840fa8bea16f8) Thanks [@esengine](https://github.com/esengine)! - feat(blueprint): 添加 Add Component 节点支持 + ECS 模式重构

    新功能：
    - 为每个 @BlueprintExpose 组件自动生成 Add_ComponentName 节点
    - Add 节点支持设置初始属性值
    - 添加通用 ECS_AddComponent 节点用于动态添加组件
    - 添加 registerComponentClass() 用于手动注册组件类

    重构：
    - BlueprintComponent 使用 @ECSComponent 装饰器注册
    - BlueprintSystem 继承标准 System 基类
    - 简化组件 API，优化 VM 生命周期管理

## 4.1.0

### Minor Changes

- [#430](https://github.com/esengine/esengine/pull/430) [`caf3be7`](https://github.com/esengine/esengine/commit/caf3be72cdcc730492c63abe5f1715893f3579ac) Thanks [@esengine](https://github.com/esengine)! - feat(blueprint): 重构装饰器系统，移除 Reflect 依赖 | Refactor decorator system, remove Reflect dependency

    **@esengine/blueprint**
    - 移除 `Reflect.getMetadata` 依赖，装饰器现在要求显式指定类型 | Removed `Reflect.getMetadata` dependency, decorators now require explicit type specification
    - 简化 `BlueprintProperty` 和 `BlueprintMethod` 装饰器的元数据结构 | Simplified metadata structure for `BlueprintProperty` and `BlueprintMethod` decorators
    - 新增 `inferPinType` 工具函数用于类型推断 | Added `inferPinType` utility function for type inference
    - 优化组件节点生成器以适配新的元数据结构 | Optimized component node generator for new metadata structure

## 4.0.1

### Patch Changes

- Updated dependencies [[`3e5b778`](https://github.com/esengine/esengine/commit/3e5b7783beec08e247f7525184935401923ecde8)]:
    - @esengine/ecs-framework@2.7.1

## 4.0.0

### Patch Changes

- Updated dependencies [[`1f3a76a`](https://github.com/esengine/esengine/commit/1f3a76aabea2d3eb8a5eb8b73e29127da57e2028)]:
    - @esengine/ecs-framework@2.7.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`04b08f3`](https://github.com/esengine/esengine/commit/04b08f3f073d69beb8f4be399c774bea0acb612e)]:
    - @esengine/ecs-framework@2.6.1

## 3.0.0

### Patch Changes

- Updated dependencies []:
    - @esengine/ecs-framework@2.6.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`a08a84b`](https://github.com/esengine/esengine/commit/a08a84b7db28e1140cbc637d442552747ad81c76)]:
    - @esengine/ecs-framework@2.5.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`1f297ac`](https://github.com/esengine/esengine/commit/1f297ac769e37700f72fb4425639af7090898256)]:
    - @esengine/ecs-framework@2.5.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`7d74623`](https://github.com/esengine/esengine/commit/7d746237100084ac3456f1af92ff664db4e50cc8)]:
    - @esengine/ecs-framework@2.4.4

## 1.0.1

### Patch Changes

- Updated dependencies [[`ce2db4e`](https://github.com/esengine/esengine/commit/ce2db4e48a7cdac44265420ef16e83f6424f4dea)]:
    - @esengine/ecs-framework@2.4.3

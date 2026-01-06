# @esengine/blueprint

## 4.5.0

### Minor Changes

- [#447](https://github.com/esengine/esengine/pull/447) [`4e66bd8`](https://github.com/esengine/esengine/commit/4e66bd8e2be80b366a7723dcc48b99df0457aed4) Thanks [@esengine](https://github.com/esengine)! - feat(blueprint): add Schema type system and @BlueprintArray decorator
    - Add `Schema` fluent API for defining complex data types:
        - Primitive types: `Schema.float()`, `Schema.int()`, `Schema.string()`, `Schema.boolean()`, `Schema.vector2()`, `Schema.vector3()`
        - Composite types: `Schema.object()`, `Schema.array()`, `Schema.enum()`, `Schema.ref()`
        - Support for constraints: `min`, `max`, `step`, `defaultValue`, `placeholder`, etc.
    - Add `@BlueprintArray` decorator for array properties:
        - `itemSchema`: Define schema for array items using Schema API
        - `reorderable`: Allow drag-and-drop reordering
        - `exposeElementPorts`: Create individual ports for each array element
        - `portNameTemplate`: Custom naming for element ports (e.g., "Waypoint {index1}")
    - Update documentation with examples and usage guide

## 4.4.0

### Minor Changes

- [#438](https://github.com/esengine/esengine/pull/438) [`0d33cf0`](https://github.com/esengine/esengine/commit/0d33cf00977d16e6282931aba2cf771ec2c84c6b) Thanks [@esengine](https://github.com/esengine)! - feat(node-editor): add visual group box for organizing nodes
    - Add NodeGroup model with dynamic bounds calculation based on node pin counts
    - Add GroupNodeComponent for rendering group boxes behind nodes
    - Groups automatically resize to wrap contained nodes
    - Dragging group header moves all nodes inside together
    - Support group serialization/deserialization
    - Export `estimateNodeHeight` and `NodeBounds` for accurate size calculation

    feat(blueprint): add comprehensive math and logic nodes

    Math nodes:
    - Modulo, Abs, Min, Max, Power, Sqrt
    - Floor, Ceil, Round, Sign, Negate
    - Sin, Cos, Tan, Asin, Acos, Atan, Atan2
    - DegToRad, RadToDeg, Lerp, InverseLerp
    - Clamp, Wrap, RandomRange, RandomInt

    Logic nodes:
    - Equal, NotEqual, GreaterThan, GreaterThanOrEqual
    - LessThan, LessThanOrEqual, InRange
    - AND, OR, NOT, XOR, NAND
    - IsNull, Select (ternary)

## 4.3.0

### Minor Changes

- [#435](https://github.com/esengine/esengine/pull/435) [`c2acd14`](https://github.com/esengine/esengine/commit/c2acd14fce83af6cd116b3f2e40607229ccc3d6e) Thanks [@esengine](https://github.com/esengine)! - feat(blueprint): 添加 Add Component 节点支持 + 变量节点 + ECS 模式重构

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

---
"@esengine/ecs-framework-math": major
"@esengine/blueprint": major
---

refactor: move math blueprint nodes from `@esengine/ecs-framework-math` to `@esengine/blueprint`

修复反向依赖：原本 `@esengine/ecs-framework-math` 在 `src/nodes/` 下导出 Vector / Fixed / FixedVector / Color 的 Blueprint 节点定义，因此在 `dependencies` 中引用了 `@esengine/blueprint`，造成"基础数学库依赖上层可视化脚本模块"的反向依赖。

现在依赖方向已纠正：

- `@esengine/ecs-framework-math` 不再依赖 `@esengine/blueprint`，也不再导出任何 Blueprint 节点符号
- `@esengine/blueprint` 通过新增的 `peerDependency` `@esengine/ecs-framework-math` 引用数学类型，节点定义统一放在 `blueprint/src/nodes/math/` 下

### Breaking Changes

**`@esengine/ecs-framework-math`**

以下符号不再从本包导出，请改为从 `@esengine/blueprint` 导入：

- `MathNodeDefinitions`（已在 blueprint 中重命名为 `MathLibraryNodeDefinitions`）
- `VectorNodeDefinitions`、`FixedNodeDefinitions`、`FixedVectorNodeDefinitions`、`ColorNodeDefinitions`
- 所有 `*Template` / `*Executor` 节点符号（`MakeVector2Template`、`MakeVector2Executor`、`Fixed32FromTemplate` 等）

迁移示例：

```ts
// Before
import { MathNodeDefinitions } from '@esengine/ecs-framework-math';

// After
import { MathLibraryNodeDefinitions } from '@esengine/blueprint';
```

**`@esengine/blueprint`**

新增 `peerDependency`：`@esengine/ecs-framework-math`。使用 `@esengine/blueprint` 的项目需要同时安装 `@esengine/ecs-framework-math`。

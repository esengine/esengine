---
"@esengine/pathfinding": patch
---

fix(pathfinding): 修复坐标转换和寻路失败时的行为问题

## 修复 1: cellSize=1 时路径坐标返回 0.5 倍数

### 问题
当 `cellSize=1` 时，`toPixelCoord` 方法会在网格坐标基础上添加 0.5 的偏移（单元格中心），
导致返回的路径坐标都是 0.5 的倍数（如 0.5, 1.5, 2.5...），而不是预期的整数坐标。

### 解决方案
- 新增 `alignToCenter` 配置选项，允许用户显式控制是否返回单元格中心
- 默认行为：`cellSize > 1` 时对齐中心，`cellSize = 1` 时不对齐
- 添加 `cellSize`、`width`、`height`、`cost` 等参数的验证，防止无效值

### 新增 API
```typescript
interface IGridPathfinderAdapterConfig {
    cellSize?: number;
    alignToCenter?: boolean;  // 新增：是否对齐到单元格中心
}
```

### 使用示例
```typescript
// 默认行为（推荐）
const planner1 = createAStarPlanner(gridMap);  // cellSize=1, alignToCenter=false
const planner2 = createAStarPlanner(gridMap, undefined, { cellSize: 20 });  // alignToCenter=true

// 显式覆盖
const planner3 = createAStarPlanner(gridMap, undefined, {
    cellSize: 20,
    alignToCenter: false  // 禁用中心对齐
});
```

## 修复 2: 寻路失败时代理直线穿墙

### 问题
当寻路失败（目标不可达）时，代理的 path 被清空，但 `calculatePreferredVelocity`
会直接使用 `destination` 作为目标，导致代理直线穿过障碍物走向目标。

### 解决方案
- 检查代理状态，`Unreachable` 或 `Arrived` 时返回零速度
- 检查路径是否为空，无路径且非计算中时返回零速度
- 只有当路径存在时才计算期望速度

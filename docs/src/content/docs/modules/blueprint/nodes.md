---
title: "内置节点"
description: "蓝图内置节点参考"
---

## 事件节点

| 节点 | 说明 |
|------|------|
| `EventBeginPlay` | 蓝图启动时触发 |
| `EventTick` | 每帧触发 |
| `EventEndPlay` | 蓝图停止时触发 |
| `EventCollision` | 碰撞时触发 |
| `EventInput` | 输入事件触发 |
| `EventTimer` | 定时器触发 |
| `EventMessage` | 自定义消息触发 |

## 流程控制节点

| 节点 | 说明 |
|------|------|
| `Branch` | 条件分支 (if/else) |
| `Sequence` | 顺序执行多个输出 |
| `ForLoop` | 循环执行 |
| `WhileLoop` | 条件循环 |
| `DoOnce` | 只执行一次 |
| `FlipFlop` | 交替执行两个分支 |
| `Gate` | 可开关的执行门 |

## 时间节点

| 节点 | 说明 |
|------|------|
| `Delay` | 延迟执行 |
| `GetDeltaTime` | 获取帧间隔 |
| `GetTime` | 获取运行时间 |
| `SetTimer` | 设置定时器 |
| `ClearTimer` | 清除定时器 |

## 数学节点

| 节点 | 说明 |
|------|------|
| `Add` | 加法 |
| `Subtract` | 减法 |
| `Multiply` | 乘法 |
| `Divide` | 除法 |
| `Abs` | 绝对值 |
| `Clamp` | 限制范围 |
| `Lerp` | 线性插值 |
| `Min` / `Max` | 最小/最大值 |
| `Sin` / `Cos` | 三角函数 |
| `Sqrt` | 平方根 |
| `Power` | 幂运算 |

## 逻辑节点

| 节点 | 说明 |
|------|------|
| `And` | 逻辑与 |
| `Or` | 逻辑或 |
| `Not` | 逻辑非 |
| `Equal` | 相等比较 |
| `NotEqual` | 不等比较 |
| `Greater` | 大于比较 |
| `Less` | 小于比较 |

## 向量节点

| 节点 | 说明 |
|------|------|
| `MakeVector2` | 创建 2D 向量 |
| `BreakVector2` | 分解 2D 向量 |
| `VectorAdd` | 向量加法 |
| `VectorSubtract` | 向量减法 |
| `VectorMultiply` | 向量乘法 |
| `VectorLength` | 向量长度 |
| `VectorNormalize` | 向量归一化 |
| `VectorDistance` | 向量距离 |

## 实体节点

| 节点 | 说明 |
|------|------|
| `GetSelf` | 获取当前实体 |
| `GetComponent` | 获取组件 |
| `HasComponent` | 检查组件 |
| `AddComponent` | 添加组件 |
| `RemoveComponent` | 移除组件 |
| `SpawnEntity` | 创建实体 |
| `DestroyEntity` | 销毁实体 |

## 变量节点

| 节点 | 说明 |
|------|------|
| `GetVariable` | 获取变量值 |
| `SetVariable` | 设置变量值 |

## 调试节点

| 节点 | 说明 |
|------|------|
| `Print` | 打印到控制台 |
| `DrawDebugLine` | 绘制调试线 |
| `DrawDebugPoint` | 绘制调试点 |
| `Breakpoint` | 调试断点 |

---
title: "ECS 节点参考"
description: "蓝图内置 ECS 操作节点"
---

## 事件节点

生命周期事件，作为蓝图执行的入口点：

| 节点 | 说明 |
|------|------|
| `EventBeginPlay` | 蓝图启动时触发 |
| `EventTick` | 每帧触发，接收 deltaTime |
| `EventEndPlay` | 蓝图停止时触发 |

## 实体节点 (Entity)

操作 ECS 实体：

| 节点 | 说明 | 类型 |
|------|------|------|
| `Get Self` | 获取拥有此蓝图的实体 | 纯节点 |
| `Create Entity` | 在场景中创建新实体 | 执行节点 |
| `Destroy Entity` | 销毁指定实体 | 执行节点 |
| `Destroy Self` | 销毁自身实体 | 执行节点 |
| `Is Valid` | 检查实体是否有效 | 纯节点 |
| `Get Entity Name` | 获取实体名称 | 纯节点 |
| `Set Entity Name` | 设置实体名称 | 执行节点 |
| `Get Entity Tag` | 获取实体标签 | 纯节点 |
| `Set Entity Tag` | 设置实体标签 | 执行节点 |
| `Set Active` | 设置实体激活状态 | 执行节点 |
| `Is Active` | 检查实体是否激活 | 纯节点 |
| `Find Entity By Name` | 按名称查找实体 | 纯节点 |
| `Find Entities By Tag` | 按标签查找所有实体 | 纯节点 |
| `Get Entity ID` | 获取实体唯一 ID | 纯节点 |
| `Find Entity By ID` | 按 ID 查找实体 | 纯节点 |

## 组件节点 (Component)

操作 ECS 组件：

| 节点 | 说明 | 类型 |
|------|------|------|
| `Has Component` | 检查实体是否有指定组件 | 纯节点 |
| `Get Component` | 获取实体的组件 | 纯节点 |
| `Get All Components` | 获取实体所有组件 | 纯节点 |
| `Remove Component` | 移除组件 | 执行节点 |
| `Get Component Property` | 获取组件属性值 | 纯节点 |
| `Set Component Property` | 设置组件属性值 | 执行节点 |
| `Get Component Type` | 获取组件类型名称 | 纯节点 |
| `Get Owner Entity` | 从组件获取所属实体 | 纯节点 |

## 流程控制节点 (Flow)

控制执行流程：

| 节点 | 说明 |
|------|------|
| `Branch` | 条件分支 (if/else) |
| `Sequence` | 顺序执行多个输出 |
| `For Loop` | 循环执行 |
| `For Each` | 遍历数组 |
| `While Loop` | 条件循环 |
| `Do Once` | 只执行一次 |
| `Flip Flop` | 交替执行两个分支 |
| `Gate` | 可开关的执行门 |

## 时间节点 (Time)

| 节点 | 说明 | 类型 |
|------|------|------|
| `Delay` | 延迟执行 | 执行节点 |
| `Get Delta Time` | 获取帧间隔时间 | 纯节点 |
| `Get Time` | 获取运行总时间 | 纯节点 |

## 数学节点 (Math)

基础运算：

| 节点 | 说明 |
|------|------|
| `Add` / `Subtract` / `Multiply` / `Divide` | 四则运算 |
| `Modulo` | 取模运算 (%) |
| `Negate` | 取负 |
| `Abs` | 绝对值 |
| `Sign` | 符号 (+1, 0, -1) |
| `Min` / `Max` | 最小/最大值 |
| `Clamp` | 限制在范围内 |
| `Wrap` | 循环限制在范围内 |

幂与根：

| 节点 | 说明 |
|------|------|
| `Power` | 幂运算 (A^B) |
| `Sqrt` | 平方根 |

取整：

| 节点 | 说明 |
|------|------|
| `Floor` | 向下取整 |
| `Ceil` | 向上取整 |
| `Round` | 四舍五入 |

三角函数：

| 节点 | 说明 |
|------|------|
| `Sin` / `Cos` / `Tan` | 正弦/余弦/正切 |
| `Asin` / `Acos` / `Atan` | 反三角函数 |
| `Atan2` | 两参数反正切 |
| `DegToRad` / `RadToDeg` | 角度与弧度转换 |

插值：

| 节点 | 说明 |
|------|------|
| `Lerp` | 线性插值 |
| `InverseLerp` | 反向线性插值 |

随机数：

| 节点 | 说明 |
|------|------|
| `Random Range` | 范围内随机浮点数 |
| `Random Int` | 范围内随机整数 |

## 逻辑节点 (Logic)

比较运算：

| 节点 | 说明 |
|------|------|
| `Equal` | 等于 (==) |
| `Not Equal` | 不等于 (!=) |
| `Greater Than` | 大于 (>) |
| `Greater Or Equal` | 大于等于 (>=) |
| `Less Than` | 小于 (<) |
| `Less Or Equal` | 小于等于 (<=) |
| `In Range` | 检查值是否在范围内 |

逻辑运算：

| 节点 | 说明 |
|------|------|
| `AND` | 逻辑与 |
| `OR` | 逻辑或 |
| `NOT` | 逻辑非 |
| `XOR` | 异或 |
| `NAND` | 与非 |

工具节点：

| 节点 | 说明 |
|------|------|
| `Is Null` | 检查值是否为空 |
| `Select` | 根据条件选择 A 或 B (三元运算) |

## 调试节点 (Debug)

| 节点 | 说明 |
|------|------|
| `Print` | 输出到控制台 |

## 自动生成的组件节点

使用 `@BlueprintExpose` 装饰器标记的组件会自动生成节点：

```typescript
@ECSComponent('Transform')
@BlueprintExpose({ displayName: '变换', category: 'core' })
export class TransformComponent extends Component {
    @BlueprintProperty({ displayName: 'X 坐标' })
    x: number = 0;

    @BlueprintProperty({ displayName: 'Y 坐标' })
    y: number = 0;

    @BlueprintMethod({ displayName: '移动' })
    translate(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}
```

生成的节点：
- **Get Transform** - 获取 Transform 组件
- **Get X 坐标** / **Set X 坐标** - 访问 x 属性
- **Get Y 坐标** / **Set Y 坐标** - 访问 y 属性
- **移动** - 调用 translate 方法

---
title: "数学库"
description: "ESEngine 数学库 - Vector2, Fixed32, FixedVector2, Color 等数学类型"
---

`@esengine/ecs-framework-math` 模块提供游戏开发常用的数学类型和运算。

## 核心类型

| 类型 | 说明 |
|------|------|
| `Vector2` | 2D 浮点向量，用于位置、速度、方向 |
| `Fixed32` | Q16.16 定点数，用于帧同步确定性计算 |
| `FixedVector2` | 2D 定点向量，用于确定性物理 |
| `Color` | RGBA 颜色 |

## 功能特性

### Vector2

- 加法、减法、缩放
- 点积、叉积
- 长度、归一化
- 距离、插值
- 旋转、角度转换

### Fixed32 定点数

专为帧同步网络游戏设计，保证跨平台计算一致性：

- 基本运算：加、减、乘、除
- 数学函数：绝对值、平方根、取整
- 比较、钳制、插值
- 常量：0、1、0.5、π、2π

### Color 颜色

- RGB/RGBA 创建与分解
- Hex 十六进制转换
- HSL 色彩空间转换
- 颜色操作：提亮、变暗、饱和度调整
- 颜色混合与插值

## 蓝图支持

数学库提供了丰富的蓝图节点，详见：

- [数学库蓝图节点](/modules/math/blueprint-nodes)

## 安装

```bash
pnpm add @esengine/ecs-framework-math
```

## 基本用法

```typescript
import { Vector2, Fixed32, FixedVector2, Color } from '@esengine/ecs-framework-math';

// Vector2
const pos = new Vector2(10, 20);
const dir = pos.normalized();

// Fixed32 (帧同步)
const speed = Fixed32.from(5.0);
const dt = Fixed32.from(0.016);
const distance = speed.mul(dt);

// FixedVector2
const fixedPos = FixedVector2.from(10, 20);
const fixedVel = FixedVector2.from(1, 0);
const newPos = fixedPos.add(fixedVel);

// Color
const red = Color.RED;
const blue = Color.BLUE;
const purple = Color.lerp(red, blue, 0.5);
```

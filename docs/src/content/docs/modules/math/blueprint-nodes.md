---
title: "数学库蓝图节点"
description: "Math 模块提供的蓝图节点 - Vector2、Fixed32、FixedVector2、Color"
---

本文档介绍 `@esengine/ecs-framework-math` 模块提供的蓝图节点。

> **注意**：这些节点需要安装 math 模块才能使用。

<script src="/js/blueprint-graph.js"></script>

## 引脚类型说明

<div class="bp-legend">
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#7ecd32" stroke-width="2"/></svg> 浮点数 (Float)</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#2196F3" stroke-width="2"/></svg> Vector2</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#9C27B0" stroke-width="2"/></svg> Fixed32</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#673AB7" stroke-width="2"/></svg> FixedVector2</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#FF9800" stroke-width="2"/></svg> Color</div>
</div>

---

## Vector2 节点

2D 向量操作，用于位置、速度、方向计算。

### 节点列表

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Make Vector2` | 从 X, Y 创建 Vector2 | X, Y | Vector2 |
| `Break Vector2` | 分解 Vector2 为 X, Y | Vector | X, Y |
| `Vector2 +` | 向量加法 | A, B | Vector2 |
| `Vector2 -` | 向量减法 | A, B | Vector2 |
| `Vector2 *` | 向量缩放 | Vector, Scalar | Vector2 |
| `Vector2 Length` | 获取向量长度 | Vector | Float |
| `Vector2 Normalize` | 归一化为单位向量 | Vector | Vector2 |
| `Vector2 Dot` | 点积 | A, B | Float |
| `Vector2 Cross` | 2D 叉积 | A, B | Float |
| `Vector2 Distance` | 两点距离 | A, B | Float |
| `Vector2 Lerp` | 线性插值 | A, B, T | Vector2 |
| `Vector2 Rotate` | 旋转（弧度） | Vector, Angle | Vector2 |
| `Vector2 From Angle` | 从角度创建单位向量 | Angle | Vector2 |

### 示例：计算移动方向

从起点到终点的方向向量：

<div class="bp-graph" data-connections='[{"from":"v2-start","to":"v2-sub-a","type":"vector2"},{"from":"v2-end","to":"v2-sub-b","type":"vector2"},{"from":"v2-sub-result","to":"v2-norm-in","type":"vector2"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 130px;">
    <div class="bp-node-header math" style="background: #2196F3;">Make Vector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-start"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 180px; width: 130px;">
    <div class="bp-node-header math" style="background: #2196F3;">Make Vector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">100</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">50</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-end"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 220px; top: 90px; width: 120px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 -</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-sub-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-sub-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-sub-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 400px; top: 55px; width: 140px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 Normalize</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-norm-in"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
</div>

### 示例：圆周运动

使用角度和半径计算圆周位置：

<div class="bp-graph" data-connections='[{"from":"v2-angle-out","to":"v2-scale-vec","type":"vector2"},{"from":"v2-scale-result","to":"v2-add-b","type":"vector2"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 40px; width: 150px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 From Angle</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Angle</span>
        <span class="bp-pin-value">1.57</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-angle-out"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 230px; top: 40px; width: 120px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 *</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-scale-vec"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Scalar</span>
        <span class="bp-pin-value">50</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-scale-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 420px; top: 40px; width: 120px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 +</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#2196F3" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">A (Center)</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-add-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Position</span>
      </div>
    </div>
  </div>
</div>

---

## Fixed32 定点数节点

Q16.16 定点数运算，适用于帧同步网络游戏，保证跨平台计算一致性。

### 节点列表

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Fixed32 From Float` | 从浮点数创建 | Float | Fixed32 |
| `Fixed32 From Int` | 从整数创建 | Int | Fixed32 |
| `Fixed32 To Float` | 转换为浮点数 | Fixed32 | Float |
| `Fixed32 To Int` | 转换为整数 | Fixed32 | Int |
| `Fixed32 +` | 加法 | A, B | Fixed32 |
| `Fixed32 -` | 减法 | A, B | Fixed32 |
| `Fixed32 *` | 乘法 | A, B | Fixed32 |
| `Fixed32 /` | 除法 | A, B | Fixed32 |
| `Fixed32 Abs` | 绝对值 | Value | Fixed32 |
| `Fixed32 Sqrt` | 平方根 | Value | Fixed32 |
| `Fixed32 Floor` | 向下取整 | Value | Fixed32 |
| `Fixed32 Ceil` | 向上取整 | Value | Fixed32 |
| `Fixed32 Round` | 四舍五入 | Value | Fixed32 |
| `Fixed32 Sign` | 符号 (-1, 0, 1) | Value | Fixed32 |
| `Fixed32 Min` | 最小值 | A, B | Fixed32 |
| `Fixed32 Max` | 最大值 | A, B | Fixed32 |
| `Fixed32 Clamp` | 钳制范围 | Value, Min, Max | Fixed32 |
| `Fixed32 Lerp` | 线性插值 | A, B, T | Fixed32 |

### 示例：帧同步移动速度计算

<div class="bp-graph" data-connections='[{"from":"f32-speed","to":"f32-mul-a","type":"fixed32"},{"from":"f32-dt","to":"f32-mul-b","type":"fixed32"},{"from":"f32-mul-result","to":"f32-tofloat","type":"fixed32"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 150px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 From Float</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Value</span>
        <span class="bp-pin-value">5.0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="f32-speed"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">Speed</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 160px; width: 150px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 From Float</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Value</span>
        <span class="bp-pin-value">0.016</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="f32-dt"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">DeltaTime</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 240px; top: 75px; width: 120px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 *</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="f32-mul-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="f32-mul-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="f32-mul-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 430px; top: 75px; width: 150px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 To Float</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="f32-tofloat"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">Fixed</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Float</span>
      </div>
    </div>
  </div>
</div>

---

## FixedVector2 定点向量节点

定点向量运算，用于确定性物理计算，适用于帧同步。

### 节点列表

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Make FixedVector2` | 从 X, Y 浮点数创建 | X, Y | FixedVector2 |
| `Break FixedVector2` | 分解为 X, Y 浮点数 | Vector | X, Y |
| `FixedVector2 +` | 向量加法 | A, B | FixedVector2 |
| `FixedVector2 -` | 向量减法 | A, B | FixedVector2 |
| `FixedVector2 *` | 按 Fixed32 缩放 | Vector, Scalar | FixedVector2 |
| `FixedVector2 Negate` | 取反 | Vector | FixedVector2 |
| `FixedVector2 Length` | 获取长度 | Vector | Fixed32 |
| `FixedVector2 Normalize` | 归一化 | Vector | FixedVector2 |
| `FixedVector2 Dot` | 点积 | A, B | Fixed32 |
| `FixedVector2 Cross` | 2D 叉积 | A, B | Fixed32 |
| `FixedVector2 Distance` | 两点距离 | A, B | Fixed32 |
| `FixedVector2 Lerp` | 线性插值 | A, B, T | FixedVector2 |

### 示例：确定性位置更新

<div class="bp-graph" data-connections='[{"from":"fv2-pos","to":"fv2-add-a","type":"fixedvector2"},{"from":"fv2-vel","to":"fv2-add-b","type":"fixedvector2"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 150px;">
    <div class="bp-node-header math" style="background: #673AB7;">Make FixedVector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">10</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">20</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="fv2-pos"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">Position</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 180px; width: 150px;">
    <div class="bp-node-header math" style="background: #673AB7;">Make FixedVector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">1</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="fv2-vel"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">Velocity</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 250px; top: 90px; width: 140px;">
    <div class="bp-node-header math" style="background: #673AB7;">FixedVector2 +</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="fv2-add-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="fv2-add-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">New Position</span>
      </div>
    </div>
  </div>
</div>

---

## Color 颜色节点

颜色创建与操作节点。

### 节点列表

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Make Color` | 从 RGBA 创建 | R, G, B, A | Color |
| `Break Color` | 分解为 RGBA | Color | R, G, B, A |
| `Color From Hex` | 从十六进制字符串创建 | Hex | Color |
| `Color To Hex` | 转换为十六进制字符串 | Color | String |
| `Color From HSL` | 从 HSL 创建 | H, S, L | Color |
| `Color To HSL` | 转换为 HSL | Color | H, S, L |
| `Color Lerp` | 颜色插值 | A, B, T | Color |
| `Color Lighten` | 提亮 | Color, Amount | Color |
| `Color Darken` | 变暗 | Color, Amount | Color |
| `Color Saturate` | 增加饱和度 | Color, Amount | Color |
| `Color Desaturate` | 降低饱和度 | Color, Amount | Color |
| `Color Invert` | 反色 | Color | Color |
| `Color Grayscale` | 灰度化 | Color | Color |
| `Color Luminance` | 获取亮度 | Color | Float |

### 颜色常量

| 节点 | 值 |
|------|------|
| `Color White` | (1, 1, 1, 1) |
| `Color Black` | (0, 0, 0, 1) |
| `Color Red` | (1, 0, 0, 1) |
| `Color Green` | (0, 1, 0, 1) |
| `Color Blue` | (0, 0, 1, 1) |
| `Color Transparent` | (0, 0, 0, 0) |

### 示例：颜色过渡动画

<div class="bp-graph" data-connections='[{"from":"color-a","to":"color-lerp-a","type":"color"},{"from":"color-b","to":"color-lerp-b","type":"color"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 120px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color Red</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="color-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 130px; width: 120px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color Blue</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="color-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 220px; top: 50px; width: 130px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color Lerp</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="color-lerp-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="color-lerp-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">T</span>
        <span class="bp-pin-value">0.5</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
</div>

### 示例：从 Hex 创建颜色

<div class="bp-graph" data-connections='[{"from":"hex-color","to":"break-color","type":"color"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 30px; width: 150px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color From Hex</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Hex</span>
        <span class="bp-pin-value">"#FF5722"</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="hex-color"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 250px; top: 20px; width: 130px;">
    <div class="bp-node-header math" style="background: #FF9800;">Break Color</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="break-color"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">R</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">G</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
    </div>
  </div>
</div>

---

## 相关文档

- [蓝图节点参考](/modules/blueprint/nodes) - 核心蓝图节点
- [蓝图编辑器指南](/modules/blueprint/editor-guide) - 编辑器使用方法
- [自定义节点](/modules/blueprint/custom-nodes) - 创建自定义节点

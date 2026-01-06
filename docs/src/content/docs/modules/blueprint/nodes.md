---
title: "ECS 节点参考"
description: "蓝图内置 ECS 操作节点完整参考"
---

本文档提供蓝图系统所有内置节点的完整参考，包含可视化示例。

## 引脚类型说明

<div class="bp-legend">
  <div class="bp-legend-item"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff" stroke="#fff" stroke-width="1"/></svg> 执行流 (Exec)</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#00a0e0" stroke-width="2"/></svg> 实体 (Entity)</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#7030c0" stroke-width="2"/></svg> 组件 (Component)</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#7ecd32" stroke-width="2"/></svg> 数值 (Float)</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#e060e0" stroke-width="2"/></svg> 字符串 (String)</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#8c0000" stroke-width="2"/></svg> 布尔 (Boolean)</div>
</div>

## 事件节点

生命周期事件，作为蓝图执行的入口点：

| 节点 | 说明 | 输出 |
|------|------|------|
| `EventBeginPlay` | 蓝图启动时触发 | Exec, Self (Entity) |
| `EventTick` | 每帧触发 | Exec, Delta Time |
| `EventEndPlay` | 蓝图停止时触发 | Exec |

### 示例：游戏初始化

<div class="bp-graph" style="" data-connections='[{"from":"beginplay-exec","to":"print-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="beginplay-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Self</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 170px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="print-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Message</span>
        <span class="bp-pin-value">"游戏开始!"</span>
      </div>
    </div>
  </div>
</div>

### 示例：每帧移动

<div class="bp-graph" style="" data-connections='[{"from":"tick-exec","to":"setprop-exec","type":"exec"},{"from":"tick-delta","to":"mul-a","type":"float"},{"from":"mul-result","to":"setprop-x","type":"float"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 140px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event Tick</span>
      <span class="bp-header-exec" data-pin="tick-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="tick-delta"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Delta Time</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 200px; top: 110px; width: 120px;">
    <div class="bp-node-header math">Multiply</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="mul-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">B</span>
        <span class="bp-pin-value">100</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="mul-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 380px; top: 20px; width: 150px;">
    <div class="bp-node-header function">Set Property</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="setprop-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7030c0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Target</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="setprop-x"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">x</span>
      </div>
    </div>
  </div>
</div>

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
| `Find Entity By Name` | 按名称查找实体 | 纯节点 |
| `Find Entities By Tag` | 按标签查找所有实体 | 纯节点 |

### 示例：创建子弹

<div class="bp-graph" style="" data-connections='[{"from":"bp-exec","to":"create-exec","type":"exec"},{"from":"create-exec-out","to":"add-exec","type":"exec"},{"from":"create-entity","to":"add-entity","type":"entity"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="bp-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Self</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 150px;">
    <div class="bp-node-header function">Create Entity</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="create-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="create-exec-out"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="create-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 520px; top: 20px; width: 150px;">
    <div class="bp-node-header function">Add Transform</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="add-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="add-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
    </div>
  </div>
</div>

## 组件节点 (Component)

读写组件属性：

| 节点 | 说明 | 类型 |
|------|------|------|
| `Get Component` | 从实体获取指定类型组件 | 纯节点 |
| `Has Component` | 检查实体是否拥有指定组件 | 纯节点 |
| `Add Component` | 为实体添加组件 | 执行节点 |
| `Remove Component` | 从实体移除组件 | 执行节点 |
| `Get Property` | 获取组件属性值 | 纯节点 |
| `Set Property` | 设置组件属性值 | 执行节点 |

### 示例：修改位置

<div class="bp-graph" style="" data-connections='[{"from":"self-entity","to":"getcomp-entity","type":"entity"},{"from":"getcomp-transform","to":"getprop-target","type":"component"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 100px;">
    <div class="bp-node-header pure">Get Self</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="self-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 200px; top: 20px; width: 150px;">
    <div class="bp-node-header pure">Get Component</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="getcomp-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="getcomp-transform"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7030c0"/></svg></span>
        <span class="bp-pin-label">Transform</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 430px; top: 20px; width: 120px;">
    <div class="bp-node-header pure">Get Property</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="getprop-target"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7030c0"/></svg></span>
        <span class="bp-pin-label">Target</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">x</span>
      </div>
    </div>
  </div>
</div>

## 流程控制节点

控制蓝图执行流程：

| 节点 | 说明 |
|------|------|
| `Branch` | 条件分支（if/else） |
| `Sequence` | 按顺序执行多个分支 |
| `For Loop` | 指定次数循环 |
| `For Each` | 遍历数组元素 |
| `While Loop` | 条件循环 |
| `Do Once` | 仅执行一次 |
| `Flip Flop` | 交替执行 A/B |
| `Gate` | 门控开关 |

### 示例：条件分支

<div class="bp-graph" style="" data-connections='[{"from":"cond-exec","to":"branch-exec","type":"exec"},{"from":"cond-result","to":"branch-cond","type":"bool"},{"from":"branch-true","to":"print1-exec","type":"exec"},{"from":"branch-false","to":"print2-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 60px; width: 120px;">
    <div class="bp-node-header pure">Condition</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="cond-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="cond-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#8c0000"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 220px; top: 60px; width: 110px;">
    <div class="bp-node-header flow">Branch</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="branch-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="branch-cond"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#8c0000"/></svg></span>
        <span class="bp-pin-label">Cond</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="branch-true"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">True</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="branch-false"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">False</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 420px; top: 20px; width: 120px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="print1-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Msg</span>
        <span class="bp-pin-value">"是"</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 420px; top: 130px; width: 120px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="print2-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Msg</span>
        <span class="bp-pin-value">"否"</span>
      </div>
    </div>
  </div>
</div>

### 示例：For 循环

<div class="bp-graph" style="" data-connections='[{"from":"forloop-bp-exec","to":"forloop-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="forloop-bp-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 150px;">
    <div class="bp-node-header flow">For Loop</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="forloop-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#1cc4c4" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">First</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#1cc4c4" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Last</span>
        <span class="bp-pin-value">10</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Body</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#1cc4c4"/></svg></span>
        <span class="bp-pin-label">Index</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Done</span>
      </div>
    </div>
  </div>
</div>

## 时间节点

| 节点 | 说明 | 输出 |
|------|------|------|
| `Delay` | 延迟执行指定秒数 | Exec |
| `Get Delta Time` | 获取帧间隔时间 | Float |
| `Get Time` | 获取运行总时间 | Float |

### 示例：延迟执行

<div class="bp-graph" style="" data-connections='[{"from":"delay-bp-exec","to":"delay-exec","type":"exec"},{"from":"delay-done","to":"delay-print-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="delay-bp-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 120px;">
    <div class="bp-node-header time">Delay</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="delay-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Duration</span>
        <span class="bp-pin-value">2.0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="delay-done"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Done</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 490px; top: 20px; width: 130px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="delay-print-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Msg</span>
        <span class="bp-pin-value">"2秒后"</span>
      </div>
    </div>
  </div>
</div>

## 数学节点

### 基础运算

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Add` | 加法 | A, B | A + B |
| `Subtract` | 减法 | A, B | A - B |
| `Multiply` | 乘法 | A, B | A × B |
| `Divide` | 除法 | A, B | A / B |
| `Modulo` | 取模 | A, B | A % B |

### 数学函数

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Abs` | 绝对值 | Value | \|Value\| |
| `Sqrt` | 平方根 | Value | √Value |
| `Pow` | 幂运算 | Base, Exp | Base^Exp |
| `Floor` | 向下取整 | Value | ⌊Value⌋ |
| `Ceil` | 向上取整 | Value | ⌈Value⌉ |
| `Round` | 四舍五入 | Value | round(Value) |
| `Clamp` | 区间钳制 | Value, Min, Max | min(max(V, Min), Max) |
| `Lerp` | 线性插值 | A, B, Alpha | A + (B-A) × Alpha |
| `Min` | 取最小值 | A, B | min(A, B) |
| `Max` | 取最大值 | A, B | max(A, B) |

### 三角函数

| 节点 | 说明 |
|------|------|
| `Sin` | 正弦 |
| `Cos` | 余弦 |
| `Tan` | 正切 |
| `Asin` | 反正弦 |
| `Acos` | 反余弦 |
| `Atan` | 反正切 |
| `Atan2` | 二参数反正切 |

### 随机数

| 节点 | 说明 | 输入 | 输出 |
|------|------|------|------|
| `Random` | 随机浮点数 [0, 1) | - | Float |
| `Random Range` | 范围内随机数 | Min, Max | Float |
| `Random Int` | 随机整数 | Min, Max | Int |

### 比较节点

| 节点 | 说明 | 输出 |
|------|------|------|
| `Equal` | A == B | Boolean |
| `Not Equal` | A != B | Boolean |
| `Greater` | A > B | Boolean |
| `Greater Or Equal` | A >= B | Boolean |
| `Less` | A < B | Boolean |
| `Less Or Equal` | A <= B | Boolean |

### 扩展数学节点

> **Vector2、Fixed32、FixedVector2、Color** 等高级数学节点由 `@esengine/ecs-framework-math` 模块提供。
>
> 详见：[数学库蓝图节点](/modules/math/blueprint-nodes)

### 示例：钳制数值

<div class="bp-graph" style="" data-connections='[{"from":"rand-result","to":"clamp-value","type":"float"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 130px;">
    <div class="bp-node-header math">Random Range</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Min</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Max</span>
        <span class="bp-pin-value">100</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="rand-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 240px; top: 20px; width: 130px;">
    <div class="bp-node-header math">Clamp</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="clamp-value"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Value</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Min</span>
        <span class="bp-pin-value">20</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Max</span>
        <span class="bp-pin-value">80</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
</div>

## 变量节点

蓝图定义的变量会自动生成 Get 和 Set 节点：

| 节点 | 说明 | 类型 |
|------|------|------|
| `Get <变量名>` | 读取变量值 | 纯节点 |
| `Set <变量名>` | 设置变量值 | 执行节点 |

## 调试节点

| 节点 | 说明 |
|------|------|
| `Print` | 输出消息到控制台 |

## 相关文档

- [数学库蓝图节点](/modules/math/blueprint-nodes) - Vector2、Fixed32、Color 等数学节点
- [蓝图编辑器指南](/modules/blueprint/editor-guide) - 学习如何使用编辑器
- [自定义节点](/modules/blueprint/custom-nodes) - 创建自定义节点
- [蓝图虚拟机](/modules/blueprint/vm) - 运行时 API

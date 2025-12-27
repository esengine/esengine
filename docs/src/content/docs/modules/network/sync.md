---
title: "状态同步"
description: "插值、预测和快照缓冲区"
---

## 快照缓冲区

用于存储服务器状态快照并进行插值：

```typescript
import { createSnapshotBuffer, type IStateSnapshot } from '@esengine/network';

const buffer = createSnapshotBuffer<IStateSnapshot>({
    maxSnapshots: 30,          // 最大快照数
    interpolationDelay: 100    // 插值延迟 (ms)
});

// 添加快照
buffer.addSnapshot({
    time: serverTime,
    entities: states
});

// 获取插值状态
const interpolated = buffer.getInterpolatedState(clientTime);
```

### 配置选项

| 属性 | 类型 | 描述 |
|------|------|------|
| `maxSnapshots` | `number` | 缓冲区最大快照数 |
| `interpolationDelay` | `number` | 插值延迟（毫秒） |

## 变换插值器

### 线性插值器

适用于简单的位置插值：

```typescript
import { createTransformInterpolator } from '@esengine/network';

const interpolator = createTransformInterpolator();

// 添加状态
interpolator.addState(time, { x: 0, y: 0, rotation: 0 });

// 获取插值结果
const state = interpolator.getInterpolatedState(currentTime);
```

### Hermite 插值器

使用 Hermite 样条实现更平滑的插值，适合需要考虑速度的场景：

```typescript
import { createHermiteTransformInterpolator } from '@esengine/network';

const interpolator = createHermiteTransformInterpolator({
    bufferSize: 10
});

// 添加带速度的状态
interpolator.addState(time, {
    x: 100,
    y: 200,
    rotation: 0,
    vx: 5,
    vy: 0
});

// 获取平滑的插值结果
const state = interpolator.getInterpolatedState(currentTime);
```

### 插值器对比

| 类型 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 线性插值 | 简单、计算快 | 可能不平滑 | 简单移动 |
| Hermite 插值 | 平滑、考虑速度 | 计算量较大 | 高速移动 |

## 客户端预测

实现客户端预测和服务器校正，减少输入延迟：

```typescript
import { createClientPrediction } from '@esengine/network';

const prediction = createClientPrediction({
    maxPredictedInputs: 60,
    reconciliationThreshold: 0.1
});

// 预测输入
const seq = prediction.predict(inputState, currentState, (state, input) => {
    // 应用输入到状态
    return applyInput(state, input);
});

// 服务器校正
const corrected = prediction.reconcile(
    serverState,
    serverSeq,
    (state, input) => applyInput(state, input)
);
```

### 预测配置

| 属性 | 类型 | 描述 |
|------|------|------|
| `maxPredictedInputs` | `number` | 最大预测输入数 |
| `reconciliationThreshold` | `number` | 校正阈值 |

### 工作流程

```
客户端                              服务器
   │                                   │
   ├─ 1. 本地预测输入 ──────────────────►
   │                                   │
   ├─ 2. 发送输入到服务器              │
   │                                   │
   │                                   ├─ 3. 处理输入
   │                                   │
   ◄──────────────────── 4. 返回权威状态
   │                                   │
   ├─ 5. 校正本地状态                  │
   │                                   │
```

## 使用建议

### 插值延迟设置

- **低延迟网络**（局域网）：50-100ms
- **普通网络**：100-150ms
- **高延迟网络**：150-200ms

```typescript
const buffer = createSnapshotBuffer({
    interpolationDelay: 100  // 根据网络情况调整
});
```

### 预测校正

对于本地玩家使用客户端预测：

```typescript
// 本地玩家：预测 + 校正
if (identity.bIsLocalPlayer) {
    const predicted = prediction.predict(input, state, applyInput);
    // 使用预测状态渲染
}

// 远程玩家：纯插值
if (!identity.bIsLocalPlayer) {
    const interpolated = interpolator.getInterpolatedState(time);
    // 使用插值状态渲染
}
```

## 最佳实践

1. **合理设置插值延迟**：太小会导致抖动，太大会增加延迟感

2. **客户端预测仅用于本地玩家**：远程玩家使用插值

3. **校正阈值**：根据游戏精度需求设置合适的阈值

4. **快照数量**：保持足够的快照以应对网络抖动

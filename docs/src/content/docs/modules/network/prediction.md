---
title: "客户端预测"
description: "本地输入预测和服务器校正"
---

客户端预测是网络游戏中用于减少输入延迟的关键技术。通过在本地立即应用玩家输入，同时等待服务器确认，可以让游戏感觉更加流畅响应。

## NetworkPredictionSystem

`NetworkPredictionSystem` 是专门处理本地玩家预测的 ECS 系统。

### 基本用法

```typescript
import { NetworkPlugin } from '@esengine/network';

const networkPlugin = new NetworkPlugin({
    enablePrediction: true,
    predictionConfig: {
        moveSpeed: 200,           // 移动速度（单位/秒）
        maxUnacknowledgedInputs: 60,  // 最大未确认输入数
        reconciliationThreshold: 0.5,  // 校正阈值
        reconciliationSpeed: 10,       // 校正速度
    }
});

await Core.installPlugin(networkPlugin);
```

### 设置本地玩家

当本地玩家实体生成后，需要设置其网络 ID：

```typescript
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bHasAuthority = spawn.ownerId === networkPlugin.localPlayerId;
    identity.bIsLocalPlayer = identity.bHasAuthority;

    entity.addComponent(new NetworkTransform());

    // 设置本地玩家用于预测
    if (identity.bIsLocalPlayer) {
        networkPlugin.setLocalPlayerNetId(spawn.netId);
    }

    return entity;
});
```

### 发送输入

```typescript
// 在游戏循环中发送移动输入
function onUpdate() {
    const moveX = Input.getAxis('horizontal');
    const moveY = Input.getAxis('vertical');

    if (moveX !== 0 || moveY !== 0) {
        networkPlugin.sendMoveInput(moveX, moveY);
    }

    // 发送动作输入
    if (Input.isPressed('attack')) {
        networkPlugin.sendActionInput('attack');
    }
}
```

## 预测配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `moveSpeed` | `number` | 200 | 移动速度（单位/秒） |
| `enabled` | `boolean` | true | 是否启用预测 |
| `maxUnacknowledgedInputs` | `number` | 60 | 最大未确认输入数 |
| `reconciliationThreshold` | `number` | 0.5 | 触发校正的位置差异阈值 |
| `reconciliationSpeed` | `number` | 10 | 校正平滑速度 |

## 工作原理

```
客户端                              服务器
   │                                   │
   ├─ 1. 捕获输入 (seq=1)              │
   ├─ 2. 本地预测移动                   │
   ├─ 3. 发送输入到服务器 ──────────────►
   │                                   │
   ├─ 4. 继续捕获输入 (seq=2,3...)     │
   ├─ 5. 继续本地预测                   │
   │                                   │
   │                                   ├─ 6. 处理输入 (seq=1)
   │                                   │
   ◄──────── 7. 返回状态 (ackSeq=1) ────
   │                                   │
   ├─ 8. 比较预测和服务器状态           │
   ├─ 9. 重放 seq=2,3... 的输入        │
   ├─ 10. 平滑校正到正确位置            │
   │                                   │
```

### 步骤详解

1. **输入捕获**：捕获玩家输入并分配序列号
2. **本地预测**：立即应用输入到本地状态
3. **发送输入**：将输入发送到服务器
4. **缓存输入**：保存输入用于后续校正
5. **接收确认**：服务器返回权威状态和已确认序列号
6. **状态比较**：比较预测状态和服务器状态
7. **输入重放**：使用缓存的未确认输入重新计算状态
8. **平滑校正**：平滑插值到正确位置

## 底层 API

如果需要更细粒度的控制，可以直接使用 `ClientPrediction` 类：

```typescript
import { createClientPrediction, type IPredictor } from '@esengine/network';

// 定义状态类型
interface PlayerState {
    x: number;
    y: number;
    rotation: number;
}

// 定义输入类型
interface PlayerInput {
    dx: number;
    dy: number;
}

// 定义预测器
const predictor: IPredictor<PlayerState, PlayerInput> = {
    predict(state: PlayerState, input: PlayerInput, dt: number): PlayerState {
        return {
            x: state.x + input.dx * MOVE_SPEED * dt,
            y: state.y + input.dy * MOVE_SPEED * dt,
            rotation: state.rotation,
        };
    }
};

// 创建客户端预测
const prediction = createClientPrediction(predictor, {
    maxUnacknowledgedInputs: 60,
    reconciliationThreshold: 0.5,
    reconciliationSpeed: 10,
});

// 记录输入并获取预测状态
const input = { dx: 1, dy: 0 };
const predictedState = prediction.recordInput(input, currentState, deltaTime);

// 获取要发送的输入
const inputToSend = prediction.getInputToSend();

// 与服务器状态校正
prediction.reconcile(
    serverState,
    serverAckSeq,
    (state) => ({ x: state.x, y: state.y }),
    deltaTime
);

// 获取校正偏移
const offset = prediction.correctionOffset;
```

## 启用/禁用预测

```typescript
// 运行时切换预测
networkPlugin.setPredictionEnabled(false);

// 检查预测状态
if (networkPlugin.isPredictionEnabled) {
    console.log('Prediction is active');
}
```

## 最佳实践

### 1. 合理设置校正阈值

```typescript
// 动作游戏：较低阈值，更精确
predictionConfig: {
    reconciliationThreshold: 0.1,
}

// 休闲游戏：较高阈值，更平滑
predictionConfig: {
    reconciliationThreshold: 1.0,
}
```

### 2. 预测仅用于本地玩家

远程玩家应使用插值而非预测：

```typescript
const identity = entity.getComponent(NetworkIdentity);

if (identity.bIsLocalPlayer) {
    // 使用预测系统
} else {
    // 使用 NetworkSyncSystem 的插值
}
```

### 3. 处理高延迟

```typescript
// 高延迟网络增加缓冲
predictionConfig: {
    maxUnacknowledgedInputs: 120,  // 增加缓冲
    reconciliationSpeed: 5,        // 减慢校正速度
}
```

### 4. 确定性预测

确保客户端和服务器使用相同的物理计算：

```typescript
// 使用固定时间步长
const FIXED_DT = 1 / 60;

function applyInput(state: PlayerState, input: PlayerInput): PlayerState {
    // 使用固定时间步长而非实际 deltaTime
    return {
        x: state.x + input.dx * MOVE_SPEED * FIXED_DT,
        y: state.y + input.dy * MOVE_SPEED * FIXED_DT,
        rotation: state.rotation,
    };
}
```

## 调试

```typescript
// 获取预测系统实例
const predictionSystem = networkPlugin.predictionSystem;

if (predictionSystem) {
    console.log('Pending inputs:', predictionSystem.pendingInputCount);
    console.log('Current sequence:', predictionSystem.inputSequence);
}
```

---
title: "AOI 兴趣区域"
description: "视野管理与进入/离开事件"
---

AOI (Area of Interest) 用于追踪实体之间的可见性关系，常用于 MMO 同步和 NPC AI 感知。

## createGridAOI

```typescript
function createGridAOI<T>(cellSize?: number): GridAOI<T>
```

创建基于网格的 AOI 管理器。

**参数：**
- `cellSize` - 网格单元格大小（建议为平均视野范围的 1-2 倍）

## 观察者管理

### addObserver

添加观察者：

```typescript
aoi.addObserver(player, position, {
    viewRange: 200,      // 视野范围
    observable: true     // 是否可被其他观察者看到（默认 true）
});

// NPC 只观察不被观察
aoi.addObserver(camera, position, {
    viewRange: 500,
    observable: false
});
```

### removeObserver

移除观察者：

```typescript
aoi.removeObserver(player);
```

### updatePosition

更新位置（自动触发进入/离开事件）：

```typescript
aoi.updatePosition(player, newPosition);
```

### updateViewRange

更新视野范围：

```typescript
// 获得增益后视野扩大
aoi.updateViewRange(player, 300);
```

## 查询方法

### getEntitiesInView

获取观察者视野内的所有实体：

```typescript
const visible = aoi.getEntitiesInView(player);
for (const entity of visible) {
    updateEntityForPlayer(player, entity);
}
```

### getObserversOf

获取能看到指定实体的所有观察者：

```typescript
const observers = aoi.getObserversOf(monster);
for (const observer of observers) {
    notifyMonsterMoved(observer, monster);
}
```

### canSee

检查是否可见：

```typescript
if (aoi.canSee(player, enemy)) {
    enemy.showHealthBar();
}
```

## 事件系统

### 全局事件监听

```typescript
aoi.addListener((event) => {
    switch (event.type) {
        case 'enter':
            console.log(`${event.observer} 看到了 ${event.target}`);
            break;
        case 'exit':
            console.log(`${event.target} 离开了 ${event.observer} 的视野`);
            break;
    }
});
```

### 实体特定事件监听

```typescript
// 只监听特定玩家的视野事件
aoi.addEntityListener(player, (event) => {
    if (event.type === 'enter') {
        sendToClient(player, 'entity_enter', event.target);
    } else if (event.type === 'exit') {
        sendToClient(player, 'entity_exit', event.target);
    }
});
```

### 事件类型

```typescript
interface IAOIEvent<T> {
    type: 'enter' | 'exit' | 'update';
    observer: T;  // 观察者（谁看到了变化）
    target: T;    // 目标（发生变化的对象）
    position: IVector2; // 目标位置
}
```

## 蓝图节点

- `GetEntitiesInView` - 获取视野内实体
- `GetObserversOf` - 获取观察者
- `CanSee` - 检查可见性
- `OnEntityEnterView` - 进入视野事件
- `OnEntityExitView` - 离开视野事件

## 服务令牌

在依赖注入场景中使用：

```typescript
import {
    SpatialIndexToken,
    SpatialQueryToken,
    AOIManagerToken,
    createGridSpatialIndex,
    createGridAOI
} from '@esengine/spatial';

// 注册服务
services.register(SpatialIndexToken, createGridSpatialIndex(100));
services.register(AOIManagerToken, createGridAOI(100));

// 获取服务
const spatialIndex = services.get(SpatialIndexToken);
const aoiManager = services.get(AOIManagerToken);
```

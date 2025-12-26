# 空间索引系统 (Spatial)

`@esengine/spatial` 提供了高效的空间查询和索引功能，包括范围查询、最近邻查询、射线检测和 AOI（兴趣区域）管理。

## 安装

```bash
npm install @esengine/spatial
```

## 快速开始

### 空间索引

```typescript
import { createGridSpatialIndex } from '@esengine/spatial';

// 创建空间索引（网格单元格大小为 100）
const spatialIndex = createGridSpatialIndex<Entity>(100);

// 插入对象
spatialIndex.insert(player, { x: 100, y: 200 });
spatialIndex.insert(enemy1, { x: 150, y: 250 });
spatialIndex.insert(enemy2, { x: 500, y: 600 });

// 查找半径内的对象
const nearby = spatialIndex.findInRadius({ x: 100, y: 200 }, 100);
console.log(nearby); // [player, enemy1]

// 查找最近的对象
const nearest = spatialIndex.findNearest({ x: 100, y: 200 });
console.log(nearest); // enemy1

// 更新位置
spatialIndex.update(player, { x: 120, y: 220 });
```

### AOI 兴趣区域

```typescript
import { createGridAOI } from '@esengine/spatial';

// 创建 AOI 管理器
const aoi = createGridAOI<Entity>(100);

// 添加观察者（玩家）
aoi.addObserver(player, { x: 100, y: 100 }, { viewRange: 200 });
aoi.addObserver(npc, { x: 150, y: 150 }, { viewRange: 150 });

// 监听进入/离开事件
aoi.addListener((event) => {
    if (event.type === 'enter') {
        console.log(`${event.observer} 看到了 ${event.target}`);
    } else if (event.type === 'exit') {
        console.log(`${event.target} 离开了 ${event.observer} 的视野`);
    }
});

// 更新位置（会自动触发进入/离开事件）
aoi.updatePosition(player, { x: 200, y: 200 });

// 获取视野内的实体
const visible = aoi.getEntitiesInView(player);
```

## 核心概念

### 空间索引 vs AOI

| 特性 | 空间索引 (SpatialIndex) | AOI (Area of Interest) |
|------|------------------------|------------------------|
| 用途 | 通用空间查询 | 实体可见性追踪 |
| 事件 | 无事件通知 | 进入/离开事件 |
| 方向 | 单向查询 | 双向追踪（谁看到谁） |
| 场景 | 碰撞检测、范围攻击 | MMO 同步、NPC AI 感知 |

### IBounds 边界框

```typescript
interface IBounds {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
}
```

### IRaycastHit 射线检测结果

```typescript
interface IRaycastHit<T> {
    readonly target: T;     // 命中的对象
    readonly point: IVector2; // 命中点坐标
    readonly normal: IVector2; // 命中点法线
    readonly distance: number; // 距离射线起点的距离
}
```

## 空间索引 API

### createGridSpatialIndex

```typescript
function createGridSpatialIndex<T>(cellSize?: number): GridSpatialIndex<T>
```

创建基于均匀网格的空间索引。

**参数：**
- `cellSize` - 网格单元格大小（默认 100）

**选择合适的 cellSize：**
- 太小：内存占用高，查询效率降低
- 太大：单元格内对象过多，遍历耗时
- 建议：设置为对象平均分布间距的 1-2 倍

### 管理方法

#### insert

插入对象到索引：

```typescript
spatialIndex.insert(enemy, { x: 100, y: 200 });
```

#### remove

移除对象：

```typescript
spatialIndex.remove(enemy);
```

#### update

更新对象位置：

```typescript
spatialIndex.update(enemy, { x: 150, y: 250 });
```

#### clear

清空索引：

```typescript
spatialIndex.clear();
```

### 查询方法

#### findInRadius

查找圆形范围内的所有对象：

```typescript
// 查找中心点 (100, 200) 半径 50 内的所有敌人
const enemies = spatialIndex.findInRadius(
    { x: 100, y: 200 },
    50,
    (entity) => entity.type === 'enemy' // 可选过滤器
);
```

#### findInRect

查找矩形区域内的所有对象：

```typescript
import { createBounds } from '@esengine/spatial';

const bounds = createBounds(0, 0, 200, 200);
const entities = spatialIndex.findInRect(bounds);
```

#### findNearest

查找最近的对象：

```typescript
// 查找最近的敌人（最大搜索距离 500）
const nearest = spatialIndex.findNearest(
    playerPosition,
    500, // maxDistance
    (entity) => entity.type === 'enemy'
);

if (nearest) {
    attackTarget(nearest);
}
```

#### findKNearest

查找最近的 K 个对象：

```typescript
// 查找最近的 5 个敌人
const nearestEnemies = spatialIndex.findKNearest(
    playerPosition,
    5,    // k
    500,  // maxDistance
    (entity) => entity.type === 'enemy'
);
```

#### raycast

射线检测（返回所有命中）：

```typescript
const hits = spatialIndex.raycast(
    origin,      // 射线起点
    direction,   // 射线方向（应归一化）
    maxDistance, // 最大检测距离
    filter       // 可选过滤器
);

// hits 按距离排序
for (const hit of hits) {
    console.log(`命中 ${hit.target} at ${hit.point}, 距离 ${hit.distance}`);
}
```

#### raycastFirst

射线检测（仅返回第一个命中）：

```typescript
const hit = spatialIndex.raycastFirst(origin, direction, 1000);
if (hit) {
    dealDamage(hit.target, calculateDamage(hit.distance));
}
```

### 属性

```typescript
// 获取索引中的对象数量
console.log(spatialIndex.count);

// 获取所有对象
const all = spatialIndex.getAll();
```

## AOI 兴趣区域 API

### createGridAOI

```typescript
function createGridAOI<T>(cellSize?: number): GridAOI<T>
```

创建基于网格的 AOI 管理器。

**参数：**
- `cellSize` - 网格单元格大小（建议为平均视野范围的 1-2 倍）

### 观察者管理

#### addObserver

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

#### removeObserver

移除观察者：

```typescript
aoi.removeObserver(player);
```

#### updatePosition

更新位置（自动触发进入/离开事件）：

```typescript
aoi.updatePosition(player, newPosition);
```

#### updateViewRange

更新视野范围：

```typescript
// 获得增益后视野扩大
aoi.updateViewRange(player, 300);
```

### 查询方法

#### getEntitiesInView

获取观察者视野内的所有实体：

```typescript
const visible = aoi.getEntitiesInView(player);
for (const entity of visible) {
    updateEntityForPlayer(player, entity);
}
```

#### getObserversOf

获取能看到指定实体的所有观察者：

```typescript
const observers = aoi.getObserversOf(monster);
for (const observer of observers) {
    notifyMonsterMoved(observer, monster);
}
```

#### canSee

检查是否可见：

```typescript
if (aoi.canSee(player, enemy)) {
    enemy.showHealthBar();
}
```

### 事件系统

#### 全局事件监听

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

#### 实体特定事件监听

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

#### 事件类型

```typescript
interface IAOIEvent<T> {
    type: 'enter' | 'exit' | 'update';
    observer: T;  // 观察者（谁看到了变化）
    target: T;    // 目标（发生变化的对象）
    position: IVector2; // 目标位置
}
```

## 工具函数

### 边界框创建

```typescript
import {
    createBounds,
    createBoundsFromCenter,
    createBoundsFromCircle
} from '@esengine/spatial';

// 从角点创建
const bounds1 = createBounds(0, 0, 100, 100);

// 从中心点和尺寸创建
const bounds2 = createBoundsFromCenter({ x: 50, y: 50 }, 100, 100);

// 从圆形创建（包围盒）
const bounds3 = createBoundsFromCircle({ x: 50, y: 50 }, 50);
```

### 几何检测

```typescript
import {
    isPointInBounds,
    boundsIntersect,
    boundsIntersectsCircle,
    distance,
    distanceSquared
} from '@esengine/spatial';

// 点在边界内？
if (isPointInBounds(point, bounds)) { ... }

// 两个边界框相交？
if (boundsIntersect(boundsA, boundsB)) { ... }

// 边界框与圆形相交？
if (boundsIntersectsCircle(bounds, center, radius)) { ... }

// 距离计算
const dist = distance(pointA, pointB);
const distSq = distanceSquared(pointA, pointB); // 更快，避免 sqrt
```

## 实际示例

### 范围攻击检测

```typescript
class CombatSystem {
    private spatialIndex: ISpatialIndex<Entity>;

    dealAreaDamage(center: IVector2, radius: number, damage: number): void {
        const targets = this.spatialIndex.findInRadius(
            center,
            radius,
            (entity) => entity.hasComponent(HealthComponent)
        );

        for (const target of targets) {
            const health = target.getComponent(HealthComponent);
            health.takeDamage(damage);
        }
    }

    findNearestEnemy(position: IVector2, team: string): Entity | null {
        return this.spatialIndex.findNearest(
            position,
            undefined, // 无距离限制
            (entity) => {
                const teamComp = entity.getComponent(TeamComponent);
                return teamComp && teamComp.team !== team;
            }
        );
    }
}
```

### MMO 同步系统

```typescript
class SyncSystem {
    private aoi: IAOIManager<Player>;

    constructor() {
        this.aoi = createGridAOI<Player>(100);

        // 监听进入/离开事件
        this.aoi.addListener((event) => {
            const packet = this.createSyncPacket(event);
            this.sendToPlayer(event.observer, packet);
        });
    }

    onPlayerJoin(player: Player): void {
        this.aoi.addObserver(player, player.position, {
            viewRange: player.viewRange
        });
    }

    onPlayerMove(player: Player, newPosition: IVector2): void {
        this.aoi.updatePosition(player, newPosition);
    }

    onPlayerLeave(player: Player): void {
        this.aoi.removeObserver(player);
    }

    // 广播给所有能看到某玩家的其他玩家
    broadcastToObservers(player: Player, packet: Packet): void {
        const observers = this.aoi.getObserversOf(player);
        for (const observer of observers) {
            this.sendToPlayer(observer, packet);
        }
    }
}
```

### NPC AI 感知

```typescript
class AIPerceptionSystem {
    private aoi: IAOIManager<Entity>;

    constructor() {
        this.aoi = createGridAOI<Entity>(50);
    }

    setupNPC(npc: Entity): void {
        const perception = npc.getComponent(PerceptionComponent);

        this.aoi.addObserver(npc, npc.position, {
            viewRange: perception.range
        });

        // 监听该 NPC 的感知事件
        this.aoi.addEntityListener(npc, (event) => {
            const ai = npc.getComponent(AIComponent);

            if (event.type === 'enter') {
                ai.onTargetDetected(event.target);
            } else if (event.type === 'exit') {
                ai.onTargetLost(event.target);
            }
        });
    }

    update(): void {
        // 更新所有 NPC 位置
        for (const npc of this.npcs) {
            this.aoi.updatePosition(npc, npc.position);
        }
    }
}
```

## 蓝图节点

### 空间查询节点

- `FindInRadius` - 查找半径内的对象
- `FindInRect` - 查找矩形内的对象
- `FindNearest` - 查找最近的对象
- `FindKNearest` - 查找最近的 K 个对象
- `Raycast` - 射线检测
- `RaycastFirst` - 射线检测（仅第一个）

### AOI 节点

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

## 性能优化

1. **选择合适的 cellSize**
   - 太小：内存占用高，单元格数量多
   - 太大：单元格内对象多，遍历慢
   - 经验法则：对象平均间距的 1-2 倍

2. **使用过滤器减少结果**
   ```typescript
   // 在空间查询阶段就过滤，而不是事后过滤
   spatialIndex.findInRadius(center, radius, (e) => e.type === 'enemy');
   ```

3. **使用 distanceSquared 代替 distance**
   ```typescript
   // 避免 sqrt 计算
   if (distanceSquared(a, b) < threshold * threshold) { ... }
   ```

4. **批量更新优化**
   ```typescript
   // 如果有大量对象同时移动，考虑禁用事件后批量更新
   ```

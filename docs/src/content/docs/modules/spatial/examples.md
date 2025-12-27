---
title: "实际示例"
description: "范围攻击、MMO 同步、AI 感知等场景"
---

## 范围攻击检测

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

## MMO 同步系统

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

## NPC AI 感知

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

## 技能目标选择

```typescript
class TargetingSystem {
    private spatialIndex: ISpatialIndex<Entity>;

    // 扇形范围技能
    findTargetsInCone(
        origin: IVector2,
        direction: IVector2,
        range: number,
        angle: number
    ): Entity[] {
        // 先用圆形范围粗筛
        const candidates = this.spatialIndex.findInRadius(origin, range);

        // 再精确筛选扇形内的目标
        return candidates.filter(entity => {
            const toEntity = normalize(subtract(entity.position, origin));
            const dot = dotProduct(direction, toEntity);
            const entityAngle = Math.acos(dot);
            return entityAngle <= angle / 2;
        });
    }

    // 射线穿透技能
    findTargetsOnLine(
        origin: IVector2,
        direction: IVector2,
        maxDistance: number,
        maxTargets: number
    ): Entity[] {
        const hits = this.spatialIndex.raycast(origin, direction, maxDistance);
        return hits.slice(0, maxTargets).map(hit => hit.target);
    }
}
```

## 动态障碍物避让

```typescript
class ObstacleAvoidanceSystem {
    private spatialIndex: ISpatialIndex<Entity>;

    calculateAvoidanceForce(entity: Entity, velocity: IVector2): IVector2 {
        const position = entity.position;
        const lookAhead = 50; // 前方检测距离

        // 检测前方障碍物
        const hit = this.spatialIndex.raycastFirst(
            position,
            normalize(velocity),
            lookAhead,
            (e) => e.hasComponent(ObstacleComponent)
        );

        if (!hit) return { x: 0, y: 0 };

        // 计算避让力
        const avoidDirection = normalize({
            x: hit.normal.y,
            y: -hit.normal.x
        });

        const urgency = 1 - (hit.distance / lookAhead);
        return scale(avoidDirection, urgency * 100);
    }
}
```

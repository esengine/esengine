---
title: "Examples"
description: "Area attacks, MMO sync, AI perception and more"
---

## Area Attack Detection

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
            undefined, // No distance limit
            (entity) => {
                const teamComp = entity.getComponent(TeamComponent);
                return teamComp && teamComp.team !== team;
            }
        );
    }
}
```

## MMO Sync System

```typescript
class SyncSystem {
    private aoi: IAOIManager<Player>;

    constructor() {
        this.aoi = createGridAOI<Player>(100);

        // Listen for enter/exit events
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

    // Broadcast to all players who can see a specific player
    broadcastToObservers(player: Player, packet: Packet): void {
        const observers = this.aoi.getObserversOf(player);
        for (const observer of observers) {
            this.sendToPlayer(observer, packet);
        }
    }
}
```

## NPC AI Perception

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

        // Listen to this NPC's perception events
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
        // Update all NPC positions
        for (const npc of this.npcs) {
            this.aoi.updatePosition(npc, npc.position);
        }
    }
}
```

## Skill Target Selection

```typescript
class TargetingSystem {
    private spatialIndex: ISpatialIndex<Entity>;

    // Cone-shaped skill
    findTargetsInCone(
        origin: IVector2,
        direction: IVector2,
        range: number,
        angle: number
    ): Entity[] {
        // First use circular range for rough filtering
        const candidates = this.spatialIndex.findInRadius(origin, range);

        // Then precisely filter targets within the cone
        return candidates.filter(entity => {
            const toEntity = normalize(subtract(entity.position, origin));
            const dot = dotProduct(direction, toEntity);
            const entityAngle = Math.acos(dot);
            return entityAngle <= angle / 2;
        });
    }

    // Piercing ray skill
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

## Dynamic Obstacle Avoidance

```typescript
class ObstacleAvoidanceSystem {
    private spatialIndex: ISpatialIndex<Entity>;

    calculateAvoidanceForce(entity: Entity, velocity: IVector2): IVector2 {
        const position = entity.position;
        const lookAhead = 50; // Forward detection distance

        // Detect obstacles ahead
        const hit = this.spatialIndex.raycastFirst(
            position,
            normalize(velocity),
            lookAhead,
            (e) => e.hasComponent(ObstacleComponent)
        );

        if (!hit) return { x: 0, y: 0 };

        // Calculate avoidance force
        const avoidDirection = normalize({
            x: hit.normal.y,
            y: -hit.normal.x
        });

        const urgency = 1 - (hit.distance / lookAhead);
        return scale(avoidDirection, urgency * 100);
    }
}
```

---
title: "Laya Engine Integration"
description: "Using behavior trees with Laya Engine"
---

## Setup

### Installation

```bash
npm install @esengine/behavior-tree @esengine/ecs-framework
```

## Basic Integration

```typescript
import { Laya, Script } from 'laya/Laya';
import { Core, Scene } from '@esengine/ecs-framework';
import { BehaviorTreePlugin, BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';

export class GameMain {
    private scene: Scene;
    private plugin: BehaviorTreePlugin;

    async initialize() {
        // Initialize ECS
        Core.create();
        this.plugin = new BehaviorTreePlugin();
        await Core.installPlugin(this.plugin);

        this.scene = new Scene();
        this.plugin.setupScene(this.scene);
        Core.setScene(this.scene);

        // Start game loop
        Laya.timer.frameLoop(1, this, this.update);
    }

    update() {
        const dt = Laya.timer.delta;
        this.scene?.update(dt);
    }
}
```

## AI Script Component

```typescript
export class EnemyAI extends Script {
    private entity: Entity;

    onAwake() {
        const tree = this.createBehaviorTree();
        this.entity = GameMain.instance.scene.createEntity('Enemy');

        // Store Laya node reference
        const runtime = this.entity.getComponent(BehaviorTreeRuntimeComponent);
        runtime.setBlackboardValue('layaNode', this.owner);

        BehaviorTreeStarter.start(this.entity, tree);
    }

    private createBehaviorTree() {
        return BehaviorTreeBuilder.create('EnemyAI')
            .selector('Main')
                .sequence('Chase')
                    .condition('canSeePlayer')
                    .action('moveToPlayer')
                .end()
                .action('idle')
            .end()
            .build();
    }

    onDestroy() {
        this.entity?.destroy();
    }
}
```

## Custom Actions for Laya

```typescript
@NodeExecutorMetadata({
    implementationType: 'LayaMoveAction',
    nodeType: NodeType.Action,
    displayName: 'Laya Move',
    category: 'Laya'
})
export class LayaMoveAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        const layaNode = context.runtime.getBlackboardValue<Sprite>('layaNode');
        const target = context.runtime.getBlackboardValue<{x: number, y: number}>('target');

        if (!layaNode || !target) return TaskStatus.Failure;

        const dx = target.x - layaNode.x;
        const dy = target.y - layaNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) return TaskStatus.Success;

        const speed = BindingHelper.getValue<number>(context, 'speed', 100);
        const step = speed * context.deltaTime / 1000;

        layaNode.x += (dx / distance) * step;
        layaNode.y += (dy / distance) * step;

        return TaskStatus.Running;
    }
}
```

## Best Practices

1. Use `Laya.timer.delta` for consistent timing
2. Store Laya nodes in blackboard for access in executors
3. Clean up entities when Laya components are destroyed

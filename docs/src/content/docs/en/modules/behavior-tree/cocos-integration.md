---
title: "Cocos Creator Integration"
description: "Using behavior trees with Cocos Creator"
---

## Setup

### Installation

```bash
npm install @esengine/behavior-tree @esengine/ecs-framework
```

### Project Configuration

Add to your Cocos Creator project's `tsconfig.json`:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

## Basic Integration

```typescript
import { _decorator, Component } from 'cc';
import { Core, Scene } from '@esengine/ecs-framework';
import { BehaviorTreePlugin, BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private scene: Scene;
    private plugin: BehaviorTreePlugin;

    async start() {
        // Initialize ECS
        Core.create();
        this.plugin = new BehaviorTreePlugin();
        await Core.installPlugin(this.plugin);

        this.scene = new Scene();
        this.plugin.setupScene(this.scene);
        Core.setScene(this.scene);
    }

    update(dt: number) {
        // Update ECS
        this.scene?.update(dt * 1000);
    }
}
```

## Creating AI Components

```typescript
@ccclass('EnemyAI')
export class EnemyAI extends Component {
    @property
    public aggroRange: number = 200;

    private entity: Entity;

    start() {
        const tree = this.createBehaviorTree();
        this.entity = GameManager.instance.scene.createEntity('Enemy');
        BehaviorTreeStarter.start(this.entity, tree);
    }

    private createBehaviorTree() {
        return BehaviorTreeBuilder.create('EnemyAI')
            .defineBlackboardVariable('target', null)
            .defineBlackboardVariable('ccNode', this.node)
            .selector('Main')
                .sequence('Attack')
                    .condition('hasTarget')
                    .action('attack')
                .end()
                .action('patrol')
            .end()
            .build();
    }
}
```

## Custom Actions for Cocos

```typescript
@NodeExecutorMetadata({
    implementationType: 'CCMoveToTarget',
    nodeType: NodeType.Action,
    displayName: 'Move To Target',
    category: 'Cocos'
})
export class CCMoveToTarget implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        const ccNode = context.runtime.getBlackboardValue<Node>('ccNode');
        const target = context.runtime.getBlackboardValue<Vec3>('targetPosition');

        if (!ccNode || !target) return TaskStatus.Failure;

        const pos = ccNode.position;
        const direction = new Vec3();
        Vec3.subtract(direction, target, pos);

        if (direction.length() < 10) {
            return TaskStatus.Success;
        }

        direction.normalize();
        const speed = BindingHelper.getValue<number>(context, 'speed', 100);
        const delta = new Vec3();
        Vec3.multiplyScalar(delta, direction, speed * context.deltaTime / 1000);
        ccNode.position = pos.add(delta);

        return TaskStatus.Running;
    }
}
```

## Loading Tree Assets

```typescript
// Load from Cocos resources
import { resources, JsonAsset } from 'cc';

async function loadBehaviorTree(path: string): Promise<BehaviorTreeData> {
    return new Promise((resolve, reject) => {
        resources.load(path, JsonAsset, (err, asset) => {
            if (err) reject(err);
            else resolve(BehaviorTreeLoader.fromData(asset.json));
        });
    });
}
```

## Best Practices

1. **Sync positions** between Cocos nodes and ECS entities
2. **Use blackboard** to store Cocos-specific references
3. **Update ECS** in Cocos update loop
4. **Handle cleanup** when destroying components

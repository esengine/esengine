---
title: "Examples"
description: "ECS integration and best practices"
---

## Complete Game Integration Example

```typescript
import { Scene, Core, Component, ECSComponent } from '@esengine/ecs-framework';
import {
    BlueprintSystem,
    BlueprintComponent,
    BlueprintExpose,
    BlueprintProperty,
    BlueprintMethod
} from '@esengine/blueprint';

// 1. Define game components
@ECSComponent('Player')
@BlueprintExpose({ displayName: 'Player', category: 'gameplay' })
export class PlayerComponent extends Component {
    @BlueprintProperty({ displayName: 'Move Speed', type: 'float' })
    moveSpeed: number = 5;

    @BlueprintProperty({ displayName: 'Score', type: 'int' })
    score: number = 0;

    @BlueprintMethod({ displayName: 'Add Score' })
    addScore(points: number): void {
        this.score += points;
    }
}

@ECSComponent('Health')
@BlueprintExpose({ displayName: 'Health', category: 'gameplay' })
export class HealthComponent extends Component {
    @BlueprintProperty({ displayName: 'Current Health' })
    current: number = 100;

    @BlueprintProperty({ displayName: 'Max Health' })
    max: number = 100;

    @BlueprintMethod({ displayName: 'Heal' })
    heal(amount: number): void {
        this.current = Math.min(this.current + amount, this.max);
    }

    @BlueprintMethod({ displayName: 'Take Damage' })
    takeDamage(amount: number): boolean {
        this.current -= amount;
        return this.current <= 0;
    }
}

// 2. Initialize game
async function initGame() {
    const scene = new Scene();

    // Add blueprint system
    scene.addSystem(new BlueprintSystem());

    Core.setScene(scene);

    // 3. Create player
    const player = scene.createEntity('Player');
    player.addComponent(new PlayerComponent());
    player.addComponent(new HealthComponent());

    // Add blueprint control
    const blueprint = new BlueprintComponent();
    blueprint.blueprintAsset = await loadBlueprintAsset('player.blueprint.json');
    player.addComponent(blueprint);
}
```

## Custom Node Example

```typescript
import type { Entity } from '@esengine/ecs-framework';
import {
    BlueprintNodeTemplate,
    BlueprintNode,
    ExecutionContext,
    ExecutionResult,
    INodeExecutor,
    RegisterNode
} from '@esengine/blueprint';

// Custom damage node
const ApplyDamageTemplate: BlueprintNodeTemplate = {
    type: 'ApplyDamage',
    title: 'Apply Damage',
    category: 'combat',
    color: '#aa2222',
    description: 'Apply damage to entity with Health component',
    keywords: ['damage', 'hurt', 'attack'],
    menuPath: ['Combat', 'Apply Damage'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'target', type: 'entity', displayName: 'Target' },
        { name: 'amount', type: 'float', displayName: 'Damage', defaultValue: 10 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'killed', type: 'bool', displayName: 'Killed' }
    ]
};

@RegisterNode(ApplyDamageTemplate)
class ApplyDamageExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const target = context.evaluateInput(node.id, 'target', context.entity) as Entity;
        const amount = context.evaluateInput(node.id, 'amount', 10) as number;

        if (!target || target.isDestroyed) {
            return { outputs: { killed: false }, nextExec: 'exec' };
        }

        const health = target.components.find(c =>
            (c.constructor as any).__componentName__ === 'Health'
        ) as any;

        if (health) {
            health.current -= amount;
            const killed = health.current <= 0;
            return { outputs: { killed }, nextExec: 'exec' };
        }

        return { outputs: { killed: false }, nextExec: 'exec' };
    }
}
```

## Best Practices

### 1. Use Fragments for Reusable Logic

```typescript
// Encapsulate common logic as fragments
const movementFragment = createFragment('Movement', {
    inputs: [{ name: 'speed', type: 'number', ... }],
    outputs: [{ name: 'position', type: 'vector2', ... }],
    graph: { ... }
});

// Build complex blueprints via composer
const composer = createComposer('Player');
composer.addFragment(movementFragment, 'movement');
composer.addFragment(combatFragment, 'combat');
```

### 2. Use Variable Scopes Appropriately

```typescript
// local: Temporary calculation results
{ name: 'tempValue', scope: 'local' }

// instance: Entity state (e.g., health)
{ name: 'health', scope: 'instance' }

// global: Game-wide state
{ name: 'score', scope: 'global' }
```

### 3. Avoid Infinite Loops

```typescript
// VM has max steps per frame limit (default 1000)
// Use Delay nodes to break long execution chains
vm.maxStepsPerFrame = 1000;
```

### 4. Debugging Tips

```typescript
// Enable debug mode for execution logs
const blueprint = entity.getComponent(BlueprintComponent);
blueprint.debug = true;

// Use Print nodes for intermediate values
// Set breakpoints in editor
```

### 5. Performance Optimization

```typescript
// Pure node outputs are cached
{ isPure: true }

// Avoid heavy computation in Tick
// Use event-driven instead of polling
```

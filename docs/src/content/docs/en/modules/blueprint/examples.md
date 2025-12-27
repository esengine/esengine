---
title: "Examples"
description: "ECS integration and best practices"
---

## Player Control Blueprint

```typescript
// Define input handling node
const InputMoveTemplate: BlueprintNodeTemplate = {
    type: 'InputMove',
    title: 'Get Movement Input',
    category: 'input',
    inputs: [],
    outputs: [
        { name: 'direction', type: 'vector2', direction: 'output' }
    ],
    isPure: true
};

@RegisterNode(InputMoveTemplate)
class InputMoveExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const input = context.scene.services.get(InputServiceToken);
        const direction = {
            x: input.getAxis('horizontal'),
            y: input.getAxis('vertical')
        };
        return { outputs: { direction } };
    }
}
```

## State Switching Logic

```typescript
// Implement state machine logic in blueprint
const stateBlueprint = createEmptyBlueprint('PlayerState');

// Add state variable
stateBlueprint.variables.push({
    name: 'currentState',
    type: 'string',
    defaultValue: 'idle',
    scope: 'instance'
});

// Check state transitions in Tick event
// ... implemented via node connections
```

## Damage Handling System

```typescript
// Custom damage node
const ApplyDamageTemplate: BlueprintNodeTemplate = {
    type: 'ApplyDamage',
    title: 'Apply Damage',
    category: 'combat',
    inputs: [
        { name: 'exec', type: 'exec', direction: 'input', isExec: true },
        { name: 'target', type: 'entity', direction: 'input' },
        { name: 'amount', type: 'number', direction: 'input', defaultValue: 10 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', direction: 'output', isExec: true },
        { name: 'killed', type: 'boolean', direction: 'output' }
    ]
};

@RegisterNode(ApplyDamageTemplate)
class ApplyDamageExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const target = context.getInput<Entity>(node.id, 'target');
        const amount = context.getInput<number>(node.id, 'amount');

        const health = target.getComponent(HealthComponent);
        if (health) {
            health.current -= amount;
            const killed = health.current <= 0;
            return {
                outputs: { killed },
                nextExec: 'exec'
            };
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
vm.debug = true;

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

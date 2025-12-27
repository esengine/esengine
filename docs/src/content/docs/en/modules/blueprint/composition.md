---
title: "Blueprint Composition"
description: "Fragments, composer, and triggers"
---

## Blueprint Fragments

Encapsulate reusable logic as fragments:

```typescript
import { createFragment } from '@esengine/blueprint';

const healthFragment = createFragment('HealthSystem', {
    inputs: [
        { name: 'damage', type: 'number', internalNodeId: 'input1', internalPinName: 'value' }
    ],
    outputs: [
        { name: 'isDead', type: 'boolean', internalNodeId: 'output1', internalPinName: 'value' }
    ],
    graph: {
        nodes: [...],
        connections: [...],
        variables: [...]
    }
});
```

## Composing Blueprints

```typescript
import { createComposer, FragmentRegistry } from '@esengine/blueprint';

// Register fragments
FragmentRegistry.instance.register('health', healthFragment);
FragmentRegistry.instance.register('movement', movementFragment);

// Create composer
const composer = createComposer('PlayerBlueprint');

// Add fragments to slots
composer.addFragment(healthFragment, 'slot1', { position: { x: 0, y: 0 } });
composer.addFragment(movementFragment, 'slot2', { position: { x: 400, y: 0 } });

// Connect slots
composer.connect('slot1', 'onDeath', 'slot2', 'disable');

// Validate
const validation = composer.validate();
if (!validation.isValid) {
    console.error(validation.errors);
}

// Compile to blueprint
const blueprint = composer.compile();
```

## Fragment Registry

```typescript
import { FragmentRegistry } from '@esengine/blueprint';

const registry = FragmentRegistry.instance;

// Register fragment
registry.register('health', healthFragment);

// Get fragment
const fragment = registry.get('health');

// Get all fragments
const allFragments = registry.getAll();

// Get by category
const combatFragments = registry.getByCategory('combat');
```

## Trigger System

### Defining Trigger Conditions

```typescript
import { TriggerCondition, TriggerDispatcher } from '@esengine/blueprint';

const lowHealthCondition: TriggerCondition = {
    type: 'comparison',
    left: { type: 'variable', name: 'health' },
    operator: '<',
    right: { type: 'constant', value: 20 }
};
```

### Using Trigger Dispatcher

```typescript
const dispatcher = new TriggerDispatcher();

// Register trigger
dispatcher.register('lowHealth', lowHealthCondition, (context) => {
    context.triggerEvent('OnLowHealth');
});

// Evaluate each frame
dispatcher.evaluate(context);
```

### Compound Conditions

```typescript
const complexCondition: TriggerCondition = {
    type: 'and',
    conditions: [
        {
            type: 'comparison',
            left: { type: 'variable', name: 'health' },
            operator: '<',
            right: { type: 'constant', value: 50 }
        },
        {
            type: 'comparison',
            left: { type: 'variable', name: 'inCombat' },
            operator: '==',
            right: { type: 'constant', value: true }
        }
    ]
};
```

## Fragment Best Practices

1. **Single Responsibility** - Each fragment does one thing
2. **Clear Interface** - Name input/output pins clearly
3. **Documentation** - Add descriptions and usage examples
4. **Version Control** - Maintain backward compatibility when updating

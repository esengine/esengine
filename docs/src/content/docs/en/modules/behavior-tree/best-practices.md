---
title: "Best Practices"
description: "Design patterns and tips for behavior trees"
---

## Tree Structure

### Keep Trees Shallow

```typescript
// Good - flat structure
.selector('Main')
    .sequence('Combat')
    .sequence('Patrol')
    .sequence('Idle')
.end()

// Avoid - deep nesting
.selector('Main')
    .selector('Level1')
        .selector('Level2')
            .selector('Level3')
                // ...
```

### Use Subtrees

Break complex behaviors into reusable subtrees:

```typescript
// Define reusable behaviors
const combatBehavior = createCombatTree();
const patrolBehavior = createPatrolTree();

// Compose main AI
const enemyAI = BehaviorTreeBuilder.create('EnemyAI')
    .selector('Main')
        .subtree(combatBehavior)
        .subtree(patrolBehavior)
    .end()
    .build();
```

## Blackboard Design

### Use Clear Naming

```typescript
// Good
.defineBlackboardVariable('targetEntity', null)
.defineBlackboardVariable('lastKnownPosition', null)
.defineBlackboardVariable('alertLevel', 0)

// Avoid
.defineBlackboardVariable('t', null)
.defineBlackboardVariable('pos', null)
.defineBlackboardVariable('a', 0)
```

### Group Related Variables

```typescript
// Combat-related
combatTarget: Entity
combatRange: number
attackCooldown: number

// Movement-related
moveTarget: Vector2
moveSpeed: number
pathNodes: Vector2[]
```

## Action Design

### Single Responsibility

```typescript
// Good - focused actions
class MoveToTarget implements INodeExecutor { }
class AttackTarget implements INodeExecutor { }
class PlayAnimation implements INodeExecutor { }

// Avoid - do-everything actions
class CombatAction implements INodeExecutor {
    // Moves, attacks, plays animation, etc.
}
```

### Stateless Executors

```typescript
// Good - use context for state
class WaitAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        const elapsed = context.runtime.getNodeState(context.node.id, 'elapsed') ?? 0;
        // ...
    }
}

// Avoid - instance state
class WaitAction implements INodeExecutor {
    private elapsed = 0; // Don't do this!
}
```

## Debugging Tips

### Add Log Nodes

```typescript
.sequence('AttackSequence')
    .log('Starting attack sequence', 'Debug')
    .action('findTarget')
    .log('Target found', 'Debug')
    .action('attack')
    .log('Attack complete', 'Debug')
.end()
```

### Use Meaningful Node Names

```typescript
// Good
.sequence('ApproachAndAttackEnemy')
.condition('IsEnemyInRange')
.action('PerformMeleeAttack')

// Avoid
.sequence('Seq1')
.condition('Cond1')
.action('Action1')
```

## Performance Tips

1. **Reduce tick rate** for distant entities
2. **Use conditions early** to fail fast
3. **Cache expensive calculations** in blackboard
4. **Limit subtree depth** to reduce traversal cost
5. **Profile** your trees in real gameplay

## Common Patterns

### Guard Pattern

```typescript
.sequence('GuardedAction')
    .condition('canPerformAction')  // Guard condition
    .action('performAction')         // Actual action
.end()
```

### Cooldown Pattern

```typescript
.sequence('CooldownAttack')
    .condition('isCooldownReady')
    .action('attack')
    .action('startCooldown')
.end()
```

### Memory Pattern

```typescript
.selector('RememberAndAct')
    .sequence('UseMemory')
        .condition('hasLastKnownPosition')
        .action('moveToLastKnownPosition')
    .end()
    .action('search')
.end()
```

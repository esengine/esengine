---
"@esengine/behavior-tree": minor
---

feat: add action() and condition() methods to BehaviorTreeBuilder

Added new methods to support custom executor types directly in the builder:

- `action(implementationType, name?, config?)` - Use custom action executors registered via `@NodeExecutorMetadata`
- `condition(implementationType, name?, config?)` - Use custom condition executors

This provides a cleaner API for using custom node executors compared to the existing `executeAction()` which only supports blackboard functions.

Example:
```typescript
// Define custom executor
@NodeExecutorMetadata({
    implementationType: 'AttackAction',
    nodeType: NodeType.Action,
    displayName: 'Attack',
    category: 'Combat'
})
class AttackAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        return TaskStatus.Success;
    }
}

// Use in builder
const tree = BehaviorTreeBuilder.create('AI')
    .selector('Root')
        .action('AttackAction', 'Attack', { damage: 50 })
    .end()
    .build();
```

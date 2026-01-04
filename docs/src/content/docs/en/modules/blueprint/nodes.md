---
title: "ECS Node Reference"
description: "Blueprint built-in ECS operation nodes"
---

## Event Nodes

Lifecycle events as blueprint entry points:

| Node | Description |
|------|-------------|
| `EventBeginPlay` | Triggered when blueprint starts |
| `EventTick` | Triggered each frame, receives deltaTime |
| `EventEndPlay` | Triggered when blueprint stops |

## Entity Nodes

ECS entity operations:

| Node | Description | Type |
|------|-------------|------|
| `Get Self` | Get entity owning this blueprint | Pure |
| `Create Entity` | Create new entity in scene | Execution |
| `Destroy Entity` | Destroy specified entity | Execution |
| `Destroy Self` | Destroy self entity | Execution |
| `Is Valid` | Check if entity is valid | Pure |
| `Get Entity Name` | Get entity name | Pure |
| `Set Entity Name` | Set entity name | Execution |
| `Get Entity Tag` | Get entity tag | Pure |
| `Set Entity Tag` | Set entity tag | Execution |
| `Set Active` | Set entity active state | Execution |
| `Is Active` | Check if entity is active | Pure |
| `Find Entity By Name` | Find entity by name | Pure |
| `Find Entities By Tag` | Find all entities by tag | Pure |
| `Get Entity ID` | Get entity unique ID | Pure |
| `Find Entity By ID` | Find entity by ID | Pure |

## Component Nodes

ECS component operations:

| Node | Description | Type |
|------|-------------|------|
| `Has Component` | Check if entity has specified component | Pure |
| `Get Component` | Get component from entity | Pure |
| `Get All Components` | Get all components from entity | Pure |
| `Remove Component` | Remove component | Execution |
| `Get Component Property` | Get component property value | Pure |
| `Set Component Property` | Set component property value | Execution |
| `Get Component Type` | Get component type name | Pure |
| `Get Owner Entity` | Get owning entity from component | Pure |

## Flow Control Nodes

Control execution flow:

| Node | Description |
|------|-------------|
| `Branch` | Conditional branch (if/else) |
| `Sequence` | Execute multiple outputs in sequence |
| `For Loop` | Loop execution |
| `For Each` | Iterate array |
| `While Loop` | Conditional loop |
| `Do Once` | Execute only once |
| `Flip Flop` | Alternate between two branches |
| `Gate` | Toggleable execution gate |

## Time Nodes

| Node | Description | Type |
|------|-------------|------|
| `Delay` | Delay execution | Execution |
| `Get Delta Time` | Get frame delta time | Pure |
| `Get Time` | Get total runtime | Pure |

## Math Nodes

| Node | Description |
|------|-------------|
| `Add` / `Subtract` / `Multiply` / `Divide` | Basic operations |
| `Abs` | Absolute value |
| `Clamp` | Clamp to range |
| `Lerp` | Linear interpolation |
| `Min` / `Max` | Minimum/Maximum |

## Debug Nodes

| Node | Description |
|------|-------------|
| `Print` | Print to console |

## Auto-generated Component Nodes

Components marked with `@BlueprintExpose` decorator auto-generate nodes:

```typescript
@ECSComponent('Transform')
@BlueprintExpose({ displayName: 'Transform', category: 'core' })
export class TransformComponent extends Component {
    @BlueprintProperty({ displayName: 'X Position' })
    x: number = 0;

    @BlueprintProperty({ displayName: 'Y Position' })
    y: number = 0;

    @BlueprintMethod({ displayName: 'Translate' })
    translate(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}
```

Generated nodes:
- **Get Transform** - Get Transform component
- **Get X Position** / **Set X Position** - Access x property
- **Get Y Position** / **Set Y Position** - Access y property
- **Translate** - Call translate method

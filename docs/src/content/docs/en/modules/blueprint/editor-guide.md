---
title: "Blueprint Editor User Guide"
description: "Complete guide for using the Cocos Creator Blueprint Visual Scripting Editor"
---

This guide covers how to use the Blueprint Visual Scripting Editor in Cocos Creator.

## Download & Installation

### Download

> **Beta Testing**: The blueprint editor is currently in beta. An activation code is required.
> Please join QQ Group **481923584** and message the group owner to get your activation code.

Download the latest version from GitHub Release:

**[Download Cocos Node Editor v1.0.0](https://github.com/esengine/esengine/releases/tag/cocos-node-editor-v1.0.0)**

### Installation Steps

1. Extract `cocos-node-editor.zip` to your project's `extensions` directory:

```
your-project/
├── assets/
├── extensions/
│   └── cocos-node-editor/    ← Extract here
└── ...
```

2. Restart Cocos Creator

3. Confirm the plugin is enabled via **Extensions → Extension Manager**

4. Open the editor via **Panel → Node Editor**

## Interface Overview

- **Toolbar** - Located at the top, contains New, Open, Save, Undo, Redo operations
- **Variables Panel** - Located at the top-left, for defining and managing blueprint variables
- **Canvas Area** - Main area for placing and connecting nodes
- **Node Menu** - Right-click on empty canvas to open, lists all available nodes by category

## Canvas Operations

| Operation | Method |
|-----------|--------|
| Pan canvas | Middle-click drag / Alt + Left-click drag |
| Zoom canvas | Mouse wheel |
| Open node menu | Right-click on empty space |
| Box select nodes | Drag on empty canvas |
| Additive select | Ctrl + Drag |
| Delete selected | Delete key |

## Node Operations

### Adding Nodes

1. **Drag from Node Panel** - Drag nodes from the left panel onto the canvas
2. **Right-click Menu** - Right-click on empty canvas space to select nodes

### Connecting Nodes

1. Drag from an output pin to an input pin
2. Compatible pins will highlight
3. Release to complete the connection

**Pin Type Reference:**

| Pin Color | Type | Description |
|-----------|------|-------------|
| White ▶ | Exec | Execution flow (controls order) |
| Cyan ◆ | Entity | Entity reference |
| Purple ◆ | Component | Component reference |
| Light Blue ◆ | String | String value |
| Green ◆ | Number | Numeric value |
| Red ◆ | Boolean | Boolean value |
| Gray ◆ | Any | Any type |

### Deleting Connections

Click a connection line to select it, then press Delete.

## Node Types Reference

### Event Nodes

Event nodes are entry points for blueprint execution, triggered when specific events occur.

| Node | Trigger | Outputs |
|------|---------|---------|
| **Event BeginPlay** | When blueprint starts | Exec, Self (Entity) |
| **Event Tick** | Every frame | Exec, Delta Time |
| **Event EndPlay** | When blueprint stops | Exec |

**Example: Print message on game start**
```
[Event BeginPlay] ──Exec──→ [Print]
                              └─ Message: "Game Started!"
```

### Entity Nodes

Nodes for operating on ECS entities.

| Node | Function | Inputs | Outputs |
|------|----------|--------|---------|
| **Get Self** | Get current entity | - | Entity |
| **Create Entity** | Create new entity | Exec, Name | Exec, Entity |
| **Destroy Entity** | Destroy entity | Exec, Entity | Exec |
| **Find Entity By Name** | Find by name | Name | Entity |
| **Find Entities By Tag** | Find by tag | Tag | Entity[] |
| **Is Valid** | Check entity validity | Entity | Boolean |
| **Get/Set Entity Name** | Get/Set name | Entity | String |
| **Set Active** | Set active state | Exec, Entity, Active | Exec |

**Example: Create new entity**
```
[Event BeginPlay] ──→ [Create Entity] ──→ [Add Component]
                        └─ Name: "Bullet"     └─ Type: Transform
```

### Component Nodes

Access and manipulate ECS components.

| Node | Function |
|------|----------|
| **Has Component** | Check if entity has component |
| **Get Component** | Get component instance |
| **Add Component** | Add component to entity |
| **Remove Component** | Remove component |
| **Get/Set Property** | Get/Set component property |

**Example: Modify Transform component**
```
[Get Self] ─Entity─→ [Get Component: Transform] ─Component─→ [Set Property]
                                                               ├─ Property: x
                                                               └─ Value: 100
```

### Flow Control Nodes

Nodes that control execution flow.

#### Branch

Conditional branching, similar to if/else.

```
         ┌─ True ──→ [DoSomething]
[Branch]─┤
         └─ False ─→ [DoOtherThing]
```

#### Sequence

Execute multiple branches in order.

```
           ┌─ Then 0 ──→ [Step1]
[Sequence]─┼─ Then 1 ──→ [Step2]
           └─ Then 2 ──→ [Step3]
```

#### For Loop

Execute a specified number of times.

```
[For Loop] ─Loop Body─→ [Execute each iteration]
    │
    └─ Completed ────→ [Execute after loop ends]
```

| Input | Description |
|-------|-------------|
| First Index | Starting index |
| Last Index | Ending index |

| Output | Description |
|--------|-------------|
| Loop Body | Execute each iteration |
| Index | Current index |
| Completed | Execute after loop ends |

#### For Each

Iterate over array elements.

#### While Loop

Loop while condition is true.

#### Do Once

Execute only once, skip afterwards.

#### Flip Flop

Alternate between A and B outputs each execution.

#### Gate

Control whether execution passes through via Open/Close/Toggle.

### Time Nodes

| Node | Function | Output Type |
|------|----------|-------------|
| **Delay** | Delay execution by specified time | Exec |
| **Get Delta Time** | Get frame delta time | Number |
| **Get Time** | Get total runtime | Number |

**Example: Execute after 2 second delay**
```
[Event BeginPlay] ──→ [Delay] ──→ [Print]
                       └─ Duration: 2.0   └─ "Executed after 2s"
```

### Math Nodes

| Node | Function |
|------|----------|
| **Add / Subtract / Multiply / Divide** | Arithmetic operations |
| **Abs** | Absolute value |
| **Clamp** | Clamp to range |
| **Lerp** | Linear interpolation |
| **Min / Max** | Minimum/Maximum value |
| **Random Range** | Random number |
| **Sin / Cos / Tan** | Trigonometric functions |

### Debug Nodes

| Node | Function |
|------|----------|
| **Print** | Output to console |

## Variable System

Variables store and share data within a blueprint.

### Creating Variables

1. Click the **+** button in the Variables panel
2. Enter variable name
3. Select variable type
4. Set default value (optional)

### Using Variables

- **Drag to canvas** - Creates Get or Set node
- **Get Node** - Read variable value
- **Set Node** - Write variable value

### Variable Types

| Type | Description | Default |
|------|-------------|---------|
| Boolean | Boolean value | false |
| Number | Numeric value | 0 |
| String | String value | "" |
| Entity | Entity reference | null |
| Vector2 | 2D vector | (0, 0) |
| Vector3 | 3D vector | (0, 0, 0) |

### Variable Node Error State

If you delete a variable but nodes still reference it:
- Nodes display a **red border** and **warning icon**
- You need to recreate the variable or delete these nodes

## Node Grouping

You can organize multiple nodes into a visual group box to help manage complex blueprints.

### Creating a Group

1. Box-select or Ctrl+click to select multiple nodes (at least 2)
2. Right-click on the selected nodes
3. Choose **Create Group**
4. A group box will automatically wrap all selected nodes

### Group Operations

| Action | Method |
|--------|--------|
| Move group | Drag the group header, all nodes move together |
| Ungroup | Right-click on group box → **Ungroup** |

### Features

- **Dynamic sizing**: Group box automatically resizes to wrap all nodes
- **Independent movement**: You can move nodes within the group individually, and the box adjusts
- **Editor only**: Groups are purely visual organization, no runtime impact

## Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl + S` | Save blueprint |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + C` | Copy selected nodes |
| `Ctrl + X` | Cut selected nodes |
| `Ctrl + V` | Paste nodes |
| `Delete` | Delete selected items |
| `Ctrl + A` | Select all |

## Save & Load

### Saving Blueprints

1. Click the **Save** button in the toolbar
2. Choose save location (**must be saved in `assets/resources` directory**, otherwise Cocos Creator cannot load dynamically)
3. File extension is `.blueprint.json`

> **Important**: Blueprint files must be placed in the `resources` directory for runtime loading via `cc.resources.load()`.

### Loading Blueprints

1. Click the **Open** button in the toolbar
2. Select a `.blueprint.json` file

### Blueprint File Format

Blueprints are saved as JSON, compatible with `@esengine/blueprint` runtime:

```json
{
  "version": 1,
  "type": "blueprint",
  "metadata": {
    "name": "PlayerController",
    "description": "Player control logic"
  },
  "variables": [],
  "nodes": [],
  "connections": []
}
```

## Practical Examples

### Example 1: Movement Control

Move entity every frame:

```
[Event Tick] ─Exec─→ [Get Self] ─Entity─→ [Get Component: Transform]
                                               │
                     [Get Delta Time]          ▼
                          │              [Set Property: x]
                          │                    │
                     [Multiply] ◄──────────────┘
                          │
                          └─ Speed: 100
```

### Example 2: Health System

Check death after taking damage:

```
[On Damage Event] ─→ [Get Component: Health] ─→ [Get Property: current]
                                                        │
                                                        ▼
                                                  [Subtract]
                                                        │
                                                        ▼
                                                  [Set Property: current]
                                                        │
                                                        ▼
                              ┌─ True ─→ [Destroy Self]
                     [Branch]─┤
                              └─ False ─→ (continue)
                                   ▲
                                   │
                           [Less Or Equal]
                                   │
                              current <= 0
```

### Example 3: Delayed Spawning

Spawn an enemy every 2 seconds:

```
[Event BeginPlay] ─→ [Do N Times] ─Loop─→ [Delay: 2.0] ─→ [Create Entity: Enemy]
                          │
                          └─ N: 10
```

## Troubleshooting

### Q: Nodes won't connect?

Check if pin types are compatible. Execution pins (white) can only connect to execution pins. Data pins need matching types.

### Q: Blueprint not executing?

1. Ensure entity has `BlueprintComponent` attached
2. Ensure scene has `BlueprintSystem` added
3. Check if `autoStart` is `true`

### Q: How to debug?

Use **Print** nodes to output variable values to the console.

## Next Steps

- [ECS Node Reference](./nodes) - Complete node list
- [Custom Nodes](./custom-nodes) - Create custom nodes
- [Runtime Integration](./vm) - Blueprint VM API
- [Examples](./examples) - More game logic examples

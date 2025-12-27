---
title: "Built-in Nodes"
description: "Blueprint built-in node reference"
---

## Event Nodes

| Node | Description |
|------|-------------|
| `EventBeginPlay` | Triggered when blueprint starts |
| `EventTick` | Triggered each frame |
| `EventEndPlay` | Triggered when blueprint stops |
| `EventCollision` | Triggered on collision |
| `EventInput` | Triggered on input event |
| `EventTimer` | Triggered by timer |
| `EventMessage` | Triggered by custom message |

## Flow Control Nodes

| Node | Description |
|------|-------------|
| `Branch` | Conditional branch (if/else) |
| `Sequence` | Execute multiple outputs in sequence |
| `ForLoop` | Loop execution |
| `WhileLoop` | Conditional loop |
| `DoOnce` | Execute only once |
| `FlipFlop` | Alternate between two branches |
| `Gate` | Toggleable execution gate |

## Time Nodes

| Node | Description |
|------|-------------|
| `Delay` | Delay execution |
| `GetDeltaTime` | Get frame delta time |
| `GetTime` | Get runtime |
| `SetTimer` | Set timer |
| `ClearTimer` | Clear timer |

## Math Nodes

| Node | Description |
|------|-------------|
| `Add` | Addition |
| `Subtract` | Subtraction |
| `Multiply` | Multiplication |
| `Divide` | Division |
| `Abs` | Absolute value |
| `Clamp` | Clamp to range |
| `Lerp` | Linear interpolation |
| `Min` / `Max` | Minimum/Maximum |
| `Sin` / `Cos` | Trigonometric functions |
| `Sqrt` | Square root |
| `Power` | Power |

## Logic Nodes

| Node | Description |
|------|-------------|
| `And` | Logical AND |
| `Or` | Logical OR |
| `Not` | Logical NOT |
| `Equal` | Equality comparison |
| `NotEqual` | Inequality comparison |
| `Greater` | Greater than comparison |
| `Less` | Less than comparison |

## Vector Nodes

| Node | Description |
|------|-------------|
| `MakeVector2` | Create 2D vector |
| `BreakVector2` | Break 2D vector |
| `VectorAdd` | Vector addition |
| `VectorSubtract` | Vector subtraction |
| `VectorMultiply` | Vector multiplication |
| `VectorLength` | Vector length |
| `VectorNormalize` | Vector normalization |
| `VectorDistance` | Vector distance |

## Entity Nodes

| Node | Description |
|------|-------------|
| `GetSelf` | Get current entity |
| `GetComponent` | Get component |
| `HasComponent` | Check component |
| `AddComponent` | Add component |
| `RemoveComponent` | Remove component |
| `SpawnEntity` | Create entity |
| `DestroyEntity` | Destroy entity |

## Variable Nodes

| Node | Description |
|------|-------------|
| `GetVariable` | Get variable value |
| `SetVariable` | Set variable value |

## Debug Nodes

| Node | Description |
|------|-------------|
| `Print` | Print to console |
| `DrawDebugLine` | Draw debug line |
| `DrawDebugPoint` | Draw debug point |
| `Breakpoint` | Debug breakpoint |

---
title: "ECS Node Reference"
description: "Blueprint built-in ECS operation nodes - complete reference with visual examples"
---

This document provides a complete reference for all built-in blueprint nodes with visual examples.

<script src="/js/blueprint-graph.js"></script>

## Pin Type Legend

<div class="bp-legend">
  <div class="bp-legend-item"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff" stroke="#fff" stroke-width="1"/></svg> Execution Flow</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#00a0e0" stroke-width="2"/></svg> Entity</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#7030c0" stroke-width="2"/></svg> Component</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#7ecd32" stroke-width="2"/></svg> Number</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#e060e0" stroke-width="2"/></svg> String</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#8c0000" stroke-width="2"/></svg> Boolean</div>
</div>

## Event Nodes

Lifecycle events as blueprint entry points:

| Node | Description | Outputs |
|------|-------------|---------|
| `EventBeginPlay` | Triggered when blueprint starts | Exec, Self (Entity) |
| `EventTick` | Triggered each frame | Exec, Delta Time |
| `EventEndPlay` | Triggered when blueprint stops | Exec |

### Example: Game Initialization

<div class="bp-graph" style="" data-connections='[{"from":"en-beginplay-exec","to":"en-print-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="en-beginplay-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Self</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 170px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-print-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Message</span>
        <span class="bp-pin-value">"Game Started!"</span>
      </div>
    </div>
  </div>
</div>

### Example: Per-Frame Movement

<div class="bp-graph" style="" data-connections='[{"from":"en-tick-exec","to":"en-setprop-exec","type":"exec"},{"from":"en-tick-delta","to":"en-mul-a","type":"float"},{"from":"en-mul-result","to":"en-setprop-x","type":"float"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 140px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event Tick</span>
      <span class="bp-header-exec" data-pin="en-tick-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-tick-delta"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Delta Time</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 200px; top: 110px; width: 120px;">
    <div class="bp-node-header math">Multiply</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-mul-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">B</span>
        <span class="bp-pin-value">100</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-mul-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 380px; top: 20px; width: 150px;">
    <div class="bp-node-header function">Set Property</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-setprop-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7030c0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Target</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-setprop-x"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">x</span>
      </div>
    </div>
  </div>
</div>

## Entity Nodes

Manipulate ECS entities:

| Node | Description | Type |
|------|-------------|------|
| `Get Self` | Get the entity owning this blueprint | Pure |
| `Create Entity` | Create a new entity in the scene | Exec |
| `Destroy Entity` | Destroy specified entity | Exec |
| `Destroy Self` | Destroy the owning entity | Exec |
| `Is Valid` | Check if entity is valid | Pure |
| `Get Entity Name` | Get entity name | Pure |
| `Set Entity Name` | Set entity name | Exec |
| `Find Entity By Name` | Find entity by name | Pure |
| `Find Entities By Tag` | Find all entities with tag | Pure |

### Example: Create Bullet

<div class="bp-graph" style="" data-connections='[{"from":"en-bp-exec","to":"en-create-exec","type":"exec"},{"from":"en-create-exec-out","to":"en-add-exec","type":"exec"},{"from":"en-create-entity","to":"en-add-entity","type":"entity"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="en-bp-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Self</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 150px;">
    <div class="bp-node-header function">Create Entity</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-create-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-create-exec-out"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-create-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 520px; top: 20px; width: 150px;">
    <div class="bp-node-header function">Add Transform</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-add-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-add-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
    </div>
  </div>
</div>

## Component Nodes

Read and write component properties:

| Node | Description | Type |
|------|-------------|------|
| `Get Component` | Get component of specified type from entity | Pure |
| `Has Component` | Check if entity has specified component | Pure |
| `Add Component` | Add component to entity | Exec |
| `Remove Component` | Remove component from entity | Exec |
| `Get Property` | Get component property value | Pure |
| `Set Property` | Set component property value | Exec |

### Example: Modify Position

<div class="bp-graph" style="" data-connections='[{"from":"en-self-entity","to":"en-getcomp-entity","type":"entity"},{"from":"en-getcomp-transform","to":"en-getprop-target","type":"component"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 100px;">
    <div class="bp-node-header pure">Get Self</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-self-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 200px; top: 20px; width: 150px;">
    <div class="bp-node-header pure">Get Component</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-getcomp-entity"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#00a0e0"/></svg></span>
        <span class="bp-pin-label">Entity</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-getcomp-transform"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7030c0"/></svg></span>
        <span class="bp-pin-label">Transform</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 430px; top: 20px; width: 120px;">
    <div class="bp-node-header pure">Get Property</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-getprop-target"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7030c0"/></svg></span>
        <span class="bp-pin-label">Target</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">x</span>
      </div>
    </div>
  </div>
</div>

## Flow Control Nodes

Control blueprint execution flow:

| Node | Description |
|------|-------------|
| `Branch` | Conditional branching (if/else) |
| `Sequence` | Execute multiple branches in order |
| `For Loop` | Loop specified number of times |
| `For Each` | Iterate over array elements |
| `While Loop` | Loop while condition is true |
| `Do Once` | Execute only once |
| `Flip Flop` | Alternate between A and B |
| `Gate` | Gate switch control |

### Example: Conditional Branch

<div class="bp-graph" style="" data-connections='[{"from":"en-cond-exec","to":"en-branch-exec","type":"exec"},{"from":"en-cond-result","to":"en-branch-cond","type":"bool"},{"from":"en-branch-true","to":"en-print1-exec","type":"exec"},{"from":"en-branch-false","to":"en-print2-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 60px; width: 120px;">
    <div class="bp-node-header pure">Condition</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-cond-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-cond-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#8c0000"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 220px; top: 60px; width: 110px;">
    <div class="bp-node-header flow">Branch</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-branch-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-branch-cond"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#8c0000"/></svg></span>
        <span class="bp-pin-label">Cond</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-branch-true"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">True</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-branch-false"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">False</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 420px; top: 20px; width: 120px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-print1-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Msg</span>
        <span class="bp-pin-value">"Yes"</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 420px; top: 130px; width: 120px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-print2-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Msg</span>
        <span class="bp-pin-value">"No"</span>
      </div>
    </div>
  </div>
</div>

### Example: For Loop

<div class="bp-graph" style="" data-connections='[{"from":"en-forloop-bp-exec","to":"en-forloop-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="en-forloop-bp-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 150px;">
    <div class="bp-node-header flow">For Loop</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-forloop-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#1cc4c4" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">First</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#1cc4c4" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Last</span>
        <span class="bp-pin-value">10</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Body</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#1cc4c4"/></svg></span>
        <span class="bp-pin-label">Index</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Done</span>
      </div>
    </div>
  </div>
</div>

## Time Nodes

| Node | Description | Output |
|------|-------------|--------|
| `Delay` | Delay execution by specified seconds | Exec |
| `Get Delta Time` | Get frame delta time | Float |
| `Get Time` | Get total runtime | Float |

### Example: Delayed Execution

<div class="bp-graph" style="" data-connections='[{"from":"en-delay-bp-exec","to":"en-delay-exec","type":"exec"},{"from":"en-delay-done","to":"en-delay-print-exec","type":"exec"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 170px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event BeginPlay</span>
      <span class="bp-header-exec" data-pin="en-delay-bp-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
  </div>
  <div class="bp-node" style="left: 280px; top: 20px; width: 120px;">
    <div class="bp-node-header time">Delay</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-delay-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Duration</span>
        <span class="bp-pin-value">2.0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-delay-done"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Done</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 490px; top: 20px; width: 130px;">
    <div class="bp-node-header debug">Print</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-delay-print-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Msg</span>
        <span class="bp-pin-value">"After 2s"</span>
      </div>
    </div>
  </div>
</div>

## Math Nodes

### Basic Operations

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Add` | Addition | A, B | A + B |
| `Subtract` | Subtraction | A, B | A - B |
| `Multiply` | Multiplication | A, B | A × B |
| `Divide` | Division | A, B | A / B |
| `Modulo` | Modulo | A, B | A % B |

### Math Functions

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Abs` | Absolute value | Value | \|Value\| |
| `Sqrt` | Square root | Value | √Value |
| `Pow` | Power | Base, Exp | Base^Exp |
| `Floor` | Floor | Value | ⌊Value⌋ |
| `Ceil` | Ceiling | Value | ⌈Value⌉ |
| `Round` | Round | Value | round(Value) |
| `Clamp` | Clamp to range | Value, Min, Max | min(max(V, Min), Max) |
| `Lerp` | Linear interpolation | A, B, Alpha | A + (B-A) × Alpha |
| `Min` | Minimum | A, B | min(A, B) |
| `Max` | Maximum | A, B | max(A, B) |

### Trigonometric Functions

| Node | Description |
|------|-------------|
| `Sin` | Sine |
| `Cos` | Cosine |
| `Tan` | Tangent |
| `Asin` | Arc sine |
| `Acos` | Arc cosine |
| `Atan` | Arc tangent |
| `Atan2` | Two-argument arc tangent |

### Random Numbers

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Random` | Random float [0, 1) | - | Float |
| `Random Range` | Random in range | Min, Max | Float |
| `Random Int` | Random integer | Min, Max | Int |

### Comparison Nodes

| Node | Description | Output |
|------|-------------|--------|
| `Equal` | A == B | Boolean |
| `Not Equal` | A != B | Boolean |
| `Greater` | A > B | Boolean |
| `Greater Or Equal` | A >= B | Boolean |
| `Less` | A < B | Boolean |
| `Less Or Equal` | A <= B | Boolean |

### Extended Math Nodes

> **Vector2, Fixed32, FixedVector2, Color** and other advanced math nodes are provided by the `@esengine/ecs-framework-math` module.
>
> See: [Math Blueprint Nodes](/en/modules/math/blueprint-nodes)

### Example: Clamp Value

<div class="bp-graph" style="" data-connections='[{"from":"en-rand-result","to":"en-clamp-value","type":"float"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 130px;">
    <div class="bp-node-header math">Random Range</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Min</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Max</span>
        <span class="bp-pin-value">100</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-rand-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 240px; top: 20px; width: 130px;">
    <div class="bp-node-header math">Clamp</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-clamp-value"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Value</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Min</span>
        <span class="bp-pin-value">20</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Max</span>
        <span class="bp-pin-value">80</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
</div>

## Variable Nodes

Blueprint-defined variables automatically generate Get and Set nodes:

| Node | Description | Type |
|------|-------------|------|
| `Get <varname>` | Read variable value | Pure |
| `Set <varname>` | Set variable value | Exec |

### Example: Counter

<div class="bp-graph" style="" data-connections='[{"from":"en-cnt-tick-exec","to":"en-cnt-add-exec","type":"exec"},{"from":"en-cnt-get-value","to":"en-cnt-add-a","type":"int"},{"from":"en-cnt-add-result","to":"en-cnt-set-value","type":"int"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="left: 20px; top: 20px; width: 140px;">
    <div class="bp-node-header event">
      <span class="bp-node-header-icon"></span>
      <span class="bp-node-header-title">Event Tick</span>
      <span class="bp-header-exec" data-pin="en-cnt-tick-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
    </div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Delta</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 20px; top: 120px; width: 110px;">
    <div class="bp-node-header variable">Get Count</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-cnt-get-value"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#1cc4c4"/></svg></span>
        <span class="bp-pin-label">Value</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 240px; top: 20px; width: 110px;">
    <div class="bp-node-header math">Add</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-cnt-add-exec"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-cnt-add-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#1cc4c4"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#1cc4c4" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">B</span>
        <span class="bp-pin-value">1</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="en-cnt-add-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#1cc4c4"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="left: 430px; top: 20px; width: 110px;">
    <div class="bp-node-header variable">Set Count</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="en-cnt-set-value"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#1cc4c4"/></svg></span>
        <span class="bp-pin-label">Value</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="#fff"/></svg></span>
        <span class="bp-pin-label">Exec</span>
      </div>
    </div>
  </div>
</div>

## Debug Nodes

| Node | Description |
|------|-------------|
| `Print` | Output message to console |

## Related Documentation

- [Math Blueprint Nodes](/en/modules/math/blueprint-nodes) - Vector2, Fixed32, Color and other math nodes
- [Blueprint Editor Guide](/en/modules/blueprint/editor-guide) - Learn how to use the editor
- [Custom Nodes](/en/modules/blueprint/custom-nodes) - Create custom nodes
- [Blueprint VM](/en/modules/blueprint/vm) - Runtime API

---
title: "Math Blueprint Nodes"
description: "Blueprint nodes provided by the Math module - Vector2, Fixed32, FixedVector2, Color"
---

This document describes the blueprint nodes provided by the `@esengine/ecs-framework-math` module.

> **Note**: These nodes require the math module to be installed.

<script src="/js/blueprint-graph.js"></script>

## Pin Type Legend

<div class="bp-legend">
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#7ecd32" stroke-width="2"/></svg> Float</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#2196F3" stroke-width="2"/></svg> Vector2</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#9C27B0" stroke-width="2"/></svg> Fixed32</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#673AB7" stroke-width="2"/></svg> FixedVector2</div>
  <div class="bp-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="transparent" stroke="#FF9800" stroke-width="2"/></svg> Color</div>
</div>

---

## Vector2 Nodes

2D vector operations for position, velocity, and direction calculations.

### Node List

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Make Vector2` | Create Vector2 from X, Y | X, Y | Vector2 |
| `Break Vector2` | Decompose Vector2 to X, Y | Vector | X, Y |
| `Vector2 +` | Vector addition | A, B | Vector2 |
| `Vector2 -` | Vector subtraction | A, B | Vector2 |
| `Vector2 *` | Vector scaling | Vector, Scalar | Vector2 |
| `Vector2 Length` | Get vector length | Vector | Float |
| `Vector2 Normalize` | Normalize to unit vector | Vector | Vector2 |
| `Vector2 Dot` | Dot product | A, B | Float |
| `Vector2 Cross` | 2D cross product | A, B | Float |
| `Vector2 Distance` | Distance between two points | A, B | Float |
| `Vector2 Lerp` | Linear interpolation | A, B, T | Vector2 |
| `Vector2 Rotate` | Rotate by angle (radians) | Vector, Angle | Vector2 |
| `Vector2 From Angle` | Create unit vector from angle | Angle | Vector2 |

### Example: Calculate Movement Direction

Direction vector from start to end point:

<div class="bp-graph" data-connections='[{"from":"v2-start","to":"v2-sub-a","type":"vector2"},{"from":"v2-end","to":"v2-sub-b","type":"vector2"},{"from":"v2-sub-result","to":"v2-norm-in","type":"vector2"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 130px;">
    <div class="bp-node-header math" style="background: #2196F3;">Make Vector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-start"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 180px; width: 130px;">
    <div class="bp-node-header math" style="background: #2196F3;">Make Vector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">100</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">50</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-end"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 220px; top: 90px; width: 120px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 -</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-sub-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-sub-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-sub-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 400px; top: 55px; width: 140px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 Normalize</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-norm-in"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
</div>

### Example: Circular Motion

Calculate circular position using angle and radius:

<div class="bp-graph" data-connections='[{"from":"v2-angle-out","to":"v2-scale-vec","type":"vector2"},{"from":"v2-scale-result","to":"v2-add-b","type":"vector2"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 40px; width: 150px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 From Angle</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Angle</span>
        <span class="bp-pin-value">1.57</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-angle-out"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 230px; top: 40px; width: 120px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 *</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-scale-vec"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Vector</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Scalar</span>
        <span class="bp-pin-value">50</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="v2-scale-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 420px; top: 40px; width: 120px;">
    <div class="bp-node-header math" style="background: #2196F3;">Vector2 +</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#2196F3" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">A (Center)</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="v2-add-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#2196F3"/></svg></span>
        <span class="bp-pin-label">Position</span>
      </div>
    </div>
  </div>
</div>

---

## Fixed32 Nodes (Fixed-Point Numbers)

Q16.16 fixed-point number operations for lockstep networking games, ensuring cross-platform calculation consistency.

### Node List

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Fixed32 From Float` | Create from float | Float | Fixed32 |
| `Fixed32 From Int` | Create from integer | Int | Fixed32 |
| `Fixed32 To Float` | Convert to float | Fixed32 | Float |
| `Fixed32 To Int` | Convert to integer | Fixed32 | Int |
| `Fixed32 +` | Addition | A, B | Fixed32 |
| `Fixed32 -` | Subtraction | A, B | Fixed32 |
| `Fixed32 *` | Multiplication | A, B | Fixed32 |
| `Fixed32 /` | Division | A, B | Fixed32 |
| `Fixed32 Abs` | Absolute value | Value | Fixed32 |
| `Fixed32 Sqrt` | Square root | Value | Fixed32 |
| `Fixed32 Floor` | Floor | Value | Fixed32 |
| `Fixed32 Ceil` | Ceiling | Value | Fixed32 |
| `Fixed32 Round` | Round | Value | Fixed32 |
| `Fixed32 Sign` | Sign (-1, 0, 1) | Value | Fixed32 |
| `Fixed32 Min` | Minimum | A, B | Fixed32 |
| `Fixed32 Max` | Maximum | A, B | Fixed32 |
| `Fixed32 Clamp` | Clamp to range | Value, Min, Max | Fixed32 |
| `Fixed32 Lerp` | Linear interpolation | A, B, T | Fixed32 |

### Example: Lockstep Movement Speed Calculation

<div class="bp-graph" data-connections='[{"from":"f32-speed","to":"f32-mul-a","type":"fixed32"},{"from":"f32-dt","to":"f32-mul-b","type":"fixed32"},{"from":"f32-mul-result","to":"f32-tofloat","type":"fixed32"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 150px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 From Float</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Value</span>
        <span class="bp-pin-value">5.0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="f32-speed"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">Speed</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 160px; width: 150px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 From Float</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Value</span>
        <span class="bp-pin-value">0.016</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="f32-dt"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">DeltaTime</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 240px; top: 75px; width: 120px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 *</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="f32-mul-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="f32-mul-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="f32-mul-result"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 430px; top: 75px; width: 150px;">
    <div class="bp-node-header math" style="background: #9C27B0;">Fixed32 To Float</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="f32-tofloat"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#9C27B0"/></svg></span>
        <span class="bp-pin-label">Fixed</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">Float</span>
      </div>
    </div>
  </div>
</div>

---

## FixedVector2 Nodes (Fixed-Point Vectors)

Fixed-point vector operations for deterministic physics calculations, suitable for lockstep networking.

### Node List

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Make FixedVector2` | Create from X, Y floats | X, Y | FixedVector2 |
| `Break FixedVector2` | Decompose to X, Y floats | Vector | X, Y |
| `FixedVector2 +` | Vector addition | A, B | FixedVector2 |
| `FixedVector2 -` | Vector subtraction | A, B | FixedVector2 |
| `FixedVector2 *` | Scale by Fixed32 | Vector, Scalar | FixedVector2 |
| `FixedVector2 Negate` | Negate vector | Vector | FixedVector2 |
| `FixedVector2 Length` | Get length | Vector | Fixed32 |
| `FixedVector2 Normalize` | Normalize | Vector | FixedVector2 |
| `FixedVector2 Dot` | Dot product | A, B | Fixed32 |
| `FixedVector2 Cross` | 2D cross product | A, B | Fixed32 |
| `FixedVector2 Distance` | Distance between points | A, B | Fixed32 |
| `FixedVector2 Lerp` | Linear interpolation | A, B, T | FixedVector2 |

### Example: Deterministic Position Update

<div class="bp-graph" data-connections='[{"from":"fv2-pos","to":"fv2-add-a","type":"fixedvector2"},{"from":"fv2-vel","to":"fv2-add-b","type":"fixedvector2"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 150px;">
    <div class="bp-node-header math" style="background: #673AB7;">Make FixedVector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">10</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">20</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="fv2-pos"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">Position</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 180px; width: 150px;">
    <div class="bp-node-header math" style="background: #673AB7;">Make FixedVector2</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">X</span>
        <span class="bp-pin-value">1</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Y</span>
        <span class="bp-pin-value">0</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="fv2-vel"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">Velocity</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 250px; top: 90px; width: 140px;">
    <div class="bp-node-header math" style="background: #673AB7;">FixedVector2 +</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="fv2-add-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="fv2-add-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#673AB7"/></svg></span>
        <span class="bp-pin-label">New Position</span>
      </div>
    </div>
  </div>
</div>

---

## Color Nodes

Color creation and manipulation nodes.

### Node List

| Node | Description | Inputs | Output |
|------|-------------|--------|--------|
| `Make Color` | Create from RGBA | R, G, B, A | Color |
| `Break Color` | Decompose to RGBA | Color | R, G, B, A |
| `Color From Hex` | Create from hex string | Hex | Color |
| `Color To Hex` | Convert to hex string | Color | String |
| `Color From HSL` | Create from HSL | H, S, L | Color |
| `Color To HSL` | Convert to HSL | Color | H, S, L |
| `Color Lerp` | Color interpolation | A, B, T | Color |
| `Color Lighten` | Lighten | Color, Amount | Color |
| `Color Darken` | Darken | Color, Amount | Color |
| `Color Saturate` | Increase saturation | Color, Amount | Color |
| `Color Desaturate` | Decrease saturation | Color, Amount | Color |
| `Color Invert` | Invert | Color | Color |
| `Color Grayscale` | Convert to grayscale | Color | Color |
| `Color Luminance` | Get luminance | Color | Float |

### Color Constants

| Node | Value |
|------|-------|
| `Color White` | (1, 1, 1, 1) |
| `Color Black` | (0, 0, 0, 1) |
| `Color Red` | (1, 0, 0, 1) |
| `Color Green` | (0, 1, 0, 1) |
| `Color Blue` | (0, 0, 1, 1) |
| `Color Transparent` | (0, 0, 0, 0) |

### Example: Color Transition Animation

<div class="bp-graph" data-connections='[{"from":"color-a","to":"color-lerp-a","type":"color"},{"from":"color-b","to":"color-lerp-b","type":"color"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 10px; width: 120px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color Red</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="color-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 20px; top: 130px; width: 120px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color Blue</div>
    <div class="bp-node-body">
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="color-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 220px; top: 50px; width: 130px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color Lerp</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="color-lerp-a"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="color-lerp-b"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#7ecd32" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">T</span>
        <span class="bp-pin-value">0.5</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Result</span>
      </div>
    </div>
  </div>
</div>

### Example: Create Color from Hex

<div class="bp-graph" data-connections='[{"from":"hex-color","to":"break-color","type":"color"}]'>
  <svg class="bp-connections"></svg>
  <div class="bp-node" style="position: absolute; left: 20px; top: 30px; width: 150px;">
    <div class="bp-node-header math" style="background: #FF9800;">Color From Hex</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e060e0" stroke-width="2"/></svg></span>
        <span class="bp-pin-label">Hex</span>
        <span class="bp-pin-value">"#FF5722"</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin" data-pin="hex-color"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
    </div>
  </div>
  <div class="bp-node" style="position: absolute; left: 250px; top: 20px; width: 130px;">
    <div class="bp-node-header math" style="background: #FF9800;">Break Color</div>
    <div class="bp-node-body">
      <div class="bp-pin-row input">
        <span class="bp-pin" data-pin="break-color"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#FF9800"/></svg></span>
        <span class="bp-pin-label">Color</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">R</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">G</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">B</span>
      </div>
      <div class="bp-pin-row output">
        <span class="bp-pin"><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#7ecd32"/></svg></span>
        <span class="bp-pin-label">A</span>
      </div>
    </div>
  </div>
</div>

---

## Related Documentation

- [Blueprint Node Reference](/en/modules/blueprint/nodes) - Core blueprint nodes
- [Blueprint Editor Guide](/en/modules/blueprint/editor-guide) - Editor usage
- [Custom Nodes](/en/modules/blueprint/custom-nodes) - Create custom nodes

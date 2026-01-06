---
title: "Math Library"
description: "ESEngine Math Library - Vector2, Fixed32, FixedVector2, Color and other math types"
---

The `@esengine/ecs-framework-math` module provides common math types and operations for game development.

## Core Types

| Type | Description |
|------|-------------|
| `Vector2` | 2D floating-point vector for position, velocity, direction |
| `Fixed32` | Q16.16 fixed-point number for deterministic lockstep calculations |
| `FixedVector2` | 2D fixed-point vector for deterministic physics |
| `Color` | RGBA color |

## Features

### Vector2

- Addition, subtraction, scaling
- Dot product, cross product
- Length, normalization
- Distance, interpolation
- Rotation, angle conversion

### Fixed32 Fixed-Point Numbers

Designed for lockstep networking games, ensuring cross-platform calculation consistency:

- Basic operations: add, subtract, multiply, divide
- Math functions: absolute value, square root, rounding
- Comparison, clamping, interpolation
- Constants: 0, 1, 0.5, PI, 2*PI

### Color

- RGB/RGBA creation and decomposition
- Hex string conversion
- HSL color space conversion
- Color operations: lighten, darken, saturation adjustment
- Color blending and interpolation

## Blueprint Support

The math library provides rich blueprint nodes, see:

- [Math Blueprint Nodes](/en/modules/math/blueprint-nodes)

## Installation

```bash
pnpm add @esengine/ecs-framework-math
```

## Basic Usage

```typescript
import { Vector2, Fixed32, FixedVector2, Color } from '@esengine/ecs-framework-math';

// Vector2
const pos = new Vector2(10, 20);
const dir = pos.normalized();

// Fixed32 (lockstep)
const speed = Fixed32.from(5.0);
const dt = Fixed32.from(0.016);
const distance = speed.mul(dt);

// FixedVector2
const fixedPos = FixedVector2.from(10, 20);
const fixedVel = FixedVector2.from(1, 0);
const newPos = fixedPos.add(fixedVel);

// Color
const red = Color.RED;
const blue = Color.BLUE;
const purple = Color.lerp(red, blue, 0.5);
```

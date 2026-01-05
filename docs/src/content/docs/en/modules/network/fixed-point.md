---
title: "Fixed-Point Numbers"
description: "Deterministic fixed-point math library for lockstep games"
---

`@esengine/ecs-framework-math` provides deterministic fixed-point calculations designed for **Lockstep** architecture. Fixed-point numbers guarantee identical results across all platforms.

## Why Fixed-Point?

Floating-point numbers may produce different rounding results on different platforms:

```typescript
// Floating-point: may differ across platforms
const a = 0.1 + 0.2;  // 0.30000000000000004 (some platforms)
                      // 0.3 (other platforms)

// Fixed-point: consistent everywhere
const x = Fixed32.from(0.1);
const y = Fixed32.from(0.2);
const z = x.add(y);   // raw = 19661 (all platforms)
```

| Feature | Floating-Point | Fixed-Point |
|---------|----------------|-------------|
| Cross-platform consistency | ❌ May differ | ✅ Identical |
| Network sync mode | State sync | Lockstep |
| Game types | FPS, RPG | RTS, MOBA, Fighting |

## Installation

```bash
npm install @esengine/ecs-framework-math
```

## Fixed32 Fixed-Point Number

Q16.16 format: 16-bit integer + 16-bit fraction, range ±32767.99998.

### Creating Fixed-Point Numbers

```typescript
import { Fixed32 } from '@esengine/ecs-framework-math';

// From floating-point
const speed = Fixed32.from(5.5);

// From integer (no precision loss)
const count = Fixed32.fromInt(10);

// From raw value (after network receive)
const received = Fixed32.fromRaw(360448);  // equals 5.5

// Predefined constants
Fixed32.ZERO        // 0
Fixed32.ONE         // 1
Fixed32.HALF        // 0.5
Fixed32.PI          // π
Fixed32.TWO_PI      // 2π
Fixed32.HALF_PI     // π/2
```

### Basic Operations

```typescript
const a = Fixed32.from(10);
const b = Fixed32.from(3);

const sum = a.add(b);       // 13
const diff = a.sub(b);      // 7
const prod = a.mul(b);      // 30
const quot = a.div(b);      // 3.333...
const mod = a.mod(b);       // 1
const neg = a.neg();        // -10
const abs = neg.abs();      // 10
```

### Comparison Operations

```typescript
const x = Fixed32.from(5);
const y = Fixed32.from(3);

x.eq(y)     // false - equal
x.ne(y)     // true  - not equal
x.lt(y)     // false - less than
x.le(y)     // false - less or equal
x.gt(y)     // true  - greater than
x.ge(y)     // true  - greater or equal

x.isZero()      // false
x.isPositive()  // true
x.isNegative()  // false
```

### Math Functions

```typescript
// Square root (Newton's method, deterministic)
const sqrt = Fixed32.sqrt(Fixed32.from(16));  // 4

// Rounding
Fixed32.floor(Fixed32.from(3.7))   // 3
Fixed32.ceil(Fixed32.from(3.2))    // 4
Fixed32.round(Fixed32.from(3.5))   // 4

// Clamping
Fixed32.clamp(value, min, max)

// Linear interpolation
Fixed32.lerp(from, to, t)

// Min/Max
Fixed32.min(a, b)
Fixed32.max(a, b)
```

### Type Conversion

```typescript
const value = Fixed32.from(3.14159);

// To float (for rendering)
const float = value.toNumber();  // 3.14159

// Get raw value (for network)
const raw = value.toRaw();  // 205887

// To integer (floor)
const int = value.toInt();  // 3
```

## FixedVector2 Fixed-Point Vector

Immutable 2D vector, all operations return new instances.

### Creating Vectors

```typescript
import { FixedVector2, Fixed32 } from '@esengine/ecs-framework-math';

// From floating-point
const pos = FixedVector2.from(100, 200);

// From raw values (after network receive)
const received = FixedVector2.fromRaw(6553600, 13107200);

// From Fixed32
const vec = new FixedVector2(Fixed32.from(10), Fixed32.from(20));

// Predefined constants
FixedVector2.ZERO   // (0, 0)
FixedVector2.ONE    // (1, 1)
FixedVector2.RIGHT  // (1, 0)
FixedVector2.LEFT   // (-1, 0)
FixedVector2.UP     // (0, 1)
FixedVector2.DOWN   // (0, -1)
```

### Vector Operations

```typescript
const a = FixedVector2.from(3, 4);
const b = FixedVector2.from(1, 2);

// Basic operations
const sum = a.add(b);                    // (4, 6)
const diff = a.sub(b);                   // (2, 2)
const scaled = a.mul(Fixed32.from(2));   // (6, 8)
const divided = a.div(Fixed32.from(2));  // (1.5, 2)

// Vector products
const dot = a.dot(b);    // 3*1 + 4*2 = 11
const cross = a.cross(b); // 3*2 - 4*1 = 2

// Length
const lenSq = a.lengthSquared();  // 25
const len = a.length();           // 5

// Normalize
const norm = a.normalize();  // (0.6, 0.8)

// Distance
const dist = a.distanceTo(b);  // sqrt((3-1)² + (4-2)²)
```

### Rotation and Angles

```typescript
import { FixedMath } from '@esengine/ecs-framework-math';

const vec = FixedVector2.from(1, 0);
const angle = Fixed32.from(Math.PI / 2);  // 90 degrees

// Rotate vector
const rotated = vec.rotate(angle);  // (0, 1)

// Rotate around point
const center = FixedVector2.from(5, 5);
const around = vec.rotateAround(center, angle);

// Get vector angle
const vecAngle = vec.angle();

// Angle between vectors
const between = vec.angleTo(other);

// Create unit vector from angle
const dir = FixedVector2.fromAngle(angle);

// From polar coordinates
const polar = FixedVector2.fromPolar(length, angle);
```

### Type Conversion

```typescript
const pos = FixedVector2.from(100.5, 200.5);

// To float object (for rendering)
const obj = pos.toObject();  // { x: 100.5, y: 200.5 }

// To array
const arr = pos.toArray();  // [100.5, 200.5]

// Get raw values (for network)
const raw = pos.toRawObject();  // { x: 6586368, y: 13140992 }
```

## FixedMath Trigonometric Functions

Deterministic trigonometric functions using lookup tables.

```typescript
import { FixedMath, Fixed32 } from '@esengine/ecs-framework-math';

const angle = Fixed32.from(Math.PI / 6);  // 30 degrees

// Trigonometric functions
const sin = FixedMath.sin(angle);  // 0.5
const cos = FixedMath.cos(angle);  // 0.866
const tan = FixedMath.tan(angle);  // 0.577

// Inverse trigonometric
const atan = FixedMath.atan2(y, x);
const asin = FixedMath.asin(value);
const acos = FixedMath.acos(value);

// Normalize angle to [-π, π]
const normalized = FixedMath.normalizeAngle(angle);

// Angle difference (shortest path)
const delta = FixedMath.angleDelta(from, to);

// Angle interpolation (handles 360° wrap)
const lerped = FixedMath.lerpAngle(from, to, t);

// Radian/degree conversion
const deg = FixedMath.radToDeg(rad);
const rad = FixedMath.degToRad(deg);
```

## Best Practices

### 1. Use Fixed-Point Throughout

```typescript
// ✅ Correct: all game logic uses fixed-point
function calculateDamage(baseDamage: Fixed32, multiplier: Fixed32): Fixed32 {
    return baseDamage.mul(multiplier);
}

// ❌ Wrong: mixing floating-point
function calculateDamage(baseDamage: number, multiplier: number): number {
    return baseDamage * multiplier;  // may be inconsistent
}
```

### 2. Only Convert to Float for Rendering

```typescript
// Game logic
const position: FixedVector2 = calculatePosition(input);

// Rendering
const { x, y } = position.toObject();
sprite.position.set(x, y);
```

### 3. Use Raw Values for Network

```typescript
// ✅ Correct: transmit raw integers
const raw = position.toRawObject();
send(JSON.stringify(raw));

// ❌ Wrong: transmit floats
const float = position.toObject();
send(JSON.stringify(float));  // may lose precision
```

### 4. Use FixedMath for Trigonometry

```typescript
// ✅ Correct: use lookup tables
const direction = FixedVector2.fromAngle(FixedMath.atan2(dy, dx));

// ❌ Wrong: use Math library
const angle = Math.atan2(dy.toNumber(), dx.toNumber());  // non-deterministic
```

## API Exports

```typescript
import {
    Fixed32,
    FixedVector2,
    FixedMath,
    type IFixed32,
    type IFixedVector2
} from '@esengine/ecs-framework-math';
```

## Related Docs

- [State Sync](/en/modules/network/sync) - Fixed-point snapshot buffer
- [Client Prediction](/en/modules/network/prediction) - Fixed-point client prediction

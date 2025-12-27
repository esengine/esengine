---
title: "Seeded Random"
description: "SeededRandom API and distribution methods"
---

## SeededRandom

Deterministic PRNG based on xorshift128+ algorithm:

```typescript
import { createSeededRandom } from '@esengine/procgen';

const rng = createSeededRandom(42);
```

## Basic Methods

```typescript
// [0, 1) float
rng.next();

// [min, max] integer
rng.nextInt(1, 10);

// [min, max) float
rng.nextFloat(0, 100);

// Boolean (with optional probability)
rng.nextBool();      // 50%
rng.nextBool(0.3);   // 30%

// Reset to initial state
rng.reset();
```

## Distribution Methods

```typescript
// Normal distribution (Gaussian)
rng.nextGaussian();          // mean 0, stdDev 1
rng.nextGaussian(100, 15);   // mean 100, stdDev 15

// Exponential distribution
rng.nextExponential();       // λ = 1
rng.nextExponential(0.5);    // λ = 0.5
```

## Geometry Methods

```typescript
// Uniform point in circle
const point = rng.nextPointInCircle(50); // { x, y }

// Point on circle edge
const edge = rng.nextPointOnCircle(50);  // { x, y }

// Uniform point in sphere
const point3D = rng.nextPointInSphere(50); // { x, y, z }

// Random direction vector
const dir = rng.nextDirection2D(); // { x, y }, length 1
```

## Determinism Guarantee

Same seed always produces same sequence:

```typescript
const rng1 = createSeededRandom(12345);
const rng2 = createSeededRandom(12345);

// These sequences are identical
console.log(rng1.next()); // 0.xxx
console.log(rng2.next()); // 0.xxx (same)

console.log(rng1.nextInt(1, 100)); // N
console.log(rng2.nextInt(1, 100)); // N (same)
```

## Saving and Restoring State

```typescript
// Save seed for reproducibility
const seed = Date.now();
const rng = createSeededRandom(seed);
saveSeed(seed);

// Later, restore with same seed
const savedSeed = loadSeed();
const rng2 = createSeededRandom(savedSeed);
// Will produce identical sequence
```

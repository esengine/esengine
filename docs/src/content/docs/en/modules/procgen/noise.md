---
title: "Noise Functions"
description: "Perlin, Simplex, Worley, and FBM"
---

## Perlin Noise

Classic gradient noise, output range [-1, 1]:

```typescript
import { createPerlinNoise } from '@esengine/procgen';

const perlin = createPerlinNoise(seed);

// 2D noise
const value2D = perlin.noise2D(x, y);

// 3D noise
const value3D = perlin.noise3D(x, y, z);
```

## Simplex Noise

Faster than Perlin with less directional bias:

```typescript
import { createSimplexNoise } from '@esengine/procgen';

const simplex = createSimplexNoise(seed);

const value = simplex.noise2D(x, y);
```

## Worley Noise

Cell-based noise, suitable for stone, cell textures:

```typescript
import { createWorleyNoise } from '@esengine/procgen';

const worley = createWorleyNoise(seed);

// Returns distance to nearest point
const distance = worley.noise2D(x, y);
```

## FBM (Fractal Brownian Motion)

Layer multiple noise octaves for richer detail:

```typescript
import { createPerlinNoise, createFBM } from '@esengine/procgen';

const baseNoise = createPerlinNoise(seed);

const fbm = createFBM(baseNoise, {
    octaves: 6,        // Layer count (more = richer detail)
    lacunarity: 2.0,   // Frequency multiplier
    persistence: 0.5,  // Amplitude decay factor
    frequency: 1.0,    // Initial frequency
    amplitude: 1.0     // Initial amplitude
});

// Standard FBM
const value = fbm.noise2D(x, y);

// Ridged FBM (for mountains)
const ridged = fbm.ridged2D(x, y);

// Turbulence
const turb = fbm.turbulence2D(x, y);

// Billowed (for clouds)
const cloud = fbm.billowed2D(x, y);
```

## FBM Parameter Guide

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| `octaves` | Layer count, more = richer detail | 4-8 |
| `lacunarity` | Frequency multiplier | 2.0 |
| `persistence` | Amplitude decay factor | 0.5 |
| `frequency` | Initial frequency | 0.01-0.1 |
| `amplitude` | Initial amplitude | 1.0 |

## Choosing the Right Noise

| Noise Type | Use Case |
|------------|----------|
| Perlin | Smooth terrain transitions, clouds |
| Simplex | Performance-critical scenarios |
| Worley | Cells, stone, crack textures |
| FBM | Multi-layer natural detail effects |
| Ridged FBM | Mountains, ridged terrain |
| Turbulence | Flame, smoke effects |
| Billowed FBM | Clouds, soft puffy effects |

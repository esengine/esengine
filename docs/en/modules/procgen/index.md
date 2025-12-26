# Procedural Generation (Procgen)

`@esengine/procgen` provides core tools for procedural content generation, including noise functions, seeded random numbers, and various random utilities.

## Installation

```bash
npm install @esengine/procgen
```

## Quick Start

### Noise Generation

```typescript
import { createPerlinNoise, createFBM } from '@esengine/procgen';

// Create Perlin noise
const perlin = createPerlinNoise(12345); // seed

// Sample 2D noise
const value = perlin.noise2D(x * 0.1, y * 0.1);
console.log(value); // [-1, 1]

// Use FBM for more natural results
const fbm = createFBM(perlin, {
    octaves: 6,
    persistence: 0.5
});

const height = fbm.noise2D(x * 0.01, y * 0.01);
```

### Seeded Random

```typescript
import { createSeededRandom } from '@esengine/procgen';

// Create deterministic random generator
const rng = createSeededRandom(42);

// Same seed always produces same sequence
console.log(rng.next());          // 0.xxx
console.log(rng.nextInt(1, 100)); // 1-100
console.log(rng.nextBool(0.3));   // 30% true
```

### Weighted Random

```typescript
import { createWeightedRandom, createSeededRandom } from '@esengine/procgen';

const rng = createSeededRandom(42);

const loot = createWeightedRandom([
    { value: 'common',    weight: 60 },
    { value: 'uncommon',  weight: 25 },
    { value: 'rare',      weight: 10 },
    { value: 'legendary', weight: 5 }
]);

const drop = loot.pick(rng);
console.log(drop); // Likely 'common'
```

## Noise Functions

### Perlin Noise

Classic gradient noise, output range [-1, 1]:

```typescript
import { createPerlinNoise } from '@esengine/procgen';

const perlin = createPerlinNoise(seed);
const value2D = perlin.noise2D(x, y);
const value3D = perlin.noise3D(x, y, z);
```

### Simplex Noise

Faster than Perlin, less directional bias:

```typescript
import { createSimplexNoise } from '@esengine/procgen';

const simplex = createSimplexNoise(seed);
const value = simplex.noise2D(x, y);
```

### Worley Noise

Cell-based noise for stone, cell textures:

```typescript
import { createWorleyNoise } from '@esengine/procgen';

const worley = createWorleyNoise(seed);
const distance = worley.noise2D(x, y);
```

### FBM (Fractal Brownian Motion)

Layer multiple noise octaves for richer detail:

```typescript
import { createPerlinNoise, createFBM } from '@esengine/procgen';

const baseNoise = createPerlinNoise(seed);

const fbm = createFBM(baseNoise, {
    octaves: 6,        // Layer count (more = richer detail)
    lacunarity: 2.0,   // Frequency multiplier
    persistence: 0.5,  // Amplitude decay
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

## Seeded Random API

### SeededRandom

Deterministic PRNG based on xorshift128+:

```typescript
import { createSeededRandom } from '@esengine/procgen';

const rng = createSeededRandom(42);
```

### Basic Methods

```typescript
rng.next();              // [0, 1) float
rng.nextInt(1, 10);      // [min, max] integer
rng.nextFloat(0, 100);   // [min, max) float
rng.nextBool();          // 50%
rng.nextBool(0.3);       // 30%
rng.reset();             // Reset to initial state
```

### Distribution Methods

```typescript
// Normal distribution (Gaussian)
rng.nextGaussian();          // mean 0, stdDev 1
rng.nextGaussian(100, 15);   // mean 100, stdDev 15

// Exponential distribution
rng.nextExponential();       // λ = 1
rng.nextExponential(0.5);    // λ = 0.5
```

### Geometry Methods

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

## Weighted Random API

### WeightedRandom

Precomputed cumulative weights for efficient selection:

```typescript
import { createWeightedRandom } from '@esengine/procgen';

const selector = createWeightedRandom([
    { value: 'apple',  weight: 5 },
    { value: 'banana', weight: 3 },
    { value: 'cherry', weight: 2 }
]);

const result = selector.pick(rng);
const result2 = selector.pickRandom(); // Uses Math.random

console.log(selector.getProbability(0)); // 0.5 (5/10)
console.log(selector.size);              // 3
console.log(selector.totalWeight);       // 10
```

### Convenience Functions

```typescript
import { weightedPick, weightedPickFromMap } from '@esengine/procgen';

const item = weightedPick([
    { value: 'a', weight: 1 },
    { value: 'b', weight: 2 }
], rng);

const item2 = weightedPickFromMap({
    'common': 60,
    'rare': 30,
    'epic': 10
}, rng);
```

## Shuffle and Sampling

### shuffle / shuffleCopy

Fisher-Yates shuffle:

```typescript
import { shuffle, shuffleCopy } from '@esengine/procgen';

const arr = [1, 2, 3, 4, 5];
shuffle(arr, rng);           // In-place
const shuffled = shuffleCopy(arr, rng); // Copy
```

### pickOne

```typescript
import { pickOne } from '@esengine/procgen';

const item = pickOne(['a', 'b', 'c', 'd'], rng);
```

### sample / sampleWithReplacement

```typescript
import { sample, sampleWithReplacement } from '@esengine/procgen';

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const unique = sample(arr, 3, rng);      // 3 unique
const withRep = sampleWithReplacement(arr, 5, rng); // 5 with replacement
```

### randomIntegers

```typescript
import { randomIntegers } from '@esengine/procgen';

// 5 unique random integers from 1-100
const nums = randomIntegers(1, 100, 5, rng);
```

### weightedSample

```typescript
import { weightedSample } from '@esengine/procgen';

const items = ['A', 'B', 'C', 'D', 'E'];
const weights = [10, 8, 6, 4, 2];
const selected = weightedSample(items, weights, 3, rng);
```

## Practical Examples

### Procedural Terrain

```typescript
import { createPerlinNoise, createFBM } from '@esengine/procgen';

class TerrainGenerator {
    private fbm: FBM;
    private moistureFbm: FBM;

    constructor(seed: number) {
        const heightNoise = createPerlinNoise(seed);
        const moistureNoise = createPerlinNoise(seed + 1000);

        this.fbm = createFBM(heightNoise, {
            octaves: 8,
            persistence: 0.5,
            frequency: 0.01
        });

        this.moistureFbm = createFBM(moistureNoise, {
            octaves: 4,
            persistence: 0.6,
            frequency: 0.02
        });
    }

    getHeight(x: number, y: number): number {
        let height = this.fbm.noise2D(x, y);
        height += this.fbm.ridged2D(x * 0.5, y * 0.5) * 0.3;
        return (height + 1) * 0.5; // Normalize to [0, 1]
    }

    getBiome(x: number, y: number): string {
        const height = this.getHeight(x, y);
        const moisture = (this.moistureFbm.noise2D(x, y) + 1) * 0.5;

        if (height < 0.3) return 'water';
        if (height < 0.4) return 'beach';
        if (height > 0.8) return 'mountain';

        if (moisture < 0.3) return 'desert';
        if (moisture > 0.7) return 'forest';
        return 'grassland';
    }
}
```

### Loot System

```typescript
import { createSeededRandom, createWeightedRandom } from '@esengine/procgen';

class LootSystem {
    private rng: SeededRandom;
    private raritySelector: WeightedRandom<string>;

    constructor(seed: number) {
        this.rng = createSeededRandom(seed);
        this.raritySelector = createWeightedRandom([
            { value: 'common',    weight: 60 },
            { value: 'uncommon',  weight: 25 },
            { value: 'rare',      weight: 10 },
            { value: 'legendary', weight: 5 }
        ]);
    }

    generateLoot(count: number): LootItem[] {
        const loot: LootItem[] = [];
        for (let i = 0; i < count; i++) {
            const rarity = this.raritySelector.pick(this.rng);
            // Get item from rarity table...
            loot.push(item);
        }
        return loot;
    }
}
```

## Blueprint Nodes

### Noise Nodes
- `SampleNoise2D` - Sample 2D noise
- `SampleFBM` - Sample FBM noise

### Random Nodes
- `SeededRandom` - Generate random float
- `SeededRandomInt` - Generate random integer
- `WeightedPick` - Weighted random selection
- `ShuffleArray` - Shuffle array
- `PickRandom` - Pick random element
- `SampleArray` - Sample from array
- `RandomPointInCircle` - Random point in circle

## Best Practices

1. **Use seeds for reproducibility**
   ```typescript
   const seed = Date.now();
   const rng = createSeededRandom(seed);
   saveSeed(seed);
   ```

2. **Precompute weighted selectors**
   ```typescript
   // Good: Create once, use many times
   const selector = createWeightedRandom(items);
   for (let i = 0; i < 1000; i++) {
       selector.pick(rng);
   }
   ```

3. **Choose appropriate noise**
   - Perlin: Smooth terrain, clouds
   - Simplex: Performance-critical
   - Worley: Cell textures, stone
   - FBM: Natural multi-detail effects

4. **Tune FBM parameters**
   - `octaves`: More = richer detail, higher cost
   - `persistence`: 0.5 is common, higher = more high-frequency detail
   - `lacunarity`: Usually 2, controls frequency growth

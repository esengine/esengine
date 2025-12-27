---
title: "Examples"
description: "Terrain, loot, enemies, and level generation"
---

## Procedural Terrain Generation

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
        // Base height
        let height = this.fbm.noise2D(x, y);

        // Add mountains
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

## Loot System

```typescript
import { createSeededRandom, createWeightedRandom, pickOne } from '@esengine/procgen';

interface LootItem {
    id: string;
    rarity: string;
}

class LootSystem {
    private rng: SeededRandom;
    private raritySelector: WeightedRandom<string>;
    private lootTables: Map<string, LootItem[]> = new Map();

    constructor(seed: number) {
        this.rng = createSeededRandom(seed);

        this.raritySelector = createWeightedRandom([
            { value: 'common',    weight: 60 },
            { value: 'uncommon',  weight: 25 },
            { value: 'rare',      weight: 10 },
            { value: 'legendary', weight: 5 }
        ]);

        // Initialize loot tables
        this.lootTables.set('common', [/* ... */]);
        this.lootTables.set('rare', [/* ... */]);
    }

    generateLoot(count: number): LootItem[] {
        const loot: LootItem[] = [];

        for (let i = 0; i < count; i++) {
            const rarity = this.raritySelector.pick(this.rng);
            const table = this.lootTables.get(rarity)!;
            const item = pickOne(table, this.rng);
            loot.push(item);
        }

        return loot;
    }

    // Ensure reproducibility
    setSeed(seed: number): void {
        this.rng = createSeededRandom(seed);
    }
}
```

## Procedural Enemy Placement

```typescript
import { createSeededRandom } from '@esengine/procgen';

class EnemySpawner {
    private rng: SeededRandom;

    constructor(seed: number) {
        this.rng = createSeededRandom(seed);
    }

    spawnEnemiesInArea(
        centerX: number,
        centerY: number,
        radius: number,
        count: number
    ): Array<{ x: number; y: number; type: string }> {
        const enemies: Array<{ x: number; y: number; type: string }> = [];

        for (let i = 0; i < count; i++) {
            // Generate position in circle
            const pos = this.rng.nextPointInCircle(radius);

            // Randomly select enemy type
            const type = this.rng.nextBool(0.2) ? 'elite' : 'normal';

            enemies.push({
                x: centerX + pos.x,
                y: centerY + pos.y,
                type
            });
        }

        return enemies;
    }
}
```

## Procedural Level Layout

```typescript
import { createSeededRandom, shuffle } from '@esengine/procgen';

interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'start' | 'combat' | 'treasure' | 'boss';
}

class DungeonGenerator {
    private rng: SeededRandom;

    constructor(seed: number) {
        this.rng = createSeededRandom(seed);
    }

    generate(roomCount: number): Room[] {
        const rooms: Room[] = [];

        // Generate rooms
        for (let i = 0; i < roomCount; i++) {
            rooms.push({
                x: this.rng.nextInt(0, 100),
                y: this.rng.nextInt(0, 100),
                width: this.rng.nextInt(5, 15),
                height: this.rng.nextInt(5, 15),
                type: 'combat'
            });
        }

        // Randomly assign special rooms
        shuffle(rooms, this.rng);
        rooms[0].type = 'start';
        rooms[1].type = 'treasure';
        rooms[rooms.length - 1].type = 'boss';

        return rooms;
    }
}
```

## Blueprint Nodes

Procgen module provides blueprint nodes for visual scripting:

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

2. **Precompute weighted selectors** - Avoid repeated creation

3. **Choose appropriate noise**
   - Perlin: Smooth terrain, clouds
   - Simplex: Performance-critical
   - Worley: Cells, stone textures
   - FBM: Multi-layer natural effects

4. **Tune FBM parameters**
   - `octaves`: More = richer detail, higher cost
   - `persistence`: 0.5 is common, higher = more high-frequency detail
   - `lacunarity`: Usually 2, controls frequency growth

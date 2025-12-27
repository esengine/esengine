---
title: "实际示例"
description: "地形、战利品、敌人和关卡生成"
---

## 程序化地形生成

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
        // 基础高度
        let height = this.fbm.noise2D(x, y);

        // 添加山脉
        height += this.fbm.ridged2D(x * 0.5, y * 0.5) * 0.3;

        return (height + 1) * 0.5; // 归一化到 [0, 1]
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

## 战利品系统

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

        // 初始化战利品表
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

    // 保证可重现
    setSeed(seed: number): void {
        this.rng = createSeededRandom(seed);
    }
}
```

## 程序化敌人放置

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
            // 在圆内生成位置
            const pos = this.rng.nextPointInCircle(radius);

            // 随机选择敌人类型
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

## 程序化关卡布局

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

        // 生成房间
        for (let i = 0; i < roomCount; i++) {
            rooms.push({
                x: this.rng.nextInt(0, 100),
                y: this.rng.nextInt(0, 100),
                width: this.rng.nextInt(5, 15),
                height: this.rng.nextInt(5, 15),
                type: 'combat'
            });
        }

        // 随机分配特殊房间
        shuffle(rooms, this.rng);
        rooms[0].type = 'start';
        rooms[1].type = 'treasure';
        rooms[rooms.length - 1].type = 'boss';

        return rooms;
    }
}
```

## 蓝图节点

Procgen 模块提供了可视化脚本支持的蓝图节点：

### 噪声节点

- `SampleNoise2D` - 采样 2D 噪声
- `SampleFBM` - 采样 FBM 噪声

### 随机节点

- `SeededRandom` - 生成随机浮点数
- `SeededRandomInt` - 生成随机整数
- `WeightedPick` - 加权随机选择
- `ShuffleArray` - 洗牌数组
- `PickRandom` - 随机选择元素
- `SampleArray` - 采样数组
- `RandomPointInCircle` - 圆内随机点

## 最佳实践

1. **使用种子保证可重现性**
   ```typescript
   const seed = Date.now();
   const rng = createSeededRandom(seed);
   saveSeed(seed);
   ```

2. **预计算加权选择器** - 避免重复创建

3. **选择合适的噪声函数**
   - Perlin：平滑过渡的地形、云彩
   - Simplex：性能要求高的场景
   - Worley：细胞、石头纹理
   - FBM：需要多层细节的自然效果

4. **调整 FBM 参数**
   - `octaves`：越多细节越丰富，但性能开销越大
   - `persistence`：0.5 是常用值，越大高频细节越明显
   - `lacunarity`：通常为 2，控制频率增长速度

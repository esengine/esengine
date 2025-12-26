# 程序化生成 (Procgen)

`@esengine/procgen` 提供了程序化内容生成的核心工具，包括噪声函数、种子随机数和各种随机工具。

## 安装

```bash
npm install @esengine/procgen
```

## 快速开始

### 噪声生成

```typescript
import { createPerlinNoise, createFBM } from '@esengine/procgen';

// 创建 Perlin 噪声
const perlin = createPerlinNoise(12345); // 种子

// 采样 2D 噪声
const value = perlin.noise2D(x * 0.1, y * 0.1);
console.log(value); // [-1, 1]

// 使用 FBM 获得更自然的效果
const fbm = createFBM(perlin, {
    octaves: 6,
    persistence: 0.5
});

const height = fbm.noise2D(x * 0.01, y * 0.01);
```

### 种子随机数

```typescript
import { createSeededRandom } from '@esengine/procgen';

// 创建确定性随机数生成器
const rng = createSeededRandom(42);

// 相同种子总是产生相同序列
console.log(rng.next());      // 0.xxx
console.log(rng.nextInt(1, 100)); // 1-100
console.log(rng.nextBool(0.3));   // 30% true
```

### 加权随机

```typescript
import { createWeightedRandom, createSeededRandom } from '@esengine/procgen';

const rng = createSeededRandom(42);

// 创建加权选择器
const loot = createWeightedRandom([
    { value: 'common',    weight: 60 },
    { value: 'uncommon',  weight: 25 },
    { value: 'rare',      weight: 10 },
    { value: 'legendary', weight: 5 }
]);

// 随机选择
const drop = loot.pick(rng);
console.log(drop); // 大概率是 'common'
```

## 噪声函数

### Perlin 噪声

经典的梯度噪声，输出范围 [-1, 1]：

```typescript
import { createPerlinNoise } from '@esengine/procgen';

const perlin = createPerlinNoise(seed);

// 2D 噪声
const value2D = perlin.noise2D(x, y);

// 3D 噪声
const value3D = perlin.noise3D(x, y, z);
```

### Simplex 噪声

比 Perlin 更快、更少方向性偏差：

```typescript
import { createSimplexNoise } from '@esengine/procgen';

const simplex = createSimplexNoise(seed);

const value = simplex.noise2D(x, y);
```

### Worley 噪声

基于细胞的噪声，适合生成石头、细胞等纹理：

```typescript
import { createWorleyNoise } from '@esengine/procgen';

const worley = createWorleyNoise(seed);

// 返回到最近点的距离
const distance = worley.noise2D(x, y);
```

### FBM (分形布朗运动)

叠加多层噪声创建更丰富的细节：

```typescript
import { createPerlinNoise, createFBM } from '@esengine/procgen';

const baseNoise = createPerlinNoise(seed);

const fbm = createFBM(baseNoise, {
    octaves: 6,        // 层数（越多细节越丰富）
    lacunarity: 2.0,   // 频率倍增因子
    persistence: 0.5,  // 振幅衰减因子
    frequency: 1.0,    // 初始频率
    amplitude: 1.0     // 初始振幅
});

// 标准 FBM
const value = fbm.noise2D(x, y);

// Ridged FBM（脊状，适合山脉）
const ridged = fbm.ridged2D(x, y);

// Turbulence（湍流）
const turb = fbm.turbulence2D(x, y);

// Billowed（膨胀，适合云朵）
const cloud = fbm.billowed2D(x, y);
```

## 种子随机数 API

### SeededRandom

基于 xorshift128+ 算法的确定性伪随机数生成器：

```typescript
import { createSeededRandom } from '@esengine/procgen';

const rng = createSeededRandom(42);
```

### 基础方法

```typescript
// [0, 1) 浮点数
rng.next();

// [min, max] 整数
rng.nextInt(1, 10);

// [min, max) 浮点数
rng.nextFloat(0, 100);

// 布尔值（可指定概率）
rng.nextBool();      // 50%
rng.nextBool(0.3);   // 30%

// 重置到初始状态
rng.reset();
```

### 分布方法

```typescript
// 正态分布（高斯分布）
rng.nextGaussian();          // 均值 0, 标准差 1
rng.nextGaussian(100, 15);   // 均值 100, 标准差 15

// 指数分布
rng.nextExponential();       // λ = 1
rng.nextExponential(0.5);    // λ = 0.5
```

### 几何方法

```typescript
// 圆内均匀分布的点
const point = rng.nextPointInCircle(50); // { x, y }

// 圆周上的点
const edge = rng.nextPointOnCircle(50);  // { x, y }

// 球内均匀分布的点
const point3D = rng.nextPointInSphere(50); // { x, y, z }

// 随机方向向量
const dir = rng.nextDirection2D(); // { x, y }，长度为 1
```

## 加权随机 API

### WeightedRandom

预计算累积权重，高效随机选择：

```typescript
import { createWeightedRandom } from '@esengine/procgen';

const selector = createWeightedRandom([
    { value: 'apple',  weight: 5 },
    { value: 'banana', weight: 3 },
    { value: 'cherry', weight: 2 }
]);

// 使用种子随机数
const result = selector.pick(rng);

// 使用 Math.random
const result2 = selector.pickRandom();

// 获取概率
console.log(selector.getProbability(0)); // 0.5 (5/10)
console.log(selector.size);              // 3
console.log(selector.totalWeight);       // 10
```

### 便捷函数

```typescript
import { weightedPick, weightedPickFromMap } from '@esengine/procgen';

// 从数组选择
const item = weightedPick([
    { value: 'a', weight: 1 },
    { value: 'b', weight: 2 }
], rng);

// 从对象选择
const item2 = weightedPickFromMap({
    'common': 60,
    'rare': 30,
    'epic': 10
}, rng);
```

## 洗牌和采样 API

### shuffle / shuffleCopy

Fisher-Yates 洗牌算法：

```typescript
import { shuffle, shuffleCopy } from '@esengine/procgen';

const arr = [1, 2, 3, 4, 5];

// 原地洗牌
shuffle(arr, rng);

// 创建洗牌副本（不修改原数组）
const shuffled = shuffleCopy(arr, rng);
```

### pickOne

随机选择一个元素：

```typescript
import { pickOne } from '@esengine/procgen';

const items = ['a', 'b', 'c', 'd'];
const item = pickOne(items, rng);
```

### sample / sampleWithReplacement

采样：

```typescript
import { sample, sampleWithReplacement } from '@esengine/procgen';

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 采样 3 个不重复元素
const unique = sample(arr, 3, rng);

// 采样 5 个（可重复）
const withRep = sampleWithReplacement(arr, 5, rng);
```

### randomIntegers

生成范围内的随机整数数组：

```typescript
import { randomIntegers } from '@esengine/procgen';

// 从 1-100 中随机选 5 个不重复的数
const nums = randomIntegers(1, 100, 5, rng);
```

### weightedSample

按权重采样（不重复）：

```typescript
import { weightedSample } from '@esengine/procgen';

const items = ['A', 'B', 'C', 'D', 'E'];
const weights = [10, 8, 6, 4, 2];

// 按权重选 3 个
const selected = weightedSample(items, weights, 3, rng);
```

## 实际示例

### 程序化地形生成

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

### 战利品系统

```typescript
import { createSeededRandom, createWeightedRandom, sample } from '@esengine/procgen';

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
        // ...
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

### 程序化敌人放置

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

### 程序化关卡布局

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
   // 保存种子以便重现相同结果
   const seed = Date.now();
   const rng = createSeededRandom(seed);
   saveSeed(seed);
   ```

2. **预计算加权选择器**
   ```typescript
   // 好：创建一次，多次使用
   const selector = createWeightedRandom(items);
   for (let i = 0; i < 1000; i++) {
       selector.pick(rng);
   }

   // 不好：每次都创建
   for (let i = 0; i < 1000; i++) {
       weightedPick(items, rng);
   }
   ```

3. **选择合适的噪声函数**
   - Perlin：平滑过渡的地形、云彩
   - Simplex：性能要求高的场景
   - Worley：细胞、石头纹理
   - FBM：需要多层细节的自然效果

4. **调整 FBM 参数**
   - `octaves`：越多细节越丰富，但性能开销越大
   - `persistence`：0.5 是常用值，越大高频细节越明显
   - `lacunarity`：通常为 2，控制频率增长速度

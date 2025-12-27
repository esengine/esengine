---
title: "程序化生成 (Procgen)"
description: "噪声函数、种子随机数和随机工具"
---

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

## 文档导航

- [噪声函数](./noise) - Perlin、Simplex、Worley、FBM
- [种子随机数](./random) - SeededRandom API 和分布方法
- [采样工具](./sampling) - 加权随机、洗牌、采样
- [实际示例](./examples) - 地形、战利品、关卡生成

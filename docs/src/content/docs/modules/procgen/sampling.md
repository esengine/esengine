---
title: "采样工具"
description: "加权随机、洗牌和采样函数"
---

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

## 洗牌 API

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

## 采样 API

### sample / sampleWithReplacement

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

## 性能建议

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

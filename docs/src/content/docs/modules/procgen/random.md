---
title: "种子随机数"
description: "SeededRandom API 和分布方法"
---

## SeededRandom

基于 xorshift128+ 算法的确定性伪随机数生成器：

```typescript
import { createSeededRandom } from '@esengine/procgen';

const rng = createSeededRandom(42);
```

## 基础方法

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

## 分布方法

```typescript
// 正态分布（高斯分布）
rng.nextGaussian();          // 均值 0, 标准差 1
rng.nextGaussian(100, 15);   // 均值 100, 标准差 15

// 指数分布
rng.nextExponential();       // λ = 1
rng.nextExponential(0.5);    // λ = 0.5
```

## 几何方法

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

## 确定性保证

相同种子总是产生相同序列：

```typescript
const rng1 = createSeededRandom(12345);
const rng2 = createSeededRandom(12345);

// 这两个序列完全相同
console.log(rng1.next()); // 0.xxx
console.log(rng2.next()); // 0.xxx (相同)

console.log(rng1.nextInt(1, 100)); // N
console.log(rng2.nextInt(1, 100)); // N (相同)
```

## 保存和恢复状态

```typescript
// 保存种子以便重现
const seed = Date.now();
const rng = createSeededRandom(seed);
saveSeed(seed);

// 之后可以使用相同种子重现
const savedSeed = loadSeed();
const rng2 = createSeededRandom(savedSeed);
// 将产生相同序列
```

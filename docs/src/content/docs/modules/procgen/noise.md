---
title: "噪声函数"
description: "Perlin、Simplex、Worley 和 FBM"
---

## Perlin 噪声

经典的梯度噪声，输出范围 [-1, 1]：

```typescript
import { createPerlinNoise } from '@esengine/procgen';

const perlin = createPerlinNoise(seed);

// 2D 噪声
const value2D = perlin.noise2D(x, y);

// 3D 噪声
const value3D = perlin.noise3D(x, y, z);
```

## Simplex 噪声

比 Perlin 更快、更少方向性偏差：

```typescript
import { createSimplexNoise } from '@esengine/procgen';

const simplex = createSimplexNoise(seed);

const value = simplex.noise2D(x, y);
```

## Worley 噪声

基于细胞的噪声，适合生成石头、细胞等纹理：

```typescript
import { createWorleyNoise } from '@esengine/procgen';

const worley = createWorleyNoise(seed);

// 返回到最近点的距离
const distance = worley.noise2D(x, y);
```

## FBM (分形布朗运动)

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

## FBM 参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `octaves` | 层数，越多细节越丰富 | 4-8 |
| `lacunarity` | 频率倍增因子 | 2.0 |
| `persistence` | 振幅衰减因子 | 0.5 |
| `frequency` | 初始频率 | 0.01-0.1 |
| `amplitude` | 初始振幅 | 1.0 |

## 选择合适的噪声函数

| 噪声类型 | 适用场景 |
|----------|----------|
| Perlin | 平滑过渡的地形、云彩 |
| Simplex | 性能要求高的场景 |
| Worley | 细胞、石头、裂纹纹理 |
| FBM | 需要多层细节的自然效果 |
| Ridged FBM | 山脉、脊状地形 |
| Turbulence | 火焰、烟雾效果 |
| Billowed FBM | 云朵、软膨胀效果 |

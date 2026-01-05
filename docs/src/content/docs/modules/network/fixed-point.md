---
title: "定点数"
description: "用于帧同步的确定性定点数数学库"
---

`@esengine/ecs-framework-math` 提供确定性定点数计算，专为**帧同步 (Lockstep)** 设计。定点数在所有平台上保证产生完全相同的计算结果。

## 为什么需要定点数？

浮点数在不同平台上可能产生不同的舍入结果：

```typescript
// 浮点数：不同平台可能得到不同结果
const a = 0.1 + 0.2;  // 0.30000000000000004 (某些平台)
                      // 0.3 (其他平台)

// 定点数：所有平台结果一致
const x = Fixed32.from(0.1);
const y = Fixed32.from(0.2);
const z = x.add(y);   // raw = 19661 (所有平台)
```

| 特性 | 浮点数 | 定点数 |
|------|--------|--------|
| 跨平台一致性 | ❌ 可能不同 | ✅ 完全一致 |
| 网络同步模式 | 状态同步 | 帧同步 (Lockstep) |
| 适用游戏类型 | FPS、RPG | RTS、MOBA、格斗 |

## 安装

```bash
npm install @esengine/ecs-framework-math
```

## Fixed32 定点数

Q16.16 格式：16 位整数 + 16 位小数，范围 ±32767.99998。

### 创建定点数

```typescript
import { Fixed32 } from '@esengine/ecs-framework-math';

// 从浮点数创建
const speed = Fixed32.from(5.5);

// 从整数创建（无精度损失）
const count = Fixed32.fromInt(10);

// 从原始值创建（网络接收后使用）
const received = Fixed32.fromRaw(360448);  // 等于 5.5

// 预定义常量
Fixed32.ZERO        // 0
Fixed32.ONE         // 1
Fixed32.HALF        // 0.5
Fixed32.PI          // π
Fixed32.TWO_PI      // 2π
Fixed32.HALF_PI     // π/2
```

### 基本运算

```typescript
const a = Fixed32.from(10);
const b = Fixed32.from(3);

const sum = a.add(b);       // 13
const diff = a.sub(b);      // 7
const prod = a.mul(b);      // 30
const quot = a.div(b);      // 3.333...
const mod = a.mod(b);       // 1
const neg = a.neg();        // -10
const abs = neg.abs();      // 10
```

### 比较运算

```typescript
const x = Fixed32.from(5);
const y = Fixed32.from(3);

x.eq(y)     // false - 等于
x.ne(y)     // true  - 不等于
x.lt(y)     // false - 小于
x.le(y)     // false - 小于等于
x.gt(y)     // true  - 大于
x.ge(y)     // true  - 大于等于

x.isZero()      // false
x.isPositive()  // true
x.isNegative()  // false
```

### 数学函数

```typescript
// 平方根（牛顿迭代法，确定性）
const sqrt = Fixed32.sqrt(Fixed32.from(16));  // 4

// 取整
Fixed32.floor(Fixed32.from(3.7))   // 3
Fixed32.ceil(Fixed32.from(3.2))    // 4
Fixed32.round(Fixed32.from(3.5))   // 4

// 范围限制
Fixed32.clamp(value, min, max)

// 线性插值
Fixed32.lerp(from, to, t)

// 最大/最小值
Fixed32.min(a, b)
Fixed32.max(a, b)
```

### 类型转换

```typescript
const value = Fixed32.from(3.14159);

// 转为浮点数（用于渲染）
const float = value.toNumber();  // 3.14159

// 获取原始值（用于网络传输）
const raw = value.toRaw();  // 205887

// 转为整数（向下取整）
const int = value.toInt();  // 3
```

## FixedVector2 定点数向量

不可变的 2D 向量类，所有运算返回新实例。

### 创建向量

```typescript
import { FixedVector2, Fixed32 } from '@esengine/ecs-framework-math';

// 从浮点数创建
const pos = FixedVector2.from(100, 200);

// 从原始值创建（网络接收后使用）
const received = FixedVector2.fromRaw(6553600, 13107200);

// 从 Fixed32 创建
const vec = new FixedVector2(Fixed32.from(10), Fixed32.from(20));

// 预定义常量
FixedVector2.ZERO   // (0, 0)
FixedVector2.ONE    // (1, 1)
FixedVector2.RIGHT  // (1, 0)
FixedVector2.LEFT   // (-1, 0)
FixedVector2.UP     // (0, 1)
FixedVector2.DOWN   // (0, -1)
```

### 向量运算

```typescript
const a = FixedVector2.from(3, 4);
const b = FixedVector2.from(1, 2);

// 基本运算
const sum = a.add(b);                    // (4, 6)
const diff = a.sub(b);                   // (2, 2)
const scaled = a.mul(Fixed32.from(2));   // (6, 8)
const divided = a.div(Fixed32.from(2));  // (1.5, 2)

// 向量积
const dot = a.dot(b);    // 3*1 + 4*2 = 11
const cross = a.cross(b); // 3*2 - 4*1 = 2

// 长度
const lenSq = a.lengthSquared();  // 25
const len = a.length();           // 5

// 归一化
const norm = a.normalize();  // (0.6, 0.8)

// 距离
const dist = a.distanceTo(b);  // sqrt((3-1)² + (4-2)²)
```

### 旋转和角度

```typescript
import { FixedMath } from '@esengine/ecs-framework-math';

const vec = FixedVector2.from(1, 0);
const angle = Fixed32.from(Math.PI / 2);  // 90度

// 旋转向量
const rotated = vec.rotate(angle);  // (0, 1)

// 围绕点旋转
const center = FixedVector2.from(5, 5);
const around = vec.rotateAround(center, angle);

// 获取向量角度
const vecAngle = vec.angle();

// 两向量夹角
const between = vec.angleTo(other);

// 从角度创建单位向量
const dir = FixedVector2.fromAngle(angle);

// 从极坐标创建
const polar = FixedVector2.fromPolar(length, angle);
```

### 类型转换

```typescript
const pos = FixedVector2.from(100.5, 200.5);

// 转为浮点对象（用于渲染）
const obj = pos.toObject();  // { x: 100.5, y: 200.5 }

// 转为数组
const arr = pos.toArray();  // [100.5, 200.5]

// 获取原始值（用于网络传输）
const raw = pos.toRawObject();  // { x: 6586368, y: 13140992 }
```

## FixedMath 三角函数

使用查找表实现确定性三角函数。

```typescript
import { FixedMath, Fixed32 } from '@esengine/ecs-framework-math';

const angle = Fixed32.from(Math.PI / 6);  // 30度

// 三角函数
const sin = FixedMath.sin(angle);  // 0.5
const cos = FixedMath.cos(angle);  // 0.866
const tan = FixedMath.tan(angle);  // 0.577

// 反三角函数
const atan = FixedMath.atan2(y, x);
const asin = FixedMath.asin(value);
const acos = FixedMath.acos(value);

// 角度规范化到 [-π, π]
const normalized = FixedMath.normalizeAngle(angle);

// 角度差（最短路径）
const delta = FixedMath.angleDelta(from, to);

// 角度插值（处理 360° 环绕）
const lerped = FixedMath.lerpAngle(from, to, t);

// 弧度/角度转换
const deg = FixedMath.radToDeg(rad);
const rad = FixedMath.degToRad(deg);
```

## 最佳实践

### 1. 全程使用定点数计算

```typescript
// ✅ 正确：所有游戏逻辑使用定点数
function calculateDamage(baseDamage: Fixed32, multiplier: Fixed32): Fixed32 {
    return baseDamage.mul(multiplier);
}

// ❌ 错误：混用浮点数
function calculateDamage(baseDamage: number, multiplier: number): number {
    return baseDamage * multiplier;  // 可能不一致
}
```

### 2. 只在渲染时转换为浮点数

```typescript
// 游戏逻辑层
const position: FixedVector2 = calculatePosition(input);

// 渲染层
const { x, y } = position.toObject();
sprite.position.set(x, y);
```

### 3. 使用原始值进行网络传输

```typescript
// ✅ 正确：传输整数原始值
const raw = position.toRawObject();
send(JSON.stringify(raw));

// ❌ 错误：传输浮点数
const float = position.toObject();
send(JSON.stringify(float));  // 可能丢失精度
```

### 4. 使用 FixedMath 进行三角运算

```typescript
// ✅ 正确：使用查找表
const direction = FixedVector2.fromAngle(FixedMath.atan2(dy, dx));

// ❌ 错误：使用 Math 库
const angle = Math.atan2(dy.toNumber(), dx.toNumber());  // 不确定
```

## API 导出

```typescript
import {
    Fixed32,
    FixedVector2,
    FixedMath,
    type IFixed32,
    type IFixedVector2
} from '@esengine/ecs-framework-math';
```

## 相关文档

- [状态同步](/modules/network/sync) - 定点数快照缓冲区
- [客户端预测](/modules/network/prediction) - 定点数客户端预测

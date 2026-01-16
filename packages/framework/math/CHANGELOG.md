# @esengine/ecs-framework-math

## 2.11.0

### Minor Changes

- [#460](https://github.com/esengine/esengine/pull/460) [`190924d`](https://github.com/esengine/esengine/commit/190924d2ad81df3d2b621ff70df8ba91ea2736c1) Thanks [@esengine](https://github.com/esengine)! - feat(math): add Polygon utility class and Vector2 static methods

    ### New Features
    - **Polygon Class**: New utility class for polygon operations
        - `signedArea()` - Calculate signed area (positive for CCW)
        - `isCCW()` - Check if vertices are counter-clockwise
        - `ensureCCW()` - Ensure CCW ordering (required for ORCA obstacles)
        - `containsPoint()` - Point-in-polygon test
        - `isConvex()` - Check if polygon is convex
        - `centroid()` - Calculate polygon centroid
        - `bounds()` - Get axis-aligned bounding box
        - `perimeter()` - Calculate perimeter length
    - **Vector2 Static Methods**: New methods for vector calculations
        - `Vector2.det(a, b)` - Determinant (2D cross product)
        - `Vector2.lengthSq(v)` - Squared length
        - `Vector2.len(v)` - Vector length
        - `Vector2.normalize(v)` - Normalize vector
        - `Vector2.distanceSq(a, b)` - Squared distance between points
        - `Vector2.perpLeft(v)` - Left perpendicular vector
        - `Vector2.perpRight(v)` - Right perpendicular vector

    ### Improvements
    - Changed Vector2 method parameter types from `Vector2` to `IVector2` for better flexibility

    ### Usage

    ```typescript
    import { Polygon, Vector2 } from '@esengine/ecs-framework-math';

    // Polygon operations
    const poly = new Polygon([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
    ]);

    if (!poly.isCCW()) {
        poly.ensureCCW(); // Required for ORCA obstacles
    }

    console.log(poly.isConvex()); // true
    console.log(poly.containsPoint(5, 5)); // true

    // Vector2 static methods
    const a = { x: 1, y: 0 };
    const b = { x: 0, y: 1 };
    console.log(Vector2.det(a, b)); // 1 (cross product)
    console.log(Vector2.len(a)); // 1
    ```

## 2.10.3

### Patch Changes

- [`32f3343`](https://github.com/esengine/esengine/commit/32f33432ad25ef987efb34bc18bf5b105b0a26ea) Thanks [@esengine](https://github.com/esengine)! - fix: remove publishConfig.directory to fix npm publish

## 2.10.2

### Patch Changes

- [#457](https://github.com/esengine/esengine/pull/457) [`3364107`](https://github.com/esengine/esengine/commit/33641075d1a96523d27bed59abf28c026ba34a90) Thanks [@esengine](https://github.com/esengine)! - fix(math): 修复 npm 包发布配置，入口从 bin 改为 dist
    - 修改 main/module/types 入口指向 dist 目录
    - 添加标准的 exports 字段配置
    - 移除 build-rollup.cjs 中生成 dist/package.json 的冗余逻辑
    - 与 @esengine/ecs-framework 包保持一致的发布配置

## 2.10.1

### Patch Changes

- Updated dependencies [[`4e66bd8`](https://github.com/esengine/esengine/commit/4e66bd8e2be80b366a7723dcc48b99df0457aed4)]:
    - @esengine/blueprint@4.5.0

## 2.10.0

### Minor Changes

- [#444](https://github.com/esengine/esengine/pull/444) [`fa593a3`](https://github.com/esengine/esengine/commit/fa593a3c69292207800750f8106f418465cb7c0f) Thanks [@esengine](https://github.com/esengine)! - feat(math): add blueprint nodes for math library
    - Add Vector2 blueprint nodes (Make, Break, Add, Sub, Mul, Length, Normalize, Dot, Cross, Distance, Lerp, Rotate, FromAngle)
    - Add Fixed32 blueprint nodes (FromFloat, FromInt, ToFloat, ToInt, arithmetic operations, Abs, Sqrt, Floor, Ceil, Round, Sign, Min, Max, Clamp, Lerp)
    - Add FixedVector2 blueprint nodes (Make, Break, Add, Sub, Mul, Negate, Length, Normalize, Dot, Cross, Distance, Lerp)
    - Add Color blueprint nodes (Make, Break, FromHex, ToHex, FromHSL, ToHSL, Lerp, Lighten, Darken, Saturate, Desaturate, Invert, Grayscale, Luminance, constants)
    - Add documentation for math blueprint nodes (Chinese and English)

## 2.9.0

### Minor Changes

- [#442](https://github.com/esengine/esengine/pull/442) [`bffe90b`](https://github.com/esengine/esengine/commit/bffe90b6a17563cc90709faf339b229dc3abd22d) Thanks [@esengine](https://github.com/esengine)! - feat(math): add blueprint nodes for math library
    - Add Vector2 blueprint nodes (Make, Break, Add, Sub, Mul, Length, Normalize, Dot, Cross, Distance, Lerp, Rotate, FromAngle)
    - Add Fixed32 blueprint nodes (FromFloat, FromInt, ToFloat, ToInt, arithmetic operations, Abs, Sqrt, Floor, Ceil, Round, Sign, Min, Max, Clamp, Lerp)
    - Add FixedVector2 blueprint nodes (Make, Break, Add, Sub, Mul, Negate, Length, Normalize, Dot, Cross, Distance, Lerp)
    - Add Color blueprint nodes (Make, Break, FromHex, ToHex, FromHSL, ToHSL, Lerp, Lighten, Darken, Saturate, Desaturate, Invert, Grayscale, Luminance, constants)
    - Add documentation for math blueprint nodes (Chinese and English)

## 2.8.0

### Minor Changes

- [#440](https://github.com/esengine/esengine/pull/440) [`30173f0`](https://github.com/esengine/esengine/commit/30173f076415c9770a429b236b8bab95a2fdc498) Thanks [@esengine](https://github.com/esengine)! - feat(math): 添加定点数数学库 | Add fixed-point math library

    **@esengine/ecs-framework-math** - 新增定点数支持 | Add fixed-point number support
    - 新增 `Fixed32` 类：Q16.16 定点数实现 | Add `Fixed32` class: Q16.16 fixed-point implementation
    - 新增 `FixedMath` 工具类：定点数数学运算 | Add `FixedMath` utility: fixed-point math operations
    - 新增 `FixedVector2` 类：定点数二维向量 | Add `FixedVector2` class: fixed-point 2D vector
    - 支持基本算术运算、三角函数、向量运算 | Support basic arithmetic, trigonometry, vector operations

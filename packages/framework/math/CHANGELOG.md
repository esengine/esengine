# @esengine/ecs-framework-math

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

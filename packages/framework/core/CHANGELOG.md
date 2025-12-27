# @esengine/ecs-framework

## 2.4.4

### Patch Changes

- [`7d74623`](https://github.com/esengine/esengine/commit/7d746237100084ac3456f1af92ff664db4e50cc8) Thanks [@esengine](https://github.com/esengine)! - fix(core): 修复 npm 发布目录配置，确保从 dist 目录发布以保持与 Cocos Creator 的兼容性

## 2.4.3

### Patch Changes

- [#356](https://github.com/esengine/esengine/pull/356) [`ce2db4e`](https://github.com/esengine/esengine/commit/ce2db4e48a7cdac44265420ef16e83f6424f4dea) Thanks [@esengine](https://github.com/esengine)! - fix(core): 修复 World cleanup 在打包环境下的兼容性问题
    - 使用 forEach 替代 spread + for...of 解构模式，避免某些打包工具（如 Cocos Creator）转换后的兼容性问题
    - 重构 World 和 WorldManager 类，提升代码质量
    - 提取默认配置为常量，统一双语注释格式

---
"@esengine/ecs-framework": patch
---

fix(core): 修复 World cleanup 在打包环境下的兼容性问题

- 使用 forEach 替代 spread + for...of 解构模式，避免某些打包工具（如 Cocos Creator）转换后的兼容性问题
- 重构 World 和 WorldManager 类，提升代码质量
- 提取默认配置为常量，统一双语注释格式

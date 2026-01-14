---
"@esengine/ecs-framework-math": patch
---

fix(math): 修复 npm 包发布配置，入口从 bin 改为 dist

- 修改 main/module/types 入口指向 dist 目录
- 添加标准的 exports 字段配置
- 移除 build-rollup.cjs 中生成 dist/package.json 的冗余逻辑
- 与 @esengine/ecs-framework 包保持一致的发布配置

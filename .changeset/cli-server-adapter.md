---
"@esengine/cli": minor
"@esengine/network-server": patch
---

feat(cli): 增强 Node.js 服务端适配器

**@esengine/cli:**
- 添加 @esengine/network-server 依赖支持
- 生成完整的 ECS 游戏服务器项目结构
- 组件使用 @ECSComponent 装饰器注册
- tsconfig 启用 experimentalDecorators

**@esengine/network-server:**
- 支持 ESM/CJS 双格式导出
- 添加 ws@8.18.0 解决 Node.js 24 兼容性问题

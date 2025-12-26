---
"@esengine/cli": minor
---

feat(cli): 添加 CLI 工具用于将 ECS 框架集成到现有项目

- 支持 Cocos Creator 2.x/3.x、LayaAir 3.x、Node.js 平台
- 自动检测项目类型
- 生成完整配置的 ECSManager（调试模式、远程调试、WebSocket URL）
- 自动安装依赖（支持 npm/yarn/pnpm）
- 针对不同平台生成正确的装饰器和生命周期方法

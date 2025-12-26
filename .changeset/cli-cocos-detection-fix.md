---
"@esengine/cli": patch
---

fix(cli): 修复 Cocos Creator 3.x 项目检测逻辑

- 优先检查 package.json 中的 creator.version 字段
- 添加 .creator 和 settings 目录检测
- 重构检测代码，提取通用辅助函数

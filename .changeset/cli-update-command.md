---
"@esengine/cli": minor
---

feat(cli): 添加 update 命令用于更新 ESEngine 包

- 新增 `esengine update` 命令检查并更新 @esengine/* 包到最新版本
- 支持 `--check` 参数仅检查可用更新而不安装
- 支持 `--yes` 参数跳过确认提示
- 显示包更新状态，对比当前版本与最新版本
- 更新时保留版本前缀（^ 或 ~）

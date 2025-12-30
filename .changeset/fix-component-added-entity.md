---
"@esengine/ecs-framework": patch
---

fix(ecs): COMPONENT_ADDED 事件添加 entity 字段

修复 `ECSEventType.COMPONENT_ADDED` 事件缺少 `entity` 字段的问题，导致 ECSRoom 的 `@NetworkEntity` 自动广播功能报错。

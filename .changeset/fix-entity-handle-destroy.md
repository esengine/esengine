---
"@esengine/ecs-framework": patch
---

fix: Entity.destroy() now properly releases entity handle

- After entity destruction, `handleManager.isAlive(handle)` correctly returns `false`
- `findEntityByHandle(handle)` correctly returns `null` after entity destruction

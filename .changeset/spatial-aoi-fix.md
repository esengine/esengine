---
"@esengine/spatial": patch
---

fix(spatial): 修复 GridAOI 可见性更新问题

- 修复 `addObserver` 时现有观察者无法检测到新实体的问题
- 修复实体远距离移动时观察者可见性未正确更新的问题

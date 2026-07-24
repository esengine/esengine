---
"@esengine/blueprint": minor
---

Support running blueprints on plain components without ECS.

- Add `BlueprintRunner` to drive a blueprint from any host (e.g. a Cocos `cc.Component`) — no Scene, entity, or `BlueprintSystem` required.
- Component method/property/call nodes now default their `component` target to the bound `ExecutionContext.self` when the pin is unconnected (Unreal-style "Target: Self").
- `Get_<Component>` falls back to the bound `self` when there is no ECS entity.
- Add pull-based evaluation of pure data nodes so `Get` / property / math node outputs feed downstream consumers.
- `ExecutionContext.entity` / `scene` are now nullable; built-in ECS nodes degrade gracefully when they are absent.

---
"@esengine/world-streaming": minor
---

refactor: move to framework folder and remove engine-core dependency

- Move from packages/streaming to packages/framework
- Replace TransformComponent with IPositionable interface from @esengine/spatial
- StreamingAnchorComponent now implements IPositionable with x/y properties
- Remove IRuntimeModule dependency, use standalone helper class
- Add IWorldStreamingSetupOptions for configuration

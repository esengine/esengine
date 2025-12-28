---
"@esengine/server": patch
---

fix: expose `id` property on ServerConnection type

TypeScript was not properly resolving the inherited `id` property from the base `Connection` interface in some module resolution scenarios. This fix explicitly declares the `id` property on `ServerConnection` to ensure it's always visible to consumers.

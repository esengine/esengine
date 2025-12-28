---
"@esengine/server": patch
---

fix: allow define() to be called before start()

Previously, calling `server.define()` before `server.start()` would throw an error because `roomManager` was initialized inside `start()`. This fix moves the `roomManager` initialization to `createServer()`, allowing the expected usage pattern:

```typescript
const server = await createServer({ port: 3000 })
server.define('world', WorldRoom)  // Now works correctly
await server.start()
```

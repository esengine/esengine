---
"@esengine/pathfinding": minor
---

feat(pathfinding): add standalone avoidance subpath export

Added `@esengine/pathfinding/avoidance` export path for direct access to ORCA local avoidance module without importing the full pathfinding package.

```typescript
// New import path
import { createORCASolver, createKDTree } from '@esengine/pathfinding/avoidance';
```

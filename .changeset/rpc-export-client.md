---
"@esengine/rpc": patch
---

feat: export RpcClient and connect from main entry point

Re-export `RpcClient`, `connect`, and related types from the main entry point for better compatibility with bundlers (Cocos Creator, Vite, etc.) that may have issues with subpath exports.

```typescript
// Now works in all environments:
import { rpc, RpcClient, connect } from '@esengine/rpc';

// Subpath import still supported:
import { RpcClient } from '@esengine/rpc/client';
```

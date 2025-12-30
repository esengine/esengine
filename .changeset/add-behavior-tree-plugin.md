---
"@esengine/behavior-tree": minor
---

feat(behavior-tree): add pure BehaviorTreePlugin class for Cocos/Laya integration

- Added `BehaviorTreePlugin` class that only depends on `@esengine/ecs-framework`
- Implements `IPlugin` interface with `install()`, `uninstall()`, and `setupScene()` methods
- Removed `esengine/` subdirectory that incorrectly depended on `@esengine/engine-core`
- Updated package documentation with correct usage examples

Usage:
```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import { BehaviorTreePlugin, BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';

Core.create();
const plugin = new BehaviorTreePlugin();
await Core.installPlugin(plugin);

const scene = new Scene();
plugin.setupScene(scene);
Core.setScene(scene);
```

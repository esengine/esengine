---
"@esengine/ecs-framework": minor
---

feat(ecs): 添加运行时环境区分机制 | add runtime environment detection

新增功能：
- `Core` 新增静态属性 `runtimeEnvironment`，支持 `'server' | 'client' | 'standalone'`
- `Core` 新增 `isServer` / `isClient` 静态只读属性
- `ICoreConfig` 新增 `runtimeEnvironment` 配置项
- `Scene` 新增 `isServer` / `isClient` 只读属性（默认从 Core 继承，可通过 config 覆盖）
- 新增 `@ServerOnly()` / `@ClientOnly()` / `@NotServer()` / `@NotClient()` 方法装饰器

用于网络游戏中区分服务端权威逻辑和客户端逻辑：

```typescript
// 方式1: 全局设置（推荐）
Core.create({ runtimeEnvironment: 'server' });
// 或直接设置静态属性
Core.runtimeEnvironment = 'server';

// 所有场景自动继承
const scene = new Scene();
console.log(scene.isServer); // true

// 方式2: 单个场景覆盖（可选）
const clientScene = new Scene({ runtimeEnvironment: 'client' });

// 在系统中检查环境
class CollectibleSpawnSystem extends EntitySystem {
    private checkCollections(): void {
        if (!this.scene.isServer) return; // 客户端跳过
        // ... 服务端权威逻辑
    }
}
```

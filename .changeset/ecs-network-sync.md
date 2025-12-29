---
"@esengine/ecs-framework": minor
"@esengine/network": minor
"@esengine/server": minor
---

feat: ECS 网络状态同步系统

## @esengine/ecs-framework

新增 `@sync` 装饰器和二进制编解码器，支持基于 Component 的网络状态同步：

```typescript
import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

@ECSComponent('Player')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;
}
```

### 新增导出

- `sync` - 标记需要同步的字段装饰器
- `SyncType` - 支持的同步类型
- `SyncOperation` - 同步操作类型（FULL/DELTA/SPAWN/DESPAWN）
- `encodeSnapshot` / `decodeSnapshot` - 批量编解码
- `encodeSpawn` / `decodeSpawn` - 实体生成编解码
- `encodeDespawn` / `processDespawn` - 实体销毁编解码
- `ChangeTracker` - 字段级变更追踪
- `initChangeTracker` / `clearChanges` / `hasChanges` - 变更追踪工具函数

### 内部方法标记

将以下方法标记为 `@internal`，用户应通过 `Core.update()` 驱动更新：
- `Scene.update()`
- `SceneManager.update()`
- `WorldManager.updateAll()`

## @esengine/network

新增 `ComponentSyncSystem`，基于 `@sync` 装饰器自动同步组件状态：

```typescript
import { ComponentSyncSystem } from '@esengine/network';

// 服务端：编码状态
const data = syncSystem.encodeAllEntities(false);

// 客户端：解码状态
syncSystem.applySnapshot(data);
```

### 修复

- 将 `@esengine/ecs-framework` 从 devDependencies 移到 peerDependencies

## @esengine/server

新增 `ECSRoom`，带有 ECS World 支持的房间基类：

```typescript
import { ECSRoom } from '@esengine/server/ecs';

// 服务端启动
Core.create();
setInterval(() => Core.update(1/60), 16);

// 定义房间
class GameRoom extends ECSRoom {
    onCreate() {
        this.addSystem(new PhysicsSystem());
    }

    onJoin(player: Player) {
        const entity = this.createPlayerEntity(player.id);
        entity.addComponent(new PlayerComponent());
    }
}
```

### 设计

- 每个 `ECSRoom` 在 `Core.worldManager` 中创建独立的 World
- `Core.update()` 统一更新 Time 和所有 World
- `onTick()` 只处理状态同步逻辑

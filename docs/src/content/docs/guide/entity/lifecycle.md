---
title: "生命周期"
description: "实体的生命周期管理、销毁和持久化"
---

实体的生命周期包括创建、运行和销毁三个阶段。本节介绍如何正确管理实体的生命周期。

## 销毁实体

### 基本销毁

```typescript
// 销毁实体
player.destroy();

// 检查实体是否已销毁
if (player.isDestroyed) {
    console.log("实体已被销毁");
}
```

销毁实体时会：
1. 移除所有组件（触发 `onRemovedFromEntity` 回调）
2. 从查询系统中移除
3. 从场景实体列表中移除
4. 清理所有引用追踪

### 条件销毁

```typescript
// 常见模式：生命值耗尽时销毁
const health = enemy.getComponent(Health);
if (health && health.current <= 0) {
    enemy.destroy();
}
```

### 销毁保护

销毁操作是幂等的，多次调用不会出错：

```typescript
player.destroy();
player.destroy();  // 安全，不会报错
```

## 持久化实体

默认情况下，实体在场景切换时会被销毁。使用持久化可以让实体跨场景存活。

### 设置持久化

```typescript
// 方式一：链式调用
const player = scene.createEntity('Player')
    .setPersistent()
    .createComponent(PlayerComponent);

// 方式二：单独设置
player.setPersistent();

// 检查是否持久化
if (player.isPersistent) {
    console.log("这是持久化实体");
}
```

### 取消持久化

```typescript
// 恢复为场景本地实体
player.setSceneLocal();
```

### 生命周期策略

实体有两种生命周期策略：

| 策略 | 说明 |
|-----|------|
| `SceneLocal` | 默认，随场景销毁 |
| `Persistent` | 跨场景保留 |

```typescript
import { EEntityLifecyclePolicy } from '@esengine/ecs-framework';

// 获取当前策略
const policy = entity.lifecyclePolicy;

if (policy === EEntityLifecyclePolicy.Persistent) {
    // 持久化实体
}
```

### 使用场景

持久化实体适用于：
- 玩家角色
- 全局管理器
- UI 实体
- 需要跨场景保留的游戏状态

```typescript
// 玩家角色
const player = scene.createEntity('Player')
    .setPersistent();

// 游戏管理器
const gameManager = scene.createEntity('GameManager')
    .setPersistent()
    .createComponent(GameStateComponent);

// 分数管理
const scoreManager = scene.createEntity('ScoreManager')
    .setPersistent()
    .createComponent(ScoreComponent);
```

## 场景切换时的行为

```typescript
// 场景管理器切换场景
sceneManager.loadScene('Level2');

// 切换时：
// 1. SceneLocal 实体被销毁
// 2. Persistent 实体被迁移到新场景
// 3. 新场景的实体被创建
```

:::caution[注意]
持久化实体在场景切换时会自动迁移到新场景，但其引用的其他非持久化实体可能已被销毁。使用 [EntityHandle](/guide/entity/entity-handle/) 来安全地处理这种情况。
:::

## 实体引用清理

框架提供了引用追踪系统，在实体销毁时自动清理引用：

```typescript
// 引用追踪会在实体销毁时清理指向该实体的所有引用
scene.referenceTracker?.clearReferencesTo(entity.id);
```

配合 `@entityRef` 装饰器使用可以自动处理：

```typescript
class FollowComponent extends Component {
    @entityRef()
    targetId: number | null = null;
}

// 当 target 被销毁时，targetId 会自动设为 null
```

详见 [组件引用](/guide/component/entity-ref/)。

## 最佳实践

### 1. 及时销毁不需要的实体

```typescript
// 子弹飞出屏幕后销毁
if (position.x < 0 || position.x > screenWidth) {
    bullet.destroy();
}
```

### 2. 使用对象池代替频繁创建销毁

```typescript
class BulletPool {
    private pool: Entity[] = [];

    acquire(scene: Scene): Entity {
        if (this.pool.length > 0) {
            const bullet = this.pool.pop()!;
            bullet.enabled = true;
            return bullet;
        }
        return scene.createEntity('Bullet');
    }

    release(bullet: Entity) {
        bullet.enabled = false;
        this.pool.push(bullet);
    }
}
```

### 3. 谨慎使用持久化

只对真正需要跨场景的实体使用持久化，过多的持久化实体会增加内存占用。

### 4. 销毁前清理引用

```typescript
// 销毁前通知相关系统
const aiSystem = scene.getSystem(AISystem);
aiSystem?.clearTarget(enemy.id);

enemy.destroy();
```

## 生命周期事件

可以监听实体销毁事件：

```typescript
// 方式一：通过事件系统
scene.eventSystem.on('entity:destroyed', (data) => {
    console.log(`实体 ${data.entityName} 已销毁`);
});

// 方式二：在组件中监听
class MyComponent extends Component {
    onRemovedFromEntity() {
        console.log('组件被移除，实体可能正在销毁');
        // 清理资源
    }
}
```

## 调试

```typescript
// 获取实体状态
const debugInfo = entity.getDebugInfo();
console.log({
    destroyed: debugInfo.destroyed,
    enabled: debugInfo.enabled,
    active: debugInfo.active
});
```

## 下一步

- [组件操作](/guide/entity/component-operations/) - 组件的添加和移除
- [场景管理](/guide/scene/) - 场景切换和管理

---
title: "编译查询"
description: "CompiledQuery 类型安全查询工具"
---

> **v2.4.0+**

CompiledQuery 是一个轻量级的查询工具，提供类型安全的组件访问和变更检测支持。适合临时查询、工具开发和简单的迭代场景。

## 基本用法

```typescript
// 创建编译查询
const query = scene.querySystem.compile(Position, Velocity);

// 类型安全的遍历 - 组件参数自动推断类型
query.forEach((entity, pos, vel) => {
    pos.x += vel.vx * deltaTime;
    pos.y += vel.vy * deltaTime;
});

// 获取实体数量
console.log(`匹配实体数: ${query.count}`);

// 获取第一个匹配的实体
const first = query.first();
if (first) {
    const [entity, pos, vel] = first;
    console.log(`第一个实体: ${entity.name}`);
}
```

## 变更检测

CompiledQuery 支持基于 epoch 的变更检测：

```typescript
class RenderSystem extends EntitySystem {
    private _query: CompiledQuery<[typeof Transform, typeof Sprite]>;
    private _lastEpoch = 0;

    protected onInitialize(): void {
        this._query = this.scene!.querySystem.compile(Transform, Sprite);
    }

    protected process(entities: readonly Entity[]): void {
        // 只处理 Transform 或 Sprite 发生变化的实体
        this._query.forEachChanged(this._lastEpoch, (entity, transform, sprite) => {
            this.updateRenderData(entity, transform, sprite);
        });

        // 保存当前 epoch 作为下次检查的起点
        this._lastEpoch = this.scene!.epochManager.current;
    }

    private updateRenderData(entity: Entity, transform: Transform, sprite: Sprite): void {
        // 更新渲染数据
    }
}
```

## 函数式 API

CompiledQuery 提供了丰富的函数式 API：

```typescript
const query = scene.querySystem.compile(Position, Health);

// map - 转换实体数据
const positions = query.map((entity, pos, health) => ({
    x: pos.x,
    y: pos.y,
    healthPercent: health.current / health.max
}));

// filter - 过滤实体
const lowHealthEntities = query.filter((entity, pos, health) => {
    return health.current < health.max * 0.2;
});

// find - 查找第一个匹配的实体
const target = query.find((entity, pos, health) => {
    return health.current > 0 && pos.x > 100;
});

// toArray - 转换为数组
const allData = query.toArray();
for (const [entity, pos, health] of allData) {
    console.log(`${entity.name}: ${pos.x}, ${pos.y}`);
}

// any/empty - 检查是否有匹配
if (query.any()) {
    console.log('有匹配的实体');
}
if (query.empty()) {
    console.log('没有匹配的实体');
}
```

## CompiledQuery vs EntitySystem

| 特性 | CompiledQuery | EntitySystem |
|------|---------------|--------------|
| **用途** | 轻量级查询工具 | 完整的系统逻辑 |
| **生命周期** | 无 | 完整 (onInitialize, onDestroy 等) |
| **调度集成** | 无 | 支持 @Stage, @Before, @After |
| **变更检测** | forEachChanged | forEachChanged |
| **事件监听** | 无 | addEventListener |
| **命令缓冲** | 无 | this.commands |
| **类型安全组件** | forEach 参数自动推断 | 需要手动 getComponent |
| **适用场景** | 临时查询、工具、原型 | 核心游戏逻辑 |

**选择建议**：

- 使用 **EntitySystem** 处理核心游戏逻辑（移动、战斗、AI 等）
- 使用 **CompiledQuery** 进行一次性查询、工具开发或简单迭代

## API 参考

| 方法 | 说明 |
|------|------|
| `forEach(callback)` | 遍历所有匹配实体，类型安全的组件参数 |
| `forEachChanged(sinceEpoch, callback)` | 只遍历变更的实体 |
| `first()` | 获取第一个匹配的实体和组件 |
| `toArray()` | 转换为 [entity, ...components] 数组 |
| `map(callback)` | 映射转换 |
| `filter(predicate)` | 过滤实体 |
| `find(predicate)` | 查找第一个满足条件的实体 |
| `any()` | 是否有任何匹配 |
| `empty()` | 是否没有匹配 |
| `count` | 匹配的实体数量 |
| `entities` | 匹配的实体列表（只读） |

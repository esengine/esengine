---
title: "增量序列化"
description: "只序列化场景的变更部分"
---

增量序列化只保存场景的变更部分，适用于网络同步、撤销/重做、时间回溯等需要频繁保存状态的场景。

## 基础用法

### 1. 创建基础快照

```typescript
// 在需要开始记录变更前创建基础快照
scene.createIncrementalSnapshot();
```

### 2. 修改场景

```typescript
// 添加实体
const enemy = scene.createEntity('Enemy');
enemy.addComponent(new PositionComponent(100, 200));
enemy.addComponent(new HealthComponent(50));

// 修改组件
const player = scene.findEntity('Player');
const pos = player.getComponent(PositionComponent);
pos.x = 300;
pos.y = 400;

// 删除组件
player.removeComponentByType(BuffComponent);

// 删除实体
const oldEntity = scene.findEntity('ToDelete');
oldEntity.destroy();

// 修改场景数据
scene.sceneData.set('score', 1000);
```

### 3. 获取增量变更

```typescript
// 获取相对于基础快照的所有变更
const incremental = scene.serializeIncremental();

// 查看变更统计
const stats = IncrementalSerializer.getIncrementalStats(incremental);
console.log('总变更数:', stats.totalChanges);
console.log('新增实体:', stats.addedEntities);
console.log('删除实体:', stats.removedEntities);
console.log('新增组件:', stats.addedComponents);
console.log('更新组件:', stats.updatedComponents);
```

### 4. 序列化增量数据

```typescript
// JSON格式（默认）
const jsonData = IncrementalSerializer.serializeIncremental(incremental, {
  format: 'json'
});

// 二进制格式（更小的体积，更高性能）
const binaryData = IncrementalSerializer.serializeIncremental(incremental, {
  format: 'binary'
});

// 美化JSON输出（便于调试）
const prettyJson = IncrementalSerializer.serializeIncremental(incremental, {
  format: 'json',
  pretty: true
});

// 发送或保存
socket.send(binaryData);  // 网络传输使用二进制
localStorage.setItem('changes', jsonData);  // 本地存储可用JSON
```

### 5. 应用增量变更

```typescript
// 在另一个场景应用变更
const otherScene = new Scene();

// 直接应用增量对象
otherScene.applyIncremental(incremental);

// 从JSON字符串应用
const jsonData = IncrementalSerializer.serializeIncremental(incremental, { format: 'json' });
otherScene.applyIncremental(jsonData);

// 从二进制Uint8Array应用
const binaryData = IncrementalSerializer.serializeIncremental(incremental, { format: 'binary' });
otherScene.applyIncremental(binaryData);
```

## 增量快照管理

### 更新快照基准

在应用增量变更后，可以更新快照基准：

```typescript
// 创建初始快照
scene.createIncrementalSnapshot();

// 第一次修改
entity.addComponent(new VelocityComponent(5, 0));
const incremental1 = scene.serializeIncremental();

// 更新基准（将当前状态设为新的基准）
scene.updateIncrementalSnapshot();

// 第二次修改（增量将基于更新后的基准）
entity.getComponent(VelocityComponent).dx = 10;
const incremental2 = scene.serializeIncremental();
```

### 清除快照

```typescript
// 释放快照占用的内存
scene.clearIncrementalSnapshot();

// 检查是否有快照
if (scene.hasIncrementalSnapshot()) {
  console.log('存在增量快照');
}
```

## 增量序列化选项

```typescript
interface IncrementalSerializationOptions {
  // 是否进行组件数据的深度对比
  // 默认true，设为false可提升性能但可能漏掉组件内部字段变更
  deepComponentComparison?: boolean;

  // 是否跟踪场景数据变更
  // 默认true
  trackSceneData?: boolean;

  // 是否压缩快照（使用JSON序列化）
  // 默认false
  compressSnapshot?: boolean;

  // 序列化格式
  // 'json': JSON格式（可读性好，方便调试）
  // 'binary': MessagePack二进制格式（体积小，性能高）
  // 默认 'json'
  format?: 'json' | 'binary';

  // 是否美化JSON输出（仅在format='json'时有效）
  // 默认false
  pretty?: boolean;
}

// 使用选项
scene.createIncrementalSnapshot({
  deepComponentComparison: true,
  trackSceneData: true
});
```

## 增量数据结构

增量快照包含以下变更类型：

```typescript
interface IncrementalSnapshot {
  version: number;           // 快照版本号
  timestamp: number;         // 时间戳
  sceneName: string;         // 场景名称
  baseVersion: number;       // 基础版本号
  entityChanges: EntityChange[];      // 实体变更
  componentChanges: ComponentChange[]; // 组件变更
  sceneDataChanges: SceneDataChange[]; // 场景数据变更
}

// 变更操作类型
enum ChangeOperation {
  EntityAdded = 'entity_added',
  EntityRemoved = 'entity_removed',
  EntityUpdated = 'entity_updated',
  ComponentAdded = 'component_added',
  ComponentRemoved = 'component_removed',
  ComponentUpdated = 'component_updated',
  SceneDataUpdated = 'scene_data_updated'
}
```

## 性能优化

### 对于高频同步

```typescript
// 关闭深度对比以提升性能
scene.createIncrementalSnapshot({
  deepComponentComparison: false  // 只检测组件的添加/删除
});
```

### 批量操作

```typescript
// 批量修改后再序列化
scene.entities.buffer.forEach(entity => {
  // 批量修改
});

// 一次性序列化所有变更
const incremental = scene.serializeIncremental();
```

## API 参考

| 方法 | 说明 |
|------|------|
| `scene.createIncrementalSnapshot(options?)` | 创建基础快照 |
| `scene.serializeIncremental()` | 获取增量变更 |
| `scene.applyIncremental(data)` | 应用增量变更 |
| `scene.updateIncrementalSnapshot()` | 更新快照基准 |
| `scene.clearIncrementalSnapshot()` | 清除快照 |
| `scene.hasIncrementalSnapshot()` | 检查是否有快照 |
| `IncrementalSerializer.getIncrementalStats(snapshot)` | 获取变更统计 |
| `IncrementalSerializer.serializeIncremental(snapshot, options)` | 序列化增量数据 |

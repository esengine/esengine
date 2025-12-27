---
title: "版本迁移"
description: "处理组件和场景数据结构变更"
---

当组件结构发生变化时，版本迁移系统可以自动升级旧版本的存档数据。

## 注册迁移函数

```typescript
import { VersionMigrationManager } from '@esengine/ecs-framework';

// 假设 PlayerComponent v1 有 hp 字段
// v2 改为 health 和 maxHealth 字段

// 注册从版本1到版本2的迁移
VersionMigrationManager.registerComponentMigration(
  'Player',
  1,  // 从版本
  2,  // 到版本
  (data) => {
    // 迁移逻辑
    const newData = {
      ...data,
      health: data.hp,
      maxHealth: data.hp,
    };
    delete newData.hp;
    return newData;
  }
);
```

## 使用迁移构建器

```typescript
import { MigrationBuilder } from '@esengine/ecs-framework';

new MigrationBuilder()
  .forComponent('Player')
  .fromVersionToVersion(2, 3)
  .migrate((data) => {
    // 从版本2迁移到版本3
    data.experience = data.exp || 0;
    delete data.exp;
    return data;
  });
```

## 场景级迁移

```typescript
// 注册场景级迁移
VersionMigrationManager.registerSceneMigration(
  1,  // 从版本
  2,  // 到版本
  (scene) => {
    // 迁移场景结构
    scene.metadata = {
      ...scene.metadata,
      migratedFrom: 1
    };
    return scene;
  }
);
```

## 检查迁移路径

```typescript
// 检查是否可以迁移
const canMigrate = VersionMigrationManager.canMigrateComponent(
  'Player',
  1,  // 从版本
  3   // 到版本
);

if (canMigrate) {
  // 可以安全迁移
  scene.deserialize(oldSaveData);
}

// 获取迁移路径
const path = VersionMigrationManager.getComponentMigrationPath('Player');
console.log('可用迁移版本:', path); // [1, 2, 3]
```

## 迁移链示例

当需要跨多个版本迁移时，系统会自动链式执行迁移：

```typescript
// 注册 v1 -> v2
VersionMigrationManager.registerComponentMigration('Player', 1, 2, (data) => {
  data.health = data.hp;
  delete data.hp;
  return data;
});

// 注册 v2 -> v3
VersionMigrationManager.registerComponentMigration('Player', 2, 3, (data) => {
  data.stats = { health: data.health, mana: 100 };
  delete data.health;
  return data;
});

// 当加载 v1 数据时，会自动执行 v1 -> v2 -> v3
```

## 最佳实践

### 1. 始终保持向后兼容

```typescript
// 记录每个版本的数据结构变更
// v1: { hp: number }
// v2: { health: number, maxHealth: number }
// v3: { stats: { health: number, mana: number } }
```

### 2. 测试迁移路径

```typescript
// 测试所有可能的迁移路径
const testData = { hp: 100 };
const migrated = VersionMigrationManager.migrateComponent('Player', testData, 1, 3);
expect(migrated.stats.health).toBe(100);
```

### 3. 保留原始数据备份

```typescript
// 在迁移前备份
const backup = JSON.parse(JSON.stringify(saveData));
try {
  scene.deserialize(saveData);
} catch (e) {
  // 迁移失败时恢复
  console.error('迁移失败:', e);
}
```

## API 参考

| 方法 | 说明 |
|------|------|
| `registerComponentMigration(type, from, to, fn)` | 注册组件迁移函数 |
| `registerSceneMigration(from, to, fn)` | 注册场景迁移函数 |
| `canMigrateComponent(type, from, to)` | 检查是否可以迁移 |
| `getComponentMigrationPath(type)` | 获取组件的迁移版本路径 |
| `migrateComponent(type, data, from, to)` | 执行组件数据迁移 |

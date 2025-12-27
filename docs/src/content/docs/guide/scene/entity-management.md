---
title: "实体管理"
description: "场景中的实体创建、查找和销毁"
---

场景提供了完整的实体管理 API，包括创建、查找和销毁实体。

## 创建实体

### 单个实体

```typescript
class EntityScene extends Scene {
  createGameEntities(): void {
    // 创建命名实体
    const player = this.createEntity("Player");
    player.addComponent(new Position(400, 300));
    player.addComponent(new Health(100));
  }
}
```

### 批量创建

```typescript
class EntityScene extends Scene {
  createBullets(): void {
    // 批量创建实体（高性能）
    const bullets = this.createEntities(100, "Bullet");

    // 为批量创建的实体添加组件
    bullets.forEach((bullet, index) => {
      bullet.addComponent(new Position(index * 10, 100));
      bullet.addComponent(new Velocity(Math.random() * 200 - 100, -300));
    });
  }
}
```

## 查找实体

### 按名称查找

```typescript
// 按名称查找（返回第一个匹配）
const player = this.findEntity("Player");
const player2 = this.getEntityByName("Player"); // 别名方法

if (player) {
  console.log(`找到玩家: ${player.name}`);
}
```

### 按 ID 查找

```typescript
// 按唯一 ID 查找
const entity = this.findEntityById(123);

if (entity) {
  console.log(`找到实体: ${entity.id}`);
}
```

### 按标签查找

```typescript
// 按标签查找（返回数组）
const enemies = this.findEntitiesByTag(2);
const enemies2 = this.getEntitiesByTag(2); // 别名方法

console.log(`找到 ${enemies.length} 个敌人`);
```

## 销毁实体

### 销毁单个实体

```typescript
const enemy = this.findEntity("Enemy_1");
if (enemy) {
  enemy.destroy(); // 实体会自动从场景中移除
}
```

### 销毁所有实体

```typescript
// 销毁场景中所有实体
this.destroyAllEntities();
```

## 实体查询

Scene 提供了组件查询系统：

```typescript
class QueryScene extends Scene {
  protected initialize(): void {
    // 创建测试实体
    for (let i = 0; i < 10; i++) {
      const entity = this.createEntity(`Entity_${i}`);
      entity.addComponent(new Transform(i * 10, 0));
      entity.addComponent(new Velocity(1, 0));
    }
  }

  public queryEntities(): void {
    // 通过 QuerySystem 查询
    const entities = this.querySystem.query([Transform, Velocity]);
    console.log(`找到 ${entities.length} 个有 Transform 和 Velocity 的实体`);
  }
}
```

## API 参考

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `createEntity(name)` | `Entity` | 创建单个实体 |
| `createEntities(count, prefix)` | `Entity[]` | 批量创建实体 |
| `findEntity(name)` | `Entity \| undefined` | 按名称查找 |
| `findEntityById(id)` | `Entity \| undefined` | 按 ID 查找 |
| `findEntitiesByTag(tag)` | `Entity[]` | 按标签查找 |
| `destroyAllEntities()` | `void` | 销毁所有实体 |

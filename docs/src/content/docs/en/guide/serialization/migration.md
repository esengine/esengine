---
title: "Version Migration"
description: "Handle component and scene data structure changes"
---

When component structure changes, the version migration system can automatically upgrade old version save data.

## Register Migration Function

```typescript
import { VersionMigrationManager } from '@esengine/ecs-framework';

// Assume PlayerComponent v1 has hp field
// v2 changes to health and maxHealth fields

// Register migration from version 1 to version 2
VersionMigrationManager.registerComponentMigration(
  'Player',
  1,  // From version
  2,  // To version
  (data) => {
    // Migration logic
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

## Using Migration Builder

```typescript
import { MigrationBuilder } from '@esengine/ecs-framework';

new MigrationBuilder()
  .forComponent('Player')
  .fromVersionToVersion(2, 3)
  .migrate((data) => {
    // Migrate from version 2 to version 3
    data.experience = data.exp || 0;
    delete data.exp;
    return data;
  });
```

## Scene-Level Migration

```typescript
// Register scene-level migration
VersionMigrationManager.registerSceneMigration(
  1,  // From version
  2,  // To version
  (scene) => {
    // Migrate scene structure
    scene.metadata = {
      ...scene.metadata,
      migratedFrom: 1
    };
    return scene;
  }
);
```

## Check Migration Path

```typescript
// Check if migration is possible
const canMigrate = VersionMigrationManager.canMigrateComponent(
  'Player',
  1,  // From version
  3   // To version
);

if (canMigrate) {
  // Safe to migrate
  scene.deserialize(oldSaveData);
}

// Get migration path
const path = VersionMigrationManager.getComponentMigrationPath('Player');
console.log('Available migration versions:', path); // [1, 2, 3]
```

## Migration Chain Example

When migrating across multiple versions, the system automatically chains migrations:

```typescript
// Register v1 -> v2
VersionMigrationManager.registerComponentMigration('Player', 1, 2, (data) => {
  data.health = data.hp;
  delete data.hp;
  return data;
});

// Register v2 -> v3
VersionMigrationManager.registerComponentMigration('Player', 2, 3, (data) => {
  data.stats = { health: data.health, mana: 100 };
  delete data.health;
  return data;
});

// When loading v1 data, it will automatically execute v1 -> v2 -> v3
```

## Best Practices

### 1. Always Maintain Backward Compatibility

```typescript
// Document data structure changes for each version
// v1: { hp: number }
// v2: { health: number, maxHealth: number }
// v3: { stats: { health: number, mana: number } }
```

### 2. Test Migration Paths

```typescript
// Test all possible migration paths
const testData = { hp: 100 };
const migrated = VersionMigrationManager.migrateComponent('Player', testData, 1, 3);
expect(migrated.stats.health).toBe(100);
```

### 3. Keep Backup of Original Data

```typescript
// Backup before migration
const backup = JSON.parse(JSON.stringify(saveData));
try {
  scene.deserialize(saveData);
} catch (e) {
  // Restore on migration failure
  console.error('Migration failed:', e);
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `registerComponentMigration(type, from, to, fn)` | Register component migration function |
| `registerSceneMigration(from, to, fn)` | Register scene migration function |
| `canMigrateComponent(type, from, to)` | Check if migration is possible |
| `getComponentMigrationPath(type)` | Get component's migration version path |
| `migrateComponent(type, data, from, to)` | Execute component data migration |

---
title: "Configuration"
description: "Worker system configuration and processing modes"
---

## Configuration Interface

```typescript
interface IWorkerSystemConfig {
  enableWorker?: boolean;
  workerCount?: number;
  entitiesPerWorker?: number;
  systemConfig?: unknown;
  useSharedArrayBuffer?: boolean;
  entityDataSize?: number;
  maxEntities?: number;
  workerScriptPath?: string;
}
```

## Processing Modes

### Traditional Worker Mode

Data serialized between main thread and Workers:

```typescript
constructor() {
  super(matcher, {
    enableWorker: true,
    useSharedArrayBuffer: false,
    workerCount: 2
  });
}
```

**Use case**: Complex calculations, moderate entity count

### SharedArrayBuffer Mode

Zero-copy data sharing for large-scale simple calculations:

```typescript
constructor() {
  super(matcher, {
    enableWorker: true,
    useSharedArrayBuffer: true,
    entityDataSize: 6,
    maxEntities: 10000
  });
}
```

**Use case**: Many entities with simple calculations

## Get System Info

```typescript
const info = this.getWorkerInfo();
// { enabled, workerCount, maxSystemWorkerCount, currentMode, ... }
```

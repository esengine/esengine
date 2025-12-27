---
title: "WeChat Mini Game"
description: "WeChat Worker limitations and solutions"
---

WeChat Mini Game has special Worker restrictions. ESEngine provides CLI tools to solve this.

## Platform Differences

| Feature | Browser | WeChat |
|---------|---------|--------|
| Dynamic scripts | ✅ | ❌ |
| Worker count | Multiple | Max 1 |
| Script source | Any | Package files only |

## Using Worker Generator CLI

```bash
# Install
pnpm add -D @esengine/worker-generator

# Generate Worker files
npx esengine-worker-gen --src ./src --wechat
```

## Configuration

```typescript
class PhysicsSystem extends WorkerEntitySystem<PhysicsData> {
  constructor() {
    super(matcher, {
      enableWorker: true,
      workerScriptPath: 'workers/physics-worker.js'
    });
  }
}
```

## Important Notes

1. Re-run CLI after modifying `workerProcess`
2. Worker functions must be pure (no `this`)
3. Pass config via `systemConfig`

---
title: "Best Practices"
description: "Worker system performance optimization"
---

## Worker Function Requirements

```typescript
// ✅ Pure function using only parameters
protected workerProcess(entities: PhysicsData[], dt: number, config: any): PhysicsData[] {
  return entities.map(e => {
    e.y += e.velocity * dt;
    return e;
  });
}

// ❌ Avoid using this or external variables
protected workerProcess(entities: PhysicsData[], dt: number): PhysicsData[] {
  e.y += this.someProperty; // ❌ Can't access this in Worker
}
```

## Data Design

- Use simple, flat data structures
- Avoid complex nested objects
- Keep serialization overhead minimal

## When to Use Workers

| Scenario | Recommendation |
|----------|----------------|
| Entities < 100 | Don't use Worker |
| 100 < Entities < 1000 | Traditional Worker mode |
| Entities > 1000 | SharedArrayBuffer mode |
| Complex AI | Traditional Worker mode |
| Simple physics | SharedArrayBuffer mode |

## Performance Tips

1. Only use Workers for compute-intensive tasks
2. Use SharedArrayBuffer to reduce serialization
3. Keep data structures simple and flat
4. Use `entitiesPerWorker` for load balancing

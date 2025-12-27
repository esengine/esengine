---
title: "System Management"
description: "System addition, removal and control in scenes"
---

Scene manages system registration, execution order, and lifecycle.

## Adding Systems

```typescript
class SystemScene extends Scene {
  protected initialize(): void {
    // Add system
    const movementSystem = new MovementSystem();
    this.addSystem(movementSystem);

    // Set system update order (lower runs first)
    movementSystem.updateOrder = 1;

    // Add more systems
    this.addSystem(new PhysicsSystem());
    this.addSystem(new RenderSystem());
  }
}
```

## Getting Systems

```typescript
// Get system of specific type
const physicsSystem = this.getEntityProcessor(PhysicsSystem);

if (physicsSystem) {
  console.log("Found physics system");
}
```

## Removing Systems

```typescript
public removeUnnecessarySystems(): void {
  const physicsSystem = this.getEntityProcessor(PhysicsSystem);

  if (physicsSystem) {
    this.removeSystem(physicsSystem);
  }
}
```

## Controlling Systems

### Enable/Disable Systems

```typescript
public pausePhysics(): void {
  const physicsSystem = this.getEntityProcessor(PhysicsSystem);
  if (physicsSystem) {
    physicsSystem.enabled = false; // Disable system
  }
}

public resumePhysics(): void {
  const physicsSystem = this.getEntityProcessor(PhysicsSystem);
  if (physicsSystem) {
    physicsSystem.enabled = true; // Enable system
  }
}
```

### Get All Systems

```typescript
public getAllSystems(): EntitySystem[] {
  return this.systems; // Get all registered systems
}
```

## System Organization Best Practice

Group systems by function:

```typescript
class OrganizedScene extends Scene {
  protected initialize(): void {
    // Add systems by function and dependencies
    this.addInputSystems();
    this.addLogicSystems();
    this.addRenderSystems();
  }

  private addInputSystems(): void {
    this.addSystem(new InputSystem());
  }

  private addLogicSystems(): void {
    this.addSystem(new MovementSystem());
    this.addSystem(new PhysicsSystem());
    this.addSystem(new CollisionSystem());
  }

  private addRenderSystems(): void {
    this.addSystem(new RenderSystem());
    this.addSystem(new UISystem());
  }
}
```

## API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `addSystem(system)` | `void` | Add system to scene |
| `removeSystem(system)` | `void` | Remove system from scene |
| `getEntityProcessor(Type)` | `T \| undefined` | Get system by type |
| `systems` | `EntitySystem[]` | Get all systems |

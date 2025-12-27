---
title: "Component Lifecycle"
description: "Component lifecycle hooks and events"
---

Components provide lifecycle hooks that can be overridden to execute specific logic.

## Lifecycle Methods

```typescript
@ECSComponent('ExampleComponent')
class ExampleComponent extends Component {
  private resource: SomeResource | null = null;

  /**
   * Called when component is added to entity
   * Use for initializing resources, establishing references, etc.
   */
  onAddedToEntity(): void {
    console.log(`Component ${this.constructor.name} added, Entity ID: ${this.entityId}`);
    this.resource = new SomeResource();
  }

  /**
   * Called when component is removed from entity
   * Use for cleaning up resources, breaking references, etc.
   */
  onRemovedFromEntity(): void {
    console.log(`Component ${this.constructor.name} removed`);
    if (this.resource) {
      this.resource.cleanup();
      this.resource = null;
    }
  }
}
```

## Lifecycle Order

```
Entity created
    ↓
addComponent() called
    ↓
onAddedToEntity() triggered
    ↓
Component in normal use...
    ↓
removeComponent() or entity.destroy() called
    ↓
onRemovedFromEntity() triggered
    ↓
Component removed/destroyed
```

## Practical Use Cases

### Resource Management

```typescript
@ECSComponent('TextureComponent')
class TextureComponent extends Component {
  private _texture: Texture | null = null;
  texturePath: string = '';

  onAddedToEntity(): void {
    // Load texture resource
    this._texture = TextureManager.load(this.texturePath);
  }

  onRemovedFromEntity(): void {
    // Release texture resource
    if (this._texture) {
      TextureManager.release(this._texture);
      this._texture = null;
    }
  }

  get texture(): Texture | null {
    return this._texture;
  }
}
```

### Event Listening

```typescript
@ECSComponent('InputListener')
class InputListener extends Component {
  private _boundHandler: ((e: KeyboardEvent) => void) | null = null;

  onAddedToEntity(): void {
    this._boundHandler = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this._boundHandler);
  }

  onRemovedFromEntity(): void {
    if (this._boundHandler) {
      window.removeEventListener('keydown', this._boundHandler);
      this._boundHandler = null;
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Handle keyboard input
  }
}
```

### Registering with External Systems

```typescript
@ECSComponent('PhysicsBody')
class PhysicsBody extends Component {
  private _body: PhysicsWorld.Body | null = null;

  onAddedToEntity(): void {
    // Create rigid body in physics world
    this._body = PhysicsWorld.createBody({
      entityId: this.entityId,
      type: 'dynamic'
    });
  }

  onRemovedFromEntity(): void {
    // Remove rigid body from physics world
    if (this._body) {
      PhysicsWorld.removeBody(this._body);
      this._body = null;
    }
  }
}
```

## Important Notes

### Avoid Accessing Other Components in Lifecycle

```typescript
@ECSComponent('BadComponent')
class BadComponent extends Component {
  onAddedToEntity(): void {
    // ⚠️ Not recommended: Other components may not be added yet
    const other = this.entity?.getComponent(OtherComponent);
    if (other) {
      // May be null
    }
  }
}
```

### Recommended: Use System to Handle Inter-Component Interactions

```typescript
@ECSSystem('InitializationSystem')
class InitializationSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(ComponentA, ComponentB));
  }

  // Use onAdded event to ensure both components exist
  onAdded(entity: Entity): void {
    const a = entity.getComponent(ComponentA)!;
    const b = entity.getComponent(ComponentB)!;
    // Safely initialize interaction
    a.linkTo(b);
  }

  onRemoved(entity: Entity): void {
    // Cleanup
  }
}
```

## Comparison with System Lifecycle

| Feature | Component Lifecycle | System Lifecycle |
|---------|---------------------|------------------|
| Trigger Timing | When component added/removed | When match conditions met |
| Use Case | Resource init/cleanup | Business logic processing |
| Access Other Components | Not recommended | Safe |
| Access Scene | Limited | Full |

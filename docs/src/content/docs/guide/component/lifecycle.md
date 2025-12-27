---
title: "组件生命周期"
description: "组件的生命周期钩子和事件"
---

组件提供了生命周期钩子，可以重写来执行特定的逻辑。

## 生命周期方法

```typescript
@ECSComponent('ExampleComponent')
class ExampleComponent extends Component {
  private resource: SomeResource | null = null;

  /**
   * 组件被添加到实体时调用
   * 用于初始化资源、建立引用等
   */
  onAddedToEntity(): void {
    console.log(`组件 ${this.constructor.name} 已添加，实体ID: ${this.entityId}`);
    this.resource = new SomeResource();
  }

  /**
   * 组件从实体移除时调用
   * 用于清理资源、断开引用等
   */
  onRemovedFromEntity(): void {
    console.log(`组件 ${this.constructor.name} 已移除`);
    if (this.resource) {
      this.resource.cleanup();
      this.resource = null;
    }
  }
}
```

## 生命周期顺序

```
实体创建
    ↓
addComponent() 调用
    ↓
onAddedToEntity() 触发
    ↓
组件正常使用中...
    ↓
removeComponent() 或 entity.destroy() 调用
    ↓
onRemovedFromEntity() 触发
    ↓
组件被移除/销毁
```

## 实际用例

### 资源管理

```typescript
@ECSComponent('TextureComponent')
class TextureComponent extends Component {
  private _texture: Texture | null = null;
  texturePath: string = '';

  onAddedToEntity(): void {
    // 加载纹理资源
    this._texture = TextureManager.load(this.texturePath);
  }

  onRemovedFromEntity(): void {
    // 释放纹理资源
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

### 事件监听

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
    // 处理键盘输入
  }
}
```

### 注册到外部系统

```typescript
@ECSComponent('PhysicsBody')
class PhysicsBody extends Component {
  private _body: PhysicsWorld.Body | null = null;

  onAddedToEntity(): void {
    // 在物理世界中创建刚体
    this._body = PhysicsWorld.createBody({
      entityId: this.entityId,
      type: 'dynamic'
    });
  }

  onRemovedFromEntity(): void {
    // 从物理世界移除刚体
    if (this._body) {
      PhysicsWorld.removeBody(this._body);
      this._body = null;
    }
  }
}
```

## 注意事项

### 避免在生命周期中访问其他组件

```typescript
@ECSComponent('BadComponent')
class BadComponent extends Component {
  onAddedToEntity(): void {
    // ⚠️ 不推荐：此时其他组件可能还未添加
    const other = this.entity?.getComponent(OtherComponent);
    if (other) {
      // 可能为 null
    }
  }
}
```

### 推荐：使用 System 处理组件间交互

```typescript
@ECSSystem('InitializationSystem')
class InitializationSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(ComponentA, ComponentB));
  }

  // 使用 onAdded 事件，确保两个组件都存在
  onAdded(entity: Entity): void {
    const a = entity.getComponent(ComponentA)!;
    const b = entity.getComponent(ComponentB)!;
    // 安全地初始化交互
    a.linkTo(b);
  }

  onRemoved(entity: Entity): void {
    // 清理
  }
}
```

## 与 System 生命周期的对比

| 特性 | 组件生命周期 | System 生命周期 |
|------|-------------|----------------|
| 触发时机 | 组件添加/移除时 | 匹配条件满足时 |
| 适用场景 | 资源初始化/清理 | 业务逻辑处理 |
| 访问其他组件 | 不推荐 | 安全 |
| 访问 Scene | 有限 | 完整 |

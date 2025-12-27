---
title: "使用场景"
description: "序列化系统的实际应用示例"
---

## 游戏存档系统

```typescript
class SaveSystem {
  private static SAVE_KEY = 'game_save';

  // 保存游戏
  public static saveGame(scene: Scene): void {
    const saveData = scene.serialize({
      format: 'json',
      pretty: false
    });

    localStorage.setItem(this.SAVE_KEY, saveData);
    console.log('游戏已保存');
  }

  // 加载游戏
  public static loadGame(scene: Scene): boolean {
    const saveData = localStorage.getItem(this.SAVE_KEY);
    if (saveData) {
      scene.deserialize(saveData, {
        strategy: 'replace'
      });
      console.log('游戏已加载');
      return true;
    }
    return false;
  }

  // 检查是否有存档
  public static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
```

## 网络同步

```typescript
class NetworkSync {
  private baseSnapshot?: any;
  private syncInterval: number = 100; // 100ms同步一次

  constructor(private scene: Scene, private socket: WebSocket) {
    this.setupSync();
  }

  private setupSync(): void {
    // 创建基础快照
    this.scene.createIncrementalSnapshot();

    // 定期发送增量
    setInterval(() => {
      this.sendIncremental();
    }, this.syncInterval);

    // 接收远程增量
    this.socket.onmessage = (event) => {
      this.receiveIncremental(event.data);
    };
  }

  private sendIncremental(): void {
    const incremental = this.scene.serializeIncremental();
    const stats = IncrementalSerializer.getIncrementalStats(incremental);

    // 只在有变更时发送
    if (stats.totalChanges > 0) {
      // 使用二进制格式减少网络传输量
      const binaryData = IncrementalSerializer.serializeIncremental(incremental, {
        format: 'binary'
      });
      this.socket.send(binaryData);

      // 更新基准
      this.scene.updateIncrementalSnapshot();
    }
  }

  private receiveIncremental(data: ArrayBuffer): void {
    // 直接应用二进制数据（ArrayBuffer 转 Uint8Array）
    const uint8Array = new Uint8Array(data);
    this.scene.applyIncremental(uint8Array);
  }
}
```

## 撤销/重做系统

```typescript
class UndoRedoSystem {
  private history: IncrementalSnapshot[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;

  constructor(private scene: Scene) {
    // 创建初始快照
    this.scene.createIncrementalSnapshot();
    this.saveState('Initial');
  }

  // 保存当前状态
  public saveState(label: string): void {
    const incremental = this.scene.serializeIncremental();

    // 删除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1);

    // 添加新状态
    this.history.push(incremental);
    this.currentIndex++;

    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }

    // 更新快照基准
    this.scene.updateIncrementalSnapshot();
  }

  // 撤销
  public undo(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const incremental = this.history[this.currentIndex];
      this.scene.applyIncremental(incremental);
      return true;
    }
    return false;
  }

  // 重做
  public redo(): boolean {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const incremental = this.history[this.currentIndex];
      this.scene.applyIncremental(incremental);
      return true;
    }
    return false;
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
}
```

## 关卡编辑器

```typescript
class LevelEditor {
  // 导出关卡
  public exportLevel(scene: Scene, filename: string): void {
    const levelData = scene.serialize({
      format: 'json',
      pretty: true,
      includeMetadata: true
    });

    // 浏览器环境
    const blob = new Blob([levelData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 导入关卡
  public importLevel(scene: Scene, fileContent: string): void {
    scene.deserialize(fileContent, {
      strategy: 'replace'
    });
  }

  // 验证关卡数据
  public validateLevel(saveData: string): boolean {
    const validation = SceneSerializer.validate(saveData);
    if (!validation.valid) {
      console.error('关卡数据无效:', validation.errors);
      return false;
    }
    return true;
  }

  // 获取关卡信息（不完全反序列化）
  public getLevelInfo(saveData: string): any {
    const info = SceneSerializer.getInfo(saveData);
    return info;
  }
}
```

## 性能优化建议

### 1. 选择合适的格式

- **开发阶段**：使用JSON格式，便于调试和查看
- **生产环境**：使用Binary格式，减少30-50%的数据大小

### 2. 按需序列化

```typescript
// 只序列化需要持久化的组件
const saveData = scene.serialize({
  format: 'binary',
  components: [PlayerComponent, InventoryComponent, QuestComponent]
});
```

### 3. 增量序列化优化

```typescript
// 对于高频同步，关闭深度对比以提升性能
scene.createIncrementalSnapshot({
  deepComponentComparison: false  // 只检测组件的添加/删除
});
```

## 最佳实践

### 1. 明确序列化字段

```typescript
// 明确标记需要序列化的字段
@ECSComponent('Player')
@Serializable({ version: 1 })
class PlayerComponent extends Component {
  @Serialize()
  public name: string = '';

  @Serialize()
  public level: number = 1;

  // 运行时数据不序列化
  private _cachedSprite: any = null;
}
```

### 2. 使用版本控制

```typescript
// 为组件指定版本
@Serializable({ version: 2 })
class PlayerComponent extends Component {
  // 版本2的字段
}

// 注册迁移函数确保兼容性
VersionMigrationManager.registerComponentMigration('Player', 1, 2, migrateV1ToV2);
```

### 3. 避免循环引用

```typescript
// 不要在组件中直接引用其他实体
@ECSComponent('Follower')
@Serializable({ version: 1 })
class FollowerComponent extends Component {
  // 存储实体ID而不是实体引用
  @Serialize()
  public targetId: number = 0;

  // 通过场景查找目标实体
  public getTarget(scene: Scene): Entity | null {
    return scene.entities.findEntityById(this.targetId);
  }
}
```

### 4. 压缩大数据

```typescript
// 对于大型数据结构，使用自定义序列化
@ECSComponent('LargeData')
@Serializable({ version: 1 })
class LargeDataComponent extends Component {
  @Serialize({
    serializer: (data: LargeObject) => compressData(data),
    deserializer: (data: CompressedData) => decompressData(data)
  })
  public data: LargeObject;
}
```

## 性能对比

| 场景 | JSON格式 | Binary格式 | 节省 |
|------|----------|------------|------|
| 小型存档 (100实体) | 50KB | 35KB | 30% |
| 中型存档 (1000实体) | 500KB | 300KB | 40% |
| 大型存档 (10000实体) | 5MB | 2.5MB | 50% |

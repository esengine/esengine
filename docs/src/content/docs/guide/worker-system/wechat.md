---
title: "微信小游戏支持"
description: "微信小游戏 Worker 限制和解决方案"
---

微信小游戏对 Worker 有特殊限制，不支持动态创建 Worker 脚本。ESEngine 提供了 CLI 工具来解决这个问题。

## 平台差异

| 特性 | 浏览器 | 微信小游戏 |
|------|--------|-----------|
| 动态脚本 (Blob URL) | ✅ 支持 | ❌ 不支持 |
| Worker 数量 | 多个 | 最多 1 个 |
| 脚本来源 | 任意 | 必须是代码包内文件 |
| SharedArrayBuffer | 需要 COOP/COEP | 有限支持 |

## 使用 Worker Generator CLI

### 1. 安装工具

```bash
pnpm add -D @esengine/worker-generator
```

### 2. 配置 workerScriptPath

```typescript
@ECSSystem('Physics')
class PhysicsWorkerSystem extends WorkerEntitySystem<PhysicsData> {
  constructor() {
    super(Matcher.all(Position, Velocity), {
      enableWorker: true,
      workerScriptPath: 'workers/physics-worker.js',
      systemConfig: { gravity: 100 }
    });
  }

  protected workerProcess(entities: PhysicsData[], dt: number, config: any): PhysicsData[] {
    return entities.map(e => {
      e.vy += config.gravity * dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      return e;
    });
  }
}
```

### 3. 生成 Worker 文件

```bash
# 基本用法
npx esengine-worker-gen --src ./src --wechat

# 完整选项
npx esengine-worker-gen \
  --src ./src \
  --wechat \
  --mapping \
  --verbose
```

CLI 工具会自动：
1. 扫描所有 `WorkerEntitySystem` 子类
2. 提取 `workerProcess` 方法
3. 转换为 ES5 语法
4. 生成到配置的路径

### 4. 配置 game.json

```json
{
  "deviceOrientation": "portrait",
  "workers": "workers"
}
```

### 5. 项目结构

```
your-game/
├── game.js
├── game.json
├── src/
│   └── systems/
│       └── PhysicsSystem.ts
└── workers/
    ├── physics-worker.js    # 自动生成
    └── worker-mapping.json  # 自动生成
```

## 临时禁用 Worker

### 配置禁用

```typescript
constructor() {
  super(matcher, {
    enableWorker: false,
  });
}
```

### 平台适配器禁用

```typescript
class MyPlatformAdapter implements IPlatformAdapter {
  isWorkerSupported(): boolean {
    return false;
  }
}
```

## 注意事项

1. **每次修改 workerProcess 后需重新运行 CLI**

2. **Worker 函数必须是纯函数**：
   ```typescript
   // ✅ 正确
   protected workerProcess(entities, dt, config) {
     return entities.map(e => {
       e.y += config.gravity * dt;
       return e;
     });
   }

   // ❌ 错误：使用 this
   protected workerProcess(entities, dt, config) {
     e.y += this.gravity * dt; // Worker 中无法访问 this
   }
   ```

3. **配置数据通过 systemConfig 传递**

4. **开发者工具警告可忽略**：
   - `getNetworkType:fail not support`
   - `SharedArrayBuffer will require cross-origin isolation`

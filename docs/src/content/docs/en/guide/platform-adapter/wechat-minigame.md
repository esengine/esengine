---
title: "WeChat Mini Game Adapter"
---

## Overview

The WeChat Mini Game platform adapter is designed specifically for the WeChat Mini Game environment, handling special restrictions and APIs.

## Feature Support

| Feature | Support | Notes |
|---------|---------|-------|
| **Worker** | Supported | Requires precompiled file, configure `workerScriptPath` |
| **SharedArrayBuffer** | Not Supported | WeChat Mini Game environment doesn't support this |
| **Transferable Objects** | Not Supported | Only serializable objects supported |
| **High-Resolution Time** | Supported | Uses `wx.getPerformance()` |
| **Device Info** | Supported | Complete WeChat Mini Game device info |

## WorkerEntitySystem Usage

### Important: WeChat Mini Game Worker Restrictions

WeChat Mini Game Workers have the following restrictions:
- **Worker scripts must be in the code package**, cannot be dynamically generated
- **Must be configured in `game.json`** with `workers` directory
- **Maximum of 1 Worker** can be created

Therefore, when using `WorkerEntitySystem`, there are two approaches:
1. **Recommended: Use CLI tool** to automatically generate Worker files
2. Manually create Worker files

### Method 1: Use CLI Tool for Auto-Generation (Recommended)

We provide the `@esengine/worker-generator` tool that can automatically extract `workerProcess` functions from your TypeScript code and generate WeChat Mini Game compatible Worker files.

#### Installation

```bash
pnpm add -D @esengine/worker-generator
# or
npm install --save-dev @esengine/worker-generator
```

#### Usage

```bash
# Scan src directory, generate Worker files to workers directory
npx esengine-worker-gen --src ./src --out ./workers --wechat

# View help
npx esengine-worker-gen --help
```

#### Parameter Reference

| Parameter | Description | Default |
|-----------|-------------|---------|
| `-s, --src <dir>` | Source code directory | `./src` |
| `-o, --out <dir>` | Output directory | `./workers` |
| `-w, --wechat` | Generate WeChat Mini Game compatible code | `false` |
| `-m, --mapping` | Generate worker-mapping.json | `true` |
| `-t, --tsconfig <path>` | TypeScript config file path | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |

#### Example Output

```
ESEngine Worker Generator

Source directory: /project/src
Output directory: /project/workers
WeChat mode: Yes

Scanning for WorkerEntitySystem classes...

Found 1 WorkerEntitySystem class(es):
  - PhysicsSystem (src/systems/PhysicsSystem.ts)

Generating Worker files...

Successfully generated 1 Worker file(s):
  - PhysicsSystem -> workers/physics-system-worker.js

Usage:
1. Copy the generated files to your project's workers/ directory
2. Configure game.json (WeChat): { "workers": "workers" }
3. In your System constructor, add:
   workerScriptPath: 'workers/physics-system-worker.js'
```

#### Integration in Build Process

```json
// package.json
{
  "scripts": {
    "build:workers": "esengine-worker-gen --src ./src --out ./workers --wechat",
    "build": "pnpm build:workers && your-build-command"
  }
}
```

### Method 2: Manually Create Worker Files

If you don't want to use the CLI tool, you can manually create Worker files.

Create `workers/entity-worker.js` in your project:

```javascript
// workers/entity-worker.js
// WeChat Mini Game WorkerEntitySystem Generic Worker Template

let sharedFloatArray = null;

worker.onMessage(function(e) {
    const { type, id, entities, deltaTime, systemConfig, startIndex, endIndex, sharedBuffer } = e.data;

    try {
        // Handle SharedArrayBuffer initialization
        if (type === 'init' && sharedBuffer) {
            sharedFloatArray = new Float32Array(sharedBuffer);
            worker.postMessage({ type: 'init', success: true });
            return;
        }

        // Handle SharedArrayBuffer data
        if (type === 'shared' && sharedFloatArray) {
            processSharedArrayBuffer(startIndex, endIndex, deltaTime, systemConfig);
            worker.postMessage({ id, result: null });
            return;
        }

        // Traditional processing method
        if (entities) {
            const result = workerProcess(entities, deltaTime, systemConfig);

            // Handle Promise return value
            if (result && typeof result.then === 'function') {
                result.then(function(finalResult) {
                    worker.postMessage({ id, result: finalResult });
                }).catch(function(error) {
                    worker.postMessage({ id, error: error.message });
                });
            } else {
                worker.postMessage({ id, result: result });
            }
        }
    } catch (error) {
        worker.postMessage({ id, error: error.message });
    }
});

/**
 * Entity processing function - Modify this function based on your business logic
 * @param {Array} entities - Entity data array
 * @param {number} deltaTime - Frame interval time
 * @param {Object} systemConfig - System configuration
 * @returns {Array} Processed entity data
 */
function workerProcess(entities, deltaTime, systemConfig) {
    // ====== Write your processing logic here ======
    // Example: Physics calculation
    return entities.map(function(entity) {
        // Apply gravity
        entity.vy += (systemConfig.gravity || 100) * deltaTime;

        // Update position
        entity.x += entity.vx * deltaTime;
        entity.y += entity.vy * deltaTime;

        // Apply friction
        entity.vx *= (systemConfig.friction || 0.95);
        entity.vy *= (systemConfig.friction || 0.95);

        return entity;
    });
}

/**
 * SharedArrayBuffer processing function (optional)
 */
function processSharedArrayBuffer(startIndex, endIndex, deltaTime, systemConfig) {
    if (!sharedFloatArray) return;

    // ====== Implement SharedArrayBuffer processing logic as needed ======
    // Note: WeChat Mini Game doesn't support SharedArrayBuffer, this function typically won't be called
}
```

### Step 2: Configure game.json

Add workers configuration in `game.json`:

```json
{
  "deviceOrientation": "portrait",
  "showStatusBar": false,
  "workers": "workers"
}
```

### Step 3: Use WorkerEntitySystem

```typescript
import { WorkerEntitySystem, Matcher, Entity } from '@esengine/ecs-framework';

interface PhysicsData {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
}

class PhysicsSystem extends WorkerEntitySystem<PhysicsData> {
    constructor() {
        super(Matcher.all(Transform, Velocity), {
            enableWorker: true,
            workerCount: 1,  // WeChat Mini Game limits to 1 Worker
            workerScriptPath: 'workers/entity-worker.js',  // Specify precompiled Worker file
            systemConfig: {
                gravity: 100,
                friction: 0.95
            }
        });
    }

    protected getDefaultEntityDataSize(): number {
        return 6;
    }

    protected extractEntityData(entity: Entity): PhysicsData {
        const transform = entity.getComponent(Transform);
        const velocity = entity.getComponent(Velocity);
        const physics = entity.getComponent(Physics);

        return {
            id: entity.id,
            x: transform.x,
            y: transform.y,
            vx: velocity.x,
            vy: velocity.y,
            mass: physics.mass
        };
    }

    // Note: In WeChat Mini Game, this method won't be used
    // Worker processing logic is in workers/entity-worker.js workerProcess function
    protected workerProcess(entities: PhysicsData[], deltaTime: number, config: any): PhysicsData[] {
        return entities.map(entity => {
            entity.vy += config.gravity * deltaTime;
            entity.x += entity.vx * deltaTime;
            entity.y += entity.vy * deltaTime;
            entity.vx *= config.friction;
            entity.vy *= config.friction;
            return entity;
        });
    }

    protected applyResult(entity: Entity, result: PhysicsData): void {
        const transform = entity.getComponent(Transform);
        const velocity = entity.getComponent(Velocity);

        transform.x = result.x;
        transform.y = result.y;
        velocity.x = result.vx;
        velocity.y = result.vy;
    }

    // SharedArrayBuffer related methods (not supported in WeChat Mini Game, can be omitted)
    protected writeEntityToBuffer(data: PhysicsData, offset: number): void {}
    protected readEntityFromBuffer(offset: number): PhysicsData | null { return null; }
}
```

### Temporarily Disable Worker (Fallback to Sync Mode)

If you encounter issues, you can temporarily disable Worker:

```typescript
class PhysicsSystem extends WorkerEntitySystem<PhysicsData> {
    constructor() {
        super(Matcher.all(Transform, Velocity), {
            enableWorker: false,  // Disable Worker, use main thread synchronous processing
            // ... other config
        });
    }
}
```

## Complete Adapter Implementation

```typescript
import type {
    IPlatformAdapter,
    PlatformWorker,
    WorkerCreationOptions,
    PlatformConfig
} from '@esengine/ecs-framework';

/**
 * WeChat Mini Game platform adapter
 */
export class WeChatMiniGameAdapter implements IPlatformAdapter {
    public readonly name = 'wechat-minigame';
    public readonly version: string;
    private systemInfo: any;

    constructor() {
        this.systemInfo = this.getSystemInfo();
        this.version = this.systemInfo.SDKVersion || 'unknown';
    }

    public isWorkerSupported(): boolean {
        return typeof wx !== 'undefined' && typeof wx.createWorker === 'function';
    }

    public isSharedArrayBufferSupported(): boolean {
        return false;
    }

    public getHardwareConcurrency(): number {
        return 1;  // WeChat Mini Game max 1 Worker
    }

    public createWorker(scriptPath: string, options: WorkerCreationOptions = {}): PlatformWorker {
        if (!this.isWorkerSupported()) {
            throw new Error('WeChat Mini Game environment does not support Worker');
        }

        // scriptPath must be a file path in the code package
        const worker = wx.createWorker(scriptPath, {
            useExperimentalWorker: true
        });

        return new WeChatWorker(worker);
    }

    public createSharedArrayBuffer(length: number): SharedArrayBuffer | null {
        return null;
    }

    public getHighResTimestamp(): number {
        if (typeof wx !== 'undefined' && wx.getPerformance) {
            return wx.getPerformance().now();
        }
        return Date.now();
    }

    public getPlatformConfig(): PlatformConfig {
        return {
            maxWorkerCount: 1,
            supportsModuleWorker: false,
            supportsTransferableObjects: false,
            maxSharedArrayBufferSize: 0,
            workerScriptPrefix: '',
            limitations: {
                noEval: true,  // Important: Mark that dynamic scripts not supported
                requiresWorkerInit: false,
                memoryLimit: 512 * 1024 * 1024,
                workerNotSupported: false,
                workerLimitations: [
                    'Maximum of 1 Worker can be created',
                    'Worker scripts must be in the code package',
                    'workers path must be configured in game.json',
                    'workerScriptPath configuration required'
                ]
            },
            extensions: {
                platform: 'wechat-minigame',
                sdkVersion: this.systemInfo.SDKVersion
            }
        };
    }

    private getSystemInfo(): any {
        if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
            try {
                return wx.getSystemInfoSync();
            } catch (error) {
                console.warn('Failed to get WeChat system info:', error);
            }
        }
        return {};
    }
}

/**
 * WeChat Worker wrapper
 */
class WeChatWorker implements PlatformWorker {
    private _state: 'running' | 'terminated' = 'running';
    private worker: any;

    constructor(worker: any) {
        this.worker = worker;
    }

    public get state(): 'running' | 'terminated' {
        return this._state;
    }

    public postMessage(message: any, transfer?: Transferable[]): void {
        if (this._state === 'terminated') {
            throw new Error('Worker has been terminated');
        }
        this.worker.postMessage(message);
    }

    public onMessage(handler: (event: { data: any }) => void): void {
        this.worker.onMessage((res: any) => {
            handler({ data: res });
        });
    }

    public onError(handler: (error: ErrorEvent) => void): void {
        if (this.worker.onError) {
            this.worker.onError(handler);
        }
    }

    public terminate(): void {
        if (this._state === 'running') {
            this.worker.terminate();
            this._state = 'terminated';
        }
    }
}
```

## Register the Adapter

```typescript
import { PlatformManager } from '@esengine/ecs-framework';
import { WeChatMiniGameAdapter } from './platform/WeChatMiniGameAdapter';

// Register adapter at game startup
if (typeof wx !== 'undefined') {
    const adapter = new WeChatMiniGameAdapter();
    PlatformManager.getInstance().registerAdapter(adapter);
}
```

## Official Documentation Reference

- [wx.createWorker API](https://developers.weixin.qq.com/minigame/dev/api/worker/wx.createWorker.html)
- [Worker.postMessage API](https://developers.weixin.qq.com/minigame/dev/api/worker/Worker.postMessage.html)
- [Worker.onMessage API](https://developers.weixin.qq.com/minigame/dev/api/worker/Worker.onMessage.html)

## Important Notes

### Worker Restrictions

| Restriction | Description |
|-------------|-------------|
| Quantity Limit | Maximum of 1 Worker can be created |
| Version Requirement | Requires base library 1.9.90 or above |
| Script Location | Must be in code package, dynamic generation not supported |
| Lifecycle | Must terminate() before creating new Worker |

### Memory Limits

- Typically limited to 256MB - 512MB
- Need to release unused resources promptly
- Recommend listening for memory warnings:

```typescript
wx.onMemoryWarning(() => {
    console.warn('Received memory warning, starting resource cleanup');
    // Clean up unnecessary resources
});
```

## Debugging Tips

```typescript
// Check Worker configuration
const adapter = PlatformManager.getInstance().getAdapter();
const config = adapter.getPlatformConfig();

console.log('Worker support:', adapter.isWorkerSupported());
console.log('Max Worker count:', config.maxWorkerCount);
console.log('Platform limitations:', config.limitations);
```

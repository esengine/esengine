---
title: "Platform Adapter"
---

## Overview

The ECS framework provides a platform adapter interface that allows users to implement custom platform adapters for different runtime environments.

**The core library only provides interface definitions. Platform adapter implementations should be copied from the documentation.**

## Why No Separate Adapter Packages?

1. **Flexibility**: Different projects may have different platform adaptation needs. Copying code allows users to freely modify as needed
2. **Reduce Dependencies**: Avoid introducing unnecessary dependency packages, keeping the core framework lean
3. **Customization**: Users can customize according to specific runtime environments and requirements

## Supported Platforms

### [Browser Adapter](./platform-adapter/browser/)

Supports all modern browser environments, including Chrome, Firefox, Safari, Edge, etc.

**Feature Support**:
- Worker (Web Worker)
- SharedArrayBuffer (requires COOP/COEP)
- Transferable Objects
- Module Worker (modern browsers)

**Use Cases**: Web games, Web applications, PWA

---

### [WeChat Mini Game Adapter](./platform-adapter/wechat-minigame/)

Designed specifically for the WeChat Mini Game environment, handling special restrictions and APIs.

**Feature Support**:
- Worker (max 1, requires game.json configuration)
- SharedArrayBuffer (not supported)
- Transferable Objects (not supported)
- WeChat Device Info API

**Use Cases**: WeChat Mini Game development

---

### [Node.js Adapter](./platform-adapter/nodejs/)

Provides support for Node.js server environments, suitable for game servers and compute servers.

**Feature Support**:
- Worker Threads
- SharedArrayBuffer
- Transferable Objects
- Complete system information

**Use Cases**: Game servers, compute servers, CLI tools

---

## Core Interfaces

### IPlatformAdapter

```typescript
export interface IPlatformAdapter {
    readonly name: string;
    readonly version?: string;

    isWorkerSupported(): boolean;
    isSharedArrayBufferSupported(): boolean;
    getHardwareConcurrency(): number;
    createWorker(script: string, options?: WorkerCreationOptions): PlatformWorker;
    createSharedArrayBuffer(length: number): SharedArrayBuffer | null;
    getHighResTimestamp(): number;
    getPlatformConfig(): PlatformConfig;
    getPlatformConfigAsync?(): Promise<PlatformConfig>;
}
```

### PlatformWorker Interface

```typescript
export interface PlatformWorker {
    postMessage(message: any, transfer?: Transferable[]): void;
    onMessage(handler: (event: { data: any }) => void): void;
    onError(handler: (error: ErrorEvent) => void): void;
    terminate(): void;
    readonly state: 'running' | 'terminated';
}
```

## Usage

### 1. Choose the Appropriate Platform Adapter

Select the corresponding adapter based on your runtime environment:

```typescript
import { PlatformManager } from '@esengine/ecs-framework';

// Browser environment
if (typeof window !== 'undefined') {
    const { BrowserAdapter } = await import('./platform/BrowserAdapter');
    PlatformManager.getInstance().registerAdapter(new BrowserAdapter());
}

// WeChat Mini Game environment
else if (typeof wx !== 'undefined') {
    const { WeChatMiniGameAdapter } = await import('./platform/WeChatMiniGameAdapter');
    PlatformManager.getInstance().registerAdapter(new WeChatMiniGameAdapter());
}

// Node.js environment
else if (typeof process !== 'undefined' && process.versions?.node) {
    const { NodeAdapter } = await import('./platform/NodeAdapter');
    PlatformManager.getInstance().registerAdapter(new NodeAdapter());
}
```

### 2. Check Adapter Status

```typescript
const manager = PlatformManager.getInstance();

// Check if adapter is registered
if (manager.hasAdapter()) {
    const adapter = manager.getAdapter();
    console.log('Current platform:', adapter.name);
    console.log('Platform version:', adapter.version);

    // Check feature support
    console.log('Worker support:', manager.supportsFeature('worker'));
    console.log('SharedArrayBuffer support:', manager.supportsFeature('shared-array-buffer'));
}
```

## Creating Custom Adapters

If existing platform adapters don't meet your needs, you can create custom adapters:

### 1. Implement the Interface

```typescript
import type { IPlatformAdapter, PlatformWorker, WorkerCreationOptions, PlatformConfig } from '@esengine/ecs-framework';

export class CustomAdapter implements IPlatformAdapter {
    public readonly name = 'custom';
    public readonly version = '1.0.0';

    public isWorkerSupported(): boolean {
        // Implement your Worker support check logic
        return false;
    }

    public isSharedArrayBufferSupported(): boolean {
        // Implement your SharedArrayBuffer support check logic
        return false;
    }

    public getHardwareConcurrency(): number {
        // Return your platform's concurrency count
        return 1;
    }

    public createWorker(script: string, options?: WorkerCreationOptions): PlatformWorker {
        throw new Error('Worker not supported on this platform');
    }

    public createSharedArrayBuffer(length: number): SharedArrayBuffer | null {
        return null;
    }

    public getHighResTimestamp(): number {
        return Date.now();
    }

    public getPlatformConfig(): PlatformConfig {
        return {
            maxWorkerCount: 1,
            supportsModuleWorker: false,
            supportsTransferableObjects: false,
            limitations: {
                workerNotSupported: true
            }
        };
    }
}
```

### 2. Register Custom Adapter

```typescript
import { PlatformManager } from '@esengine/ecs-framework';
import { CustomAdapter } from './CustomAdapter';

const customAdapter = new CustomAdapter();
PlatformManager.getInstance().registerAdapter(customAdapter);
```

## Best Practices

### 1. Platform Detection Order

Recommend detecting and registering platform adapters in this order:

```typescript
async function initializePlatform() {
    const manager = PlatformManager.getInstance();

    try {
        // 1. WeChat Mini Game (highest priority, most distinctive environment)
        if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
            const { WeChatMiniGameAdapter } = await import('./platform/WeChatMiniGameAdapter');
            manager.registerAdapter(new WeChatMiniGameAdapter());
            return;
        }

        // 2. Node.js environment
        if (typeof process !== 'undefined' && process.versions?.node) {
            const { NodeAdapter } = await import('./platform/NodeAdapter');
            manager.registerAdapter(new NodeAdapter());
            return;
        }

        // 3. Browser environment (last check, broadest coverage)
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const { BrowserAdapter } = await import('./platform/BrowserAdapter');
            manager.registerAdapter(new BrowserAdapter());
            return;
        }

        // 4. Unknown environment, use default adapter
        console.warn('Unrecognized platform environment, using default adapter');
        manager.registerAdapter(new CustomAdapter());

    } catch (error) {
        console.error('Platform adapter initialization failed:', error);
        throw error;
    }
}
```

### 2. Feature Degradation Handling

```typescript
function createWorkerSystem() {
    const manager = PlatformManager.getInstance();

    if (!manager.hasAdapter()) {
        throw new Error('No platform adapter registered');
    }

    const config: WorkerSystemConfig = {
        enableWorker: manager.supportsFeature('worker'),
        workerCount: manager.supportsFeature('worker') ?
            manager.getAdapter().getHardwareConcurrency() : 1,
        useSharedArrayBuffer: manager.supportsFeature('shared-array-buffer')
    };

    // If Worker not supported, automatically degrade to synchronous processing
    if (!config.enableWorker) {
        console.info('Current platform does not support Worker, using synchronous processing mode');
    }

    return new PhysicsSystem(config);
}
```

### 3. Error Handling

```typescript
try {
    await initializePlatform();

    // Validate adapter functionality
    const manager = PlatformManager.getInstance();
    const adapter = manager.getAdapter();

    console.log(`Platform adapter initialized: ${adapter.name} v${adapter.version}`);

} catch (error) {
    console.error('Platform initialization failed:', error);

    // Provide fallback solution
    const fallbackAdapter = new CustomAdapter();
    PlatformManager.getInstance().registerAdapter(fallbackAdapter);

    console.warn('Using fallback adapter to continue running');
}
```

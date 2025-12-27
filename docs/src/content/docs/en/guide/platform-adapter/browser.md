---
title: "Browser Adapter"
---

## Overview

The browser platform adapter provides support for standard web browser environments, including modern browsers like Chrome, Firefox, Safari, Edge, etc.

## Feature Support

- **Worker**: Supports Web Worker and Module Worker
- **SharedArrayBuffer**: Supported (requires COOP/COEP headers)
- **Transferable Objects**: Fully supported
- **High-Resolution Time**: Uses `performance.now()`
- **Basic Info**: Browser version and basic configuration

## Complete Implementation

```typescript
import type {
    IPlatformAdapter,
    PlatformWorker,
    WorkerCreationOptions,
    PlatformConfig
} from '@esengine/ecs-framework';

/**
 * Browser platform adapter
 * Supports standard web browser environments
 */
export class BrowserAdapter implements IPlatformAdapter {
    public readonly name = 'browser';
    public readonly version: string;

    constructor() {
        this.version = this.getBrowserInfo();
    }

    /**
     * Check if Worker is supported
     */
    public isWorkerSupported(): boolean {
        return typeof Worker !== 'undefined';
    }

    /**
     * Check if SharedArrayBuffer is supported
     */
    public isSharedArrayBufferSupported(): boolean {
        return typeof SharedArrayBuffer !== 'undefined' && this.checkSharedArrayBufferEnabled();
    }

    /**
     * Get hardware concurrency (CPU core count)
     */
    public getHardwareConcurrency(): number {
        return navigator.hardwareConcurrency || 4;
    }

    /**
     * Create Worker
     */
    public createWorker(script: string, options: WorkerCreationOptions = {}): PlatformWorker {
        if (!this.isWorkerSupported()) {
            throw new Error('Browser does not support Worker');
        }

        try {
            return new BrowserWorker(script, options);
        } catch (error) {
            throw new Error(`Failed to create browser Worker: ${(error as Error).message}`);
        }
    }

    /**
     * Create SharedArrayBuffer
     */
    public createSharedArrayBuffer(length: number): SharedArrayBuffer | null {
        if (!this.isSharedArrayBufferSupported()) {
            return null;
        }

        try {
            return new SharedArrayBuffer(length);
        } catch (error) {
            console.warn('SharedArrayBuffer creation failed:', error);
            return null;
        }
    }

    /**
     * Get high-resolution timestamp
     */
    public getHighResTimestamp(): number {
        return performance.now();
    }

    /**
     * Get platform configuration
     */
    public getPlatformConfig(): PlatformConfig {
        return {
            maxWorkerCount: this.getHardwareConcurrency(),
            supportsModuleWorker: false,
            supportsTransferableObjects: true,
            maxSharedArrayBufferSize: 1024 * 1024 * 1024, // 1GB
            workerScriptPrefix: '',
            limitations: {
                noEval: false,
                requiresWorkerInit: false
            }
        };
    }

    /**
     * Get browser information
     */
    private getBrowserInfo(): string {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) {
            const match = userAgent.match(/Chrome\/([0-9.]+)/);
            return match ? `Chrome ${match[1]}` : 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            const match = userAgent.match(/Firefox\/([0-9.]+)/);
            if (match) return `Firefox ${match[1]}`;
        } else if (userAgent.includes('Safari')) {
            const match = userAgent.match(/Version\/([0-9.]+)/);
            if (match) return `Safari ${match[1]}`;
        }
        return 'Unknown Browser';
    }

    /**
     * Check if SharedArrayBuffer is actually available
     */
    private checkSharedArrayBufferEnabled(): boolean {
        try {
            new SharedArrayBuffer(8);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Browser Worker wrapper
 */
class BrowserWorker implements PlatformWorker {
    private _state: 'running' | 'terminated' = 'running';
    private worker: Worker;

    constructor(script: string, options: WorkerCreationOptions = {}) {
        this.worker = this.createBrowserWorker(script, options);
    }

    public get state(): 'running' | 'terminated' {
        return this._state;
    }

    public postMessage(message: any, transfer?: Transferable[]): void {
        if (this._state === 'terminated') {
            throw new Error('Worker has been terminated');
        }

        try {
            if (transfer && transfer.length > 0) {
                this.worker.postMessage(message, transfer);
            } else {
                this.worker.postMessage(message);
            }
        } catch (error) {
            throw new Error(`Failed to send message to Worker: ${(error as Error).message}`);
        }
    }

    public onMessage(handler: (event: { data: any }) => void): void {
        this.worker.onmessage = (event: MessageEvent) => {
            handler({ data: event.data });
        };
    }

    public onError(handler: (error: ErrorEvent) => void): void {
        this.worker.onerror = handler;
    }

    public terminate(): void {
        if (this._state === 'running') {
            try {
                this.worker.terminate();
                this._state = 'terminated';
            } catch (error) {
                console.error('Failed to terminate Worker:', error);
            }
        }
    }

    /**
     * Create browser Worker
     */
    private createBrowserWorker(script: string, options: WorkerCreationOptions): Worker {
        try {
            // Create Blob URL
            const blob = new Blob([script], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            // Create Worker
            const worker = new Worker(url, {
                type: options.type || 'classic',
                credentials: options.credentials,
                name: options.name
            });

            // Clean up Blob URL (delayed to ensure Worker has loaded)
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

            return worker;
        } catch (error) {
            throw new Error(`Cannot create browser Worker: ${(error as Error).message}`);
        }
    }
}
```

## Usage

### 1. Copy the Code

Copy the above code to your project, e.g., `src/platform/BrowserAdapter.ts`.

### 2. Register the Adapter

```typescript
import { PlatformManager } from '@esengine/ecs-framework';
import { BrowserAdapter } from './platform/BrowserAdapter';

// Create and register browser adapter
const browserAdapter = new BrowserAdapter();
PlatformManager.registerAdapter(browserAdapter);

// Framework will automatically detect and use the appropriate adapter
```

### 3. Use WorkerEntitySystem

The browser adapter works with WorkerEntitySystem, and the framework automatically handles Worker script creation:

```typescript
import { WorkerEntitySystem, Matcher } from '@esengine/ecs-framework';

class PhysicsSystem extends WorkerEntitySystem {
    constructor() {
        super(Matcher.all(Transform, Velocity), {
            enableWorker: true,
            workerCount: navigator.hardwareConcurrency || 4,
            useSharedArrayBuffer: true,
            systemConfig: { gravity: 9.8 }
        });
    }

    protected getDefaultEntityDataSize(): number {
        return 6; // x, y, vx, vy, mass, radius
    }

    protected extractEntityData(entity: Entity): PhysicsData {
        const transform = entity.getComponent(Transform);
        const velocity = entity.getComponent(Velocity);
        return {
            x: transform.x,
            y: transform.y,
            vx: velocity.x,
            vy: velocity.y,
            mass: 1,
            radius: 10
        };
    }

    // This function is automatically serialized and executed in Worker
    protected workerProcess(entities, deltaTime, config) {
        return entities.map(entity => {
            // Apply gravity
            entity.vy += config.gravity * deltaTime;

            // Update position
            entity.x += entity.vx * deltaTime;
            entity.y += entity.vy * deltaTime;

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
}

interface PhysicsData {
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
    radius: number;
}
```

### 4. Verify Adapter Status

```typescript
// Verify adapter is working properly
const adapter = new BrowserAdapter();
console.log('Adapter name:', adapter.name);
console.log('Browser version:', adapter.version);
console.log('Worker support:', adapter.isWorkerSupported());
console.log('SharedArrayBuffer support:', adapter.isSharedArrayBufferSupported());
console.log('CPU core count:', adapter.getHardwareConcurrency());
```

## Important Notes

### SharedArrayBuffer Support

SharedArrayBuffer requires special security configuration:

1. **HTTPS**: Must be used in a secure context
2. **COOP/COEP Headers**: Requires correct cross-origin isolation headers

```html
<!-- Set in HTML -->
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
```

Or set in server configuration:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Browser Compatibility

- **Worker**: All modern browsers supported
- **Module Worker**: Chrome 80+, Firefox 114+
- **SharedArrayBuffer**: Chrome 68+, Firefox 79+ (requires COOP/COEP)
- **Transferable Objects**: All modern browsers supported

## Performance Optimization Tips

1. **Worker Pool**: Reuse Worker instances to avoid frequent creation and destruction
2. **Data Transfer**: Use Transferable Objects to reduce data copying
3. **SharedArrayBuffer**: Use SharedArrayBuffer for large data sharing
4. **Module Worker**: Use module Workers in supported browsers for better code organization

## Debugging Tips

```typescript
// Check browser support
const adapter = new BrowserAdapter();
console.log('Worker support:', adapter.isWorkerSupported());
console.log('SharedArrayBuffer support:', adapter.isSharedArrayBufferSupported());
console.log('Hardware concurrency:', adapter.getHardwareConcurrency());
console.log('Platform config:', adapter.getPlatformConfig());
```

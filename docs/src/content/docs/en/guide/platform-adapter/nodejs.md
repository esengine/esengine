---
title: "Node.js Adapter"
---

## Overview

The Node.js platform adapter provides support for Node.js server environments, suitable for game servers, compute servers, or other server applications that need ECS architecture.

## Feature Support

- **Worker**: Supported (via `worker_threads` module)
- **SharedArrayBuffer**: Supported (Node.js 16.17.0+)
- **Transferable Objects**: Fully supported
- **High-Resolution Time**: Uses `process.hrtime.bigint()`
- **Device Info**: Complete system and process information

## Complete Implementation

```typescript
import { worker_threads, Worker, isMainThread, parentPort } from 'worker_threads';
import * as os from 'os';
import * as process from 'process';
import * as fs from 'fs';
import * as path from 'path';
import type {
    IPlatformAdapter,
    PlatformWorker,
    WorkerCreationOptions,
    PlatformConfig,
    NodeDeviceInfo
} from '@esengine/ecs-framework';

/**
 * Node.js platform adapter
 * Supports Node.js server environments
 */
export class NodeAdapter implements IPlatformAdapter {
    public readonly name = 'nodejs';
    public readonly version: string;

    constructor() {
        this.version = process.version;
    }

    /**
     * Check if Worker is supported
     */
    public isWorkerSupported(): boolean {
        try {
            // Check if worker_threads module is available
            return typeof worker_threads !== 'undefined' && typeof Worker !== 'undefined';
        } catch {
            return false;
        }
    }

    /**
     * Check if SharedArrayBuffer is supported
     */
    public isSharedArrayBufferSupported(): boolean {
        // Node.js supports SharedArrayBuffer
        return typeof SharedArrayBuffer !== 'undefined';
    }

    /**
     * Get hardware concurrency (CPU core count)
     */
    public getHardwareConcurrency(): number {
        return os.cpus().length;
    }

    /**
     * Create Worker
     */
    public createWorker(script: string, options: WorkerCreationOptions = {}): PlatformWorker {
        if (!this.isWorkerSupported()) {
            throw new Error('Node.js environment does not support Worker Threads');
        }

        try {
            return new NodeWorker(script, options);
        } catch (error) {
            throw new Error(`Failed to create Node.js Worker: ${(error as Error).message}`);
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
     * Get high-resolution timestamp (nanoseconds)
     */
    public getHighResTimestamp(): number {
        // Return milliseconds, consistent with browser performance.now()
        return Number(process.hrtime.bigint()) / 1000000;
    }

    /**
     * Get platform configuration
     */
    public getPlatformConfig(): PlatformConfig {
        return {
            maxWorkerCount: this.getHardwareConcurrency(),
            supportsModuleWorker: true, // Node.js supports ES modules
            supportsTransferableObjects: true,
            maxSharedArrayBufferSize: this.getMaxSharedArrayBufferSize(),
            workerScriptPrefix: '',
            limitations: {
                noEval: false, // Node.js supports eval
                requiresWorkerInit: false
            },
            extensions: {
                platform: 'nodejs',
                nodeVersion: process.version,
                v8Version: process.versions.v8,
                uvVersion: process.versions.uv,
                zlibVersion: process.versions.zlib,
                opensslVersion: process.versions.openssl,
                architecture: process.arch,
                endianness: os.endianness(),
                pid: process.pid,
                ppid: process.ppid
            }
        };
    }

    /**
     * Get Node.js device information
     */
    public getDeviceInfo(): NodeDeviceInfo {
        const cpus = os.cpus();
        const networkInterfaces = os.networkInterfaces();
        const userInfo = os.userInfo();

        return {
            // System info
            platform: os.platform(),
            arch: os.arch(),
            type: os.type(),
            release: os.release(),
            version: os.version(),
            hostname: os.hostname(),

            // CPU info
            cpus: cpus.map(cpu => ({
                model: cpu.model,
                speed: cpu.speed,
                times: cpu.times
            })),

            // Memory info
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            usedMemory: os.totalmem() - os.freemem(),

            // Load info
            loadAverage: os.loadavg(),

            // Network interfaces
            networkInterfaces: Object.fromEntries(
                Object.entries(networkInterfaces).map(([name, interfaces]) => [
                    name,
                    (interfaces || []).map(iface => ({
                        address: iface.address,
                        netmask: iface.netmask,
                        family: iface.family as 'IPv4' | 'IPv6',
                        mac: iface.mac,
                        internal: iface.internal,
                        cidr: iface.cidr,
                        scopeid: iface.scopeid
                    }))
                ])
            ),

            // Process info
            process: {
                pid: process.pid,
                ppid: process.ppid,
                version: process.version,
                versions: process.versions,
                uptime: process.uptime()
            },

            // User info
            userInfo: {
                uid: userInfo.uid,
                gid: userInfo.gid,
                username: userInfo.username,
                homedir: userInfo.homedir,
                shell: userInfo.shell
            }
        };
    }

    /**
     * Get SharedArrayBuffer maximum size limit
     */
    private getMaxSharedArrayBufferSize(): number {
        const totalMemory = os.totalmem();
        // Limit to 50% of total system memory
        return Math.floor(totalMemory * 0.5);
    }
}

/**
 * Node.js Worker wrapper
 */
class NodeWorker implements PlatformWorker {
    private _state: 'running' | 'terminated' = 'running';
    private worker: Worker;
    private isTemporaryFile: boolean = false;
    private scriptPath: string;

    constructor(script: string, options: WorkerCreationOptions = {}) {
        try {
            // Determine if script is a file path or script content
            if (this.isFilePath(script)) {
                // Use file path directly
                this.scriptPath = script;
                this.isTemporaryFile = false;
            } else {
                // Write script content to temporary file
                this.scriptPath = this.writeScriptToFile(script, options.name);
                this.isTemporaryFile = true;
            }

            // Create Worker
            this.worker = new Worker(this.scriptPath, {
                // Node.js Worker options
                workerData: options.name ? { name: options.name } : undefined
            });

        } catch (error) {
            throw new Error(`Failed to create Node.js Worker: ${(error as Error).message}`);
        }
    }

    /**
     * Determine if string is a file path
     */
    private isFilePath(script: string): boolean {
        // Check if it looks like a file path
        return (script.endsWith('.js') || script.endsWith('.mjs') || script.endsWith('.ts')) &&
               !script.includes('\n') &&
               !script.includes(';') &&
               script.length < 500; // File paths are typically not too long
    }

    /**
     * Write script content to temporary file
     */
    private writeScriptToFile(script: string, name?: string): string {
        const tmpDir = os.tmpdir();
        const fileName = name ? `worker-${name}-${Date.now()}.js` : `worker-${Date.now()}.js`;
        const filePath = path.join(tmpDir, fileName);

        try {
            fs.writeFileSync(filePath, script, 'utf8');
            return filePath;
        } catch (error) {
            throw new Error(`Failed to write Worker script file: ${(error as Error).message}`);
        }
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
                // Node.js Worker supports Transferable Objects
                this.worker.postMessage(message, transfer);
            } else {
                this.worker.postMessage(message);
            }
        } catch (error) {
            throw new Error(`Failed to send message to Node.js Worker: ${(error as Error).message}`);
        }
    }

    public onMessage(handler: (event: { data: any }) => void): void {
        this.worker.on('message', (data: any) => {
            handler({ data });
        });
    }

    public onError(handler: (error: ErrorEvent) => void): void {
        this.worker.on('error', (error: Error) => {
            // Convert Error to ErrorEvent format
            const errorEvent = {
                message: error.message,
                filename: '',
                lineno: 0,
                colno: 0,
                error: error
            } as ErrorEvent;
            handler(errorEvent);
        });
    }

    public terminate(): void {
        if (this._state === 'running') {
            try {
                this.worker.terminate();
                this._state = 'terminated';

                // Clean up temporary script file
                this.cleanupScriptFile();
            } catch (error) {
                console.error('Failed to terminate Node.js Worker:', error);
            }
        }
    }

    /**
     * Clean up temporary script file
     */
    private cleanupScriptFile(): void {
        // Only clean up temporarily created files, not user-provided file paths
        if (this.scriptPath && this.isTemporaryFile) {
            try {
                fs.unlinkSync(this.scriptPath);
            } catch (error) {
                console.warn('Failed to clean up Worker script file:', error);
            }
        }
    }
}
```

## Usage

### 1. Copy the Code

Copy the above code to your project, e.g., `src/platform/NodeAdapter.ts`.

### 2. Register the Adapter

```typescript
import { PlatformManager } from '@esengine/ecs-framework';
import { NodeAdapter } from './platform/NodeAdapter';

// Check if in Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const nodeAdapter = new NodeAdapter();
    PlatformManager.getInstance().registerAdapter(nodeAdapter);
}
```

### 3. Use WorkerEntitySystem

The Node.js adapter works with WorkerEntitySystem, and the framework automatically handles Worker script creation:

```typescript
import { WorkerEntitySystem, Matcher } from '@esengine/ecs-framework';
import * as os from 'os';

class PhysicsSystem extends WorkerEntitySystem {
    constructor() {
        super(Matcher.all(Transform, Velocity), {
            enableWorker: true,
            workerCount: os.cpus().length, // Use all CPU cores
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

### 4. Get System Information

```typescript
const manager = PlatformManager.getInstance();
if (manager.hasAdapter()) {
    const adapter = manager.getAdapter();
    const deviceInfo = adapter.getDeviceInfo();

    console.log('Node.js version:', deviceInfo.process?.version);
    console.log('CPU core count:', deviceInfo.cpus?.length);
    console.log('Total memory:', Math.round(deviceInfo.totalMemory! / 1024 / 1024), 'MB');
    console.log('Available memory:', Math.round(deviceInfo.freeMemory! / 1024 / 1024), 'MB');
}
```

## Official Documentation Reference

Node.js Worker Threads related official documentation:

- [Worker Threads Official Docs](https://nodejs.org/api/worker_threads.html)
- [SharedArrayBuffer Support](https://nodejs.org/api/globals.html#class-sharedarraybuffer)
- [OS Module Docs](https://nodejs.org/api/os.html)
- [Process Module Docs](https://nodejs.org/api/process.html)

## Important Notes

### Worker Threads Requirements

- **Node.js Version**: Requires Node.js 10.5.0+ (12+ recommended)
- **Module Type**: Supports both CommonJS and ES modules
- **Thread Limit**: Theoretically unlimited, but recommended not to exceed 2x CPU core count

### Performance Optimization Tips

#### 1. Worker Pool Management

```typescript
class ServerPhysicsSystem extends WorkerEntitySystem {
    constructor() {
        const cpuCount = os.cpus().length;
        super(Matcher.all(Transform, Velocity), {
            enableWorker: true,
            workerCount: Math.min(cpuCount * 2, 16), // Max 16 Workers
            entitiesPerWorker: 1000, // 1000 entities per Worker
            useSharedArrayBuffer: true,
            systemConfig: {
                gravity: 9.8,
                timeStep: 1/60
            }
        });
    }
}
```

#### 2. Memory Management

```typescript
class MemoryMonitor {
    public static checkMemoryUsage(): void {
        const used = process.memoryUsage();

        console.log('Memory usage:');
        console.log(`  RSS: ${Math.round(used.rss / 1024 / 1024)} MB`);
        console.log(`  Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
        console.log(`  Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)} MB`);
        console.log(`  External: ${Math.round(used.external / 1024 / 1024)} MB`);

        // Trigger warning when memory usage is too high
        if (used.heapUsed > used.heapTotal * 0.9) {
            console.warn('Memory usage too high, consider optimizing or restarting');
        }
    }
}

// Check memory usage periodically
setInterval(() => {
    MemoryMonitor.checkMemoryUsage();
}, 30000); // Check every 30 seconds
```

#### 3. Server Environment Optimization

```typescript
// Set process title
process.title = 'ecs-game-server';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down server...');
    // Clean up resources
    process.exit(0);
});
```

## Debugging Tips

```typescript
// Check Node.js environment support
const adapter = new NodeAdapter();
console.log('Node.js version:', adapter.version);
console.log('Worker support:', adapter.isWorkerSupported());
console.log('SharedArrayBuffer support:', adapter.isSharedArrayBufferSupported());
console.log('CPU core count:', adapter.getHardwareConcurrency());

// Get detailed configuration
const config = adapter.getPlatformConfig();
console.log('Platform config:', JSON.stringify(config, null, 2));

// System resource monitoring
const deviceInfo = adapter.getDeviceInfo();
console.log('System load:', deviceInfo.loadAverage);
console.log('Network interfaces:', Object.keys(deviceInfo.networkInterfaces!));
```

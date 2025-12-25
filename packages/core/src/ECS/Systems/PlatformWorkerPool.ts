/**
 * @zh 平台适配的 Worker 池管理器
 * @en Platform-adapted Worker Pool Manager
 */

import type { PlatformWorker } from '../../Platform/IPlatformAdapter';

// =============================================================================
// 类型定义 | Type Definitions
// =============================================================================

/**
 * @zh Worker 任务接口
 * @en Worker task interface
 */
interface IWorkerTask {
    /** @zh 任务唯一标识 @en Unique task identifier */
    readonly id: string;
    /** @zh 任务数据 @en Task data */
    readonly data: Record<string, unknown>;
    /** @zh 成功回调 @en Success callback */
    readonly resolve: (result: unknown) => void;
    /** @zh 失败回调 @en Error callback */
    readonly reject: (error: Error) => void;
}

/**
 * @zh Worker 消息数据接口
 * @en Worker message data interface
 */
interface IWorkerMessageData {
    type?: string;
    id?: string;
    error?: string;
    result?: unknown;
    success?: boolean;
}

/**
 * @zh Worker 状态
 * @en Worker state
 */
const enum WorkerState {
    /** @zh 初始化中 @en Initializing */
    Initializing = 0,
    /** @zh 空闲 @en Idle */
    Idle = 1,
    /** @zh 忙碌 @en Busy */
    Busy = 2
}

// =============================================================================
// PlatformWorkerPool
// =============================================================================

/**
 * @zh 平台适配的 Worker 池管理器
 * @en Platform-adapted Worker Pool Manager
 *
 * @zh 管理 Worker 生命周期、任务分发和状态跟踪
 * @en Manages Worker lifecycle, task distribution and state tracking
 */
export class PlatformWorkerPool {
    private readonly workers: PlatformWorker[];
    private readonly workerStates: Map<number, WorkerState> = new Map();
    private readonly pendingTasks: Map<number, IWorkerTask> = new Map();
    private readonly taskQueue: IWorkerTask[] = [];
    private taskCounter = 0;
    private isDestroyed = false;

    /**
     * @zh 创建 Worker 池
     * @en Create Worker pool
     *
     * @param workers - @zh Worker 实例数组 @en Array of Worker instances
     * @param sharedBuffer - @zh 共享内存缓冲区 @en Shared memory buffer
     */
    constructor(
        workers: PlatformWorker[],
        sharedBuffer?: SharedArrayBuffer | null
    ) {
        this.workers = workers;
        this.initializeWorkers(sharedBuffer);
    }

    /**
     * @zh 初始化所有 Worker
     * @en Initialize all Workers
     */
    private initializeWorkers(sharedBuffer?: SharedArrayBuffer | null): void {
        for (let i = 0; i < this.workers.length; i++) {
            const worker = this.workers[i];
            if (!worker) continue;

            // Set initial state
            this.workerStates.set(i, sharedBuffer ? WorkerState.Initializing : WorkerState.Idle);

            // Bind message and error handlers
            worker.onMessage((event) => this.handleMessage(i, event.data));
            worker.onError((error) => this.handleError(i, error));

            // Initialize SharedArrayBuffer if provided
            if (sharedBuffer) {
                worker.postMessage({ type: 'init', sharedBuffer });
            }
        }
    }

    /**
     * @zh 执行 SharedArrayBuffer 任务
     * @en Execute SharedArrayBuffer task
     */
    executeSharedBuffer(data: Record<string, unknown>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isDestroyed) {
                reject(new Error('Worker pool has been destroyed'));
                return;
            }

            const task: IWorkerTask = {
                id: `shared-${++this.taskCounter}`,
                data: { ...data, type: 'shared' },
                resolve: () => resolve(),
                reject
            };

            this.enqueueTask(task);
        });
    }

    /**
     * @zh 执行普通任务
     * @en Execute normal task
     */
    execute<TResult = unknown>(data: Record<string, unknown>): Promise<TResult> {
        return new Promise((resolve, reject) => {
            if (this.isDestroyed) {
                reject(new Error('Worker pool has been destroyed'));
                return;
            }

            const task: IWorkerTask = {
                id: `task-${++this.taskCounter}`,
                data,
                resolve: (result) => resolve(result as TResult),
                reject
            };

            this.enqueueTask(task);
        });
    }

    /**
     * @zh 将任务加入队列
     * @en Enqueue task
     */
    private enqueueTask(task: IWorkerTask): void {
        this.taskQueue.push(task);
        this.dispatchTasks();
    }

    /**
     * @zh 分发任务到空闲 Worker
     * @en Dispatch tasks to idle Workers
     */
    private dispatchTasks(): void {
        while (this.taskQueue.length > 0) {
            const workerIndex = this.findIdleWorker();
            if (workerIndex === -1) break;

            const task = this.taskQueue.shift()!;
            this.assignTask(workerIndex, task);
        }
    }

    /**
     * @zh 查找空闲 Worker
     * @en Find idle Worker
     */
    private findIdleWorker(): number {
        for (let i = 0; i < this.workers.length; i++) {
            if (this.workerStates.get(i) === WorkerState.Idle) {
                return i;
            }
        }
        return -1;
    }

    /**
     * @zh 分配任务给指定 Worker
     * @en Assign task to specified Worker
     */
    private assignTask(workerIndex: number, task: IWorkerTask): void {
        const worker = this.workers[workerIndex];
        if (!worker) return;

        this.workerStates.set(workerIndex, WorkerState.Busy);
        this.pendingTasks.set(workerIndex, task);

        worker.postMessage({
            id: task.id,
            ...task.data
        });
    }

    /**
     * @zh 处理 Worker 消息
     * @en Handle Worker message
     */
    private handleMessage(workerIndex: number, data: IWorkerMessageData): void {
        // Handle initialization response
        if (data.type === 'init') {
            this.workerStates.set(workerIndex, WorkerState.Idle);
            this.dispatchTasks();
            return;
        }

        // Handle task response
        const task = this.pendingTasks.get(workerIndex);
        if (!task) return;

        this.pendingTasks.delete(workerIndex);
        this.workerStates.set(workerIndex, WorkerState.Idle);

        if (data.error) {
            task.reject(new Error(data.error));
        } else {
            task.resolve(data.result);
        }

        this.dispatchTasks();
    }

    /**
     * @zh 处理 Worker 错误
     * @en Handle Worker error
     */
    private handleError(workerIndex: number, error: ErrorEvent): void {
        const task = this.pendingTasks.get(workerIndex);

        if (task) {
            this.pendingTasks.delete(workerIndex);
            this.workerStates.set(workerIndex, WorkerState.Idle);
            task.reject(new Error(error.message));
        }

        this.dispatchTasks();
    }

    /**
     * @zh 获取 Worker 池状态
     * @en Get Worker pool status
     */
    getStatus(): {
        total: number;
        idle: number;
        busy: number;
        initializing: number;
        queuedTasks: number;
    } {
        let idle = 0;
        let busy = 0;
        let initializing = 0;

        for (const state of this.workerStates.values()) {
            switch (state) {
                case WorkerState.Idle:
                    idle++;
                    break;
                case WorkerState.Busy:
                    busy++;
                    break;
                case WorkerState.Initializing:
                    initializing++;
                    break;
            }
        }

        return {
            total: this.workers.length,
            idle,
            busy,
            initializing,
            queuedTasks: this.taskQueue.length
        };
    }

    /**
     * @zh 销毁 Worker 池
     * @en Destroy Worker pool
     */
    destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        // Reject all pending tasks
        for (const task of this.pendingTasks.values()) {
            task.reject(new Error('Worker pool destroyed'));
        }

        // Reject all queued tasks
        for (const task of this.taskQueue) {
            task.reject(new Error('Worker pool destroyed'));
        }

        // Terminate all workers
        for (const worker of this.workers) {
            worker.terminate();
        }

        // Clear state
        this.workers.length = 0;
        this.taskQueue.length = 0;
        this.pendingTasks.clear();
        this.workerStates.clear();
    }
}

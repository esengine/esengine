/**
 * @zh 平台适配的 Worker 池管理器
 * @en Platform-adapted Worker Pool Manager
 */

import type { PlatformWorker } from '../../Platform/IPlatformAdapter';

// =============================================================================
// 常量 | Constants
// =============================================================================

const ERROR_POOL_DESTROYED = 'Worker pool has been destroyed';

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
 * @zh Worker 池状态接口
 * @en Worker pool status interface
 */
export interface IWorkerPoolStatus {
    /** @zh Worker 总数 @en Total number of workers */
    readonly total: number;
    /** @zh 空闲 Worker 数量 @en Number of idle workers */
    readonly idle: number;
    /** @zh 忙碌 Worker 数量 @en Number of busy workers */
    readonly busy: number;
    /** @zh 初始化中的 Worker 数量 @en Number of initializing workers */
    readonly initializing: number;
    /** @zh 队列中等待的任务数 @en Number of queued tasks */
    readonly queuedTasks: number;
}

/**
 * @zh Worker 状态枚举
 * @en Worker state enum
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
    private _isDestroyed = false;

    // =========================================================================
    // 构造函数 | Constructor
    // =========================================================================

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

    // =========================================================================
    // 公共属性 | Public Properties
    // =========================================================================

    /**
     * @zh 池是否已销毁
     * @en Whether the pool has been destroyed
     */
    get isDestroyed(): boolean {
        return this._isDestroyed;
    }

    /**
     * @zh Worker 数量
     * @en Number of workers in the pool
     */
    get workerCount(): number {
        return this.workers.length;
    }

    /**
     * @zh 所有 Worker 是否已就绪（无初始化中的 Worker）
     * @en Whether all workers are ready (no initializing workers)
     */
    get isReady(): boolean {
        if (this._isDestroyed) return false;
        for (const state of this.workerStates.values()) {
            if (state === WorkerState.Initializing) return false;
        }
        return this.workers.length > 0;
    }

    /**
     * @zh 是否有待处理的任务（队列中或执行中）
     * @en Whether there are pending tasks (queued or executing)
     */
    get hasPendingTasks(): boolean {
        return this.taskQueue.length > 0 || this.pendingTasks.size > 0;
    }

    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================

    /**
     * @zh 执行 SharedArrayBuffer 任务
     * @en Execute SharedArrayBuffer task
     *
     * @param data - @zh 任务数据 @en Task data
     * @returns @zh 任务完成的 Promise @en Promise that resolves when task completes
     */
    executeSharedBuffer(data: Record<string, unknown>): Promise<void> {
        return this.createTask<void>(
            `shared-${++this.taskCounter}`,
            { ...data, type: 'shared' },
            () => undefined
        );
    }

    /**
     * @zh 执行普通任务
     * @en Execute normal task
     *
     * @param data - @zh 任务数据 @en Task data
     * @returns @zh 包含任务结果的 Promise @en Promise with task result
     */
    execute<TResult = unknown>(data: Record<string, unknown>): Promise<TResult> {
        return this.createTask<TResult>(
            `task-${++this.taskCounter}`,
            data,
            (result) => result as TResult
        );
    }

    /**
     * @zh 获取 Worker 池状态
     * @en Get Worker pool status
     *
     * @returns @zh 池状态对象 @en Pool status object
     */
    getStatus(): IWorkerPoolStatus {
        const status = { idle: 0, busy: 0, initializing: 0 };

        for (const state of this.workerStates.values()) {
            if (state === WorkerState.Idle) status.idle++;
            else if (state === WorkerState.Busy) status.busy++;
            else if (state === WorkerState.Initializing) status.initializing++;
        }

        return {
            total: this.workers.length,
            ...status,
            queuedTasks: this.taskQueue.length
        };
    }

    /**
     * @zh 销毁 Worker 池，释放所有资源
     * @en Destroy Worker pool and release all resources
     */
    destroy(): void {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        const destroyError = new Error(ERROR_POOL_DESTROYED);

        // Reject all pending and queued tasks
        for (const task of this.pendingTasks.values()) {
            task.reject(destroyError);
        }
        for (const task of this.taskQueue) {
            task.reject(destroyError);
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

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 初始化所有 Worker
     * @en Initialize all Workers
     */
    private initializeWorkers(sharedBuffer?: SharedArrayBuffer | null): void {
        for (let i = 0; i < this.workers.length; i++) {
            const worker = this.workers[i];
            if (!worker) continue;

            this.workerStates.set(i, sharedBuffer ? WorkerState.Initializing : WorkerState.Idle);
            worker.onMessage((event) => this.handleMessage(i, event.data));
            worker.onError((error) => this.handleError(i, error));

            if (sharedBuffer) {
                worker.postMessage({ type: 'init', sharedBuffer });
            }
        }
    }

    /**
     * @zh 创建并入队任务
     * @en Create and enqueue task
     */
    private createTask<T>(
        id: string,
        data: Record<string, unknown>,
        transform: (result: unknown) => T
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (this._isDestroyed) {
                reject(new Error(ERROR_POOL_DESTROYED));
                return;
            }

            this.enqueueTask({
                id,
                data,
                resolve: (result) => resolve(transform(result)),
                reject
            });
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
        if (data.type === 'init') {
            this.workerStates.set(workerIndex, WorkerState.Idle);
            this.dispatchTasks();
            return;
        }

        if (data.error) {
            this.completeTask(workerIndex, new Error(data.error));
        } else {
            this.completeTask(workerIndex, undefined, data.result);
        }
    }

    /**
     * @zh 处理 Worker 错误
     * @en Handle Worker error
     */
    private handleError(workerIndex: number, error: ErrorEvent): void {
        this.completeTask(workerIndex, new Error(error.message));
    }

    /**
     * @zh 完成任务并释放 Worker
     * @en Complete task and release Worker
     */
    private completeTask(workerIndex: number, error?: Error, result?: unknown): void {
        const task = this.pendingTasks.get(workerIndex);
        if (!task) return;

        this.pendingTasks.delete(workerIndex);
        this.workerStates.set(workerIndex, WorkerState.Idle);

        if (error) {
            task.reject(error);
        } else {
            task.resolve(result);
        }

        this.dispatchTasks();
    }
}

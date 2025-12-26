/**
 * @zh 支持 Worker 并行处理的实体系统基类
 * @en Base class for entity systems with Worker parallel processing support
 */

import { Entity } from '../Entity';
import { EntitySystem } from './EntitySystem';
import { Matcher } from '../Utils/Matcher';
import { Time } from '../../Utils/Time';
import { PlatformManager } from '../../Platform/PlatformManager';
import type { IPlatformAdapter, PlatformWorker } from '../../Platform/IPlatformAdapter';
import { getSystemInstanceTypeName } from '../Decorators';
import { PlatformWorkerPool } from './PlatformWorkerPool';

// =============================================================================
// 类型定义 | Type Definitions
// =============================================================================

/**
 * @zh Worker 处理函数类型
 * @en Worker process function type
 *
 * @zh 用户编写的处理逻辑，会被序列化到 Worker 中执行
 * @en User-defined processing logic, serialized and executed in Worker
 */
export type WorkerProcessFunction<T extends Record<string, unknown> = Record<string, unknown>> = (
    entities: T[],
    deltaTime: number,
    config?: unknown
) => T[] | Promise<T[]>;

/**
 * @zh SharedArrayBuffer 处理函数类型
 * @en SharedArrayBuffer process function type
 */
export type SharedArrayBufferProcessFunction = (
    sharedFloatArray: Float32Array,
    startIndex: number,
    endIndex: number,
    deltaTime: number,
    systemConfig?: unknown
) => void;

/**
 * @zh Worker 系统配置接口
 * @en Worker system configuration interface
 */
export interface IWorkerSystemConfig {
    /**
     * @zh 是否启用 Worker 并行处理
     * @en Enable Worker parallel processing
     * @default true
     */
    enableWorker?: boolean;

    /**
     * @zh Worker 数量，默认为 CPU 核心数，自动限制在系统最大值内
     * @en Worker count, defaults to CPU cores, auto-limited to system max
     */
    workerCount?: number;

    /**
     * @zh 每个 Worker 处理的实体数量，用于控制负载分布
     * @en Entities per Worker, for load distribution control
     */
    entitiesPerWorker?: number;

    /**
     * @zh 系统配置数据，会传递给 Worker
     * @en System config data, passed to Worker
     */
    systemConfig?: unknown;

    /**
     * @zh 是否使用 SharedArrayBuffer 优化
     * @en Use SharedArrayBuffer optimization
     */
    useSharedArrayBuffer?: boolean;

    /**
     * @zh 每个实体在 SharedArrayBuffer 中占用的 Float32 数量
     * @en Float32 count per entity in SharedArrayBuffer
     */
    entityDataSize?: number;

    /**
     * @zh 最大实体数量（用于预分配 SharedArrayBuffer）
     * @en Max entities (for SharedArrayBuffer pre-allocation)
     * @default 10000
     */
    maxEntities?: number;

    /**
     * @zh 预编译 Worker 脚本路径（微信小游戏等不支持动态脚本的平台必需）
     * @en Pre-compiled Worker script path (required for platforms like WeChat Mini Game)
     *
     * @example
     * ```typescript
     * // 微信小游戏使用方式：
     * workerScriptPath: 'workers/physics-worker.js'
     * ```
     */
    workerScriptPath?: string;
}

/**
 * @zh 内部使用的完整配置类型
 * @en Internal complete config type
 */
type ResolvedConfig = Required<Omit<IWorkerSystemConfig, 'systemConfig' | 'entitiesPerWorker' | 'workerScriptPath'>> & {
    systemConfig?: unknown;
    entitiesPerWorker?: number;
    workerScriptPath?: string;
};

/**
 * @zh 处理模式
 * @en Processing mode
 */
export type ProcessingMode = 'shared-buffer' | 'worker' | 'sync';

// =============================================================================
// WorkerEntitySystem
// =============================================================================

/**
 * @zh 支持 Worker 并行处理的 EntitySystem 基类
 * @en Base EntitySystem class with Worker parallel processing support
 *
 * @zh 支持传统 Worker 和 SharedArrayBuffer 两种优化模式：
 * - 传统模式：数据序列化传输，适用于复杂计算
 * - SharedArrayBuffer 模式：零拷贝数据共享，适用于大量简单计算
 *
 * @en Supports two optimization modes:
 * - Traditional mode: Data serialization, for complex calculations
 * - SharedArrayBuffer mode: Zero-copy sharing, for many simple calculations
 *
 * @example
 * ```typescript
 * class PhysicsSystem extends WorkerEntitySystem<PhysicsData> {
 *     constructor() {
 *         super(Matcher.all(Transform, Velocity), {
 *             enableWorker: true,
 *             workerCount: 8,
 *             systemConfig: { gravity: 100 }
 *         });
 *     }
 *
 *     protected getDefaultEntityDataSize(): number {
 *         return 6; // x, y, vx, vy, radius, mass
 *     }
 *
 *     protected extractEntityData(entity: Entity): PhysicsData {
 *         // Extract component data
 *     }
 *
 *     protected workerProcess(entities: PhysicsData[], deltaTime: number, config: unknown): PhysicsData[] {
 *         // Pure function executed in Worker
 *     }
 *
 *     protected applyResult(entity: Entity, result: PhysicsData): void {
 *         // Apply result back to components
 *     }
 * }
 * ```
 */
export abstract class WorkerEntitySystem<TEntityData = unknown> extends EntitySystem {
    // =========================================================================
    // 成员变量 | Member Variables
    // =========================================================================

    protected config: ResolvedConfig;
    protected sharedBuffer: SharedArrayBuffer | null = null;
    protected sharedFloatArray: Float32Array | null = null;

    private workerPool: PlatformWorkerPool | null = null;
    private isProcessing = false;
    private hasLoggedSyncMode = false;
    private readonly platformAdapter: IPlatformAdapter;

    // =========================================================================
    // 构造函数 | Constructor
    // =========================================================================

    constructor(matcher?: Matcher, config: IWorkerSystemConfig = {}) {
        super(matcher);

        this.platformAdapter = PlatformManager.getInstance().getAdapter();
        this.config = this.resolveConfig(config);

        if (this.config.enableWorker && this.isWorkerSupported()) {
            this.initializeWorkerSystem();
        }
    }

    // =========================================================================
    // 配置解析 | Config Resolution
    // =========================================================================

    /**
     * @zh 解析并验证配置
     * @en Resolve and validate config
     */
    private resolveConfig(config: IWorkerSystemConfig): ResolvedConfig {
        const maxWorkerCount = this.getMaxSystemWorkerCount();
        const requestedWorkerCount = config.workerCount ?? maxWorkerCount;
        const validatedWorkerCount = Math.min(requestedWorkerCount, maxWorkerCount);

        if (requestedWorkerCount > maxWorkerCount) {
            this.logger.warn(
                `请求 ${requestedWorkerCount} 个 Worker，但系统最多支持 ${maxWorkerCount} 个。` +
                `实际使用 ${validatedWorkerCount} 个 Worker。`
            );
        }

        return {
            enableWorker: config.enableWorker ?? true,
            workerCount: validatedWorkerCount,
            useSharedArrayBuffer: config.useSharedArrayBuffer ?? this.isSharedArrayBufferSupported(),
            entityDataSize: config.entityDataSize ?? this.getDefaultEntityDataSize(),
            maxEntities: config.maxEntities ?? 10000,
            systemConfig: config.systemConfig,
            ...(config.entitiesPerWorker !== undefined && { entitiesPerWorker: config.entitiesPerWorker }),
            ...(config.workerScriptPath !== undefined && { workerScriptPath: config.workerScriptPath })
        };
    }

    // =========================================================================
    // 平台能力检测 | Platform Capability Detection
    // =========================================================================

    /**
     * @zh 检查是否支持 Worker
     * @en Check Worker support
     */
    private isWorkerSupported(): boolean {
        return this.platformAdapter.isWorkerSupported();
    }

    /**
     * @zh 检查是否支持 SharedArrayBuffer
     * @en Check SharedArrayBuffer support
     */
    private isSharedArrayBufferSupported(): boolean {
        return this.platformAdapter.isSharedArrayBufferSupported();
    }

    /**
     * @zh 获取系统支持的最大 Worker 数量
     * @en Get max Worker count supported by system
     */
    private getMaxSystemWorkerCount(): number {
        return this.platformAdapter.getPlatformConfig().maxWorkerCount;
    }

    // =========================================================================
    // 初始化 | Initialization
    // =========================================================================

    /**
     * @zh 初始化 Worker 系统
     * @en Initialize Worker system
     */
    private initializeWorkerSystem(): void {
        if (this.config.useSharedArrayBuffer) {
            this.initializeSharedArrayBuffer();
        }
        this.initializeWorkerPool();
    }

    /**
     * @zh 初始化 SharedArrayBuffer
     * @en Initialize SharedArrayBuffer
     */
    private initializeSharedArrayBuffer(): void {
        try {
            if (!this.isSharedArrayBufferSupported()) {
                this.fallbackToSingleWorker('平台不支持 SharedArrayBuffer');
                return;
            }

            const bufferSize = this.config.maxEntities * this.config.entityDataSize * 4;
            this.sharedBuffer = this.platformAdapter.createSharedArrayBuffer(bufferSize);

            if (this.sharedBuffer) {
                this.sharedFloatArray = new Float32Array(this.sharedBuffer);
                this.logger.info(`${this.systemName}: SharedArrayBuffer 初始化成功 (${bufferSize} bytes)`);
            }
        } catch (error) {
            this.fallbackToSingleWorker('SharedArrayBuffer 初始化失败');
            this.logger.warn(`${this.systemName}:`, error);
        }
    }

    /**
     * @zh 降级到单 Worker 模式
     * @en Fallback to single Worker mode
     */
    private fallbackToSingleWorker(reason: string): void {
        this.logger.warn(`${this.systemName}: ${reason}，降级到单 Worker 模式`);
        this.config.useSharedArrayBuffer = false;
        this.config.workerCount = 1;
        this.sharedBuffer = null;
        this.sharedFloatArray = null;
    }

    /**
     * @zh 初始化 Worker 池
     * @en Initialize Worker pool
     */
    private initializeWorkerPool(): void {
        try {
            const scriptOrPath = this.resolveWorkerScript();
            if (!scriptOrPath) {
                this.config.enableWorker = false;
                return;
            }

            const workers = this.createWorkers(scriptOrPath);
            this.workerPool = new PlatformWorkerPool(workers, this.sharedBuffer);
        } catch (error) {
            this.logger.error(`${this.systemName}: Worker 池初始化失败`, error);
            this.config.enableWorker = false;
        }
    }

    /**
     * @zh 解析 Worker 脚本
     * @en Resolve Worker script
     */
    private resolveWorkerScript(): string | null {
        const platformConfig = this.platformAdapter.getPlatformConfig();

        // External script path (WeChat Mini Game, etc.)
        if (this.config.workerScriptPath) {
            this.logger.info(`${this.systemName}: 使用外部 Worker 文件: ${this.config.workerScriptPath}`);
            return this.config.workerScriptPath;
        }

        // Platform doesn't support dynamic scripts
        if (platformConfig.limitations?.noEval) {
            this.logger.error(
                `${this.systemName}: 当前平台不支持动态 Worker 脚本，` +
                `请配置 workerScriptPath 指定预编译的 Worker 文件`
            );
            return null;
        }

        // Dynamic script (browsers, etc.)
        const script = this.createWorkerScript();
        return (platformConfig.workerScriptPrefix || '') + script;
    }

    /**
     * @zh 创建 Worker 实例数组
     * @en Create Worker instance array
     */
    private createWorkers(scriptOrPath: string): PlatformWorker[] {
        const workers: PlatformWorker[] = [];

        for (let i = 0; i < this.config.workerCount; i++) {
            const worker = this.platformAdapter.createWorker(scriptOrPath, {
                name: `${this.systemName}-Worker-${i}`
            });
            workers.push(worker);
        }

        return workers;
    }

    /**
     * @zh 创建 Worker 脚本
     * @en Create Worker script
     */
    private createWorkerScript(): string {
        const functionBody = this.extractFunctionBody(this.workerProcess.toString());
        const sharedProcessBody = this.getSharedProcessFunctionBody();
        const entityDataSize = this.config.entityDataSize;

        return `
            let sharedFloatArray = null;
            const ENTITY_DATA_SIZE = ${entityDataSize};

            self.onmessage = function(e) {
                const { type, id, entities, deltaTime, systemConfig, startIndex, endIndex, sharedBuffer } = e.data;

                try {
                    if (type === 'init' && sharedBuffer) {
                        sharedFloatArray = new Float32Array(sharedBuffer);
                        self.postMessage({ type: 'init', success: true });
                        return;
                    }

                    if (type === 'shared') {
                        if (!sharedFloatArray) {
                            self.postMessage({ id, error: 'SharedArrayBuffer not initialized' });
                            return;
                        }
                        processSharedArrayBuffer(startIndex, endIndex, deltaTime, systemConfig);
                        self.postMessage({ id, result: null });
                        return;
                    }

                    if (entities) {
                        function workerProcess(entities, deltaTime, systemConfig) {
                            ${functionBody}
                        }

                        const result = workerProcess(entities, deltaTime, systemConfig);

                        if (result && typeof result.then === 'function') {
                            result.then(finalResult => {
                                self.postMessage({ id, result: finalResult });
                            }).catch(error => {
                                self.postMessage({ id, error: error.message });
                            });
                        } else {
                            self.postMessage({ id, result });
                        }
                    }
                } catch (error) {
                    self.postMessage({ id, error: error.message });
                }
            };

            function processSharedArrayBuffer(startIndex, endIndex, deltaTime, systemConfig) {
                if (!sharedFloatArray) return;
                ${sharedProcessBody}
            }
        `;
    }

    /**
     * @zh 提取函数体
     * @en Extract function body
     */
    private extractFunctionBody(methodStr: string): string {
        const match = methodStr.match(/\{([\s\S]*)\}/);
        if (!match || match[1] === undefined) {
            throw new Error('无法解析 workerProcess 方法');
        }
        return match[1];
    }

    /**
     * @zh 获取 SharedArrayBuffer 处理函数体
     * @en Get SharedArrayBuffer process function body
     */
    private getSharedProcessFunctionBody(): string {
        const processFunc = this.getSharedArrayBufferProcessFunction?.();
        if (!processFunc) return '';

        const body = this.extractFunctionBody(processFunc.toString());
        return `
            const userProcessFunction = function(sharedFloatArray, startIndex, endIndex, deltaTime, systemConfig) {
                ${body}
            };
            userProcessFunction(sharedFloatArray, startIndex, endIndex, deltaTime, systemConfig);
        `;
    }

    // =========================================================================
    // 处理逻辑 | Processing Logic
    // =========================================================================

    /**
     * @zh 重写 process 方法，支持 Worker 并行处理
     * @en Override process method with Worker parallel processing
     */
    protected override process(entities: readonly Entity[]): void {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const mode = this.getCurrentProcessingMode();

        try {
            switch (mode) {
                case 'shared-buffer':
                    this.processWithSharedArrayBuffer(entities).finally(() => {
                        this.isProcessing = false;
                    });
                    break;

                case 'worker':
                    this.processWithWorker(entities).finally(() => {
                        this.isProcessing = false;
                    });
                    break;

                case 'sync':
                default:
                    this.processSynchronously(entities);
                    this.isProcessing = false;
                    break;
            }
        } catch (error) {
            this.isProcessing = false;
            this.logger.error(`${this.systemName}: 处理失败`, error);
            throw error;
        }
    }

    /**
     * @zh 获取当前处理模式
     * @en Get current processing mode
     */
    private getCurrentProcessingMode(): ProcessingMode {
        if (!this.config.enableWorker || !this.workerPool) {
            if (!this.hasLoggedSyncMode) {
                this.logger.info(`${this.systemName}: Worker 不可用，使用同步处理`);
                this.hasLoggedSyncMode = true;
            }
            return 'sync';
        }

        if (this.config.useSharedArrayBuffer && this.sharedFloatArray) {
            return 'shared-buffer';
        }

        return 'worker';
    }

    /**
     * @zh 使用 SharedArrayBuffer 优化的 Worker 处理
     * @en Worker processing with SharedArrayBuffer optimization
     */
    private async processWithSharedArrayBuffer(entities: readonly Entity[]): Promise<void> {
        if (!this.sharedFloatArray || !this.workerPool) return;

        this.writeEntitiesToBuffer(entities);

        const tasks = this.createBatchTasks(entities.length, true);
        await Promise.all(tasks);

        this.readResultsFromBuffer(entities);
    }

    /**
     * @zh 使用 Worker 并行处理
     * @en Worker parallel processing
     */
    private async processWithWorker(entities: readonly Entity[]): Promise<void> {
        if (!this.workerPool) return;

        const entityData = entities.map(entity => this.extractEntityData(entity));
        const batches = this.createDataBatches(entityData);
        const deltaTime = Time.deltaTime;

        const results = await Promise.all(
            batches.map(batch =>
                this.workerPool!.execute<TEntityData[]>({
                    entities: batch,
                    deltaTime,
                    systemConfig: this.config.systemConfig
                })
            )
        );

        this.applyBatchResults(entities, results);
    }

    /**
     * @zh 同步处理（fallback）
     * @en Synchronous processing (fallback)
     */
    private processSynchronously(entities: readonly Entity[]): void {
        const entityData = entities.map(entity => this.extractEntityData(entity));
        const deltaTime = Time.deltaTime;
        const results = this.workerProcess(entityData, deltaTime, this.config.systemConfig);

        if (results && typeof (results as Promise<TEntityData[]>).then === 'function') {
            (results as Promise<TEntityData[]>).then(finalResults => {
                this.applyResults(entities, finalResults);
            });
        } else {
            this.applyResults(entities, results as TEntityData[]);
        }
    }

    // =========================================================================
    // 批次处理 | Batch Processing
    // =========================================================================

    /**
     * @zh 创建数据批次
     * @en Create data batches
     */
    private createDataBatches<T>(data: T[]): T[][] {
        return this.splitIntoBatches(
            data.length,
            (start, end) => data.slice(start, end)
        );
    }

    /**
     * @zh 创建批次任务
     * @en Create batch tasks
     */
    private createBatchTasks(entityCount: number, useSharedBuffer: boolean): Promise<void>[] {
        return this.splitIntoBatches(
            entityCount,
            (startIndex, endIndex) => {
                if (useSharedBuffer) {
                    return this.workerPool!.executeSharedBuffer({
                        startIndex,
                        endIndex,
                        deltaTime: Time.deltaTime,
                        systemConfig: this.config.systemConfig
                    });
                }
                return Promise.resolve();
            }
        );
    }

    /**
     * @zh 通用批次分割逻辑
     * @en Generic batch splitting logic
     */
    private splitIntoBatches<T>(
        totalCount: number,
        createBatch: (start: number, end: number) => T
    ): T[] {
        const batches: T[] = [];
        const { workerCount, entitiesPerWorker } = this.config;

        if (entitiesPerWorker) {
            for (let i = 0; i < totalCount; i += entitiesPerWorker) {
                const end = Math.min(i + entitiesPerWorker, totalCount);
                batches.push(createBatch(i, end));
            }
        } else {
            const batchSize = Math.ceil(totalCount / workerCount);
            for (let i = 0; i < workerCount; i++) {
                const start = i * batchSize;
                const end = Math.min(start + batchSize, totalCount);
                if (start < totalCount) {
                    batches.push(createBatch(start, end));
                }
            }
        }

        return batches;
    }

    // =========================================================================
    // 结果应用 | Result Application
    // =========================================================================

    /**
     * @zh 应用批次结果
     * @en Apply batch results
     */
    private applyBatchResults(entities: readonly Entity[], batchResults: TEntityData[][]): void {
        let entityIndex = 0;

        for (const batchResult of batchResults) {
            for (const result of batchResult) {
                if (entityIndex < entities.length && result) {
                    this.applyResult(entities[entityIndex]!, result);
                }
                entityIndex++;
            }
        }
    }

    /**
     * @zh 应用结果数组
     * @en Apply results array
     */
    private applyResults(entities: readonly Entity[], results: TEntityData[]): void {
        for (let i = 0; i < entities.length && i < results.length; i++) {
            this.applyResult(entities[i]!, results[i]!);
        }
    }

    // =========================================================================
    // SharedArrayBuffer 操作 | SharedArrayBuffer Operations
    // =========================================================================

    /**
     * @zh 将实体数据写入 SharedArrayBuffer
     * @en Write entity data to SharedArrayBuffer
     */
    private writeEntitiesToBuffer(entities: readonly Entity[]): void {
        if (!this.sharedFloatArray) return;

        const count = Math.min(entities.length, this.config.maxEntities);

        for (let i = 0; i < count; i++) {
            const data = this.extractEntityData(entities[i]!);
            const offset = i * this.config.entityDataSize;
            this.writeEntityToBuffer(data, offset);
        }
    }

    /**
     * @zh 从 SharedArrayBuffer 读取结果并应用
     * @en Read results from SharedArrayBuffer and apply
     */
    private readResultsFromBuffer(entities: readonly Entity[]): void {
        if (!this.sharedFloatArray) return;

        const count = Math.min(entities.length, this.config.maxEntities);

        for (let i = 0; i < count; i++) {
            const offset = i * this.config.entityDataSize;
            const result = this.readEntityFromBuffer(offset);

            if (result) {
                this.applyResult(entities[i]!, result);
            }
        }
    }

    // =========================================================================
    // 配置更新 | Config Update
    // =========================================================================

    /**
     * @zh 更新 Worker 配置
     * @en Update Worker config
     */
    public updateConfig(newConfig: Partial<IWorkerSystemConfig>): void {
        const oldConfig = { ...this.config };

        if (newConfig.workerCount !== undefined) {
            const maxCount = this.getMaxSystemWorkerCount();
            const validated = Math.min(newConfig.workerCount, maxCount);

            if (newConfig.workerCount > maxCount) {
                this.logger.warn(
                    `请求 ${newConfig.workerCount} 个 Worker，但系统最多支持 ${maxCount} 个。` +
                    `实际使用 ${validated} 个 Worker。`
                );
            }
            newConfig.workerCount = validated;
        }

        Object.assign(this.config, newConfig);

        if (oldConfig.useSharedArrayBuffer !== this.config.useSharedArrayBuffer) {
            this.reinitializeSystem();
        } else if (oldConfig.workerCount !== this.config.workerCount) {
            this.reinitializeWorkerPool();
        } else if (!this.config.enableWorker && this.workerPool) {
            this.destroyWorkerPool();
        } else if (this.config.enableWorker && !this.workerPool && this.isWorkerSupported()) {
            this.initializeWorkerPool();
        }
    }

    /**
     * @zh 重新初始化整个系统
     * @en Reinitialize entire system
     */
    private reinitializeSystem(): void {
        this.destroyWorkerPool();
        this.sharedBuffer = null;
        this.sharedFloatArray = null;

        if (!this.config.useSharedArrayBuffer) {
            this.config.workerCount = 1;
        }

        if (this.config.enableWorker && this.isWorkerSupported()) {
            this.initializeWorkerSystem();
        }
    }

    /**
     * @zh 重新初始化 Worker 池
     * @en Reinitialize Worker pool
     */
    private reinitializeWorkerPool(): void {
        this.destroyWorkerPool();

        if (this.config.enableWorker && this.isWorkerSupported()) {
            this.initializeWorkerPool();
        }
    }

    /**
     * @zh 销毁 Worker 池
     * @en Destroy Worker pool
     */
    private destroyWorkerPool(): void {
        if (this.workerPool) {
            this.workerPool.destroy();
            this.workerPool = null;
        }
    }

    // =========================================================================
    // 公共 API | Public API
    // =========================================================================

    /**
     * @zh 获取 Worker 系统信息
     * @en Get Worker system info
     */
    public getWorkerInfo(): {
        enabled: boolean;
        workerCount: number;
        entitiesPerWorker?: number;
        maxSystemWorkerCount: number;
        isProcessing: boolean;
        sharedArrayBufferSupported: boolean;
        sharedArrayBufferEnabled: boolean;
        currentMode: ProcessingMode;
    } {
        return {
            enabled: this.config.enableWorker,
            workerCount: this.config.workerCount,
            ...(this.config.entitiesPerWorker !== undefined && { entitiesPerWorker: this.config.entitiesPerWorker }),
            maxSystemWorkerCount: this.getMaxSystemWorkerCount(),
            isProcessing: this.isProcessing,
            sharedArrayBufferSupported: this.isSharedArrayBufferSupported(),
            sharedArrayBufferEnabled: this.config.useSharedArrayBuffer,
            currentMode: this.getCurrentProcessingMode()
        };
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 销毁系统时清理资源
     * @en Clean up resources on destroy
     */
    protected override onDestroy(): void {
        super.onDestroy();
        this.destroyWorkerPool();
    }

    protected override getLoggerName(): string {
        return getSystemInstanceTypeName(this);
    }

    // =========================================================================
    // 抽象方法 | Abstract Methods
    // =========================================================================

    /**
     * @zh 获取实体数据大小 - 子类必须实现
     * @en Get entity data size - subclass must implement
     *
     * @zh 返回每个实体在 SharedArrayBuffer 中占用的 Float32 数量
     * @en Returns Float32 count per entity in SharedArrayBuffer
     */
    protected abstract getDefaultEntityDataSize(): number;

    /**
     * @zh 将单个实体数据写入 SharedArrayBuffer - 子类必须实现
     * @en Write single entity data to SharedArrayBuffer - subclass must implement
     */
    protected abstract writeEntityToBuffer(entityData: TEntityData, offset: number): void;

    /**
     * @zh 从 SharedArrayBuffer 读取单个实体数据 - 子类必须实现
     * @en Read single entity data from SharedArrayBuffer - subclass must implement
     */
    protected abstract readEntityFromBuffer(offset: number): TEntityData | null;

    /**
     * @zh 提取实体数据 - 子类必须实现
     * @en Extract entity data - subclass must implement
     */
    protected abstract extractEntityData(entity: Entity): TEntityData;

    /**
     * @zh Worker 处理函数 - 子类必须实现（必须是纯函数）
     * @en Worker process function - subclass must implement (must be pure function)
     */
    protected abstract workerProcess(
        entities: TEntityData[],
        deltaTime: number,
        systemConfig?: unknown
    ): TEntityData[] | Promise<TEntityData[]>;

    /**
     * @zh 应用处理结果 - 子类必须实现
     * @en Apply result - subclass must implement
     */
    protected abstract applyResult(entity: Entity, result: TEntityData): void;

    /**
     * @zh 获取 SharedArrayBuffer 处理函数 - 子类可选实现
     * @en Get SharedArrayBuffer process function - optional for subclass
     */
    protected getSharedArrayBufferProcessFunction?(): SharedArrayBufferProcessFunction;
}

// =============================================================================
// 类型导出（向后兼容）| Type Exports (Backward Compatibility)
// =============================================================================

/**
 * @deprecated Use IWorkerSystemConfig instead
 */
export type WorkerSystemConfig = IWorkerSystemConfig;

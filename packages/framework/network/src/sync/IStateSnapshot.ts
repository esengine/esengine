/**
 * @zh 状态快照接口
 * @en State Snapshot Interface
 *
 * @zh 提供网络同步的状态快照抽象
 * @en Provides state snapshot abstraction for network synchronization
 */

// =============================================================================
// 快照接口 | Snapshot Interface
// =============================================================================

/**
 * @zh 带时间戳的状态快照
 * @en Timestamped state snapshot
 */
export interface IStateSnapshot<T> {
    /**
     * @zh 服务器时间戳（毫秒）
     * @en Server timestamp in milliseconds
     */
    readonly timestamp: number;

    /**
     * @zh 状态数据
     * @en State data
     */
    readonly state: T;
}

/**
 * @zh 变换状态
 * @en Transform state
 */
export interface ITransformState {
    /**
     * @zh X 坐标
     * @en X coordinate
     */
    x: number;

    /**
     * @zh Y 坐标
     * @en Y coordinate
     */
    y: number;

    /**
     * @zh 旋转角度（弧度）
     * @en Rotation angle in radians
     */
    rotation: number;
}

/**
 * @zh 带速度的变换状态
 * @en Transform state with velocity
 */
export interface ITransformStateWithVelocity extends ITransformState {
    /**
     * @zh X 速度
     * @en X velocity
     */
    velocityX: number;

    /**
     * @zh Y 速度
     * @en Y velocity
     */
    velocityY: number;

    /**
     * @zh 角速度
     * @en Angular velocity
     */
    angularVelocity: number;
}

// =============================================================================
// 快照缓冲区接口 | Snapshot Buffer Interface
// =============================================================================

/**
 * @zh 快照缓冲区配置
 * @en Snapshot buffer configuration
 */
export interface ISnapshotBufferConfig {
    /**
     * @zh 缓冲区最大大小
     * @en Maximum buffer size
     */
    maxSize: number;

    /**
     * @zh 插值延迟（毫秒）
     * @en Interpolation delay in milliseconds
     */
    interpolationDelay: number;
}

/**
 * @zh 快照缓冲区接口
 * @en Snapshot buffer interface
 */
export interface ISnapshotBuffer<T> {
    /**
     * @zh 添加快照
     * @en Add snapshot
     */
    push(snapshot: IStateSnapshot<T>): void;

    /**
     * @zh 获取用于插值的两个快照
     * @en Get two snapshots for interpolation
     *
     * @param renderTime - @zh 渲染时间 @en Render time
     * @returns @zh [前一个快照, 后一个快照, 插值因子] 或 null @en [previous, next, factor] or null
     */
    getInterpolationSnapshots(renderTime: number): [IStateSnapshot<T>, IStateSnapshot<T>, number] | null;

    /**
     * @zh 获取最新快照
     * @en Get latest snapshot
     */
    getLatest(): IStateSnapshot<T> | null;

    /**
     * @zh 获取缓冲区大小
     * @en Get buffer size
     */
    readonly size: number;

    /**
     * @zh 清空缓冲区
     * @en Clear buffer
     */
    clear(): void;
}

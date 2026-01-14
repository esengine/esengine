/**
 * @zh 增量寻路系统接口
 * @en Incremental Pathfinding System Interfaces
 */

import type { IPoint, IPathResult, IPathfindingOptions, IPathfindingMap } from './IPathfinding';

// =============================================================================
// 状态枚举 | State Enum
// =============================================================================

/**
 * @zh 增量寻路状态
 * @en Incremental pathfinding state
 */
export enum PathfindingState {
    /** @zh 空闲，等待请求 @en Idle, waiting for request */
    Idle = 'idle',
    /** @zh 正在搜索中 @en Search in progress */
    InProgress = 'in_progress',
    /** @zh 已暂停 @en Paused */
    Paused = 'paused',
    /** @zh 搜索完成，找到路径 @en Completed, path found */
    Completed = 'completed',
    /** @zh 搜索失败，无法找到路径 @en Failed, no path found */
    Failed = 'failed',
    /** @zh 已取消 @en Cancelled */
    Cancelled = 'cancelled'
}

// =============================================================================
// 请求和进度接口 | Request and Progress Interfaces
// =============================================================================

/**
 * @zh 增量寻路请求
 * @en Incremental pathfinding request
 */
export interface IPathRequest {
    /**
     * @zh 请求唯一标识符
     * @en Unique request identifier
     */
    readonly id: number;

    /**
     * @zh 起点 X 坐标
     * @en Start X coordinate
     */
    readonly startX: number;

    /**
     * @zh 起点 Y 坐标
     * @en Start Y coordinate
     */
    readonly startY: number;

    /**
     * @zh 终点 X 坐标
     * @en End X coordinate
     */
    readonly endX: number;

    /**
     * @zh 终点 Y 坐标
     * @en End Y coordinate
     */
    readonly endY: number;

    /**
     * @zh 寻路配置选项
     * @en Pathfinding options
     */
    readonly options?: IPathfindingOptions;

    /**
     * @zh 优先级（数值越小优先级越高）
     * @en Priority (lower number = higher priority)
     */
    readonly priority: number;

    /**
     * @zh 创建时间戳
     * @en Creation timestamp
     */
    readonly createdAt: number;
}

/**
 * @zh 增量寻路进度
 * @en Incremental pathfinding progress
 */
export interface IPathProgress {
    /**
     * @zh 当前寻路状态
     * @en Current pathfinding state
     */
    readonly state: PathfindingState;

    /**
     * @zh 已搜索的节点数量
     * @en Number of nodes searched
     */
    readonly nodesSearched: number;

    /**
     * @zh 开放列表当前大小
     * @en Current open list size
     */
    readonly openListSize: number;

    /**
     * @zh 估计的搜索进度 (0-1)
     * @en Estimated search progress (0-1)
     */
    readonly estimatedProgress: number;

    /**
     * @zh 当前最佳部分路径（可选）
     * @en Current best partial path (optional)
     */
    readonly partialPath?: readonly IPoint[];
}

/**
 * @zh 增量寻路结果（扩展自 IPathResult）
 * @en Incremental pathfinding result (extends IPathResult)
 */
export interface IIncrementalPathResult extends IPathResult {
    /**
     * @zh 关联的请求 ID
     * @en Associated request ID
     */
    readonly requestId: number;

    /**
     * @zh 完成搜索所用的帧数
     * @en Number of frames used to complete search
     */
    readonly framesUsed: number;

    /**
     * @zh 是否为部分路径（未到达终点）
     * @en Whether this is a partial path (not reaching goal)
     */
    readonly isPartial: boolean;
}

// =============================================================================
// 增量寻路器接口 | Incremental Pathfinder Interface
// =============================================================================

/**
 * @zh 增量寻路请求选项
 * @en Incremental pathfinding request options
 */
export interface IIncrementalPathfindingOptions extends IPathfindingOptions {
    /**
     * @zh 优先级（数值越小优先级越高，默认 50）
     * @en Priority (lower = higher, default 50)
     */
    priority?: number;
}

/**
 * @zh 增量寻路器接口
 * @en Incremental pathfinder interface
 *
 * @zh 支持时间切片的寻路器，可跨多帧执行搜索
 * @en Pathfinder with time slicing support, can execute search across multiple frames
 */
export interface IIncrementalPathfinder {
    /**
     * @zh 请求寻路（非阻塞）
     * @en Request pathfinding (non-blocking)
     *
     * @param startX - @zh 起点 X 坐标 @en Start X coordinate
     * @param startY - @zh 起点 Y 坐标 @en Start Y coordinate
     * @param endX - @zh 终点 X 坐标 @en End X coordinate
     * @param endY - @zh 终点 Y 坐标 @en End Y coordinate
     * @param options - @zh 寻路选项 @en Pathfinding options
     * @returns @zh 寻路请求对象 @en Path request object
     */
    requestPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IIncrementalPathfindingOptions
    ): IPathRequest;

    /**
     * @zh 执行一步搜索
     * @en Execute one step of search
     *
     * @param requestId - @zh 请求 ID @en Request ID
     * @param maxIterations - @zh 本步最大迭代次数 @en Maximum iterations this step
     * @returns @zh 当前进度 @en Current progress
     */
    step(requestId: number, maxIterations: number): IPathProgress;

    /**
     * @zh 暂停寻路
     * @en Pause pathfinding
     *
     * @param requestId - @zh 请求 ID @en Request ID
     */
    pause(requestId: number): void;

    /**
     * @zh 恢复寻路
     * @en Resume pathfinding
     *
     * @param requestId - @zh 请求 ID @en Request ID
     */
    resume(requestId: number): void;

    /**
     * @zh 取消寻路
     * @en Cancel pathfinding
     *
     * @param requestId - @zh 请求 ID @en Request ID
     */
    cancel(requestId: number): void;

    /**
     * @zh 获取寻路结果（仅当状态为 Completed 或 Failed 时可用）
     * @en Get pathfinding result (only available when state is Completed or Failed)
     *
     * @param requestId - @zh 请求 ID @en Request ID
     * @returns @zh 寻路结果或 null @en Path result or null
     */
    getResult(requestId: number): IIncrementalPathResult | null;

    /**
     * @zh 获取当前进度
     * @en Get current progress
     *
     * @param requestId - @zh 请求 ID @en Request ID
     * @returns @zh 当前进度或 null @en Current progress or null
     */
    getProgress(requestId: number): IPathProgress | null;

    /**
     * @zh 清理已完成的请求（释放内存）
     * @en Clean up completed request (release memory)
     *
     * @param requestId - @zh 请求 ID @en Request ID
     */
    cleanup(requestId: number): void;

    /**
     * @zh 通知障碍物变化（用于动态重规划）
     * @en Notify obstacle change (for dynamic replanning)
     *
     * @param minX - @zh 变化区域最小 X @en Changed area min X
     * @param minY - @zh 变化区域最小 Y @en Changed area min Y
     * @param maxX - @zh 变化区域最大 X @en Changed area max X
     * @param maxY - @zh 变化区域最大 Y @en Changed area max Y
     */
    notifyObstacleChange(
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ): void;

    /**
     * @zh 清理所有请求
     * @en Clear all requests
     */
    clear(): void;
}

// =============================================================================
// 路径验证接口 | Path Validation Interface
// =============================================================================

/**
 * @zh 路径验证结果
 * @en Path validation result
 */
export interface IPathValidationResult {
    /**
     * @zh 路径是否有效
     * @en Whether the path is valid
     */
    readonly valid: boolean;

    /**
     * @zh 第一个无效点的索引（-1 表示全部有效）
     * @en Index of first invalid point (-1 if all valid)
     */
    readonly invalidIndex: number;
}

/**
 * @zh 路径验证器接口
 * @en Path validator interface
 */
export interface IPathValidator {
    /**
     * @zh 验证路径段的有效性
     * @en Validate path segment validity
     *
     * @param path - @zh 要验证的路径 @en Path to validate
     * @param fromIndex - @zh 起始索引 @en Start index
     * @param toIndex - @zh 结束索引 @en End index
     * @param map - @zh 地图实例 @en Map instance
     * @returns @zh 验证结果 @en Validation result
     */
    validatePath(
        path: readonly IPoint[],
        fromIndex: number,
        toIndex: number,
        map: IPathfindingMap
    ): IPathValidationResult;
}

// =============================================================================
// 动态重规划配置 | Dynamic Replanning Configuration
// =============================================================================

/**
 * @zh 动态重规划配置
 * @en Dynamic replanning configuration
 */
export interface IReplanningConfig {
    /**
     * @zh 是否启用动态重规划
     * @en Whether dynamic replanning is enabled
     */
    enabled: boolean;

    /**
     * @zh 路径检查间隔（帧数）
     * @en Path check interval (in frames)
     */
    checkInterval: number;

    /**
     * @zh 触发重规划的距离阈值
     * @en Distance threshold to trigger replanning
     */
    distanceThreshold: number;

    /**
     * @zh 向前探测的距离（路径点数）
     * @en Lookahead distance (in path points)
     */
    lookaheadDistance: number;
}

/**
 * @zh 默认重规划配置
 * @en Default replanning configuration
 */
export const DEFAULT_REPLANNING_CONFIG: IReplanningConfig = {
    enabled: true,
    checkInterval: 10,
    distanceThreshold: 2,
    lookaheadDistance: 5
};

// =============================================================================
// 空进度常量 | Empty Progress Constant
// =============================================================================

/**
 * @zh 空进度（用于无效请求）
 * @en Empty progress (for invalid requests)
 */
export const EMPTY_PROGRESS: IPathProgress = {
    state: PathfindingState.Idle,
    nodesSearched: 0,
    openListSize: 0,
    estimatedProgress: 0
};

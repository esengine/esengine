/**
 * @zh 寻路代理组件
 * @en Pathfinding Agent Component
 */

import {
    Component,
    ECSComponent,
    Serializable,
    Serialize,
    Property
} from '@esengine/ecs-framework';
import type { IPoint } from '../core/IPathfinding';
import { PathfindingState } from '../core/IIncrementalPathfinding';

// =============================================================================
// 寻路代理组件 | Pathfinding Agent Component
// =============================================================================

/**
 * @zh 寻路代理组件
 * @en Pathfinding Agent Component
 *
 * @zh 附加到需要寻路的实体上，管理寻路请求和结果
 * @en Attach to entities that need pathfinding, manages path requests and results
 *
 * @example
 * ```typescript
 * const entity = scene.createEntity('Agent');
 * const agent = entity.addComponent(new PathfindingAgentComponent());
 *
 * // Set initial position
 * agent.x = 10;
 * agent.y = 10;
 *
 * // Request path to target
 * agent.requestPathTo(50, 50);
 *
 * // In movement system, follow the path
 * const waypoint = agent.getNextWaypoint();
 * if (waypoint) {
 *     // Move towards waypoint
 *     // When reached, call agent.advanceWaypoint()
 * }
 * ```
 */
@ECSComponent('PathfindingAgent')
@Serializable({ version: 1, typeId: 'PathfindingAgent' })
export class PathfindingAgentComponent extends Component {
    // =========================================================================
    // 位置属性 | Position Properties
    // =========================================================================

    /**
     * @zh 当前位置 X 坐标
     * @en Current position X coordinate
     */
    @Serialize()
    @Property({ type: 'number', label: 'Position X' })
    x: number = 0;

    /**
     * @zh 当前位置 Y 坐标
     * @en Current position Y coordinate
     */
    @Serialize()
    @Property({ type: 'number', label: 'Position Y' })
    y: number = 0;

    // =========================================================================
    // 目标属性 | Target Properties
    // =========================================================================

    /**
     * @zh 目标位置 X 坐标
     * @en Target position X coordinate
     */
    @Serialize()
    @Property({ type: 'number', label: 'Target X' })
    targetX: number = 0;

    /**
     * @zh 目标位置 Y 坐标
     * @en Target position Y coordinate
     */
    @Serialize()
    @Property({ type: 'number', label: 'Target Y' })
    targetY: number = 0;

    /**
     * @zh 是否有新的寻路请求待处理
     * @en Whether there is a new path request pending
     */
    hasRequest: boolean = false;

    // =========================================================================
    // 配置属性 | Configuration Properties
    // =========================================================================

    /**
     * @zh 寻路优先级（数值越小优先级越高）
     * @en Pathfinding priority (lower number = higher priority)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Priority', min: 0, max: 100 })
    priority: number = 50;

    /**
     * @zh 每帧最大迭代次数
     * @en Maximum iterations per frame
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Iterations/Frame', min: 10, max: 1000 })
    maxIterationsPerFrame: number = 100;

    /**
     * @zh 是否启用动态重规划
     * @en Whether dynamic replanning is enabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Dynamic Replan' })
    enableDynamicReplan: boolean = true;

    /**
     * @zh 向前探测距离（用于障碍物检测）
     * @en Lookahead distance for obstacle detection
     */
    @Serialize()
    @Property({ type: 'number', label: 'Lookahead Distance', min: 1, max: 20 })
    lookaheadDistance: number = 5;

    /**
     * @zh 路径验证间隔（帧数）
     * @en Path validation interval (in frames)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Validation Interval', min: 1, max: 60 })
    validationInterval: number = 10;

    // =========================================================================
    // 运行时状态（不序列化）| Runtime State (not serialized)
    // =========================================================================

    /**
     * @zh 当前寻路状态
     * @en Current pathfinding state
     */
    state: PathfindingState = PathfindingState.Idle;

    /**
     * @zh 当前请求 ID
     * @en Current request ID
     */
    currentRequestId: number = -1;

    /**
     * @zh 当前路径点列表
     * @en Current path waypoints
     */
    path: IPoint[] = [];

    /**
     * @zh 当前路径索引
     * @en Current path index
     */
    pathIndex: number = 0;

    /**
     * @zh 路径总代价
     * @en Total path cost
     */
    pathCost: number = 0;

    /**
     * @zh 寻路进度 (0-1)
     * @en Pathfinding progress (0-1)
     */
    progress: number = 0;

    /**
     * @zh 上次验证的帧号
     * @en Last validation frame number
     */
    lastValidationFrame: number = 0;

    /**
     * @zh 寻路完成回调
     * @en Pathfinding complete callback
     */
    onPathComplete?: (found: boolean, path: readonly IPoint[]) => void;

    /**
     * @zh 寻路进度回调
     * @en Pathfinding progress callback
     */
    onPathProgress?: (progress: number) => void;

    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================

    /**
     * @zh 请求寻路到目标位置
     * @en Request path to target position
     *
     * @param targetX - @zh 目标 X 坐标 @en Target X coordinate
     * @param targetY - @zh 目标 Y 坐标 @en Target Y coordinate
     */
    requestPathTo(targetX: number, targetY: number): void {
        this.targetX = targetX;
        this.targetY = targetY;
        this.hasRequest = true;
        this.state = PathfindingState.Idle;
        this.progress = 0;
    }

    /**
     * @zh 取消当前寻路
     * @en Cancel current pathfinding
     */
    cancelPath(): void {
        this.hasRequest = false;
        this.state = PathfindingState.Cancelled;
        this.path = [];
        this.pathIndex = 0;
        this.progress = 0;
        this.currentRequestId = -1;
    }

    /**
     * @zh 获取下一个路径点
     * @en Get next waypoint
     *
     * @returns @zh 下一个路径点或 null @en Next waypoint or null
     */
    getNextWaypoint(): IPoint | null {
        if (this.pathIndex < this.path.length) {
            return this.path[this.pathIndex];
        }
        return null;
    }

    /**
     * @zh 前进到下一个路径点
     * @en Advance to next waypoint
     */
    advanceWaypoint(): void {
        if (this.pathIndex < this.path.length) {
            this.pathIndex++;
        }
    }

    /**
     * @zh 检查是否到达路径终点
     * @en Check if reached path end
     *
     * @returns @zh 是否到达终点 @en Whether reached end
     */
    isPathComplete(): boolean {
        return this.pathIndex >= this.path.length;
    }

    /**
     * @zh 检查是否正在寻路
     * @en Check if pathfinding is in progress
     *
     * @returns @zh 是否正在寻路 @en Whether pathfinding is in progress
     */
    isSearching(): boolean {
        return this.state === PathfindingState.InProgress;
    }

    /**
     * @zh 检查是否有有效路径
     * @en Check if has valid path
     *
     * @returns @zh 是否有有效路径 @en Whether has valid path
     */
    hasValidPath(): boolean {
        return this.state === PathfindingState.Completed && this.path.length > 0;
    }

    /**
     * @zh 获取剩余路径点数量
     * @en Get remaining waypoint count
     *
     * @returns @zh 剩余路径点数量 @en Remaining waypoint count
     */
    getRemainingWaypointCount(): number {
        return Math.max(0, this.path.length - this.pathIndex);
    }

    /**
     * @zh 获取当前路径的总长度
     * @en Get total path length
     *
     * @returns @zh 路径总长度 @en Total path length
     */
    getPathLength(): number {
        return this.path.length;
    }

    /**
     * @zh 重置组件状态
     * @en Reset component state
     */
    reset(): void {
        this.state = PathfindingState.Idle;
        this.currentRequestId = -1;
        this.path = [];
        this.pathIndex = 0;
        this.pathCost = 0;
        this.progress = 0;
        this.hasRequest = false;
        this.lastValidationFrame = 0;
    }

    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    public onRemovedFromEntity(): void {
        this.reset();
        this.onPathComplete = undefined;
        this.onPathProgress = undefined;
    }
}

/**
 * @zh 统一导航代理组件
 * @en Unified Navigation Agent Component
 *
 * @zh 算法无关的通用导航属性，配合 NavigationSystem 使用
 * @en Algorithm-agnostic common navigation properties, works with NavigationSystem
 */

import {
    Component,
    ECSComponent,
    Serializable,
    Serialize,
    Property
} from '@esengine/ecs-framework';
import type { IVector2 } from '../interfaces/IPathPlanner';

/**
 * @zh 导航状态
 * @en Navigation state
 */
export enum NavigationState {
    /**
     * @zh 空闲
     * @en Idle
     */
    Idle = 'idle',

    /**
     * @zh 正在导航
     * @en Navigating
     */
    Navigating = 'navigating',

    /**
     * @zh 已到达
     * @en Arrived
     */
    Arrived = 'arrived',

    /**
     * @zh 路径被阻挡
     * @en Path blocked
     */
    Blocked = 'blocked',

    /**
     * @zh 无法到达
     * @en Unreachable
     */
    Unreachable = 'unreachable'
}

/**
 * @zh 统一导航代理组件
 * @en Unified navigation agent component
 *
 * @zh 包含算法无关的通用导航属性，不包含算法特定参数
 * @en Contains algorithm-agnostic common navigation properties, no algorithm-specific parameters
 *
 * @example
 * ```typescript
 * const entity = scene.createEntity('Agent');
 *
 * // 添加导航代理组件
 * const nav = entity.addComponent(new NavigationAgentComponent());
 * nav.radius = 0.5;
 * nav.maxSpeed = 5.0;
 *
 * // 设置目标
 * nav.setDestination(100, 200);
 *
 * // NavigationSystem 会自动处理：
 * // 1. 使用 IPathPlanner 计算全局路径
 * // 2. 使用 ILocalAvoidance 进行局部避让
 * // 3. 使用 ICollisionResolver 防止穿透
 * ```
 */
@ECSComponent('NavigationAgent')
@Serializable({ version: 1, typeId: 'NavigationAgent' })
export class NavigationAgentComponent extends Component {
    // =========================================================================
    // 核心物理属性 | Core Physical Properties
    // =========================================================================

    /**
     * @zh 代理半径
     * @en Agent radius
     */
    @Serialize()
    @Property({ type: 'number', label: 'Radius', min: 0.1, max: 10 })
    radius: number = 0.5;

    /**
     * @zh 最大速度
     * @en Maximum speed
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Speed', min: 0.1, max: 100 })
    maxSpeed: number = 5.0;

    /**
     * @zh 加速度（用于平滑移动）
     * @en Acceleration (for smooth movement)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Acceleration', min: 0.1, max: 100 })
    acceleration: number = 10.0;

    // =========================================================================
    // 寻路配置 | Pathfinding Configuration
    // =========================================================================

    /**
     * @zh 路径点到达阈值
     * @en Waypoint arrival threshold
     */
    @Serialize()
    @Property({ type: 'number', label: 'Waypoint Threshold', min: 0.1, max: 10 })
    waypointThreshold: number = 0.5;

    /**
     * @zh 目标到达阈值
     * @en Destination arrival threshold
     */
    @Serialize()
    @Property({ type: 'number', label: 'Arrival Threshold', min: 0.1, max: 10 })
    arrivalThreshold: number = 0.3;

    /**
     * @zh 路径重新计算间隔（秒）
     * @en Path recalculation interval (seconds)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Repath Interval', min: 0.1, max: 10 })
    repathInterval: number = 0.5;

    // =========================================================================
    // 配置选项 | Configuration Options
    // =========================================================================

    /**
     * @zh 是否启用导航
     * @en Whether navigation is enabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Enabled' })
    enabled: boolean = true;

    /**
     * @zh 是否自动重新计算被阻挡的路径
     * @en Whether to auto repath when blocked
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Auto Repath' })
    autoRepath: boolean = true;

    /**
     * @zh 是否启用平滑转向
     * @en Whether to enable smooth steering
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Smooth Steering' })
    smoothSteering: boolean = true;

    // =========================================================================
    // 运行时状态 | Runtime State (Non-serialized)
    // =========================================================================

    /**
     * @zh 当前位置
     * @en Current position
     */
    position: IVector2 = { x: 0, y: 0 };

    /**
     * @zh 当前速度
     * @en Current velocity
     */
    velocity: IVector2 = { x: 0, y: 0 };

    /**
     * @zh 目标位置
     * @en Destination position
     */
    destination: IVector2 | null = null;

    /**
     * @zh 当前导航状态
     * @en Current navigation state
     */
    state: NavigationState = NavigationState.Idle;

    /**
     * @zh 当前路径
     * @en Current path
     */
    path: IVector2[] = [];

    /**
     * @zh 当前路径点索引
     * @en Current waypoint index
     */
    currentWaypointIndex: number = 0;

    /**
     * @zh 上次重新计算路径的时间
     * @en Last repath time
     */
    lastRepathTime: number = 0;

    // =========================================================================
    // 增量寻路状态（时间切片）| Incremental Pathfinding State (Time Slicing)
    // =========================================================================

    /**
     * @zh 当前增量寻路请求 ID
     * @en Current incremental pathfinding request ID
     */
    currentRequestId: number = -1;

    /**
     * @zh 寻路进度 (0-1)
     * @en Pathfinding progress (0-1)
     */
    pathProgress: number = 0;

    /**
     * @zh 优先级（数字越小优先级越高）
     * @en Priority (lower number = higher priority)
     */
    priority: number = 50;

    /**
     * @zh 是否正在等待路径计算完成
     * @en Whether waiting for path computation to complete
     */
    isComputingPath: boolean = false;

    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================

    /**
     * @zh 设置位置
     * @en Set position
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     */
    setPosition(x: number, y: number): void {
        this.position = { x, y };
    }

    /**
     * @zh 设置目标位置
     * @en Set destination
     *
     * @param x - @zh 目标 X 坐标 @en Destination X coordinate
     * @param y - @zh 目标 Y 坐标 @en Destination Y coordinate
     */
    setDestination(x: number, y: number): void {
        this.destination = { x, y };
        this.state = NavigationState.Navigating;
        this.path = [];
        this.currentWaypointIndex = 0;
        this.lastRepathTime = 0;
    }

    /**
     * @zh 停止导航
     * @en Stop navigation
     */
    stop(): void {
        this.destination = null;
        this.state = NavigationState.Idle;
        this.path = [];
        this.currentWaypointIndex = 0;
        this.velocity = { x: 0, y: 0 };
    }

    /**
     * @zh 获取当前路径点
     * @en Get current waypoint
     *
     * @returns @zh 当前路径点，如果没有则返回 null @en Current waypoint, or null if none
     */
    getCurrentWaypoint(): IVector2 | null {
        if (this.currentWaypointIndex < this.path.length) {
            return this.path[this.currentWaypointIndex]!;
        }
        return null;
    }

    /**
     * @zh 获取到目标的距离
     * @en Get distance to destination
     *
     * @returns @zh 到目标的距离，如果没有目标则返回 Infinity @en Distance to destination, or Infinity if no destination
     */
    getDistanceToDestination(): number {
        if (!this.destination) return Infinity;
        const dx = this.destination.x - this.position.x;
        const dy = this.destination.y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * @zh 获取当前速度大小
     * @en Get current speed
     *
     * @returns @zh 当前速度大小 @en Current speed magnitude
     */
    getCurrentSpeed(): number {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }

    /**
     * @zh 检查是否已到达目标
     * @en Check if arrived at destination
     *
     * @returns @zh 是否已到达 @en Whether arrived
     */
    hasArrived(): boolean {
        return this.state === NavigationState.Arrived;
    }

    /**
     * @zh 检查路径是否被阻挡
     * @en Check if path is blocked
     *
     * @returns @zh 是否被阻挡 @en Whether blocked
     */
    isBlocked(): boolean {
        return this.state === NavigationState.Blocked;
    }

    /**
     * @zh 检查目标是否无法到达
     * @en Check if destination is unreachable
     *
     * @returns @zh 是否无法到达 @en Whether unreachable
     */
    isUnreachable(): boolean {
        return this.state === NavigationState.Unreachable;
    }

    /**
     * @zh 重置组件状态
     * @en Reset component state
     */
    reset(): void {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.destination = null;
        this.state = NavigationState.Idle;
        this.path = [];
        this.currentWaypointIndex = 0;
        this.lastRepathTime = 0;
    }

    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    public onRemovedFromEntity(): void {
        this.reset();
    }
}

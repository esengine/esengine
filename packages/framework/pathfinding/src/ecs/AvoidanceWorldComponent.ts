/**
 * @zh 避让世界组件
 * @en Avoidance World Component
 */

import {
    Component,
    ECSComponent,
    Serializable,
    Serialize,
    Property
} from '@esengine/ecs-framework';
import type { IObstacle, IORCASolverConfig } from '../avoidance/ILocalAvoidance';
import { DEFAULT_ORCA_CONFIG } from '../avoidance/ILocalAvoidance';
import type { ORCASolver } from '../avoidance/ORCASolver';
import type { KDTree } from '../avoidance/KDTree';

// =============================================================================
// 避让世界组件 | Avoidance World Component
// =============================================================================

/**
 * @zh 避让世界组件
 * @en Avoidance World Component
 *
 * @zh 挂载在场景实体上，持有 ORCA 求解器和静态障碍物
 * @en Attached to scene entity, holds ORCA solver and static obstacles
 *
 * @example
 * ```typescript
 * const worldEntity = scene.createEntity('AvoidanceWorld');
 * const world = worldEntity.addComponent(new AvoidanceWorldComponent());
 *
 * // 添加静态障碍物（墙壁）
 * world.addObstacle({
 *     vertices: [
 *         { x: 0, y: 0 },
 *         { x: 10, y: 0 },
 *         { x: 10, y: 1 },
 *         { x: 0, y: 1 }
 *     ]
 * });
 *
 * // LocalAvoidanceSystem 会自动使用此组件
 * ```
 */
@ECSComponent('AvoidanceWorld')
@Serializable({ version: 1, typeId: 'AvoidanceWorld' })
export class AvoidanceWorldComponent extends Component {
    // =========================================================================
    // ORCA 配置 | ORCA Configuration
    // =========================================================================

    /**
     * @zh 默认时间视野（代理）
     * @en Default time horizon for agents
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Horizon', min: 0.1, max: 10 })
    defaultTimeHorizon: number = DEFAULT_ORCA_CONFIG.defaultTimeHorizon;

    /**
     * @zh 默认时间视野（障碍物）
     * @en Default time horizon for obstacles
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Horizon Obst', min: 0.1, max: 10 })
    defaultTimeHorizonObst: number = DEFAULT_ORCA_CONFIG.defaultTimeHorizonObst;

    /**
     * @zh 时间步长
     * @en Time step
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Step', min: 0.001, max: 0.1 })
    timeStep: number = DEFAULT_ORCA_CONFIG.timeStep;

    // =========================================================================
    // 调试配置 | Debug Configuration
    // =========================================================================

    /**
     * @zh 是否显示调试信息
     * @en Whether to show debug info
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Debug Mode' })
    debugMode: boolean = false;

    /**
     * @zh 是否显示邻居连线
     * @en Whether to show neighbor connections
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Show Neighbors' })
    showNeighbors: boolean = false;

    /**
     * @zh 是否显示 ORCA 约束线
     * @en Whether to show ORCA constraint lines
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Show ORCA Lines' })
    showORCALines: boolean = false;

    /**
     * @zh 是否显示速度向量
     * @en Whether to show velocity vectors
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Show Velocities' })
    showVelocities: boolean = false;

    // =========================================================================
    // 运行时实例（不序列化）| Runtime Instances (not serialized)
    // =========================================================================

    /**
     * @zh ORCA 求解器实例
     * @en ORCA solver instance
     */
    solver: ORCASolver | null = null;

    /**
     * @zh KD-Tree 实例
     * @en KD-Tree instance
     */
    kdTree: KDTree | null = null;

    /**
     * @zh 静态障碍物列表
     * @en List of static obstacles
     */
    obstacles: IObstacle[] = [];

    /**
     * @zh 是否已初始化
     * @en Whether initialized
     */
    initialized: boolean = false;

    // =========================================================================
    // 统计信息 | Statistics
    // =========================================================================

    /**
     * @zh 当前代理数量
     * @en Current agent count
     */
    agentCount: number = 0;

    /**
     * @zh 本帧处理的代理数
     * @en Agents processed this frame
     */
    agentsProcessedThisFrame: number = 0;

    /**
     * @zh 本帧 ORCA 计算耗时（毫秒）
     * @en ORCA computation time this frame (ms)
     */
    computeTimeMs: number = 0;

    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================

    /**
     * @zh 获取 ORCA 配置
     * @en Get ORCA configuration
     */
    getConfig(): IORCASolverConfig {
        return {
            defaultTimeHorizon: this.defaultTimeHorizon,
            defaultTimeHorizonObst: this.defaultTimeHorizonObst,
            timeStep: this.timeStep
        };
    }

    /**
     * @zh 添加静态障碍物
     * @en Add static obstacle
     *
     * @param obstacle - @zh 障碍物（顶点列表，逆时针顺序）@en Obstacle (vertex list, counter-clockwise)
     */
    addObstacle(obstacle: IObstacle): void {
        this.obstacles.push(obstacle);
    }

    /**
     * @zh 添加矩形障碍物
     * @en Add rectangular obstacle
     *
     * @param x - @zh 左下角 X @en Bottom-left X
     * @param y - @zh 左下角 Y @en Bottom-left Y
     * @param width - @zh 宽度 @en Width
     * @param height - @zh 高度 @en Height
     */
    addRectObstacle(x: number, y: number, width: number, height: number): void {
        this.obstacles.push({
            vertices: [
                { x: x, y: y },
                { x: x + width, y: y },
                { x: x + width, y: y + height },
                { x: x, y: y + height }
            ]
        });
    }

    /**
     * @zh 移除所有障碍物
     * @en Remove all obstacles
     */
    clearObstacles(): void {
        this.obstacles = [];
    }

    /**
     * @zh 重置统计信息
     * @en Reset statistics
     */
    resetStats(): void {
        this.agentsProcessedThisFrame = 0;
        this.computeTimeMs = 0;
    }

    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    public onRemovedFromEntity(): void {
        this.solver = null;
        this.kdTree = null;
        this.obstacles = [];
        this.initialized = false;
    }
}

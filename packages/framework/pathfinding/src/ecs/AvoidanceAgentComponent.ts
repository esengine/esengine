/**
 * @zh 避让代理组件
 * @en Avoidance Agent Component
 */

import {
    Component,
    ECSComponent,
    Serializable,
    Serialize,
    Property
} from '@esengine/ecs-framework';
import { DEFAULT_AGENT_PARAMS } from '../avoidance/ILocalAvoidance';

// =============================================================================
// 避让代理组件 | Avoidance Agent Component
// =============================================================================

/**
 * @zh 避让代理组件
 * @en Avoidance Agent Component
 *
 * @zh 附加到需要局部避让的实体上，与 ORCA 系统配合使用
 * @en Attach to entities that need local avoidance, works with ORCA system
 *
 * @example
 * ```typescript
 * const entity = scene.createEntity('Monster');
 *
 * // 添加避让代理
 * const avoidance = entity.addComponent(new AvoidanceAgentComponent());
 * avoidance.radius = 0.5;
 * avoidance.maxSpeed = 5.0;
 *
 * // 设置首选速度（朝向目标）
 * avoidance.setPreferredVelocityTowards(targetX, targetY, currentX, currentY);
 *
 * // 系统计算后，使用新速度更新位置
 * // After system computes, use new velocity to update position
 * x += avoidance.newVelocityX * deltaTime;
 * y += avoidance.newVelocityY * deltaTime;
 * ```
 */
@ECSComponent('AvoidanceAgent')
@Serializable({ version: 1, typeId: 'AvoidanceAgent' })
export class AvoidanceAgentComponent extends Component {
    // =========================================================================
    // 物理属性 | Physical Properties
    // =========================================================================

    /**
     * @zh 代理半径
     * @en Agent radius
     *
     * @zh 用于碰撞检测和避让计算
     * @en Used for collision detection and avoidance computation
     */
    @Serialize()
    @Property({ type: 'number', label: 'Radius', min: 0.1, max: 10 })
    radius: number = DEFAULT_AGENT_PARAMS.radius;

    /**
     * @zh 最大速度
     * @en Maximum speed
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Speed', min: 0.1, max: 100 })
    maxSpeed: number = DEFAULT_AGENT_PARAMS.maxSpeed;

    // =========================================================================
    // ORCA 参数 | ORCA Parameters
    // =========================================================================

    /**
     * @zh 邻居检测距离
     * @en Neighbor detection distance
     *
     * @zh 只考虑此范围内的其他代理
     * @en Only considers other agents within this range
     */
    @Serialize()
    @Property({ type: 'number', label: 'Neighbor Dist', min: 1, max: 100 })
    neighborDist: number = DEFAULT_AGENT_PARAMS.neighborDist;

    /**
     * @zh 最大邻居数量
     * @en Maximum number of neighbors to consider
     *
     * @zh 限制计算量，优先考虑最近的邻居
     * @en Limits computation, prioritizes closest neighbors
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Neighbors', min: 1, max: 50 })
    maxNeighbors: number = DEFAULT_AGENT_PARAMS.maxNeighbors;

    /**
     * @zh 代理避让时间视野（秒）
     * @en Time horizon for agent avoidance (seconds)
     *
     * @zh 更大的值会让代理更早开始避让，但可能导致过于保守
     * @en Larger values make agents start avoiding earlier, but may be too conservative
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Horizon', min: 0.1, max: 10 })
    timeHorizon: number = DEFAULT_AGENT_PARAMS.timeHorizon;

    /**
     * @zh 障碍物避让时间视野（秒）
     * @en Time horizon for obstacle avoidance (seconds)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Horizon Obst', min: 0.1, max: 10 })
    timeHorizonObst: number = DEFAULT_AGENT_PARAMS.timeHorizonObst;

    // =========================================================================
    // 位置和速度（运行时状态）| Position & Velocity (Runtime State)
    // =========================================================================

    /**
     * @zh 当前位置 X
     * @en Current position X
     *
     * @zh 如果实体有 Transform 组件，系统会自动同步
     * @en If entity has Transform component, system will sync automatically
     */
    positionX: number = 0;

    /**
     * @zh 当前位置 Y
     * @en Current position Y
     */
    positionY: number = 0;

    /**
     * @zh 当前速度 X
     * @en Current velocity X
     */
    velocityX: number = 0;

    /**
     * @zh 当前速度 Y
     * @en Current velocity Y
     */
    velocityY: number = 0;

    /**
     * @zh 首选速度 X（通常指向目标方向）
     * @en Preferred velocity X (usually towards target)
     */
    preferredVelocityX: number = 0;

    /**
     * @zh 首选速度 Y
     * @en Preferred velocity Y
     */
    preferredVelocityY: number = 0;

    /**
     * @zh ORCA 计算的新速度 X
     * @en New velocity X computed by ORCA
     */
    newVelocityX: number = 0;

    /**
     * @zh ORCA 计算的新速度 Y
     * @en New velocity Y computed by ORCA
     */
    newVelocityY: number = 0;

    // =========================================================================
    // 配置选项 | Configuration Options
    // =========================================================================

    /**
     * @zh 是否启用避让
     * @en Whether avoidance is enabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Enabled' })
    enabled: boolean = true;

    /**
     * @zh 是否自动应用新速度
     * @en Whether to automatically apply new velocity
     *
     * @zh 如果为 true，系统会在计算后自动将 newVelocity 赋值给 velocity
     * @en If true, system will automatically assign newVelocity to velocity after computation
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Auto Apply' })
    autoApplyVelocity: boolean = true;

    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================

    /**
     * @zh 设置位置
     * @en Set position
     */
    setPosition(x: number, y: number): void {
        this.positionX = x;
        this.positionY = y;
    }

    /**
     * @zh 设置当前速度
     * @en Set current velocity
     */
    setVelocity(x: number, y: number): void {
        this.velocityX = x;
        this.velocityY = y;
    }

    /**
     * @zh 设置首选速度
     * @en Set preferred velocity
     */
    setPreferredVelocity(x: number, y: number): void {
        this.preferredVelocityX = x;
        this.preferredVelocityY = y;
    }

    /**
     * @zh 设置首选速度朝向目标
     * @en Set preferred velocity towards target
     *
     * @param targetX - @zh 目标 X @en Target X
     * @param targetY - @zh 目标 Y @en Target Y
     * @param currentX - @zh 当前 X（可选，默认使用 positionX）@en Current X (optional, defaults to positionX)
     * @param currentY - @zh 当前 Y（可选，默认使用 positionY）@en Current Y (optional, defaults to positionY)
     */
    setPreferredVelocityTowards(
        targetX: number,
        targetY: number,
        currentX?: number,
        currentY?: number
    ): void {
        const x = currentX ?? this.positionX;
        const y = currentY ?? this.positionY;

        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.0001) {
            const speed = Math.min(this.maxSpeed, dist);
            this.preferredVelocityX = (dx / dist) * speed;
            this.preferredVelocityY = (dy / dist) * speed;
        } else {
            this.preferredVelocityX = 0;
            this.preferredVelocityY = 0;
        }
    }

    /**
     * @zh 应用 ORCA 计算的新速度
     * @en Apply new velocity computed by ORCA
     */
    applyNewVelocity(): void {
        this.velocityX = this.newVelocityX;
        this.velocityY = this.newVelocityY;
    }

    /**
     * @zh 获取新速度的长度
     * @en Get length of new velocity
     */
    getNewSpeed(): number {
        return Math.sqrt(
            this.newVelocityX * this.newVelocityX +
            this.newVelocityY * this.newVelocityY
        );
    }

    /**
     * @zh 获取当前速度的长度
     * @en Get length of current velocity
     */
    getCurrentSpeed(): number {
        return Math.sqrt(
            this.velocityX * this.velocityX +
            this.velocityY * this.velocityY
        );
    }

    /**
     * @zh 停止代理
     * @en Stop the agent
     */
    stop(): void {
        this.velocityX = 0;
        this.velocityY = 0;
        this.preferredVelocityX = 0;
        this.preferredVelocityY = 0;
        this.newVelocityX = 0;
        this.newVelocityY = 0;
    }

    /**
     * @zh 重置组件状态
     * @en Reset component state
     */
    reset(): void {
        this.positionX = 0;
        this.positionY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.preferredVelocityX = 0;
        this.preferredVelocityY = 0;
        this.newVelocityX = 0;
        this.newVelocityY = 0;
    }

    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    public onRemovedFromEntity(): void {
        this.reset();
    }
}

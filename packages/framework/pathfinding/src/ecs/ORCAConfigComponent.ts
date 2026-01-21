/**
 * @zh ORCA 算法配置组件
 * @en ORCA Algorithm Configuration Component
 *
 * @zh 可选组件，仅当使用 ORCA 避让算法时需要，用于覆盖默认 ORCA 参数
 * @en Optional component, only needed when using ORCA avoidance, to override default ORCA parameters
 */

import {
    Component,
    ECSComponent,
    Serializable,
    Serialize,
    Property
} from '@esengine/ecs-framework';

/**
 * @zh ORCA 算法配置组件
 * @en ORCA algorithm configuration component
 *
 * @zh 可选组件，附加到代理实体上以覆盖默认 ORCA 参数
 * @en Optional component, attach to agent entities to override default ORCA parameters
 *
 * @example
 * ```typescript
 * const entity = scene.createEntity('Agent');
 *
 * // 添加导航代理
 * entity.addComponent(new NavigationAgentComponent());
 *
 * // 可选：添加 ORCA 配置以自定义参数
 * const orcaConfig = entity.addComponent(new ORCAConfigComponent());
 * orcaConfig.timeHorizon = 3.0;  // 更长的预测时间
 * orcaConfig.neighborDist = 20.0;  // 更大的邻居检测范围
 * ```
 */
@ECSComponent('ORCAConfig')
@Serializable({ version: 1, typeId: 'ORCAConfig' })
export class ORCAConfigComponent extends Component {
    /**
     * @zh 邻居检测距离
     * @en Neighbor detection distance
     *
     * @zh 代理检测邻居的最大距离，更大的值意味着更早开始避让但也更消耗性能
     * @en Maximum distance for detecting neighbors, larger value means earlier avoidance but more performance cost
     */
    @Serialize()
    @Property({ type: 'number', label: 'Neighbor Dist', min: 1, max: 100 })
    neighborDist: number = 15.0;

    /**
     * @zh 最大邻居数量
     * @en Maximum number of neighbors
     *
     * @zh 计算避让时考虑的最大邻居数量，更多邻居意味着更精确但也更消耗性能
     * @en Maximum neighbors considered for avoidance, more neighbors means more accurate but slower
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Neighbors', min: 1, max: 50 })
    maxNeighbors: number = 10;

    /**
     * @zh 代理避让时间视野
     * @en Time horizon for agent avoidance
     *
     * @zh 预测其他代理未来位置的时间范围，更长意味着更平滑但可能过度避让
     * @en Time range for predicting other agents' future positions, longer means smoother but may over-avoid
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Horizon', min: 0.1, max: 10 })
    timeHorizon: number = 2.0;

    /**
     * @zh 障碍物避让时间视野
     * @en Time horizon for obstacle avoidance
     *
     * @zh 预测与障碍物碰撞的时间范围，通常比代理视野短
     * @en Time range for predicting obstacle collisions, usually shorter than agent horizon
     */
    @Serialize()
    @Property({ type: 'number', label: 'Time Horizon Obst', min: 0.1, max: 10 })
    timeHorizonObst: number = 1.0;
}

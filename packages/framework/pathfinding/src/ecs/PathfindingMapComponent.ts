/**
 * @zh 寻路地图组件
 * @en Pathfinding Map Component
 */

import {
    Component,
    ECSComponent,
    Serializable,
    Serialize,
    Property
} from '@esengine/ecs-framework';
import type { IPathfindingMap, IPathSmoother } from '../core/IPathfinding';
import type { IIncrementalPathfinder } from '../core/IIncrementalPathfinding';

// =============================================================================
// 地图类型 | Map Type
// =============================================================================

/**
 * @zh 地图类型
 * @en Map type
 */
export type PathfindingMapType = 'grid' | 'navmesh';

// =============================================================================
// 寻路地图组件 | Pathfinding Map Component
// =============================================================================

/**
 * @zh 寻路地图组件
 * @en Pathfinding Map Component
 *
 * @zh 挂载在场景实体上，持有地图实例和增量寻路器
 * @en Attached to scene entity, holds map instance and incremental pathfinder
 *
 * @example
 * ```typescript
 * const mapEntity = scene.createEntity('PathfindingMap');
 * const mapComp = mapEntity.addComponent(new PathfindingMapComponent());
 *
 * // Configure map
 * mapComp.width = 100;
 * mapComp.height = 100;
 * mapComp.iterationsBudget = 2000;
 *
 * // Map and pathfinder will be initialized by PathfindingSystem
 * ```
 */
@ECSComponent('PathfindingMap')
@Serializable({ version: 1, typeId: 'PathfindingMap' })
export class PathfindingMapComponent extends Component {
    // =========================================================================
    // 地图配置 | Map Configuration
    // =========================================================================

    /**
     * @zh 地图类型
     * @en Map type
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Map Type',
        options: [
            { value: 'grid', label: 'Grid' },
            { value: 'navmesh', label: 'NavMesh' }
        ]
    })
    mapType: PathfindingMapType = 'grid';

    /**
     * @zh 网格宽度（仅 grid 类型）
     * @en Grid width (grid type only)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Map Width', min: 1, max: 10000 })
    width: number = 100;

    /**
     * @zh 网格高度（仅 grid 类型）
     * @en Grid height (grid type only)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Map Height', min: 1, max: 10000 })
    height: number = 100;

    /**
     * @zh 是否允许对角移动
     * @en Whether diagonal movement is allowed
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Allow Diagonal' })
    allowDiagonal: boolean = true;

    /**
     * @zh 是否避免穿角
     * @en Whether to avoid corner cutting
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Avoid Corners' })
    avoidCorners: boolean = true;

    // =========================================================================
    // 系统配置 | System Configuration
    // =========================================================================

    /**
     * @zh 每帧处理的最大代理数
     * @en Maximum agents processed per frame
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Agents/Frame', min: 1, max: 100 })
    maxAgentsPerFrame: number = 10;

    /**
     * @zh 每帧总迭代次数预算
     * @en Total iterations budget per frame
     */
    @Serialize()
    @Property({ type: 'number', label: 'Iterations Budget', min: 100, max: 10000 })
    iterationsBudget: number = 1000;

    /**
     * @zh 是否启用路径平滑
     * @en Whether path smoothing is enabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Enable Smoothing' })
    enableSmoothing: boolean = true;

    /**
     * @zh 路径平滑类型
     * @en Path smoothing type
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Smoothing Type',
        options: [
            { value: 'los', label: 'Line of Sight' },
            { value: 'catmullrom', label: 'Catmull-Rom' },
            { value: 'combined', label: 'Combined' }
        ]
    })
    smoothingType: 'los' | 'catmullrom' | 'combined' = 'los';

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
     * @zh 是否显示网格
     * @en Whether to show grid
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Show Grid' })
    showGrid: boolean = false;

    /**
     * @zh 是否显示路径
     * @en Whether to show paths
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Show Paths' })
    showPaths: boolean = false;

    // =========================================================================
    // 运行时实例（不序列化）| Runtime Instances (not serialized)
    // =========================================================================

    /**
     * @zh 地图实例
     * @en Map instance
     */
    map: IPathfindingMap | null = null;

    /**
     * @zh 增量寻路器实例
     * @en Incremental pathfinder instance
     */
    pathfinder: IIncrementalPathfinder | null = null;

    /**
     * @zh 路径平滑器实例
     * @en Path smoother instance
     */
    smoother: IPathSmoother | null = null;

    /**
     * @zh 是否已初始化
     * @en Whether initialized
     */
    initialized: boolean = false;

    // =========================================================================
    // 统计信息 | Statistics
    // =========================================================================

    /**
     * @zh 当前活跃请求数
     * @en Current active request count
     */
    activeRequests: number = 0;

    /**
     * @zh 本帧使用的迭代次数
     * @en Iterations used this frame
     */
    iterationsUsedThisFrame: number = 0;

    /**
     * @zh 本帧处理的代理数
     * @en Agents processed this frame
     */
    agentsProcessedThisFrame: number = 0;

    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================

    /**
     * @zh 设置网格单元格是否可通行
     * @en Set grid cell walkability
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param walkable - @zh 是否可通行 @en Is walkable
     */
    setWalkable(x: number, y: number, walkable: boolean): void {
        if (this.map && 'setWalkable' in this.map) {
            (this.map as { setWalkable(x: number, y: number, walkable: boolean): void })
                .setWalkable(x, y, walkable);

            if (this.pathfinder) {
                this.pathfinder.notifyObstacleChange(x - 1, y - 1, x + 1, y + 1);
            }
        }
    }

    /**
     * @zh 设置矩形区域是否可通行
     * @en Set rectangular area walkability
     *
     * @param x - @zh 起始 X @en Start X
     * @param y - @zh 起始 Y @en Start Y
     * @param width - @zh 宽度 @en Width
     * @param height - @zh 高度 @en Height
     * @param walkable - @zh 是否可通行 @en Is walkable
     */
    setRectWalkable(
        x: number,
        y: number,
        rectWidth: number,
        rectHeight: number,
        walkable: boolean
    ): void {
        if (this.map && 'setRectWalkable' in this.map) {
            (this.map as { setRectWalkable(x: number, y: number, w: number, h: number, walkable: boolean): void })
                .setRectWalkable(x, y, rectWidth, rectHeight, walkable);

            if (this.pathfinder) {
                this.pathfinder.notifyObstacleChange(
                    x - 1,
                    y - 1,
                    x + rectWidth + 1,
                    y + rectHeight + 1
                );
            }
        }
    }

    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @returns @zh 是否可通行 @en Is walkable
     */
    isWalkable(x: number, y: number): boolean {
        return this.map?.isWalkable(x, y) ?? false;
    }

    /**
     * @zh 重置统计信息
     * @en Reset statistics
     */
    resetStats(): void {
        this.iterationsUsedThisFrame = 0;
        this.agentsProcessedThisFrame = 0;
    }

    /**
     * @zh 获取剩余迭代预算
     * @en Get remaining iteration budget
     *
     * @returns @zh 剩余预算 @en Remaining budget
     */
    getRemainingBudget(): number {
        return Math.max(0, this.iterationsBudget - this.iterationsUsedThisFrame);
    }

    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    public onRemovedFromEntity(): void {
        if (this.pathfinder) {
            this.pathfinder.clear();
        }

        this.map = null;
        this.pathfinder = null;
        this.smoother = null;
        this.initialized = false;
    }
}

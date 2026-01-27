/**
 * @zh 网格寻路器适配器
 * @en Grid Pathfinder Adapter
 *
 * @zh 将现有 IPathfinder (A*, JPS, HPA*) 适配到 IPathPlanner 接口
 * @en Adapts existing IPathfinder (A*, JPS, HPA*) to IPathPlanner interface
 */

import type { IPathPlanner, IPathPlanResult, IVector2 } from '../interfaces/IPathPlanner';
import type { IPathfinder, IPathfindingMap, IPathfindingOptions } from '../core/IPathfinding';
import { EMPTY_PLAN_RESULT } from '../interfaces/IPathPlanner';
import { AStarPathfinder } from '../core/AStarPathfinder';
import { JPSPathfinder } from '../core/JPSPathfinder';
import { HPAPathfinder } from '../core/HPAPathfinder';
import type { IHPAConfig } from '../core/HPAPathfinder';

/**
 * @zh 网格寻路器适配器配置
 * @en Grid pathfinder adapter configuration
 */
export interface IGridPathfinderAdapterConfig {
    /**
     * @zh 网格单元格大小（像素），用于坐标转换
     * @en Grid cell size (pixels), used for coordinate conversion
     *
     * @zh 如果设置了此值，输入的像素坐标会自动转换为网格坐标，输出的网格坐标会转换回像素坐标
     * @en If set, input pixel coordinates are converted to grid coordinates, output grid coordinates are converted back to pixel coordinates
     *
     * @default 1 (no conversion)
     */
    cellSize?: number;

    /**
     * @zh 是否将输出坐标对齐到单元格中心
     * @en Whether to align output coordinates to cell center
     *
     * @zh 为 true 时，输出坐标会偏移 cellSize * 0.5，指向单元格中心
     * @en When true, output coordinates are offset by cellSize * 0.5, pointing to cell center
     *
     * @zh 默认：当 cellSize > 1 时为 true（像素坐标场景），cellSize = 1 时为 false（网格坐标场景）
     * @en Default: true when cellSize > 1 (pixel coordinate scenario), false when cellSize = 1 (grid coordinate scenario)
     */
    alignToCenter?: boolean;
}

/**
 * @zh 网格寻路器适配器
 * @en Grid pathfinder adapter
 *
 * @zh 将 A*、JPS、HPA* 等网格寻路器适配到统一的 IPathPlanner 接口
 * @en Adapts A*, JPS, HPA* grid pathfinders to unified IPathPlanner interface
 */
export class GridPathfinderAdapter implements IPathPlanner {
    readonly type: string;
    private readonly cellSize: number;
    private readonly alignToCenter: boolean;

    constructor(
        private readonly pathfinder: IPathfinder,
        private readonly map: IPathfindingMap,
        private readonly options?: IPathfindingOptions,
        type: string = 'grid',
        config?: IGridPathfinderAdapterConfig
    ) {
        this.type = type;
        const cellSize = config?.cellSize ?? 1;
        if (cellSize <= 0 || !Number.isFinite(cellSize)) {
            throw new Error(`cellSize must be a positive finite number, got: ${cellSize}`);
        }
        this.cellSize = cellSize;
        this.alignToCenter = config?.alignToCenter ?? (cellSize > 1);
    }

    /**
     * @zh 像素坐标转网格坐标
     * @en Convert pixel coordinate to grid coordinate
     */
    private toGridCoord(pixel: number): number {
        return Math.floor(pixel / this.cellSize);
    }

    /**
     * @zh 网格坐标转像素坐标
     * @en Convert grid coordinate to pixel coordinate
     *
     * @zh 根据 alignToCenter 配置决定是否偏移到单元格中心
     * @en Offsets to cell center based on alignToCenter configuration
     */
    private toPixelCoord(grid: number): number {
        const base = grid * this.cellSize;
        return this.alignToCenter ? base + this.cellSize * 0.5 : base;
    }

    findPath(start: IVector2, end: IVector2): IPathPlanResult {
        const startGridX = this.toGridCoord(start.x);
        const startGridY = this.toGridCoord(start.y);
        const endGridX = this.toGridCoord(end.x);
        const endGridY = this.toGridCoord(end.y);

        const result = this.pathfinder.findPath(
            startGridX,
            startGridY,
            endGridX,
            endGridY,
            this.options
        );

        if (!result.found) {
            return EMPTY_PLAN_RESULT;
        }

        return {
            found: true,
            path: result.path.map(p => ({
                x: this.toPixelCoord(p.x),
                y: this.toPixelCoord(p.y)
            })),
            cost: result.cost,
            nodesSearched: result.nodesSearched
        };
    }

    isWalkable(position: IVector2): boolean {
        return this.map.isWalkable(
            this.toGridCoord(position.x),
            this.toGridCoord(position.y)
        );
    }

    getNearestWalkable(position: IVector2): IVector2 | null {
        const x = this.toGridCoord(position.x);
        const y = this.toGridCoord(position.y);

        if (this.map.isWalkable(x, y)) {
            return {
                x: this.toPixelCoord(x),
                y: this.toPixelCoord(y)
            };
        }

        for (let radius = 1; radius <= 10; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        if (this.map.isWalkable(x + dx, y + dy)) {
                            return {
                                x: this.toPixelCoord(x + dx),
                                y: this.toPixelCoord(y + dy)
                            };
                        }
                    }
                }
            }
        }

        return null;
    }

    clear(): void {
        this.pathfinder.clear();
    }

    dispose(): void {
        this.pathfinder.clear();
    }
}

/**
 * @zh 创建 A* 路径规划器
 * @en Create A* path planner
 *
 * @param map - @zh 寻路地图 @en Pathfinding map
 * @param options - @zh 寻路选项 @en Pathfinding options
 * @param config - @zh 适配器配置（包含 cellSize）@en Adapter config (includes cellSize)
 * @returns @zh 路径规划器 @en Path planner
 *
 * @example
 * ```typescript
 * const gridMap = createGridMap(100, 100);
 * // 如果使用像素坐标，需要指定 cellSize
 * const planner = createAStarPlanner(gridMap, undefined, { cellSize: 20 });
 * navSystem.setPathPlanner(planner);
 * ```
 */
export function createAStarPlanner(
    map: IPathfindingMap,
    options?: IPathfindingOptions,
    config?: IGridPathfinderAdapterConfig
): IPathPlanner {
    return new GridPathfinderAdapter(
        new AStarPathfinder(map),
        map,
        options,
        'astar',
        config
    );
}

/**
 * @zh 创建 JPS 路径规划器
 * @en Create JPS path planner
 *
 * @zh JPS（Jump Point Search）适用于均匀代价的网格地图，比 A* 快 10-100 倍
 * @en JPS (Jump Point Search) is optimized for uniform-cost grids, 10-100x faster than A*
 *
 * @param map - @zh 寻路地图 @en Pathfinding map
 * @param options - @zh 寻路选项 @en Pathfinding options
 * @param config - @zh 适配器配置（包含 cellSize）@en Adapter config (includes cellSize)
 * @returns @zh 路径规划器 @en Path planner
 *
 * @example
 * ```typescript
 * const gridMap = createGridMap(100, 100);
 * const planner = createJPSPlanner(gridMap, undefined, { cellSize: 20 });
 * navSystem.setPathPlanner(planner);
 * ```
 */
export function createJPSPlanner(
    map: IPathfindingMap,
    options?: IPathfindingOptions,
    config?: IGridPathfinderAdapterConfig
): IPathPlanner {
    return new GridPathfinderAdapter(
        new JPSPathfinder(map),
        map,
        options,
        'jps',
        config
    );
}

/**
 * @zh 创建 HPA* 路径规划器
 * @en Create HPA* path planner
 *
 * @zh HPA*（Hierarchical Pathfinding A*）适用于超大地图（1000x1000+）
 * @en HPA* (Hierarchical Pathfinding A*) is optimized for very large maps (1000x1000+)
 *
 * @param map - @zh 寻路地图 @en Pathfinding map
 * @param hpaConfig - @zh HPA* 配置 @en HPA* configuration
 * @param options - @zh 寻路选项 @en Pathfinding options
 * @param adapterConfig - @zh 适配器配置（包含 cellSize）@en Adapter config (includes cellSize)
 * @returns @zh 路径规划器 @en Path planner
 *
 * @example
 * ```typescript
 * const gridMap = createGridMap(2000, 2000);
 * const planner = createHPAPlanner(gridMap, { clusterSize: 16 }, undefined, { cellSize: 20 });
 * navSystem.setPathPlanner(planner);
 * ```
 */
export function createHPAPlanner(
    map: IPathfindingMap,
    hpaConfig?: Partial<IHPAConfig>,
    options?: IPathfindingOptions,
    adapterConfig?: IGridPathfinderAdapterConfig
): IPathPlanner {
    return new GridPathfinderAdapter(
        new HPAPathfinder(map, hpaConfig),
        map,
        options,
        'hpa',
        adapterConfig
    );
}

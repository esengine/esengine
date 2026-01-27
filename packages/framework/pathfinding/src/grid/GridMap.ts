/**
 * @zh 网格地图实现
 * @en Grid Map Implementation
 */

import type {
    IPathfindingMap,
    IPathNode,
    IPoint,
    HeuristicFunction
} from '../core/IPathfinding';
import { createPoint, octileDistance } from '../core/IPathfinding';

// =============================================================================
// 网格节点 | Grid Node
// =============================================================================

/**
 * @zh 网格节点
 * @en Grid node
 */
export class GridNode implements IPathNode {
    readonly id: number;
    readonly position: IPoint;
    readonly x: number;
    readonly y: number;
    cost: number;
    walkable: boolean;

    constructor(x: number, y: number, width: number, walkable: boolean = true, cost: number = 1) {
        this.x = x;
        this.y = y;
        this.id = y * width + x;
        this.position = createPoint(x, y);
        this.walkable = walkable;
        this.cost = cost;
    }
}

// =============================================================================
// 移动方向 | Movement Directions
// =============================================================================

/**
 * @zh 4方向偏移 (上下左右)
 * @en 4-directional offsets (up, down, left, right)
 */
export const DIRECTIONS_4 = [
    { dx: 0, dy: -1 },  // Up
    { dx: 1, dy: 0 },   // Right
    { dx: 0, dy: 1 },   // Down
    { dx: -1, dy: 0 }   // Left
] as const;

/**
 * @zh 8方向偏移 (含对角线)
 * @en 8-directional offsets (including diagonals)
 */
export const DIRECTIONS_8 = [
    { dx: 0, dy: -1 },   // Up
    { dx: 1, dy: -1 },   // Up-Right
    { dx: 1, dy: 0 },    // Right
    { dx: 1, dy: 1 },    // Down-Right
    { dx: 0, dy: 1 },    // Down
    { dx: -1, dy: 1 },   // Down-Left
    { dx: -1, dy: 0 },   // Left
    { dx: -1, dy: -1 }   // Up-Left
] as const;

// =============================================================================
// 网格地图配置 | Grid Map Options
// =============================================================================

/**
 * @zh 网格地图配置
 * @en Grid map options
 */
export interface IGridMapOptions {
    /** @zh 是否允许对角移动 @en Allow diagonal movement */
    allowDiagonal?: boolean;
    /** @zh 对角移动代价 @en Diagonal movement cost */
    diagonalCost?: number;
    /** @zh 是否避免穿角 @en Avoid corner cutting */
    avoidCorners?: boolean;
    /** @zh 启发式函数 @en Heuristic function */
    heuristic?: HeuristicFunction;
}

/**
 * @zh 默认网格地图配置
 * @en Default grid map options
 */
export const DEFAULT_GRID_OPTIONS: Required<IGridMapOptions> = {
    allowDiagonal: true,
    diagonalCost: Math.SQRT2,
    avoidCorners: true,
    heuristic: octileDistance
};

// =============================================================================
// 网格地图 | Grid Map
// =============================================================================

/**
 * @zh 网格地图
 * @en Grid Map
 *
 * @zh 基于二维数组的网格地图实现，支持4方向和8方向移动
 * @en Grid map implementation based on 2D array, supports 4 and 8 directional movement
 *
 * @example
 * ```typescript
 * // Create a 10x10 grid
 * const grid = new GridMap(10, 10);
 *
 * // Set some cells as obstacles
 * grid.setWalkable(5, 5, false);
 * grid.setWalkable(5, 6, false);
 *
 * // Use with pathfinder
 * const pathfinder = new AStarPathfinder(grid);
 * const result = pathfinder.findPath(0, 0, 9, 9);
 * ```
 */
export class GridMap implements IPathfindingMap {
    readonly width: number;
    readonly height: number;
    private readonly nodes: GridNode[][];
    private readonly options: Required<IGridMapOptions>;

    constructor(width: number, height: number, options?: IGridMapOptions) {
        if (width <= 0 || !Number.isFinite(width) || !Number.isInteger(width)) {
            throw new Error(`width must be a positive integer, got: ${width}`);
        }
        if (height <= 0 || !Number.isFinite(height) || !Number.isInteger(height)) {
            throw new Error(`height must be a positive integer, got: ${height}`);
        }
        this.width = width;
        this.height = height;
        this.options = { ...DEFAULT_GRID_OPTIONS, ...options };
        this.nodes = this.createNodes();
    }

    /**
     * @zh 创建网格节点
     * @en Create grid nodes
     */
    private createNodes(): GridNode[][] {
        const nodes: GridNode[][] = [];

        for (let y = 0; y < this.height; y++) {
            nodes[y] = [];
            for (let x = 0; x < this.width; x++) {
                nodes[y][x] = new GridNode(x, y, this.width, true, 1);
            }
        }

        return nodes;
    }

    /**
     * @zh 获取指定位置的节点
     * @en Get node at position
     */
    getNodeAt(x: number, y: number): GridNode | null {
        if (!this.isInBounds(x, y)) {
            return null;
        }
        return this.nodes[y][x];
    }

    /**
     * @zh 检查坐标是否在边界内
     * @en Check if coordinates are within bounds
     */
    isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     */
    isWalkable(x: number, y: number): boolean {
        const node = this.getNodeAt(x, y);
        return node !== null && node.walkable;
    }

    /**
     * @zh 设置位置是否可通行
     * @en Set position walkability
     */
    setWalkable(x: number, y: number, walkable: boolean): void {
        const node = this.getNodeAt(x, y);
        if (node) {
            node.walkable = walkable;
        }
    }

    /**
     * @zh 设置位置的移动代价
     * @en Set movement cost at position
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param cost - @zh 移动代价，必须为正数 @en Movement cost, must be positive
     * @throws @zh 如果 cost 不是正数则抛出错误 @en Throws if cost is not positive
     */
    setCost(x: number, y: number, cost: number): void {
        if (cost <= 0 || !Number.isFinite(cost)) {
            throw new Error(`cost must be a positive finite number, got: ${cost}`);
        }
        const node = this.getNodeAt(x, y);
        if (node) {
            node.cost = cost;
        }
    }

    /**
     * @zh 获取节点的邻居
     * @en Get neighbors of a node
     */
    getNeighbors(node: IPathNode): GridNode[] {
        const neighbors: GridNode[] = [];
        const { x, y } = node.position;
        const directions = this.options.allowDiagonal ? DIRECTIONS_8 : DIRECTIONS_4;

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
                continue;
            }

            const neighbor = this.nodes[ny][nx];

            if (!neighbor.walkable) {
                continue;
            }

            if (this.options.avoidCorners && dir.dx !== 0 && dir.dy !== 0) {
                const hNode = this.nodes[y][x + dir.dx];
                const vNode = this.nodes[y + dir.dy][x];

                if (!hNode.walkable || !vNode.walkable) {
                    continue;
                }
            }

            neighbors.push(neighbor);
        }

        return neighbors;
    }

    /**
     * @zh 遍历节点的邻居（零分配）
     * @en Iterate over neighbors (zero allocation)
     */
    forEachNeighbor(node: IPathNode, callback: (neighbor: GridNode) => boolean | void): void {
        const { x, y } = node.position;
        const directions = this.options.allowDiagonal ? DIRECTIONS_8 : DIRECTIONS_4;

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
                continue;
            }

            const neighbor = this.nodes[ny][nx];

            if (!neighbor.walkable) {
                continue;
            }

            if (this.options.avoidCorners && dir.dx !== 0 && dir.dy !== 0) {
                const hNode = this.nodes[y][x + dir.dx];
                const vNode = this.nodes[y + dir.dy][x];

                if (!hNode.walkable || !vNode.walkable) {
                    continue;
                }
            }

            if (callback(neighbor) === false) {
                return;
            }
        }
    }

    /**
     * @zh 计算启发式距离
     * @en Calculate heuristic distance
     */
    heuristic(a: IPoint, b: IPoint): number {
        return this.options.heuristic(a, b);
    }

    /**
     * @zh 计算移动代价
     * @en Calculate movement cost
     */
    getMovementCost(from: IPathNode, to: IPathNode): number {
        const dx = Math.abs(from.position.x - to.position.x);
        const dy = Math.abs(from.position.y - to.position.y);

        // Diagonal movement
        if (dx !== 0 && dy !== 0) {
            return to.cost * this.options.diagonalCost;
        }

        // Cardinal movement
        return to.cost;
    }

    /**
     * @zh 从二维数组加载地图
     * @en Load map from 2D array
     *
     * @param data - @zh 0=可通行，非0=不可通行 @en 0=walkable, non-0=blocked
     */
    loadFromArray(data: number[][]): void {
        for (let y = 0; y < Math.min(data.length, this.height); y++) {
            for (let x = 0; x < Math.min(data[y].length, this.width); x++) {
                this.nodes[y][x].walkable = data[y][x] === 0;
            }
        }
    }

    /**
     * @zh 从字符串加载地图
     * @en Load map from string
     *
     * @param str - @zh 地图字符串，'.'=可通行，'#'=障碍 @en Map string, '.'=walkable, '#'=blocked
     */
    loadFromString(str: string): void {
        const lines = str.trim().split('\n');

        for (let y = 0; y < Math.min(lines.length, this.height); y++) {
            const line = lines[y];
            for (let x = 0; x < Math.min(line.length, this.width); x++) {
                this.nodes[y][x].walkable = line[x] !== '#';
            }
        }
    }

    /**
     * @zh 导出为字符串
     * @en Export to string
     */
    toString(): string {
        let result = '';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                result += this.nodes[y][x].walkable ? '.' : '#';
            }
            result += '\n';
        }

        return result;
    }

    /**
     * @zh 重置所有节点为可通行
     * @en Reset all nodes to walkable
     */
    reset(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.nodes[y][x].walkable = true;
                this.nodes[y][x].cost = 1;
            }
        }
    }

    /**
     * @zh 设置矩形区域的通行性
     * @en Set walkability for a rectangle region
     */
    setRectWalkable(
        x: number,
        y: number,
        width: number,
        height: number,
        walkable: boolean
    ): void {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                this.setWalkable(x + dx, y + dy, walkable);
            }
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建网格地图
 * @en Create grid map
 */
export function createGridMap(
    width: number,
    height: number,
    options?: IGridMapOptions
): GridMap {
    return new GridMap(width, height, options);
}

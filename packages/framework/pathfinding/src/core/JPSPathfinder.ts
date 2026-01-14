/**
 * @zh JPS (Jump Point Search) 寻路算法实现
 * @en JPS (Jump Point Search) Pathfinding Algorithm Implementation
 *
 * @zh JPS 是 A* 的优化版本，通过跳跃点剪枝大幅提升开放地形的搜索效率
 * @en JPS is an optimized version of A* that significantly improves search efficiency on open terrain through jump point pruning
 */

import { BinaryHeap } from './BinaryHeap';
import type {
    IPathfindingMap,
    IPathNode,
    IPoint,
    IPathResult,
    IPathfinder,
    IPathfindingOptions
} from './IPathfinding';
import { DEFAULT_PATHFINDING_OPTIONS, EMPTY_PATH_RESULT } from './IPathfinding';

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh JPS 节点
 * @en JPS Node
 */
interface JPSNode {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent: JPSNode | null;
    closed: boolean;
}

// =============================================================================
// JPS 寻路器 | JPS Pathfinder
// =============================================================================

/**
 * @zh JPS 寻路器
 * @en JPS Pathfinder
 *
 * @zh 适用于均匀代价网格地图，在开放地形上比标准 A* 快 10-100 倍
 * @en Suitable for uniform cost grid maps, 10-100x faster than standard A* on open terrain
 *
 * @example
 * ```typescript
 * const map = createGridMap(100, 100);
 * const pathfinder = new JPSPathfinder(map);
 * const result = pathfinder.findPath(0, 0, 99, 99);
 * ```
 */
export class JPSPathfinder implements IPathfinder {
    private readonly map: IPathfindingMap;
    private readonly width: number;
    private readonly height: number;

    private openList: BinaryHeap<JPSNode>;
    private nodeGrid: (JPSNode | null)[][];

    constructor(map: IPathfindingMap) {
        this.map = map;

        // 获取地图尺寸
        const bounds = this.getMapBounds();
        this.width = bounds.width;
        this.height = bounds.height;

        this.openList = new BinaryHeap<JPSNode>((a, b) => a.f - b.f);
        this.nodeGrid = [];
    }

    /**
     * @zh 寻找路径
     * @en Find path
     */
    findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: Partial<IPathfindingOptions>
    ): IPathResult {
        const opts = { ...DEFAULT_PATHFINDING_OPTIONS, ...options };

        // 验证起点和终点
        if (!this.map.isWalkable(startX, startY) || !this.map.isWalkable(endX, endY)) {
            return EMPTY_PATH_RESULT;
        }

        // 相同位置
        if (startX === endX && startY === endY) {
            return {
                found: true,
                path: [{ x: startX, y: startY }],
                cost: 0,
                nodesSearched: 1
            };
        }

        // 初始化
        this.initGrid();
        this.openList.clear();

        const startNode = this.getOrCreateNode(startX, startY);
        startNode.g = 0;
        startNode.h = this.heuristic(startX, startY, endX, endY) * opts.heuristicWeight;
        startNode.f = startNode.h;
        this.openList.push(startNode);

        let nodesSearched = 0;

        while (!this.openList.isEmpty && nodesSearched < opts.maxNodes) {
            const current = this.openList.pop()!;
            current.closed = true;
            nodesSearched++;

            // 到达终点
            if (current.x === endX && current.y === endY) {
                return {
                    found: true,
                    path: this.buildPath(current),
                    cost: current.g,
                    nodesSearched
                };
            }

            // 查找跳跃点
            this.identifySuccessors(current, endX, endY, opts);
        }

        return {
            found: false,
            path: [],
            cost: 0,
            nodesSearched
        };
    }

    /**
     * @zh 清理状态
     * @en Clear state
     */
    clear(): void {
        this.openList.clear();
        this.nodeGrid = [];
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 获取地图边界
     * @en Get map bounds
     */
    private getMapBounds(): { width: number; height: number } {
        // 尝试从地图获取尺寸
        const mapAny = this.map as any;
        if (typeof mapAny.width === 'number' && typeof mapAny.height === 'number') {
            return { width: mapAny.width, height: mapAny.height };
        }
        // 默认尺寸
        return { width: 1000, height: 1000 };
    }

    /**
     * @zh 初始化节点网格
     * @en Initialize node grid
     */
    private initGrid(): void {
        this.nodeGrid = [];
        for (let i = 0; i < this.width; i++) {
            this.nodeGrid[i] = [];
        }
    }

    /**
     * @zh 获取或创建节点
     * @en Get or create node
     */
    private getOrCreateNode(x: number, y: number): JPSNode {
        // Bounds check to ensure valid array indices
        const xi = x | 0;
        const yi = y | 0;
        if (xi < 0 || xi >= this.width || yi < 0 || yi >= this.height) {
            throw new Error('[JPSPathfinder] Invalid grid coordinates');
        }
        if (!this.nodeGrid[xi]) {
            this.nodeGrid[xi] = [];
        }
        if (!this.nodeGrid[xi][yi]) {
            this.nodeGrid[xi][yi] = {
                x: xi,
                y: yi,
                g: Infinity,
                h: 0,
                f: Infinity,
                parent: null,
                closed: false
            };
        }
        return this.nodeGrid[xi][yi]!;
    }

    /**
     * @zh 启发式函数（八方向距离）
     * @en Heuristic function (octile distance)
     */
    private heuristic(x1: number, y1: number, x2: number, y2: number): number {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }

    /**
     * @zh 识别后继节点（跳跃点）
     * @en Identify successors (jump points)
     */
    private identifySuccessors(
        node: JPSNode,
        endX: number,
        endY: number,
        opts: Required<IPathfindingOptions>
    ): void {
        const neighbors = this.findNeighbors(node);

        for (const neighbor of neighbors) {
            const jumpPoint = this.jump(
                neighbor.x,
                neighbor.y,
                node.x,
                node.y,
                endX,
                endY
            );

            if (jumpPoint) {
                const jx = jumpPoint.x;
                const jy = jumpPoint.y;

                const jpNode = this.getOrCreateNode(jx, jy);
                if (jpNode.closed) continue;

                const dx = Math.abs(jx - node.x);
                const dy = Math.abs(jy - node.y);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const tentativeG = node.g + distance;

                if (tentativeG < jpNode.g) {
                    jpNode.g = tentativeG;
                    jpNode.h = this.heuristic(jx, jy, endX, endY) * opts.heuristicWeight;
                    jpNode.f = jpNode.g + jpNode.h;
                    jpNode.parent = node;

                    if (!this.openList.contains(jpNode)) {
                        this.openList.push(jpNode);
                    } else {
                        this.openList.update(jpNode);
                    }
                }
            }
        }
    }

    /**
     * @zh 查找邻居（根据父节点方向剪枝）
     * @en Find neighbors (pruned based on parent direction)
     */
    private findNeighbors(node: JPSNode): IPoint[] {
        const { x, y, parent } = node;
        const neighbors: IPoint[] = [];

        // 无父节点，返回所有可通行邻居
        if (!parent) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (this.isWalkableAt(nx, ny)) {
                        // 对角线移动检查
                        if (dx !== 0 && dy !== 0) {
                            if (this.isWalkableAt(x + dx, y) || this.isWalkableAt(x, y + dy)) {
                                neighbors.push({ x: nx, y: ny });
                            }
                        } else {
                            neighbors.push({ x: nx, y: ny });
                        }
                    }
                }
            }
            return neighbors;
        }

        // 有父节点，根据方向剪枝
        const dx = Math.sign(x - parent.x);
        const dy = Math.sign(y - parent.y);

        // 对角线移动
        if (dx !== 0 && dy !== 0) {
            // 自然邻居
            if (this.isWalkableAt(x, y + dy)) {
                neighbors.push({ x, y: y + dy });
            }
            if (this.isWalkableAt(x + dx, y)) {
                neighbors.push({ x: x + dx, y });
            }
            if (this.isWalkableAt(x, y + dy) || this.isWalkableAt(x + dx, y)) {
                if (this.isWalkableAt(x + dx, y + dy)) {
                    neighbors.push({ x: x + dx, y: y + dy });
                }
            }

            // 强制邻居
            if (!this.isWalkableAt(x - dx, y) && this.isWalkableAt(x, y + dy)) {
                if (this.isWalkableAt(x - dx, y + dy)) {
                    neighbors.push({ x: x - dx, y: y + dy });
                }
            }
            if (!this.isWalkableAt(x, y - dy) && this.isWalkableAt(x + dx, y)) {
                if (this.isWalkableAt(x + dx, y - dy)) {
                    neighbors.push({ x: x + dx, y: y - dy });
                }
            }
        }
        // 水平移动
        else if (dx !== 0) {
            if (this.isWalkableAt(x + dx, y)) {
                neighbors.push({ x: x + dx, y });

                // 强制邻居
                if (!this.isWalkableAt(x, y + 1) && this.isWalkableAt(x + dx, y + 1)) {
                    neighbors.push({ x: x + dx, y: y + 1 });
                }
                if (!this.isWalkableAt(x, y - 1) && this.isWalkableAt(x + dx, y - 1)) {
                    neighbors.push({ x: x + dx, y: y - 1 });
                }
            }
        }
        // 垂直移动
        else if (dy !== 0) {
            if (this.isWalkableAt(x, y + dy)) {
                neighbors.push({ x, y: y + dy });

                // 强制邻居
                if (!this.isWalkableAt(x + 1, y) && this.isWalkableAt(x + 1, y + dy)) {
                    neighbors.push({ x: x + 1, y: y + dy });
                }
                if (!this.isWalkableAt(x - 1, y) && this.isWalkableAt(x - 1, y + dy)) {
                    neighbors.push({ x: x - 1, y: y + dy });
                }
            }
        }

        return neighbors;
    }

    /**
     * @zh 跳跃函数（迭代版本，避免递归开销）
     * @en Jump function (iterative version to avoid recursion overhead)
     */
    private jump(
        startX: number,
        startY: number,
        px: number,
        py: number,
        endX: number,
        endY: number
    ): IPoint | null {
        const dx = startX - px;
        const dy = startY - py;

        let x = startX;
        let y = startY;

        while (true) {
            if (!this.isWalkableAt(x, y)) {
                return null;
            }

            if (x === endX && y === endY) {
                return { x, y };
            }

            if (dx !== 0 && dy !== 0) {
                if ((this.isWalkableAt(x - dx, y + dy) && !this.isWalkableAt(x - dx, y)) ||
                    (this.isWalkableAt(x + dx, y - dy) && !this.isWalkableAt(x, y - dy))) {
                    return { x, y };
                }

                if (this.jumpStraight(x + dx, y, dx, 0, endX, endY) ||
                    this.jumpStraight(x, y + dy, 0, dy, endX, endY)) {
                    return { x, y };
                }

                if (!this.isWalkableAt(x + dx, y) && !this.isWalkableAt(x, y + dy)) {
                    return null;
                }
            } else if (dx !== 0) {
                if ((this.isWalkableAt(x + dx, y + 1) && !this.isWalkableAt(x, y + 1)) ||
                    (this.isWalkableAt(x + dx, y - 1) && !this.isWalkableAt(x, y - 1))) {
                    return { x, y };
                }
            } else if (dy !== 0) {
                if ((this.isWalkableAt(x + 1, y + dy) && !this.isWalkableAt(x + 1, y)) ||
                    (this.isWalkableAt(x - 1, y + dy) && !this.isWalkableAt(x - 1, y))) {
                    return { x, y };
                }
            }

            x += dx;
            y += dy;
        }
    }

    /**
     * @zh 直线跳跃（水平或垂直方向）
     * @en Straight jump (horizontal or vertical direction)
     */
    private jumpStraight(
        startX: number,
        startY: number,
        dx: number,
        dy: number,
        endX: number,
        endY: number
    ): boolean {
        let x = startX;
        let y = startY;

        while (true) {
            if (!this.isWalkableAt(x, y)) {
                return false;
            }

            if (x === endX && y === endY) {
                return true;
            }

            if (dx !== 0) {
                if ((this.isWalkableAt(x + dx, y + 1) && !this.isWalkableAt(x, y + 1)) ||
                    (this.isWalkableAt(x + dx, y - 1) && !this.isWalkableAt(x, y - 1))) {
                    return true;
                }
            } else if (dy !== 0) {
                if ((this.isWalkableAt(x + 1, y + dy) && !this.isWalkableAt(x + 1, y)) ||
                    (this.isWalkableAt(x - 1, y + dy) && !this.isWalkableAt(x - 1, y))) {
                    return true;
                }
            }

            x += dx;
            y += dy;
        }
    }

    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     */
    private isWalkableAt(x: number, y: number): boolean {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.map.isWalkable(x, y);
    }

    /**
     * @zh 构建路径
     * @en Build path
     */
    private buildPath(endNode: JPSNode): IPoint[] {
        const path: IPoint[] = [];
        let current: JPSNode | null = endNode;

        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }

        // 插值跳跃点之间的路径
        return this.interpolatePath(path);
    }

    /**
     * @zh 插值路径（在跳跃点之间填充中间点）
     * @en Interpolate path (fill intermediate points between jump points)
     */
    private interpolatePath(jumpPoints: IPoint[]): IPoint[] {
        if (jumpPoints.length < 2) {
            return jumpPoints;
        }

        const path: IPoint[] = [jumpPoints[0]];

        for (let i = 1; i < jumpPoints.length; i++) {
            const prev = jumpPoints[i - 1];
            const curr = jumpPoints[i];

            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const steps = Math.max(Math.abs(dx), Math.abs(dy));

            const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
            const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

            let x = prev.x;
            let y = prev.y;

            for (let j = 0; j < steps; j++) {
                // 优先对角移动
                if (x !== curr.x && y !== curr.y) {
                    x += stepX;
                    y += stepY;
                } else if (x !== curr.x) {
                    x += stepX;
                } else if (y !== curr.y) {
                    y += stepY;
                }

                if (x !== prev.x || y !== prev.y) {
                    path.push({ x, y });
                }
            }
        }

        return path;
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建 JPS 寻路器
 * @en Create JPS pathfinder
 *
 * @param map - @zh 寻路地图实例 @en Pathfinding map instance
 * @returns @zh JPS 寻路器实例 @en JPS pathfinder instance
 */
export function createJPSPathfinder(map: IPathfindingMap): JPSPathfinder {
    return new JPSPathfinder(map);
}

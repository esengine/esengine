/**
 * @zh 导航网格实现
 * @en NavMesh Implementation
 *
 * @zh 支持动态障碍物：可以临时禁用多边形或添加圆形/矩形障碍物
 * @en Supports dynamic obstacles: can temporarily disable polygons or add circular/rectangular obstacles
 */

import type {
    IPathfindingMap,
    IPathNode,
    IPoint,
    IPathResult,
    IPathfindingOptions
} from '../core/IPathfinding';
import { createPoint, euclideanDistance, EMPTY_PATH_RESULT, DEFAULT_PATHFINDING_OPTIONS } from '../core/IPathfinding';
import { BinaryHeap } from '../core/BinaryHeap';

// =============================================================================
// 动态障碍物 | Dynamic Obstacles
// =============================================================================

/**
 * @zh 动态障碍物类型
 * @en Dynamic obstacle type
 */
export type ObstacleType = 'circle' | 'rect' | 'polygon';

/**
 * @zh 动态障碍物
 * @en Dynamic obstacle
 */
export interface IDynamicObstacle {
    /**
     * @zh 障碍物 ID
     * @en Obstacle ID
     */
    readonly id: number;

    /**
     * @zh 障碍物类型
     * @en Obstacle type
     */
    readonly type: ObstacleType;

    /**
     * @zh 是否启用
     * @en Whether enabled
     */
    enabled: boolean;

    /**
     * @zh 位置（圆形和矩形的中心）
     * @en Position (center for circle and rect)
     */
    position: IPoint;

    /**
     * @zh 半径（圆形）或半宽/半高（矩形）
     * @en Radius (circle) or half-width/half-height (rect)
     */
    radius?: number;
    halfWidth?: number;
    halfHeight?: number;

    /**
     * @zh 顶点（多边形）
     * @en Vertices (polygon)
     */
    vertices?: readonly IPoint[];
}

// =============================================================================
// 导航多边形 | Navigation Polygon
// =============================================================================

/**
 * @zh 导航多边形
 * @en Navigation polygon
 */
export interface INavPolygon {
    /** @zh 多边形ID @en Polygon ID */
    readonly id: number;
    /** @zh 顶点列表 @en Vertex list */
    readonly vertices: readonly IPoint[];
    /** @zh 中心点 @en Center point */
    readonly center: IPoint;
    /** @zh 邻居多边形ID @en Neighbor polygon IDs */
    readonly neighbors: readonly number[];
    /** @zh 到邻居的共享边 @en Shared edges to neighbors */
    readonly portals: ReadonlyMap<number, IPortal>;
}

/**
 * @zh 入口（两个多边形之间的共享边）
 * @en Portal (shared edge between two polygons)
 */
export interface IPortal {
    /** @zh 边的左端点 @en Left endpoint of edge */
    readonly left: IPoint;
    /** @zh 边的右端点 @en Right endpoint of edge */
    readonly right: IPoint;
}

// =============================================================================
// 导航网格节点 | NavMesh Node
// =============================================================================

/**
 * @zh 导航网格节点（包装多边形）
 * @en NavMesh node (wraps polygon)
 */
class NavMeshNode implements IPathNode {
    readonly id: number;
    readonly position: IPoint;
    readonly cost: number;
    readonly walkable: boolean;
    readonly polygon: INavPolygon;

    constructor(polygon: INavPolygon) {
        this.id = polygon.id;
        this.position = polygon.center;
        this.cost = 1;
        this.walkable = true;
        this.polygon = polygon;
    }
}

// =============================================================================
// 导航网格 | Navigation Mesh
// =============================================================================

/**
 * @zh 导航网格
 * @en Navigation Mesh
 *
 * @zh 使用凸多边形网格进行高效寻路，适合复杂地形
 * @en Uses convex polygon mesh for efficient pathfinding, suitable for complex terrain
 *
 * @example
 * ```typescript
 * const navmesh = new NavMesh();
 *
 * // Add polygons
 * navmesh.addPolygon([
 *     { x: 0, y: 0 }, { x: 10, y: 0 },
 *     { x: 10, y: 10 }, { x: 0, y: 10 }
 * ]);
 *
 * // Build connections
 * navmesh.build();
 *
 * // Find path
 * const result = navmesh.findPath(1, 1, 8, 8);
 * ```
 */
export class NavMesh implements IPathfindingMap {
    private polygons: Map<number, INavPolygon> = new Map();
    private nodes: Map<number, NavMeshNode> = new Map();
    private nextId = 0;

    // @zh 动态障碍物支持
    // @en Dynamic obstacle support
    private obstacles: Map<number, IDynamicObstacle> = new Map();
    private nextObstacleId = 0;
    private disabledPolygons: Set<number> = new Set();

    /**
     * @zh 添加导航多边形
     * @en Add navigation polygon
     *
     * @returns @zh 多边形ID @en Polygon ID
     */
    addPolygon(vertices: IPoint[], neighbors: number[] = []): number {
        const id = this.nextId++;
        const center = this.calculateCenter(vertices);

        const polygon: INavPolygon = {
            id,
            vertices,
            center,
            neighbors,
            portals: new Map()
        };

        this.polygons.set(id, polygon);
        this.nodes.set(id, new NavMeshNode(polygon));

        return id;
    }

    /**
     * @zh 设置两个多边形之间的连接
     * @en Set connection between two polygons
     */
    setConnection(
        polyA: number,
        polyB: number,
        portal: IPortal
    ): void {
        const polygonA = this.polygons.get(polyA);
        const polygonB = this.polygons.get(polyB);

        if (!polygonA || !polygonB) {
            return;
        }

        // Update neighbors and portals
        const neighborsA = [...polygonA.neighbors];
        const portalsA = new Map(polygonA.portals);

        if (!neighborsA.includes(polyB)) {
            neighborsA.push(polyB);
        }
        portalsA.set(polyB, portal);

        this.polygons.set(polyA, {
            ...polygonA,
            neighbors: neighborsA,
            portals: portalsA
        });

        // Reverse portal for the other direction
        const reversePortal: IPortal = {
            left: portal.right,
            right: portal.left
        };

        const neighborsB = [...polygonB.neighbors];
        const portalsB = new Map(polygonB.portals);

        if (!neighborsB.includes(polyA)) {
            neighborsB.push(polyA);
        }
        portalsB.set(polyA, reversePortal);

        this.polygons.set(polyB, {
            ...polygonB,
            neighbors: neighborsB,
            portals: portalsB
        });
    }

    /**
     * @zh 自动检测并建立相邻多边形的连接
     * @en Auto-detect and build connections between adjacent polygons
     */
    build(): void {
        const polygonList = Array.from(this.polygons.values());

        for (let i = 0; i < polygonList.length; i++) {
            for (let j = i + 1; j < polygonList.length; j++) {
                const polyA = polygonList[i];
                const polyB = polygonList[j];

                const sharedEdge = this.findSharedEdge(polyA.vertices, polyB.vertices);

                if (sharedEdge) {
                    this.setConnection(polyA.id, polyB.id, sharedEdge);
                }
            }
        }
    }

    /**
     * @zh 查找两个多边形的共享边
     * @en Find shared edge between two polygons
     */
    private findSharedEdge(
        verticesA: readonly IPoint[],
        verticesB: readonly IPoint[]
    ): IPortal | null {
        const epsilon = 0.0001;

        for (let i = 0; i < verticesA.length; i++) {
            const a1 = verticesA[i];
            const a2 = verticesA[(i + 1) % verticesA.length];

            for (let j = 0; j < verticesB.length; j++) {
                const b1 = verticesB[j];
                const b2 = verticesB[(j + 1) % verticesB.length];

                // Check if edges match (in either direction)
                const match1 =
                    Math.abs(a1.x - b2.x) < epsilon &&
                    Math.abs(a1.y - b2.y) < epsilon &&
                    Math.abs(a2.x - b1.x) < epsilon &&
                    Math.abs(a2.y - b1.y) < epsilon;

                const match2 =
                    Math.abs(a1.x - b1.x) < epsilon &&
                    Math.abs(a1.y - b1.y) < epsilon &&
                    Math.abs(a2.x - b2.x) < epsilon &&
                    Math.abs(a2.y - b2.y) < epsilon;

                if (match1 || match2) {
                    return {
                        left: a1,
                        right: a2
                    };
                }
            }
        }

        return null;
    }

    /**
     * @zh 计算多边形中心
     * @en Calculate polygon center
     */
    private calculateCenter(vertices: readonly IPoint[]): IPoint {
        let x = 0;
        let y = 0;

        for (const v of vertices) {
            x += v.x;
            y += v.y;
        }

        return createPoint(x / vertices.length, y / vertices.length);
    }

    /**
     * @zh 查找包含点的多边形
     * @en Find polygon containing point
     */
    findPolygonAt(x: number, y: number): INavPolygon | null {
        for (const polygon of this.polygons.values()) {
            if (this.isPointInPolygon(x, y, polygon.vertices)) {
                return polygon;
            }
        }
        return null;
    }

    /**
     * @zh 检查点是否在多边形内
     * @en Check if point is inside polygon
     */
    private isPointInPolygon(x: number, y: number, vertices: readonly IPoint[]): boolean {
        let inside = false;
        const n = vertices.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;

            if (
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
            ) {
                inside = !inside;
            }
        }

        return inside;
    }

    // ==========================================================================
    // IPathfindingMap 接口实现 | IPathfindingMap Interface Implementation
    // ==========================================================================

    getNodeAt(x: number, y: number): IPathNode | null {
        const polygon = this.findPolygonAt(x, y);
        return polygon ? this.nodes.get(polygon.id) ?? null : null;
    }

    getNeighbors(node: IPathNode): IPathNode[] {
        const navNode = node as NavMeshNode;
        const neighbors: IPathNode[] = [];

        for (const neighborId of navNode.polygon.neighbors) {
            const neighbor = this.nodes.get(neighborId);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    heuristic(a: IPoint, b: IPoint): number {
        return euclideanDistance(a, b);
    }

    getMovementCost(from: IPathNode, to: IPathNode): number {
        return euclideanDistance(from.position, to.position);
    }

    isWalkable(x: number, y: number): boolean {
        return this.findPolygonAt(x, y) !== null;
    }

    // ==========================================================================
    // 寻路 | Pathfinding
    // ==========================================================================

    /**
     * @zh 在导航网格上寻路
     * @en Find path on navigation mesh
     */
    findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        const opts = { ...DEFAULT_PATHFINDING_OPTIONS, ...options };

        const startPolygon = this.findPolygonAt(startX, startY);
        const endPolygon = this.findPolygonAt(endX, endY);

        if (!startPolygon || !endPolygon) {
            return EMPTY_PATH_RESULT;
        }

        // Same polygon
        if (startPolygon.id === endPolygon.id) {
            return {
                found: true,
                path: [createPoint(startX, startY), createPoint(endX, endY)],
                cost: euclideanDistance(
                    createPoint(startX, startY),
                    createPoint(endX, endY)
                ),
                nodesSearched: 1
            };
        }

        // A* on polygon graph
        const polygonPath = this.findPolygonPath(startPolygon, endPolygon, opts);

        if (!polygonPath.found) {
            return EMPTY_PATH_RESULT;
        }

        // Convert polygon path to point path using funnel algorithm
        const start = createPoint(startX, startY);
        const end = createPoint(endX, endY);
        const pointPath = this.funnelPath(start, end, polygonPath.polygons, opts.agentRadius);

        return {
            found: true,
            path: pointPath,
            cost: this.calculatePathLength(pointPath),
            nodesSearched: polygonPath.nodesSearched
        };
    }

    /**
     * @zh 在多边形图上寻路
     * @en Find path on polygon graph
     *
     * @param start - @zh 起始多边形 @en Start polygon
     * @param end - @zh 目标多边形 @en End polygon
     * @param opts - @zh 寻路选项 @en Pathfinding options
     * @param checkObstacles - @zh 是否检查障碍物 @en Whether to check obstacles
     */
    private findPolygonPath(
        start: INavPolygon,
        end: INavPolygon,
        opts: Required<IPathfindingOptions>,
        checkObstacles: boolean = false
    ): { found: boolean; polygons: INavPolygon[]; nodesSearched: number } {
        interface AStarState {
            polygon: INavPolygon;
            g: number;
            f: number;
            parent: AStarState | null;
        }

        const openList = new BinaryHeap<AStarState>((a, b) => a.f - b.f);
        const closed = new Set<number>();
        const states = new Map<number, AStarState>();

        const startState: AStarState = {
            polygon: start,
            g: 0,
            f: euclideanDistance(start.center, end.center) * opts.heuristicWeight,
            parent: null
        };

        states.set(start.id, startState);
        openList.push(startState);

        let nodesSearched = 0;

        while (!openList.isEmpty && nodesSearched < opts.maxNodes) {
            const current = openList.pop()!;
            nodesSearched++;

            if (current.polygon.id === end.id) {
                // Reconstruct path
                const path: INavPolygon[] = [];
                let state: AStarState | null = current;

                while (state) {
                    path.unshift(state.polygon);
                    state = state.parent;
                }

                return { found: true, polygons: path, nodesSearched };
            }

            closed.add(current.polygon.id);

            for (const neighborId of current.polygon.neighbors) {
                if (closed.has(neighborId)) {
                    continue;
                }

                // @zh 检查障碍物：跳过被阻挡或禁用的多边形
                // @en Check obstacles: skip blocked or disabled polygons
                if (checkObstacles && this.isPolygonBlocked(neighborId)) {
                    continue;
                }

                const neighborPolygon = this.polygons.get(neighborId);
                if (!neighborPolygon) {
                    continue;
                }

                const g = current.g + euclideanDistance(
                    current.polygon.center,
                    neighborPolygon.center
                );

                let neighborState = states.get(neighborId);

                if (!neighborState) {
                    neighborState = {
                        polygon: neighborPolygon,
                        g,
                        f: g + euclideanDistance(neighborPolygon.center, end.center) * opts.heuristicWeight,
                        parent: current
                    };
                    states.set(neighborId, neighborState);
                    openList.push(neighborState);
                } else if (g < neighborState.g) {
                    neighborState.g = g;
                    neighborState.f = g + euclideanDistance(neighborPolygon.center, end.center) * opts.heuristicWeight;
                    neighborState.parent = current;
                    openList.update(neighborState);
                }
            }
        }

        return { found: false, polygons: [], nodesSearched };
    }

    /**
     * @zh 使用漏斗算法优化路径（支持代理半径）
     * @en Optimize path using funnel algorithm (supports agent radius)
     *
     * @param start - @zh 起点 @en Start point
     * @param end - @zh 终点 @en End point
     * @param polygons - @zh 多边形路径 @en Polygon path
     * @param agentRadius - @zh 代理半径 @en Agent radius
     */
    private funnelPath(
        start: IPoint,
        end: IPoint,
        polygons: INavPolygon[],
        agentRadius: number = 0
    ): IPoint[] {
        if (polygons.length <= 1) {
            return [start, end];
        }

        // Collect and shrink portals
        const portals: { left: IPoint; right: IPoint; originalLeft: IPoint; originalRight: IPoint }[] = [];

        for (let i = 0; i < polygons.length - 1; i++) {
            const portal = polygons[i].portals.get(polygons[i + 1].id);
            if (portal) {
                if (agentRadius > 0) {
                    const shrunk = this.shrinkPortal(portal.left, portal.right, agentRadius);
                    portals.push({
                        left: shrunk.left,
                        right: shrunk.right,
                        originalLeft: portal.left,
                        originalRight: portal.right
                    });
                } else {
                    portals.push({
                        left: portal.left,
                        right: portal.right,
                        originalLeft: portal.left,
                        originalRight: portal.right
                    });
                }
            }
        }

        if (portals.length === 0) {
            return [start, end];
        }

        // Simple string pulling algorithm with radius-aware turning points
        const path: IPoint[] = [start];

        let apex = start;
        let apexOriginal = start;
        let leftIndex = 0;
        let rightIndex = 0;
        let left = portals[0].left;
        let right = portals[0].right;
        let leftOriginal = portals[0].originalLeft;
        let rightOriginal = portals[0].originalRight;

        for (let i = 1; i <= portals.length; i++) {
            const nextLeft = i < portals.length ? portals[i].left : end;
            const nextRight = i < portals.length ? portals[i].right : end;

            // Update right
            if (this.triArea2(apex, right, nextRight) <= 0) {
                if (this.pointsEqual(apex, right) || this.triArea2(apex, left, nextRight) > 0) {
                    right = nextRight;
                    rightIndex = i;
                    if (i < portals.length) {
                        rightOriginal = portals[i].originalRight;
                    }
                } else {
                    // Add turning point with radius offset
                    const turnPoint = agentRadius > 0
                        ? this.offsetTurningPoint(apexOriginal, leftOriginal, left, agentRadius, 'left')
                        : left;
                    path.push(turnPoint);

                    apex = left;
                    apexOriginal = leftOriginal;
                    leftIndex = rightIndex = leftIndex;
                    left = right = apex;
                    leftOriginal = rightOriginal = apexOriginal;
                    i = leftIndex;
                    continue;
                }
            }

            // Update left
            if (this.triArea2(apex, left, nextLeft) >= 0) {
                if (this.pointsEqual(apex, left) || this.triArea2(apex, right, nextLeft) < 0) {
                    left = nextLeft;
                    leftIndex = i;
                    if (i < portals.length) {
                        leftOriginal = portals[i].originalLeft;
                    }
                } else {
                    // Add turning point with radius offset
                    const turnPoint = agentRadius > 0
                        ? this.offsetTurningPoint(apexOriginal, rightOriginal, right, agentRadius, 'right')
                        : right;
                    path.push(turnPoint);

                    apex = right;
                    apexOriginal = rightOriginal;
                    leftIndex = rightIndex = rightIndex;
                    left = right = apex;
                    leftOriginal = rightOriginal = apexOriginal;
                    i = rightIndex;
                    continue;
                }
            }
        }

        path.push(end);

        return path;
    }

    /**
     * @zh 收缩 portal（将两端点向内移动 agentRadius）
     * @en Shrink portal (move endpoints inward by agentRadius)
     */
    private shrinkPortal(left: IPoint, right: IPoint, radius: number): { left: IPoint; right: IPoint } {
        const dx = right.x - left.x;
        const dy = right.y - left.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len <= radius * 2) {
            // Portal too narrow, return center point
            const cx = (left.x + right.x) / 2;
            const cy = (left.y + right.y) / 2;
            return {
                left: createPoint(cx, cy),
                right: createPoint(cx, cy)
            };
        }

        // Normalize direction
        const nx = dx / len;
        const ny = dy / len;

        // Shrink both endpoints inward
        return {
            left: createPoint(left.x + nx * radius, left.y + ny * radius),
            right: createPoint(right.x - nx * radius, right.y - ny * radius)
        };
    }

    /**
     * @zh 偏移拐点以保持与角落的距离
     * @en Offset turning point to maintain distance from corner
     *
     * @param prevApex - @zh 上一个顶点 @en Previous apex
     * @param cornerOriginal - @zh 原始角落位置 @en Original corner position
     * @param cornerShrunk - @zh 收缩后的角落位置 @en Shrunk corner position
     * @param radius - @zh 代理半径 @en Agent radius
     * @param side - @zh 转向侧 ('left' 或 'right') @en Turn side ('left' or 'right')
     */
    private offsetTurningPoint(
        prevApex: IPoint,
        cornerOriginal: IPoint,
        cornerShrunk: IPoint,
        radius: number,
        side: 'left' | 'right'
    ): IPoint {
        // Direction from previous apex to corner
        const dx = cornerOriginal.x - prevApex.x;
        const dy = cornerOriginal.y - prevApex.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len < 0.0001) {
            return cornerShrunk;
        }

        // Perpendicular direction (pointing into the walkable area)
        // For left turn, perpendicular is to the right of the direction
        // For right turn, perpendicular is to the left of the direction
        let perpX: number, perpY: number;
        if (side === 'left') {
            perpX = dy / len;
            perpY = -dx / len;
        } else {
            perpX = -dy / len;
            perpY = dx / len;
        }

        // Offset the shrunk corner by radius in the perpendicular direction
        // This ensures the agent's circular body clears the corner
        return createPoint(
            cornerShrunk.x + perpX * radius,
            cornerShrunk.y + perpY * radius
        );
    }

    /**
     * @zh 检查两点是否相等
     * @en Check if two points are equal
     */
    private pointsEqual(a: IPoint, b: IPoint): boolean {
        return Math.abs(a.x - b.x) < 0.0001 && Math.abs(a.y - b.y) < 0.0001;
    }

    /**
     * @zh 计算三角形面积的两倍（用于判断点的相对位置）
     * @en Calculate twice the triangle area (for point relative position)
     */
    private triArea2(a: IPoint, b: IPoint, c: IPoint): number {
        return (c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y);
    }

    /**
     * @zh 计算路径总长度
     * @en Calculate total path length
     */
    private calculatePathLength(path: readonly IPoint[]): number {
        let length = 0;

        for (let i = 1; i < path.length; i++) {
            length += euclideanDistance(path[i - 1], path[i]);
        }

        return length;
    }

    // =========================================================================
    // 动态障碍物管理 | Dynamic Obstacle Management
    // =========================================================================

    /**
     * @zh 添加圆形障碍物
     * @en Add circular obstacle
     *
     * @param x - @zh 中心 X @en Center X
     * @param y - @zh 中心 Y @en Center Y
     * @param radius - @zh 半径 @en Radius
     * @returns @zh 障碍物 ID @en Obstacle ID
     */
    addCircleObstacle(x: number, y: number, radius: number): number {
        const id = this.nextObstacleId++;
        this.obstacles.set(id, {
            id,
            type: 'circle',
            enabled: true,
            position: createPoint(x, y),
            radius
        });
        return id;
    }

    /**
     * @zh 添加矩形障碍物
     * @en Add rectangular obstacle
     *
     * @param x - @zh 中心 X @en Center X
     * @param y - @zh 中心 Y @en Center Y
     * @param halfWidth - @zh 半宽 @en Half width
     * @param halfHeight - @zh 半高 @en Half height
     * @returns @zh 障碍物 ID @en Obstacle ID
     */
    addRectObstacle(x: number, y: number, halfWidth: number, halfHeight: number): number {
        const id = this.nextObstacleId++;
        this.obstacles.set(id, {
            id,
            type: 'rect',
            enabled: true,
            position: createPoint(x, y),
            halfWidth,
            halfHeight
        });
        return id;
    }

    /**
     * @zh 添加多边形障碍物
     * @en Add polygon obstacle
     *
     * @param vertices - @zh 顶点列表 @en Vertex list
     * @returns @zh 障碍物 ID @en Obstacle ID
     */
    addPolygonObstacle(vertices: IPoint[]): number {
        const id = this.nextObstacleId++;
        const center = this.calculateCenter(vertices);
        this.obstacles.set(id, {
            id,
            type: 'polygon',
            enabled: true,
            position: center,
            vertices
        });
        return id;
    }

    /**
     * @zh 移除障碍物
     * @en Remove obstacle
     */
    removeObstacle(obstacleId: number): boolean {
        return this.obstacles.delete(obstacleId);
    }

    /**
     * @zh 启用/禁用障碍物
     * @en Enable/disable obstacle
     */
    setObstacleEnabled(obstacleId: number, enabled: boolean): void {
        const obstacle = this.obstacles.get(obstacleId);
        if (obstacle) {
            obstacle.enabled = enabled;
        }
    }

    /**
     * @zh 更新障碍物位置
     * @en Update obstacle position
     */
    updateObstaclePosition(obstacleId: number, x: number, y: number): void {
        const obstacle = this.obstacles.get(obstacleId);
        if (obstacle) {
            obstacle.position = createPoint(x, y);
        }
    }

    /**
     * @zh 获取所有障碍物
     * @en Get all obstacles
     */
    getObstacles(): IDynamicObstacle[] {
        return Array.from(this.obstacles.values());
    }

    /**
     * @zh 获取启用的障碍物
     * @en Get enabled obstacles
     */
    getEnabledObstacles(): IDynamicObstacle[] {
        return Array.from(this.obstacles.values()).filter(o => o.enabled);
    }

    /**
     * @zh 清除所有障碍物
     * @en Clear all obstacles
     */
    clearObstacles(): void {
        this.obstacles.clear();
        this.nextObstacleId = 0;
    }

    // =========================================================================
    // 多边形禁用管理 | Polygon Disable Management
    // =========================================================================

    /**
     * @zh 禁用多边形
     * @en Disable polygon
     */
    disablePolygon(polygonId: number): void {
        this.disabledPolygons.add(polygonId);
    }

    /**
     * @zh 启用多边形
     * @en Enable polygon
     */
    enablePolygon(polygonId: number): void {
        this.disabledPolygons.delete(polygonId);
    }

    /**
     * @zh 检查多边形是否被禁用
     * @en Check if polygon is disabled
     */
    isPolygonDisabled(polygonId: number): boolean {
        return this.disabledPolygons.has(polygonId);
    }

    /**
     * @zh 禁用包含指定点的多边形
     * @en Disable polygon containing specified point
     */
    disablePolygonAt(x: number, y: number): number | null {
        const polygon = this.findPolygonAt(x, y);
        if (polygon) {
            this.disablePolygon(polygon.id);
            return polygon.id;
        }
        return null;
    }

    /**
     * @zh 清除所有禁用的多边形
     * @en Clear all disabled polygons
     */
    clearDisabledPolygons(): void {
        this.disabledPolygons.clear();
    }

    /**
     * @zh 获取被禁用的多边形 ID 列表
     * @en Get list of disabled polygon IDs
     */
    getDisabledPolygons(): number[] {
        return Array.from(this.disabledPolygons);
    }

    // =========================================================================
    // 障碍物碰撞检测 | Obstacle Collision Detection
    // =========================================================================

    /**
     * @zh 检查点是否在任何障碍物内
     * @en Check if point is inside any obstacle
     */
    isPointInObstacle(x: number, y: number): boolean {
        for (const obstacle of this.obstacles.values()) {
            if (!obstacle.enabled) continue;

            if (this.isPointInSingleObstacle(x, y, obstacle)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @zh 检查点是否在单个障碍物内
     * @en Check if point is inside single obstacle
     */
    private isPointInSingleObstacle(x: number, y: number, obstacle: IDynamicObstacle): boolean {
        switch (obstacle.type) {
            case 'circle': {
                const dx = x - obstacle.position.x;
                const dy = y - obstacle.position.y;
                return dx * dx + dy * dy <= (obstacle.radius ?? 0) ** 2;
            }
            case 'rect': {
                const hw = obstacle.halfWidth ?? 0;
                const hh = obstacle.halfHeight ?? 0;
                return Math.abs(x - obstacle.position.x) <= hw &&
                       Math.abs(y - obstacle.position.y) <= hh;
            }
            case 'polygon': {
                if (!obstacle.vertices) return false;
                return this.isPointInPolygon(x, y, obstacle.vertices);
            }
            default:
                return false;
        }
    }

    /**
     * @zh 检查线段是否与任何障碍物相交
     * @en Check if line segment intersects any obstacle
     */
    doesLineIntersectObstacle(x1: number, y1: number, x2: number, y2: number): boolean {
        for (const obstacle of this.obstacles.values()) {
            if (!obstacle.enabled) continue;

            if (this.doesLineIntersectSingleObstacle(x1, y1, x2, y2, obstacle)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @zh 检查线段是否与单个障碍物相交
     * @en Check if line segment intersects single obstacle
     */
    private doesLineIntersectSingleObstacle(
        x1: number, y1: number, x2: number, y2: number,
        obstacle: IDynamicObstacle
    ): boolean {
        switch (obstacle.type) {
            case 'circle': {
                return this.lineIntersectsCircle(
                    x1, y1, x2, y2,
                    obstacle.position.x, obstacle.position.y,
                    obstacle.radius ?? 0
                );
            }
            case 'rect': {
                const hw = obstacle.halfWidth ?? 0;
                const hh = obstacle.halfHeight ?? 0;
                const minX = obstacle.position.x - hw;
                const maxX = obstacle.position.x + hw;
                const minY = obstacle.position.y - hh;
                const maxY = obstacle.position.y + hh;
                return this.lineIntersectsRect(x1, y1, x2, y2, minX, minY, maxX, maxY);
            }
            case 'polygon': {
                if (!obstacle.vertices) return false;
                return this.lineIntersectsPolygon(x1, y1, x2, y2, obstacle.vertices);
            }
            default:
                return false;
        }
    }

    /**
     * @zh 线段与圆相交检测
     * @en Line segment circle intersection
     */
    private lineIntersectsCircle(
        x1: number, y1: number, x2: number, y2: number,
        cx: number, cy: number, r: number
    ): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const fx = x1 - cx;
        const fy = y1 - cy;

        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = fx * fx + fy * fy - r * r;

        let discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return false;

        discriminant = Math.sqrt(discriminant);
        const t1 = (-b - discriminant) / (2 * a);
        const t2 = (-b + discriminant) / (2 * a);

        return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
    }

    /**
     * @zh 线段与矩形相交检测
     * @en Line segment rectangle intersection
     */
    private lineIntersectsRect(
        x1: number, y1: number, x2: number, y2: number,
        minX: number, minY: number, maxX: number, maxY: number
    ): boolean {
        // Check if either endpoint is inside
        if ((x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
            (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY)) {
            return true;
        }

        // Check intersection with each edge
        return this.lineSegmentsIntersect(x1, y1, x2, y2, minX, minY, maxX, minY) ||
               this.lineSegmentsIntersect(x1, y1, x2, y2, maxX, minY, maxX, maxY) ||
               this.lineSegmentsIntersect(x1, y1, x2, y2, maxX, maxY, minX, maxY) ||
               this.lineSegmentsIntersect(x1, y1, x2, y2, minX, maxY, minX, minY);
    }

    /**
     * @zh 线段与多边形相交检测
     * @en Line segment polygon intersection
     */
    private lineIntersectsPolygon(
        x1: number, y1: number, x2: number, y2: number,
        vertices: readonly IPoint[]
    ): boolean {
        // Check if either endpoint is inside
        if (this.isPointInPolygon(x1, y1, vertices) ||
            this.isPointInPolygon(x2, y2, vertices)) {
            return true;
        }

        // Check intersection with each edge
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            if (this.lineSegmentsIntersect(
                x1, y1, x2, y2,
                vertices[i].x, vertices[i].y,
                vertices[j].x, vertices[j].y
            )) {
                return true;
            }
        }
        return false;
    }

    /**
     * @zh 两线段相交检测
     * @en Two line segments intersection
     */
    private lineSegmentsIntersect(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): boolean {
        const d1 = this.direction(x3, y3, x4, y4, x1, y1);
        const d2 = this.direction(x3, y3, x4, y4, x2, y2);
        const d3 = this.direction(x1, y1, x2, y2, x3, y3);
        const d4 = this.direction(x1, y1, x2, y2, x4, y4);

        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }

        const epsilon = 0.0001;
        if (Math.abs(d1) < epsilon && this.onSegment(x3, y3, x4, y4, x1, y1)) return true;
        if (Math.abs(d2) < epsilon && this.onSegment(x3, y3, x4, y4, x2, y2)) return true;
        if (Math.abs(d3) < epsilon && this.onSegment(x1, y1, x2, y2, x3, y3)) return true;
        if (Math.abs(d4) < epsilon && this.onSegment(x1, y1, x2, y2, x4, y4)) return true;

        return false;
    }

    private direction(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return (x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1);
    }

    private onSegment(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean {
        return Math.min(x1, x2) <= x3 && x3 <= Math.max(x1, x2) &&
               Math.min(y1, y2) <= y3 && y3 <= Math.max(y1, y2);
    }

    // =========================================================================
    // 障碍物感知寻路 | Obstacle-Aware Pathfinding
    // =========================================================================

    /**
     * @zh 检查多边形是否被障碍物阻挡
     * @en Check if polygon is blocked by obstacle
     *
     * @zh 检查以下条件：
     * @en Checks the following conditions:
     * - @zh 多边形是否被禁用 @en Whether polygon is disabled
     * - @zh 多边形中心是否在障碍物内 @en Whether polygon center is inside obstacle
     * - @zh 多边形任意顶点是否在障碍物内 @en Whether any polygon vertex is inside obstacle
     * - @zh 多边形任意边是否与障碍物相交 @en Whether any polygon edge intersects obstacle
     */
    isPolygonBlocked(polygonId: number): boolean {
        if (this.disabledPolygons.has(polygonId)) {
            return true;
        }

        const polygon = this.polygons.get(polygonId);
        if (!polygon) return false;

        // @zh 检查中心点
        // @en Check center point
        if (this.isPointInObstacle(polygon.center.x, polygon.center.y)) {
            return true;
        }

        // @zh 检查所有顶点
        // @en Check all vertices
        for (const vertex of polygon.vertices) {
            if (this.isPointInObstacle(vertex.x, vertex.y)) {
                return true;
            }
        }

        // @zh 检查所有边是否与障碍物相交
        // @en Check if any edge intersects with obstacles
        const vertices = polygon.vertices;
        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];
            if (this.doesLineIntersectObstacle(v1.x, v1.y, v2.x, v2.y)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @zh 在导航网格上寻路（考虑障碍物）
     * @en Find path on navigation mesh (considering obstacles)
     *
     * @zh 此方法在规划阶段就考虑障碍物，自动绕过被阻挡的多边形
     * @en This method considers obstacles during planning, automatically avoiding blocked polygons
     *
     * @zh 与 findPath 不同，此方法会：
     * @en Unlike findPath, this method will:
     * - @zh 在 A* 搜索中跳过被障碍物阻挡的多边形
     * - @en Skip obstacle-blocked polygons during A* search
     * - @zh 验证起点和终点不在障碍物内
     * - @en Verify start and end points are not inside obstacles
     */
    findPathWithObstacles(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        const opts = { ...DEFAULT_PATHFINDING_OPTIONS, ...options };

        // @zh 检查起点和终点是否在障碍物内
        // @en Check if start and end are inside obstacles
        if (this.isPointInObstacle(startX, startY) || this.isPointInObstacle(endX, endY)) {
            return EMPTY_PATH_RESULT;
        }

        const startPolygon = this.findPolygonAt(startX, startY);
        const endPolygon = this.findPolygonAt(endX, endY);

        if (!startPolygon || !endPolygon) {
            return EMPTY_PATH_RESULT;
        }

        // @zh 检查起点/终点多边形是否被阻挡
        // @en Check if start/end polygons are blocked
        if (this.isPolygonBlocked(startPolygon.id) || this.isPolygonBlocked(endPolygon.id)) {
            return EMPTY_PATH_RESULT;
        }

        // @zh 同一多边形内的路径
        // @en Path within same polygon
        if (startPolygon.id === endPolygon.id) {
            const start = createPoint(startX, startY);
            const end = createPoint(endX, endY);

            // @zh 检查直线路径是否穿过障碍物
            // @en Check if direct path crosses obstacles
            if (this.doesLineIntersectObstacle(startX, startY, endX, endY)) {
                return EMPTY_PATH_RESULT;
            }

            return {
                found: true,
                path: [start, end],
                cost: euclideanDistance(start, end),
                nodesSearched: 1
            };
        }

        // @zh 使用障碍物感知的多边形路径搜索
        // @en Use obstacle-aware polygon path search
        const polygonPath = this.findPolygonPath(startPolygon, endPolygon, opts, true);

        if (!polygonPath.found) {
            return EMPTY_PATH_RESULT;
        }

        // @zh 使用 Funnel 算法生成路径点
        // @en Generate path points using Funnel algorithm
        const start = createPoint(startX, startY);
        const end = createPoint(endX, endY);
        const pointPath = this.funnelPath(start, end, polygonPath.polygons, opts.agentRadius);

        return {
            found: true,
            path: pointPath,
            cost: this.calculatePathLength(pointPath),
            nodesSearched: polygonPath.nodesSearched
        };
    }

    /**
     * @zh 清空导航网格
     * @en Clear navigation mesh
     */
    clear(): void {
        this.polygons.clear();
        this.nodes.clear();
        this.obstacles.clear();
        this.disabledPolygons.clear();
        this.nextId = 0;
        this.nextObstacleId = 0;
    }

    /**
     * @zh 获取所有多边形
     * @en Get all polygons
     */
    getPolygons(): INavPolygon[] {
        return Array.from(this.polygons.values());
    }

    /**
     * @zh 获取多边形数量
     * @en Get polygon count
     */
    get polygonCount(): number {
        return this.polygons.size;
    }

    /**
     * @zh 获取障碍物数量
     * @en Get obstacle count
     */
    get obstacleCount(): number {
        return this.obstacles.size;
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建导航网格
 * @en Create navigation mesh
 */
export function createNavMesh(): NavMesh {
    return new NavMesh();
}

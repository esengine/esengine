/**
 * @zh 导航网格实现
 * @en NavMesh Implementation
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
        const pointPath = this.funnelPath(start, end, polygonPath.polygons);

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
     */
    private findPolygonPath(
        start: INavPolygon,
        end: INavPolygon,
        opts: Required<IPathfindingOptions>
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
     * @zh 使用漏斗算法优化路径
     * @en Optimize path using funnel algorithm
     */
    private funnelPath(
        start: IPoint,
        end: IPoint,
        polygons: INavPolygon[]
    ): IPoint[] {
        if (polygons.length <= 1) {
            return [start, end];
        }

        // Collect portals
        const portals: IPortal[] = [];

        for (let i = 0; i < polygons.length - 1; i++) {
            const portal = polygons[i].portals.get(polygons[i + 1].id);
            if (portal) {
                portals.push(portal);
            }
        }

        if (portals.length === 0) {
            return [start, end];
        }

        // Simple string pulling algorithm
        const path: IPoint[] = [start];

        let apex = start;
        let leftIndex = 0;
        let rightIndex = 0;
        let left = portals[0].left;
        let right = portals[0].right;

        for (let i = 1; i <= portals.length; i++) {
            const nextLeft = i < portals.length ? portals[i].left : end;
            const nextRight = i < portals.length ? portals[i].right : end;

            // Update right
            if (this.triArea2(apex, right, nextRight) <= 0) {
                if (apex === right || this.triArea2(apex, left, nextRight) > 0) {
                    right = nextRight;
                    rightIndex = i;
                } else {
                    path.push(left);
                    apex = left;
                    leftIndex = rightIndex = leftIndex;
                    left = right = apex;
                    i = leftIndex;
                    continue;
                }
            }

            // Update left
            if (this.triArea2(apex, left, nextLeft) >= 0) {
                if (apex === left || this.triArea2(apex, right, nextLeft) < 0) {
                    left = nextLeft;
                    leftIndex = i;
                } else {
                    path.push(right);
                    apex = right;
                    leftIndex = rightIndex = rightIndex;
                    left = right = apex;
                    i = rightIndex;
                    continue;
                }
            }
        }

        path.push(end);

        return path;
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

    /**
     * @zh 清空导航网格
     * @en Clear navigation mesh
     */
    clear(): void {
        this.polygons.clear();
        this.nodes.clear();
        this.nextId = 0;
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

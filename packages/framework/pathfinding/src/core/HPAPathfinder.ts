/**
 * @zh HPA* (Hierarchical Pathfinding A*) 寻路算法实现
 * @en HPA* (Hierarchical Pathfinding A*) Pathfinding Algorithm Implementation
 *
 * @zh HPA* 是一种分层寻路算法，适用于超大地图 (1000x1000+)
 * @en HPA* is a hierarchical pathfinding algorithm suitable for very large maps (1000x1000+)
 *
 * @zh 工作原理：
 * 1. 将地图划分为集群 (clusters)
 * 2. 在集群边界检测入口点 (entrances)
 * 3. 构建抽象图 (abstract graph) 连接入口点
 * 4. 先在抽象图上寻路，再细化为详细路径
 *
 * @en How it works:
 * 1. Divide map into clusters
 * 2. Detect entrances at cluster boundaries
 * 3. Build abstract graph connecting entrances
 * 4. First find path on abstract graph, then refine to detailed path
 */

import { BinaryHeap } from './BinaryHeap';
import type {
    IPathfindingMap,
    IPoint,
    IPathResult,
    IPathfinder,
    IPathfindingOptions
} from './IPathfinding';
import { DEFAULT_PATHFINDING_OPTIONS, EMPTY_PATH_RESULT } from './IPathfinding';
import { AStarPathfinder } from './AStarPathfinder';

// =============================================================================
// 配置 | Configuration
// =============================================================================

/**
 * @zh HPA* 配置
 * @en HPA* Configuration
 */
export interface IHPAConfig {
    /**
     * @zh 集群大小（边长）
     * @en Cluster size (side length)
     */
    clusterSize: number;

    /**
     * @zh 最大入口宽度（超过此宽度会拆分为多个入口）
     * @en Maximum entrance width (entrances wider than this will be split)
     */
    maxEntranceWidth: number;

    /**
     * @zh 是否启用内部路径缓存
     * @en Whether to enable internal path caching
     */
    cacheInternalPaths: boolean;
}

/**
 * @zh 默认 HPA* 配置
 * @en Default HPA* configuration
 */
export const DEFAULT_HPA_CONFIG: IHPAConfig = {
    clusterSize: 10,
    maxEntranceWidth: 6,
    cacheInternalPaths: true
};

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh 集群
 * @en Cluster
 */
interface Cluster {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    entrances: Entrance[];
}

/**
 * @zh 入口（集群之间的连接点）
 * @en Entrance (connection point between clusters)
 */
interface Entrance {
    id: number;
    cluster1Id: number;
    cluster2Id: number;
    point1: IPoint;
    point2: IPoint;
    center: IPoint;
}

/**
 * @zh 抽象节点
 * @en Abstract node
 */
interface AbstractNode {
    id: number;
    position: IPoint;
    clusterId: number;
    entranceId: number;
    edges: AbstractEdge[];
}

/**
 * @zh 抽象边
 * @en Abstract edge
 */
interface AbstractEdge {
    targetNodeId: number;
    cost: number;
    isInterEdge: boolean;
}

/**
 * @zh A* 搜索节点
 * @en A* search node
 */
interface SearchNode {
    abstractNode: AbstractNode;
    g: number;
    h: number;
    f: number;
    parent: SearchNode | null;
}

// =============================================================================
// HPA* 寻路器 | HPA* Pathfinder
// =============================================================================

/**
 * @zh HPA* 寻路器
 * @en HPA* Pathfinder
 *
 * @zh 适用于超大地图的分层寻路算法
 * @en Hierarchical pathfinding algorithm for very large maps
 *
 * @example
 * ```typescript
 * const map = createGridMap(1000, 1000);
 * const pathfinder = new HPAPathfinder(map, { clusterSize: 20 });
 *
 * // Preprocess (do once after map changes)
 * pathfinder.preprocess();
 *
 * // Find path
 * const result = pathfinder.findPath(0, 0, 999, 999);
 * ```
 */
export class HPAPathfinder implements IPathfinder {
    private readonly map: IPathfindingMap;
    private readonly config: IHPAConfig;
    private readonly width: number;
    private readonly height: number;

    private clusters: Cluster[] = [];
    private entrances: Entrance[] = [];
    private abstractNodes: Map<number, AbstractNode> = new Map();
    private clusterGrid: (Cluster | null)[][] = [];

    private nextEntranceId: number = 0;
    private nextNodeId: number = 0;

    private internalPathCache: Map<string, IPoint[]> = new Map();
    private localPathfinder: AStarPathfinder;

    private preprocessed: boolean = false;

    constructor(map: IPathfindingMap, config?: Partial<IHPAConfig>) {
        this.map = map;
        this.config = { ...DEFAULT_HPA_CONFIG, ...config };

        const bounds = this.getMapBounds();
        this.width = bounds.width;
        this.height = bounds.height;

        this.localPathfinder = new AStarPathfinder(map);
    }

    /**
     * @zh 预处理地图（构建抽象图）
     * @en Preprocess map (build abstract graph)
     *
     * @zh 在地图变化后需要重新调用
     * @en Need to call again after map changes
     */
    preprocess(): void {
        this.clusters = [];
        this.entrances = [];
        this.abstractNodes.clear();
        this.clusterGrid = [];
        this.internalPathCache.clear();
        this.nextEntranceId = 0;
        this.nextNodeId = 0;

        this.buildClusters();
        this.findEntrances();
        this.buildAbstractGraph();

        this.preprocessed = true;
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
        if (!this.preprocessed) {
            this.preprocess();
        }

        const opts = { ...DEFAULT_PATHFINDING_OPTIONS, ...options };

        if (!this.map.isWalkable(startX, startY) || !this.map.isWalkable(endX, endY)) {
            return EMPTY_PATH_RESULT;
        }

        if (startX === endX && startY === endY) {
            return {
                found: true,
                path: [{ x: startX, y: startY }],
                cost: 0,
                nodesSearched: 1
            };
        }

        const startCluster = this.getClusterAt(startX, startY);
        const endCluster = this.getClusterAt(endX, endY);

        if (!startCluster || !endCluster) {
            return EMPTY_PATH_RESULT;
        }

        if (startCluster.id === endCluster.id) {
            return this.findLocalPath(startX, startY, endX, endY, opts);
        }

        const startNodes = this.insertTemporaryNode(startX, startY, startCluster);
        const endNodes = this.insertTemporaryNode(endX, endY, endCluster);

        const abstractPath = this.searchAbstractGraph(startNodes, endNodes, opts);

        this.removeTemporaryNodes(startNodes);
        this.removeTemporaryNodes(endNodes);

        if (!abstractPath || abstractPath.length === 0) {
            return EMPTY_PATH_RESULT;
        }

        return this.refinePath(abstractPath, startX, startY, endX, endY, opts);
    }

    /**
     * @zh 清理状态
     * @en Clear state
     */
    clear(): void {
        this.clusters = [];
        this.entrances = [];
        this.abstractNodes.clear();
        this.clusterGrid = [];
        this.internalPathCache.clear();
        this.preprocessed = false;
    }

    /**
     * @zh 通知地图区域变化
     * @en Notify map region change
     */
    notifyRegionChange(minX: number, minY: number, maxX: number, maxY: number): void {
        this.preprocessed = false;
        this.internalPathCache.clear();
    }

    /**
     * @zh 获取预处理统计信息
     * @en Get preprocessing statistics
     */
    getStats(): {
        clusters: number;
        entrances: number;
        abstractNodes: number;
        cacheSize: number;
    } {
        return {
            clusters: this.clusters.length,
            entrances: this.entrances.length,
            abstractNodes: this.abstractNodes.size,
            cacheSize: this.internalPathCache.size
        };
    }

    // =========================================================================
    // 预处理方法 | Preprocessing Methods
    // =========================================================================

    private getMapBounds(): { width: number; height: number } {
        const mapAny = this.map as any;
        if (typeof mapAny.width === 'number' && typeof mapAny.height === 'number') {
            return { width: mapAny.width, height: mapAny.height };
        }
        return { width: 1000, height: 1000 };
    }

    private buildClusters(): void {
        const clusterSize = this.config.clusterSize;
        const clustersX = Math.ceil(this.width / clusterSize);
        const clustersY = Math.ceil(this.height / clusterSize);

        this.clusterGrid = [];
        for (let x = 0; x < clustersX; x++) {
            this.clusterGrid[x] = [];
        }

        let clusterId = 0;
        for (let cy = 0; cy < clustersY; cy++) {
            for (let cx = 0; cx < clustersX; cx++) {
                const cluster: Cluster = {
                    id: clusterId++,
                    x: cx * clusterSize,
                    y: cy * clusterSize,
                    width: Math.min(clusterSize, this.width - cx * clusterSize),
                    height: Math.min(clusterSize, this.height - cy * clusterSize),
                    entrances: []
                };
                this.clusters.push(cluster);
                this.clusterGrid[cx][cy] = cluster;
            }
        }
    }

    private findEntrances(): void {
        const clusterSize = this.config.clusterSize;
        const clustersX = Math.ceil(this.width / clusterSize);
        const clustersY = Math.ceil(this.height / clusterSize);

        for (let cy = 0; cy < clustersY; cy++) {
            for (let cx = 0; cx < clustersX; cx++) {
                const cluster = this.clusterGrid[cx][cy];
                if (!cluster) continue;

                if (cx < clustersX - 1) {
                    const rightCluster = this.clusterGrid[cx + 1]?.[cy];
                    if (rightCluster) {
                        this.findEntrancesBetween(cluster, rightCluster, 'horizontal');
                    }
                }

                if (cy < clustersY - 1) {
                    const bottomCluster = this.clusterGrid[cx]?.[cy + 1];
                    if (bottomCluster) {
                        this.findEntrancesBetween(cluster, bottomCluster, 'vertical');
                    }
                }
            }
        }
    }

    private findEntrancesBetween(
        cluster1: Cluster,
        cluster2: Cluster,
        direction: 'horizontal' | 'vertical'
    ): void {
        const maxWidth = this.config.maxEntranceWidth;
        let entranceStart: number | null = null;
        let entranceLength = 0;

        if (direction === 'horizontal') {
            const x1 = cluster1.x + cluster1.width - 1;
            const x2 = cluster2.x;
            const startY = Math.max(cluster1.y, cluster2.y);
            const endY = Math.min(cluster1.y + cluster1.height, cluster2.y + cluster2.height);

            for (let y = startY; y < endY; y++) {
                const walkable1 = this.map.isWalkable(x1, y);
                const walkable2 = this.map.isWalkable(x2, y);

                if (walkable1 && walkable2) {
                    if (entranceStart === null) {
                        entranceStart = y;
                        entranceLength = 1;
                    } else {
                        entranceLength++;
                    }

                    if (entranceLength >= maxWidth || y === endY - 1) {
                        this.createEntrance(cluster1, cluster2, x1, x2, entranceStart, entranceStart + entranceLength - 1, 'horizontal');
                        entranceStart = null;
                        entranceLength = 0;
                    }
                } else if (entranceStart !== null) {
                    this.createEntrance(cluster1, cluster2, x1, x2, entranceStart, entranceStart + entranceLength - 1, 'horizontal');
                    entranceStart = null;
                    entranceLength = 0;
                }
            }
        } else {
            const y1 = cluster1.y + cluster1.height - 1;
            const y2 = cluster2.y;
            const startX = Math.max(cluster1.x, cluster2.x);
            const endX = Math.min(cluster1.x + cluster1.width, cluster2.x + cluster2.width);

            for (let x = startX; x < endX; x++) {
                const walkable1 = this.map.isWalkable(x, y1);
                const walkable2 = this.map.isWalkable(x, y2);

                if (walkable1 && walkable2) {
                    if (entranceStart === null) {
                        entranceStart = x;
                        entranceLength = 1;
                    } else {
                        entranceLength++;
                    }

                    if (entranceLength >= maxWidth || x === endX - 1) {
                        this.createEntrance(cluster1, cluster2, entranceStart, entranceStart + entranceLength - 1, y1, y2, 'vertical');
                        entranceStart = null;
                        entranceLength = 0;
                    }
                } else if (entranceStart !== null) {
                    this.createEntrance(cluster1, cluster2, entranceStart, entranceStart + entranceLength - 1, y1, y2, 'vertical');
                    entranceStart = null;
                    entranceLength = 0;
                }
            }
        }
    }

    private createEntrance(
        cluster1: Cluster,
        cluster2: Cluster,
        coord1Start: number,
        coord1End: number,
        coord2Start: number,
        coord2End: number,
        direction: 'horizontal' | 'vertical'
    ): void {
        let point1: IPoint;
        let point2: IPoint;
        let center: IPoint;

        if (direction === 'horizontal') {
            const midY = Math.floor((coord1Start + coord1End) / 2);
            point1 = { x: coord1Start, y: midY };
            point2 = { x: coord2Start, y: midY };
            center = { x: coord1Start, y: midY };
        } else {
            const midX = Math.floor((coord1Start + coord1End) / 2);
            point1 = { x: midX, y: coord2Start };
            point2 = { x: midX, y: coord2End };
            center = { x: midX, y: coord2Start };
        }

        const entrance: Entrance = {
            id: this.nextEntranceId++,
            cluster1Id: cluster1.id,
            cluster2Id: cluster2.id,
            point1,
            point2,
            center
        };

        this.entrances.push(entrance);
        cluster1.entrances.push(entrance);
        cluster2.entrances.push(entrance);
    }

    private buildAbstractGraph(): void {
        for (const entrance of this.entrances) {
            const node1 = this.createAbstractNode(entrance.point1, entrance.cluster1Id, entrance.id);
            const node2 = this.createAbstractNode(entrance.point2, entrance.cluster2Id, entrance.id);

            node1.edges.push({ targetNodeId: node2.id, cost: 1, isInterEdge: true });
            node2.edges.push({ targetNodeId: node1.id, cost: 1, isInterEdge: true });
        }

        for (const cluster of this.clusters) {
            this.connectIntraClusterNodes(cluster);
        }
    }

    private createAbstractNode(position: IPoint, clusterId: number, entranceId: number): AbstractNode {
        const node: AbstractNode = {
            id: this.nextNodeId++,
            position,
            clusterId,
            entranceId,
            edges: []
        };
        this.abstractNodes.set(node.id, node);
        return node;
    }

    private connectIntraClusterNodes(cluster: Cluster): void {
        const nodesInCluster: AbstractNode[] = [];

        for (const node of this.abstractNodes.values()) {
            if (node.clusterId === cluster.id) {
                nodesInCluster.push(node);
            }
        }

        for (let i = 0; i < nodesInCluster.length; i++) {
            for (let j = i + 1; j < nodesInCluster.length; j++) {
                const node1 = nodesInCluster[i];
                const node2 = nodesInCluster[j];

                const cost = this.heuristic(node1.position, node2.position);
                node1.edges.push({ targetNodeId: node2.id, cost, isInterEdge: false });
                node2.edges.push({ targetNodeId: node1.id, cost, isInterEdge: false });
            }
        }
    }

    // =========================================================================
    // 搜索方法 | Search Methods
    // =========================================================================

    private getClusterAt(x: number, y: number): Cluster | null {
        const clusterSize = this.config.clusterSize;
        const cx = Math.floor(x / clusterSize);
        const cy = Math.floor(y / clusterSize);
        return this.clusterGrid[cx]?.[cy] ?? null;
    }

    private insertTemporaryNode(
        x: number,
        y: number,
        cluster: Cluster
    ): AbstractNode[] {
        const tempNodes: AbstractNode[] = [];
        const tempNode = this.createAbstractNode({ x, y }, cluster.id, -1);
        tempNodes.push(tempNode);

        for (const node of this.abstractNodes.values()) {
            if (node.clusterId === cluster.id && node.id !== tempNode.id) {
                const cost = this.heuristic({ x, y }, node.position);
                tempNode.edges.push({ targetNodeId: node.id, cost, isInterEdge: false });
                node.edges.push({ targetNodeId: tempNode.id, cost, isInterEdge: false });
            }
        }

        return tempNodes;
    }

    private removeTemporaryNodes(nodes: AbstractNode[]): void {
        for (const node of nodes) {
            for (const edge of node.edges) {
                const targetNode = this.abstractNodes.get(edge.targetNodeId);
                if (targetNode) {
                    targetNode.edges = targetNode.edges.filter(e => e.targetNodeId !== node.id);
                }
            }
            this.abstractNodes.delete(node.id);
        }
    }

    private searchAbstractGraph(
        startNodes: AbstractNode[],
        endNodes: AbstractNode[],
        opts: Required<IPathfindingOptions>
    ): AbstractNode[] | null {
        if (startNodes.length === 0 || endNodes.length === 0) {
            return null;
        }

        const endNodeIds = new Set(endNodes.map(n => n.id));
        const openList = new BinaryHeap<SearchNode>((a, b) => a.f - b.f);
        const closedSet = new Set<number>();

        for (const startNode of startNodes) {
            const h = this.heuristic(startNode.position, endNodes[0].position);
            openList.push({
                abstractNode: startNode,
                g: 0,
                h: h * opts.heuristicWeight,
                f: h * opts.heuristicWeight,
                parent: null
            });
        }

        let nodesSearched = 0;

        while (!openList.isEmpty && nodesSearched < opts.maxNodes) {
            const current = openList.pop()!;
            nodesSearched++;

            if (endNodeIds.has(current.abstractNode.id)) {
                return this.reconstructAbstractPath(current);
            }

            if (closedSet.has(current.abstractNode.id)) {
                continue;
            }
            closedSet.add(current.abstractNode.id);

            for (const edge of current.abstractNode.edges) {
                if (closedSet.has(edge.targetNodeId)) {
                    continue;
                }

                const neighbor = this.abstractNodes.get(edge.targetNodeId);
                if (!neighbor) continue;

                const tentativeG = current.g + edge.cost;
                const h = this.heuristic(neighbor.position, endNodes[0].position) * opts.heuristicWeight;

                openList.push({
                    abstractNode: neighbor,
                    g: tentativeG,
                    h,
                    f: tentativeG + h,
                    parent: current
                });
            }
        }

        return null;
    }

    private reconstructAbstractPath(endNode: SearchNode): AbstractNode[] {
        const path: AbstractNode[] = [];
        let current: SearchNode | null = endNode;

        while (current) {
            path.unshift(current.abstractNode);
            current = current.parent;
        }

        return path;
    }

    private refinePath(
        abstractPath: AbstractNode[],
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        opts: Required<IPathfindingOptions>
    ): IPathResult {
        const fullPath: IPoint[] = [];
        let totalCost = 0;
        let nodesSearched = abstractPath.length;

        let currentX = startX;
        let currentY = startY;

        for (let i = 0; i < abstractPath.length; i++) {
            const node = abstractPath[i];
            const targetX = i === abstractPath.length - 1 ? endX : node.position.x;
            const targetY = i === abstractPath.length - 1 ? endY : node.position.y;

            if (currentX !== targetX || currentY !== targetY) {
                const segment = this.localPathfinder.findPath(currentX, currentY, targetX, targetY, opts);

                if (!segment.found) {
                    if (fullPath.length > 0) {
                        return {
                            found: true,
                            path: fullPath,
                            cost: totalCost,
                            nodesSearched
                        };
                    }
                    return EMPTY_PATH_RESULT;
                }

                for (let j = fullPath.length === 0 ? 0 : 1; j < segment.path.length; j++) {
                    fullPath.push(segment.path[j]);
                }

                totalCost += segment.cost;
                nodesSearched += segment.nodesSearched;
            }

            currentX = targetX;
            currentY = targetY;
        }

        if (currentX !== endX || currentY !== endY) {
            const finalSegment = this.localPathfinder.findPath(currentX, currentY, endX, endY, opts);
            if (finalSegment.found) {
                for (let j = 1; j < finalSegment.path.length; j++) {
                    fullPath.push(finalSegment.path[j]);
                }
                totalCost += finalSegment.cost;
                nodesSearched += finalSegment.nodesSearched;
            }
        }

        return {
            found: fullPath.length > 0,
            path: fullPath,
            cost: totalCost,
            nodesSearched
        };
    }

    // =========================================================================
    // 辅助方法 | Helper Methods
    // =========================================================================

    private findLocalPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        opts: Required<IPathfindingOptions>
    ): IPathResult {
        return this.localPathfinder.findPath(startX, startY, endX, endY, opts);
    }

    private findInternalPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        cluster: Cluster
    ): IPoint[] | null {
        const cacheKey = `${cluster.id}:${startX},${startY}->${endX},${endY}`;

        if (this.config.cacheInternalPaths) {
            const cached = this.internalPathCache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const result = this.localPathfinder.findPath(startX, startY, endX, endY);

        if (result.found && this.config.cacheInternalPaths) {
            this.internalPathCache.set(cacheKey, [...result.path]);
        }

        return result.found ? [...result.path] : null;
    }

    private calculatePathCost(path: IPoint[]): number {
        let cost = 0;
        for (let i = 1; i < path.length; i++) {
            const dx = Math.abs(path[i].x - path[i - 1].x);
            const dy = Math.abs(path[i].y - path[i - 1].y);
            cost += dx !== 0 && dy !== 0 ? Math.SQRT2 : 1;
        }
        return cost;
    }

    private heuristic(a: IPoint, b: IPoint): number {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建 HPA* 寻路器
 * @en Create HPA* pathfinder
 *
 * @param map - @zh 寻路地图实例 @en Pathfinding map instance
 * @param config - @zh HPA* 配置 @en HPA* configuration
 * @returns @zh HPA* 寻路器实例 @en HPA* pathfinder instance
 */
export function createHPAPathfinder(
    map: IPathfindingMap,
    config?: Partial<IHPAConfig>
): HPAPathfinder {
    return new HPAPathfinder(map, config);
}

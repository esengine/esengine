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
 * 4. 预计算集群内入口点之间的真实路径代价
 * 5. 先在抽象图上寻路，再利用缓存细化为详细路径
 *
 * @en How it works:
 * 1. Divide map into clusters
 * 2. Detect entrances at cluster boundaries
 * 3. Build abstract graph connecting entrances
 * 4. Precompute actual path costs between entrances within clusters
 * 5. First find path on abstract graph, then refine using cached paths
 */

import { IndexedBinaryHeap, IHeapIndexable } from './IndexedBinaryHeap';
import type {
    IPathfindingMap,
    IPoint,
    IPathResult,
    IPathfinder,
    IPathfindingOptions,
    IPathNode
} from './IPathfinding';
import { DEFAULT_PATHFINDING_OPTIONS, EMPTY_PATH_RESULT } from './IPathfinding';
import { AStarPathfinder } from './AStarPathfinder';
import { PathCache } from './PathCache';

// =============================================================================
// 类型定义 | Type Definitions
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
     * @zh 最大入口宽度（超过此宽度会拆分或使用端点策略）
     * @en Maximum entrance width (entrances wider than this will be split or use endpoint strategy)
     */
    maxEntranceWidth: number;

    /**
     * @zh 是否启用内部路径缓存
     * @en Whether to enable internal path caching
     */
    cacheInternalPaths: boolean;

    /**
     * @zh 入口策略：'middle' 在中间放节点，'end' 在宽入口两端各放节点
     * @en Entrance strategy: 'middle' places node at center, 'end' places nodes at both ends for wide entrances
     */
    entranceStrategy?: 'middle' | 'end';

    /**
     * @zh 是否延迟计算 intra-edges（大幅加速预处理，首次查询时计算真实路径）
     * @en Whether to lazily compute intra-edges (greatly speeds up preprocessing, computes actual paths on first query)
     */
    lazyIntraEdges?: boolean;
}

/**
 * @zh 默认 HPA* 配置
 * @en Default HPA* configuration
 */
export const DEFAULT_HPA_CONFIG: IHPAConfig = {
    clusterSize: 64,
    maxEntranceWidth: 16,
    cacheInternalPaths: true,
    entranceStrategy: 'end',
    lazyIntraEdges: true
};

/**
 * @zh 抽象边信息
 * @en Abstract edge information
 */
interface AbstractEdge {
    /** @zh 目标节点 ID @en Target node ID */
    targetNodeId: number;
    /** @zh 边代价（真实路径代价）@en Edge cost (actual path cost) */
    cost: number;
    /** @zh 是否为跨集群边 @en Is inter-cluster edge */
    isInterEdge: boolean;
    /** @zh 缓存的具体路径（ConcreteNodeId 列表）@en Cached concrete path (ConcreteNodeId list) */
    innerPath: number[] | null;
}

/**
 * @zh 抽象节点
 * @en Abstract node
 */
interface AbstractNode {
    /** @zh 节点 ID @en Node ID */
    id: number;
    /** @zh 位置（地图坐标）@en Position (map coordinates) */
    position: IPoint;
    /** @zh 所属集群 ID @en Cluster ID */
    clusterId: number;
    /** @zh 对应的具体地图节点 ID (y * width + x) @en Corresponding concrete node ID */
    concreteNodeId: number;
    /** @zh 出边列表 @en Outgoing edges */
    edges: AbstractEdge[];
}

/**
 * @zh A* 搜索节点
 * @en A* search node
 */
interface SearchNode extends IHeapIndexable {
    node: AbstractNode;
    g: number;
    h: number;
    f: number;
    parent: SearchNode | null;
    closed: boolean;
    opened: boolean;
    heapIndex: number;
}

/**
 * @zh 入口区间（边界上连续可通行的区域）
 * @en Entrance span (continuous walkable region on boundary)
 */
interface EntranceSpan {
    start: number;
    end: number;
}

// =============================================================================
// SubMap 子地图类 (Slice) | SubMap Class (Slice)
// =============================================================================

/**
 * @zh 子地图 - 为集群提供隔离的地图视图
 * @en SubMap - Provides isolated map view for cluster
 *
 * @zh 不复制数据，只做坐标转换并委托给父地图
 * @en Doesn't copy data, just transforms coordinates and delegates to parent map
 */
class SubMap implements IPathfindingMap {
    readonly width: number;
    readonly height: number;

    constructor(
        private readonly parentMap: IPathfindingMap,
        private readonly originX: number,
        private readonly originY: number,
        width: number,
        height: number
    ) {
        this.width = width;
        this.height = height;
    }

    /**
     * @zh 局部坐标转全局坐标
     * @en Convert local to global coordinates
     */
    localToGlobal(localX: number, localY: number): IPoint {
        return {
            x: this.originX + localX,
            y: this.originY + localY
        };
    }

    /**
     * @zh 全局坐标转局部坐标
     * @en Convert global to local coordinates
     */
    globalToLocal(globalX: number, globalY: number): IPoint {
        return {
            x: globalX - this.originX,
            y: globalY - this.originY
        };
    }

    isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.parentMap.isWalkable(this.originX + x, this.originY + y);
    }

    getNodeAt(x: number, y: number): IPathNode | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        const globalNode = this.parentMap.getNodeAt(this.originX + x, this.originY + y);
        if (!globalNode) return null;

        // 创建局部节点（调整坐标）
        return {
            id: y * this.width + x,
            position: { x, y },
            cost: globalNode.cost,
            walkable: globalNode.walkable
        };
    }

    getNeighbors(node: IPathNode): IPathNode[] {
        const neighbors: IPathNode[] = [];
        const { x, y } = node.position;

        // 8方向邻居
        const directions = [
            { dx: 0, dy: -1 },  // N
            { dx: 1, dy: -1 },  // NE
            { dx: 1, dy: 0 },   // E
            { dx: 1, dy: 1 },   // SE
            { dx: 0, dy: 1 },   // S
            { dx: -1, dy: 1 },  // SW
            { dx: -1, dy: 0 },  // W
            { dx: -1, dy: -1 }  // NW
        ];

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
                continue;
            }

            if (!this.isWalkable(nx, ny)) {
                continue;
            }

            // 对角线移动：检查是否被角落阻挡
            if (dir.dx !== 0 && dir.dy !== 0) {
                if (!this.isWalkable(x + dir.dx, y) || !this.isWalkable(x, y + dir.dy)) {
                    continue;
                }
            }

            const neighborNode = this.getNodeAt(nx, ny);
            if (neighborNode) {
                neighbors.push(neighborNode);
            }
        }

        return neighbors;
    }

    heuristic(a: IPoint, b: IPoint): number {
        // Octile 距离
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }

    getMovementCost(from: IPathNode, to: IPathNode): number {
        const dx = Math.abs(to.position.x - from.position.x);
        const dy = Math.abs(to.position.y - from.position.y);
        const baseCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
        return baseCost * to.cost;
    }
}

// =============================================================================
// Cluster 集群类 | Cluster Class
// =============================================================================

/**
 * @zh 集群 - 管理地图的一个区域
 * @en Cluster - Manages a region of the map
 */
class Cluster {
    readonly id: number;
    readonly originX: number;
    readonly originY: number;
    readonly width: number;
    readonly height: number;
    readonly subMap: SubMap;

    /** @zh 集群内的抽象节点 ID 列表 @en Abstract node IDs in this cluster */
    nodeIds: number[] = [];

    /** @zh 预计算的距离缓存 @en Precomputed distance cache */
    private readonly distanceCache: Map<string, number> = new Map();

    /** @zh 预计算的路径缓存 @en Precomputed path cache */
    private readonly pathCache: Map<string, number[]> = new Map();

    constructor(
        id: number,
        originX: number,
        originY: number,
        width: number,
        height: number,
        parentMap: IPathfindingMap
    ) {
        this.id = id;
        this.originX = originX;
        this.originY = originY;
        this.width = width;
        this.height = height;
        this.subMap = new SubMap(parentMap, originX, originY, width, height);
    }

    /**
     * @zh 检查点是否在集群内
     * @en Check if point is in cluster
     */
    containsPoint(x: number, y: number): boolean {
        return x >= this.originX && x < this.originX + this.width &&
               y >= this.originY && y < this.originY + this.height;
    }

    /**
     * @zh 添加节点 ID
     * @en Add node ID
     */
    addNodeId(nodeId: number): void {
        if (!this.nodeIds.includes(nodeId)) {
            this.nodeIds.push(nodeId);
        }
    }

    /**
     * @zh 移除节点 ID
     * @en Remove node ID
     */
    removeNodeId(nodeId: number): void {
        const idx = this.nodeIds.indexOf(nodeId);
        if (idx !== -1) {
            this.nodeIds.splice(idx, 1);
        }
    }

    /**
     * @zh 生成缓存键
     * @en Generate cache key
     */
    private getCacheKey(fromId: number, toId: number): string {
        return `${fromId}->${toId}`;
    }

    /**
     * @zh 设置缓存
     * @en Set cache
     */
    setCache(fromId: number, toId: number, cost: number, path: number[]): void {
        const key = this.getCacheKey(fromId, toId);
        this.distanceCache.set(key, cost);
        this.pathCache.set(key, path);
    }

    /**
     * @zh 获取缓存的距离
     * @en Get cached distance
     */
    getCachedDistance(fromId: number, toId: number): number | undefined {
        return this.distanceCache.get(this.getCacheKey(fromId, toId));
    }

    /**
     * @zh 获取缓存的路径
     * @en Get cached path
     */
    getCachedPath(fromId: number, toId: number): number[] | undefined {
        return this.pathCache.get(this.getCacheKey(fromId, toId));
    }

    /**
     * @zh 清除缓存
     * @en Clear cache
     */
    clearCache(): void {
        this.distanceCache.clear();
        this.pathCache.clear();
    }

    /**
     * @zh 获取缓存大小
     * @en Get cache size
     */
    getCacheSize(): number {
        return this.distanceCache.size;
    }
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
    private readonly config: Required<IHPAConfig>;
    private readonly mapWidth: number;
    private readonly mapHeight: number;

    // 集群管理
    private clusters: Cluster[] = [];
    private clusterGrid: (number | null)[][] = [];  // [cx][cy] -> clusterId
    private clustersX: number = 0;
    private clustersY: number = 0;

    // 抽象图
    private abstractNodes: Map<number, AbstractNode> = new Map();
    private nodesByCluster: Map<number, number[]> = new Map();
    private nextNodeId: number = 0;

    // 入口统计
    private entranceCount: number = 0;

    // 内部寻路器
    private readonly localPathfinder: AStarPathfinder;

    // 完整路径缓存
    private readonly pathCache: PathCache;
    private mapVersion: number = 0;

    private preprocessed: boolean = false;

    constructor(map: IPathfindingMap, config?: Partial<IHPAConfig>) {
        this.map = map;
        this.config = { ...DEFAULT_HPA_CONFIG, ...config } as Required<IHPAConfig>;

        const bounds = this.getMapBounds();
        this.mapWidth = bounds.width;
        this.mapHeight = bounds.height;

        this.localPathfinder = new AStarPathfinder(map);
        this.pathCache = new PathCache({ maxEntries: 1000, ttlMs: 0 });
    }

    // =========================================================================
    // 公共 API | Public API
    // =========================================================================

    /**
     * @zh 预处理地图（构建抽象图）
     * @en Preprocess map (build abstract graph)
     */
    preprocess(): void {
        this.clear();

        // 1. 构建集群
        this.buildClusters();

        // 2. 检测入口并创建抽象节点
        this.buildEntrances();

        // 3. 创建集群内边（计算真实代价）
        this.buildIntraEdges();

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

        // 验证起点终点
        if (!this.map.isWalkable(startX, startY) || !this.map.isWalkable(endX, endY)) {
            return EMPTY_PATH_RESULT;
        }

        // 同一点
        if (startX === endX && startY === endY) {
            return {
                found: true,
                path: [{ x: startX, y: startY }],
                cost: 0,
                nodesSearched: 1
            };
        }

        // 检查路径缓存
        const cached = this.pathCache.get(startX, startY, endX, endY, this.mapVersion);
        if (cached) {
            return cached;
        }

        const startCluster = this.getClusterAt(startX, startY);
        const endCluster = this.getClusterAt(endX, endY);

        if (!startCluster || !endCluster) {
            return EMPTY_PATH_RESULT;
        }

        let result: IPathResult;

        // 同一集群：直接局部搜索
        if (startCluster.id === endCluster.id) {
            result = this.findLocalPath(startX, startY, endX, endY, opts);
        } else {
            // 跨集群：HPA* 搜索
            const startTemp = this.insertTempNode(startX, startY, startCluster);
            const endTemp = this.insertTempNode(endX, endY, endCluster);

            const abstractPath = this.abstractSearch(startTemp, endTemp, opts);

            this.removeTempNode(startTemp, startCluster);
            this.removeTempNode(endTemp, endCluster);

            if (!abstractPath || abstractPath.length === 0) {
                return EMPTY_PATH_RESULT;
            }

            result = this.refinePath(abstractPath, startX, startY, endX, endY, opts);
        }

        // 缓存结果
        if (result.found) {
            this.pathCache.set(startX, startY, endX, endY, result, this.mapVersion);
        }

        return result;
    }

    /**
     * @zh 清理状态
     * @en Clear state
     */
    clear(): void {
        this.clusters = [];
        this.clusterGrid = [];
        this.abstractNodes.clear();
        this.nodesByCluster.clear();
        this.nextNodeId = 0;
        this.entranceCount = 0;
        this.pathCache.invalidateAll();
        this.mapVersion++;
        this.preprocessed = false;
    }

    /**
     * @zh 通知地图区域变化
     * @en Notify map region change
     */
    notifyRegionChange(minX: number, minY: number, maxX: number, maxY: number): void {
        // 找出受影响的集群并重建其 intra-edges
        const affectedClusters = this.getAffectedClusters(minX, minY, maxX, maxY);

        for (const cluster of affectedClusters) {
            // 清除该集群的缓存
            cluster.clearCache();

            // 移除该集群内所有节点的 intra-edges
            for (const nodeId of cluster.nodeIds) {
                const node = this.abstractNodes.get(nodeId);
                if (node) {
                    node.edges = node.edges.filter(e => e.isInterEdge);
                }
            }

            // 重建 intra-edges
            this.buildClusterIntraEdges(cluster);
        }

        this.pathCache.invalidateRegion(minX, minY, maxX, maxY);
        this.mapVersion++;
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
        let cacheSize = 0;
        for (const cluster of this.clusters) {
            cacheSize += cluster.getCacheSize();
        }

        return {
            clusters: this.clusters.length,
            entrances: this.entranceCount,
            abstractNodes: this.abstractNodes.size,
            cacheSize
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

    /**
     * @zh 构建集群
     * @en Build clusters
     */
    private buildClusters(): void {
        const clusterSize = this.config.clusterSize;
        this.clustersX = Math.ceil(this.mapWidth / clusterSize);
        this.clustersY = Math.ceil(this.mapHeight / clusterSize);

        // 初始化集群网格
        this.clusterGrid = [];
        for (let cx = 0; cx < this.clustersX; cx++) {
            this.clusterGrid[cx] = [];
            for (let cy = 0; cy < this.clustersY; cy++) {
                this.clusterGrid[cx][cy] = null;
            }
        }

        // 创建集群
        let clusterId = 0;
        for (let cy = 0; cy < this.clustersY; cy++) {
            for (let cx = 0; cx < this.clustersX; cx++) {
                const originX = cx * clusterSize;
                const originY = cy * clusterSize;
                const width = Math.min(clusterSize, this.mapWidth - originX);
                const height = Math.min(clusterSize, this.mapHeight - originY);

                const cluster = new Cluster(
                    clusterId,
                    originX,
                    originY,
                    width,
                    height,
                    this.map
                );

                this.clusters.push(cluster);
                this.clusterGrid[cx][cy] = clusterId;
                this.nodesByCluster.set(clusterId, []);
                clusterId++;
            }
        }
    }

    /**
     * @zh 检测入口并创建抽象节点
     * @en Detect entrances and create abstract nodes
     */
    private buildEntrances(): void {
        const clusterSize = this.config.clusterSize;

        for (let cy = 0; cy < this.clustersY; cy++) {
            for (let cx = 0; cx < this.clustersX; cx++) {
                const clusterId = this.clusterGrid[cx][cy];
                if (clusterId === null) continue;

                const cluster1 = this.clusters[clusterId];

                // 右边相邻集群
                if (cx < this.clustersX - 1) {
                    const cluster2Id = this.clusterGrid[cx + 1][cy];
                    if (cluster2Id !== null) {
                        const cluster2 = this.clusters[cluster2Id];
                        this.detectAndCreateEntrances(cluster1, cluster2, 'vertical');
                    }
                }

                // 下边相邻集群
                if (cy < this.clustersY - 1) {
                    const cluster2Id = this.clusterGrid[cx][cy + 1];
                    if (cluster2Id !== null) {
                        const cluster2 = this.clusters[cluster2Id];
                        this.detectAndCreateEntrances(cluster1, cluster2, 'horizontal');
                    }
                }
            }
        }
    }

    /**
     * @zh 检测并创建两个相邻集群之间的入口
     * @en Detect and create entrances between two adjacent clusters
     */
    private detectAndCreateEntrances(
        cluster1: Cluster,
        cluster2: Cluster,
        boundaryDirection: 'horizontal' | 'vertical'
    ): void {
        const spans = this.detectEntranceSpans(cluster1, cluster2, boundaryDirection);

        for (const span of spans) {
            this.createEntranceNodes(cluster1, cluster2, span, boundaryDirection);
        }
    }

    /**
     * @zh 检测边界上的连续可通行区间
     * @en Detect continuous walkable spans on boundary
     */
    private detectEntranceSpans(
        cluster1: Cluster,
        cluster2: Cluster,
        boundaryDirection: 'horizontal' | 'vertical'
    ): EntranceSpan[] {
        const spans: EntranceSpan[] = [];

        if (boundaryDirection === 'vertical') {
            // cluster1 在左，cluster2 在右
            const x1 = cluster1.originX + cluster1.width - 1;
            const x2 = cluster2.originX;
            const startY = Math.max(cluster1.originY, cluster2.originY);
            const endY = Math.min(
                cluster1.originY + cluster1.height,
                cluster2.originY + cluster2.height
            );

            let spanStart: number | null = null;

            for (let y = startY; y < endY; y++) {
                const walkable1 = this.map.isWalkable(x1, y);
                const walkable2 = this.map.isWalkable(x2, y);

                if (walkable1 && walkable2) {
                    if (spanStart === null) {
                        spanStart = y;
                    }
                } else {
                    if (spanStart !== null) {
                        spans.push({ start: spanStart, end: y - 1 });
                        spanStart = null;
                    }
                }
            }

            if (spanStart !== null) {
                spans.push({ start: spanStart, end: endY - 1 });
            }
        } else {
            // cluster1 在上，cluster2 在下
            const y1 = cluster1.originY + cluster1.height - 1;
            const y2 = cluster2.originY;
            const startX = Math.max(cluster1.originX, cluster2.originX);
            const endX = Math.min(
                cluster1.originX + cluster1.width,
                cluster2.originX + cluster2.width
            );

            let spanStart: number | null = null;

            for (let x = startX; x < endX; x++) {
                const walkable1 = this.map.isWalkable(x, y1);
                const walkable2 = this.map.isWalkable(x, y2);

                if (walkable1 && walkable2) {
                    if (spanStart === null) {
                        spanStart = x;
                    }
                } else {
                    if (spanStart !== null) {
                        spans.push({ start: spanStart, end: x - 1 });
                        spanStart = null;
                    }
                }
            }

            if (spanStart !== null) {
                spans.push({ start: spanStart, end: endX - 1 });
            }
        }

        return spans;
    }

    /**
     * @zh 为入口区间创建抽象节点
     * @en Create abstract nodes for entrance span
     */
    private createEntranceNodes(
        cluster1: Cluster,
        cluster2: Cluster,
        span: EntranceSpan,
        boundaryDirection: 'horizontal' | 'vertical'
    ): void {
        const spanLength = span.end - span.start + 1;
        const maxWidth = this.config.maxEntranceWidth;
        const strategy = this.config.entranceStrategy;

        // 确定要放置节点的位置
        const positions: number[] = [];

        if (spanLength <= maxWidth) {
            // 窄入口：放在中间
            positions.push(Math.floor((span.start + span.end) / 2));
        } else {
            // 宽入口：均匀分布多个节点
            // Wide entrance: distribute multiple nodes evenly
            const numNodes = Math.ceil(spanLength / maxWidth);
            const spacing = spanLength / numNodes;

            for (let i = 0; i < numNodes; i++) {
                // 在每个子区间的中心放置节点
                const pos = Math.floor(span.start + spacing * (i + 0.5));
                positions.push(Math.min(pos, span.end));
            }

            // 如果使用 'end' 策略，确保两端也有节点
            if (strategy === 'end') {
                if (!positions.includes(span.start)) {
                    positions.unshift(span.start);
                }
                if (!positions.includes(span.end)) {
                    positions.push(span.end);
                }
            }
        }

        // 为每个位置创建节点对
        for (const pos of positions) {
            let p1: IPoint, p2: IPoint;

            if (boundaryDirection === 'vertical') {
                // cluster1 在左，cluster2 在右
                p1 = { x: cluster1.originX + cluster1.width - 1, y: pos };
                p2 = { x: cluster2.originX, y: pos };
            } else {
                // cluster1 在上，cluster2 在下
                p1 = { x: pos, y: cluster1.originY + cluster1.height - 1 };
                p2 = { x: pos, y: cluster2.originY };
            }

            // 创建节点对
            const node1 = this.createAbstractNode(p1, cluster1);
            const node2 = this.createAbstractNode(p2, cluster2);

            // 创建 inter-edge（代价为 1，相邻格子）
            const interCost = 1;

            node1.edges.push({
                targetNodeId: node2.id,
                cost: interCost,
                isInterEdge: true,
                innerPath: null
            });

            node2.edges.push({
                targetNodeId: node1.id,
                cost: interCost,
                isInterEdge: true,
                innerPath: null
            });

            this.entranceCount++;
        }
    }

    /**
     * @zh 创建抽象节点
     * @en Create abstract node
     */
    private createAbstractNode(position: IPoint, cluster: Cluster): AbstractNode {
        // 检查是否已存在相同位置的节点
        const concreteId = position.y * this.mapWidth + position.x;

        for (const nodeId of cluster.nodeIds) {
            const existing = this.abstractNodes.get(nodeId);
            if (existing && existing.concreteNodeId === concreteId) {
                return existing;
            }
        }

        // 创建新节点
        const node: AbstractNode = {
            id: this.nextNodeId++,
            position: { x: position.x, y: position.y },
            clusterId: cluster.id,
            concreteNodeId: concreteId,
            edges: []
        };

        this.abstractNodes.set(node.id, node);
        cluster.addNodeId(node.id);

        const clusterNodes = this.nodesByCluster.get(cluster.id);
        if (clusterNodes) {
            clusterNodes.push(node.id);
        }

        return node;
    }

    /**
     * @zh 构建所有集群的 intra-edges
     * @en Build intra-edges for all clusters
     */
    private buildIntraEdges(): void {
        for (const cluster of this.clusters) {
            this.buildClusterIntraEdges(cluster);
        }
    }

    /**
     * @zh 构建单个集群的 intra-edges
     * @en Build intra-edges for single cluster
     */
    private buildClusterIntraEdges(cluster: Cluster): void {
        const nodeIds = cluster.nodeIds;

        if (nodeIds.length < 2) return;

        if (this.config.lazyIntraEdges) {
            // 延迟计算模式：只用启发式距离创建边，真实路径在首次使用时计算
            this.buildLazyIntraEdges(cluster);
        } else {
            // 立即计算模式：预处理时计算所有真实路径
            this.buildEagerIntraEdges(cluster);
        }
    }

    /**
     * @zh 延迟构建 intra-edges（只用启发式距离）
     * @en Build lazy intra-edges (using heuristic distance only)
     */
    private buildLazyIntraEdges(cluster: Cluster): void {
        const nodeIds = cluster.nodeIds;

        for (let i = 0; i < nodeIds.length; i++) {
            for (let j = i + 1; j < nodeIds.length; j++) {
                const node1 = this.abstractNodes.get(nodeIds[i])!;
                const node2 = this.abstractNodes.get(nodeIds[j])!;

                // 使用启发式距离作为估计代价
                const heuristicCost = this.heuristic(node1.position, node2.position);

                // 创建双向 intra-edge（innerPath = null 表示未计算）
                node1.edges.push({
                    targetNodeId: node2.id,
                    cost: heuristicCost,
                    isInterEdge: false,
                    innerPath: null  // 标记为未计算
                });

                node2.edges.push({
                    targetNodeId: node1.id,
                    cost: heuristicCost,
                    isInterEdge: false,
                    innerPath: null
                });
            }
        }
    }

    /**
     * @zh 立即构建 intra-edges（计算真实路径）
     * @en Build eager intra-edges (compute actual paths)
     */
    private buildEagerIntraEdges(cluster: Cluster): void {
        const nodeIds = cluster.nodeIds;

        // 为子地图创建 A* 寻路器
        const subPathfinder = new AStarPathfinder(cluster.subMap);

        // 计算所有节点对之间的真实路径
        for (let i = 0; i < nodeIds.length; i++) {
            for (let j = i + 1; j < nodeIds.length; j++) {
                const node1 = this.abstractNodes.get(nodeIds[i])!;
                const node2 = this.abstractNodes.get(nodeIds[j])!;

                // 转换为局部坐标
                const local1 = cluster.subMap.globalToLocal(node1.position.x, node1.position.y);
                const local2 = cluster.subMap.globalToLocal(node2.position.x, node2.position.y);

                // A* 计算真实路径
                const result = subPathfinder.findPath(
                    local1.x, local1.y,
                    local2.x, local2.y
                );

                if (result.found && result.path.length > 0) {
                    // 转换路径为全局 ConcreteNodeId
                    const globalPath: number[] = result.path.map(p => {
                        const global = cluster.subMap.localToGlobal(p.x, p.y);
                        return global.y * this.mapWidth + global.x;
                    });

                    // 缓存到集群
                    if (this.config.cacheInternalPaths) {
                        cluster.setCache(node1.id, node2.id, result.cost, globalPath);
                        cluster.setCache(node2.id, node1.id, result.cost, [...globalPath].reverse());
                    }

                    // 创建双向 intra-edge
                    node1.edges.push({
                        targetNodeId: node2.id,
                        cost: result.cost,
                        isInterEdge: false,
                        innerPath: this.config.cacheInternalPaths ? globalPath : null
                    });

                    node2.edges.push({
                        targetNodeId: node1.id,
                        cost: result.cost,
                        isInterEdge: false,
                        innerPath: this.config.cacheInternalPaths ? [...globalPath].reverse() : null
                    });
                }
                // 如果路径不存在，不创建边（集群内不连通）
            }
        }
    }

    /**
     * @zh 按需计算 intra-edge 的真实路径
     * @en Compute actual path for intra-edge on demand
     */
    private computeIntraEdgePath(
        fromNode: AbstractNode,
        toNode: AbstractNode,
        edge: AbstractEdge
    ): { cost: number; path: number[] } | null {
        const cluster = this.clusters[fromNode.clusterId];
        if (!cluster) return null;

        // 检查集群缓存
        const cachedPath = cluster.getCachedPath(fromNode.id, toNode.id);
        const cachedCost = cluster.getCachedDistance(fromNode.id, toNode.id);
        if (cachedPath && cachedCost !== undefined) {
            // 更新边的代价和路径
            edge.cost = cachedCost;
            (edge as any).innerPath = cachedPath;
            return { cost: cachedCost, path: cachedPath };
        }

        // 计算真实路径
        const subPathfinder = new AStarPathfinder(cluster.subMap);
        const local1 = cluster.subMap.globalToLocal(fromNode.position.x, fromNode.position.y);
        const local2 = cluster.subMap.globalToLocal(toNode.position.x, toNode.position.y);

        const result = subPathfinder.findPath(local1.x, local1.y, local2.x, local2.y);

        if (result.found && result.path.length > 0) {
            // 转换路径为全局 ConcreteNodeId
            const globalPath: number[] = result.path.map(p => {
                const global = cluster.subMap.localToGlobal(p.x, p.y);
                return global.y * this.mapWidth + global.x;
            });

            // 缓存结果
            if (this.config.cacheInternalPaths) {
                cluster.setCache(fromNode.id, toNode.id, result.cost, globalPath);
                // 也缓存反向路径
                cluster.setCache(toNode.id, fromNode.id, result.cost, [...globalPath].reverse());
            }

            // 更新边
            edge.cost = result.cost;
            (edge as any).innerPath = globalPath;

            // 更新反向边
            const reverseEdge = toNode.edges.find(e => e.targetNodeId === fromNode.id);
            if (reverseEdge) {
                reverseEdge.cost = result.cost;
                (reverseEdge as any).innerPath = [...globalPath].reverse();
            }

            return { cost: result.cost, path: globalPath };
        }

        return null;
    }

    // =========================================================================
    // 搜索方法 | Search Methods
    // =========================================================================

    /**
     * @zh 获取指定位置的集群
     * @en Get cluster at position
     */
    private getClusterAt(x: number, y: number): Cluster | null {
        const cx = Math.floor(x / this.config.clusterSize);
        const cy = Math.floor(y / this.config.clusterSize);

        if (cx < 0 || cx >= this.clustersX || cy < 0 || cy >= this.clustersY) {
            return null;
        }

        const clusterId = this.clusterGrid[cx]?.[cy];
        if (clusterId === null || clusterId === undefined) {
            return null;
        }

        return this.clusters[clusterId] || null;
    }

    /**
     * @zh 获取受影响的集群
     * @en Get affected clusters
     */
    private getAffectedClusters(minX: number, minY: number, maxX: number, maxY: number): Cluster[] {
        const affected: Cluster[] = [];
        const clusterSize = this.config.clusterSize;

        const minCX = Math.floor(minX / clusterSize);
        const maxCX = Math.floor(maxX / clusterSize);
        const minCY = Math.floor(minY / clusterSize);
        const maxCY = Math.floor(maxY / clusterSize);

        for (let cy = minCY; cy <= maxCY; cy++) {
            for (let cx = minCX; cx <= maxCX; cx++) {
                if (cx >= 0 && cx < this.clustersX && cy >= 0 && cy < this.clustersY) {
                    const clusterId = this.clusterGrid[cx]?.[cy];
                    if (clusterId !== null && clusterId !== undefined) {
                        affected.push(this.clusters[clusterId]);
                    }
                }
            }
        }

        return affected;
    }

    /**
     * @zh 插入临时节点
     * @en Insert temporary node
     */
    private insertTempNode(x: number, y: number, cluster: Cluster): AbstractNode {
        const concreteId = y * this.mapWidth + x;

        // 检查是否已存在该位置的节点
        for (const nodeId of cluster.nodeIds) {
            const existing = this.abstractNodes.get(nodeId);
            if (existing && existing.concreteNodeId === concreteId) {
                return existing;
            }
        }

        // 创建临时节点
        const tempNode: AbstractNode = {
            id: this.nextNodeId++,
            position: { x, y },
            clusterId: cluster.id,
            concreteNodeId: concreteId,
            edges: []
        };

        this.abstractNodes.set(tempNode.id, tempNode);
        cluster.addNodeId(tempNode.id);

        // 计算到集群内所有其他节点的真实路径
        const subPathfinder = new AStarPathfinder(cluster.subMap);
        const localPos = cluster.subMap.globalToLocal(x, y);

        for (const existingNodeId of cluster.nodeIds) {
            if (existingNodeId === tempNode.id) continue;

            const existingNode = this.abstractNodes.get(existingNodeId);
            if (!existingNode) continue;

            const targetLocalPos = cluster.subMap.globalToLocal(
                existingNode.position.x,
                existingNode.position.y
            );

            const result = subPathfinder.findPath(
                localPos.x, localPos.y,
                targetLocalPos.x, targetLocalPos.y
            );

            if (result.found && result.path.length > 0) {
                // 转换路径
                const globalPath: number[] = result.path.map(p => {
                    const global = cluster.subMap.localToGlobal(p.x, p.y);
                    return global.y * this.mapWidth + global.x;
                });

                // 添加双向边
                tempNode.edges.push({
                    targetNodeId: existingNode.id,
                    cost: result.cost,
                    isInterEdge: false,
                    innerPath: globalPath
                });

                existingNode.edges.push({
                    targetNodeId: tempNode.id,
                    cost: result.cost,
                    isInterEdge: false,
                    innerPath: [...globalPath].reverse()
                });
            }
        }

        return tempNode;
    }

    /**
     * @zh 移除临时节点
     * @en Remove temporary node
     */
    private removeTempNode(node: AbstractNode, cluster: Cluster): void {
        // 移除其他节点指向此节点的边
        for (const existingNodeId of cluster.nodeIds) {
            if (existingNodeId === node.id) continue;

            const existingNode = this.abstractNodes.get(existingNodeId);
            if (existingNode) {
                existingNode.edges = existingNode.edges.filter(
                    e => e.targetNodeId !== node.id
                );
            }
        }

        // 从集群和图中移除
        cluster.removeNodeId(node.id);
        this.abstractNodes.delete(node.id);
    }

    /**
     * @zh 在抽象图上进行 A* 搜索
     * @en Perform A* search on abstract graph
     */
    private abstractSearch(
        startNode: AbstractNode,
        endNode: AbstractNode,
        opts: Required<IPathfindingOptions>
    ): AbstractNode[] | null {
        const openList = new IndexedBinaryHeap<SearchNode>((a, b) => a.f - b.f);
        const nodeMap = new Map<number, SearchNode>();

        const endPosition = endNode.position;

        // 初始化起点
        const h = this.heuristic(startNode.position, endPosition) * opts.heuristicWeight;
        const startSearchNode: SearchNode = {
            node: startNode,
            g: 0,
            h,
            f: h,
            parent: null,
            closed: false,
            opened: true,
            heapIndex: -1
        };

        openList.push(startSearchNode);
        nodeMap.set(startNode.id, startSearchNode);

        let nodesSearched = 0;

        while (!openList.isEmpty && nodesSearched < opts.maxNodes) {
            const current = openList.pop()!;
            current.closed = true;
            nodesSearched++;

            // 找到目标
            if (current.node.id === endNode.id) {
                return this.reconstructPath(current);
            }

            // 扩展邻居
            for (const edge of current.node.edges) {
                let neighbor = nodeMap.get(edge.targetNodeId);

                if (!neighbor) {
                    const neighborNode = this.abstractNodes.get(edge.targetNodeId);
                    if (!neighborNode) continue;

                    const nh = this.heuristic(neighborNode.position, endPosition) * opts.heuristicWeight;
                    neighbor = {
                        node: neighborNode,
                        g: Infinity,
                        h: nh,
                        f: Infinity,
                        parent: null,
                        closed: false,
                        opened: false,
                        heapIndex: -1
                    };
                    nodeMap.set(edge.targetNodeId, neighbor);
                }

                if (neighbor.closed) continue;

                const tentativeG = current.g + edge.cost;

                if (!neighbor.opened) {
                    neighbor.g = tentativeG;
                    neighbor.f = tentativeG + neighbor.h;
                    neighbor.parent = current;
                    neighbor.opened = true;
                    openList.push(neighbor);
                } else if (tentativeG < neighbor.g) {
                    neighbor.g = tentativeG;
                    neighbor.f = tentativeG + neighbor.h;
                    neighbor.parent = current;
                    openList.update(neighbor);
                }
            }
        }

        return null;
    }

    /**
     * @zh 重建抽象路径
     * @en Reconstruct abstract path
     */
    private reconstructPath(endNode: SearchNode): AbstractNode[] {
        const path: AbstractNode[] = [];
        let current: SearchNode | null = endNode;

        while (current) {
            path.unshift(current.node);
            current = current.parent;
        }

        return path;
    }

    /**
     * @zh 细化抽象路径为具体路径
     * @en Refine abstract path to concrete path
     */
    private refinePath(
        abstractPath: AbstractNode[],
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        opts: Required<IPathfindingOptions>
    ): IPathResult {
        if (abstractPath.length === 0) {
            return EMPTY_PATH_RESULT;
        }

        const fullPath: IPoint[] = [];
        let totalCost = 0;
        let nodesSearched = abstractPath.length;

        // 处理抽象路径中的每一段
        for (let i = 0; i < abstractPath.length - 1; i++) {
            const fromNode = abstractPath[i];
            const toNode = abstractPath[i + 1];

            // 查找连接边
            const edge = fromNode.edges.find(e => e.targetNodeId === toNode.id);

            if (!edge) {
                // 边不存在，需要实时计算
                const segResult = this.findLocalPath(
                    fromNode.position.x, fromNode.position.y,
                    toNode.position.x, toNode.position.y,
                    opts
                );

                if (segResult.found) {
                    this.appendPath(fullPath, segResult.path);
                    totalCost += segResult.cost;
                    nodesSearched += segResult.nodesSearched;
                }
            } else if (edge.isInterEdge) {
                // Inter-edge：直接连接
                if (fullPath.length === 0 ||
                    fullPath[fullPath.length - 1].x !== fromNode.position.x ||
                    fullPath[fullPath.length - 1].y !== fromNode.position.y) {
                    fullPath.push({ x: fromNode.position.x, y: fromNode.position.y });
                }
                fullPath.push({ x: toNode.position.x, y: toNode.position.y });
                totalCost += edge.cost;
            } else if (edge.innerPath && edge.innerPath.length > 0) {
                // Intra-edge：使用缓存路径
                const concretePath = edge.innerPath.map(id => ({
                    x: id % this.mapWidth,
                    y: Math.floor(id / this.mapWidth)
                }));
                this.appendPath(fullPath, concretePath);
                totalCost += edge.cost;
            } else {
                // Lazy intra-edge 或没有缓存路径：按需计算真实路径
                // Lazy intra-edge or no cached path: compute actual path on demand
                const computed = this.computeIntraEdgePath(fromNode, toNode, edge);

                if (computed && computed.path.length > 0) {
                    // 使用计算出的路径
                    const concretePath = computed.path.map(id => ({
                        x: id % this.mapWidth,
                        y: Math.floor(id / this.mapWidth)
                    }));
                    this.appendPath(fullPath, concretePath);
                    totalCost += computed.cost;
                } else {
                    // 路径计算失败，回退到实时搜索
                    // Path computation failed, fall back to real-time search
                    const segResult = this.findLocalPath(
                        fromNode.position.x, fromNode.position.y,
                        toNode.position.x, toNode.position.y,
                        opts
                    );

                    if (segResult.found) {
                        this.appendPath(fullPath, segResult.path);
                        totalCost += segResult.cost;
                        nodesSearched += segResult.nodesSearched;
                    }
                }
            }
        }

        // 确保起点正确
        if (fullPath.length > 0 && (fullPath[0].x !== startX || fullPath[0].y !== startY)) {
            // 连接起点到路径开头
            const firstPoint = fullPath[0];
            if (Math.abs(firstPoint.x - startX) <= 1 && Math.abs(firstPoint.y - startY) <= 1) {
                fullPath.unshift({ x: startX, y: startY });
            } else {
                const segResult = this.findLocalPath(startX, startY, firstPoint.x, firstPoint.y, opts);
                if (segResult.found) {
                    fullPath.splice(0, 0, ...segResult.path.slice(0, -1));
                    totalCost += segResult.cost;
                }
            }
        }

        // 确保终点正确
        if (fullPath.length > 0) {
            const lastPoint = fullPath[fullPath.length - 1];
            if (lastPoint.x !== endX || lastPoint.y !== endY) {
                if (Math.abs(lastPoint.x - endX) <= 1 && Math.abs(lastPoint.y - endY) <= 1) {
                    fullPath.push({ x: endX, y: endY });
                } else {
                    const segResult = this.findLocalPath(lastPoint.x, lastPoint.y, endX, endY, opts);
                    if (segResult.found) {
                        fullPath.push(...segResult.path.slice(1));
                        totalCost += segResult.cost;
                    }
                }
            }
        }

        return {
            found: fullPath.length > 0,
            path: fullPath,
            cost: totalCost,
            nodesSearched
        };
    }

    /**
     * @zh 追加路径（避免重复点）
     * @en Append path (avoid duplicate points)
     */
    private appendPath(fullPath: IPoint[], segment: readonly IPoint[]): void {
        if (segment.length === 0) return;

        let startIdx = 0;

        // 避免重复第一个点
        if (fullPath.length > 0) {
            const last = fullPath[fullPath.length - 1];
            if (last.x === segment[0].x && last.y === segment[0].y) {
                startIdx = 1;
            }
        }

        for (let i = startIdx; i < segment.length; i++) {
            fullPath.push({ x: segment[i].x, y: segment[i].y });
        }
    }

    /**
     * @zh 局部寻路
     * @en Local pathfinding
     */
    private findLocalPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        opts: Required<IPathfindingOptions>
    ): IPathResult {
        return this.localPathfinder.findPath(startX, startY, endX, endY, opts);
    }

    /**
     * @zh 启发式函数（Octile 距离）
     * @en Heuristic function (Octile distance)
     */
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

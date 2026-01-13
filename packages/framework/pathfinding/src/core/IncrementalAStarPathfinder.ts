/**
 * @zh 增量 A* 寻路算法实现
 * @en Incremental A* Pathfinding Algorithm Implementation
 */

import { BinaryHeap } from './BinaryHeap';
import type {
    IPathfindingMap,
    IPathNode,
    IPoint,
    IPathfindingOptions
} from './IPathfinding';
import { DEFAULT_PATHFINDING_OPTIONS } from './IPathfinding';
import type {
    IIncrementalPathfinder,
    IPathRequest,
    IPathProgress,
    IIncrementalPathResult,
    IIncrementalPathfindingOptions
} from './IIncrementalPathfinding';
import { PathfindingState, EMPTY_PROGRESS } from './IIncrementalPathfinding';
import { PathCache, type IPathCacheConfig } from './PathCache';

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh A* 节点（内部使用）
 * @en A* Node (internal use)
 */
interface AStarNode {
    node: IPathNode;
    g: number;
    h: number;
    f: number;
    parent: AStarNode | null;
    closed: boolean;
    opened: boolean;
}

/**
 * @zh 寻路会话（保存跨帧状态）
 * @en Pathfinding session (preserves state across frames)
 */
interface PathfindingSession {
    request: IPathRequest;
    state: PathfindingState;
    options: Required<IPathfindingOptions>;

    openList: BinaryHeap<AStarNode>;
    nodeCache: Map<string | number, AStarNode>;

    startNode: IPathNode;
    endNode: IPathNode;
    endPosition: IPoint;

    nodesSearched: number;
    framesUsed: number;
    initialDistance: number;

    result: IIncrementalPathResult | null;

    affectedByChange: boolean;
}

/**
 * @zh 障碍物变化区域
 * @en Obstacle change region
 */
interface ChangeRegion {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    timestamp: number;
}

/**
 * @zh 增量寻路器配置
 * @en Incremental pathfinder configuration
 */
export interface IIncrementalPathfinderConfig {
    /**
     * @zh 是否启用路径缓存
     * @en Whether to enable path caching
     */
    enableCache?: boolean;

    /**
     * @zh 缓存配置
     * @en Cache configuration
     */
    cacheConfig?: Partial<IPathCacheConfig>;
}

// =============================================================================
// 增量 A* 寻路器 | Incremental A* Pathfinder
// =============================================================================

/**
 * @zh 增量 A* 寻路器
 * @en Incremental A* Pathfinder
 *
 * @zh 支持时间切片的 A* 算法实现，可跨多帧执行搜索
 * @en A* algorithm implementation with time slicing, can execute search across multiple frames
 *
 * @example
 * ```typescript
 * const map = createGridMap(100, 100);
 * const pathfinder = createIncrementalAStarPathfinder(map);
 *
 * // Request path (non-blocking)
 * const request = pathfinder.requestPath(0, 0, 99, 99);
 *
 * // Process over multiple frames
 * function gameLoop() {
 *     const progress = pathfinder.step(request.id, 100);
 *
 *     if (progress.state === PathfindingState.Completed) {
 *         const result = pathfinder.getResult(request.id);
 *         console.log('Path found:', result?.path);
 *     } else if (progress.state === PathfindingState.InProgress) {
 *         requestAnimationFrame(gameLoop);
 *     }
 * }
 * gameLoop();
 * ```
 */
export class IncrementalAStarPathfinder implements IIncrementalPathfinder {
    private readonly map: IPathfindingMap;
    private readonly sessions: Map<number, PathfindingSession> = new Map();
    private nextRequestId: number = 0;

    private readonly affectedRegions: ChangeRegion[] = [];
    private readonly maxRegionAge: number = 5000;

    private readonly cache: PathCache | null;
    private readonly enableCache: boolean;
    private mapVersion: number = 0;

    private cacheHits: number = 0;
    private cacheMisses: number = 0;

    /**
     * @zh 创建增量 A* 寻路器
     * @en Create incremental A* pathfinder
     *
     * @param map - @zh 寻路地图实例 @en Pathfinding map instance
     * @param config - @zh 配置选项 @en Configuration options
     */
    constructor(map: IPathfindingMap, config?: IIncrementalPathfinderConfig) {
        this.map = map;
        this.enableCache = config?.enableCache ?? false;
        this.cache = this.enableCache ? new PathCache(config?.cacheConfig) : null;
    }

    /**
     * @zh 请求寻路（非阻塞）
     * @en Request pathfinding (non-blocking)
     */
    requestPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IIncrementalPathfindingOptions
    ): IPathRequest {
        const id = this.nextRequestId++;
        const priority = options?.priority ?? 50;
        const opts = { ...DEFAULT_PATHFINDING_OPTIONS, ...options };

        const request: IPathRequest = {
            id,
            startX,
            startY,
            endX,
            endY,
            options: opts,
            priority,
            createdAt: Date.now()
        };

        if (this.cache) {
            const cached = this.cache.get(startX, startY, endX, endY, this.mapVersion);
            if (cached) {
                this.cacheHits++;
                const session: PathfindingSession = {
                    request,
                    state: cached.found ? PathfindingState.Completed : PathfindingState.Failed,
                    options: opts,
                    openList: new BinaryHeap<AStarNode>((a, b) => a.f - b.f),
                    nodeCache: new Map(),
                    startNode: this.map.getNodeAt(startX, startY)!,
                    endNode: this.map.getNodeAt(endX, endY)!,
                    endPosition: { x: endX, y: endY },
                    nodesSearched: cached.nodesSearched,
                    framesUsed: 0,
                    initialDistance: 0,
                    result: {
                        requestId: id,
                        found: cached.found,
                        path: [...cached.path],
                        cost: cached.cost,
                        nodesSearched: cached.nodesSearched,
                        framesUsed: 0,
                        isPartial: false
                    },
                    affectedByChange: false
                };
                this.sessions.set(id, session);
                return request;
            }
            this.cacheMisses++;
        }

        const startNode = this.map.getNodeAt(startX, startY);
        const endNode = this.map.getNodeAt(endX, endY);

        if (!startNode || !endNode || !startNode.walkable || !endNode.walkable) {
            const session: PathfindingSession = {
                request,
                state: PathfindingState.Failed,
                options: opts,
                openList: new BinaryHeap<AStarNode>((a, b) => a.f - b.f),
                nodeCache: new Map(),
                startNode: startNode!,
                endNode: endNode!,
                endPosition: endNode?.position ?? { x: endX, y: endY },
                nodesSearched: 0,
                framesUsed: 0,
                initialDistance: 0,
                result: this.createEmptyResult(id),
                affectedByChange: false
            };
            this.sessions.set(id, session);
            return request;
        }

        if (startNode.id === endNode.id) {
            const session: PathfindingSession = {
                request,
                state: PathfindingState.Completed,
                options: opts,
                openList: new BinaryHeap<AStarNode>((a, b) => a.f - b.f),
                nodeCache: new Map(),
                startNode,
                endNode,
                endPosition: endNode.position,
                nodesSearched: 1,
                framesUsed: 0,
                initialDistance: 0,
                result: {
                    requestId: id,
                    found: true,
                    path: [startNode.position],
                    cost: 0,
                    nodesSearched: 1,
                    framesUsed: 0,
                    isPartial: false
                },
                affectedByChange: false
            };
            this.sessions.set(id, session);
            return request;
        }

        const initialDistance = this.map.heuristic(startNode.position, endNode.position);
        const openList = new BinaryHeap<AStarNode>((a, b) => a.f - b.f);
        const nodeCache = new Map<string | number, AStarNode>();

        const startAStarNode: AStarNode = {
            node: startNode,
            g: 0,
            h: initialDistance * opts.heuristicWeight,
            f: initialDistance * opts.heuristicWeight,
            parent: null,
            closed: false,
            opened: true
        };

        nodeCache.set(startNode.id, startAStarNode);
        openList.push(startAStarNode);

        const session: PathfindingSession = {
            request,
            state: PathfindingState.InProgress,
            options: opts,
            openList,
            nodeCache,
            startNode,
            endNode,
            endPosition: endNode.position,
            nodesSearched: 0,
            framesUsed: 0,
            initialDistance,
            result: null,
            affectedByChange: false
        };

        this.sessions.set(id, session);
        return request;
    }

    /**
     * @zh 执行一步搜索
     * @en Execute one step of search
     */
    step(requestId: number, maxIterations: number): IPathProgress {
        const session = this.sessions.get(requestId);
        if (!session) {
            return EMPTY_PROGRESS;
        }

        if (session.state !== PathfindingState.InProgress) {
            return this.createProgress(session);
        }

        session.framesUsed++;
        let iterations = 0;

        while (!session.openList.isEmpty && iterations < maxIterations) {
            const current = session.openList.pop()!;
            current.closed = true;
            session.nodesSearched++;
            iterations++;

            if (current.node.id === session.endNode.id) {
                session.state = PathfindingState.Completed;
                session.result = this.buildResult(session, current);

                if (this.cache && session.result.found) {
                    const req = session.request;
                    this.cache.set(
                        req.startX, req.startY,
                        req.endX, req.endY,
                        {
                            found: true,
                            path: session.result.path,
                            cost: session.result.cost,
                            nodesSearched: session.result.nodesSearched
                        },
                        this.mapVersion
                    );
                }

                return this.createProgress(session);
            }

            this.expandNeighbors(session, current);

            if (session.nodesSearched >= session.options.maxNodes) {
                session.state = PathfindingState.Failed;
                session.result = this.createEmptyResult(requestId);
                return this.createProgress(session);
            }
        }

        if (session.openList.isEmpty && session.state === PathfindingState.InProgress) {
            session.state = PathfindingState.Failed;
            session.result = this.createEmptyResult(requestId);
        }

        return this.createProgress(session);
    }

    /**
     * @zh 暂停寻路
     * @en Pause pathfinding
     */
    pause(requestId: number): void {
        const session = this.sessions.get(requestId);
        if (session && session.state === PathfindingState.InProgress) {
            session.state = PathfindingState.Paused;
        }
    }

    /**
     * @zh 恢复寻路
     * @en Resume pathfinding
     */
    resume(requestId: number): void {
        const session = this.sessions.get(requestId);
        if (session && session.state === PathfindingState.Paused) {
            session.state = PathfindingState.InProgress;
        }
    }

    /**
     * @zh 取消寻路
     * @en Cancel pathfinding
     */
    cancel(requestId: number): void {
        const session = this.sessions.get(requestId);
        if (session && (session.state === PathfindingState.InProgress ||
                        session.state === PathfindingState.Paused)) {
            session.state = PathfindingState.Cancelled;
            session.result = this.createEmptyResult(requestId);
        }
    }

    /**
     * @zh 获取寻路结果
     * @en Get pathfinding result
     */
    getResult(requestId: number): IIncrementalPathResult | null {
        const session = this.sessions.get(requestId);
        return session?.result ?? null;
    }

    /**
     * @zh 获取当前进度
     * @en Get current progress
     */
    getProgress(requestId: number): IPathProgress | null {
        const session = this.sessions.get(requestId);
        return session ? this.createProgress(session) : null;
    }

    /**
     * @zh 清理已完成的请求
     * @en Clean up completed request
     */
    cleanup(requestId: number): void {
        const session = this.sessions.get(requestId);
        if (session) {
            session.openList.clear();
            session.nodeCache.clear();
            this.sessions.delete(requestId);
        }
    }

    /**
     * @zh 通知障碍物变化
     * @en Notify obstacle change
     */
    notifyObstacleChange(
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ): void {
        this.mapVersion++;

        if (this.cache) {
            this.cache.invalidateRegion(minX, minY, maxX, maxY);
        }

        const region: ChangeRegion = {
            minX,
            minY,
            maxX,
            maxY,
            timestamp: Date.now()
        };
        this.affectedRegions.push(region);

        for (const session of this.sessions.values()) {
            if (session.state === PathfindingState.InProgress ||
                session.state === PathfindingState.Paused) {
                if (this.sessionAffectedByRegion(session, region)) {
                    session.affectedByChange = true;
                }
            }
        }

        this.cleanupOldRegions();
    }

    /**
     * @zh 清理所有请求
     * @en Clear all requests
     */
    clear(): void {
        for (const session of this.sessions.values()) {
            session.openList.clear();
            session.nodeCache.clear();
        }
        this.sessions.clear();
        this.affectedRegions.length = 0;
    }

    /**
     * @zh 清空路径缓存
     * @en Clear path cache
     */
    clearCache(): void {
        if (this.cache) {
            this.cache.invalidateAll();
            this.cacheHits = 0;
            this.cacheMisses = 0;
        }
    }

    /**
     * @zh 获取缓存统计信息
     * @en Get cache statistics
     */
    getCacheStats(): { enabled: boolean; hits: number; misses: number; hitRate: number; size: number } {
        if (!this.cache) {
            return { enabled: false, hits: 0, misses: 0, hitRate: 0, size: 0 };
        }

        const total = this.cacheHits + this.cacheMisses;
        const hitRate = total > 0 ? this.cacheHits / total : 0;

        return {
            enabled: true,
            hits: this.cacheHits,
            misses: this.cacheMisses,
            hitRate,
            size: this.cache.getStats().size
        };
    }

    /**
     * @zh 检查会话是否被障碍物变化影响
     * @en Check if session is affected by obstacle change
     */
    isAffectedByChange(requestId: number): boolean {
        const session = this.sessions.get(requestId);
        return session?.affectedByChange ?? false;
    }

    /**
     * @zh 清除会话的变化标记
     * @en Clear session's change flag
     */
    clearChangeFlag(requestId: number): void {
        const session = this.sessions.get(requestId);
        if (session) {
            session.affectedByChange = false;
        }
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 展开邻居节点
     * @en Expand neighbor nodes
     */
    private expandNeighbors(session: PathfindingSession, current: AStarNode): void {
        const neighbors = this.map.getNeighbors(current.node);

        for (const neighborNode of neighbors) {
            if (!neighborNode.walkable) {
                continue;
            }

            let neighbor = session.nodeCache.get(neighborNode.id);

            if (!neighbor) {
                neighbor = {
                    node: neighborNode,
                    g: Infinity,
                    h: 0,
                    f: Infinity,
                    parent: null,
                    closed: false,
                    opened: false
                };
                session.nodeCache.set(neighborNode.id, neighbor);
            }

            if (neighbor.closed) {
                continue;
            }

            const movementCost = this.map.getMovementCost(current.node, neighborNode);
            const tentativeG = current.g + movementCost;

            if (!neighbor.opened) {
                neighbor.g = tentativeG;
                neighbor.h = this.map.heuristic(neighborNode.position, session.endPosition) *
                             session.options.heuristicWeight;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                neighbor.opened = true;
                session.openList.push(neighbor);
            } else if (tentativeG < neighbor.g) {
                neighbor.g = tentativeG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                session.openList.update(neighbor);
            }
        }
    }

    /**
     * @zh 创建进度对象
     * @en Create progress object
     */
    private createProgress(session: PathfindingSession): IPathProgress {
        let estimatedProgress = 0;

        if (session.state === PathfindingState.Completed) {
            estimatedProgress = 1;
        } else if (session.state === PathfindingState.InProgress && session.initialDistance > 0) {
            const bestNode = session.openList.peek();
            if (bestNode) {
                const currentDistance = bestNode.h / session.options.heuristicWeight;
                estimatedProgress = Math.max(0, Math.min(1,
                    1 - (currentDistance / session.initialDistance)
                ));
            }
        }

        return {
            state: session.state,
            nodesSearched: session.nodesSearched,
            openListSize: session.openList.size,
            estimatedProgress
        };
    }

    /**
     * @zh 构建路径结果
     * @en Build path result
     */
    private buildResult(session: PathfindingSession, endNode: AStarNode): IIncrementalPathResult {
        const path: IPoint[] = [];
        let current: AStarNode | null = endNode;

        while (current) {
            path.unshift(current.node.position);
            current = current.parent;
        }

        return {
            requestId: session.request.id,
            found: true,
            path,
            cost: endNode.g,
            nodesSearched: session.nodesSearched,
            framesUsed: session.framesUsed,
            isPartial: false
        };
    }

    /**
     * @zh 创建空结果
     * @en Create empty result
     */
    private createEmptyResult(requestId: number): IIncrementalPathResult {
        return {
            requestId,
            found: false,
            path: [],
            cost: 0,
            nodesSearched: 0,
            framesUsed: 0,
            isPartial: false
        };
    }

    /**
     * @zh 检查会话是否被区域影响
     * @en Check if session is affected by region
     */
    private sessionAffectedByRegion(session: PathfindingSession, region: ChangeRegion): boolean {
        for (const astarNode of session.nodeCache.values()) {
            if (astarNode.opened || astarNode.closed) {
                const pos = astarNode.node.position;
                if (pos.x >= region.minX && pos.x <= region.maxX &&
                    pos.y >= region.minY && pos.y <= region.maxY) {
                    return true;
                }
            }
        }

        const start = session.request;
        const end = session.endPosition;

        if ((start.startX >= region.minX && start.startX <= region.maxX &&
             start.startY >= region.minY && start.startY <= region.maxY) ||
            (end.x >= region.minX && end.x <= region.maxX &&
             end.y >= region.minY && end.y <= region.maxY)) {
            return true;
        }

        return false;
    }

    /**
     * @zh 清理过期的变化区域
     * @en Clean up expired change regions
     */
    private cleanupOldRegions(): void {
        const now = Date.now();
        let i = 0;
        while (i < this.affectedRegions.length) {
            if (now - this.affectedRegions[i].timestamp > this.maxRegionAge) {
                this.affectedRegions.splice(i, 1);
            } else {
                i++;
            }
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建增量 A* 寻路器
 * @en Create incremental A* pathfinder
 *
 * @param map - @zh 寻路地图实例 @en Pathfinding map instance
 * @returns @zh 增量 A* 寻路器实例 @en Incremental A* pathfinder instance
 */
export function createIncrementalAStarPathfinder(map: IPathfindingMap): IncrementalAStarPathfinder {
    return new IncrementalAStarPathfinder(map);
}

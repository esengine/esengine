/**
 * @zh A* 寻路算法实现
 * @en A* Pathfinding Algorithm Implementation
 */

import { IndexedBinaryHeap, type IHeapIndexable } from './IndexedBinaryHeap';
import type {
    IPathfindingMap,
    IPathfinder,
    IPathResult,
    IPathfindingOptions,
    IPathNode,
    IPoint
} from './IPathfinding';
import { EMPTY_PATH_RESULT, DEFAULT_PATHFINDING_OPTIONS } from './IPathfinding';

// =============================================================================
// 内部节点类型 | Internal Node Type
// =============================================================================

interface AStarNode extends IHeapIndexable {
    node: IPathNode;
    g: number;  // Cost from start
    h: number;  // Heuristic to end
    f: number;  // Total cost (g + h)
    parent: AStarNode | null;
    closed: boolean;
    opened: boolean;
    heapIndex: number;  // For IndexedBinaryHeap O(log n) update
}

// =============================================================================
// A* 寻路器 | A* Pathfinder
// =============================================================================

/**
 * @zh A* 寻路器
 * @en A* Pathfinder
 *
 * @zh 使用 A* 算法在地图上查找最短路径
 * @en Uses A* algorithm to find shortest path on a map
 *
 * @example
 * ```typescript
 * const map = new GridMap(width, height);
 * const pathfinder = new AStarPathfinder(map);
 * const result = pathfinder.findPath(0, 0, 10, 10);
 * if (result.found) {
 *     console.log('Path:', result.path);
 * }
 * ```
 */
export class AStarPathfinder implements IPathfinder {
    private readonly map: IPathfindingMap;
    private nodeCache: Map<string | number, AStarNode> = new Map();
    private openList: IndexedBinaryHeap<AStarNode>;

    constructor(map: IPathfindingMap) {
        this.map = map;
        this.openList = new IndexedBinaryHeap<AStarNode>((a, b) => a.f - b.f);
    }

    /**
     * @zh 查找路径
     * @en Find path
     */
    findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        const opts = { ...DEFAULT_PATHFINDING_OPTIONS, ...options };

        // Clear previous state
        this.clear();

        // Get start and end nodes
        const startNode = this.map.getNodeAt(startX, startY);
        const endNode = this.map.getNodeAt(endX, endY);

        // Validate nodes
        if (!startNode || !endNode) {
            return EMPTY_PATH_RESULT;
        }

        if (!startNode.walkable || !endNode.walkable) {
            return EMPTY_PATH_RESULT;
        }

        // Same position
        if (startNode.id === endNode.id) {
            return {
                found: true,
                path: [startNode.position],
                cost: 0,
                nodesSearched: 1
            };
        }

        // Initialize start node
        const start = this.getOrCreateAStarNode(startNode);
        start.g = 0;
        start.h = this.map.heuristic(startNode.position, endNode.position) * opts.heuristicWeight;
        start.f = start.h;
        start.opened = true;

        this.openList.push(start);

        let nodesSearched = 0;
        const endPosition = endNode.position;

        // A* main loop
        while (!this.openList.isEmpty && nodesSearched < opts.maxNodes) {
            const current = this.openList.pop()!;
            current.closed = true;
            nodesSearched++;

            // Found the goal
            if (current.node.id === endNode.id) {
                return this.buildPath(current, nodesSearched);
            }

            // Explore neighbors
            const neighbors = this.map.getNeighbors(current.node);

            for (const neighborNode of neighbors) {
                // Skip if not walkable or already closed
                if (!neighborNode.walkable) {
                    continue;
                }

                const neighbor = this.getOrCreateAStarNode(neighborNode);

                if (neighbor.closed) {
                    continue;
                }

                // Calculate tentative g score
                const movementCost = this.map.getMovementCost(current.node, neighborNode);
                const tentativeG = current.g + movementCost;

                // Check if this path is better
                if (!neighbor.opened) {
                    // First time visiting this node
                    neighbor.g = tentativeG;
                    neighbor.h = this.map.heuristic(neighborNode.position, endPosition) * opts.heuristicWeight;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                    neighbor.opened = true;
                    this.openList.push(neighbor);
                } else if (tentativeG < neighbor.g) {
                    // Found a better path
                    neighbor.g = tentativeG;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                    this.openList.update(neighbor);
                }
            }
        }

        // No path found
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
        this.nodeCache.clear();
        this.openList.clear();
    }

    /**
     * @zh 获取或创建 A* 节点
     * @en Get or create A* node
     */
    private getOrCreateAStarNode(node: IPathNode): AStarNode {
        let astarNode = this.nodeCache.get(node.id);

        if (!astarNode) {
            astarNode = {
                node,
                g: Infinity,
                h: 0,
                f: Infinity,
                parent: null,
                closed: false,
                opened: false,
                heapIndex: -1
            };
            this.nodeCache.set(node.id, astarNode);
        }

        return astarNode;
    }

    /**
     * @zh 构建路径结果
     * @en Build path result
     */
    private buildPath(endNode: AStarNode, nodesSearched: number): IPathResult {
        const path: IPoint[] = [];
        let current: AStarNode | null = endNode;

        while (current) {
            path.push(current.node.position);
            current = current.parent;
        }

        path.reverse();

        return {
            found: true,
            path,
            cost: endNode.g,
            nodesSearched
        };
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建 A* 寻路器
 * @en Create A* pathfinder
 */
export function createAStarPathfinder(map: IPathfindingMap): AStarPathfinder {
    return new AStarPathfinder(map);
}

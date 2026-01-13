/**
 * @zh 高性能 A* 寻路器
 * @en High-performance A* Pathfinder
 */

import { FastGridState, FastIndexedHeap } from './FastPathfindingState';
import type { IPathfinder, IPathResult, IPathfindingOptions, IPoint } from './IPathfinding';
import { EMPTY_PATH_RESULT, DEFAULT_PATHFINDING_OPTIONS } from './IPathfinding';
import { GridMap } from '../grid/GridMap';

/**
 * @zh 高性能 A* 寻路器（专用于 GridMap）
 * @en High-performance A* Pathfinder (specialized for GridMap)
 */
export class FastAStarPathfinder implements IPathfinder {
    private readonly map: GridMap;
    private readonly state: FastGridState;
    private readonly openList: FastIndexedHeap;

    constructor(map: GridMap) {
        this.map = map;
        this.state = new FastGridState(map.width, map.height);
        this.openList = new FastIndexedHeap(this.state);
    }

    findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        const opts = options ? { ...DEFAULT_PATHFINDING_OPTIONS, ...options } : DEFAULT_PATHFINDING_OPTIONS;
        const { width, height } = this.map;

        // Reset state (O(1))
        this.state.reset();
        this.openList.clear();

        // Validate
        if (startX < 0 || startX >= width || startY < 0 || startY >= height ||
            endX < 0 || endX >= width || endY < 0 || endY >= height) {
            return EMPTY_PATH_RESULT;
        }

        if (!this.map.isWalkable(startX, startY) || !this.map.isWalkable(endX, endY)) {
            return EMPTY_PATH_RESULT;
        }

        const startIndex = startY * width + startX;
        const endIndex = endY * width + endX;

        if (startIndex === endIndex) {
            return { found: true, path: [{ x: startX, y: startY }], cost: 0, nodesSearched: 1 };
        }

        // Initialize start
        const heuristicWeight = opts.heuristicWeight;
        const startH = this.map.heuristic({ x: startX, y: startY }, { x: endX, y: endY }) * heuristicWeight;

        this.state.setG(startIndex, 0);
        this.state.setH(startIndex, startH);
        this.state.setF(startIndex, startH);
        this.state.setOpened(startIndex, true);
        this.openList.push(startIndex);

        let nodesSearched = 0;
        const maxNodes = opts.maxNodes;
        const allowDiagonal = this.map['options'].allowDiagonal;
        const avoidCorners = this.map['options'].avoidCorners;
        const diagonalCost = this.map['options'].diagonalCost;
        const nodes = this.map['nodes'];

        // Direction offsets
        const dx = allowDiagonal ? [0, 1, 1, 1, 0, -1, -1, -1] : [0, 1, 0, -1];
        const dy = allowDiagonal ? [-1, -1, 0, 1, 1, 1, 0, -1] : [-1, 0, 1, 0];
        const dirCount = dx.length;

        while (!this.openList.isEmpty && nodesSearched < maxNodes) {
            const currentIndex = this.openList.pop();
            this.state.setClosed(currentIndex, true);
            nodesSearched++;

            if (currentIndex === endIndex) {
                return this.buildPath(startIndex, endIndex, nodesSearched);
            }

            const cx = currentIndex % width;
            const cy = (currentIndex / width) | 0;
            const currentG = this.state.getG(currentIndex);

            for (let d = 0; d < dirCount; d++) {
                const nx = cx + dx[d];
                const ny = cy + dy[d];

                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

                const neighbor = nodes[ny][nx];
                if (!neighbor.walkable) continue;

                // Corner cutting check
                if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
                    if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) {
                        continue;
                    }
                }

                const neighborIndex = ny * width + nx;

                if (this.state.isClosed(neighborIndex)) continue;

                const isDiagonal = dx[d] !== 0 && dy[d] !== 0;
                const moveCost = isDiagonal ? neighbor.cost * diagonalCost : neighbor.cost;
                const tentativeG = currentG + moveCost;

                if (!this.state.isOpened(neighborIndex)) {
                    const h = this.map.heuristic({ x: nx, y: ny }, { x: endX, y: endY }) * heuristicWeight;
                    this.state.setG(neighborIndex, tentativeG);
                    this.state.setH(neighborIndex, h);
                    this.state.setF(neighborIndex, tentativeG + h);
                    this.state.setParentIndex(neighborIndex, currentIndex);
                    this.state.setOpened(neighborIndex, true);
                    this.openList.push(neighborIndex);
                } else if (tentativeG < this.state.getG(neighborIndex)) {
                    this.state.setG(neighborIndex, tentativeG);
                    this.state.setF(neighborIndex, tentativeG + this.state.getH(neighborIndex));
                    this.state.setParentIndex(neighborIndex, currentIndex);
                    this.openList.update(neighborIndex);
                }
            }
        }

        return { found: false, path: [], cost: 0, nodesSearched };
    }

    private buildPath(startIndex: number, endIndex: number, nodesSearched: number): IPathResult {
        const width = this.map.width;
        const path: IPoint[] = [];
        let current = endIndex;

        while (current !== -1) {
            path.push({ x: current % width, y: (current / width) | 0 });
            current = current === startIndex ? -1 : this.state.getParentIndex(current);
        }

        path.reverse();

        return {
            found: true,
            path,
            cost: this.state.getG(endIndex),
            nodesSearched
        };
    }

    clear(): void {
        this.state.reset();
        this.openList.clear();
    }
}

/**
 * @zh 创建高性能 A* 寻路器
 * @en Create high-performance A* pathfinder
 */
export function createFastAStarPathfinder(map: GridMap): FastAStarPathfinder {
    return new FastAStarPathfinder(map);
}

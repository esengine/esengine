/**
 * @zh 网格寻路器（统一实现）
 * @en Grid Pathfinder (unified implementation)
 */

import type { IPathfinder, IPathResult, IPathfindingOptions, IPoint } from './IPathfinding';
import { EMPTY_PATH_RESULT, DEFAULT_PATHFINDING_OPTIONS } from './IPathfinding';
import { GridMap } from '../grid/GridMap';

// =============================================================================
// 配置 | Configuration
// =============================================================================

/**
 * @zh 寻路模式
 * @en Pathfinding mode
 */
export type GridPathfinderMode = 'standard' | 'fast' | 'bidirectional';

/**
 * @zh 网格寻路器配置
 * @en Grid pathfinder configuration
 */
export interface IGridPathfinderConfig {
    /**
     * @zh 寻路模式
     * @en Pathfinding mode
     *
     * - standard: 标准A*，适合小地图
     * - fast: TypedArray优化，适合中大地图
     * - bidirectional: 双向搜索，适合超大地图
     */
    mode?: GridPathfinderMode;
}

// =============================================================================
// 常量 | Constants
// =============================================================================

const CLOSED_FLAG = 1;
const OPENED_FLAG = 2;
const BACKWARD_CLOSED = 4;
const BACKWARD_OPENED = 8;

// =============================================================================
// 状态存储 | State Storage
// =============================================================================

class GridState {
    private readonly size: number;
    readonly width: number;

    private g: Float32Array;
    private f: Float32Array;
    private flags: Uint8Array;
    private parent: Int32Array;
    private heapIndex: Int32Array;
    private version: Uint32Array;
    private currentVersion: number = 1;

    // 双向搜索额外状态
    private gBack: Float32Array | null = null;
    private fBack: Float32Array | null = null;
    private parentBack: Int32Array | null = null;
    private heapIndexBack: Int32Array | null = null;

    constructor(width: number, height: number, bidirectional: boolean = false) {
        this.width = width;
        this.size = width * height;

        this.g = new Float32Array(this.size);
        this.f = new Float32Array(this.size);
        this.flags = new Uint8Array(this.size);
        this.parent = new Int32Array(this.size);
        this.heapIndex = new Int32Array(this.size);
        this.version = new Uint32Array(this.size);

        if (bidirectional) {
            this.gBack = new Float32Array(this.size);
            this.fBack = new Float32Array(this.size);
            this.parentBack = new Int32Array(this.size);
            this.heapIndexBack = new Int32Array(this.size);
        }
    }

    reset(): void {
        this.currentVersion++;
        if (this.currentVersion > 0xFFFFFFFF) {
            this.version.fill(0);
            this.currentVersion = 1;
        }
    }

    private isInit(i: number): boolean {
        return this.version[i] === this.currentVersion;
    }

    private init(i: number): void {
        if (!this.isInit(i)) {
            this.g[i] = Infinity;
            this.f[i] = Infinity;
            this.flags[i] = 0;
            this.parent[i] = -1;
            this.heapIndex[i] = -1;
            if (this.gBack) {
                this.gBack[i] = Infinity;
                this.fBack![i] = Infinity;
                this.parentBack![i] = -1;
                this.heapIndexBack![i] = -1;
            }
            this.version[i] = this.currentVersion;
        }
    }

    // Forward
    getG(i: number): number { return this.isInit(i) ? this.g[i] : Infinity; }
    setG(i: number, v: number): void { this.init(i); this.g[i] = v; }
    getF(i: number): number { return this.isInit(i) ? this.f[i] : Infinity; }
    setF(i: number, v: number): void { this.init(i); this.f[i] = v; }
    getParent(i: number): number { return this.isInit(i) ? this.parent[i] : -1; }
    setParent(i: number, v: number): void { this.init(i); this.parent[i] = v; }
    getHeapIndex(i: number): number { return this.isInit(i) ? this.heapIndex[i] : -1; }
    setHeapIndex(i: number, v: number): void { this.init(i); this.heapIndex[i] = v; }
    isClosed(i: number): boolean { return this.isInit(i) && (this.flags[i] & CLOSED_FLAG) !== 0; }
    setClosed(i: number): void { this.init(i); this.flags[i] |= CLOSED_FLAG; }
    isOpened(i: number): boolean { return this.isInit(i) && (this.flags[i] & OPENED_FLAG) !== 0; }
    setOpened(i: number): void { this.init(i); this.flags[i] |= OPENED_FLAG; }

    // Backward
    getGBack(i: number): number { return this.isInit(i) ? this.gBack![i] : Infinity; }
    setGBack(i: number, v: number): void { this.init(i); this.gBack![i] = v; }
    getFBack(i: number): number { return this.isInit(i) ? this.fBack![i] : Infinity; }
    setFBack(i: number, v: number): void { this.init(i); this.fBack![i] = v; }
    getParentBack(i: number): number { return this.isInit(i) ? this.parentBack![i] : -1; }
    setParentBack(i: number, v: number): void { this.init(i); this.parentBack![i] = v; }
    getHeapIndexBack(i: number): number { return this.isInit(i) ? this.heapIndexBack![i] : -1; }
    setHeapIndexBack(i: number, v: number): void { this.init(i); this.heapIndexBack![i] = v; }
    isClosedBack(i: number): boolean { return this.isInit(i) && (this.flags[i] & BACKWARD_CLOSED) !== 0; }
    setClosedBack(i: number): void { this.init(i); this.flags[i] |= BACKWARD_CLOSED; }
    isOpenedBack(i: number): boolean { return this.isInit(i) && (this.flags[i] & BACKWARD_OPENED) !== 0; }
    setOpenedBack(i: number): void { this.init(i); this.flags[i] |= BACKWARD_OPENED; }
}

// =============================================================================
// 堆 | Heap
// =============================================================================

class GridHeap {
    private heap: number[] = [];
    private state: GridState;
    private isBack: boolean;

    constructor(state: GridState, isBack: boolean = false) {
        this.state = state;
        this.isBack = isBack;
    }

    get size(): number { return this.heap.length; }
    get isEmpty(): boolean { return this.heap.length === 0; }

    private getF(i: number): number {
        return this.isBack ? this.state.getFBack(i) : this.state.getF(i);
    }
    private getHeapIndex(i: number): number {
        return this.isBack ? this.state.getHeapIndexBack(i) : this.state.getHeapIndex(i);
    }
    private setHeapIndex(i: number, v: number): void {
        if (this.isBack) this.state.setHeapIndexBack(i, v);
        else this.state.setHeapIndex(i, v);
    }

    push(i: number): void {
        this.setHeapIndex(i, this.heap.length);
        this.heap.push(i);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): number {
        if (this.heap.length === 0) return -1;
        const result = this.heap[0];
        this.setHeapIndex(result, -1);
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.setHeapIndex(last, 0);
            this.sinkDown(0);
        }
        return result;
    }

    update(i: number): void {
        const pos = this.getHeapIndex(i);
        if (pos >= 0 && pos < this.heap.length) {
            this.bubbleUp(pos);
            this.sinkDown(this.getHeapIndex(i));
        }
    }

    clear(): void { this.heap.length = 0; }

    private bubbleUp(pos: number): void {
        const idx = this.heap[pos];
        const f = this.getF(idx);
        while (pos > 0) {
            const pp = (pos - 1) >> 1;
            const pi = this.heap[pp];
            if (f >= this.getF(pi)) break;
            this.heap[pos] = pi;
            this.setHeapIndex(pi, pos);
            pos = pp;
        }
        this.heap[pos] = idx;
        this.setHeapIndex(idx, pos);
    }

    private sinkDown(pos: number): void {
        const len = this.heap.length;
        const idx = this.heap[pos];
        const f = this.getF(idx);
        const half = len >> 1;
        while (pos < half) {
            const left = (pos << 1) + 1;
            const right = left + 1;
            let smallest = pos, smallestF = f;
            const lf = this.getF(this.heap[left]);
            if (lf < smallestF) { smallest = left; smallestF = lf; }
            if (right < len) {
                const rf = this.getF(this.heap[right]);
                if (rf < smallestF) smallest = right;
            }
            if (smallest === pos) break;
            const si = this.heap[smallest];
            this.heap[pos] = si;
            this.setHeapIndex(si, pos);
            pos = smallest;
        }
        this.heap[pos] = idx;
        this.setHeapIndex(idx, pos);
    }
}

// =============================================================================
// 网格寻路器 | Grid Pathfinder
// =============================================================================

/**
 * @zh 网格寻路器
 * @en Grid Pathfinder
 */
export class GridPathfinder implements IPathfinder {
    private readonly map: GridMap;
    private readonly mode: GridPathfinderMode;
    private readonly state: GridState;
    private readonly openList: GridHeap;
    private readonly openListBack: GridHeap | null;

    constructor(map: GridMap, config?: IGridPathfinderConfig) {
        this.map = map;
        this.mode = config?.mode ?? 'fast';
        const isBidir = this.mode === 'bidirectional';
        this.state = new GridState(map.width, map.height, isBidir);
        this.openList = new GridHeap(this.state, false);
        this.openListBack = isBidir ? new GridHeap(this.state, true) : null;
    }

    findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        if (this.mode === 'bidirectional') {
            return this.findPathBidirectional(startX, startY, endX, endY, options);
        }
        return this.findPathUnidirectional(startX, startY, endX, endY, options);
    }

    private findPathUnidirectional(
        startX: number, startY: number,
        endX: number, endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        const opts = options ? { ...DEFAULT_PATHFINDING_OPTIONS, ...options } : DEFAULT_PATHFINDING_OPTIONS;
        const { width, height } = this.map;

        this.state.reset();
        this.openList.clear();

        if (!this.validate(startX, startY, endX, endY)) return EMPTY_PATH_RESULT;

        const startIdx = startY * width + startX;
        const endIdx = endY * width + endX;

        if (startIdx === endIdx) {
            return { found: true, path: [{ x: startX, y: startY }], cost: 0, nodesSearched: 1 };
        }

        const hw = opts.heuristicWeight;
        const h0 = this.map.heuristic({ x: startX, y: startY }, { x: endX, y: endY }) * hw;
        this.state.setG(startIdx, 0);
        this.state.setF(startIdx, h0);
        this.state.setOpened(startIdx);
        this.openList.push(startIdx);

        let searched = 0;
        const maxNodes = opts.maxNodes;
        const { allowDiagonal, avoidCorners, diagonalCost } = this.map['options'];
        const nodes = this.map['nodes'];
        const dx = allowDiagonal ? [0, 1, 1, 1, 0, -1, -1, -1] : [0, 1, 0, -1];
        const dy = allowDiagonal ? [-1, -1, 0, 1, 1, 1, 0, -1] : [-1, 0, 1, 0];
        const dirCount = dx.length;

        while (!this.openList.isEmpty && searched < maxNodes) {
            const cur = this.openList.pop();
            this.state.setClosed(cur);
            searched++;

            if (cur === endIdx) {
                return this.buildPath(startIdx, endIdx, searched);
            }

            const cx = cur % width, cy = (cur / width) | 0;
            const curG = this.state.getG(cur);

            for (let d = 0; d < dirCount; d++) {
                const nx = cx + dx[d], ny = cy + dy[d];
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

                const neighbor = nodes[ny][nx];
                if (!neighbor.walkable) continue;

                if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
                    if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) continue;
                }

                const ni = ny * width + nx;
                if (this.state.isClosed(ni)) continue;

                const isDiag = dx[d] !== 0 && dy[d] !== 0;
                const cost = isDiag ? neighbor.cost * diagonalCost : neighbor.cost;
                const tentG = curG + cost;

                if (!this.state.isOpened(ni)) {
                    const h = this.map.heuristic({ x: nx, y: ny }, { x: endX, y: endY }) * hw;
                    this.state.setG(ni, tentG);
                    this.state.setF(ni, tentG + h);
                    this.state.setParent(ni, cur);
                    this.state.setOpened(ni);
                    this.openList.push(ni);
                } else if (tentG < this.state.getG(ni)) {
                    const h = this.state.getF(ni) - this.state.getG(ni);
                    this.state.setG(ni, tentG);
                    this.state.setF(ni, tentG + h);
                    this.state.setParent(ni, cur);
                    this.openList.update(ni);
                }
            }
        }

        return { found: false, path: [], cost: 0, nodesSearched: searched };
    }

    private findPathBidirectional(
        startX: number, startY: number,
        endX: number, endY: number,
        options?: IPathfindingOptions
    ): IPathResult {
        const opts = options ? { ...DEFAULT_PATHFINDING_OPTIONS, ...options } : DEFAULT_PATHFINDING_OPTIONS;
        const { width, height } = this.map;

        this.state.reset();
        this.openList.clear();
        this.openListBack!.clear();

        if (!this.validate(startX, startY, endX, endY)) return EMPTY_PATH_RESULT;

        const startIdx = startY * width + startX;
        const endIdx = endY * width + endX;

        if (startIdx === endIdx) {
            return { found: true, path: [{ x: startX, y: startY }], cost: 0, nodesSearched: 1 };
        }

        const hw = opts.heuristicWeight;
        const startPos = { x: startX, y: startY };
        const endPos = { x: endX, y: endY };

        // Init forward
        const hf = this.map.heuristic(startPos, endPos) * hw;
        this.state.setG(startIdx, 0);
        this.state.setF(startIdx, hf);
        this.state.setOpened(startIdx);
        this.openList.push(startIdx);

        // Init backward
        const hb = this.map.heuristic(endPos, startPos) * hw;
        this.state.setGBack(endIdx, 0);
        this.state.setFBack(endIdx, hb);
        this.state.setOpenedBack(endIdx);
        this.openListBack!.push(endIdx);

        let searched = 0;
        const maxNodes = opts.maxNodes;
        let meetIdx = -1, bestCost = Infinity;

        const { allowDiagonal, avoidCorners, diagonalCost } = this.map['options'];
        const nodes = this.map['nodes'];
        const dx = allowDiagonal ? [0, 1, 1, 1, 0, -1, -1, -1] : [0, 1, 0, -1];
        const dy = allowDiagonal ? [-1, -1, 0, 1, 1, 1, 0, -1] : [-1, 0, 1, 0];
        const dirCount = dx.length;

        while ((!this.openList.isEmpty || !this.openListBack!.isEmpty) && searched < maxNodes) {
            // Forward
            if (!this.openList.isEmpty) {
                const cur = this.openList.pop();
                this.state.setClosed(cur);
                searched++;

                const curG = this.state.getG(cur);
                if (this.state.isClosedBack(cur)) {
                    const total = curG + this.state.getGBack(cur);
                    if (total < bestCost) { bestCost = total; meetIdx = cur; }
                }
                if (meetIdx !== -1 && curG >= bestCost) break;

                const cx = cur % width, cy = (cur / width) | 0;
                for (let d = 0; d < dirCount; d++) {
                    const nx = cx + dx[d], ny = cy + dy[d];
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                    const neighbor = nodes[ny][nx];
                    if (!neighbor.walkable) continue;
                    if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
                        if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) continue;
                    }
                    const ni = ny * width + nx;
                    if (this.state.isClosed(ni)) continue;
                    const isDiag = dx[d] !== 0 && dy[d] !== 0;
                    const cost = isDiag ? neighbor.cost * diagonalCost : neighbor.cost;
                    const tentG = curG + cost;
                    if (!this.state.isOpened(ni)) {
                        const h = this.map.heuristic({ x: nx, y: ny }, endPos) * hw;
                        this.state.setG(ni, tentG);
                        this.state.setF(ni, tentG + h);
                        this.state.setParent(ni, cur);
                        this.state.setOpened(ni);
                        this.openList.push(ni);
                    } else if (tentG < this.state.getG(ni)) {
                        const h = this.state.getF(ni) - this.state.getG(ni);
                        this.state.setG(ni, tentG);
                        this.state.setF(ni, tentG + h);
                        this.state.setParent(ni, cur);
                        this.openList.update(ni);
                    }
                }
            }

            // Backward
            if (!this.openListBack!.isEmpty) {
                const cur = this.openListBack!.pop();
                this.state.setClosedBack(cur);
                searched++;

                const curG = this.state.getGBack(cur);
                if (this.state.isClosed(cur)) {
                    const total = curG + this.state.getG(cur);
                    if (total < bestCost) { bestCost = total; meetIdx = cur; }
                }
                if (meetIdx !== -1 && curG >= bestCost) break;

                const cx = cur % width, cy = (cur / width) | 0;
                for (let d = 0; d < dirCount; d++) {
                    const nx = cx + dx[d], ny = cy + dy[d];
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                    const neighbor = nodes[ny][nx];
                    if (!neighbor.walkable) continue;
                    if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
                        if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) continue;
                    }
                    const ni = ny * width + nx;
                    if (this.state.isClosedBack(ni)) continue;
                    const isDiag = dx[d] !== 0 && dy[d] !== 0;
                    const cost = isDiag ? neighbor.cost * diagonalCost : neighbor.cost;
                    const tentG = curG + cost;
                    if (!this.state.isOpenedBack(ni)) {
                        const h = this.map.heuristic({ x: nx, y: ny }, startPos) * hw;
                        this.state.setGBack(ni, tentG);
                        this.state.setFBack(ni, tentG + h);
                        this.state.setParentBack(ni, cur);
                        this.state.setOpenedBack(ni);
                        this.openListBack!.push(ni);
                    } else if (tentG < this.state.getGBack(ni)) {
                        const h = this.state.getFBack(ni) - this.state.getGBack(ni);
                        this.state.setGBack(ni, tentG);
                        this.state.setFBack(ni, tentG + h);
                        this.state.setParentBack(ni, cur);
                        this.openListBack!.update(ni);
                    }
                }
            }
        }

        if (meetIdx === -1) {
            return { found: false, path: [], cost: 0, nodesSearched: searched };
        }

        return this.buildPathBidirectional(startIdx, endIdx, meetIdx, searched);
    }

    private validate(startX: number, startY: number, endX: number, endY: number): boolean {
        const { width, height } = this.map;
        if (startX < 0 || startX >= width || startY < 0 || startY >= height) return false;
        if (endX < 0 || endX >= width || endY < 0 || endY >= height) return false;
        return this.map.isWalkable(startX, startY) && this.map.isWalkable(endX, endY);
    }

    private buildPath(startIdx: number, endIdx: number, searched: number): IPathResult {
        const w = this.state.width;
        const path: IPoint[] = [];
        let cur = endIdx;
        while (cur !== -1) {
            path.push({ x: cur % w, y: (cur / w) | 0 });
            cur = cur === startIdx ? -1 : this.state.getParent(cur);
        }
        path.reverse();
        return { found: true, path, cost: this.state.getG(endIdx), nodesSearched: searched };
    }

    private buildPathBidirectional(startIdx: number, endIdx: number, meetIdx: number, searched: number): IPathResult {
        const w = this.state.width;
        const path: IPoint[] = [];

        // Forward path
        let cur = meetIdx;
        while (cur !== -1 && cur !== startIdx) {
            path.push({ x: cur % w, y: (cur / w) | 0 });
            cur = this.state.getParent(cur);
        }
        path.push({ x: startIdx % w, y: (startIdx / w) | 0 });
        path.reverse();

        // Backward path
        cur = this.state.getParentBack(meetIdx);
        while (cur !== -1 && cur !== endIdx) {
            path.push({ x: cur % w, y: (cur / w) | 0 });
            cur = this.state.getParentBack(cur);
        }
        if (meetIdx !== endIdx) {
            path.push({ x: endIdx % w, y: (endIdx / w) | 0 });
        }

        const cost = this.state.getG(meetIdx) + this.state.getGBack(meetIdx);
        return { found: true, path, cost, nodesSearched: searched };
    }

    clear(): void {
        this.state.reset();
        this.openList.clear();
        this.openListBack?.clear();
    }
}

/**
 * @zh 创建网格寻路器
 * @en Create grid pathfinder
 */
export function createGridPathfinder(map: GridMap, config?: IGridPathfinderConfig): GridPathfinder {
    return new GridPathfinder(map, config);
}

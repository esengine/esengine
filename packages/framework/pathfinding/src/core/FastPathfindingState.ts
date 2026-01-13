/**
 * @zh 高性能寻路状态存储
 * @en High-performance pathfinding state storage
 */

import type { IHeapIndexable } from './IndexedBinaryHeap';
import type { IPathNode } from './IPathfinding';

// =============================================================================
// A* 节点对象池 | A* Node Object Pool
// =============================================================================

/**
 * @zh A* 节点（内部使用）
 * @en A* Node (internal use)
 */
export interface IPooledAStarNode extends IHeapIndexable {
    node: IPathNode;
    g: number;
    h: number;
    f: number;
    parent: IPooledAStarNode | null;
    closed: boolean;
    opened: boolean;
    heapIndex: number;
}

/**
 * @zh A* 节点对象池
 * @en A* Node object pool
 */
export class AStarNodePool {
    private pool: IPooledAStarNode[] = [];
    private activeCount: number = 0;

    /**
     * @zh 获取节点
     * @en Acquire a node
     */
    acquire(node: IPathNode): IPooledAStarNode {
        let astarNode: IPooledAStarNode;

        if (this.pool.length > 0) {
            astarNode = this.pool.pop()!;
            astarNode.node = node;
        } else {
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
        }

        this.activeCount++;
        return astarNode;
    }

    /**
     * @zh 释放节点
     * @en Release a node
     */
    release(astarNode: IPooledAStarNode): void {
        astarNode.node = null!;
        astarNode.parent = null;
        astarNode.g = Infinity;
        astarNode.h = 0;
        astarNode.f = Infinity;
        astarNode.closed = false;
        astarNode.opened = false;
        astarNode.heapIndex = -1;
        this.pool.push(astarNode);
        this.activeCount--;
    }

    /**
     * @zh 批量释放
     * @en Release all from collection
     */
    releaseAll(nodes: Iterable<IPooledAStarNode>): void {
        for (const node of nodes) {
            this.release(node);
        }
    }

    /**
     * @zh 清空池
     * @en Clear pool
     */
    clear(): void {
        this.pool.length = 0;
        this.activeCount = 0;
    }

    get poolSize(): number {
        return this.pool.length;
    }

    get active(): number {
        return this.activeCount;
    }
}

// =============================================================================
// 快速网格状态 | Fast Grid State
// =============================================================================

const CLOSED_FLAG = 1;
const OPENED_FLAG = 2;

/**
 * @zh 快速网格寻路状态（TypedArray 实现）
 * @en Fast grid pathfinding state (TypedArray implementation)
 */
export class FastGridState {
    private readonly width: number;
    private readonly height: number;
    private readonly size: number;

    private g: Float32Array;
    private f: Float32Array;
    private h: Float32Array;
    private flags: Uint8Array;
    private parentIndex: Int32Array;
    private heapIndex: Int32Array;
    private version: Uint32Array;
    private currentVersion: number = 1;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        this.g = new Float32Array(this.size);
        this.f = new Float32Array(this.size);
        this.h = new Float32Array(this.size);
        this.flags = new Uint8Array(this.size);
        this.parentIndex = new Int32Array(this.size);
        this.heapIndex = new Int32Array(this.size);
        this.version = new Uint32Array(this.size);

        this.reset();
    }

    /**
     * @zh 重置状态
     * @en Reset state
     */
    reset(): void {
        this.currentVersion++;
        if (this.currentVersion > 0xFFFFFFFF) {
            this.version.fill(0);
            this.currentVersion = 1;
        }
    }

    /**
     * @zh 坐标转索引
     * @en Coordinates to index
     */
    toIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    /**
     * @zh 检查节点是否已初始化
     * @en Check if node is initialized
     */
    private isInitialized(index: number): boolean {
        return this.version[index] === this.currentVersion;
    }

    /**
     * @zh 确保节点已初始化
     * @en Ensure node is initialized
     */
    private ensureInitialized(index: number): void {
        if (this.version[index] !== this.currentVersion) {
            this.g[index] = Infinity;
            this.f[index] = Infinity;
            this.h[index] = 0;
            this.flags[index] = 0;
            this.parentIndex[index] = -1;
            this.heapIndex[index] = -1;
            this.version[index] = this.currentVersion;
        }
    }

    // G 值
    getG(index: number): number {
        return this.isInitialized(index) ? this.g[index] : Infinity;
    }

    setG(index: number, value: number): void {
        this.ensureInitialized(index);
        this.g[index] = value;
    }

    // F 值
    getF(index: number): number {
        return this.isInitialized(index) ? this.f[index] : Infinity;
    }

    setF(index: number, value: number): void {
        this.ensureInitialized(index);
        this.f[index] = value;
    }

    // H 值
    getH(index: number): number {
        return this.isInitialized(index) ? this.h[index] : 0;
    }

    setH(index: number, value: number): void {
        this.ensureInitialized(index);
        this.h[index] = value;
    }

    // Closed 状态
    isClosed(index: number): boolean {
        return this.isInitialized(index) && (this.flags[index] & CLOSED_FLAG) !== 0;
    }

    setClosed(index: number, value: boolean): void {
        this.ensureInitialized(index);
        if (value) {
            this.flags[index] |= CLOSED_FLAG;
        } else {
            this.flags[index] &= ~CLOSED_FLAG;
        }
    }

    // Opened 状态
    isOpened(index: number): boolean {
        return this.isInitialized(index) && (this.flags[index] & OPENED_FLAG) !== 0;
    }

    setOpened(index: number, value: boolean): void {
        this.ensureInitialized(index);
        if (value) {
            this.flags[index] |= OPENED_FLAG;
        } else {
            this.flags[index] &= ~OPENED_FLAG;
        }
    }

    // 父节点索引
    getParentIndex(index: number): number {
        return this.isInitialized(index) ? this.parentIndex[index] : -1;
    }

    setParentIndex(index: number, parent: number): void {
        this.ensureInitialized(index);
        this.parentIndex[index] = parent;
    }

    // 堆索引
    getHeapIndex(index: number): number {
        return this.isInitialized(index) ? this.heapIndex[index] : -1;
    }

    setHeapIndex(index: number, value: number): void {
        this.ensureInitialized(index);
        this.heapIndex[index] = value;
    }
}

// =============================================================================
// 快速二叉堆（索引版）| Fast Binary Heap (Index-based)
// =============================================================================

/**
 * @zh 基于索引的快速二叉堆
 * @en Index-based fast binary heap
 */
export class FastIndexedHeap {
    private heap: number[] = [];
    private state: FastGridState;

    constructor(state: FastGridState) {
        this.state = state;
    }

    get size(): number {
        return this.heap.length;
    }

    get isEmpty(): boolean {
        return this.heap.length === 0;
    }

    push(index: number): void {
        this.state.setHeapIndex(index, this.heap.length);
        this.heap.push(index);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): number {
        if (this.heap.length === 0) return -1;

        const result = this.heap[0];
        this.state.setHeapIndex(result, -1);

        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.state.setHeapIndex(last, 0);
            this.sinkDown(0);
        }

        return result;
    }

    update(index: number): void {
        const heapIdx = this.state.getHeapIndex(index);
        if (heapIdx >= 0 && heapIdx < this.heap.length) {
            this.bubbleUp(heapIdx);
            this.sinkDown(this.state.getHeapIndex(index));
        }
    }

    clear(): void {
        this.heap.length = 0;
    }

    private bubbleUp(pos: number): void {
        const index = this.heap[pos];
        const f = this.state.getF(index);

        while (pos > 0) {
            const parentPos = (pos - 1) >> 1;
            const parentIndex = this.heap[parentPos];

            if (f >= this.state.getF(parentIndex)) break;

            this.heap[pos] = parentIndex;
            this.state.setHeapIndex(parentIndex, pos);
            pos = parentPos;
        }

        this.heap[pos] = index;
        this.state.setHeapIndex(index, pos);
    }

    private sinkDown(pos: number): void {
        const length = this.heap.length;
        const index = this.heap[pos];
        const f = this.state.getF(index);
        const halfLength = length >> 1;

        while (pos < halfLength) {
            const leftPos = (pos << 1) + 1;
            const rightPos = leftPos + 1;

            let smallestPos = pos;
            let smallestF = f;

            const leftIndex = this.heap[leftPos];
            const leftF = this.state.getF(leftIndex);
            if (leftF < smallestF) {
                smallestPos = leftPos;
                smallestF = leftF;
            }

            if (rightPos < length) {
                const rightIndex = this.heap[rightPos];
                const rightF = this.state.getF(rightIndex);
                if (rightF < smallestF) {
                    smallestPos = rightPos;
                }
            }

            if (smallestPos === pos) break;

            const swapIndex = this.heap[smallestPos];
            this.heap[pos] = swapIndex;
            this.state.setHeapIndex(swapIndex, pos);
            pos = smallestPos;
        }

        this.heap[pos] = index;
        this.state.setHeapIndex(index, pos);
    }
}

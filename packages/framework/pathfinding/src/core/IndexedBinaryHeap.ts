/**
 * @zh 带索引追踪的二叉堆（优先队列）
 * @en Indexed Binary Heap (Priority Queue) with index tracking
 */

/**
 * @zh 可索引的堆元素接口
 * @en Interface for indexable heap elements
 */
export interface IHeapIndexable {
    /** @zh 堆中的索引位置 @en Index position in heap */
    heapIndex: number;
}

/**
 * @zh 带索引追踪的二叉堆
 * @en Binary Heap with index tracking
 */
export class IndexedBinaryHeap<T extends IHeapIndexable> {
    private heap: T[] = [];
    private readonly compare: (a: T, b: T) => number;

    /**
     * @zh 创建带索引追踪的二叉堆
     * @en Create indexed binary heap
     *
     * @param compare - @zh 比较函数，返回负数表示 a < b @en Compare function, returns negative if a < b
     */
    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    /**
     * @zh 堆大小
     * @en Heap size
     */
    get size(): number {
        return this.heap.length;
    }

    /**
     * @zh 是否为空
     * @en Is empty
     */
    get isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * @zh 插入元素
     * @en Push element
     */
    push(item: T): void {
        item.heapIndex = this.heap.length;
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * @zh 弹出最小元素
     * @en Pop minimum element
     */
    pop(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }

        const result = this.heap[0];
        result.heapIndex = -1;

        const last = this.heap.pop()!;

        if (this.heap.length > 0) {
            last.heapIndex = 0;
            this.heap[0] = last;
            this.sinkDown(0);
        }

        return result;
    }

    /**
     * @zh 查看最小元素（不移除）
     * @en Peek minimum element (without removing)
     */
    peek(): T | undefined {
        return this.heap[0];
    }

    /**
     * @zh 更新元素
     * @en Update element
     */
    update(item: T): void {
        const index = item.heapIndex;
        if (index >= 0 && index < this.heap.length && this.heap[index] === item) {
            this.bubbleUp(index);
            this.sinkDown(item.heapIndex);
        }
    }

    /**
     * @zh 检查是否包含元素
     * @en Check if contains element
     */
    contains(item: T): boolean {
        const index = item.heapIndex;
        return index >= 0 && index < this.heap.length && this.heap[index] === item;
    }

    /**
     * @zh 从堆中移除指定元素
     * @en Remove specific element from heap
     */
    remove(item: T): boolean {
        const index = item.heapIndex;
        if (index < 0 || index >= this.heap.length || this.heap[index] !== item) {
            return false;
        }

        item.heapIndex = -1;

        if (index === this.heap.length - 1) {
            this.heap.pop();
            return true;
        }

        const last = this.heap.pop()!;
        last.heapIndex = index;
        this.heap[index] = last;
        this.bubbleUp(index);
        this.sinkDown(last.heapIndex);

        return true;
    }

    /**
     * @zh 清空堆
     * @en Clear heap
     */
    clear(): void {
        for (const item of this.heap) {
            item.heapIndex = -1;
        }
        this.heap.length = 0;
    }

    /**
     * @zh 上浮操作
     * @en Bubble up operation
     */
    private bubbleUp(index: number): void {
        const item = this.heap[index];

        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            const parent = this.heap[parentIndex];

            if (this.compare(item, parent) >= 0) {
                break;
            }

            parent.heapIndex = index;
            this.heap[index] = parent;
            index = parentIndex;
        }

        item.heapIndex = index;
        this.heap[index] = item;
    }

    /**
     * @zh 下沉操作
     * @en Sink down operation
     */
    private sinkDown(index: number): void {
        const length = this.heap.length;
        const item = this.heap[index];
        const halfLength = length >> 1;

        while (index < halfLength) {
            const leftIndex = (index << 1) + 1;
            const rightIndex = leftIndex + 1;
            let smallest = index;
            let smallestItem = item;

            const left = this.heap[leftIndex];
            if (this.compare(left, smallestItem) < 0) {
                smallest = leftIndex;
                smallestItem = left;
            }

            if (rightIndex < length) {
                const right = this.heap[rightIndex];
                if (this.compare(right, smallestItem) < 0) {
                    smallest = rightIndex;
                    smallestItem = right;
                }
            }

            if (smallest === index) {
                break;
            }

            smallestItem.heapIndex = index;
            this.heap[index] = smallestItem;
            index = smallest;
        }

        item.heapIndex = index;
        this.heap[index] = item;
    }
}

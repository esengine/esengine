/**
 * @zh 二叉堆（优先队列）
 * @en Binary Heap (Priority Queue)
 *
 * @zh 用于 A* 算法的高效开放列表
 * @en Efficient open list for A* algorithm
 */
export class BinaryHeap<T> {
    private heap: T[] = [];
    private readonly compare: (a: T, b: T) => number;

    /**
     * @zh 创建二叉堆
     * @en Create binary heap
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
        const last = this.heap.pop()!;

        if (this.heap.length > 0) {
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
     * @zh 更新元素（重新排序）
     * @en Update element (re-sort)
     */
    update(item: T): void {
        const index = this.heap.indexOf(item);
        if (index !== -1) {
            this.bubbleUp(index);
            this.sinkDown(index);
        }
    }

    /**
     * @zh 检查是否包含元素
     * @en Check if contains element
     */
    contains(item: T): boolean {
        return this.heap.indexOf(item) !== -1;
    }

    /**
     * @zh 清空堆
     * @en Clear heap
     */
    clear(): void {
        this.heap.length = 0;
    }

    /**
     * @zh 上浮操作
     * @en Bubble up operation
     */
    private bubbleUp(index: number): void {
        const item = this.heap[index];

        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];

            if (this.compare(item, parent) >= 0) {
                break;
            }

            this.heap[index] = parent;
            index = parentIndex;
        }

        this.heap[index] = item;
    }

    /**
     * @zh 下沉操作
     * @en Sink down operation
     */
    private sinkDown(index: number): void {
        const length = this.heap.length;
        const item = this.heap[index];

        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;

            if (leftIndex < length && this.compare(this.heap[leftIndex], this.heap[smallest]) < 0) {
                smallest = leftIndex;
            }

            if (rightIndex < length && this.compare(this.heap[rightIndex], this.heap[smallest]) < 0) {
                smallest = rightIndex;
            }

            if (smallest === index) {
                break;
            }

            this.heap[index] = this.heap[smallest];
            this.heap[smallest] = item;
            index = smallest;
        }
    }
}

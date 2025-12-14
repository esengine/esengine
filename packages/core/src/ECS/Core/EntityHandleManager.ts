/**
 * 实体句柄管理器
 *
 * 管理轻量级实体句柄的生命周期，包括创建、销毁和状态查询。
 * 使用 TypedArray 实现高效的内存布局。
 *
 * Entity handle manager.
 * Manages lifecycle of lightweight entity handles including creation, destruction and state queries.
 * Uses TypedArray for efficient memory layout.
 *
 * @example
 * ```typescript
 * const manager = new EntityHandleManager();
 * const handle = manager.create();
 * console.log(manager.isAlive(handle)); // true
 *
 * manager.destroy(handle);
 * console.log(manager.isAlive(handle)); // false
 *
 * // 索引会被复用，但代数会增加
 * const newHandle = manager.create();
 * console.log(indexOf(handle) === indexOf(newHandle)); // true
 * console.log(genOf(newHandle) > genOf(handle)); // true
 * ```
 */

import {
    EntityHandle,
    makeHandle,
    indexOf,
    genOf,
    MAX_ENTITIES,
    MAX_GENERATION
} from './EntityHandle';

/**
 * 初始容量 | Initial capacity
 */
const INITIAL_CAPACITY = 1024;

/**
 * 实体句柄管理器
 *
 * Entity handle manager.
 */
export class EntityHandleManager {
    /**
     * 代数数组（每个索引的当前代数）
     * Generation array (current generation for each index)
     */
    private _generations: Uint32Array;

    /**
     * 存活状态数组（0=死亡，1=存活）
     * Alive state array (0=dead, 1=alive)
     */
    private _alive: Uint8Array;

    /**
     * 启用状态数组（0=禁用，1=启用）
     * Enabled state array (0=disabled, 1=enabled)
     */
    private _enabled: Uint8Array;

    /**
     * 空闲索引列表（用于复用已销毁的索引）
     * Free index list (for reusing destroyed indices)
     */
    private _freeList: number[] = [];

    /**
     * 下一个新索引
     * Next new index
     */
    private _nextIndex: number = 1; // 从 1 开始，0 保留给 NULL_HANDLE

    /**
     * 当前存活实体数量
     * Current alive entity count
     */
    private _aliveCount: number = 0;

    /**
     * 当前容量
     * Current capacity
     */
    private _capacity: number;

    /**
     * 创建实体句柄管理器
     * Create entity handle manager
     *
     * @param initialCapacity 初始容量 | Initial capacity
     */
    constructor(initialCapacity: number = INITIAL_CAPACITY) {
        this._capacity = initialCapacity;
        this._generations = new Uint32Array(initialCapacity);
        this._alive = new Uint8Array(initialCapacity);
        this._enabled = new Uint8Array(initialCapacity);

        // 索引 0 保留给 NULL_HANDLE
        this._alive[0] = 0;
        this._enabled[0] = 0;
    }

    /**
     * 获取存活实体数量
     * Get alive entity count
     */
    public get aliveCount(): number {
        return this._aliveCount;
    }

    /**
     * 获取当前容量
     * Get current capacity
     */
    public get capacity(): number {
        return this._capacity;
    }

    /**
     * 创建新实体句柄
     * Create new entity handle
     *
     * @returns 新实体句柄 | New entity handle
     */
    public create(): EntityHandle {
        let index: number;

        // 优先从空闲列表中获取索引
        if (this._freeList.length > 0) {
            index = this._freeList.pop()!;
        } else {
            // 分配新索引
            index = this._nextIndex++;

            // 检查是否需要扩容
            if (index >= this._capacity) {
                this.grow(index);
            }
        }

        // 获取当前代数（可能因之前销毁而增加）
        const generation = this._generations[index]!;

        // 标记为存活和启用
        this._alive[index] = 1;
        this._enabled[index] = 1;
        this._aliveCount++;

        return makeHandle(index, generation);
    }

    /**
     * 销毁实体句柄
     * Destroy entity handle
     *
     * @param handle 要销毁的句柄 | Handle to destroy
     * @returns 是否成功销毁 | Whether destruction succeeded
     */
    public destroy(handle: EntityHandle): boolean {
        const index = indexOf(handle);
        const generation = genOf(handle);

        // 验证句柄有效性
        if (index >= this._capacity || index === 0) {
            return false;
        }

        if (this._generations[index] !== generation) {
            return false;
        }

        if (this._alive[index] !== 1) {
            return false;
        }

        // 标记为死亡
        this._alive[index] = 0;
        this._enabled[index] = 0;
        this._aliveCount--;

        // 增加代数（防止 ABA 问题）
        const newGen = (generation + 1) % MAX_GENERATION;
        this._generations[index] = newGen;

        // 将索引加入空闲列表
        this._freeList.push(index);

        return true;
    }

    /**
     * 检查句柄是否存活
     * Check if handle is alive
     *
     * @param handle 实体句柄 | Entity handle
     * @returns 是否存活 | Whether alive
     */
    public isAlive(handle: EntityHandle): boolean {
        const index = indexOf(handle);
        const generation = genOf(handle);

        if (index >= this._capacity || index === 0) {
            return false;
        }

        return this._alive[index] === 1 && this._generations[index] === generation;
    }

    /**
     * 检查句柄是否启用
     * Check if handle is enabled
     *
     * @param handle 实体句柄 | Entity handle
     * @returns 是否启用 | Whether enabled
     */
    public isEnabled(handle: EntityHandle): boolean {
        if (!this.isAlive(handle)) {
            return false;
        }

        const index = indexOf(handle);
        return this._enabled[index] === 1;
    }

    /**
     * 设置句柄启用状态
     * Set handle enabled state
     *
     * @param handle 实体句柄 | Entity handle
     * @param enabled 启用状态 | Enabled state
     * @returns 是否成功设置 | Whether setting succeeded
     */
    public setEnabled(handle: EntityHandle, enabled: boolean): boolean {
        if (!this.isAlive(handle)) {
            return false;
        }

        const index = indexOf(handle);
        this._enabled[index] = enabled ? 1 : 0;
        return true;
    }

    /**
     * 验证句柄是否有效（存活且代数匹配）
     * Validate if handle is valid (alive and generation matches)
     *
     * @param handle 实体句柄 | Entity handle
     * @returns 是否有效 | Whether valid
     */
    public validate(handle: EntityHandle): boolean {
        return this.isAlive(handle);
    }

    /**
     * 扩容数组
     * Grow arrays
     */
    private grow(minIndex: number): void {
        let newSize = this._capacity;

        // 按 2 倍扩容
        while (newSize <= minIndex) {
            newSize <<= 1;
        }

        // 检查是否超过最大容量
        if (newSize > MAX_ENTITIES) {
            newSize = MAX_ENTITIES;
            if (minIndex >= newSize) {
                throw new Error(`EntityHandleManager: 超过最大实体数量 ${MAX_ENTITIES}`);
            }
        }

        // 创建新数组并复制数据
        const newGenerations = new Uint32Array(newSize);
        const newAlive = new Uint8Array(newSize);
        const newEnabled = new Uint8Array(newSize);

        newGenerations.set(this._generations);
        newAlive.set(this._alive);
        newEnabled.set(this._enabled);

        this._generations = newGenerations;
        this._alive = newAlive;
        this._enabled = newEnabled;
        this._capacity = newSize;
    }

    /**
     * 重置管理器状态
     * Reset manager state
     */
    public reset(): void {
        this._generations.fill(0);
        this._alive.fill(0);
        this._enabled.fill(0);
        this._freeList.length = 0;
        this._nextIndex = 1;
        this._aliveCount = 0;
    }

    /**
     * 遍历所有存活的句柄
     * Iterate all alive handles
     *
     * @param callback 回调函数 | Callback function
     */
    public forEach(callback: (handle: EntityHandle) => void): void {
        for (let i = 1; i < this._nextIndex; i++) {
            if (this._alive[i] === 1) {
                const handle = makeHandle(i, this._generations[i]!);
                callback(handle);
            }
        }
    }

    /**
     * 获取所有存活的句柄
     * Get all alive handles
     *
     * @returns 存活句柄数组 | Alive handles array
     */
    public getAllAlive(): EntityHandle[] {
        const result: EntityHandle[] = [];
        this.forEach((handle) => result.push(handle));
        return result;
    }
}

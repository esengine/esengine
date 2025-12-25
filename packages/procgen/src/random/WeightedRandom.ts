/**
 * @zh 加权随机工具
 * @en Weighted Random Utilities
 */

import type { SeededRandom } from './SeededRandom';

/**
 * @zh 加权项
 * @en Weighted item
 */
export interface WeightedItem<T> {
    /**
     * @zh 项目值
     * @en Item value
     */
    value: T;

    /**
     * @zh 权重（> 0）
     * @en Weight (> 0)
     */
    weight: number;
}

/**
 * @zh 加权随机选择器
 * @en Weighted random selector
 */
export class WeightedRandom<T> {
    private readonly _items: WeightedItem<T>[];
    private readonly _cumulativeWeights: number[];
    private readonly _totalWeight: number;

    /**
     * @zh 创建加权随机选择器
     * @en Create weighted random selector
     *
     * @param items - @zh 加权项数组 @en Array of weighted items
     */
    constructor(items: WeightedItem<T>[]) {
        if (items.length === 0) {
            throw new Error('Items array cannot be empty');
        }

        this._items = [...items];
        this._cumulativeWeights = [];

        let total = 0;
        for (const item of this._items) {
            if (item.weight <= 0) {
                throw new Error('Weights must be positive');
            }
            total += item.weight;
            this._cumulativeWeights.push(total);
        }

        this._totalWeight = total;
    }

    /**
     * @zh 随机选择一个项目
     * @en Randomly select an item
     *
     * @param rng - @zh 随机数生成器 @en Random number generator
     */
    pick(rng: SeededRandom | { next(): number }): T {
        const r = rng.next() * this._totalWeight;

        // Binary search for the selected item
        let left = 0;
        let right = this._cumulativeWeights.length - 1;

        while (left < right) {
            const mid = (left + right) >>> 1;
            if (this._cumulativeWeights[mid] < r) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return this._items[left].value;
    }

    /**
     * @zh 使用 Math.random 选择
     * @en Pick using Math.random
     */
    pickRandom(): T {
        return this.pick({ next: () => Math.random() });
    }

    /**
     * @zh 获取项目的选中概率
     * @en Get selection probability of an item
     */
    getProbability(index: number): number {
        if (index < 0 || index >= this._items.length) {
            throw new Error('Index out of bounds');
        }
        return this._items[index].weight / this._totalWeight;
    }

    /**
     * @zh 获取所有项目数量
     * @en Get total item count
     */
    get size(): number {
        return this._items.length;
    }

    /**
     * @zh 获取总权重
     * @en Get total weight
     */
    get totalWeight(): number {
        return this._totalWeight;
    }
}

/**
 * @zh 从加权数组中随机选择
 * @en Pick from weighted array
 *
 * @param items - @zh 加权项数组 @en Array of weighted items
 * @param rng - @zh 随机数生成器 @en Random number generator
 */
export function weightedPick<T>(
    items: WeightedItem<T>[],
    rng: SeededRandom | { next(): number }
): T {
    if (items.length === 0) {
        throw new Error('Items array cannot be empty');
    }

    let totalWeight = 0;
    for (const item of items) {
        totalWeight += item.weight;
    }

    let r = rng.next() * totalWeight;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) {
            return item.value;
        }
    }

    return items[items.length - 1].value;
}

/**
 * @zh 从权重映射中随机选择
 * @en Pick from weight map
 *
 * @param weights - @zh 值到权重的映射 @en Map of values to weights
 * @param rng - @zh 随机数生成器 @en Random number generator
 */
export function weightedPickFromMap<T extends string | number>(
    weights: Record<T, number>,
    rng: SeededRandom | { next(): number }
): T {
    const items: WeightedItem<T>[] = [];
    for (const key in weights) {
        items.push({ value: key as T, weight: weights[key] });
    }
    return weightedPick(items, rng);
}

/**
 * @zh 创建加权随机选择器
 * @en Create weighted random selector
 */
export function createWeightedRandom<T>(items: WeightedItem<T>[]): WeightedRandom<T> {
    return new WeightedRandom(items);
}

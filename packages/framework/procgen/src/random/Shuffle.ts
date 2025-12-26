/**
 * @zh 洗牌和采样工具
 * @en Shuffle and Sampling Utilities
 */

import type { SeededRandom } from './SeededRandom';

/**
 * @zh Fisher-Yates 洗牌算法（原地修改）
 * @en Fisher-Yates shuffle algorithm (in-place)
 *
 * @param array - @zh 要洗牌的数组 @en Array to shuffle
 * @param rng - @zh 随机数生成器 @en Random number generator
 * @returns @zh 洗牌后的数组（同一数组）@en Shuffled array (same array)
 */
export function shuffle<T>(array: T[], rng: SeededRandom | { next(): number }): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * @zh 创建洗牌后的副本（不修改原数组）
 * @en Create shuffled copy (does not modify original)
 *
 * @param array - @zh 原数组 @en Original array
 * @param rng - @zh 随机数生成器 @en Random number generator
 * @returns @zh 洗牌后的新数组 @en New shuffled array
 */
export function shuffleCopy<T>(array: readonly T[], rng: SeededRandom | { next(): number }): T[] {
    return shuffle([...array], rng);
}

/**
 * @zh 从数组中随机选择一个元素
 * @en Pick a random element from array
 *
 * @param array - @zh 数组 @en Array
 * @param rng - @zh 随机数生成器 @en Random number generator
 * @returns @zh 随机元素 @en Random element
 */
export function pickOne<T>(array: readonly T[], rng: SeededRandom | { next(): number }): T {
    if (array.length === 0) {
        throw new Error('Cannot pick from empty array');
    }
    return array[Math.floor(rng.next() * array.length)];
}

/**
 * @zh 从数组中随机采样 N 个不重复元素
 * @en Sample N unique elements from array
 *
 * @param array - @zh 数组 @en Array
 * @param count - @zh 采样数量 @en Sample count
 * @param rng - @zh 随机数生成器 @en Random number generator
 * @returns @zh 采样结果 @en Sample result
 */
export function sample<T>(array: readonly T[], count: number, rng: SeededRandom | { next(): number }): T[] {
    if (count > array.length) {
        throw new Error('Sample count exceeds array length');
    }

    if (count === array.length) {
        return shuffleCopy(array, rng);
    }

    // For small sample sizes relative to array, use selection
    if (count < array.length / 2) {
        const result: T[] = [];
        const indices = new Set<number>();

        while (result.length < count) {
            const index = Math.floor(rng.next() * array.length);
            if (!indices.has(index)) {
                indices.add(index);
                result.push(array[index]);
            }
        }

        return result;
    }

    // For large sample sizes, shuffle and take first N
    return shuffleCopy(array, rng).slice(0, count);
}

/**
 * @zh 从数组中随机采样 N 个元素（可重复）
 * @en Sample N elements from array (with replacement)
 *
 * @param array - @zh 数组 @en Array
 * @param count - @zh 采样数量 @en Sample count
 * @param rng - @zh 随机数生成器 @en Random number generator
 * @returns @zh 采样结果 @en Sample result
 */
export function sampleWithReplacement<T>(
    array: readonly T[],
    count: number,
    rng: SeededRandom | { next(): number }
): T[] {
    if (array.length === 0) {
        throw new Error('Cannot sample from empty array');
    }

    const result: T[] = [];
    for (let i = 0; i < count; i++) {
        result.push(pickOne(array, rng));
    }
    return result;
}

/**
 * @zh 生成范围内的随机整数数组（不重复）
 * @en Generate array of random unique integers in range
 *
 * @param min - @zh 最小值（包含）@en Minimum (inclusive)
 * @param max - @zh 最大值（包含）@en Maximum (inclusive)
 * @param count - @zh 数量 @en Count
 * @param rng - @zh 随机数生成器 @en Random number generator
 * @returns @zh 随机整数数组 @en Array of random integers
 */
export function randomIntegers(
    min: number,
    max: number,
    count: number,
    rng: SeededRandom | { next(): number }
): number[] {
    const range = max - min + 1;
    if (count > range) {
        throw new Error('Count exceeds range');
    }

    // Generate all numbers and sample
    const numbers: number[] = [];
    for (let i = min; i <= max; i++) {
        numbers.push(i);
    }

    return sample(numbers, count, rng);
}

/**
 * @zh 按权重从数组中采样（不重复）
 * @en Sample from array by weight (without replacement)
 *
 * @param items - @zh 项目数组 @en Item array
 * @param weights - @zh 权重数组 @en Weight array
 * @param count - @zh 采样数量 @en Sample count
 * @param rng - @zh 随机数生成器 @en Random number generator
 */
export function weightedSample<T>(
    items: readonly T[],
    weights: readonly number[],
    count: number,
    rng: SeededRandom | { next(): number }
): T[] {
    if (items.length !== weights.length) {
        throw new Error('Items and weights must have same length');
    }
    if (count > items.length) {
        throw new Error('Sample count exceeds array length');
    }

    const result: T[] = [];
    const remaining = [...items];
    const remainingWeights = [...weights];

    for (let i = 0; i < count; i++) {
        let totalWeight = 0;
        for (const w of remainingWeights) {
            totalWeight += w;
        }

        let r = rng.next() * totalWeight;
        let selectedIndex = 0;

        for (let j = 0; j < remainingWeights.length; j++) {
            r -= remainingWeights[j];
            if (r <= 0) {
                selectedIndex = j;
                break;
            }
        }

        result.push(remaining[selectedIndex]);
        remaining.splice(selectedIndex, 1);
        remainingWeights.splice(selectedIndex, 1);
    }

    return result;
}

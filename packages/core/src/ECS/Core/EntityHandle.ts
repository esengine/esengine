/**
 * 轻量级实体句柄
 *
 * 使用数值表示实体，包含索引和代数信息。
 * 28位索引 + 20位代数 = 48位，在 JavaScript 安全整数范围内。
 *
 * Lightweight entity handle.
 * Uses numeric value to represent entity with index and generation.
 * 28-bit index + 20-bit generation = 48-bit, within JavaScript safe integer range.
 *
 * @example
 * ```typescript
 * const handle = makeHandle(42, 1);
 * console.log(indexOf(handle)); // 42
 * console.log(genOf(handle));   // 1
 * console.log(isValidHandle(handle)); // true
 * ```
 */

/**
 * 实体句柄类型
 *
 * 使用 branded type 提供类型安全。
 *
 * Entity handle type.
 * Uses branded type for type safety.
 */
export type EntityHandle = number & { readonly __brand: 'EntityHandle' };

/**
 * 索引位数 | Index bits
 */
export const INDEX_BITS = 28;

/**
 * 代数位数 | Generation bits
 */
export const GEN_BITS = 20;

/**
 * 索引掩码 | Index mask
 */
export const INDEX_MASK = (1 << INDEX_BITS) - 1; // 0x0FFFFFFF

/**
 * 代数掩码 | Generation mask
 */
export const GEN_MASK = (1 << GEN_BITS) - 1; // 0x000FFFFF

/**
 * 最大实体数量 | Maximum entity count
 */
export const MAX_ENTITIES = 1 << INDEX_BITS; // 268,435,456

/**
 * 最大代数值 | Maximum generation value
 */
export const MAX_GENERATION = 1 << GEN_BITS; // 1,048,576

/**
 * 空句柄常量 | Null handle constant
 */
export const NULL_HANDLE = 0 as EntityHandle;

/**
 * 创建实体句柄
 * Create entity handle
 *
 * @param index 实体索引 | Entity index
 * @param generation 实体代数 | Entity generation
 * @returns 实体句柄 | Entity handle
 */
export function makeHandle(index: number, generation: number): EntityHandle {
    // handle = generation * 2^28 + index
    // 使用乘法而不是位移，因为位移只支持 32 位
    return ((generation & GEN_MASK) * MAX_ENTITIES + (index & INDEX_MASK)) as EntityHandle;
}

/**
 * 从句柄提取索引
 * Extract index from handle
 *
 * @param handle 实体句柄 | Entity handle
 * @returns 实体索引 | Entity index
 */
export function indexOf(handle: EntityHandle): number {
    return handle & INDEX_MASK;
}

/**
 * 从句柄提取代数
 * Extract generation from handle
 *
 * @param handle 实体句柄 | Entity handle
 * @returns 实体代数 | Entity generation
 */
export function genOf(handle: EntityHandle): number {
    return Math.floor(handle / MAX_ENTITIES) & GEN_MASK;
}

/**
 * 检查句柄是否有效（非空）
 * Check if handle is valid (non-null)
 *
 * @param handle 实体句柄 | Entity handle
 * @returns 是否有效 | Whether valid
 */
export function isValidHandle(handle: EntityHandle): boolean {
    return handle !== NULL_HANDLE;
}

/**
 * 比较两个句柄是否相等
 * Compare two handles for equality
 *
 * @param a 第一个句柄 | First handle
 * @param b 第二个句柄 | Second handle
 * @returns 是否相等 | Whether equal
 */
export function handleEquals(a: EntityHandle, b: EntityHandle): boolean {
    return a === b;
}

/**
 * 将句柄转换为字符串（用于调试）
 * Convert handle to string (for debugging)
 *
 * @param handle 实体句柄 | Entity handle
 * @returns 字符串表示 | String representation
 */
export function handleToString(handle: EntityHandle): string {
    if (handle === NULL_HANDLE) {
        return 'Entity(NULL)';
    }
    return `Entity(idx=${indexOf(handle)}, gen=${genOf(handle)})`;
}

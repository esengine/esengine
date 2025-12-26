/**
 * @zh 依赖管理工具
 * @en Dependency Management Utilities
 *
 * @zh 提供统一的依赖解析、拓扑排序和验证功能
 * @en Provides unified dependency resolution, topological sorting, and validation
 *
 * @zh 设计原则 | Design principles:
 * 1. 单一实现 - 所有依赖处理逻辑集中在这里
 * 2. 泛型设计 - 支持任何带有 id 和 dependencies 的对象
 * 3. 算法可选 - 支持 DFS 和 Kahn 两种排序算法
 */

import { createLogger } from '@esengine/ecs-framework';

const logger = createLogger('DependencyUtils');

// ============================================================================
// 类型定义 | Type Definitions
// ============================================================================

/**
 * @zh 可排序的依赖项接口
 * @en Interface for sortable dependency items
 */
export interface IDependable {
    /**
     * @zh 唯一标识符
     * @en Unique identifier
     */
    id: string;

    /**
     * @zh 依赖项 ID 列表
     * @en List of dependency IDs
     */
    dependencies?: string[];
}

/**
 * @zh 拓扑排序选项
 * @en Topological sort options
 */
export interface TopologicalSortOptions {
    /**
     * @zh 排序算法
     * @en Sorting algorithm
     * @default 'kahn'
     */
    algorithm?: 'dfs' | 'kahn';

    /**
     * @zh 是否检测循环依赖
     * @en Whether to detect circular dependencies
     * @default true
     */
    detectCycles?: boolean;

    /**
     * @zh ID 解析函数（将短 ID 转换为完整 ID）
     * @en ID resolver function (convert short ID to full ID)
     */
    resolveId?: (id: string) => string;
}

/**
 * @zh 拓扑排序结果
 * @en Topological sort result
 */
export interface TopologicalSortResult<T> {
    /**
     * @zh 排序后的项目列表
     * @en Sorted items list
     */
    sorted: T[];

    /**
     * @zh 是否存在循环依赖
     * @en Whether circular dependencies exist
     */
    hasCycles: boolean;

    /**
     * @zh 循环依赖中的项目 ID
     * @en IDs of items in circular dependencies
     */
    cycleIds?: string[];
}

/**
 * @zh 依赖验证结果
 * @en Dependency validation result
 */
export interface DependencyValidationResult {
    /**
     * @zh 是否验证通过
     * @en Whether validation passed
     */
    valid: boolean;

    /**
     * @zh 缺失依赖的映射（项目 ID -> 缺失的依赖 ID 列表）
     * @en Map of missing dependencies (item ID -> missing dependency IDs)
     */
    missingDependencies: Map<string, string[]>;

    /**
     * @zh 循环依赖的项目 ID
     * @en IDs involved in circular dependencies
     */
    circularDependencies?: string[];
}

// ============================================================================
// 依赖 ID 解析 | Dependency ID Resolution
// ============================================================================

/**
 * @zh 解析依赖 ID（短 ID 转完整包名）
 * @en Resolve dependency ID (short ID to full package name)
 *
 * @example
 * resolveDependencyId('sprite') // '@esengine/sprite'
 * resolveDependencyId('@esengine/sprite') // '@esengine/sprite'
 * resolveDependencyId('@dimforge/rapier2d') // '@dimforge/rapier2d'
 */
export function resolveDependencyId(depId: string, scope = '@esengine'): string {
    if (depId.startsWith('@')) {
        return depId;
    }
    return `${scope}/${depId}`;
}

/**
 * @zh 从完整包名提取短 ID
 * @en Extract short ID from full package name
 *
 * @example
 * extractShortId('@esengine/sprite') // 'sprite'
 * extractShortId('@esengine/ecs-framework') // 'core' (特殊映射)
 */
export function extractShortId(packageName: string): string {
    if (packageName.startsWith('@esengine/')) {
        const name = packageName.slice(10);
        if (name === 'ecs-framework') return 'core';
        if (name === 'ecs-framework-math') return 'math';
        return name;
    }

    const scopeMatch = packageName.match(/^@[^/]+\/(.+)$/);
    if (scopeMatch) {
        return scopeMatch[1];
    }

    return packageName;
}

/**
 * @zh 从短 ID 获取完整包名
 * @en Get full package name from short ID
 *
 * @example
 * getPackageName('core') // '@esengine/ecs-framework'
 * getPackageName('sprite') // '@esengine/sprite'
 */
export function getPackageName(shortId: string): string {
    if (shortId === 'core') return '@esengine/ecs-framework';
    if (shortId === 'math') return '@esengine/ecs-framework-math';
    return `@esengine/${shortId}`;
}

// ============================================================================
// 拓扑排序 | Topological Sort
// ============================================================================

/**
 * @zh 使用 Kahn 算法进行拓扑排序
 * @en Topological sort using Kahn's algorithm
 *
 * @zh Kahn 算法优势：
 * - 能够检测循环依赖
 * - 返回所有循环中的节点
 * - 时间复杂度 O(V + E)
 */
function kahnSort<T extends IDependable>(
    items: T[],
    resolveId: (id: string) => string
): TopologicalSortResult<T> {
    const itemMap = new Map<string, T>();
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // 构建节点映射
    for (const item of items) {
        itemMap.set(item.id, item);
        graph.set(item.id, new Set());
        inDegree.set(item.id, 0);
    }

    // 构建边（依赖 -> 被依赖者）
    for (const item of items) {
        for (const dep of item.dependencies || []) {
            const depId = resolveId(dep);
            if (itemMap.has(depId)) {
                graph.get(depId)!.add(item.id);
                inDegree.set(item.id, (inDegree.get(item.id) || 0) + 1);
            }
        }
    }

    // 收集入度为 0 的节点
    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
        if (degree === 0) {
            queue.push(id);
        }
    }

    // BFS 处理
    const sorted: T[] = [];
    while (queue.length > 0) {
        const current = queue.shift()!;
        sorted.push(itemMap.get(current)!);

        for (const neighbor of graph.get(current) || []) {
            const newDegree = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                queue.push(neighbor);
            }
        }
    }

    // 检查循环依赖
    if (sorted.length !== items.length) {
        const cycleIds = items
            .filter(item => !sorted.includes(item))
            .map(item => item.id);
        return { sorted, hasCycles: true, cycleIds };
    }

    return { sorted, hasCycles: false };
}

/**
 * @zh 使用 DFS 进行拓扑排序
 * @en Topological sort using DFS
 *
 * @zh DFS 算法特点：
 * - 实现简单
 * - 递归方式，栈溢出风险（极端情况）
 */
function dfsSort<T extends IDependable>(
    items: T[],
    resolveId: (id: string) => string
): TopologicalSortResult<T> {
    const itemMap = new Map<string, T>();
    for (const item of items) {
        itemMap.set(item.id, item);
    }

    const sorted: T[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>(); // 用于检测循环
    const cycleIds: string[] = [];

    const visit = (item: T): boolean => {
        if (visited.has(item.id)) return true;
        if (visiting.has(item.id)) {
            cycleIds.push(item.id);
            return false; // 发现循环
        }

        visiting.add(item.id);

        for (const dep of item.dependencies || []) {
            const depId = resolveId(dep);
            const depItem = itemMap.get(depId);
            if (depItem && !visit(depItem)) {
                cycleIds.push(item.id);
                return false;
            }
        }

        visiting.delete(item.id);
        visited.add(item.id);
        sorted.push(item);
        return true;
    };

    for (const item of items) {
        if (!visited.has(item.id)) {
            visit(item);
        }
    }

    return {
        sorted,
        hasCycles: cycleIds.length > 0,
        cycleIds: cycleIds.length > 0 ? [...new Set(cycleIds)] : undefined
    };
}

/**
 * @zh 拓扑排序（统一入口）
 * @en Topological sort (unified entry)
 *
 * @zh 按依赖关系对项目进行排序，确保被依赖的项目在前
 * @en Sort items by dependencies, ensuring dependencies come first
 *
 * @param items - @zh 待排序的项目列表 @en Items to sort
 * @param options - @zh 排序选项 @en Sort options
 * @returns @zh 排序结果 @en Sort result
 *
 * @example
 * ```typescript
 * const plugins = [
 *     { id: '@esengine/sprite', dependencies: ['engine-core'] },
 *     { id: '@esengine/engine-core', dependencies: [] },
 *     { id: '@esengine/tilemap', dependencies: ['sprite'] }
 * ];
 *
 * const result = topologicalSort(plugins);
 * // result.sorted: [engine-core, sprite, tilemap]
 * ```
 */
export function topologicalSort<T extends IDependable>(
    items: T[],
    options: TopologicalSortOptions = {}
): TopologicalSortResult<T> {
    const {
        algorithm = 'kahn',
        detectCycles = true,
        resolveId = resolveDependencyId
    } = options;

    if (items.length === 0) {
        return { sorted: [], hasCycles: false };
    }

    const result = algorithm === 'kahn'
        ? kahnSort(items, resolveId)
        : dfsSort(items, resolveId);

    if (result.hasCycles && detectCycles) {
        logger.warn(`Circular dependency detected among: ${result.cycleIds?.join(', ')}`);
    }

    return result;
}

// ============================================================================
// 依赖验证 | Dependency Validation
// ============================================================================

/**
 * @zh 验证依赖完整性
 * @en Validate dependency completeness
 *
 * @zh 检查所有启用的项目的依赖是否都已启用
 * @en Check if all dependencies of enabled items are also enabled
 *
 * @param items - @zh 所有项目 @en All items
 * @param enabledIds - @zh 已启用的项目 ID 集合 @en Set of enabled item IDs
 * @param options - @zh 选项 @en Options
 * @returns @zh 验证结果 @en Validation result
 */
export function validateDependencies<T extends IDependable>(
    items: T[],
    enabledIds: Set<string>,
    options: { resolveId?: (id: string) => string } = {}
): DependencyValidationResult {
    const { resolveId = resolveDependencyId } = options;
    const missingDependencies = new Map<string, string[]>();

    for (const item of items) {
        if (!enabledIds.has(item.id)) continue;

        const missing: string[] = [];
        for (const dep of item.dependencies || []) {
            const depId = resolveId(dep);
            if (!enabledIds.has(depId)) {
                missing.push(depId);
            }
        }

        if (missing.length > 0) {
            missingDependencies.set(item.id, missing);
        }
    }

    // 检查循环依赖
    const enabledItems = items.filter(item => enabledIds.has(item.id));
    const sortResult = topologicalSort(enabledItems, { resolveId });

    return {
        valid: missingDependencies.size === 0 && !sortResult.hasCycles,
        missingDependencies,
        circularDependencies: sortResult.cycleIds
    };
}

/**
 * @zh 获取项目的所有依赖（包括传递依赖）
 * @en Get all dependencies of an item (including transitive)
 *
 * @param itemId - @zh 项目 ID @en Item ID
 * @param items - @zh 所有项目 @en All items
 * @param options - @zh 选项 @en Options
 * @returns @zh 所有依赖 ID 的集合 @en Set of all dependency IDs
 */
export function getAllDependencies<T extends IDependable>(
    itemId: string,
    items: T[],
    options: { resolveId?: (id: string) => string } = {}
): Set<string> {
    const { resolveId = resolveDependencyId } = options;
    const itemMap = new Map<string, T>();
    for (const item of items) {
        itemMap.set(item.id, item);
    }

    const allDeps = new Set<string>();
    const visited = new Set<string>();

    const collect = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);

        const item = itemMap.get(id);
        if (!item) return;

        for (const dep of item.dependencies || []) {
            const depId = resolveId(dep);
            allDeps.add(depId);
            collect(depId);
        }
    };

    collect(itemId);
    return allDeps;
}

/**
 * @zh 获取依赖于指定项目的所有项目（反向依赖）
 * @en Get all items that depend on the specified item (reverse dependencies)
 *
 * @param itemId - @zh 项目 ID @en Item ID
 * @param items - @zh 所有项目 @en All items
 * @param options - @zh 选项 @en Options
 * @returns @zh 所有依赖此项目的 ID 集合 @en Set of IDs that depend on this item
 */
export function getReverseDependencies<T extends IDependable>(
    itemId: string,
    items: T[],
    options: { resolveId?: (id: string) => string } = {}
): Set<string> {
    const { resolveId = resolveDependencyId } = options;
    const reverseDeps = new Set<string>();

    for (const item of items) {
        for (const dep of item.dependencies || []) {
            const depId = resolveId(dep);
            if (depId === itemId) {
                reverseDeps.add(item.id);
                break;
            }
        }
    }

    return reverseDeps;
}

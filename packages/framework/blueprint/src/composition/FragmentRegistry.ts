/**
 * @zh 片段注册表
 * @en Fragment Registry
 *
 * @zh 管理和查询蓝图片段
 * @en Manages and queries blueprint fragments
 */

import type { IBlueprintFragment } from './BlueprintFragment';

// =============================================================================
// 片段注册表接口 | Fragment Registry Interface
// =============================================================================

/**
 * @zh 片段过滤器
 * @en Fragment filter
 */
export interface FragmentFilter {
    /**
     * @zh 按分类过滤
     * @en Filter by category
     */
    category?: string;

    /**
     * @zh 按标签过滤（任意匹配）
     * @en Filter by tags (any match)
     */
    tags?: string[];

    /**
     * @zh 按名称搜索
     * @en Search by name
     */
    search?: string;
}

/**
 * @zh 片段注册表接口
 * @en Fragment registry interface
 */
export interface IFragmentRegistry {
    /**
     * @zh 注册片段
     * @en Register fragment
     */
    register(fragment: IBlueprintFragment): void;

    /**
     * @zh 注销片段
     * @en Unregister fragment
     */
    unregister(id: string): void;

    /**
     * @zh 获取片段
     * @en Get fragment
     */
    get(id: string): IBlueprintFragment | undefined;

    /**
     * @zh 检查片段是否存在
     * @en Check if fragment exists
     */
    has(id: string): boolean;

    /**
     * @zh 获取所有片段
     * @en Get all fragments
     */
    getAll(): IBlueprintFragment[];

    /**
     * @zh 按条件过滤片段
     * @en Filter fragments by criteria
     */
    filter(filter: FragmentFilter): IBlueprintFragment[];

    /**
     * @zh 获取所有分类
     * @en Get all categories
     */
    getCategories(): string[];

    /**
     * @zh 获取所有标签
     * @en Get all tags
     */
    getTags(): string[];

    /**
     * @zh 清空注册表
     * @en Clear registry
     */
    clear(): void;
}

// =============================================================================
// 片段注册表实现 | Fragment Registry Implementation
// =============================================================================

/**
 * @zh 片段注册表实现
 * @en Fragment registry implementation
 */
export class FragmentRegistry implements IFragmentRegistry {
    private fragments: Map<string, IBlueprintFragment> = new Map();

    register(fragment: IBlueprintFragment): void {
        if (this.fragments.has(fragment.id)) {
            console.warn(`Fragment '${fragment.id}' already registered, overwriting`);
        }
        this.fragments.set(fragment.id, fragment);
    }

    unregister(id: string): void {
        this.fragments.delete(id);
    }

    get(id: string): IBlueprintFragment | undefined {
        return this.fragments.get(id);
    }

    has(id: string): boolean {
        return this.fragments.has(id);
    }

    getAll(): IBlueprintFragment[] {
        return Array.from(this.fragments.values());
    }

    filter(filter: FragmentFilter): IBlueprintFragment[] {
        let results = this.getAll();

        if (filter.category) {
            results = results.filter(f => f.category === filter.category);
        }

        if (filter.tags && filter.tags.length > 0) {
            results = results.filter(f =>
                f.tags && filter.tags!.some(t => f.tags!.includes(t))
            );
        }

        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            results = results.filter(f =>
                f.name.toLowerCase().includes(searchLower) ||
                f.description?.toLowerCase().includes(searchLower)
            );
        }

        return results;
    }

    getCategories(): string[] {
        const categories = new Set<string>();
        for (const fragment of this.fragments.values()) {
            if (fragment.category) {
                categories.add(fragment.category);
            }
        }
        return Array.from(categories).sort();
    }

    getTags(): string[] {
        const tags = new Set<string>();
        for (const fragment of this.fragments.values()) {
            if (fragment.tags) {
                for (const tag of fragment.tags) {
                    tags.add(tag);
                }
            }
        }
        return Array.from(tags).sort();
    }

    clear(): void {
        this.fragments.clear();
    }

    /**
     * @zh 获取片段数量
     * @en Get fragment count
     */
    get size(): number {
        return this.fragments.size;
    }
}

// =============================================================================
// 单例实例 | Singleton Instance
// =============================================================================

/**
 * @zh 默认片段注册表实例
 * @en Default fragment registry instance
 */
export const defaultFragmentRegistry = new FragmentRegistry();

/**
 * @zh 创建片段注册表
 * @en Create fragment registry
 */
export function createFragmentRegistry(): IFragmentRegistry {
    return new FragmentRegistry();
}

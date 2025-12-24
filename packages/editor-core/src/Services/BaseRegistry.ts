/**
 * @zh 通用注册表基类
 * @en Generic Registry Base Class
 *
 * @zh 提供注册表的通用实现，消除 16+ 个 Registry 类中的重复代码。
 * @en Provides common registry implementation, eliminating duplicate code in 16+ Registry classes.
 *
 * @example
 * ```typescript
 * interface IMyItem { id: string; name: string; }
 *
 * class MyRegistry extends BaseRegistry<IMyItem> {
 *     constructor() {
 *         super('MyRegistry');
 *     }
 *
 *     protected getItemId(item: IMyItem): string {
 *         return item.id;
 *     }
 * }
 * ```
 */

import { IService, createLogger, type ILogger } from '@esengine/ecs-framework';

/**
 * @zh 可注册项的基础接口
 * @en Base interface for registrable items
 */
export interface IRegistrable {
    /** @zh 唯一标识符 @en Unique identifier */
    readonly id?: string;
}

/**
 * @zh 带优先级的可注册项
 * @en Registrable item with priority
 */
export interface IPrioritized {
    /** @zh 优先级（越高越先匹配） @en Priority (higher = matched first) */
    readonly priority?: number;
}

/**
 * @zh 注册表配置
 * @en Registry configuration
 */
export interface RegistryOptions {
    /** @zh 是否允许覆盖已存在的项 @en Allow overwriting existing items */
    allowOverwrite?: boolean;
    /** @zh 是否在覆盖时发出警告 @en Warn when overwriting */
    warnOnOverwrite?: boolean;
}

/**
 * @zh 通用注册表基类
 * @en Generic Registry Base Class
 *
 * @typeParam T - @zh 注册项类型 @en Registered item type
 * @typeParam K - @zh 键类型（默认 string） @en Key type (default string)
 */
export abstract class BaseRegistry<T, K extends string = string> implements IService {
    protected readonly _items: Map<K, T> = new Map();
    protected readonly _logger: ILogger;
    protected readonly _options: Required<RegistryOptions>;

    constructor(
        protected readonly _name: string,
        options: RegistryOptions = {}
    ) {
        this._logger = createLogger(_name);
        this._options = {
            allowOverwrite: options.allowOverwrite ?? true,
            warnOnOverwrite: options.warnOnOverwrite ?? true
        };
    }

    /**
     * @zh 获取项的键
     * @en Get item key
     */
    protected abstract getItemKey(item: T): K;

    /**
     * @zh 获取项的显示名称（用于日志）
     * @en Get item display name (for logging)
     */
    protected getItemDisplayName(item: T): string {
        const key = this.getItemKey(item);
        return String(key);
    }

    // ========== 核心 CRUD 操作 | Core CRUD Operations ==========

    /**
     * @zh 注册项
     * @en Register item
     */
    register(item: T): boolean {
        const key = this.getItemKey(item);
        const displayName = this.getItemDisplayName(item);

        if (this._items.has(key)) {
            if (this._options.warnOnOverwrite) {
                this._logger.warn(`Overwriting: ${displayName}`);
            }
            if (!this._options.allowOverwrite) {
                return false;
            }
        }

        this._items.set(key, item);
        this._logger.debug(`Registered: ${displayName}`);
        return true;
    }

    /**
     * @zh 批量注册
     * @en Register multiple items
     */
    registerMany(items: T[]): number {
        let count = 0;
        for (const item of items) {
            if (this.register(item)) count++;
        }
        return count;
    }

    /**
     * @zh 注销项
     * @en Unregister item
     */
    unregister(key: K): boolean {
        if (this._items.delete(key)) {
            this._logger.debug(`Unregistered: ${key}`);
            return true;
        }
        return false;
    }

    /**
     * @zh 获取项
     * @en Get item
     */
    get(key: K): T | undefined {
        return this._items.get(key);
    }

    /**
     * @zh 检查是否存在
     * @en Check if exists
     */
    has(key: K): boolean {
        return this._items.has(key);
    }

    // ========== 查询操作 | Query Operations ==========

    /**
     * @zh 获取所有项
     * @en Get all items
     */
    getAll(): T[] {
        return Array.from(this._items.values());
    }

    /**
     * @zh 获取所有键
     * @en Get all keys
     */
    getAllKeys(): K[] {
        return Array.from(this._items.keys());
    }

    /**
     * @zh 获取项数量
     * @en Get item count
     */
    get size(): number {
        return this._items.size;
    }

    /**
     * @zh 是否为空
     * @en Is empty
     */
    get isEmpty(): boolean {
        return this._items.size === 0;
    }

    /**
     * @zh 按条件过滤
     * @en Filter by predicate
     */
    filter(predicate: (item: T, key: K) => boolean): T[] {
        const result: T[] = [];
        for (const [key, item] of this._items) {
            if (predicate(item, key)) {
                result.push(item);
            }
        }
        return result;
    }

    /**
     * @zh 查找第一个匹配项
     * @en Find first matching item
     */
    find(predicate: (item: T, key: K) => boolean): T | undefined {
        for (const [key, item] of this._items) {
            if (predicate(item, key)) {
                return item;
            }
        }
        return undefined;
    }

    // ========== 生命周期 | Lifecycle ==========

    /**
     * @zh 清空注册表
     * @en Clear registry
     */
    clear(): void {
        this._items.clear();
        this._logger.debug('Cleared');
    }

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void {
        this.clear();
        this._logger.debug('Disposed');
    }
}

/**
 * @zh 带优先级查找的注册表基类
 * @en Registry base class with priority-based lookup
 *
 * @zh 适用于需要按优先级匹配的场景（如 Inspector、FieldEditor）
 * @en For scenarios requiring priority-based matching (e.g., Inspector, FieldEditor)
 */
export abstract class PrioritizedRegistry<T extends IPrioritized, K extends string = string>
    extends BaseRegistry<T, K> {

    /**
     * @zh 按优先级排序获取所有项
     * @en Get all items sorted by priority
     */
    getAllSorted(): T[] {
        return this.getAll().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    /**
     * @zh 查找第一个能处理目标的项
     * @en Find first item that can handle the target
     *
     * @param canHandle - @zh 判断函数 @en Predicate function
     */
    findByPriority(canHandle: (item: T) => boolean): T | undefined {
        for (const item of this.getAllSorted()) {
            if (canHandle(item)) {
                return item;
            }
        }
        return undefined;
    }
}

/**
 * @zh 创建注册表服务标识符
 * @en Create registry service identifier
 *
 * @zh 使用 Symbol.for 确保跨包共享同一个 Symbol
 * @en Uses Symbol.for to ensure same Symbol is shared across packages
 */
export function createRegistryToken<T>(name: string): symbol {
    return Symbol.for(`IRegistry:${name}`);
}

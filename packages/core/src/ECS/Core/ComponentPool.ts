import { Component } from '../Component';

/**
 * 组件对象池，用于复用组件实例以减少内存分配
 */
export class ComponentPool<T extends Component> {
    private pool: T[] = [];
    private createFn: () => T;
    private resetFn?: (component: T) => void;
    private maxSize: number;
    private minSize: number;

    private stats = {
        totalCreated: 0,
        totalAcquired: 0,
        totalReleased: 0
    };

    constructor(
        createFn: () => T,
        resetFn?: (component: T) => void,
        maxSize: number = 1000,
        minSize: number = 10
    ) {
        this.createFn = createFn;
        if (resetFn) {
            this.resetFn = resetFn;
        }
        this.maxSize = maxSize;
        this.minSize = Math.max(1, minSize);
    }

    /**
     * 获取一个组件实例
     */
    acquire(): T {
        this.stats.totalAcquired++;

        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }

        this.stats.totalCreated++;

        return this.createFn();
    }

    /**
     * 释放一个组件实例回池中
     */
    release(component: T): void {
        this.stats.totalReleased++;

        if (this.pool.length >= this.maxSize) {
            return;
        }

        if (this.resetFn) {
            this.resetFn(component);
        }

        this.pool.push(component);
    }

    /**
     * 预填充对象池
     */
    prewarm(count: number): void {
        const targetCount = Math.min(count, this.maxSize);

        for (let i = this.pool.length; i < targetCount; i++) {
            const component = this.createFn();
            if (this.resetFn) {
                this.resetFn(component);
            }
            this.pool.push(component);
            this.stats.totalCreated++;
        }
    }

    /**
     * 自动收缩池大小
     */
    shrink(): void {
        while (this.pool.length > this.minSize) {
            this.pool.pop();
        }
    }

    /**
     * 清空对象池
     */
    clear(): void {
        this.pool.length = 0;
    }

    /**
     * 获取池中可用对象数量
     */
    getAvailableCount(): number {
        return this.pool.length;
    }

    /**
     * 获取池的最大容量
     */
    getMaxSize(): number {
        return this.maxSize;
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const hitRate = this.stats.totalAcquired === 0
            ? 0
            : (this.stats.totalAcquired - this.stats.totalCreated) / this.stats.totalAcquired;

        return {
            totalCreated: this.stats.totalCreated,
            totalAcquired: this.stats.totalAcquired,
            totalReleased: this.stats.totalReleased,
            hitRate: hitRate,
            currentSize: this.pool.length,
            maxSize: this.maxSize,
            minSize: this.minSize,
            utilizationRate: this.pool.length / this.maxSize
        };
    }
}

/**
 * 组件使用追踪
 */
interface ComponentUsageTracker {
    createCount: number;
    releaseCount: number;
    lastAccessTime: number;
}

/**
 * 全局组件池管理器
 */
export class ComponentPoolManager {
    private static _instance: ComponentPoolManager;
    private _pools = new Map<string, ComponentPool<Component>>();
    private _usageTracker = new Map<string, ComponentUsageTracker>();

    private _autoCleanupInterval = 60000;
    private _lastCleanupTime = 0;

    private constructor() {}

    static getInstance(): ComponentPoolManager {
        if (!ComponentPoolManager._instance) {
            ComponentPoolManager._instance = new ComponentPoolManager();
        }
        return ComponentPoolManager._instance;
    }

    /**
     * @zh 注册组件池
     * @en Register component pool
     */
    registerPool<T extends Component>(
        componentName: string,
        createFn: () => T,
        resetFn?: (component: T) => void,
        maxSize?: number,
        minSize?: number
    ): void {
        this._pools.set(componentName, new ComponentPool(createFn, resetFn, maxSize, minSize) as unknown as ComponentPool<Component>);

        this._usageTracker.set(componentName, {
            createCount: 0,
            releaseCount: 0,
            lastAccessTime: Date.now()
        });
    }

    /**
     * @zh 获取组件实例
     * @en Acquire component instance
     */
    acquireComponent<T extends Component>(componentName: string): T | null {
        const pool = this._pools.get(componentName);

        this._trackUsage(componentName, 'create');

        return pool ? (pool.acquire() as T) : null;
    }

    /**
     * @zh 释放组件实例
     * @en Release component instance
     */
    releaseComponent<T extends Component>(componentName: string, component: T): void {
        const pool = this._pools.get(componentName);

        this._trackUsage(componentName, 'release');

        if (pool) {
            pool.release(component);
        }
    }

    /**
     * @zh 追踪使用情况
     * @en Track usage
     */
    private _trackUsage(componentName: string, action: 'create' | 'release'): void {
        let tracker = this._usageTracker.get(componentName);

        if (!tracker) {
            tracker = {
                createCount: 0,
                releaseCount: 0,
                lastAccessTime: Date.now()
            };
            this._usageTracker.set(componentName, tracker);
        }

        if (action === 'create') {
            tracker.createCount++;
        } else {
            tracker.releaseCount++;
        }

        tracker.lastAccessTime = Date.now();
    }

    /**
     * @zh 自动清理(定期调用)
     * @en Auto cleanup (called periodically)
     */
    public update(): void {
        const now = Date.now();

        if (now - this._lastCleanupTime < this._autoCleanupInterval) {
            return;
        }

        for (const [name, tracker] of this._usageTracker.entries()) {
            const inactive = now - tracker.lastAccessTime > 120000;

            if (inactive) {
                const pool = this._pools.get(name);
                if (pool) {
                    pool.shrink();
                }
            }
        }

        this._lastCleanupTime = now;
    }

    /**
     * @zh 获取热点组件列表
     * @en Get hot components list
     */
    public getHotComponents(threshold: number = 100): string[] {
        return Array.from(this._usageTracker.entries())
            .filter(([_, tracker]) => tracker.createCount > threshold)
            .map(([name]) => name);
    }

    /**
     * @zh 预热所有池
     * @en Prewarm all pools
     */
    prewarmAll(count: number = 100): void {
        for (const pool of this._pools.values()) {
            pool.prewarm(count);
        }
    }

    /**
     * @zh 清空所有池
     * @en Clear all pools
     */
    clearAll(): void {
        for (const pool of this._pools.values()) {
            pool.clear();
        }
    }

    /**
     * @zh 重置管理器
     * @en Reset manager
     */
    reset(): void {
        this._pools.clear();
        this._usageTracker.clear();
    }

    /**
     * @zh 获取全局统计信息
     * @en Get global stats
     */
    getGlobalStats(): Array<{
        componentName: string;
        poolStats: ReturnType<ComponentPool<Component>['getStats']>;
        usage: ComponentUsageTracker | undefined;
    }> {
        const stats: Array<{
            componentName: string;
            poolStats: ReturnType<ComponentPool<Component>['getStats']>;
            usage: ComponentUsageTracker | undefined;
        }> = [];

        for (const [name, pool] of this._pools.entries()) {
            stats.push({
                componentName: name,
                poolStats: pool.getStats(),
                usage: this._usageTracker.get(name)
            });
        }

        return stats;
    }

    /**
     * @zh 获取池统计信息
     * @en Get pool stats
     */
    getPoolStats(): Map<string, { available: number; maxSize: number }> {
        const stats = new Map();
        for (const [name, pool] of this._pools) {
            stats.set(name, {
                available: pool.getAvailableCount(),
                maxSize: pool.getMaxSize()
            });
        }
        return stats;
    }

    /**
     * @zh 获取池利用率信息
     * @en Get pool utilization info
     */
    getPoolUtilization(): Map<string, { used: number; total: number; utilization: number }> {
        const utilization = new Map();
        for (const [name, pool] of this._pools) {
            const available = pool.getAvailableCount();
            const maxSize = pool.getMaxSize();
            const used = maxSize - available;
            const utilRate = maxSize > 0 ? (used / maxSize * 100) : 0;

            utilization.set(name, {
                used: used,
                total: maxSize,
                utilization: utilRate
            });
        }
        return utilization;
    }

    /**
     * @zh 获取指定组件的池利用率
     * @en Get component pool utilization
     */
    getComponentUtilization(componentName: string): number {
        const pool = this._pools.get(componentName);
        if (!pool) return 0;

        const available = pool.getAvailableCount();
        const maxSize = pool.getMaxSize();
        const used = maxSize - available;

        return maxSize > 0 ? (used / maxSize * 100) : 0;
    }
}

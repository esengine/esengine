import type { GObject } from './GObject';
import { UIPackage } from '../package/UIPackage';

/**
 * GObjectPool
 *
 * Object pool for GObject instances, used for efficient UI recycling.
 * Objects are pooled by their resource URL.
 *
 * GObject 实例对象池，用于高效的 UI 回收。对象按资源 URL 分池管理。
 */
export class GObjectPool {
    private _pool: Map<string, GObject[]> = new Map();
    private _count: number = 0;

    /**
     * Get total pooled object count
     * 获取池中对象总数
     */
    public get count(): number {
        return this._count;
    }

    /**
     * Clear all pooled objects
     * 清空所有池化对象
     */
    public clear(): void {
        for (const [, arr] of this._pool) {
            for (const obj of arr) {
                obj.dispose();
            }
        }
        this._pool.clear();
        this._count = 0;
    }

    /**
     * Get object from pool or create new one
     * 从池中获取对象或创建新对象
     *
     * @param url Resource URL | 资源 URL
     * @returns GObject instance or null | GObject 实例或 null
     */
    public getObject(url: string): GObject | null {
        url = UIPackage.normalizeURL(url);
        if (!url) return null;

        const arr = this._pool.get(url);
        if (arr && arr.length > 0) {
            this._count--;
            return arr.shift()!;
        }

        return UIPackage.createObjectFromURL(url);
    }

    /**
     * Return object to pool
     * 将对象归还到池中
     *
     * @param obj GObject to return | 要归还的 GObject
     */
    public returnObject(obj: GObject): void {
        const url = obj.resourceURL;
        if (!url) return;

        let arr = this._pool.get(url);
        if (!arr) {
            arr = [];
            this._pool.set(url, arr);
        }

        this._count++;
        arr.push(obj);
    }
}

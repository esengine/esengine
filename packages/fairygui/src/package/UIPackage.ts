import { PackageItem } from './PackageItem';
import { EPackageItemType } from '../core/FieldTypes';

/**
 * UIPackage
 *
 * Represents a FairyGUI package (.fui file).
 * Manages loading and accessing package resources.
 *
 * 表示 FairyGUI 包（.fui 文件），管理包资源的加载和访问
 */
export class UIPackage {
    /** Package ID | 包 ID */
    public id: string = '';

    /** Package name | 包名称 */
    public name: string = '';

    /** Package URL | 包 URL */
    public url: string = '';

    private _items: PackageItem[] = [];
    private _itemsById: Map<string, PackageItem> = new Map();
    private _itemsByName: Map<string, PackageItem> = new Map();

    private static _packages: Map<string, UIPackage> = new Map();
    private static _packagesByUrl: Map<string, UIPackage> = new Map();
    private static _branch: string = '';
    private static _vars: Map<string, string> = new Map();

    /**
     * Get branch name
     * 获取分支名称
     */
    public static get branch(): string {
        return UIPackage._branch;
    }

    /**
     * Set branch name
     * 设置分支名称
     */
    public static set branch(value: string) {
        UIPackage._branch = value;
    }

    /**
     * Get variable
     * 获取变量
     */
    public static getVar(key: string): string | undefined {
        return UIPackage._vars.get(key);
    }

    /**
     * Set variable
     * 设置变量
     */
    public static setVar(key: string, value: string): void {
        UIPackage._vars.set(key, value);
    }

    /**
     * Get package by ID
     * 通过 ID 获取包
     */
    public static getById(id: string): UIPackage | null {
        return UIPackage._packages.get(id) || null;
    }

    /**
     * Get package by name
     * 通过名称获取包
     */
    public static getByName(name: string): UIPackage | null {
        for (const pkg of UIPackage._packages.values()) {
            if (pkg.name === name) {
                return pkg;
            }
        }
        return null;
    }

    /**
     * Add a loaded package
     * 添加已加载的包
     */
    public static addPackage(pkg: UIPackage): void {
        UIPackage._packages.set(pkg.id, pkg);
        if (pkg.url) {
            UIPackage._packagesByUrl.set(pkg.url, pkg);
        }
    }

    /**
     * Remove a package
     * 移除包
     */
    public static removePackage(idOrName: string): void {
        let pkg: UIPackage | null | undefined = UIPackage._packages.get(idOrName);
        if (!pkg) {
            pkg = UIPackage.getByName(idOrName);
        }
        if (pkg) {
            UIPackage._packages.delete(pkg.id);
            if (pkg.url) {
                UIPackage._packagesByUrl.delete(pkg.url);
            }
            pkg.dispose();
        }
    }

    /**
     * Create object from URL
     * 从 URL 创建对象
     */
    public static createObject(pkgName: string, resName: string): any {
        const pkg = UIPackage.getByName(pkgName);
        if (pkg) {
            return pkg.createObject(resName);
        }
        return null;
    }

    /**
     * Create object from URL string
     * 从 URL 字符串创建对象
     */
    public static createObjectFromURL(url: string): any {
        const pi = UIPackage.getItemByURL(url);
        if (pi) {
            return pi.owner?.internalCreateObject(pi);
        }
        return null;
    }

    /**
     * Get item by URL
     * 通过 URL 获取项
     */
    public static getItemByURL(url: string): PackageItem | null {
        if (!url) return null;

        // URL format: ui://pkgName/resName or ui://pkgId/resId
        const pos = url.indexOf('//');
        if (pos === -1) return null;

        const pos2 = url.indexOf('/', pos + 2);
        if (pos2 === -1) {
            if (url.length > 13) {
                const pkgId = url.substring(5, 13);
                const pkg = UIPackage.getById(pkgId);
                if (pkg) {
                    const srcId = url.substring(13);
                    return pkg.getItemById(srcId);
                }
            }
        } else {
            const pkgName = url.substring(pos + 2, pos2);
            const pkg = UIPackage.getByName(pkgName);
            if (pkg) {
                const resName = url.substring(pos2 + 1);
                return pkg.getItemByName(resName);
            }
        }

        return null;
    }

    /**
     * Get item asset
     * 获取项资源
     */
    public static getItemAsset(url: string): any {
        const pi = UIPackage.getItemByURL(url);
        if (pi) {
            return pi.owner?.getItemAsset(pi);
        }
        return null;
    }

    /**
     * Normalize URL
     * 标准化 URL
     */
    public static normalizeURL(url: string): string {
        if (!url) return '';
        if (url.startsWith('ui://')) return url;
        return 'ui://' + url;
    }

    // Instance methods | 实例方法

    /**
     * Get item by ID
     * 通过 ID 获取项
     */
    public getItemById(id: string): PackageItem | null {
        return this._itemsById.get(id) || null;
    }

    /**
     * Get item by name
     * 通过名称获取项
     */
    public getItemByName(name: string): PackageItem | null {
        return this._itemsByName.get(name) || null;
    }

    /**
     * Get item asset
     * 获取项资源
     */
    public getItemAsset(item: PackageItem): any {
        switch (item.type) {
            case EPackageItemType.Image:
                return item.texture;
            case EPackageItemType.MovieClip:
                return item.frames;
            case EPackageItemType.Font:
                return item.bitmapFont;
            default:
                return null;
        }
    }

    /**
     * Create object from item name
     * 从项名称创建对象
     */
    public createObject(resName: string): any {
        const pi = this.getItemByName(resName);
        if (pi) {
            return this.internalCreateObject(pi);
        }
        return null;
    }

    /**
     * Internal create object
     * 内部创建对象
     */
    public internalCreateObject(item: PackageItem): any {
        // Implementation would use UIObjectFactory
        return null;
    }

    /**
     * Add item
     * 添加项
     */
    public addItem(item: PackageItem): void {
        item.owner = this;
        this._items.push(item);
        this._itemsById.set(item.id, item);
        this._itemsByName.set(item.name, item);
    }

    /**
     * Get all items
     * 获取所有项
     */
    public get items(): readonly PackageItem[] {
        return this._items;
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        for (const item of this._items) {
            item.owner = null;
        }
        this._items.length = 0;
        this._itemsById.clear();
        this._itemsByName.clear();
    }
}

import { GObject } from './GObject';
import { EObjectType } from './FieldTypes';
import type { PackageItem } from '../package/PackageItem';

/**
 * Object creator function type
 * 对象创建函数类型
 */
export type ObjectCreator = () => GObject;

/**
 * Extension creator function type
 * 扩展创建函数类型
 */
export type ExtensionCreator = () => GObject;

/**
 * UIObjectFactory
 *
 * Factory for creating FairyGUI objects.
 * All object types are registered via registerCreator() to avoid circular dependencies.
 *
 * FairyGUI 对象工厂，所有对象类型通过 registerCreator() 注册以避免循环依赖
 */
export class UIObjectFactory {
    private static _creators: Map<EObjectType, ObjectCreator> = new Map();
    private static _extensions: Map<string, ExtensionCreator> = new Map();

    /**
     * Register a creator for an object type
     * 注册对象类型创建器
     */
    public static registerCreator(type: EObjectType, creator: ObjectCreator): void {
        UIObjectFactory._creators.set(type, creator);
    }

    /**
     * Register an extension creator for a URL
     * 注册扩展创建器
     */
    public static registerExtension(url: string, creator: ExtensionCreator): void {
        UIObjectFactory._extensions.set(url, creator);
    }

    /**
     * Check if extension exists for URL
     * 检查 URL 是否有扩展
     */
    public static hasExtension(url: string): boolean {
        return UIObjectFactory._extensions.has(url);
    }

    /**
     * Create object by type
     * 根据类型创建对象
     */
    public static createObject(type: EObjectType, _userClass?: new () => GObject): GObject | null {
        const creator = UIObjectFactory._creators.get(type);
        if (creator) {
            const obj = creator();
            return obj;
        }

        // Fallback for component-based types
        switch (type) {
            case EObjectType.Component:
            case EObjectType.Label:
            case EObjectType.ComboBox:
            case EObjectType.List:
            case EObjectType.Tree:
            case EObjectType.ScrollBar:
            case EObjectType.MovieClip:
            case EObjectType.Swf:
            case EObjectType.Loader:
            case EObjectType.Loader3D:
                // Use Component creator if specific creator not registered
                const componentCreator = UIObjectFactory._creators.get(EObjectType.Component);
                if (componentCreator) {
                    const obj = componentCreator();
                    return obj;
                }
                break;
        }

        return new GObject();
    }

    /**
     * Create new object by type (number)
     * 根据类型号创建新对象
     */
    public static newObject(type: number): GObject;
    /**
     * Create new object from package item
     * 从包资源项创建新对象
     */
    public static newObject(item: PackageItem): GObject;
    public static newObject(arg: number | PackageItem): GObject {
        if (typeof arg === 'number') {
            const obj = UIObjectFactory.createObject(arg as EObjectType) || new GObject();
            return obj;
        } else {
            const item = arg as PackageItem;

            // Check for extension
            if (item.owner) {
                const url = 'ui://' + item.owner.id + item.id;
                const extensionCreator = UIObjectFactory._extensions.get(url);
                if (extensionCreator) {
                    const obj = extensionCreator();
                    obj.packageItem = item;
                    return obj;
                }

                // Also check by name
                const urlByName = 'ui://' + item.owner.name + '/' + item.name;
                const extensionCreatorByName = UIObjectFactory._extensions.get(urlByName);
                if (extensionCreatorByName) {
                    const obj = extensionCreatorByName();
                    obj.packageItem = item;
                    return obj;
                }
            }

            const obj = UIObjectFactory.createObject(item.objectType);
            if (obj) {
                obj.packageItem = item;
            }
            return obj || new GObject();
        }
    }

    /**
     * Create object from package item
     * 从包资源项创建对象
     */
    public static createObjectFromItem(item: PackageItem): GObject | null {
        const obj = UIObjectFactory.createObject(item.objectType);
        if (obj) {
            obj.packageItem = item;
            obj.constructFromResource();
        }
        return obj;
    }

    /**
     * Create object from URL with extension support
     * 从 URL 创建对象（支持扩展）
     */
    public static createObjectFromURL(url: string): GObject | null {
        const extensionCreator = UIObjectFactory._extensions.get(url);
        if (extensionCreator) {
            return extensionCreator();
        }
        return null;
    }

    /**
     * Resolve package item extension
     * 解析包项扩展
     */
    public static resolvePackageItemExtension(item: PackageItem): void {
        if (!item.owner) return;

        const url = 'ui://' + item.owner.id + item.id;
        if (UIObjectFactory._extensions.has(url)) {
            return;
        }

        const urlByName = 'ui://' + item.owner.name + '/' + item.name;
        if (UIObjectFactory._extensions.has(urlByName)) {
            return;
        }
    }

    /**
     * Clear all registered creators and extensions
     * 清除所有注册的创建器和扩展
     */
    public static clear(): void {
        UIObjectFactory._creators.clear();
        UIObjectFactory._extensions.clear();
    }
}

import { GObject } from './GObject';
import { GComponent } from './GComponent';
import { GImage } from '../widgets/GImage';
import { GGraph } from '../widgets/GGraph';
import { GTextField } from '../widgets/GTextField';
import { GButton } from '../widgets/GButton';
import { GProgressBar } from '../widgets/GProgressBar';
import { GSlider } from '../widgets/GSlider';
import { GGroup } from './GGroup';
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
export type ExtensionCreator = () => GComponent;

/**
 * UIObjectFactory
 *
 * Factory for creating FairyGUI objects.
 * Supports custom object type registration and extension creation.
 *
 * FairyGUI 对象工厂，支持自定义对象类型注册和扩展创建
 */
export class UIObjectFactory {
    private static _creators: Map<EObjectType, ObjectCreator> = new Map();
    private static _extensions: Map<string, ExtensionCreator> = new Map();

    /**
     * Register a custom creator for an object type
     * 注册自定义对象类型创建器
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
        const customCreator = UIObjectFactory._creators.get(type);
        if (customCreator) {
            return customCreator();
        }

        switch (type) {
            case EObjectType.Image:
                return new GImage();
            case EObjectType.Graph:
                return new GGraph();
            case EObjectType.Text:
            case EObjectType.RichText:
            case EObjectType.InputText:
                return new GTextField();
            case EObjectType.Group:
                return new GGroup();
            case EObjectType.Component:
                return new GComponent();
            case EObjectType.Button:
                return new GButton();
            case EObjectType.ProgressBar:
                return new GProgressBar();
            case EObjectType.Slider:
                return new GSlider();
            case EObjectType.Label:
            case EObjectType.ComboBox:
            case EObjectType.List:
            case EObjectType.Tree:
            case EObjectType.ScrollBar:
                return new GComponent();
            case EObjectType.MovieClip:
            case EObjectType.Swf:
            case EObjectType.Loader:
            case EObjectType.Loader3D:
                // Not implemented yet
                return new GComponent();
            default:
                return null;
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
     * Clear all registered creators and extensions
     * 清除所有注册的创建器和扩展
     */
    public static clear(): void {
        UIObjectFactory._creators.clear();
        UIObjectFactory._extensions.clear();
    }
}

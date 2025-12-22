/**
 * FGUIComponent
 *
 * ECS component for FairyGUI integration.
 * Manages a FairyGUI package and displays a component from it.
 *
 * FairyGUI 的 ECS 组件，管理 FairyGUI 包并显示其中的组件
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import { GRoot } from '../core/GRoot';
import { GComponent } from '../core/GComponent';
import { UIPackage } from '../package/UIPackage';
import type { GObject } from '../core/GObject';

/**
 * FGUI Component interface for ECS
 * ECS 的 FGUI 组件接口
 */
export interface IFGUIComponentData {
    /** FUI package asset GUID | FUI 包资产 GUID */
    packageGuid: string;
    /** Component name to display | 要显示的组件名称 */
    componentName: string;
    /** Width override (0 = use component default) | 宽度覆盖 (0 = 使用组件默认值) */
    width: number;
    /** Height override (0 = use component default) | 高度覆盖 (0 = 使用组件默认值) */
    height: number;
    /** X position | X 位置 */
    x: number;
    /** Y position | Y 位置 */
    y: number;
    /** Visibility | 可见性 */
    visible: boolean;
    /** Alpha (0-1) | 透明度 */
    alpha: number;
    /** Sorting order | 排序顺序 */
    sortingOrder: number;
}

/**
 * FGUIComponent
 *
 * ECS component that wraps a FairyGUI component.
 * Allows loading FUI packages and displaying components from them.
 *
 * 封装 FairyGUI 组件的 ECS 组件，支持加载 FUI 包并显示其中的组件
 */
@ECSComponent('FGUIComponent')
@Serializable({ version: 1, typeId: 'FGUIComponent' })
export class FGUIComponent extends Component implements IFGUIComponentData {
    // ============= Serialized Properties | 序列化属性 =============

    /**
     * FUI package asset GUID
     * FUI 包资产 GUID
     */
    @Serialize()
    @Property({ type: 'asset', label: 'Package', extensions: ['.fui'] })
    public packageGuid: string = '';

    /**
     * Component name to display from the package
     * 要从包中显示的组件名称
     */
    @Serialize()
    @Property({ type: 'string', label: 'Component' })
    public componentName: string = '';

    /**
     * Width override (0 = use component default)
     * 宽度覆盖 (0 = 使用组件默认值)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Width', min: 0 })
    public width: number = 0;

    /**
     * Height override (0 = use component default)
     * 高度覆盖 (0 = 使用组件默认值)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Height', min: 0 })
    public height: number = 0;

    /**
     * X position
     * X 位置
     */
    @Serialize()
    @Property({ type: 'number', label: 'X' })
    public x: number = 0;

    /**
     * Y position
     * Y 位置
     */
    @Serialize()
    @Property({ type: 'number', label: 'Y' })
    public y: number = 0;

    /**
     * Whether the component is visible
     * 组件是否可见
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Visible' })
    public visible: boolean = true;

    /**
     * Alpha (0-1)
     * 透明度 (0-1)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Alpha', min: 0, max: 1, step: 0.01 })
    public alpha: number = 1;

    /**
     * Sorting order for render priority
     * 渲染优先级排序
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Sorting Order' })
    public sortingOrder: number = 0;

    // ============= Runtime State (not serialized) | 运行时状态（不序列化）=============

    /** Loaded UIPackage | 已加载的 UIPackage */
    private _package: UIPackage | null = null;

    /** Created GRoot instance | 创建的 GRoot 实例 */
    private _root: GRoot | null = null;

    /** Created component instance | 创建的组件实例 */
    private _component: GObject | null = null;

    /** Loading state | 加载状态 */
    private _loading: boolean = false;

    /** Error message if loading failed | 加载失败时的错误信息 */
    private _error: string | null = null;

    /**
     * Version counter, incremented on every state change (load, component change)
     * Used by Inspector to detect when to refresh UI
     * 版本计数器，每次状态变化（加载、组件切换）时递增，用于 Inspector 检测何时刷新 UI
     */
    private _version: number = 0;

    /**
     * Optional callback for state changes (used by editor for virtual node updates)
     * 可选的状态变化回调（编辑器用于虚拟节点更新）
     */
    private _onStateChange: ((type: 'loaded' | 'updated' | 'disposed') => void) | null = null;

    // ============= Getters | 访问器 =============

    /**
     * Get the GRoot instance
     * 获取 GRoot 实例
     */
    public get root(): GRoot | null {
        return this._root;
    }

    /**
     * Get the loaded UIPackage
     * 获取已加载的 UIPackage
     */
    public get package(): UIPackage | null {
        return this._package;
    }

    /**
     * Get the created component
     * 获取已创建的组件
     */
    public get component(): GObject | null {
        return this._component;
    }

    /**
     * Check if currently loading
     * 检查是否正在加载
     */
    public get isLoading(): boolean {
        return this._loading;
    }

    /**
     * Get error message
     * 获取错误信息
     */
    public get error(): string | null {
        return this._error;
    }

    /**
     * Check if component is ready
     * 检查组件是否已准备好
     */
    public get isReady(): boolean {
        return this._root !== null && this._component !== null;
    }

    /**
     * Get version counter for change detection
     * Used by Inspector to detect when to refresh UI
     * 获取版本计数器用于变化检测，用于 Inspector 检测何时刷新 UI
     */
    public get version(): number {
        return this._version;
    }

    /**
     * Set state change callback for editor integration
     * 设置状态变化回调用于编辑器集成
     *
     * @param callback Called when component state changes ('loaded', 'updated', 'disposed')
     */
    public set onStateChange(callback: ((type: 'loaded' | 'updated' | 'disposed') => void) | null) {
        this._onStateChange = callback;
    }

    /**
     * Get available component names from the loaded package
     * 获取已加载包中可用的组件名称
     */
    public getAvailableComponentNames(): string[] {
        if (!this._package) return [];
        return this._package.getExportedComponentNames();
    }

    /**
     * Get all component names (including non-exported) from the loaded package
     * 获取已加载包中所有组件名称（包括未导出的）
     */
    public getAllComponentNames(): string[] {
        if (!this._package) return [];
        return this._package.getAllComponentNames();
    }

    // ============= Methods | 方法 =============

    /**
     * Initialize the FGUI root
     * 初始化 FGUI 根节点
     */
    public initRoot(width: number, height: number): void {
        if (this._root) {
            this._root.dispose();
        }
        this._root = new GRoot();
        this._root.setSize(width, height);
    }

    /**
     * Load package from binary data
     * 从二进制数据加载包
     */
    public loadPackage(resKey: string, data: ArrayBuffer): UIPackage {
        this._loading = true;
        this._error = null;

        try {
            this._package = UIPackage.addPackageFromBuffer(resKey, data);
            this._loading = false;
            return this._package;
        } catch (e) {
            this._loading = false;
            this._error = e instanceof Error ? e.message : String(e);
            throw e;
        }
    }

    /**
     * Set a pre-loaded package (from FUIAssetLoader)
     * 设置预加载的包（来自 FUIAssetLoader）
     */
    public setLoadedPackage(pkg: UIPackage): void {
        this._package = pkg;
        this._loading = false;
        this._error = null;
        this._version++;
        this._onStateChange?.('loaded');
    }

    /**
     * Create component from loaded package
     * 从已加载的包创建组件
     *
     * Note: Disposes existing component before creating new one to avoid visual overlap
     * 注意：创建新组件前会先销毁已有组件，避免视觉叠加
     */
    public createComponent(componentName?: string): GObject | null {
        const name = componentName || this.componentName;
        if (!this._package) {
            return null;
        }
        if (!name) {
            return null;
        }

        // Dispose existing component before creating new one
        // 创建新组件前先销毁已有组件
        if (this._component) {
            if (this._root) {
                this._root.removeChild(this._component);
            }
            this._component.dispose();
            this._component = null;
        }

        try {
            this._component = this._package.createObject(name);

            if (this._component && this._root) {
                this.syncProperties();
                this._root.addChild(this._component);
            }

            this._version++;
            this._onStateChange?.('updated');
            return this._component;
        } catch (e) {
            // Log full error with stack trace for debugging
            console.error(`[FGUIComponent] Error creating component "${name}":`, e);
            this._error = e instanceof Error ? e.message : String(e);
            return null;
        }
    }

    /**
     * Get child by name from the component
     * 从组件中按名称获取子对象
     */
    public getChild(name: string): GObject | null {
        if (this._component instanceof GComponent) {
            return this._component.getChild(name);
        }
        return null;
    }

    /**
     * Get controller by name from the component
     * 从组件中按名称获取控制器
     */
    public getController(name: string) {
        if (this._component instanceof GComponent) {
            return this._component.getController(name);
        }
        return null;
    }

    /**
     * Get transition by name from the component
     * 从组件中按名称获取过渡动画
     */
    public getTransition(name: string) {
        if (this._component instanceof GComponent) {
            return this._component.getTransition(name);
        }
        return null;
    }

    /**
     * Update component properties from ECS data
     * 从 ECS 数据更新组件属性
     */
    public syncProperties(): void {
        if (!this._component) return;

        if (this.width > 0) {
            this._component.width = this.width;
        }
        if (this.height > 0) {
            this._component.height = this.height;
        }
        this._component.x = this.x;
        this._component.y = this.y;
        this._component.visible = this.visible;
        this._component.alpha = this.alpha;
        this._component.sortingOrder = this.sortingOrder;
    }

    /**
     * Dispose and cleanup
     * 释放和清理
     */
    public dispose(): void {
        const hadContent = this._component !== null || this._root !== null;

        if (this._component) {
            this._component.dispose();
            this._component = null;
        }
        if (this._root) {
            this._root.dispose();
            this._root = null;
        }
        this._package = null;
        this._error = null;

        if (hadContent) {
            this._onStateChange?.('disposed');
        }
    }

    // ============= ECS Lifecycle | ECS 生命周期 =============

    /**
     * Called when component is removed from entity
     * 组件从实体移除时调用
     */
    public override onRemovedFromEntity(): void {
        this.dispose();
    }
}

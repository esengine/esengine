import type { IService } from '@esengine/ecs-framework';
import { Injectable, createLogger } from '@esengine/ecs-framework';
import type { MenuItem, ToolbarItem, PanelDescriptor } from '../Types/UITypes';
import { createRegistryToken } from './BaseRegistry';

const logger = createLogger('UIRegistry');

/**
 * @zh UI 注册表 - 管理所有编辑器 UI 扩展点的注册和查询
 * @en UI Registry - Manages all editor UI extension point registration and queries
 */

/** @zh 带排序权重的项 @en Item with sort order */
interface IOrdered {
    readonly order?: number;
}

@Injectable()
export class UIRegistry implements IService {
    private readonly _menus = new Map<string, MenuItem>();
    private readonly _toolbarItems = new Map<string, ToolbarItem>();
    private readonly _panels = new Map<string, PanelDescriptor>();

    // ========== 辅助方法 | Helper Methods ==========

    /** @zh 按 order 排序 @en Sort by order */
    private _sortByOrder<T extends IOrdered>(items: T[]): T[] {
        return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // ========== 菜单管理 | Menu Management ==========

    /**
     * @zh 注册菜单项
     * @en Register menu item
     */
    public registerMenu(item: MenuItem): void {
        if (this._menus.has(item.id)) {
            logger.warn(`Menu item ${item.id} is already registered`);
            return;
        }

        this._menus.set(item.id, item);
        logger.debug(`Registered menu item: ${item.id}`);
    }

    /**
     * @zh 批量注册菜单项
     * @en Register multiple menu items
     */
    public registerMenus(items: MenuItem[]): void {
        for (const item of items) {
            this.registerMenu(item);
        }
    }

    /**
     * @zh 注销菜单项
     * @en Unregister menu item
     */
    public unregisterMenu(id: string): boolean {
        const result = this._menus.delete(id);
        if (result) {
            logger.debug(`Unregistered menu item: ${id}`);
        }
        return result;
    }

    /** @zh 获取菜单项 @en Get menu item */
    public getMenu(id: string): MenuItem | undefined {
        return this._menus.get(id);
    }

    /**
     * @zh 获取所有菜单项
     * @en Get all menu items
     */
    public getAllMenus(): MenuItem[] {
        return this._sortByOrder(Array.from(this._menus.values()));
    }

    /**
     * @zh 获取指定父菜单的子菜单
     * @en Get child menus of specified parent
     */
    public getChildMenus(parentId: string): MenuItem[] {
        return this._sortByOrder(
            Array.from(this._menus.values()).filter((item) => item.parentId === parentId)
        );
    }

    // ========== 工具栏管理 | Toolbar Management ==========

    /**
     * @zh 注册工具栏项
     * @en Register toolbar item
     */
    public registerToolbarItem(item: ToolbarItem): void {
        if (this._toolbarItems.has(item.id)) {
            logger.warn(`Toolbar item ${item.id} is already registered`);
            return;
        }

        this._toolbarItems.set(item.id, item);
        logger.debug(`Registered toolbar item: ${item.id}`);
    }

    /**
     * @zh 批量注册工具栏项
     * @en Register multiple toolbar items
     */
    public registerToolbarItems(items: ToolbarItem[]): void {
        for (const item of items) {
            this.registerToolbarItem(item);
        }
    }

    /**
     * @zh 注销工具栏项
     * @en Unregister toolbar item
     */
    public unregisterToolbarItem(id: string): boolean {
        const result = this._toolbarItems.delete(id);
        if (result) {
            logger.debug(`Unregistered toolbar item: ${id}`);
        }
        return result;
    }

    /** @zh 获取工具栏项 @en Get toolbar item */
    public getToolbarItem(id: string): ToolbarItem | undefined {
        return this._toolbarItems.get(id);
    }

    /**
     * @zh 获取所有工具栏项
     * @en Get all toolbar items
     */
    public getAllToolbarItems(): ToolbarItem[] {
        return this._sortByOrder(Array.from(this._toolbarItems.values()));
    }

    /**
     * @zh 获取指定组的工具栏项
     * @en Get toolbar items by group
     */
    public getToolbarItemsByGroup(groupId: string): ToolbarItem[] {
        return this._sortByOrder(
            Array.from(this._toolbarItems.values()).filter((item) => item.groupId === groupId)
        );
    }

    // ========== 面板管理 | Panel Management ==========

    /**
     * @zh 注册面板
     * @en Register panel
     */
    public registerPanel(panel: PanelDescriptor): void {
        if (this._panels.has(panel.id)) {
            logger.warn(`Panel ${panel.id} is already registered`);
            return;
        }

        this._panels.set(panel.id, panel);
        logger.debug(`Registered panel: ${panel.id}`);
    }

    /**
     * @zh 批量注册面板
     * @en Register multiple panels
     */
    public registerPanels(panels: PanelDescriptor[]): void {
        for (const panel of panels) {
            this.registerPanel(panel);
        }
    }

    /**
     * @zh 注销面板
     * @en Unregister panel
     */
    public unregisterPanel(id: string): boolean {
        const result = this._panels.delete(id);
        if (result) {
            logger.debug(`Unregistered panel: ${id}`);
        }
        return result;
    }

    /** @zh 获取面板 @en Get panel */
    public getPanel(id: string): PanelDescriptor | undefined {
        return this._panels.get(id);
    }

    /**
     * @zh 获取所有面板
     * @en Get all panels
     */
    public getAllPanels(): PanelDescriptor[] {
        return this._sortByOrder(Array.from(this._panels.values()));
    }

    /**
     * @zh 获取指定位置的面板
     * @en Get panels by position
     */
    public getPanelsByPosition(position: string): PanelDescriptor[] {
        return this._sortByOrder(
            Array.from(this._panels.values()).filter((panel) => panel.position === position)
        );
    }

    // ========== 生命周期 | Lifecycle ==========

    /** @zh 释放资源 @en Dispose resources */
    public dispose(): void {
        this._menus.clear();
        this._toolbarItems.clear();
        this._panels.clear();
        logger.debug('Disposed');
    }
}

/** @zh UI 注册表服务标识符 @en UI registry service identifier */
export const IUIRegistry = createRegistryToken<UIRegistry>('UIRegistry');

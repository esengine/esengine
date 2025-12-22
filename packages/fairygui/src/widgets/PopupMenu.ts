import { GComponent } from '../core/GComponent';
import { GObject } from '../core/GObject';
import { GRoot } from '../core/GRoot';
import { Controller } from '../core/Controller';
import { getUIConfig } from '../core/UIConfig';
import { UIPackage } from '../package/UIPackage';
import { ERelationType } from '../core/FieldTypes';
import { FGUIEvents } from '../events/Events';
import { Timer } from '../core/Timer';
import { GList } from './GList';
import { GButton } from './GButton';
import type { SimpleHandler } from '../display/MovieClip';

/**
 * PopupMenu
 *
 * Context menu component with item management.
 *
 * 上下文菜单组件，支持菜单项管理
 *
 * Features:
 * - Add/remove menu items
 * - Checkable items
 * - Separators
 * - Grayed out items
 *
 * @example
 * ```typescript
 * const menu = new PopupMenu();
 * menu.addItem('Open', () => console.log('Open clicked'));
 * menu.addItem('Save', () => console.log('Save clicked'));
 * menu.addSeperator();
 * menu.addItem('Exit', () => console.log('Exit clicked'));
 * menu.show(targetButton);
 * ```
 */
export class PopupMenu {
    protected _contentPane: GComponent;
    protected _list: GList;

    constructor(resourceURL?: string) {
        if (!resourceURL) {
            resourceURL = getUIConfig('popupMenu');
            if (!resourceURL) {
                throw new Error('UIConfig.popupMenu not defined');
            }
        }

        const obj = UIPackage.createObjectFromURL(resourceURL);
        if (!obj || !(obj instanceof GComponent)) {
            throw new Error(`Failed to create popup menu from: ${resourceURL}`);
        }

        this._contentPane = obj;
        this._contentPane.on(FGUIEvents.DISPLAY, this.onAddedToStage, this);

        const list = this._contentPane.getChild('list');
        if (!list || !(list instanceof GList)) {
            throw new Error('PopupMenu content pane must have a child named "list" of type GList');
        }

        this._list = list;
        this._list.removeChildrenToPool();
        this._list.relations.add(this._contentPane, ERelationType.Width);
        this._list.relations.remove(this._contentPane, ERelationType.Height);
        this._contentPane.relations.add(this._list, ERelationType.Height);
        this._list.on(FGUIEvents.CLICK_ITEM, this.onClickItem, this);
    }

    /**
     * Dispose the menu
     * 销毁菜单
     */
    public dispose(): void {
        this._contentPane.dispose();
    }

    /**
     * Add a menu item
     * 添加菜单项
     */
    public addItem(caption: string, handler?: SimpleHandler): GButton {
        const item = this._list.addItemFromPool();
        if (!item || !(item instanceof GButton)) {
            throw new Error('Failed to create menu item');
        }

        item.title = caption;
        item.data = handler;
        item.grayed = false;

        const c = item.getController('checked');
        if (c) {
            c.selectedIndex = 0;
        }

        return item;
    }

    /**
     * Add a menu item at specified index
     * 在指定索引处添加菜单项
     */
    public addItemAt(caption: string, index: number, handler?: SimpleHandler): GButton {
        const item = this._list.getFromPool();
        if (!item || !(item instanceof GButton)) {
            throw new Error('Failed to create menu item');
        }

        this._list.addChildAt(item, index);
        item.title = caption;
        item.data = handler;
        item.grayed = false;

        const c = item.getController('checked');
        if (c) {
            c.selectedIndex = 0;
        }

        return item;
    }

    /**
     * Add a separator
     * 添加分隔符
     */
    public addSeperator(): void {
        const seperatorUrl = getUIConfig('popupMenuSeperator');
        if (!seperatorUrl) {
            throw new Error('UIConfig.popupMenuSeperator not defined');
        }
        this._list.addItemFromPool(seperatorUrl);
    }

    /**
     * Get item name at index
     * 获取指定索引处的菜单项名称
     */
    public getItemName(index: number): string {
        const item = this._list.getChildAt(index);
        return item ? item.name : '';
    }

    /**
     * Set item text by name
     * 通过名称设置菜单项文本
     */
    public setItemText(name: string, caption: string): void {
        const item = this._list.getChild(name);
        if (item && item instanceof GButton) {
            item.title = caption;
        }
    }

    /**
     * Set item visibility by name
     * 通过名称设置菜单项可见性
     */
    public setItemVisible(name: string, bVisible: boolean): void {
        const item = this._list.getChild(name);
        if (item && item.visible !== bVisible) {
            item.visible = bVisible;
            this._list.setBoundsChangedFlag();
        }
    }

    /**
     * Set item grayed state by name
     * 通过名称设置菜单项灰色状态
     */
    public setItemGrayed(name: string, bGrayed: boolean): void {
        const item = this._list.getChild(name);
        if (item && item instanceof GButton) {
            item.grayed = bGrayed;
        }
    }

    /**
     * Set item checkable state by name
     * 通过名称设置菜单项可选中状态
     */
    public setItemCheckable(name: string, bCheckable: boolean): void {
        const item = this._list.getChild(name);
        if (item && item instanceof GButton) {
            const c = item.getController('checked');
            if (c) {
                if (bCheckable) {
                    if (c.selectedIndex === 0) {
                        c.selectedIndex = 1;
                    }
                } else {
                    c.selectedIndex = 0;
                }
            }
        }
    }

    /**
     * Set item checked state by name
     * 通过名称设置菜单项选中状态
     */
    public setItemChecked(name: string, bChecked: boolean): void {
        const item = this._list.getChild(name);
        if (item && item instanceof GButton) {
            const c = item.getController('checked');
            if (c) {
                c.selectedIndex = bChecked ? 2 : 1;
            }
        }
    }

    /**
     * Check if item is checked by name
     * 通过名称检查菜单项是否选中
     */
    public isItemChecked(name: string): boolean {
        const item = this._list.getChild(name);
        if (item && item instanceof GButton) {
            const c = item.getController('checked');
            if (c) {
                return c.selectedIndex === 2;
            }
        }
        return false;
    }

    /**
     * Remove item by name
     * 通过名称移除菜单项
     */
    public removeItem(name: string): boolean {
        const item = this._list.getChild(name);
        if (item) {
            const index = this._list.getChildIndex(item);
            this._list.removeChildToPoolAt(index);
            return true;
        }
        return false;
    }

    /**
     * Clear all items
     * 清除所有菜单项
     */
    public clearItems(): void {
        this._list.removeChildrenToPool();
    }

    /**
     * Get item count
     * 获取菜单项数量
     */
    public get itemCount(): number {
        return this._list.numChildren;
    }

    /**
     * Get content pane
     * 获取内容面板
     */
    public get contentPane(): GComponent {
        return this._contentPane;
    }

    /**
     * Get list component
     * 获取列表组件
     */
    public get list(): GList {
        return this._list;
    }

    /**
     * Show menu
     * 显示菜单
     */
    public show(target?: GObject, dir?: number): void {
        const r = target?.root ?? GRoot.inst;
        const popupTarget = target instanceof GRoot ? undefined : target;
        r.showPopup(this._contentPane, popupTarget, dir);
    }

    private onClickItem(itemObject: GObject): void {
        Timer.inst.callLater(this, () => this.handleItemClick(itemObject));
    }

    private handleItemClick(itemObject: GObject): void {
        if (!(itemObject instanceof GButton)) {
            return;
        }

        if (itemObject.grayed) {
            this._list.selectedIndex = -1;
            return;
        }

        const c = itemObject.getController('checked');
        if (c && c.selectedIndex !== 0) {
            if (c.selectedIndex === 1) {
                c.selectedIndex = 2;
            } else {
                c.selectedIndex = 1;
            }
        }

        const r = this._contentPane.parent as GRoot | null;
        if (r) {
            r.hidePopup(this._contentPane);
        }

        const handler = itemObject.data as SimpleHandler | null;
        if (handler) {
            if (typeof handler === 'function') {
                handler();
            } else if (typeof handler.run === 'function') {
                handler.run();
            }
        }
    }

    private onAddedToStage(): void {
        this._list.selectedIndex = -1;
        this._list.resizeToFit(100000, 10);
    }
}

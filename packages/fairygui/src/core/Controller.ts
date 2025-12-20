import { EventDispatcher } from '../events/EventDispatcher';
import { FGUIEvents } from '../events/Events';
import type { GComponent } from './GComponent';

/**
 * Controller
 *
 * Manages state switching for UI components.
 * Similar to a state machine, it controls which gear values are active.
 *
 * 管理 UI 组件的状态切换，类似状态机，控制哪些齿轮值处于活动状态
 */
export class Controller extends EventDispatcher {
    /** Controller name | 控制器名称 */
    public name: string = '';

    /** Parent component | 父组件 */
    public parent: GComponent | null = null;

    /** Is changing flag | 是否正在变更中 */
    public changing: boolean = false;

    /** Auto radio group | 自动单选组 */
    public autoRadioGroupDepth: boolean = false;

    private _selectedIndex: number = 0;
    private _previousIndex: number = 0;
    private _pageIds: string[] = [];
    private _pageNames: string[] = [];

    constructor() {
        super();
    }

    /**
     * Get selected index
     * 获取选中索引
     */
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    /**
     * Set selected index
     * 设置选中索引
     */
    public set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            if (value > this._pageIds.length - 1) {
                throw new Error('Index out of bounds: ' + value);
            }

            this.changing = true;

            this._previousIndex = this._selectedIndex;
            this._selectedIndex = value;

            this.parent?.applyController(this);

            this.emit(FGUIEvents.STATUS_CHANGED);

            this.changing = false;
        }
    }

    /**
     * Get selected page
     * 获取选中页面名称
     */
    public get selectedPage(): string {
        if (this._selectedIndex === -1) {
            return '';
        }
        return this._pageNames[this._selectedIndex] || '';
    }

    /**
     * Set selected page
     * 设置选中页面
     */
    public set selectedPage(value: string) {
        let index = this._pageNames.indexOf(value);
        if (index === -1) {
            index = this._pageIds.indexOf(value);
        }
        if (index !== -1) {
            this.selectedIndex = index;
        }
    }

    /**
     * Get selected page ID
     * 获取选中页面 ID
     */
    public get selectedPageId(): string {
        if (this._selectedIndex === -1) {
            return '';
        }
        return this._pageIds[this._selectedIndex] || '';
    }

    /**
     * Set selected page ID
     * 设置选中页面 ID
     */
    public set selectedPageId(value: string) {
        const index = this._pageIds.indexOf(value);
        if (index !== -1) {
            this.selectedIndex = index;
        }
    }

    /**
     * Get previous selected index
     * 获取之前选中的索引
     */
    public get previousIndex(): number {
        return this._previousIndex;
    }

    /**
     * Get previous selected page
     * 获取之前选中的页面
     */
    public get previousPage(): string {
        if (this._previousIndex === -1) {
            return '';
        }
        return this._pageNames[this._previousIndex] || '';
    }

    /**
     * Get page count
     * 获取页面数量
     */
    public get pageCount(): number {
        return this._pageIds.length;
    }

    /**
     * Get page ID at index
     * 获取指定索引的页面 ID
     */
    public getPageId(index: number): string {
        return this._pageIds[index] || '';
    }

    /**
     * Set page ID at index
     * 设置指定索引的页面 ID
     */
    public setPageId(index: number, id: string): void {
        this._pageIds[index] = id;
    }

    /**
     * Get page name at index
     * 获取指定索引的页面名称
     */
    public getPageName(index: number): string {
        return this._pageNames[index] || '';
    }

    /**
     * Set page name at index
     * 设置指定索引的页面名称
     */
    public setPageName(index: number, name: string): void {
        this._pageNames[index] = name;
    }

    /**
     * Get index by page ID
     * 通过页面 ID 获取索引
     */
    public getPageIndexById(id: string): number {
        return this._pageIds.indexOf(id);
    }

    /**
     * Get ID by page name
     * 通过页面名称获取 ID
     */
    public getPageIdByName(name: string): string {
        const index = this._pageNames.indexOf(name);
        if (index !== -1) {
            return this._pageIds[index];
        }
        return '';
    }

    /**
     * Check if the controller has the specified page
     * 检查控制器是否有指定页面
     */
    public hasPage(aName: string): boolean {
        return this._pageNames.indexOf(aName) !== -1;
    }

    /**
     * Add page
     * 添加页面
     */
    public addPage(name: string = ''): void {
        this.addPageAt(name, this._pageIds.length);
    }

    /**
     * Add page at index
     * 在指定位置添加页面
     */
    public addPageAt(name: string, index: number): void {
        const id = '' + (this._pageIds.length > 0 ? parseInt(this._pageIds[this._pageIds.length - 1]) + 1 : 0);
        if (index === this._pageIds.length) {
            this._pageIds.push(id);
            this._pageNames.push(name);
        } else {
            this._pageIds.splice(index, 0, id);
            this._pageNames.splice(index, 0, name);
        }
    }

    /**
     * Remove page at index
     * 移除指定索引的页面
     */
    public removePage(name: string): void {
        const index = this._pageNames.indexOf(name);
        if (index !== -1) {
            this._pageIds.splice(index, 1);
            this._pageNames.splice(index, 1);
            if (this._selectedIndex >= this._pageIds.length) {
                this._selectedIndex = this._pageIds.length - 1;
            }
        }
    }

    /**
     * Remove page at index
     * 移除指定索引的页面
     */
    public removePageAt(index: number): void {
        this._pageIds.splice(index, 1);
        this._pageNames.splice(index, 1);
        if (this._selectedIndex >= this._pageIds.length) {
            this._selectedIndex = this._pageIds.length - 1;
        }
    }

    /**
     * Clear all pages
     * 清除所有页面
     */
    public clearPages(): void {
        this._pageIds.length = 0;
        this._pageNames.length = 0;
        this._selectedIndex = -1;
    }

    /**
     * Run actions on page changed
     * 页面改变时执行动作
     */
    public runActions(): void {
        // Override in subclasses or handle via events
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        this.parent = null;
        super.dispose();
    }
}

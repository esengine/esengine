import { GObject } from './GObject';
import { GGroup } from './GGroup';
import { Controller } from './Controller';
import { Transition } from './Transition';
import { EOverflowType, EChildrenRenderOrder } from './FieldTypes';
import { Rectangle } from '../utils/MathTypes';
import type { ScrollPane } from '../scroll/ScrollPane';
import type { IRenderCollector } from '../render/IRenderCollector';

/**
 * GComponent
 *
 * Container class that can hold children.
 * Supports controllers, transitions, scroll, and masking.
 *
 * 容器类，可包含子对象，支持控制器、过渡动画、滚动和遮罩
 */
export class GComponent extends GObject {
    /** Opaque hit area | 不透明点击区域 */
    public opaque: boolean = true;

    protected _margin: Rectangle = new Rectangle();
    protected _trackBounds: boolean = false;
    protected _boundsChanged: boolean = false;
    protected _childrenRenderOrder: EChildrenRenderOrder = EChildrenRenderOrder.Ascent;
    protected _apexIndex: number = 0;

    protected _children: GObject[] = [];
    protected _controllers: Controller[] = [];
    protected _transitions: Transition[] = [];
    protected _scrollPane: ScrollPane | null = null;

    protected _buildingDisplayList: boolean = false;
    protected _sortingChildCount: number = 0;

    // Overflow and masking | 溢出和遮罩
    protected _overflow: EOverflowType = EOverflowType.Visible;
    protected _clipRect: Rectangle | null = null;

    constructor() {
        super();
    }

    // Children management | 子对象管理

    /**
     * Get child count
     * 获取子对象数量
     */
    public get numChildren(): number {
        return this._children.length;
    }

    /**
     * Add a child
     * 添加子对象
     */
    public addChild(child: GObject): GObject {
        return this.addChildAt(child, this._children.length);
    }

    /**
     * Add child at specific index
     * 在指定位置添加子对象
     */
    public addChildAt(child: GObject, index: number): GObject {
        if (!child) {
            throw new Error('child is null');
        }

        const count = this._children.length;
        if (index < 0 || index > count) {
            throw new Error('Invalid child index: ' + index);
        }

        if (child._parent === this) {
            this.setChildIndex(child, index);
        } else {
            child.removeFromParent();
            child._parent = this;

            if (this._sortingChildCount > 0) {
                this._sortingChildCount++;
                index = this.getInsertPosForSortingChild(child);
            }

            this._children.splice(index, 0, child);

            this.childStateChanged(child);
            this.setBoundsChangedFlag();
        }

        return child;
    }

    /**
     * Remove a child
     * 移除子对象
     */
    public removeChild(child: GObject, bDispose: boolean = false): GObject {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            return this.removeChildAt(index, bDispose);
        }
        return child;
    }

    /**
     * Remove child at index
     * 移除指定位置的子对象
     */
    public removeChildAt(index: number, bDispose: boolean = false): GObject {
        if (index < 0 || index >= this._children.length) {
            throw new Error('Invalid child index: ' + index);
        }

        const child = this._children[index];
        child._parent = null;

        if (child.sortingOrder !== 0) {
            this._sortingChildCount--;
        }

        this._children.splice(index, 1);

        if (child.internalVisible) {
            const childDisplay = child.displayObject;
            if (this._displayObject && childDisplay) {
                this._displayObject.removeChild(childDisplay);
            }
        }

        this.setBoundsChangedFlag();

        if (bDispose) {
            child.dispose();
        }

        return child;
    }

    /**
     * Remove children in range
     * 移除指定范围的子对象
     */
    public removeChildren(beginIndex: number = 0, endIndex: number = -1, bDispose: boolean = false): void {
        if (endIndex < 0 || endIndex >= this._children.length) {
            endIndex = this._children.length - 1;
        }

        for (let i = endIndex; i >= beginIndex; i--) {
            this.removeChildAt(i, bDispose);
        }
    }

    /**
     * Get child at index
     * 获取指定位置的子对象
     */
    public getChildAt(index: number): GObject {
        if (index < 0 || index >= this._children.length) {
            throw new Error('Invalid child index: ' + index);
        }
        return this._children[index];
    }

    /**
     * Get child by name
     * 通过名称获取子对象
     */
    public getChild(name: string): GObject | null {
        for (const child of this._children) {
            if (child.name === name) {
                return child;
            }
        }
        return null;
    }

    /**
     * Get visible child by name
     * 通过名称获取可见子对象
     */
    public getVisibleChild(name: string): GObject | null {
        for (const child of this._children) {
            if (child.name === name && child.internalVisible) {
                return child;
            }
        }
        return null;
    }

    /**
     * Get child by path
     * 通过路径获取子对象
     */
    public getChildByPath(path: string): GObject | null {
        const arr = path.split('.');
        let obj: GObject | null = this;

        for (const part of arr) {
            if (obj instanceof GComponent) {
                obj = obj.getChild(part);
            } else {
                return null;
            }
        }

        return obj;
    }

    /**
     * Get child index
     * 获取子对象索引
     */
    public getChildIndex(child: GObject): number {
        return this._children.indexOf(child);
    }

    /**
     * Set child index
     * 设置子对象索引
     */
    public setChildIndex(child: GObject, index: number): void {
        const oldIndex = this._children.indexOf(child);
        if (oldIndex === -1) {
            throw new Error('Not a child of this container');
        }

        if (child.sortingOrder !== 0) {
            return;
        }

        const count = this._children.length;
        if (this._sortingChildCount > 0) {
            if (index > count - this._sortingChildCount - 1) {
                index = count - this._sortingChildCount - 1;
            }
        }

        this.moveChild(child, oldIndex, index);
    }

    /**
     * Set child index before another child
     * 设置子对象索引在另一个子对象之前
     */
    public setChildIndexBefore(child: GObject, beforeChild: GObject): number {
        const index = this._children.indexOf(child);
        if (index === -1) {
            throw new Error('Not a child of this container');
        }

        let beforeIndex = this._children.indexOf(beforeChild);
        if (beforeIndex === -1) {
            throw new Error('beforeChild is not a child of this container');
        }

        if (child.sortingOrder !== 0 || beforeChild.sortingOrder !== 0) {
            return index;
        }

        if (index < beforeIndex) {
            beforeIndex--;
        }

        this.moveChild(child, index, beforeIndex);
        return beforeIndex;
    }

    private moveChild(child: GObject, oldIndex: number, newIndex: number): void {
        this._children.splice(oldIndex, 1);
        this._children.splice(newIndex, 0, child);

        const childDisplay = child.displayObject;
        if (this._displayObject && childDisplay && child.internalVisible) {
            // Update display list order
            this._displayObject.setChildIndex(childDisplay, newIndex);
        }

        this.setBoundsChangedFlag();
    }

    /**
     * Swap children positions
     * 交换两个子对象位置
     */
    public swapChildren(child1: GObject, child2: GObject): void {
        const index1 = this._children.indexOf(child1);
        const index2 = this._children.indexOf(child2);
        if (index1 === -1 || index2 === -1) {
            throw new Error('Not a child of this container');
        }
        this.swapChildrenAt(index1, index2);
    }

    /**
     * Swap children at positions
     * 交换指定位置的子对象
     */
    public swapChildrenAt(index1: number, index2: number): void {
        const child1 = this._children[index1];
        const child2 = this._children[index2];

        this.setChildIndex(child1, index2);
        this.setChildIndex(child2, index1);
    }

    /**
     * Check if contains a child
     * 检查是否包含某个子对象
     */
    public isChildInView(child: GObject): boolean {
        if (this._scrollPane) {
            return this._scrollPane.isChildInView(child);
        }

        if (this._clipRect) {
            return child.x + child.width > 0 &&
                child.x < this._width &&
                child.y + child.height > 0 &&
                child.y < this._height;
        }

        return true;
    }

    /**
     * Get children in a group
     * 获取某个组内的所有子对象
     */
    public getChildrenInGroup(group: GGroup): GObject[] {
        const result: GObject[] = [];
        for (const child of this._children) {
            if (child.group === group) {
                result.push(child);
            }
        }
        return result;
    }

    private getInsertPosForSortingChild(target: GObject): number {
        const count = this._children.length;
        let i: number;
        for (i = 0; i < count; i++) {
            const child = this._children[i];
            if (child === target) continue;
            if (target.sortingOrder < child.sortingOrder) break;
        }
        return i;
    }

    // Controller management | 控制器管理

    /**
     * Get controller count
     * 获取控制器数量
     */
    public get numControllers(): number {
        return this._controllers.length;
    }

    /**
     * Get controller at index
     * 获取指定索引的控制器
     */
    public getControllerAt(index: number): Controller {
        return this._controllers[index];
    }

    /**
     * Get controller by name
     * 通过名称获取控制器
     */
    public getController(name: string): Controller | null {
        for (const c of this._controllers) {
            if (c.name === name) {
                return c;
            }
        }
        return null;
    }

    /**
     * Add controller
     * 添加控制器
     */
    public addController(controller: Controller): void {
        this._controllers.push(controller);
        controller.parent = this;
        this.applyController(controller);
    }

    /**
     * Remove controller
     * 移除控制器
     */
    public removeController(controller: Controller): void {
        const index = this._controllers.indexOf(controller);
        if (index !== -1) {
            controller.parent = null;
            this._controllers.splice(index, 1);

            for (const child of this._children) {
                child.handleControllerChanged(controller);
            }
        }
    }

    /**
     * Apply controller changes
     * 应用控制器变更
     */
    public applyController(controller: Controller): void {
        for (const child of this._children) {
            child.handleControllerChanged(controller);
        }
    }

    /**
     * Apply all controllers
     * 应用所有控制器
     */
    public applyAllControllers(): void {
        for (const c of this._controllers) {
            this.applyController(c);
        }
    }

    // Transition management | 过渡动画管理

    /**
     * Get transition at index
     * 获取指定索引的过渡动画
     */
    public getTransitionAt(index: number): Transition {
        return this._transitions[index];
    }

    /**
     * Get transition by name
     * 通过名称获取过渡动画
     */
    public getTransition(name: string): Transition | null {
        for (const t of this._transitions) {
            if (t.name === name) {
                return t;
            }
        }
        return null;
    }

    // Scroll pane | 滚动面板

    public get scrollPane(): ScrollPane | null {
        return this._scrollPane;
    }

    // Overflow | 溢出

    public get overflow(): EOverflowType {
        return this._overflow;
    }

    public set overflow(value: EOverflowType) {
        if (this._overflow !== value) {
            this._overflow = value;
            if (value === EOverflowType.Hidden) {
                this._clipRect = new Rectangle(0, 0, this._width, this._height);
            } else if (value === EOverflowType.Visible) {
                this._clipRect = null;
            }
        }
    }

    // Children render order | 子对象渲染顺序

    public get childrenRenderOrder(): EChildrenRenderOrder {
        return this._childrenRenderOrder;
    }

    public set childrenRenderOrder(value: EChildrenRenderOrder) {
        if (this._childrenRenderOrder !== value) {
            this._childrenRenderOrder = value;
            this.buildNativeDisplayList();
        }
    }

    public get apexIndex(): number {
        return this._apexIndex;
    }

    public set apexIndex(value: number) {
        if (this._apexIndex !== value) {
            this._apexIndex = value;
            if (this._childrenRenderOrder === EChildrenRenderOrder.Arch) {
                this.buildNativeDisplayList();
            }
        }
    }

    // Bounds management | 边界管理

    /**
     * Set bounds changed flag
     * 设置边界变更标记
     */
    public setBoundsChangedFlag(): void {
        if (!this._boundsChanged) {
            this._boundsChanged = true;
        }
    }

    /**
     * Ensure bounds are correct
     * 确保边界正确
     */
    public ensureBoundsCorrect(): void {
        if (this._boundsChanged) {
            this.updateBounds();
        }
    }

    protected updateBounds(): void {
        let ax = 0, ay = 0, aw = 0, ah = 0;

        for (const child of this._children) {
            const ar = child.x + child.actualWidth;
            const ab = child.y + child.actualHeight;

            if (ar > aw) aw = ar;
            if (ab > ah) ah = ab;
        }

        this.setBounds(ax, ay, aw, ah);
    }

    public setBounds(ax: number, ay: number, aw: number, ah: number): void {
        this._boundsChanged = false;
    }

    // Child state | 子对象状态

    /**
     * Notify child state changed
     * 通知子对象状态改变
     */
    public childStateChanged(child: GObject): void {
        if (this._buildingDisplayList) return;

        const childDisplay = child.displayObject;
        if (child.internalVisible) {
            if (this._displayObject && childDisplay) {
                if (childDisplay.parent !== this._displayObject) {
                    const index = this.getChildIndex(child);
                    this._displayObject.addChildAt(childDisplay, index);
                }
            }
        } else {
            if (this._displayObject && childDisplay) {
                this._displayObject.removeChild(childDisplay);
            }
        }
    }

    /**
     * Notify child sorting order changed
     * 通知子对象排序顺序改变
     */
    public childSortingOrderChanged(child: GObject, oldValue: number, newValue: number): void {
        if (newValue === 0) {
            this._sortingChildCount--;
            this.setChildIndex(child, this._children.length);
        } else {
            if (oldValue === 0) {
                this._sortingChildCount++;
            }

            const oldIndex = this._children.indexOf(child);
            const newIndex = this.getInsertPosForSortingChild(child);

            if (oldIndex < newIndex) {
                this.moveChild(child, oldIndex, newIndex - 1);
            } else {
                this.moveChild(child, oldIndex, newIndex);
            }
        }
    }

    // Display list building | 构建显示列表

    protected buildNativeDisplayList(): void {
        if (!this._displayObject) return;

        this._buildingDisplayList = true;

        const count = this._children.length;
        if (count === 0) {
            this._buildingDisplayList = false;
            return;
        }

        switch (this._childrenRenderOrder) {
            case EChildrenRenderOrder.Ascent:
                for (let i = 0; i < count; i++) {
                    const child = this._children[i];
                    const childDisplay = child.displayObject;
                    if (child.internalVisible && childDisplay) {
                        this._displayObject.addChild(childDisplay);
                    }
                }
                break;

            case EChildrenRenderOrder.Descent:
                for (let i = count - 1; i >= 0; i--) {
                    const child = this._children[i];
                    const childDisplay = child.displayObject;
                    if (child.internalVisible && childDisplay) {
                        this._displayObject.addChild(childDisplay);
                    }
                }
                break;

            case EChildrenRenderOrder.Arch:
                for (let i = 0; i < this._apexIndex; i++) {
                    const child = this._children[i];
                    const childDisplay = child.displayObject;
                    if (child.internalVisible && childDisplay) {
                        this._displayObject.addChild(childDisplay);
                    }
                }
                for (let i = count - 1; i >= this._apexIndex; i--) {
                    const child = this._children[i];
                    const childDisplay = child.displayObject;
                    if (child.internalVisible && childDisplay) {
                        this._displayObject.addChild(childDisplay);
                    }
                }
                break;
        }

        this._buildingDisplayList = false;
    }

    // Size handling | 尺寸处理

    protected handleSizeChanged(): void {
        super.handleSizeChanged();

        if (this._clipRect) {
            this._clipRect.width = this._width;
            this._clipRect.height = this._height;
        }

        if (this._scrollPane) {
            this._scrollPane.onOwnerSizeChanged();
        }
    }

    // Disposal | 销毁

    public dispose(): void {
        for (const t of this._transitions) {
            t.dispose();
        }
        this._transitions.length = 0;

        for (const c of this._controllers) {
            c.dispose();
        }
        this._controllers.length = 0;

        if (this._scrollPane) {
            this._scrollPane.dispose();
            this._scrollPane = null;
        }

        this.removeChildren(0, -1, true);

        super.dispose();
    }

    // Render data collection | 渲染数据收集

    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible) return;

        if (this._clipRect) {
            collector.pushClipRect(this._clipRect);
        }

        for (const child of this._children) {
            if (child.internalVisible) {
                child.collectRenderData(collector);
            }
        }

        if (this._clipRect) {
            collector.popClipRect();
        }
    }
}

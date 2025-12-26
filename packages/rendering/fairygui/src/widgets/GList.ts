import { GComponent } from '../core/GComponent';
import { GObject } from '../core/GObject';
import { GObjectPool } from '../core/GObjectPool';
import { GButton } from './GButton';
import { Controller } from '../core/Controller';
import { UIPackage } from '../package/UIPackage';
import { FGUIEvents } from '../events/Events';
import { Point, Margin } from '../utils/MathTypes';
import {
    EListLayoutType,
    EListSelectionMode,
    EChildrenRenderOrder,
    EOverflowType,
    EAlignType,
    EVertAlignType
} from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * Item renderer callback
 * 项渲染回调
 */
export type ItemRenderer = (index: number, item: GObject) => void;

/**
 * Item provider callback
 * 项提供者回调
 */
export type ItemProvider = (index: number) => string;

/**
 * GList
 *
 * Scrollable list component with item pooling support.
 *
 * 带有项池化支持的可滚动列表组件
 *
 * Features:
 * - Multiple layout modes (single column/row, flow, pagination)
 * - Item selection (single, multiple)
 * - Object pooling for performance
 */
export class GList extends GComponent {
    /** Item renderer callback | 项渲染回调 */
    public itemRenderer: ItemRenderer | null = null;

    /** Item provider callback | 项提供者回调 */
    public itemProvider: ItemProvider | null = null;

    /** Scroll item to view on click | 点击时滚动项到视图 */
    public scrollItemToViewOnClick: boolean = true;

    /** Fold invisible items | 折叠不可见项 */
    public foldInvisibleItems: boolean = false;

    private _layout: EListLayoutType = EListLayoutType.SingleColumn;
    private _lineCount: number = 0;
    private _columnCount: number = 0;
    private _lineGap: number = 0;
    private _columnGap: number = 0;
    private _defaultItem: string = '';
    private _autoResizeItem: boolean = true;
    private _selectionMode: EListSelectionMode = EListSelectionMode.Single;
    private _align: EAlignType = EAlignType.Left;
    private _verticalAlign: EVertAlignType = EVertAlignType.Top;
    private _selectionController: Controller | null = null;

    private _lastSelectedIndex: number = -1;
    private _pool: GObjectPool;
    private _listMargin: Margin = new Margin();

    constructor() {
        super();
        this._pool = new GObjectPool();
        this._trackBounds = true;
    }

    public dispose(): void {
        this._pool.clear();
        super.dispose();
    }

    // Layout properties

    public get layout(): EListLayoutType {
        return this._layout;
    }

    public set layout(value: EListLayoutType) {
        if (this._layout !== value) {
            this._layout = value;
            this.setBoundsChangedFlag();
        }
    }

    public get lineCount(): number {
        return this._lineCount;
    }

    public set lineCount(value: number) {
        if (this._lineCount !== value) {
            this._lineCount = value;
            this.setBoundsChangedFlag();
        }
    }

    public get columnCount(): number {
        return this._columnCount;
    }

    public set columnCount(value: number) {
        if (this._columnCount !== value) {
            this._columnCount = value;
            this.setBoundsChangedFlag();
        }
    }

    public get lineGap(): number {
        return this._lineGap;
    }

    public set lineGap(value: number) {
        if (this._lineGap !== value) {
            this._lineGap = value;
            this.setBoundsChangedFlag();
        }
    }

    public get columnGap(): number {
        return this._columnGap;
    }

    public set columnGap(value: number) {
        if (this._columnGap !== value) {
            this._columnGap = value;
            this.setBoundsChangedFlag();
        }
    }

    public get align(): EAlignType {
        return this._align;
    }

    public set align(value: EAlignType) {
        if (this._align !== value) {
            this._align = value;
            this.setBoundsChangedFlag();
        }
    }

    public get verticalAlign(): EVertAlignType {
        return this._verticalAlign;
    }

    public set verticalAlign(value: EVertAlignType) {
        if (this._verticalAlign !== value) {
            this._verticalAlign = value;
            this.setBoundsChangedFlag();
        }
    }

    public get defaultItem(): string {
        return this._defaultItem;
    }

    public set defaultItem(value: string) {
        this._defaultItem = UIPackage.normalizeURL(value);
    }

    public get autoResizeItem(): boolean {
        return this._autoResizeItem;
    }

    public set autoResizeItem(value: boolean) {
        if (this._autoResizeItem !== value) {
            this._autoResizeItem = value;
            this.setBoundsChangedFlag();
        }
    }

    public get selectionMode(): EListSelectionMode {
        return this._selectionMode;
    }

    public set selectionMode(value: EListSelectionMode) {
        this._selectionMode = value;
    }

    public get selectionController(): Controller | null {
        return this._selectionController;
    }

    public set selectionController(value: Controller | null) {
        this._selectionController = value;
    }

    public get itemPool(): GObjectPool {
        return this._pool;
    }

    // Item pool operations

    public getFromPool(url?: string): GObject | null {
        if (!url) {
            url = this._defaultItem;
        }
        const obj = this._pool.getObject(url);
        if (obj) {
            obj.visible = true;
        }
        return obj;
    }

    public returnToPool(obj: GObject): void {
        this._pool.returnObject(obj);
    }

    // Item operations

    public addChildAt(child: GObject, index: number): GObject {
        super.addChildAt(child, index);

        if (child instanceof GButton) {
            child.selected = false;
            child.changeStateOnClick = false;
        }
        child.on(FGUIEvents.CLICK, this._onClickItem, this);

        return child;
    }

    public addItem(url?: string): GObject | null {
        if (!url) {
            url = this._defaultItem;
        }
        const obj = UIPackage.createObjectFromURL(url);
        if (obj) {
            return this.addChild(obj);
        }
        return null;
    }

    public addItemFromPool(url?: string): GObject | null {
        const obj = this.getFromPool(url);
        if (obj) {
            return this.addChild(obj);
        }
        return null;
    }

    public removeChildAt(index: number, bDispose?: boolean): GObject {
        const child = super.removeChildAt(index, bDispose);
        if (!bDispose) {
            child.off(FGUIEvents.CLICK, this._onClickItem, this);
        }
        return child;
    }

    public removeChildToPoolAt(index: number): void {
        const child = super.removeChildAt(index);
        this.returnToPool(child);
    }

    public removeChildToPool(child: GObject): void {
        super.removeChild(child);
        this.returnToPool(child);
    }

    public removeChildrenToPool(beginIndex: number = 0, endIndex: number = -1): void {
        if (endIndex < 0 || endIndex >= this.numChildren) {
            endIndex = this.numChildren - 1;
        }

        for (let i = beginIndex; i <= endIndex; ++i) {
            this.removeChildToPoolAt(beginIndex);
        }
    }

    // Selection

    public get selectedIndex(): number {
        const cnt = this.numChildren;
        for (let i = 0; i < cnt; i++) {
            const obj = this.getChildAt(i);
            if (obj instanceof GButton && obj.selected) {
                return i;
            }
        }
        return -1;
    }

    public set selectedIndex(value: number) {
        if (value >= 0 && value < this.numChildren) {
            if (this._selectionMode !== EListSelectionMode.Single) {
                this.clearSelection();
            }
            this.addSelection(value);
        } else {
            this.clearSelection();
        }
    }

    public getSelection(result?: number[]): number[] {
        if (!result) {
            result = [];
        }

        const cnt = this.numChildren;
        for (let i = 0; i < cnt; i++) {
            const obj = this.getChildAt(i);
            if (obj instanceof GButton && obj.selected) {
                result.push(i);
            }
        }
        return result;
    }

    public addSelection(index: number, bScrollItToView?: boolean): void {
        if (this._selectionMode === EListSelectionMode.None) {
            return;
        }

        if (this._selectionMode === EListSelectionMode.Single) {
            this.clearSelection();
        }

        if (bScrollItToView) {
            this.scrollToView(index);
        }

        this._lastSelectedIndex = index;
        const obj = this.getChildAt(index);

        if (obj instanceof GButton && !obj.selected) {
            obj.selected = true;
            this.updateSelectionController(index);
        }
    }

    public removeSelection(index: number): void {
        if (this._selectionMode === EListSelectionMode.None) {
            return;
        }

        const obj = this.getChildAt(index);
        if (obj instanceof GButton) {
            obj.selected = false;
        }
    }

    public clearSelection(): void {
        const cnt = this.numChildren;
        for (let i = 0; i < cnt; i++) {
            const obj = this.getChildAt(i);
            if (obj instanceof GButton) {
                obj.selected = false;
            }
        }
    }

    public selectAll(): void {
        let last = -1;
        const cnt = this.numChildren;
        for (let i = 0; i < cnt; i++) {
            const obj = this.getChildAt(i);
            if (obj instanceof GButton && !obj.selected) {
                obj.selected = true;
                last = i;
            }
        }

        if (last !== -1) {
            this.updateSelectionController(last);
        }
    }

    public selectNone(): void {
        this.clearSelection();
    }

    public selectReverse(): void {
        let last = -1;
        const cnt = this.numChildren;
        for (let i = 0; i < cnt; i++) {
            const obj = this.getChildAt(i);
            if (obj instanceof GButton) {
                obj.selected = !obj.selected;
                if (obj.selected) {
                    last = i;
                }
            }
        }

        if (last !== -1) {
            this.updateSelectionController(last);
        }
    }

    // Scroll

    public scrollToView(index: number, bAni?: boolean, bSetFirst?: boolean): void {
        const obj = this.getChildAt(index);
        if (obj && this._scrollPane) {
            this._scrollPane.scrollToView(obj, bAni, bSetFirst);
        }
    }

    // Item count

    public get numItems(): number {
        return this.numChildren;
    }

    public set numItems(value: number) {
        const cnt = this.numChildren;
        if (value > cnt) {
            for (let i = cnt; i < value; i++) {
                if (this.itemProvider) {
                    this.addItemFromPool(this.itemProvider(i));
                } else {
                    this.addItemFromPool();
                }
            }
        } else {
            this.removeChildrenToPool(value, cnt);
        }

        if (this.itemRenderer) {
            for (let i = 0; i < value; i++) {
                const child = this.getChildAt(i);
                if (child) {
                    this.itemRenderer(i, child);
                }
            }
        }
    }

    // Size

    public resizeToFit(itemCount?: number, minSize?: number): void {
        if (itemCount == null) itemCount = 100000;
        if (minSize == null) minSize = 0;

        this.ensureBoundsCorrect();

        let curCount = this.numItems;
        if (itemCount > curCount) {
            itemCount = curCount;
        }

        if (itemCount === 0) {
            if (this._layout === EListLayoutType.SingleColumn ||
                this._layout === EListLayoutType.FlowHorizontal) {
                this.viewHeight = minSize;
            } else {
                this.viewWidth = minSize;
            }
        } else {
            let i = itemCount - 1;
            let obj: GObject | null = null;
            while (i >= 0) {
                obj = this.getChildAt(i);
                if (!this.foldInvisibleItems || obj?.visible) {
                    break;
                }
                i--;
            }
            if (i < 0 || !obj) {
                if (this._layout === EListLayoutType.SingleColumn ||
                    this._layout === EListLayoutType.FlowHorizontal) {
                    this.viewHeight = minSize;
                } else {
                    this.viewWidth = minSize;
                }
            } else {
                let size = 0;
                if (this._layout === EListLayoutType.SingleColumn ||
                    this._layout === EListLayoutType.FlowHorizontal) {
                    size = obj.y + obj.height;
                    if (size < minSize) size = minSize;
                    this.viewHeight = size;
                } else {
                    size = obj.x + obj.width;
                    if (size < minSize) size = minSize;
                    this.viewWidth = size;
                }
            }
        }
    }

    public getMaxItemWidth(): number {
        const cnt = this.numChildren;
        let max = 0;
        for (let i = 0; i < cnt; i++) {
            const child = this.getChildAt(i);
            if (child && child.width > max) {
                max = child.width;
            }
        }
        return max;
    }

    // View size helpers

    public get viewWidth(): number {
        if (this._scrollPane) {
            return this._scrollPane.viewWidth;
        }
        return this.width - this._listMargin.left - this._listMargin.right;
    }

    public set viewWidth(value: number) {
        if (this._scrollPane) {
            // Adjust component width
        }
        this.width = value + this._listMargin.left + this._listMargin.right;
    }

    public get viewHeight(): number {
        if (this._scrollPane) {
            return this._scrollPane.viewHeight;
        }
        return this.height - this._listMargin.top - this._listMargin.bottom;
    }

    public set viewHeight(value: number) {
        if (this._scrollPane) {
            // Adjust component height
        }
        this.height = value + this._listMargin.top + this._listMargin.bottom;
    }

    protected handleSizeChanged(): void {
        super.handleSizeChanged();
        this.setBoundsChangedFlag();
    }

    public handleControllerChanged(c: Controller): void {
        super.handleControllerChanged(c);

        if (this._selectionController === c) {
            this.selectedIndex = c.selectedIndex;
        }
    }

    // Event handlers

    private _onClickItem(item: GObject): void {
        if (this._scrollPane && this._scrollPane.isDragged) {
            return;
        }

        this.setSelectionOnEvent(item);

        if (this._scrollPane && this.scrollItemToViewOnClick) {
            this._scrollPane.scrollToView(item, true);
        }

        this.emit(FGUIEvents.CLICK_ITEM, item);
    }

    private setSelectionOnEvent(item: GObject): void {
        if (!(item instanceof GButton) || this._selectionMode === EListSelectionMode.None) {
            return;
        }

        const index = this.getChildIndex(item);

        if (this._selectionMode === EListSelectionMode.Single) {
            if (!item.selected) {
                this.clearSelectionExcept(item);
                item.selected = true;
            }
        } else {
            if (this._selectionMode === EListSelectionMode.MultipleSingleClick) {
                item.selected = !item.selected;
            } else {
                if (!item.selected) {
                    this.clearSelectionExcept(item);
                    item.selected = true;
                } else {
                    this.clearSelectionExcept(item);
                }
            }
        }

        this._lastSelectedIndex = index;

        if (item.selected) {
            this.updateSelectionController(index);
        }
    }

    private clearSelectionExcept(g: GObject): void {
        const cnt = this.numChildren;
        for (let i = 0; i < cnt; i++) {
            const obj = this.getChildAt(i);
            if (obj instanceof GButton && obj !== g) {
                obj.selected = false;
            }
        }
    }

    private updateSelectionController(index: number): void {
        if (this._selectionController && !this._selectionController.changing &&
            index < this._selectionController.pageCount) {
            const c = this._selectionController;
            this._selectionController = null;
            c.selectedIndex = index;
            this._selectionController = c;
        }
    }

    // Setup from buffer

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 5);

        this._layout = buffer.readByte();
        this._selectionMode = buffer.readByte();

        const i1 = buffer.readByte();
        this._align = i1 === 0 ? EAlignType.Left : (i1 === 1 ? EAlignType.Center : EAlignType.Right);

        const i2 = buffer.readByte();
        this._verticalAlign = i2 === 0 ? EVertAlignType.Top : (i2 === 1 ? EVertAlignType.Middle : EVertAlignType.Bottom);

        this._lineGap = buffer.getInt16();
        this._columnGap = buffer.getInt16();
        this._lineCount = buffer.getInt16();
        this._columnCount = buffer.getInt16();
        this._autoResizeItem = buffer.readBool();
        this._childrenRenderOrder = buffer.readByte() as EChildrenRenderOrder;
        this._apexIndex = buffer.getInt16();

        if (buffer.readBool()) {
            this._listMargin.top = buffer.getInt32();
            this._listMargin.bottom = buffer.getInt32();
            this._listMargin.left = buffer.getInt32();
            this._listMargin.right = buffer.getInt32();
        }

        const overflow = buffer.readByte() as EOverflowType;
        if (overflow === EOverflowType.Scroll) {
            const savedPos = buffer.position;
            buffer.seek(beginPos, 7);
            this.setupScroll(buffer);
            buffer.position = savedPos;
        } else {
            this.setupOverflow(overflow);
        }

        if (buffer.readBool()) {
            buffer.skip(8); // clipSoftness
        }

        if (buffer.version >= 2) {
            this.scrollItemToViewOnClick = buffer.readBool();
            this.foldInvisibleItems = buffer.readBool();
        }

        buffer.seek(beginPos, 8);
        this._defaultItem = buffer.readS();
        this.readItems(buffer);
    }

    protected readItems(buffer: ByteBuffer): void {
        const cnt = buffer.getInt16();
        for (let i = 0; i < cnt; i++) {
            const nextPos = buffer.getInt16() + buffer.position;

            let str = buffer.readS();
            if (!str) {
                str = this._defaultItem;
                if (!str) {
                    buffer.position = nextPos;
                    continue;
                }
            }

            const obj = this.getFromPool(str);
            if (obj) {
                this.addChild(obj);
                this.setupItem(buffer, obj);
            }

            buffer.position = nextPos;
        }
    }

    protected setupItem(buffer: ByteBuffer, obj: GObject): void {
        let str = buffer.readS();
        if (str) {
            obj.text = str;
        }
        str = buffer.readS();
        if (str && obj instanceof GButton) {
            obj.selectedTitle = str;
        }
        str = buffer.readS();
        if (str) {
            obj.icon = str;
        }
        str = buffer.readS();
        if (str && obj instanceof GButton) {
            obj.selectedIcon = str;
        }
        str = buffer.readS();
        if (str) {
            obj.name = str;
        }

        if (obj instanceof GComponent) {
            const cnt = buffer.getInt16();
            for (let i = 0; i < cnt; i++) {
                const cc = obj.getController(buffer.readS());
                const pageId = buffer.readS();
                if (cc) {
                    cc.selectedPageId = pageId;
                }
            }

            if (buffer.version >= 2) {
                const cnt2 = buffer.getInt16();
                for (let i = 0; i < cnt2; i++) {
                    const target = buffer.readS();
                    const propertyId = buffer.getInt16();
                    const value = buffer.readS();
                    const obj2 = obj.getChildByPath(target);
                    if (obj2) {
                        obj2.setProp(propertyId, value);
                    }
                }
            }
        }
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);

        buffer.seek(beginPos, 6);

        const i = buffer.getInt16();
        if (i !== -1 && this._parent) {
            this._selectionController = this._parent.getControllerAt(i);
        }
    }
}

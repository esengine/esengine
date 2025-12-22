import { GObject } from './GObject';
import { EGroupLayoutType } from './FieldTypes';

/**
 * GGroup
 *
 * Group container for layout and visibility control.
 * Can arrange children horizontally, vertically, or have no layout.
 *
 * 组容器，用于布局和可见性控制，可水平、垂直或无布局排列子元素
 */
export class GGroup extends GObject {
    /** Exclude invisible children from layout | 从布局中排除不可见子元素 */
    public excludeInvisibles: boolean = false;

    private _layout: EGroupLayoutType = EGroupLayoutType.None;
    private _lineGap: number = 0;
    private _columnGap: number = 0;
    private _mainGridIndex: number = -1;
    private _mainGridMinSize: number = 50;
    private _boundsChanged: boolean = false;
    private _updating: boolean = false;

    public get layout(): EGroupLayoutType {
        return this._layout;
    }

    public set layout(value: EGroupLayoutType) {
        if (this._layout !== value) {
            this._layout = value;
            this.setBoundsChangedFlag(true);
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

    public get mainGridIndex(): number {
        return this._mainGridIndex;
    }

    public set mainGridIndex(value: number) {
        if (this._mainGridIndex !== value) {
            this._mainGridIndex = value;
            this.setBoundsChangedFlag();
        }
    }

    public get mainGridMinSize(): number {
        return this._mainGridMinSize;
    }

    public set mainGridMinSize(value: number) {
        if (this._mainGridMinSize !== value) {
            this._mainGridMinSize = value;
            this.setBoundsChangedFlag();
        }
    }

    /**
     * Set bounds changed flag
     * 设置边界变更标记
     */
    public setBoundsChangedFlag(bPositionChanged: boolean = false): void {
        if (this._updating) return;

        if (bPositionChanged) {
            // Position changed, need to recalculate
        }

        if (!this._boundsChanged) {
            this._boundsChanged = true;
        }
    }

    /**
     * Ensure bounds are up to date
     * 确保边界是最新的
     */
    public ensureBoundsCorrect(): void {
        if (this._boundsChanged) {
            this.updateBounds();
        }
    }

    private updateBounds(): void {
        this._boundsChanged = false;

        if (!this._parent) return;

        this._updating = true;

        const children = this._parent.getChildrenInGroup(this);
        const count = children.length;

        if (count === 0) {
            this._updating = false;
            return;
        }

        if (this._layout === EGroupLayoutType.None) {
            this.updateBoundsNone(children);
        } else if (this._layout === EGroupLayoutType.Horizontal) {
            this.updateBoundsHorizontal(children);
        } else {
            this.updateBoundsVertical(children);
        }

        this._updating = false;
    }

    private updateBoundsNone(children: GObject[]): void {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const child of children) {
            if (this.excludeInvisibles && !child.internalVisible3) continue;

            const ax = child.xMin;
            const ay = child.yMin;

            if (ax < minX) minX = ax;
            if (ay < minY) minY = ay;
            if (ax + child.width > maxX) maxX = ax + child.width;
            if (ay + child.height > maxY) maxY = ay + child.height;
        }

        if (minX === Infinity) {
            minX = 0;
            minY = 0;
            maxX = 0;
            maxY = 0;
        }

        this._width = maxX - minX;
        this._height = maxY - minY;
    }

    private updateBoundsHorizontal(children: GObject[]): void {
        let totalWidth = 0;
        let maxHeight = 0;
        let visibleCount = 0;

        for (const child of children) {
            if (this.excludeInvisibles && !child.internalVisible3) continue;

            totalWidth += child.width;
            if (child.height > maxHeight) maxHeight = child.height;
            visibleCount++;
        }

        if (visibleCount > 0) {
            totalWidth += (visibleCount - 1) * this._columnGap;
        }

        this._width = totalWidth;
        this._height = maxHeight;
    }

    private updateBoundsVertical(children: GObject[]): void {
        let maxWidth = 0;
        let totalHeight = 0;
        let visibleCount = 0;

        for (const child of children) {
            if (this.excludeInvisibles && !child.internalVisible3) continue;

            totalHeight += child.height;
            if (child.width > maxWidth) maxWidth = child.width;
            visibleCount++;
        }

        if (visibleCount > 0) {
            totalHeight += (visibleCount - 1) * this._lineGap;
        }

        this._width = maxWidth;
        this._height = totalHeight;
    }

    /**
     * Move children when group is moved
     * 组移动时移动子元素
     */
    public moveChildren(dx: number, dy: number): void {
        if (this._updating || !this._parent) return;

        this._updating = true;

        const children = this._parent.getChildrenInGroup(this);
        for (const child of children) {
            child.setXY(child.x + dx, child.y + dy);
        }

        this._updating = false;
    }

    /**
     * Resize children when group is resized
     * 组调整大小时调整子元素
     */
    public resizeChildren(dw: number, dh: number): void {
        if (this._layout === EGroupLayoutType.None || this._updating || !this._parent) return;

        this._updating = true;

        const children = this._parent.getChildrenInGroup(this);
        const count = children.length;

        if (count > 0) {
            if (this._layout === EGroupLayoutType.Horizontal) {
                const remainingWidth = this._width + dw - (count - 1) * this._columnGap;
                let x = children[0].xMin;

                for (const child of children) {
                    if (this.excludeInvisibles && !child.internalVisible3) continue;

                    const newWidth = child._sizePercentInGroup * remainingWidth;
                    child.setSize(newWidth, child.height + dh);
                    child.xMin = x;
                    x += newWidth + this._columnGap;
                }
            } else {
                const remainingHeight = this._height + dh - (count - 1) * this._lineGap;
                let y = children[0].yMin;

                for (const child of children) {
                    if (this.excludeInvisibles && !child.internalVisible3) continue;

                    const newHeight = child._sizePercentInGroup * remainingHeight;
                    child.setSize(child.width + dw, newHeight);
                    child.yMin = y;
                    y += newHeight + this._lineGap;
                }
            }
        }

        this._updating = false;
    }
}

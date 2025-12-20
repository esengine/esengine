import { EventDispatcher } from '../events/EventDispatcher';
import type { GComponent } from '../core/GComponent';
import type { GObject } from '../core/GObject';
import { EScrollType, EScrollBarDisplayType } from '../core/FieldTypes';

/**
 * ScrollPane
 *
 * Provides scrolling functionality for containers.
 *
 * 为容器提供滚动功能
 */
export class ScrollPane extends EventDispatcher {
    /** Owner component | 所有者组件 */
    public readonly owner: GComponent;

    private _scrollType: EScrollType = EScrollType.Vertical;
    private _scrollBarDisplay: EScrollBarDisplayType = EScrollBarDisplayType.Default;
    private _bounceEnabled: boolean = false;
    private _touchEffect: boolean = true;
    private _scrollStep: number = 100;
    private _pageMode: boolean = false;
    private _inertiaDisabled: boolean = false;

    private _viewWidth: number = 0;
    private _viewHeight: number = 0;
    private _contentWidth: number = 0;
    private _contentHeight: number = 0;
    private _scrollX: number = 0;
    private _scrollY: number = 0;

    constructor(owner: GComponent) {
        super();
        this.owner = owner;
    }

    /**
     * Get scroll type
     * 获取滚动类型
     */
    public get scrollType(): EScrollType {
        return this._scrollType;
    }

    /**
     * Set scroll type
     * 设置滚动类型
     */
    public set scrollType(value: EScrollType) {
        this._scrollType = value;
    }

    /**
     * Get horizontal scroll position (0-1)
     * 获取水平滚动位置（0-1）
     */
    public get percX(): number {
        if (this._contentWidth <= this._viewWidth) return 0;
        return this._scrollX / (this._contentWidth - this._viewWidth);
    }

    /**
     * Set horizontal scroll position (0-1)
     * 设置水平滚动位置（0-1）
     */
    public set percX(value: number) {
        this.setPercX(value, false);
    }

    /**
     * Get vertical scroll position (0-1)
     * 获取垂直滚动位置（0-1）
     */
    public get percY(): number {
        if (this._contentHeight <= this._viewHeight) return 0;
        return this._scrollY / (this._contentHeight - this._viewHeight);
    }

    /**
     * Set vertical scroll position (0-1)
     * 设置垂直滚动位置（0-1）
     */
    public set percY(value: number) {
        this.setPercY(value, false);
    }

    /**
     * Get horizontal scroll position in pixels
     * 获取水平滚动位置（像素）
     */
    public get posX(): number {
        return this._scrollX;
    }

    /**
     * Set horizontal scroll position in pixels
     * 设置水平滚动位置（像素）
     */
    public set posX(value: number) {
        this.setPosX(value, false);
    }

    /**
     * Get vertical scroll position in pixels
     * 获取垂直滚动位置（像素）
     */
    public get posY(): number {
        return this._scrollY;
    }

    /**
     * Set vertical scroll position in pixels
     * 设置垂直滚动位置（像素）
     */
    public set posY(value: number) {
        this.setPosY(value, false);
    }

    /**
     * Get content width
     * 获取内容宽度
     */
    public get contentWidth(): number {
        return this._contentWidth;
    }

    /**
     * Get content height
     * 获取内容高度
     */
    public get contentHeight(): number {
        return this._contentHeight;
    }

    /**
     * Get view width
     * 获取视图宽度
     */
    public get viewWidth(): number {
        return this._viewWidth;
    }

    /**
     * Get view height
     * 获取视图高度
     */
    public get viewHeight(): number {
        return this._viewHeight;
    }

    /**
     * Check if scrolling to bottom
     * 检查是否滚动到底部
     */
    public get isBottomMost(): boolean {
        return this._scrollY >= this._contentHeight - this._viewHeight;
    }

    /**
     * Check if scrolling to right
     * 检查是否滚动到右边
     */
    public get isRightMost(): boolean {
        return this._scrollX >= this._contentWidth - this._viewWidth;
    }

    /**
     * Set horizontal scroll percent with animation
     * 设置水平滚动百分比（带动画）
     */
    public setPercX(value: number, bAnimate: boolean): void {
        if (this._contentWidth <= this._viewWidth) {
            this._scrollX = 0;
        } else {
            this._scrollX = Math.max(0, Math.min(1, value)) * (this._contentWidth - this._viewWidth);
        }
        this.updateScrollPosition();
    }

    /**
     * Set vertical scroll percent with animation
     * 设置垂直滚动百分比（带动画）
     */
    public setPercY(value: number, bAnimate: boolean): void {
        if (this._contentHeight <= this._viewHeight) {
            this._scrollY = 0;
        } else {
            this._scrollY = Math.max(0, Math.min(1, value)) * (this._contentHeight - this._viewHeight);
        }
        this.updateScrollPosition();
    }

    /**
     * Set horizontal position with animation
     * 设置水平位置（带动画）
     */
    public setPosX(value: number, bAnimate: boolean): void {
        this._scrollX = Math.max(0, Math.min(value, this._contentWidth - this._viewWidth));
        this.updateScrollPosition();
    }

    /**
     * Set vertical position with animation
     * 设置垂直位置（带动画）
     */
    public setPosY(value: number, bAnimate: boolean): void {
        this._scrollY = Math.max(0, Math.min(value, this._contentHeight - this._viewHeight));
        this.updateScrollPosition();
    }

    /**
     * Scroll to make child visible
     * 滚动使子对象可见
     */
    public scrollToView(target: GObject, bAnimate: boolean = false, bSetFirst: boolean = false): void {
        // Calculate target position and scroll
    }

    /**
     * Check if child is in view
     * 检查子对象是否在视图内
     */
    public isChildInView(child: GObject): boolean {
        const x = child.x;
        const y = child.y;
        const w = child.width;
        const h = child.height;

        return x + w > this._scrollX &&
            x < this._scrollX + this._viewWidth &&
            y + h > this._scrollY &&
            y < this._scrollY + this._viewHeight;
    }

    /**
     * Called when owner size changed
     * 当所有者尺寸改变时调用
     */
    public onOwnerSizeChanged(): void {
        this._viewWidth = this.owner.width;
        this._viewHeight = this.owner.height;
        this.updateScrollPosition();
    }

    /**
     * Set content size
     * 设置内容尺寸
     */
    public setContentSize(width: number, height: number): void {
        this._contentWidth = width;
        this._contentHeight = height;
        this.updateScrollPosition();
    }

    private updateScrollPosition(): void {
        // Update content container position
        // Emit scroll event
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        super.dispose();
    }
}

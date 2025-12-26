import { EventDispatcher } from '../events/EventDispatcher';
import { FGUIEvents, IInputEventData } from '../events/Events';
import { GTween } from '../tween/GTween';
import { Stage } from '../core/Stage';
import { GObject } from '../core/GObject';
import type { GComponent } from '../core/GComponent';
import type { GTweener } from '../tween/GTweener';
import { EScrollType, EScrollBarDisplayType } from '../core/FieldTypes';

/** Tween time for scrolling animation | 滚动动画缓动时间 */
const TWEEN_TIME_GO = 0.5;
/** Default tween time | 默认缓动时间 */
const TWEEN_TIME_DEFAULT = 0.3;
/** Pull ratio for overscroll | 过度滚动比例 */
const PULL_RATIO = 0.5;

// Helper functions
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function easeOut(t: number, d: number): number {
    return ((t = t / d - 1) * t * t + 1);
}

/**
 * ScrollPane
 *
 * Provides scrolling functionality for containers with drag tracking,
 * inertia scrolling, and bounce-back effects.
 *
 * 为容器提供滚动功能，支持拖拽追踪、惯性滚动和回弹效果
 */
export class ScrollPane extends EventDispatcher {
    /** Currently dragging scroll pane | 当前正在拖拽的滚动面板 */
    public static draggingPane: ScrollPane | null = null;

    /** Owner component | 所有者组件 */
    public readonly owner: GComponent;

    /** Bounce back effect | 回弹效果 */
    public bouncebackEffect: boolean = true;

    /** Touch effect enabled | 触摸效果启用 */
    public touchEffect: boolean = true;

    /** Scroll step | 滚动步长 */
    public scrollStep: number = 100;

    /** Mouse wheel step | 鼠标滚轮步长 */
    public mouseWheelStep: number = 200;

    /** Inertia disabled | 禁用惯性 */
    public inertiaDisabled: boolean = false;

    /** Snap to item | 吸附到项目 */
    public snapToItem: boolean = false;

    /** Page mode | 页面模式 */
    public pageMode: boolean = false;

    /** Deceleration rate | 减速率 */
    public decelerationRate: number = 0.967;

    private _scrollType: EScrollType = EScrollType.Vertical;
    private _scrollBarDisplay: EScrollBarDisplayType = EScrollBarDisplayType.Default;

    private _viewWidth: number = 0;
    private _viewHeight: number = 0;
    private _contentWidth: number = 0;
    private _contentHeight: number = 0;
    private _overlapWidth: number = 0;
    private _overlapHeight: number = 0;
    private _scrollX: number = 0;
    private _scrollY: number = 0;

    // Container position | 容器位置
    private _containerX: number = 0;
    private _containerY: number = 0;

    // Drag tracking | 拖拽追踪
    private _dragged: boolean = false;
    private _isHoldAreaDone: boolean = false;
    private _containerPosX: number = 0;
    private _containerPosY: number = 0;
    private _beginTouchX: number = 0;
    private _beginTouchY: number = 0;
    private _lastTouchX: number = 0;
    private _lastTouchY: number = 0;
    private _lastTouchGlobalX: number = 0;
    private _lastTouchGlobalY: number = 0;
    private _velocityX: number = 0;
    private _velocityY: number = 0;
    private _velocityScale: number = 1;
    private _lastMoveTime: number = 0;

    // Tween | 缓动
    private _tweening: number = 0;
    private _tweenTimeX: number = 0;
    private _tweenTimeY: number = 0;
    private _tweenDurationX: number = 0;
    private _tweenDurationY: number = 0;
    private _tweenStartX: number = 0;
    private _tweenStartY: number = 0;
    private _tweenChangeX: number = 0;
    private _tweenChangeY: number = 0;
    private _tweener: GTweener | null = null;

    // Gesture flag for multi-scroll coordination | 手势标记用于多滚动协调
    private static _gestureFlag: number = 0;

    // Bound event handlers | 绑定的事件处理器
    private _onMouseMoveHandler: (data: IInputEventData) => void;
    private _onMouseUpHandler: (data: IInputEventData) => void;

    constructor(owner: GComponent) {
        super();
        this.owner = owner;

        // Bind handlers
        this._onMouseMoveHandler = (data: IInputEventData) => this.onMouseMove(data.stageX, data.stageY);
        this._onMouseUpHandler = () => this.onMouseUp();
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
        return this._overlapWidth === 0 ? 0 : this._scrollX / this._overlapWidth;
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
        return this._overlapHeight === 0 ? 0 : this._scrollY / this._overlapHeight;
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
     * Get scrolling position X (current container position)
     * 获取滚动中的位置 X（当前容器位置）
     */
    public get scrollingPosX(): number {
        return clamp(-this._containerX, 0, this._overlapWidth);
    }

    /**
     * Get scrolling position Y (current container position)
     * 获取滚动中的位置 Y（当前容器位置）
     */
    public get scrollingPosY(): number {
        return clamp(-this._containerY, 0, this._overlapHeight);
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
        return this._scrollY >= this._overlapHeight || this._overlapHeight === 0;
    }

    /**
     * Check if scrolling to right
     * 检查是否滚动到右边
     */
    public get isRightMost(): boolean {
        return this._scrollX >= this._overlapWidth || this._overlapWidth === 0;
    }

    /**
     * Check if currently being dragged
     * 检查是否正在被拖拽
     */
    public get isDragged(): boolean {
        return this._dragged;
    }

    /**
     * Set horizontal scroll percent with animation
     * 设置水平滚动百分比（带动画）
     */
    public setPercX(value: number, bAnimate: boolean): void {
        this.setPosX(this._overlapWidth * clamp01(value), bAnimate);
    }

    /**
     * Set vertical scroll percent with animation
     * 设置垂直滚动百分比（带动画）
     */
    public setPercY(value: number, bAnimate: boolean): void {
        this.setPosY(this._overlapHeight * clamp01(value), bAnimate);
    }

    /**
     * Set horizontal position with animation
     * 设置水平位置（带动画）
     */
    public setPosX(value: number, bAnimate: boolean): void {
        value = clamp(value, 0, this._overlapWidth);
        if (value !== this._scrollX) {
            this._scrollX = value;
            this.posChanged(bAnimate);
        }
    }

    /**
     * Set vertical position with animation
     * 设置垂直位置（带动画）
     */
    public setPosY(value: number, bAnimate: boolean): void {
        value = clamp(value, 0, this._overlapHeight);
        if (value !== this._scrollY) {
            this._scrollY = value;
            this.posChanged(bAnimate);
        }
    }

    /**
     * Scroll to top
     * 滚动到顶部
     */
    public scrollTop(bAnimate?: boolean): void {
        this.setPercY(0, bAnimate ?? false);
    }

    /**
     * Scroll to bottom
     * 滚动到底部
     */
    public scrollBottom(bAnimate?: boolean): void {
        this.setPercY(1, bAnimate ?? false);
    }

    /**
     * Scroll up
     * 向上滚动
     */
    public scrollUp(ratio: number = 1, bAnimate?: boolean): void {
        if (this.pageMode) {
            this.setPosY(this._scrollY - this._viewHeight * ratio, bAnimate ?? false);
        } else {
            this.setPosY(this._scrollY - this.scrollStep * ratio, bAnimate ?? false);
        }
    }

    /**
     * Scroll down
     * 向下滚动
     */
    public scrollDown(ratio: number = 1, bAnimate?: boolean): void {
        if (this.pageMode) {
            this.setPosY(this._scrollY + this._viewHeight * ratio, bAnimate ?? false);
        } else {
            this.setPosY(this._scrollY + this.scrollStep * ratio, bAnimate ?? false);
        }
    }

    /**
     * Scroll left
     * 向左滚动
     */
    public scrollLeft(ratio: number = 1, bAnimate?: boolean): void {
        if (this.pageMode) {
            this.setPosX(this._scrollX - this._viewWidth * ratio, bAnimate ?? false);
        } else {
            this.setPosX(this._scrollX - this.scrollStep * ratio, bAnimate ?? false);
        }
    }

    /**
     * Scroll right
     * 向右滚动
     */
    public scrollRight(ratio: number = 1, bAnimate?: boolean): void {
        if (this.pageMode) {
            this.setPosX(this._scrollX + this._viewWidth * ratio, bAnimate ?? false);
        } else {
            this.setPosX(this._scrollX + this.scrollStep * ratio, bAnimate ?? false);
        }
    }

    /**
     * Scroll to make child visible
     * 滚动使子对象可见
     */
    public scrollToView(target: GObject, bAnimate: boolean = false, bSetFirst: boolean = false): void {
        const rect = {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height
        };

        if (this._overlapHeight > 0) {
            const bottom = this._scrollY + this._viewHeight;
            if (bSetFirst || rect.y <= this._scrollY || rect.height >= this._viewHeight) {
                this.setPosY(rect.y, bAnimate);
            } else if (rect.y + rect.height > bottom) {
                if (rect.height <= this._viewHeight / 2) {
                    this.setPosY(rect.y + rect.height * 2 - this._viewHeight, bAnimate);
                } else {
                    this.setPosY(rect.y + rect.height - this._viewHeight, bAnimate);
                }
            }
        }

        if (this._overlapWidth > 0) {
            const right = this._scrollX + this._viewWidth;
            if (bSetFirst || rect.x <= this._scrollX || rect.width >= this._viewWidth) {
                this.setPosX(rect.x, bAnimate);
            } else if (rect.x + rect.width > right) {
                if (rect.width <= this._viewWidth / 2) {
                    this.setPosX(rect.x + rect.width * 2 - this._viewWidth, bAnimate);
                } else {
                    this.setPosX(rect.x + rect.width - this._viewWidth, bAnimate);
                }
            }
        }
    }

    /**
     * Check if child is in view
     * 检查子对象是否在视图内
     */
    public isChildInView(child: GObject): boolean {
        if (this._overlapHeight > 0) {
            const dist = child.y - this._scrollY;
            if (dist < -child.height || dist > this._viewHeight) {
                return false;
            }
        }

        if (this._overlapWidth > 0) {
            const dist = child.x - this._scrollX;
            if (dist < -child.width || dist > this._viewWidth) {
                return false;
            }
        }

        return true;
    }

    /**
     * Cancel dragging
     * 取消拖拽
     */
    public cancelDragging(): void {
        const stage = Stage.inst;
        stage.off('mousemove', this._onMouseMoveHandler, this);
        stage.off('mouseup', this._onMouseUpHandler, this);

        if (ScrollPane.draggingPane === this) {
            ScrollPane.draggingPane = null;
        }

        ScrollPane._gestureFlag = 0;
        this._dragged = false;
    }

    /**
     * Called when owner size changed
     * 当所有者尺寸改变时调用
     */
    public onOwnerSizeChanged(): void {
        this._viewWidth = this.owner.width;
        this._viewHeight = this.owner.height;
        this.handleSizeChanged();
    }

    /**
     * Set content size
     * 设置内容尺寸
     */
    public setContentSize(width: number, height: number): void {
        if (this._contentWidth === width && this._contentHeight === height) {
            return;
        }
        this._contentWidth = width;
        this._contentHeight = height;
        this.handleSizeChanged();
    }

    private handleSizeChanged(): void {
        if (this._scrollType === EScrollType.Horizontal || this._scrollType === EScrollType.Both) {
            this._overlapWidth = Math.ceil(Math.max(0, this._contentWidth - this._viewWidth));
        } else {
            this._overlapWidth = 0;
        }

        if (this._scrollType === EScrollType.Vertical || this._scrollType === EScrollType.Both) {
            this._overlapHeight = Math.ceil(Math.max(0, this._contentHeight - this._viewHeight));
        } else {
            this._overlapHeight = 0;
        }

        // Clamp scroll positions
        this._scrollX = clamp(this._scrollX, 0, this._overlapWidth);
        this._scrollY = clamp(this._scrollY, 0, this._overlapHeight);

        // Update container position
        this._containerX = clamp(this._containerX, -this._overlapWidth, 0);
        this._containerY = clamp(this._containerY, -this._overlapHeight, 0);
    }

    private posChanged(bAnimate: boolean): void {
        if (bAnimate && !this._dragged) {
            const posX = this._overlapWidth > 0 ? -Math.floor(this._scrollX) : 0;
            const posY = this._overlapHeight > 0 ? -Math.floor(this._scrollY) : 0;

            if (posX !== this._containerX || posY !== this._containerY) {
                this._tweenDurationX = TWEEN_TIME_GO;
                this._tweenDurationY = TWEEN_TIME_GO;
                this._tweenStartX = this._containerX;
                this._tweenStartY = this._containerY;
                this._tweenChangeX = posX - this._tweenStartX;
                this._tweenChangeY = posY - this._tweenStartY;
                this.startTween(1);
            } else if (this._tweening !== 0) {
                this.killTween();
            }
        } else {
            if (this._tweening !== 0) {
                this.killTween();
            }
            this._containerX = Math.floor(-this._scrollX);
            this._containerY = Math.floor(-this._scrollY);
        }

        this.emit(FGUIEvents.SCROLL);
    }

    /**
     * Handle mouse down for drag tracking
     * 处理鼠标按下以进行拖拽追踪
     */
    public onMouseDown(stageX: number, stageY: number): void {
        if (!this.touchEffect) return;

        if (this._tweening !== 0) {
            this.killTween();
            this._dragged = true;
        } else {
            this._dragged = false;
        }

        const pt = this.owner.globalToLocal(stageX, stageY);

        this._containerPosX = this._containerX;
        this._containerPosY = this._containerY;
        this._beginTouchX = pt.x;
        this._beginTouchY = pt.y;
        this._lastTouchX = pt.x;
        this._lastTouchY = pt.y;
        this._lastTouchGlobalX = stageX;
        this._lastTouchGlobalY = stageY;
        this._isHoldAreaDone = false;
        this._velocityX = 0;
        this._velocityY = 0;
        this._velocityScale = 1;
        this._lastMoveTime = Date.now() / 1000;

        const stage = Stage.inst;
        stage.on('mousemove', this._onMouseMoveHandler, this);
        stage.on('mouseup', this._onMouseUpHandler, this);
    }

    private onMouseMove(stageX: number, stageY: number): void {
        if (!this.touchEffect || this.owner.isDisposed) return;

        // Check if another scroll pane is dragging
        if (ScrollPane.draggingPane && ScrollPane.draggingPane !== this) return;
        if (GObject.draggingObject) return;

        const sensitivity = 8;
        const pt = this.owner.globalToLocal(stageX, stageY);

        let sv = false;
        let sh = false;

        if (this._scrollType === EScrollType.Vertical) {
            if (!this._isHoldAreaDone) {
                ScrollPane._gestureFlag |= 1;
                const diff = Math.abs(this._beginTouchY - pt.y);
                if (diff < sensitivity) return;

                if ((ScrollPane._gestureFlag & 2) !== 0) {
                    const diff2 = Math.abs(this._beginTouchX - pt.x);
                    if (diff < diff2) return;
                }
            }
            sv = true;
        } else if (this._scrollType === EScrollType.Horizontal) {
            if (!this._isHoldAreaDone) {
                ScrollPane._gestureFlag |= 2;
                const diff = Math.abs(this._beginTouchX - pt.x);
                if (diff < sensitivity) return;

                if ((ScrollPane._gestureFlag & 1) !== 0) {
                    const diff2 = Math.abs(this._beginTouchY - pt.y);
                    if (diff < diff2) return;
                }
            }
            sh = true;
        } else {
            ScrollPane._gestureFlag = 3;
            if (!this._isHoldAreaDone) {
                let diff = Math.abs(this._beginTouchY - pt.y);
                if (diff < sensitivity) {
                    diff = Math.abs(this._beginTouchX - pt.x);
                    if (diff < sensitivity) return;
                }
            }
            sv = sh = true;
        }

        const newPosX = Math.floor(this._containerPosX + pt.x - this._beginTouchX);
        const newPosY = Math.floor(this._containerPosY + pt.y - this._beginTouchY);

        if (sv) {
            if (newPosY > 0) {
                if (!this.bouncebackEffect) {
                    this._containerY = 0;
                } else {
                    this._containerY = Math.floor(Math.min(newPosY * 0.5, this._viewHeight * PULL_RATIO));
                }
            } else if (newPosY < -this._overlapHeight) {
                if (!this.bouncebackEffect) {
                    this._containerY = -this._overlapHeight;
                } else {
                    this._containerY = Math.floor(
                        Math.max((newPosY + this._overlapHeight) * 0.5, -this._viewHeight * PULL_RATIO) -
                            this._overlapHeight
                    );
                }
            } else {
                this._containerY = newPosY;
            }
        }

        if (sh) {
            if (newPosX > 0) {
                if (!this.bouncebackEffect) {
                    this._containerX = 0;
                } else {
                    this._containerX = Math.floor(Math.min(newPosX * 0.5, this._viewWidth * PULL_RATIO));
                }
            } else if (newPosX < -this._overlapWidth) {
                if (!this.bouncebackEffect) {
                    this._containerX = -this._overlapWidth;
                } else {
                    this._containerX = Math.floor(
                        Math.max((newPosX + this._overlapWidth) * 0.5, -this._viewWidth * PULL_RATIO) -
                            this._overlapWidth
                    );
                }
            } else {
                this._containerX = newPosX;
            }
        }

        // Update velocity
        const frameRate = 60;
        const now = Date.now() / 1000;
        const deltaTime = Math.max(now - this._lastMoveTime, 1 / frameRate);
        let deltaPositionX = pt.x - this._lastTouchX;
        let deltaPositionY = pt.y - this._lastTouchY;
        if (!sh) deltaPositionX = 0;
        if (!sv) deltaPositionY = 0;

        if (deltaTime !== 0) {
            const elapsed = deltaTime * frameRate - 1;
            if (elapsed > 1) {
                const factor = Math.pow(0.833, elapsed);
                this._velocityX *= factor;
                this._velocityY *= factor;
            }
            this._velocityX = lerp(this._velocityX, (deltaPositionX * 60) / frameRate / deltaTime, deltaTime * 10);
            this._velocityY = lerp(this._velocityY, (deltaPositionY * 60) / frameRate / deltaTime, deltaTime * 10);
        }

        const deltaGlobalPositionX = this._lastTouchGlobalX - stageX;
        const deltaGlobalPositionY = this._lastTouchGlobalY - stageY;
        if (deltaPositionX !== 0) {
            this._velocityScale = Math.abs(deltaGlobalPositionX / deltaPositionX);
        } else if (deltaPositionY !== 0) {
            this._velocityScale = Math.abs(deltaGlobalPositionY / deltaPositionY);
        }

        this._lastTouchX = pt.x;
        this._lastTouchY = pt.y;
        this._lastTouchGlobalX = stageX;
        this._lastTouchGlobalY = stageY;
        this._lastMoveTime = now;

        // Update scroll positions
        if (this._overlapWidth > 0) {
            this._scrollX = clamp(-this._containerX, 0, this._overlapWidth);
        }
        if (this._overlapHeight > 0) {
            this._scrollY = clamp(-this._containerY, 0, this._overlapHeight);
        }

        ScrollPane.draggingPane = this;
        this._isHoldAreaDone = true;
        this._dragged = true;

        this.emit(FGUIEvents.SCROLL);
    }

    private onMouseUp(): void {
        if (this.owner.isDisposed) return;

        const stage = Stage.inst;
        stage.off('mousemove', this._onMouseMoveHandler, this);
        stage.off('mouseup', this._onMouseUpHandler, this);

        if (ScrollPane.draggingPane === this) {
            ScrollPane.draggingPane = null;
        }

        ScrollPane._gestureFlag = 0;

        if (!this._dragged || !this.touchEffect) {
            this._dragged = false;
            return;
        }

        this._dragged = false;

        this._tweenStartX = this._containerX;
        this._tweenStartY = this._containerY;

        let endPosX = this._tweenStartX;
        let endPosY = this._tweenStartY;
        let flag = false;

        // Check if out of bounds
        if (this._containerX > 0) {
            endPosX = 0;
            flag = true;
        } else if (this._containerX < -this._overlapWidth) {
            endPosX = -this._overlapWidth;
            flag = true;
        }

        if (this._containerY > 0) {
            endPosY = 0;
            flag = true;
        } else if (this._containerY < -this._overlapHeight) {
            endPosY = -this._overlapHeight;
            flag = true;
        }

        if (flag) {
            this._tweenChangeX = endPosX - this._tweenStartX;
            this._tweenChangeY = endPosY - this._tweenStartY;
            this._tweenDurationX = TWEEN_TIME_DEFAULT;
            this._tweenDurationY = TWEEN_TIME_DEFAULT;
        } else {
            // Apply inertia
            if (!this.inertiaDisabled) {
                const frameRate = 60;
                const elapsed = ((Date.now() / 1000 - this._lastMoveTime) * frameRate) - 1;
                if (elapsed > 1) {
                    const factor = Math.pow(0.833, elapsed);
                    this._velocityX *= factor;
                    this._velocityY *= factor;
                }
                this.updateTargetAndDuration();
                endPosX = this._tweenStartX + this._tweenChangeX;
                endPosY = this._tweenStartY + this._tweenChangeY;
            } else {
                this._tweenDurationX = TWEEN_TIME_DEFAULT;
                this._tweenDurationY = TWEEN_TIME_DEFAULT;
            }

            // Clamp to bounds
            if (endPosX > 0) {
                endPosX = 0;
            } else if (endPosX < -this._overlapWidth) {
                endPosX = -this._overlapWidth;
            }

            if (endPosY > 0) {
                endPosY = 0;
            } else if (endPosY < -this._overlapHeight) {
                endPosY = -this._overlapHeight;
            }

            this._tweenChangeX = endPosX - this._tweenStartX;
            this._tweenChangeY = endPosY - this._tweenStartY;

            if (this._tweenChangeX === 0 && this._tweenChangeY === 0) {
                return;
            }
        }

        this.startTween(2);
    }

    private updateTargetAndDuration(): void {
        this._tweenChangeX = this.updateTargetAndDurationAxis(this._velocityX, this._overlapWidth, 'x');
        this._tweenChangeY = this.updateTargetAndDurationAxis(this._velocityY, this._overlapHeight, 'y');
    }

    private updateTargetAndDurationAxis(velocity: number, overlapSize: number, axis: 'x' | 'y'): number {
        let duration = 0;
        let change = 0;
        const pos = axis === 'x' ? this._tweenStartX : this._tweenStartY;

        if (pos > 0 || pos < -overlapSize) {
            duration = TWEEN_TIME_DEFAULT;
        } else {
            const v2 = Math.abs(velocity) * this._velocityScale;
            let ratio = 0;

            if (v2 > 500) {
                ratio = Math.pow((v2 - 500) / 500, 2);
            }

            if (ratio !== 0) {
                if (ratio > 1) ratio = 1;

                const adjustedVelocity = velocity * ratio;
                duration = Math.log(60 / (Math.abs(adjustedVelocity) * this._velocityScale)) / Math.log(this.decelerationRate) / 60;
                change = Math.floor(adjustedVelocity * duration * 0.4);
            }
        }

        if (duration < TWEEN_TIME_DEFAULT) {
            duration = TWEEN_TIME_DEFAULT;
        }

        if (axis === 'x') {
            this._tweenDurationX = duration;
        } else {
            this._tweenDurationY = duration;
        }

        return change;
    }

    private startTween(type: number): void {
        this._tweenTimeX = 0;
        this._tweenTimeY = 0;
        this._tweening = type;

        // Start frame-based update
        this._tweener = GTween.delayedCall(0)
            .onUpdate(() => this.tweenUpdate())
            .setRepeat(-1);
    }

    private killTween(): void {
        if (this._tweening === 1) {
            this._containerX = this._tweenStartX + this._tweenChangeX;
            this._containerY = this._tweenStartY + this._tweenChangeY;
            this.emit(FGUIEvents.SCROLL);
        }

        this._tweening = 0;
        if (this._tweener) {
            this._tweener.kill();
            this._tweener = null;
        }

        this.emit(FGUIEvents.SCROLL_END);
    }

    private tweenUpdate(): void {
        const dt = 1 / 60;
        const nx = this.runTween('x', dt);
        const ny = this.runTween('y', dt);

        this._containerX = nx;
        this._containerY = ny;

        if (this._tweening === 2) {
            if (this._overlapWidth > 0) {
                this._scrollX = clamp(-nx, 0, this._overlapWidth);
            }
            if (this._overlapHeight > 0) {
                this._scrollY = clamp(-ny, 0, this._overlapHeight);
            }
        }

        if (this._tweenChangeX === 0 && this._tweenChangeY === 0) {
            this._tweening = 0;
            if (this._tweener) {
                this._tweener.kill();
                this._tweener = null;
            }

            this.emit(FGUIEvents.SCROLL);
            this.emit(FGUIEvents.SCROLL_END);
        } else {
            this.emit(FGUIEvents.SCROLL);
        }
    }

    private runTween(axis: 'x' | 'y', dt: number): number {
        let newValue: number;
        const tweenChange = axis === 'x' ? this._tweenChangeX : this._tweenChangeY;
        const tweenStart = axis === 'x' ? this._tweenStartX : this._tweenStartY;
        const tweenDuration = axis === 'x' ? this._tweenDurationX : this._tweenDurationY;
        let tweenTime = axis === 'x' ? this._tweenTimeX : this._tweenTimeY;
        const currentPos = axis === 'x' ? this._containerX : this._containerY;
        const overlapSize = axis === 'x' ? this._overlapWidth : this._overlapHeight;

        if (tweenChange !== 0) {
            tweenTime += dt;
            if (axis === 'x') {
                this._tweenTimeX = tweenTime;
            } else {
                this._tweenTimeY = tweenTime;
            }

            if (tweenTime >= tweenDuration) {
                newValue = tweenStart + tweenChange;
                if (axis === 'x') {
                    this._tweenChangeX = 0;
                } else {
                    this._tweenChangeY = 0;
                }
            } else {
                const ratio = easeOut(tweenTime, tweenDuration);
                newValue = tweenStart + Math.floor(tweenChange * ratio);
            }

            const threshold1 = 0;
            const threshold2 = -overlapSize;

            if (this._tweening === 2 && this.bouncebackEffect) {
                if ((newValue > 20 + threshold1 && tweenChange > 0) || (newValue > threshold1 && tweenChange === 0)) {
                    if (axis === 'x') {
                        this._tweenTimeX = 0;
                        this._tweenDurationX = TWEEN_TIME_DEFAULT;
                        this._tweenChangeX = -newValue + threshold1;
                        this._tweenStartX = newValue;
                    } else {
                        this._tweenTimeY = 0;
                        this._tweenDurationY = TWEEN_TIME_DEFAULT;
                        this._tweenChangeY = -newValue + threshold1;
                        this._tweenStartY = newValue;
                    }
                } else if (
                    (newValue < threshold2 - 20 && tweenChange < 0) ||
                    (newValue < threshold2 && tweenChange === 0)
                ) {
                    if (axis === 'x') {
                        this._tweenTimeX = 0;
                        this._tweenDurationX = TWEEN_TIME_DEFAULT;
                        this._tweenChangeX = threshold2 - newValue;
                        this._tweenStartX = newValue;
                    } else {
                        this._tweenTimeY = 0;
                        this._tweenDurationY = TWEEN_TIME_DEFAULT;
                        this._tweenChangeY = threshold2 - newValue;
                        this._tweenStartY = newValue;
                    }
                }
            } else {
                if (newValue > threshold1) {
                    newValue = threshold1;
                    if (axis === 'x') {
                        this._tweenChangeX = 0;
                    } else {
                        this._tweenChangeY = 0;
                    }
                } else if (newValue < threshold2) {
                    newValue = threshold2;
                    if (axis === 'x') {
                        this._tweenChangeX = 0;
                    } else {
                        this._tweenChangeY = 0;
                    }
                }
            }
        } else {
            newValue = currentPos;
        }

        return newValue;
    }

    /**
     * Handle mouse wheel
     * 处理鼠标滚轮
     */
    public onMouseWheel(delta: number): void {
        if (this._overlapWidth > 0 && this._overlapHeight === 0) {
            if (this.pageMode) {
                this.setPosX(this._scrollX + this._viewWidth * Math.sign(delta), false);
            } else {
                this.setPosX(this._scrollX + this.mouseWheelStep * Math.sign(delta), false);
            }
        } else {
            if (this.pageMode) {
                this.setPosY(this._scrollY + this._viewHeight * Math.sign(delta), false);
            } else {
                this.setPosY(this._scrollY + this.mouseWheelStep * Math.sign(delta), false);
            }
        }
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        if (ScrollPane.draggingPane === this) {
            ScrollPane.draggingPane = null;
        }

        if (this._tweener) {
            this._tweener.kill();
            this._tweener = null;
        }

        super.dispose();
    }
}

import { EventDispatcher } from '../events/EventDispatcher';
import { FGUIEvents } from '../events/Events';
import { Point, Rectangle } from '../utils/MathTypes';
import type { IRenderCollector } from '../render/IRenderCollector';
import type { GObject } from '../core/GObject';

/**
 * DisplayObject
 *
 * Abstract display object base class for all visual elements.
 *
 * 抽象显示对象基类，所有可视元素的基础
 */
export abstract class DisplayObject extends EventDispatcher {
    /** Name of this display object | 显示对象名称 */
    public name: string = '';

    // Transform properties | 变换属性
    protected _x: number = 0;
    protected _y: number = 0;
    protected _width: number = 0;
    protected _height: number = 0;
    protected _scaleX: number = 1;
    protected _scaleY: number = 1;
    protected _rotation: number = 0;
    protected _pivotX: number = 0;
    protected _pivotY: number = 0;
    protected _skewX: number = 0;
    protected _skewY: number = 0;

    // Display properties | 显示属性
    protected _alpha: number = 1;
    protected _visible: boolean = true;
    protected _touchable: boolean = true;
    protected _grayed: boolean = false;

    // Hierarchy | 层级关系
    protected _parent: DisplayObject | null = null;
    protected _children: DisplayObject[] = [];

    // Stage reference | 舞台引用
    protected _stage: DisplayObject | null = null;

    // Dirty flags | 脏标记
    protected _transformDirty: boolean = true;
    protected _boundsDirty: boolean = true;

    // Cached values | 缓存值
    protected _worldAlpha: number = 1;
    protected _worldMatrix: Float32Array = new Float32Array([1, 0, 0, 1, 0, 0]);
    protected _bounds: Rectangle = new Rectangle();

    // User data | 用户数据
    public userData: unknown = null;

    /** Owner GObject reference | 所属 GObject 引用 */
    public gOwner: GObject | null = null;

    constructor() {
        super();
    }

    // Position | 位置

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.markTransformDirty();
        }
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.markTransformDirty();
        }
    }

    public setPosition(x: number, y: number): void {
        if (this._x !== x || this._y !== y) {
            this._x = x;
            this._y = y;
            this.markTransformDirty();
        }
    }

    // Size | 尺寸

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.markBoundsDirty();
        }
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.markBoundsDirty();
        }
    }

    public setSize(width: number, height: number): void {
        if (this._width !== width || this._height !== height) {
            this._width = width;
            this._height = height;
            this.markBoundsDirty();
        }
    }

    // Scale | 缩放

    public get scaleX(): number {
        return this._scaleX;
    }

    public set scaleX(value: number) {
        if (this._scaleX !== value) {
            this._scaleX = value;
            this.markTransformDirty();
        }
    }

    public get scaleY(): number {
        return this._scaleY;
    }

    public set scaleY(value: number) {
        if (this._scaleY !== value) {
            this._scaleY = value;
            this.markTransformDirty();
        }
    }

    public setScale(scaleX: number, scaleY: number): void {
        if (this._scaleX !== scaleX || this._scaleY !== scaleY) {
            this._scaleX = scaleX;
            this._scaleY = scaleY;
            this.markTransformDirty();
        }
    }

    // Rotation | 旋转

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this.markTransformDirty();
        }
    }

    // Pivot | 轴心点

    public get pivotX(): number {
        return this._pivotX;
    }

    public set pivotX(value: number) {
        if (this._pivotX !== value) {
            this._pivotX = value;
            this.markTransformDirty();
        }
    }

    public get pivotY(): number {
        return this._pivotY;
    }

    public set pivotY(value: number) {
        if (this._pivotY !== value) {
            this._pivotY = value;
            this.markTransformDirty();
        }
    }

    public setPivot(pivotX: number, pivotY: number): void {
        if (this._pivotX !== pivotX || this._pivotY !== pivotY) {
            this._pivotX = pivotX;
            this._pivotY = pivotY;
            this.markTransformDirty();
        }
    }

    // Skew | 倾斜

    public get skewX(): number {
        return this._skewX;
    }

    public set skewX(value: number) {
        if (this._skewX !== value) {
            this._skewX = value;
            this.markTransformDirty();
        }
    }

    public get skewY(): number {
        return this._skewY;
    }

    public set skewY(value: number) {
        if (this._skewY !== value) {
            this._skewY = value;
            this.markTransformDirty();
        }
    }

    // Alpha | 透明度

    public get alpha(): number {
        return this._alpha;
    }

    public set alpha(value: number) {
        if (this._alpha !== value) {
            this._alpha = value;
        }
    }

    // Visibility | 可见性

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        this._visible = value;
    }

    // Touchable | 可触摸

    public get touchable(): boolean {
        return this._touchable;
    }

    public set touchable(value: boolean) {
        this._touchable = value;
    }

    // Grayed | 灰度

    public get grayed(): boolean {
        return this._grayed;
    }

    public set grayed(value: boolean) {
        this._grayed = value;
    }

    // Hierarchy | 层级

    public get parent(): DisplayObject | null {
        return this._parent;
    }

    /**
     * Get stage reference
     * 获取舞台引用
     */
    public get stage(): DisplayObject | null {
        return this._stage;
    }

    /**
     * Set stage reference (internal use)
     * 设置舞台引用（内部使用）
     *
     * @internal
     */
    public setStage(stage: DisplayObject | null): void {
        this._stage = stage;
    }

    public get numChildren(): number {
        return this._children.length;
    }

    /**
     * Add a child display object
     * 添加子显示对象
     */
    public addChild(child: DisplayObject): void {
        this.addChildAt(child, this._children.length);
    }

    /**
     * Add a child at specific index
     * 在指定位置添加子显示对象
     */
    public addChildAt(child: DisplayObject, index: number): void {
        if (child._parent === this) {
            this.setChildIndex(child, index);
            return;
        }

        if (child._parent) {
            child._parent.removeChild(child);
        }

        index = Math.max(0, Math.min(index, this._children.length));
        this._children.splice(index, 0, child);
        child._parent = this;
        child.markTransformDirty();

        // Dispatch addedToStage event if this is on stage
        // 如果当前对象在舞台上，分发 addedToStage 事件
        if (this._stage !== null) {
            this.setChildStage(child, this._stage);
        }
    }

    /**
     * Set stage for child and its descendants, dispatch events
     * 为子对象及其后代设置舞台，分发事件
     */
    private setChildStage(child: DisplayObject, stage: DisplayObject | null): void {
        const wasOnStage = child._stage !== null;
        const isOnStage = stage !== null;

        child._stage = stage;

        if (!wasOnStage && isOnStage) {
            // Dispatch addedToStage event
            child.emit(FGUIEvents.ADDED_TO_STAGE);
        } else if (wasOnStage && !isOnStage) {
            // Dispatch removedFromStage event
            child.emit(FGUIEvents.REMOVED_FROM_STAGE);
        }

        // Recursively set stage for all children
        for (const grandChild of child._children) {
            this.setChildStage(grandChild, stage);
        }
    }

    /**
     * Remove a child display object
     * 移除子显示对象
     */
    public removeChild(child: DisplayObject): void {
        const index = this._children.indexOf(child);
        if (index >= 0) {
            this.removeChildAt(index);
        }
    }

    /**
     * Remove child at specific index
     * 移除指定位置的子显示对象
     */
    public removeChildAt(index: number): DisplayObject | null {
        if (index < 0 || index >= this._children.length) {
            return null;
        }

        const child = this._children[index];

        // Dispatch removedFromStage event if on stage
        // 如果在舞台上，分发 removedFromStage 事件
        if (this._stage !== null) {
            this.setChildStage(child, null);
        }

        this._children.splice(index, 1);
        child._parent = null;
        return child;
    }

    /**
     * Remove all children
     * 移除所有子显示对象
     */
    public removeChildren(): void {
        // Dispatch removedFromStage events if on stage
        // 如果在舞台上，分发 removedFromStage 事件
        if (this._stage !== null) {
            for (const child of this._children) {
                this.setChildStage(child, null);
            }
        }

        for (const child of this._children) {
            child._parent = null;
        }
        this._children.length = 0;
    }

    /**
     * Get child at index
     * 获取指定位置的子显示对象
     */
    public getChildAt(index: number): DisplayObject | null {
        if (index < 0 || index >= this._children.length) {
            return null;
        }
        return this._children[index];
    }

    /**
     * Get child index
     * 获取子显示对象的索引
     */
    public getChildIndex(child: DisplayObject): number {
        return this._children.indexOf(child);
    }

    /**
     * Set child index
     * 设置子显示对象的索引
     */
    public setChildIndex(child: DisplayObject, index: number): void {
        const currentIndex = this._children.indexOf(child);
        if (currentIndex < 0) return;

        index = Math.max(0, Math.min(index, this._children.length - 1));
        if (currentIndex === index) return;

        this._children.splice(currentIndex, 1);
        this._children.splice(index, 0, child);
    }

    /**
     * Swap two children
     * 交换两个子显示对象
     */
    public swapChildren(child1: DisplayObject, child2: DisplayObject): void {
        const index1 = this._children.indexOf(child1);
        const index2 = this._children.indexOf(child2);
        if (index1 >= 0 && index2 >= 0) {
            this._children[index1] = child2;
            this._children[index2] = child1;
        }
    }

    /**
     * Get child by name
     * 通过名称获取子显示对象
     */
    public getChildByName(name: string): DisplayObject | null {
        for (const child of this._children) {
            if (child.name === name) {
                return child;
            }
        }
        return null;
    }

    // Transform | 变换

    /**
     * Update world matrix
     * 更新世界矩阵
     *
     * World matrix is in FGUI's coordinate system (top-left origin, Y-down).
     * Coordinate system conversion to engine (center origin, Y-up) is done in FGUIRenderDataProvider.
     *
     * 世界矩阵使用 FGUI 坐标系（左上角原点，Y 向下）。
     * 坐标系转换到引擎（中心原点，Y 向上）在 FGUIRenderDataProvider 中完成。
     */
    public updateTransform(): void {
        if (!this._transformDirty) return;

        const m = this._worldMatrix;
        const rad = (this._rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        m[0] = cos * this._scaleX;
        m[1] = sin * this._scaleX;
        m[2] = -sin * this._scaleY;
        m[3] = cos * this._scaleY;

        // Keep FGUI's coordinate system (top-left origin, Y-down)
        // 保持 FGUI 坐标系（左上角原点，Y 向下）
        m[4] = this._x - this._pivotX * m[0] - this._pivotY * m[2];
        m[5] = this._y - this._pivotX * m[1] - this._pivotY * m[3];

        if (this._parent) {
            const pm = this._parent._worldMatrix;
            const a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];

            m[0] = a * pm[0] + b * pm[2];
            m[1] = a * pm[1] + b * pm[3];
            m[2] = c * pm[0] + d * pm[2];
            m[3] = c * pm[1] + d * pm[3];
            m[4] = tx * pm[0] + ty * pm[2] + pm[4];
            m[5] = tx * pm[1] + ty * pm[3] + pm[5];

            this._worldAlpha = this._alpha * this._parent._worldAlpha;
        } else {
            this._worldAlpha = this._alpha;
        }

        this._transformDirty = false;

        for (const child of this._children) {
            child.markTransformDirty();
            child.updateTransform();
        }
    }

    /**
     * Local to global point conversion
     * 本地坐标转全局坐标
     */
    public localToGlobal(localPoint: Point, outPoint?: Point): Point {
        this.updateTransform();

        outPoint = outPoint || new Point();
        const m = this._worldMatrix;
        outPoint.x = localPoint.x * m[0] + localPoint.y * m[2] + m[4];
        outPoint.y = localPoint.x * m[1] + localPoint.y * m[3] + m[5];
        return outPoint;
    }

    /**
     * Global to local point conversion
     * 全局坐标转本地坐标
     */
    public globalToLocal(globalPoint: Point, outPoint?: Point): Point {
        this.updateTransform();

        outPoint = outPoint || new Point();
        const m = this._worldMatrix;
        const det = m[0] * m[3] - m[1] * m[2];

        if (det === 0) {
            outPoint.x = 0;
            outPoint.y = 0;
        } else {
            const invDet = 1 / det;
            const x = globalPoint.x - m[4];
            const y = globalPoint.y - m[5];
            outPoint.x = (x * m[3] - y * m[2]) * invDet;
            outPoint.y = (y * m[0] - x * m[1]) * invDet;
        }
        return outPoint;
    }

    /**
     * Hit test
     * 碰撞检测
     */
    public hitTest(globalX: number, globalY: number): DisplayObject | null {
        if (!this._visible || !this._touchable) {
            return null;
        }

        const localPoint = this.globalToLocal(new Point(globalX, globalY));

        if (
            localPoint.x >= 0 &&
            localPoint.x < this._width &&
            localPoint.y >= 0 &&
            localPoint.y < this._height
        ) {
            for (let i = this._children.length - 1; i >= 0; i--) {
                const hit = this._children[i].hitTest(globalX, globalY);
                if (hit) return hit;
            }
            return this;
        }

        return null;
    }

    // Dirty flags | 脏标记

    protected markTransformDirty(): void {
        this._transformDirty = true;
        this._boundsDirty = true;
    }

    protected markBoundsDirty(): void {
        this._boundsDirty = true;
    }

    // Render data collection | 渲染数据收集

    /**
     * Collect render data (abstract - implemented by subclasses)
     * 收集渲染数据（抽象方法 - 由子类实现）
     */
    public abstract collectRenderData(collector: IRenderCollector): void;

    /**
     * Get world matrix
     * 获取世界矩阵
     */
    public get worldMatrix(): Float32Array {
        return this._worldMatrix;
    }

    /**
     * Get world alpha
     * 获取世界透明度
     */
    public get worldAlpha(): number {
        return this._worldAlpha;
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        if (this._parent) {
            this._parent.removeChild(this);
        }

        for (const child of this._children) {
            child.dispose();
        }

        this._children.length = 0;
        super.dispose();
    }
}

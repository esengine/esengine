import { DisplayObject } from '../display/DisplayObject';
import { EventDispatcher } from '../events/EventDispatcher';
import { FGUIEvents } from '../events/Events';
import { Point, Rectangle } from '../utils/MathTypes';
import { ERelationType, EObjectPropID } from './FieldTypes';
import type { GComponent } from './GComponent';
import type { GGroup } from './GGroup';
import type { GRoot } from './GRoot';
import { Relations } from '../layout/Relations';
import type { GearBase } from '../gears/GearBase';
import type { Controller } from './Controller';
import type { PackageItem } from '../package/PackageItem';
import type { ByteBuffer } from '../utils/ByteBuffer';
import type { IRenderCollector } from '../render/IRenderCollector';

/** Instance counter for unique IDs | 实例计数器用于生成唯一 ID */
let _gInstanceCounter = 0;

/**
 * GObject
 *
 * Base class for all FairyGUI objects.
 * Provides transform, visibility, interaction, and relation management.
 *
 * FairyGUI 所有对象的基类，提供变换、可见性、交互和关联管理
 */
export class GObject extends EventDispatcher {
    /** User data | 用户数据 */
    public data: any = null;

    /** Package item this object belongs to | 所属的包资源项 */
    public packageItem: PackageItem | null = null;

    /** Currently dragging object | 当前正在拖拽的对象 */
    public static draggingObject: GObject | null = null;

    // Transform properties | 变换属性
    protected _x: number = 0;
    protected _y: number = 0;
    protected _width: number = 0;
    protected _height: number = 0;
    protected _rawWidth: number = 0;
    protected _rawHeight: number = 0;
    protected _alpha: number = 1;
    protected _rotation: number = 0;
    protected _visible: boolean = true;
    protected _touchable: boolean = true;
    protected _grayed: boolean = false;
    protected _scaleX: number = 1;
    protected _scaleY: number = 1;
    protected _skewX: number = 0;
    protected _skewY: number = 0;
    protected _pivotX: number = 0;
    protected _pivotY: number = 0;
    protected _pivotAsAnchor: boolean = false;
    protected _pivotOffsetX: number = 0;
    protected _pivotOffsetY: number = 0;
    protected _sortingOrder: number = 0;
    protected _internalVisible: boolean = true;
    protected _yOffset: number = 0;

    // Constraints and states | 约束和状态
    protected _relations: Relations;
    protected _group: GGroup | null = null;
    protected _gears: (GearBase | null)[] = [];
    protected _draggable: boolean = false;
    protected _dragBounds: Rectangle | null = null;
    protected _handlingController: boolean = false;
    protected _tooltips: string = '';
    protected _pixelSnapping: boolean = false;

    // Display object | 显示对象
    protected _displayObject: DisplayObject | null = null;

    // Size limits | 尺寸限制
    public minWidth: number = 0;
    public minHeight: number = 0;
    public maxWidth: number = 0;
    public maxHeight: number = 0;
    public sourceWidth: number = 0;
    public sourceHeight: number = 0;
    public initWidth: number = 0;
    public initHeight: number = 0;

    // Internal state | 内部状态
    public _parent: GComponent | null = null;
    public _id: string;
    public _name: string = '';
    public _underConstruct: boolean = false;
    public _gearLocked: boolean = false;
    public _sizePercentInGroup: number = 0;

    constructor() {
        super();
        this._id = '' + _gInstanceCounter++;
        this._relations = new Relations(this);
        this.createDisplayObject();
        this._gears = new Array(10).fill(null);
    }

    // ID and Name | ID 和名称

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    /**
     * Get resource URL if this object was created from a package resource
     * 如果此对象是从包资源创建的，则获取资源 URL
     */
    public get resourceURL(): string {
        if (this.packageItem) {
            return `ui://${this.packageItem.owner?.id || ''}${this.packageItem.id}`;
        }
        return '';
    }

    // Position | 位置

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this.setXY(value, this._y);
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this.setXY(this._x, value);
    }

    /**
     * Set position
     * 设置位置
     */
    public setXY(xv: number, yv: number): void {
        if (this._x !== xv || this._y !== yv) {
            const dx = xv - this._x;
            const dy = yv - this._y;
            this._x = xv;
            this._y = yv;

            this.handleXYChanged();

            this.updateGear(1);

            if (this._parent) {
                this._parent.setBoundsChangedFlag();
                if (this._group) {
                    this._group.setBoundsChangedFlag(true);
                }
                this.emit(FGUIEvents.XY_CHANGED);
            }
        }
    }

    public get xMin(): number {
        return this._pivotAsAnchor ? this._x - this._width * this._pivotX : this._x;
    }

    public set xMin(value: number) {
        if (this._pivotAsAnchor) {
            this.setXY(value + this._width * this._pivotX, this._y);
        } else {
            this.setXY(value, this._y);
        }
    }

    public get yMin(): number {
        return this._pivotAsAnchor ? this._y - this._height * this._pivotY : this._y;
    }

    public set yMin(value: number) {
        if (this._pivotAsAnchor) {
            this.setXY(this._x, value + this._height * this._pivotY);
        } else {
            this.setXY(this._x, value);
        }
    }

    // Pixel snapping | 像素对齐

    public get pixelSnapping(): boolean {
        return this._pixelSnapping;
    }

    public set pixelSnapping(value: boolean) {
        if (this._pixelSnapping !== value) {
            this._pixelSnapping = value;
            this.handleXYChanged();
        }
    }

    /**
     * Center this object in its parent
     * 在父容器中居中
     */
    public center(bRestraint: boolean = false): void {
        const r = this._parent || this.root;
        if (r) {
            this.setXY((r.width - this.width) / 2, (r.height - this.height) / 2);
            if (bRestraint) {
                this.addRelation(r, ERelationType.CenterCenter);
                this.addRelation(r, ERelationType.MiddleMiddle);
            }
        }
    }

    // Size | 尺寸

    public get width(): number {
        this.ensureSizeCorrect();
        if (this._relations?.sizeDirty) {
            this._relations.ensureRelationsSizeCorrect();
        }
        return this._width;
    }

    public set width(value: number) {
        this.setSize(value, this._rawHeight);
    }

    public get height(): number {
        this.ensureSizeCorrect();
        if (this._relations?.sizeDirty) {
            this._relations.ensureRelationsSizeCorrect();
        }
        return this._height;
    }

    public set height(value: number) {
        this.setSize(this._rawWidth, value);
    }

    /**
     * Set size
     * 设置尺寸
     */
    public setSize(wv: number, hv: number, bIgnorePivot: boolean = false): void {
        if (this._rawWidth !== wv || this._rawHeight !== hv) {
            this._rawWidth = wv;
            this._rawHeight = hv;

            if (wv < this.minWidth) wv = this.minWidth;
            if (hv < this.minHeight) hv = this.minHeight;
            if (this.maxWidth > 0 && wv > this.maxWidth) wv = this.maxWidth;
            if (this.maxHeight > 0 && hv > this.maxHeight) hv = this.maxHeight;

            const dWidth = wv - this._width;
            const dHeight = hv - this._height;
            this._width = wv;
            this._height = hv;

            this.handleSizeChanged();

            if (this._pivotX !== 0 || this._pivotY !== 0) {
                if (!this._pivotAsAnchor) {
                    if (!bIgnorePivot) {
                        this.setXY(this.x - this._pivotX * dWidth, this.y - this._pivotY * dHeight);
                    }
                    this.updatePivotOffset();
                } else {
                    this.applyPivot();
                }
            }

            this.updateGear(2);

            if (this._parent) {
                this._relations?.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !bIgnorePivot);
                this._parent.setBoundsChangedFlag();
                if (this._group) {
                    this._group.setBoundsChangedFlag();
                }
            }

            this.emit(FGUIEvents.SIZE_CHANGED);
        }
    }

    /**
     * Ensure size is calculated correctly
     * 确保尺寸计算正确
     */
    public ensureSizeCorrect(): void {
        // Override in subclasses if needed
    }

    /**
     * Make this object fill the screen
     * 使此对象填满屏幕
     */
    public makeFullScreen(): void {
        const root = this.root;
        if (root) {
            this.setSize(root.width, root.height);
        }
    }

    public get actualWidth(): number {
        return this.width * Math.abs(this._scaleX);
    }

    public get actualHeight(): number {
        return this.height * Math.abs(this._scaleY);
    }

    // Scale | 缩放

    public get scaleX(): number {
        return this._scaleX;
    }

    public set scaleX(value: number) {
        this.setScale(value, this._scaleY);
    }

    public get scaleY(): number {
        return this._scaleY;
    }

    public set scaleY(value: number) {
        this.setScale(this._scaleX, value);
    }

    public setScale(sx: number, sy: number): void {
        if (this._scaleX !== sx || this._scaleY !== sy) {
            this._scaleX = sx;
            this._scaleY = sy;
            this.handleScaleChanged();
            this.applyPivot();
            this.updateGear(2);
        }
    }

    // Skew | 倾斜

    public get skewX(): number {
        return this._skewX;
    }

    public set skewX(value: number) {
        this.setSkew(value, this._skewY);
    }

    public get skewY(): number {
        return this._skewY;
    }

    public set skewY(value: number) {
        this.setSkew(this._skewX, value);
    }

    public setSkew(sx: number, sy: number): void {
        if (this._skewX !== sx || this._skewY !== sy) {
            this._skewX = sx;
            this._skewY = sy;
            this.handleSkewChanged();
            this.applyPivot();
        }
    }

    // Pivot | 轴心

    public get pivotX(): number {
        return this._pivotX;
    }

    public set pivotX(value: number) {
        this.setPivot(value, this._pivotY);
    }

    public get pivotY(): number {
        return this._pivotY;
    }

    public set pivotY(value: number) {
        this.setPivot(this._pivotX, value);
    }

    public setPivot(xv: number, yv: number = 0, bAsAnchor: boolean = false): void {
        if (this._pivotX !== xv || this._pivotY !== yv || this._pivotAsAnchor !== bAsAnchor) {
            this._pivotX = xv;
            this._pivotY = yv;
            this._pivotAsAnchor = bAsAnchor;
            this.updatePivotOffset();
            this.handleXYChanged();
        }
    }

    public get pivotAsAnchor(): boolean {
        return this._pivotAsAnchor;
    }

    protected internalSetPivot(xv: number, yv: number, bAsAnchor: boolean): void {
        this._pivotX = xv;
        this._pivotY = yv;
        this._pivotAsAnchor = bAsAnchor;
        if (this._pivotAsAnchor) {
            this.handleXYChanged();
        }
    }

    protected updatePivotOffset(): void {
        if (this._displayObject && (this._pivotX !== 0 || this._pivotY !== 0)) {
            const px = this._pivotX * this._width;
            const py = this._pivotY * this._height;
            // Calculate offset after applying transform
            this._pivotOffsetX = px;
            this._pivotOffsetY = py;
        } else {
            this._pivotOffsetX = 0;
            this._pivotOffsetY = 0;
        }
    }

    protected applyPivot(): void {
        if (this._pivotX !== 0 || this._pivotY !== 0) {
            this.updatePivotOffset();
            this.handleXYChanged();
        }
    }

    // Visibility and Interaction | 可见性和交互

    public get touchable(): boolean {
        return this._touchable;
    }

    public set touchable(value: boolean) {
        if (this._touchable !== value) {
            this._touchable = value;
            this.updateGear(3);
            if (this._displayObject) {
                this._displayObject.touchable = this._touchable;
            }
        }
    }

    public get grayed(): boolean {
        return this._grayed;
    }

    public set grayed(value: boolean) {
        if (this._grayed !== value) {
            this._grayed = value;
            this.handleGrayedChanged();
            this.updateGear(3);
        }
    }

    public get enabled(): boolean {
        return !this._grayed && this._touchable;
    }

    public set enabled(value: boolean) {
        this.grayed = !value;
        this.touchable = value;
    }

    public get draggable(): boolean {
        return this._draggable;
    }

    public set draggable(value: boolean) {
        this._draggable = value;
    }

    /**
     * Start dragging this object
     * 开始拖拽此对象
     */
    public startDrag(touchPointId?: number): void {
        GObject.draggingObject = this;
    }

    /**
     * Stop dragging this object
     * 停止拖拽此对象
     */
    public stopDrag(): void {
        if (GObject.draggingObject === this) {
            GObject.draggingObject = null;
        }
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this.handleRotationChanged();
            this.applyPivot();
            this.updateGear(3);
        }
    }

    public get normalizeRotation(): number {
        let rot = this._rotation % 360;
        if (rot > 180) rot = rot - 360;
        else if (rot < -180) rot = 360 + rot;
        return rot;
    }

    public get alpha(): number {
        return this._alpha;
    }

    public set alpha(value: number) {
        if (this._alpha !== value) {
            this._alpha = value;
            this.handleAlphaChanged();
            this.updateGear(3);
        }
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.handleVisibleChanged();
            if (this._parent) {
                this._parent.setBoundsChangedFlag();
            }
            if (this._group?.excludeInvisibles) {
                this._group.setBoundsChangedFlag();
            }
        }
    }

    public get internalVisible(): boolean {
        return this._internalVisible && (!this._group || this._group.internalVisible);
    }

    public get internalVisible2(): boolean {
        return this._visible && (!this._group || this._group.internalVisible2);
    }

    public get internalVisible3(): boolean {
        return this._internalVisible && this._visible;
    }

    // Sorting | 排序

    public get sortingOrder(): number {
        return this._sortingOrder;
    }

    public set sortingOrder(value: number) {
        if (value < 0) value = 0;
        if (this._sortingOrder !== value) {
            const old = this._sortingOrder;
            this._sortingOrder = value;
            if (this._parent) {
                this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
            }
        }
    }

    // Focus | 焦点

    public get focused(): boolean {
        return this.root?.focus === this;
    }

    public requestFocus(): void {
        const root = this.root;
        if (root) {
            root.focus = this;
        }
    }

    // Tooltips | 提示

    public get tooltips(): string {
        return this._tooltips;
    }

    public set tooltips(value: string) {
        this._tooltips = value;
    }

    // Parent and Root | 父容器和根

    public get parent(): GComponent | null {
        return this._parent;
    }

    public get root(): GRoot | null {
        let p: GObject | null = this;
        while (p._parent) {
            p = p._parent;
        }
        return p as GRoot | null;
    }

    /**
     * Check if this object is on stage (has a root parent)
     * 检查此对象是否在舞台上（有根父容器）
     */
    public get onStage(): boolean {
        return this.root !== null;
    }

    public get displayObject(): DisplayObject | null {
        return this._displayObject;
    }

    /**
     * Remove this object from its parent
     * 从父容器移除
     */
    public removeFromParent(): void {
        if (this._parent) {
            this._parent.removeChild(this);
        }
    }

    // Group | 组

    public get group(): GGroup | null {
        return this._group;
    }

    public set group(value: GGroup | null) {
        if (this._group !== value) {
            if (this._group) {
                this._group.setBoundsChangedFlag();
            }
            this._group = value;
            if (this._group) {
                this._group.setBoundsChangedFlag();
            }
        }
    }

    // Relations | 关联

    public get relations(): Relations {
        return this._relations;
    }

    /**
     * Add a relation to another object
     * 添加与另一对象的关联
     */
    public addRelation(target: GObject, relationType: ERelationType, bUsePercent: boolean = false): void {
        this._relations?.add(target, relationType, bUsePercent);
    }

    /**
     * Remove a relation
     * 移除关联
     */
    public removeRelation(target: GObject, relationType: ERelationType): void {
        this._relations?.remove(target, relationType);
    }

    // Gear | 齿轮

    public getGear(index: number): GearBase | null {
        return this._gears[index] || null;
    }

    protected updateGear(index: number): void {
        if (this._underConstruct || this._gearLocked) return;

        const gear = this._gears[index];
        if (gear?.controller) {
            gear.updateState();
        }
    }

    public checkGearController(index: number, c: Controller): boolean {
        return this._gears[index]?.controller === c;
    }

    public handleControllerChanged(c: Controller): void {
        this._handlingController = true;
        for (let i = 0; i < 10; i++) {
            const gear = this._gears[i];
            if (gear?.controller === c) {
                gear.apply();
            }
        }
        this._handlingController = false;
        this.checkGearDisplay();
    }

    protected checkGearDisplay(): void {
        if (this._handlingController) return;

        const connected = this._gears[0]?.connected;
        if (connected !== undefined) {
            if (this._internalVisible !== connected) {
                this._internalVisible = connected;
                if (this._parent) {
                    this._parent.childStateChanged(this);
                }
            }
        }
    }

    // Virtual text/icon properties | 虚拟文本/图标属性

    public get text(): string | null {
        return null;
    }

    public set text(_value: string) {
        // Override in subclasses
    }

    public get icon(): string | null {
        return null;
    }

    public set icon(_value: string) {
        // Override in subclasses
    }

    // Property access | 属性访问

    public getProp(index: EObjectPropID): any {
        switch (index) {
            case EObjectPropID.Text:
                return this.text;
            case EObjectPropID.Icon:
                return this.icon;
            case EObjectPropID.Color:
            case EObjectPropID.OutlineColor:
                return null;
            case EObjectPropID.Playing:
                return false;
            case EObjectPropID.Frame:
            case EObjectPropID.DeltaTime:
                return 0;
            case EObjectPropID.TimeScale:
                return 1;
            case EObjectPropID.FontSize:
                return 0;
            case EObjectPropID.Selected:
                return false;
            default:
                return undefined;
        }
    }

    public setProp(index: EObjectPropID, value: any): void {
        switch (index) {
            case EObjectPropID.Text:
                this.text = value;
                break;
            case EObjectPropID.Icon:
                this.icon = value;
                break;
        }
    }

    // Coordinate conversion | 坐标转换

    /**
     * Convert local point to global
     * 本地坐标转全局坐标
     */
    public localToGlobal(ax: number = 0, ay: number = 0, outPoint?: Point): Point {
        if (this._pivotAsAnchor) {
            ax += this._pivotX * this._width;
            ay += this._pivotY * this._height;
        }

        outPoint = outPoint || new Point();
        outPoint.x = ax;
        outPoint.y = ay;

        if (this._displayObject) {
            return this._displayObject.localToGlobal(outPoint, outPoint);
        }

        return outPoint;
    }

    /**
     * Convert global point to local
     * 全局坐标转本地坐标
     */
    public globalToLocal(ax: number = 0, ay: number = 0, outPoint?: Point): Point {
        outPoint = outPoint || new Point();
        outPoint.x = ax;
        outPoint.y = ay;

        if (this._displayObject) {
            this._displayObject.globalToLocal(outPoint, outPoint);
        }

        if (this._pivotAsAnchor) {
            outPoint.x -= this._pivotX * this._width;
            outPoint.y -= this._pivotY * this._height;
        }

        return outPoint;
    }

    /**
     * Convert local rect to global
     * 本地矩形转全局矩形
     */
    public localToGlobalRect(
        ax: number = 0,
        ay: number = 0,
        aw: number = 0,
        ah: number = 0,
        outRect?: Rectangle
    ): Rectangle {
        outRect = outRect || new Rectangle();
        const pt = this.localToGlobal(ax, ay);
        outRect.x = pt.x;
        outRect.y = pt.y;
        const pt2 = this.localToGlobal(ax + aw, ay + ah);
        outRect.width = pt2.x - outRect.x;
        outRect.height = pt2.y - outRect.y;
        return outRect;
    }

    /**
     * Convert global rect to local
     * 全局矩形转本地矩形
     */
    public globalToLocalRect(
        ax: number = 0,
        ay: number = 0,
        aw: number = 0,
        ah: number = 0,
        outRect?: Rectangle
    ): Rectangle {
        outRect = outRect || new Rectangle();
        const pt = this.globalToLocal(ax, ay);
        outRect.x = pt.x;
        outRect.y = pt.y;
        const pt2 = this.globalToLocal(ax + aw, ay + ah);
        outRect.width = pt2.x - outRect.x;
        outRect.height = pt2.y - outRect.y;
        return outRect;
    }

    // Disposal | 销毁

    public get isDisposed(): boolean {
        return this._displayObject === null;
    }

    public dispose(): void {
        this.removeFromParent();
        this._relations?.dispose();
        if (this._displayObject) {
            this._displayObject.dispose();
            this._displayObject = null;
        }
        for (let i = 0; i < 10; i++) {
            const gear = this._gears[i];
            if (gear) {
                gear.dispose();
            }
        }
        super.dispose();
    }

    // Display object creation | 显示对象创建

    protected createDisplayObject(): void {
        // Override in subclasses to create specific display object
    }

    // Handle property changes | 处理属性变化

    protected handleXYChanged(): void {
        let xv = this._x;
        let yv = this._y + this._yOffset;

        if (this._pivotAsAnchor) {
            xv -= this._pivotX * this._width;
            yv -= this._pivotY * this._height;
        }

        if (this._pixelSnapping) {
            xv = Math.round(xv);
            yv = Math.round(yv);
        }

        if (this._displayObject) {
            this._displayObject.setPosition(xv + this._pivotOffsetX, yv + this._pivotOffsetY);
        }
    }

    protected handleSizeChanged(): void {
        if (this._displayObject) {
            this._displayObject.setSize(this._width, this._height);
        }
    }

    protected handleScaleChanged(): void {
        if (this._displayObject) {
            this._displayObject.setScale(this._scaleX, this._scaleY);
        }
    }

    protected handleSkewChanged(): void {
        if (this._displayObject) {
            this._displayObject.skewX = this._skewX;
            this._displayObject.skewY = this._skewY;
        }
    }

    protected handleRotationChanged(): void {
        if (this._displayObject) {
            this._displayObject.rotation = this.normalizeRotation;
        }
    }

    protected handleGrayedChanged(): void {
        if (this._displayObject) {
            this._displayObject.grayed = this._grayed;
        }
    }

    protected handleAlphaChanged(): void {
        if (this._displayObject) {
            this._displayObject.alpha = this._alpha;
        }
    }

    protected handleVisibleChanged(): void {
        if (this._displayObject) {
            this._displayObject.visible = this.internalVisible2;
        }
    }

    // Construction from resource | 从资源构建

    public constructFromResource(): void {
        // Override in subclasses
    }

    /**
     * Setup before adding to parent
     * 添加到父容器之前的设置
     */
    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        buffer.seek(beginPos, 0);
        buffer.skip(5); // skip type, src, pkgId

        this._id = buffer.readS() || this._id;
        this._name = buffer.readS() || '';

        let f1: number;
        let f2: number;

        f1 = buffer.getInt32();
        f2 = buffer.getInt32();
        this.setXY(f1, f2);

        if (buffer.readBool()) {
            this.initWidth = buffer.getInt32();
            this.initHeight = buffer.getInt32();
            this.setSize(this.initWidth, this.initHeight, true);
        }

        if (buffer.readBool()) {
            this.minWidth = buffer.getInt32();
            this.maxWidth = buffer.getInt32();
            this.minHeight = buffer.getInt32();
            this.maxHeight = buffer.getInt32();
        }

        if (buffer.readBool()) {
            f1 = buffer.getFloat32();
            f2 = buffer.getFloat32();
            this.setScale(f1, f2);
        }

        if (buffer.readBool()) {
            f1 = buffer.getFloat32();
            f2 = buffer.getFloat32();
            this.setSkew(f1, f2);
        }

        if (buffer.readBool()) {
            f1 = buffer.getFloat32();
            f2 = buffer.getFloat32();
            this.setPivot(f1, f2, buffer.readBool());
        }

        f1 = buffer.getFloat32();
        if (f1 !== 1) {
            this.alpha = f1;
        }

        f1 = buffer.getFloat32();
        if (f1 !== 0) {
            this.rotation = f1;
        }

        if (!buffer.readBool()) {
            this.visible = false;
        }
        if (!buffer.readBool()) {
            this.touchable = false;
        }
        if (buffer.readBool()) {
            this.grayed = true;
        }

        // BlendMode
        buffer.readByte();

        // Filter
        const filter = buffer.readByte();
        if (filter === 1) {
            // Color filter - skip 4 floats
            buffer.skip(16);
        }

        const str = buffer.readS();
        if (str) {
            this.data = str;
        }
    }

    /**
     * Setup after adding to parent
     * 添加到父容器之后的设置
     */
    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        buffer.seek(beginPos, 1);

        const str = buffer.readS();
        if (str) {
            this.tooltips = str;
        }

        const groupId = buffer.getInt16();
        if (groupId >= 0 && this._parent) {
            this.group = this._parent.getChildAt(groupId) as GGroup;
        }

        buffer.seek(beginPos, 2);

        const cnt = buffer.getInt16();
        for (let i = 0; i < cnt; i++) {
            let nextPos = buffer.getInt16();
            nextPos += buffer.pos;

            const gearIndex = buffer.readByte();
            const gear = this.getGear(gearIndex);
            if (gear) {
                gear.setup(buffer);
            }

            buffer.pos = nextPos;
        }
    }

    // Render data collection | 渲染数据收集

    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible || !this._displayObject) return;
        this._displayObject.collectRenderData(collector);
    }
}

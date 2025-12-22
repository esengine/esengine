import { GComponent } from '../core/GComponent';
import { GObject } from '../core/GObject';
import { Controller } from '../core/Controller';
import { GTextField } from './GTextField';
import { FGUIEvents } from '../events/Events';
import { EButtonMode, EObjectPropID } from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * GButton
 *
 * Button component with states: up, down, over, selected, disabled.
 *
 * 按钮组件，支持状态：正常、按下、悬停、选中、禁用
 */
export class GButton extends GComponent {
    protected _titleObject: GObject | null = null;
    protected _iconObject: GObject | null = null;

    private _mode: EButtonMode = EButtonMode.Common;
    private _selected: boolean = false;
    private _title: string = '';
    private _selectedTitle: string = '';
    private _icon: string = '';
    private _selectedIcon: string = '';
    private _sound: string = '';
    private _soundVolumeScale: number = 1;
    private _buttonController: Controller | null = null;
    private _relatedController: Controller | null = null;
    private _relatedPageId: string = '';
    private _changeStateOnClick: boolean = true;
    private _linkedPopup: GObject | null = null;
    private _downEffect: number = 0;
    private _downEffectValue: number = 0.8;
    private _downScaled: boolean = false;

    private _down: boolean = false;
    private _over: boolean = false;

    public static readonly UP: string = 'up';
    public static readonly DOWN: string = 'down';
    public static readonly OVER: string = 'over';
    public static readonly SELECTED_OVER: string = 'selectedOver';
    public static readonly DISABLED: string = 'disabled';
    public static readonly SELECTED_DISABLED: string = 'selectedDisabled';

    constructor() {
        super();
    }

    /**
     * Get/set icon URL
     * 获取/设置图标 URL
     */
    public get icon(): string {
        return this._icon;
    }

    public set icon(value: string) {
        this._icon = value;
        const v = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
        if (this._iconObject) {
            this._iconObject.icon = v;
        }
        this.updateGear(7);
    }

    /**
     * Get/set selected icon URL
     * 获取/设置选中图标 URL
     */
    public get selectedIcon(): string {
        return this._selectedIcon;
    }

    public set selectedIcon(value: string) {
        this._selectedIcon = value;
        const v = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
        if (this._iconObject) {
            this._iconObject.icon = v;
        }
    }

    /**
     * Get/set title text
     * 获取/设置标题文本
     */
    public get title(): string {
        return this._title;
    }

    public set title(value: string) {
        this._title = value;
        if (this._titleObject) {
            this._titleObject.text =
                this._selected && this._selectedTitle ? this._selectedTitle : this._title;
        }
        this.updateGear(6);
    }

    /**
     * Get/set text (alias for title)
     * 获取/设置文本（title 的别名）
     */
    public get text(): string {
        return this.title;
    }

    public set text(value: string) {
        this.title = value;
    }

    /**
     * Get/set selected title text
     * 获取/设置选中标题文本
     */
    public get selectedTitle(): string {
        return this._selectedTitle;
    }

    public set selectedTitle(value: string) {
        this._selectedTitle = value;
        if (this._titleObject) {
            this._titleObject.text =
                this._selected && this._selectedTitle ? this._selectedTitle : this._title;
        }
    }

    /**
     * Get/set title color
     * 获取/设置标题颜色
     */
    public get titleColor(): string {
        const tf = this.getTextField();
        if (tf) {
            return tf.color;
        }
        return '#000000';
    }

    public set titleColor(value: string) {
        const tf = this.getTextField();
        if (tf) {
            tf.color = value;
        }
        this.updateGear(4);
    }

    /**
     * Get/set title font size
     * 获取/设置标题字体大小
     */
    public get titleFontSize(): number {
        const tf = this.getTextField();
        if (tf) {
            return tf.fontSize;
        }
        return 0;
    }

    public set titleFontSize(value: number) {
        const tf = this.getTextField();
        if (tf) {
            tf.fontSize = value;
        }
    }

    /**
     * Get/set sound URL
     * 获取/设置声音 URL
     */
    public get sound(): string {
        return this._sound;
    }

    public set sound(value: string) {
        this._sound = value;
    }

    /**
     * Get/set sound volume scale
     * 获取/设置声音音量缩放
     */
    public get soundVolumeScale(): number {
        return this._soundVolumeScale;
    }

    public set soundVolumeScale(value: number) {
        this._soundVolumeScale = value;
    }

    /**
     * Get/set selected state
     * 获取/设置选中状态
     */
    public get selected(): boolean {
        return this._selected;
    }

    public set selected(value: boolean) {
        if (this._mode === EButtonMode.Common) {
            return;
        }

        if (this._selected !== value) {
            this._selected = value;
            if (
                this.grayed &&
                this._buttonController &&
                this._buttonController.hasPage(GButton.DISABLED)
            ) {
                if (this._selected) {
                    this.setState(GButton.SELECTED_DISABLED);
                } else {
                    this.setState(GButton.DISABLED);
                }
            } else {
                if (this._selected) {
                    this.setState(this._over ? GButton.SELECTED_OVER : GButton.DOWN);
                } else {
                    this.setState(this._over ? GButton.OVER : GButton.UP);
                }
            }
            if (this._selectedTitle && this._titleObject) {
                this._titleObject.text = this._selected ? this._selectedTitle : this._title;
            }
            if (this._selectedIcon) {
                const str = this._selected ? this._selectedIcon : this._icon;
                if (this._iconObject) {
                    this._iconObject.icon = str;
                }
            }
            if (
                this._relatedController &&
                this._parent &&
                !this._parent._buildingDisplayList
            ) {
                if (this._selected) {
                    this._relatedController.selectedPageId = this._relatedPageId;
                } else if (
                    this._mode === EButtonMode.Check &&
                    this._relatedController.selectedPageId === this._relatedPageId
                ) {
                    // Deselect if in check mode
                }
            }
        }
    }

    /**
     * Get/set button mode
     * 获取/设置按钮模式
     */
    public get mode(): EButtonMode {
        return this._mode;
    }

    public set mode(value: EButtonMode) {
        if (this._mode !== value) {
            if (value === EButtonMode.Common) {
                this.selected = false;
            }
            this._mode = value;
        }
    }

    /**
     * Get/set related controller
     * 获取/设置关联控制器
     */
    public get relatedController(): Controller | null {
        return this._relatedController;
    }

    public set relatedController(value: Controller | null) {
        if (value !== this._relatedController) {
            this._relatedController = value;
            this._relatedPageId = '';
        }
    }

    /**
     * Get/set related page ID
     * 获取/设置关联页面 ID
     */
    public get relatedPageId(): string {
        return this._relatedPageId;
    }

    public set relatedPageId(value: string) {
        this._relatedPageId = value;
    }

    /**
     * Get/set change state on click
     * 获取/设置点击时是否改变状态
     */
    public get changeStateOnClick(): boolean {
        return this._changeStateOnClick;
    }

    public set changeStateOnClick(value: boolean) {
        this._changeStateOnClick = value;
    }

    /**
     * Get/set linked popup
     * 获取/设置关联弹出窗口
     */
    public get linkedPopup(): GObject | null {
        return this._linkedPopup;
    }

    public set linkedPopup(value: GObject | null) {
        this._linkedPopup = value;
    }

    /**
     * Get text field from title object
     * 从标题对象获取文本字段
     */
    public getTextField(): GTextField | null {
        if (this._titleObject instanceof GTextField) {
            return this._titleObject;
        } else if (this._titleObject instanceof GButton) {
            return this._titleObject.getTextField();
        }
        return null;
    }

    /**
     * Fire a click event programmatically
     * 程序化触发点击事件
     */
    public fireClick(bDownEffect: boolean = true): void {
        if (bDownEffect && this._mode === EButtonMode.Common) {
            this.setState(GButton.OVER);
            setTimeout(() => this.setState(GButton.DOWN), 100);
            setTimeout(() => this.setState(GButton.UP), 200);
        }
        this.handleClick();
    }

    /**
     * Set button state
     * 设置按钮状态
     */
    protected setState(value: string): void {
        if (this._buttonController) {
            this._buttonController.selectedPage = value;
        }

        if (this._downEffect === 1) {
            const cnt = this.numChildren;
            if (
                value === GButton.DOWN ||
                value === GButton.SELECTED_OVER ||
                value === GButton.SELECTED_DISABLED
            ) {
                const r = Math.round(this._downEffectValue * 255);
                const color = '#' + ((r << 16) + (r << 8) + r).toString(16).padStart(6, '0');
                for (let i = 0; i < cnt; i++) {
                    const obj = this.getChildAt(i);
                    if (!(obj instanceof GTextField)) {
                        obj.setProp(EObjectPropID.Color, color);
                    }
                }
            } else {
                for (let i = 0; i < cnt; i++) {
                    const obj = this.getChildAt(i);
                    if (!(obj instanceof GTextField)) {
                        obj.setProp(EObjectPropID.Color, '#FFFFFF');
                    }
                }
            }
        } else if (this._downEffect === 2) {
            if (
                value === GButton.DOWN ||
                value === GButton.SELECTED_OVER ||
                value === GButton.SELECTED_DISABLED
            ) {
                if (!this._downScaled) {
                    this.setScale(
                        this.scaleX * this._downEffectValue,
                        this.scaleY * this._downEffectValue
                    );
                    this._downScaled = true;
                }
            } else {
                if (this._downScaled) {
                    this.setScale(
                        this.scaleX / this._downEffectValue,
                        this.scaleY / this._downEffectValue
                    );
                    this._downScaled = false;
                }
            }
        }
    }

    public handleControllerChanged(c: Controller): void {
        super.handleControllerChanged(c);

        if (this._relatedController === c) {
            this.selected = this._relatedPageId === c.selectedPageId;
        }
    }

    protected handleGrayedChanged(): void {
        if (
            this._buttonController &&
            this._buttonController.hasPage(GButton.DISABLED)
        ) {
            if (this.grayed) {
                if (
                    this._selected &&
                    this._buttonController.hasPage(GButton.SELECTED_DISABLED)
                ) {
                    this.setState(GButton.SELECTED_DISABLED);
                } else {
                    this.setState(GButton.DISABLED);
                }
            } else if (this._selected) {
                this.setState(GButton.DOWN);
            } else {
                this.setState(GButton.UP);
            }
        } else {
            super.handleGrayedChanged();
        }
    }

    public getProp(index: number): any {
        switch (index) {
            case EObjectPropID.Color:
                return this.titleColor;
            case EObjectPropID.OutlineColor:
                const tf = this.getTextField();
                if (tf) {
                    return tf.strokeColor;
                }
                return '#000000';
            case EObjectPropID.FontSize:
                return this.titleFontSize;
            case EObjectPropID.Selected:
                return this.selected;
            default:
                return super.getProp(index);
        }
    }

    public setProp(index: number, value: any): void {
        switch (index) {
            case EObjectPropID.Color:
                this.titleColor = value;
                break;
            case EObjectPropID.OutlineColor:
                const tf = this.getTextField();
                if (tf) {
                    tf.strokeColor = value;
                }
                break;
            case EObjectPropID.FontSize:
                this.titleFontSize = value;
                break;
            case EObjectPropID.Selected:
                this.selected = value;
                break;
            default:
                super.setProp(index, value);
                break;
        }
    }

    protected constructExtension(buffer: ByteBuffer): void {
        buffer.seek(0, 6);

        this._mode = buffer.readByte();
        const str = buffer.readS();
        if (str) {
            this._sound = str;
        }
        this._soundVolumeScale = buffer.getFloat32();
        this._downEffect = buffer.readByte();
        this._downEffectValue = buffer.getFloat32();
        if (this._downEffect === 2) {
            this.setPivot(0.5, 0.5, this.pivotAsAnchor);
        }

        this._buttonController = this.getController('button');
        this._titleObject = this.getChild('title');
        this._iconObject = this.getChild('icon');
        if (this._titleObject) {
            this._title = this._titleObject.text || '';
        }
        if (this._iconObject) {
            this._icon = this._iconObject.icon || '';
        }

        if (this._mode === EButtonMode.Common) {
            this.setState(GButton.UP);
        }

        this.on(FGUIEvents.ROLL_OVER, this.handleRollOver, this);
        this.on(FGUIEvents.ROLL_OUT, this.handleRollOut, this);
        this.on(FGUIEvents.TOUCH_BEGIN, this.handleTouchBegin, this);
        this.on(FGUIEvents.CLICK, this.handleClick, this);
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);

        if (!buffer.seek(beginPos, 6)) {
            return;
        }

        if (buffer.readByte() !== this.packageItem?.objectType) {
            return;
        }

        let str = buffer.readS();
        if (str) {
            this.title = str;
        }
        str = buffer.readS();
        if (str) {
            this.selectedTitle = str;
        }
        str = buffer.readS();
        if (str) {
            this.icon = str;
        }
        str = buffer.readS();
        if (str) {
            this.selectedIcon = str;
        }
        if (buffer.readBool()) {
            this.titleColor = buffer.readS();
        }
        const iv = buffer.getInt32();
        if (iv !== 0) {
            this.titleFontSize = iv;
        }
        const controllerIndex = buffer.getInt16();
        if (controllerIndex >= 0 && this.parent) {
            this._relatedController = this.parent.getControllerAt(controllerIndex);
        }
        this._relatedPageId = buffer.readS();

        str = buffer.readS();
        if (str) {
            this._sound = str;
        }
        if (buffer.readBool()) {
            this._soundVolumeScale = buffer.getFloat32();
        }

        this.selected = buffer.readBool();
    }

    private handleRollOver(): void {
        if (
            !this._buttonController ||
            !this._buttonController.hasPage(GButton.OVER)
        ) {
            return;
        }

        this._over = true;
        if (this._down) {
            return;
        }

        if (this.grayed && this._buttonController.hasPage(GButton.DISABLED)) {
            return;
        }

        this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
    }

    private handleRollOut(): void {
        if (
            !this._buttonController ||
            !this._buttonController.hasPage(GButton.OVER)
        ) {
            return;
        }

        this._over = false;
        if (this._down) {
            return;
        }

        if (this.grayed && this._buttonController.hasPage(GButton.DISABLED)) {
            return;
        }

        this.setState(this._selected ? GButton.DOWN : GButton.UP);
    }

    private handleTouchBegin(): void {
        this._down = true;

        if (this._mode === EButtonMode.Common) {
            if (
                this.grayed &&
                this._buttonController &&
                this._buttonController.hasPage(GButton.DISABLED)
            ) {
                this.setState(GButton.SELECTED_DISABLED);
            } else {
                this.setState(GButton.DOWN);
            }
        }

        // Listen for touch end globally
        this.root?.on(FGUIEvents.TOUCH_END, this.handleTouchEnd, this);
    }

    private handleTouchEnd(): void {
        if (this._down) {
            this.root?.off(FGUIEvents.TOUCH_END, this.handleTouchEnd, this);
            this._down = false;

            if (!this._displayObject) {
                return;
            }

            if (this._mode === EButtonMode.Common) {
                if (
                    this.grayed &&
                    this._buttonController &&
                    this._buttonController.hasPage(GButton.DISABLED)
                ) {
                    this.setState(GButton.DISABLED);
                } else if (this._over) {
                    this.setState(GButton.OVER);
                } else {
                    this.setState(GButton.UP);
                }
            }
        }
    }

    private handleClick(): void {
        if (this._mode === EButtonMode.Check) {
            if (this._changeStateOnClick) {
                this.selected = !this._selected;
                this.emit(FGUIEvents.STATE_CHANGED);
            }
        } else if (this._mode === EButtonMode.Radio) {
            if (this._changeStateOnClick && !this._selected) {
                this.selected = true;
                this.emit(FGUIEvents.STATE_CHANGED);
            }
        } else {
            if (this._relatedController) {
                this._relatedController.selectedPageId = this._relatedPageId;
            }
        }
    }
}

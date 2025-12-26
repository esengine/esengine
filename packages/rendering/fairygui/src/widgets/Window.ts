import { GComponent } from '../core/GComponent';
import { GObject } from '../core/GObject';
import { GRoot } from '../core/GRoot';
import { GGraph } from './GGraph';
import { getUIConfig } from '../core/UIConfig';
import { UIPackage } from '../package/UIPackage';
import { ERelationType } from '../core/FieldTypes';
import { FGUIEvents } from '../events/Events';
import { Point } from '../utils/MathTypes';

/**
 * IUISource
 *
 * Interface for dynamic UI loading sources
 * 动态 UI 加载源接口
 */
export interface IUISource {
    /** Source file name | 源文件名 */
    fileName: string;

    /** Whether the source is loaded | 是否已加载 */
    loaded: boolean;

    /**
     * Load the source
     * 加载源
     */
    load(callback: () => void, thisObj: any): void;
}

/**
 * Window
 *
 * Base class for popup windows with modal support.
 *
 * 弹窗基类，支持模态窗口
 *
 * Features:
 * - Content pane management
 * - Modal wait indicator
 * - Draggable title bar
 * - Close button binding
 * - Bring to front on click
 *
 * @example
 * ```typescript
 * class MyWindow extends Window {
 *     constructor() {
 *         super();
 *         this.contentPane = UIPackage.createObject('pkg', 'MyWindowContent') as GComponent;
 *     }
 *
 *     protected onInit(): void {
 *         // Initialize window
 *     }
 *
 *     protected onShown(): void {
 *         // Window is shown
 *     }
 *
 *     protected onHide(): void {
 *         // Window is hidden
 *     }
 * }
 *
 * const win = new MyWindow();
 * win.show();
 * ```
 */
export class Window extends GComponent {
    /** Bring window to front when clicked | 点击时将窗口置顶 */
    public bringToFrontOnClick: boolean;

    protected _requestingCmd: number = 0;

    private _contentPane: GComponent | null = null;
    private _modalWaitPane: GObject | null = null;
    private _closeButton: GObject | null = null;
    private _dragArea: GObject | null = null;
    private _contentArea: GObject | null = null;
    private _frame: GComponent | null = null;
    private _modal: boolean = false;

    private _uiSources: IUISource[] = [];
    private _inited: boolean = false;
    private _loading: boolean = false;

    constructor() {
        super();

        this.bringToFrontOnClick = getUIConfig('bringWindowToFrontOnClick');

        this.on(FGUIEvents.DISPLAY, this.onWindowShown, this);
        this.on(FGUIEvents.REMOVED_FROM_STAGE, this.onWindowHidden, this);
        this.on(FGUIEvents.TOUCH_BEGIN, this.onMouseDown, this);
    }

    /**
     * Add UI source for lazy loading
     * 添加用于懒加载的 UI 源
     */
    public addUISource(source: IUISource): void {
        this._uiSources.push(source);
    }

    /**
     * Get content pane
     * 获取内容面板
     */
    public get contentPane(): GComponent | null {
        return this._contentPane;
    }

    /**
     * Set content pane
     * 设置内容面板
     */
    public set contentPane(value: GComponent | null) {
        if (this._contentPane !== value) {
            if (this._contentPane) {
                this.removeChild(this._contentPane);
            }

            this._contentPane = value;

            if (this._contentPane) {
                this.addChild(this._contentPane);
                this.setSize(this._contentPane.width, this._contentPane.height);
                this._contentPane.relations.add(this, ERelationType.Size);

                this._frame = this._contentPane.getChild('frame') as GComponent | null;
                if (this._frame) {
                    this.closeButton = this._frame.getChild('closeButton');
                    this.dragArea = this._frame.getChild('dragArea');
                    this.contentArea = this._frame.getChild('contentArea');
                }
            }
        }
    }

    /**
     * Get frame component
     * 获取框架组件
     */
    public get frame(): GComponent | null {
        return this._frame;
    }

    /**
     * Get close button
     * 获取关闭按钮
     */
    public get closeButton(): GObject | null {
        return this._closeButton;
    }

    /**
     * Set close button
     * 设置关闭按钮
     */
    public set closeButton(value: GObject | null) {
        if (this._closeButton) {
            this._closeButton.off(FGUIEvents.CLICK, this.closeEventHandler, this);
        }
        this._closeButton = value;
        if (this._closeButton) {
            this._closeButton.on(FGUIEvents.CLICK, this.closeEventHandler, this);
        }
    }

    /**
     * Get drag area
     * 获取拖拽区域
     */
    public get dragArea(): GObject | null {
        return this._dragArea;
    }

    /**
     * Set drag area
     * 设置拖拽区域
     */
    public set dragArea(value: GObject | null) {
        if (this._dragArea !== value) {
            if (this._dragArea) {
                this._dragArea.draggable = false;
                this._dragArea.off(FGUIEvents.DRAG_START, this.onDragStart, this);
            }

            this._dragArea = value;

            if (this._dragArea) {
                if (this._dragArea instanceof GGraph) {
                    this._dragArea.drawRect(0, 'transparent', 'transparent');
                }
                this._dragArea.draggable = true;
                this._dragArea.on(FGUIEvents.DRAG_START, this.onDragStart, this);
            }
        }
    }

    /**
     * Get content area
     * 获取内容区域
     */
    public get contentArea(): GObject | null {
        return this._contentArea;
    }

    /**
     * Set content area
     * 设置内容区域
     */
    public set contentArea(value: GObject | null) {
        this._contentArea = value;
    }

    /**
     * Show window on default GRoot
     * 在默认 GRoot 上显示窗口
     */
    public show(): void {
        GRoot.inst.showWindow(this);
    }

    /**
     * Show window on specified GRoot
     * 在指定 GRoot 上显示窗口
     */
    public showOn(root: GRoot): void {
        root.showWindow(this);
    }

    /**
     * Hide window with animation
     * 隐藏窗口（带动画）
     */
    public hide(): void {
        if (this.isShowing) {
            this.doHideAnimation();
        }
    }

    /**
     * Hide window immediately
     * 立即隐藏窗口
     */
    public hideImmediately(): void {
        const r = this.parent instanceof GRoot ? this.parent : GRoot.inst;
        r.hideWindowImmediately(this);
    }

    /**
     * Center window on GRoot
     * 在 GRoot 上居中窗口
     */
    public centerOn(r: GRoot, bRestraint?: boolean): void {
        this.setXY(
            Math.round((r.width - this.width) / 2),
            Math.round((r.height - this.height) / 2)
        );

        if (bRestraint) {
            this.relations.add(r, ERelationType.CenterCenter);
            this.relations.add(r, ERelationType.MiddleMiddle);
        }
    }

    /**
     * Toggle window visibility
     * 切换窗口可见性
     */
    public toggleStatus(): void {
        if (this.isTop) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Check if window is showing
     * 检查窗口是否正在显示
     */
    public get isShowing(): boolean {
        return this.parent !== null;
    }

    /**
     * Check if window is on top
     * 检查窗口是否在最上层
     */
    public get isTop(): boolean {
        return (
            this.parent !== null &&
            this.parent.getChildIndex(this) === this.parent.numChildren - 1
        );
    }

    /**
     * Get modal state
     * 获取模态状态
     */
    public get modal(): boolean {
        return this._modal;
    }

    /**
     * Set modal state
     * 设置模态状态
     */
    public set modal(value: boolean) {
        this._modal = value;
    }

    /**
     * Bring window to front
     * 将窗口置于最前
     */
    public bringToFront(): void {
        this.root?.bringToFront(this);
    }

    /**
     * Show modal wait indicator
     * 显示模态等待指示器
     */
    public showModalWait(requestingCmd?: number): void {
        if (requestingCmd !== undefined) {
            this._requestingCmd = requestingCmd;
        }

        const modalWaitingUrl = getUIConfig('windowModalWaiting');
        if (modalWaitingUrl) {
            if (!this._modalWaitPane) {
                this._modalWaitPane = UIPackage.createObjectFromURL(modalWaitingUrl);
            }

            if (this._modalWaitPane) {
                this.layoutModalWaitPane();
                this.addChild(this._modalWaitPane);
            }
        }
    }

    /**
     * Layout modal wait pane
     * 布局模态等待面板
     */
    protected layoutModalWaitPane(): void {
        if (!this._modalWaitPane) return;

        if (this._contentArea && this._frame) {
            const pt = this._frame.localToGlobal(0, 0);
            const localPt = this.globalToLocal(pt.x, pt.y);
            this._modalWaitPane.setXY(
                localPt.x + this._contentArea.x,
                localPt.y + this._contentArea.y
            );
            this._modalWaitPane.setSize(this._contentArea.width, this._contentArea.height);
        } else {
            this._modalWaitPane.setSize(this.width, this.height);
        }
    }

    /**
     * Close modal wait indicator
     * 关闭模态等待指示器
     */
    public closeModalWait(requestingCmd?: number): boolean {
        if (requestingCmd !== undefined) {
            if (this._requestingCmd !== requestingCmd) {
                return false;
            }
        }

        this._requestingCmd = 0;

        if (this._modalWaitPane?.parent) {
            this.removeChild(this._modalWaitPane);
        }

        return true;
    }

    /**
     * Check if modal waiting
     * 检查是否正在模态等待
     */
    public get modalWaiting(): boolean {
        return this._modalWaitPane?.parent !== null && this._modalWaitPane?.parent !== undefined;
    }

    /**
     * Initialize window
     * 初始化窗口
     */
    public init(): void {
        if (this._inited || this._loading) {
            return;
        }

        if (this._uiSources.length > 0) {
            this._loading = false;

            for (const source of this._uiSources) {
                if (!source.loaded) {
                    source.load(this.onUILoadComplete.bind(this), this);
                    this._loading = true;
                }
            }

            if (!this._loading) {
                this.doInit();
            }
        } else {
            this.doInit();
        }
    }

    /**
     * Called when window is initialized
     * 窗口初始化时调用
     */
    protected onInit(): void {
        // Override in subclass
    }

    /**
     * Called when window is shown
     * 窗口显示时调用
     */
    protected onShown(): void {
        // Override in subclass
    }

    /**
     * Called when window is hidden
     * 窗口隐藏时调用
     */
    protected onHide(): void {
        // Override in subclass
    }

    /**
     * Perform show animation
     * 执行显示动画
     */
    protected doShowAnimation(): void {
        this.onShown();
    }

    /**
     * Perform hide animation
     * 执行隐藏动画
     */
    protected doHideAnimation(): void {
        this.hideImmediately();
    }

    private onUILoadComplete(): void {
        for (const source of this._uiSources) {
            if (!source.loaded) {
                return;
            }
        }

        this._loading = false;
        this.doInit();
    }

    private doInit(): void {
        this._inited = true;
        this.onInit();

        if (this.isShowing) {
            this.doShowAnimation();
        }
    }

    public dispose(): void {
        if (this.parent) {
            this.hideImmediately();
        }

        super.dispose();
    }

    /**
     * Close button event handler
     * 关闭按钮事件处理
     */
    protected closeEventHandler(): void {
        this.hide();
    }

    private onWindowShown(): void {
        if (!this._inited) {
            this.init();
        } else {
            this.doShowAnimation();
        }
    }

    private onWindowHidden(): void {
        this.closeModalWait();
        this.onHide();
    }

    private onMouseDown(): void {
        if (this.isShowing && this.bringToFrontOnClick) {
            this.bringToFront();
        }
    }

    private onDragStart(): void {
        if (this._dragArea) {
            this._dragArea.stopDrag();
        }
        this.startDrag();
    }
}

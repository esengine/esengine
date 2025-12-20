/**
 * FairyGUI Event Types
 * FairyGUI 事件类型常量
 */
export const FGUIEvents = {
    /** Size changed | 尺寸改变 */
    SIZE_CHANGED: 'fguiSizeChanged',

    /** Position changed | 位置改变 */
    XY_CHANGED: 'fguiXYChanged',

    /** Click event | 点击事件 */
    CLICK: 'click',

    /** Touch/Mouse begin | 触摸/鼠标按下 */
    TOUCH_BEGIN: 'touchBegin',

    /** Touch/Mouse end | 触摸/鼠标抬起 */
    TOUCH_END: 'touchEnd',

    /** Touch/Mouse move | 触摸/鼠标移动 */
    TOUCH_MOVE: 'touchMove',

    /** Roll over (mouse enter) | 鼠标进入 */
    ROLL_OVER: 'rollOver',

    /** Roll out (mouse leave) | 鼠标离开 */
    ROLL_OUT: 'rollOut',

    /** Focus in | 获得焦点 */
    FOCUS_IN: 'focusIn',

    /** Focus out | 失去焦点 */
    FOCUS_OUT: 'focusOut',

    /** Added to stage | 添加到舞台 */
    ADDED_TO_STAGE: 'addedToStage',

    /** Removed from stage | 从舞台移除 */
    REMOVED_FROM_STAGE: 'removedFromStage',

    /** Display (added and visible) | 显示（添加并可见） */
    DISPLAY: 'display',

    /** Status changed (for Controller) | 状态改变（控制器） */
    STATUS_CHANGED: 'statusChanged',

    /** State changed (for Button/Slider) | 状态改变（按钮/滑块） */
    STATE_CHANGED: 'stateChanged',

    /** Pull down release (for list refresh) | 下拉刷新释放 */
    PULL_DOWN_RELEASE: 'pullDownRelease',

    /** Pull up release (for list load more) | 上拉加载释放 */
    PULL_UP_RELEASE: 'pullUpRelease',

    /** Scroll event | 滚动事件 */
    SCROLL: 'scroll',

    /** Scroll end | 滚动结束 */
    SCROLL_END: 'scrollEnd',

    /** Drag start | 拖拽开始 */
    DRAG_START: 'dragStart',

    /** Drag move | 拖拽移动 */
    DRAG_MOVE: 'dragMove',

    /** Drag end | 拖拽结束 */
    DRAG_END: 'dragEnd',

    /** Drop event | 放下事件 */
    DROP: 'drop',

    /** Text changed | 文本改变 */
    TEXT_CHANGED: 'textChanged',

    /** Text submitted (Enter key) | 文本提交（回车键） */
    TEXT_SUBMIT: 'textSubmit',

    /** Gear stop (animation complete) | 齿轮动画停止 */
    GEAR_STOP: 'gearStop',

    /** Link click (rich text) | 链接点击（富文本） */
    LINK: 'link',

    /** Play complete (MovieClip/Transition) | 播放完成 */
    PLAY_COMPLETE: 'playComplete',

    /** Click on list item | 列表项点击 */
    CLICK_ITEM: 'clickItem'
} as const;

/**
 * Input event data
 * 输入事件数据
 */
export interface IInputEventData {
    /** Touch/Pointer ID | 触摸/指针 ID */
    touchId: number;

    /** Stage X position | 舞台 X 坐标 */
    stageX: number;

    /** Stage Y position | 舞台 Y 坐标 */
    stageY: number;

    /** Button pressed (0=left, 1=middle, 2=right) | 按下的按钮 */
    button: number;

    /** Wheel delta | 滚轮增量 */
    wheelDelta: number;

    /** Is Ctrl key pressed | 是否按下 Ctrl */
    ctrlKey: boolean;

    /** Is Shift key pressed | 是否按下 Shift */
    shiftKey: boolean;

    /** Is Alt key pressed | 是否按下 Alt */
    altKey: boolean;

    /** Original DOM event | 原始 DOM 事件 */
    nativeEvent?: MouseEvent | TouchEvent | WheelEvent;
}

/**
 * Create default input event data
 * 创建默认输入事件数据
 */
export function createInputEventData(): IInputEventData {
    return {
        touchId: 0,
        stageX: 0,
        stageY: 0,
        button: 0,
        wheelDelta: 0,
        ctrlKey: false,
        shiftKey: false,
        altKey: false
    };
}

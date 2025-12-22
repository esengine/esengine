/**
 * FairyGUI Field Types
 * FairyGUI 字段类型定义
 */

/**
 * Button mode
 * 按钮模式
 */
export const enum EButtonMode {
    Common = 0,
    Check = 1,
    Radio = 2
}

/**
 * Auto size type
 * 自动尺寸类型
 */
export const enum EAutoSizeType {
    None = 0,
    Both = 1,
    Height = 2,
    Shrink = 3,
    Ellipsis = 4
}

/**
 * Align type
 * 水平对齐类型
 */
export const enum EAlignType {
    Left = 0,
    Center = 1,
    Right = 2
}

/**
 * Vertical align type
 * 垂直对齐类型
 */
export const enum EVertAlignType {
    Top = 0,
    Middle = 1,
    Bottom = 2
}

/**
 * Loader fill type
 * 加载器填充类型
 */
export const enum ELoaderFillType {
    None = 0,
    Scale = 1,
    ScaleMatchHeight = 2,
    ScaleMatchWidth = 3,
    ScaleFree = 4,
    ScaleNoBorder = 5
}

/**
 * List layout type
 * 列表布局类型
 */
export const enum EListLayoutType {
    SingleColumn = 0,
    SingleRow = 1,
    FlowHorizontal = 2,
    FlowVertical = 3,
    Pagination = 4
}

/**
 * List selection mode
 * 列表选择模式
 */
export const enum EListSelectionMode {
    Single = 0,
    Multiple = 1,
    MultipleSingleClick = 2,
    None = 3
}

/**
 * Overflow type
 * 溢出类型
 */
export const enum EOverflowType {
    Visible = 0,
    Hidden = 1,
    Scroll = 2
}

/**
 * Package item type
 * 包资源类型
 */
export const enum EPackageItemType {
    Image = 0,
    MovieClip = 1,
    Sound = 2,
    Component = 3,
    Atlas = 4,
    Font = 5,
    Swf = 6,
    Misc = 7,
    Unknown = 8,
    Spine = 9,
    DragonBones = 10
}

/**
 * Object type
 * 对象类型
 */
export const enum EObjectType {
    Image = 0,
    MovieClip = 1,
    Swf = 2,
    Graph = 3,
    Loader = 4,
    Group = 5,
    Text = 6,
    RichText = 7,
    InputText = 8,
    Component = 9,
    List = 10,
    Label = 11,
    Button = 12,
    ComboBox = 13,
    ProgressBar = 14,
    Slider = 15,
    ScrollBar = 16,
    Tree = 17,
    Loader3D = 18
}

/**
 * Progress title type
 * 进度条标题类型
 */
export const enum EProgressTitleType {
    Percent = 0,
    ValueAndMax = 1,
    Value = 2,
    Max = 3
}

/**
 * ScrollBar display type
 * 滚动条显示类型
 */
export const enum EScrollBarDisplayType {
    Default = 0,
    Visible = 1,
    Auto = 2,
    Hidden = 3
}

/**
 * Scroll type
 * 滚动类型
 */
export const enum EScrollType {
    Horizontal = 0,
    Vertical = 1,
    Both = 2
}

/**
 * Flip type
 * 翻转类型
 */
export const enum EFlipType {
    None = 0,
    Horizontal = 1,
    Vertical = 2,
    Both = 3
}

/**
 * Children render order
 * 子对象渲染顺序
 */
export const enum EChildrenRenderOrder {
    Ascent = 0,
    Descent = 1,
    Arch = 2
}

/**
 * Group layout type
 * 组布局类型
 */
export const enum EGroupLayoutType {
    None = 0,
    Horizontal = 1,
    Vertical = 2
}

/**
 * Popup direction
 * 弹出方向
 */
export const enum EPopupDirection {
    Auto = 0,
    Up = 1,
    Down = 2
}

/**
 * Relation type
 * 关联类型
 */
export const enum ERelationType {
    LeftLeft = 0,
    LeftCenter = 1,
    LeftRight = 2,
    CenterCenter = 3,
    RightLeft = 4,
    RightCenter = 5,
    RightRight = 6,

    TopTop = 7,
    TopMiddle = 8,
    TopBottom = 9,
    MiddleMiddle = 10,
    BottomTop = 11,
    BottomMiddle = 12,
    BottomBottom = 13,

    Width = 14,
    Height = 15,

    LeftExtLeft = 16,
    LeftExtRight = 17,
    RightExtLeft = 18,
    RightExtRight = 19,
    TopExtTop = 20,
    TopExtBottom = 21,
    BottomExtTop = 22,
    BottomExtBottom = 23,

    Size = 24
}

/**
 * Fill method
 * 填充方法
 */
export const enum EFillMethod {
    None = 0,
    Horizontal = 1,
    Vertical = 2,
    Radial90 = 3,
    Radial180 = 4,
    Radial360 = 5
}

/**
 * Fill origin
 * 填充起点
 */
export const enum EFillOrigin {
    Top = 0,
    Bottom = 1,
    Left = 2,
    Right = 3,

    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}

/**
 * Object property ID
 * 对象属性 ID
 */
export const enum EObjectPropID {
    Text = 0,
    Icon = 1,
    Color = 2,
    OutlineColor = 3,
    Playing = 4,
    Frame = 5,
    DeltaTime = 6,
    TimeScale = 7,
    FontSize = 8,
    Selected = 9
}

/**
 * Gear type
 * 齿轮类型
 */
export const enum EGearType {
    Display = 0,
    XY = 1,
    Size = 2,
    Look = 3,
    Color = 4,
    Animation = 5,
    Text = 6,
    Icon = 7,
    Display2 = 8,
    FontSize = 9
}

// EEaseType is re-exported from tween module
export { EEaseType } from '../tween/EaseType';

/**
 * Blend mode
 * 混合模式
 */
export const enum EBlendMode {
    Normal = 0,
    None = 1,
    Add = 2,
    Multiply = 3,
    Screen = 4,
    Erase = 5,
    Mask = 6,
    Below = 7,
    Off = 8,
    Custom1 = 9,
    Custom2 = 10,
    Custom3 = 11
}

/**
 * Transition action type
 * 过渡动作类型
 */
export const enum ETransitionActionType {
    XY = 0,
    Size = 1,
    Scale = 2,
    Pivot = 3,
    Alpha = 4,
    Rotation = 5,
    Color = 6,
    Animation = 7,
    Visible = 8,
    Sound = 9,
    Transition = 10,
    Shake = 11,
    ColorFilter = 12,
    Skew = 13,
    Text = 14,
    Icon = 15,
    Unknown = 16
}

/**
 * Graph type
 * 图形类型
 */
export const enum EGraphType {
    Empty = 0,
    Rect = 1,
    Ellipse = 2,
    Polygon = 3,
    RegularPolygon = 4
}

/**
 * UIConfig
 *
 * Global configuration for FairyGUI system.
 * Centralizes all configurable settings.
 *
 * FairyGUI 系统的全局配置，集中管理所有可配置项
 */
export const UIConfig = {
    /** Default font | 默认字体 */
    defaultFont: 'Arial',

    /** Default font size | 默认字体大小 */
    defaultFontSize: 14,

    /** Button sound URL | 按钮声音 URL */
    buttonSound: '',

    /** Button sound volume scale | 按钮声音音量 */
    buttonSoundVolumeScale: 1,

    /** Horizontal scrollbar resource | 水平滚动条资源 */
    horizontalScrollBar: '',

    /** Vertical scrollbar resource | 垂直滚动条资源 */
    verticalScrollBar: '',

    /** Default scroll step | 默认滚动步进 */
    defaultScrollStep: 25,

    /** Default touch scroll | 默认触摸滚动 */
    defaultTouchScroll: true,

    /** Default scroll bounce | 默认滚动回弹 */
    defaultScrollBounce: true,

    /** Default scroll bar display | 默认滚动条显示 */
    defaultScrollBarDisplay: 1,

    /** Touch drag sensitivity | 触摸拖拽灵敏度 */
    touchDragSensitivity: 10,

    /** Click drag sensitivity | 点击拖拽灵敏度 */
    clickDragSensitivity: 2,

    /** Allow softness on top | 允许顶部弹性 */
    allowSoftnessOnTopOrLeftSide: true,

    /** Global modal layer resource | 全局模态层资源 */
    modalLayerResource: '',

    /** Modal layer color | 模态层颜色 */
    modalLayerColor: 0x333333,

    /** Modal layer alpha | 模态层透明度 */
    modalLayerAlpha: 0.4,

    /** Popup close on click outside | 点击外部关闭弹窗 */
    popupCloseOnClickOutside: true,

    /** Branch for resource loading | 资源加载分支 */
    branch: '',

    /** Loading animation resource | 加载动画资源 */
    loadingAnimation: ''
} as const;

/**
 * Mutable config type for runtime changes
 * 可变配置类型用于运行时修改
 */
export type UIConfigType = {
    -readonly [K in keyof typeof UIConfig]: (typeof UIConfig)[K];
};

/** Runtime config instance | 运行时配置实例 */
const _runtimeConfig: UIConfigType = { ...UIConfig };

/**
 * Get current config value
 * 获取当前配置值
 */
export function getUIConfig<K extends keyof UIConfigType>(key: K): UIConfigType[K] {
    return _runtimeConfig[key];
}

/**
 * Set config value
 * 设置配置值
 */
export function setUIConfig<K extends keyof UIConfigType>(key: K, value: UIConfigType[K]): void {
    _runtimeConfig[key] = value;
}

/**
 * Reset config to defaults
 * 重置配置为默认值
 */
export function resetUIConfig(): void {
    Object.assign(_runtimeConfig, UIConfig);
}

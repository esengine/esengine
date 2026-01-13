/**
 * 交互模式配置管理器
 */
export declare class InteractiveConfig {
    private static instance;
    private interactiveMode;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): InteractiveConfig;
    /**
     * 设置交互模式
     */
    setInteractiveMode(enabled: boolean): void;
    /**
     * 检查是否启用交互模式
     */
    isInteractiveEnabled(): boolean;
    /**
     * 检查是否应该显示 banner
     */
    shouldDisplayBanner(): boolean;
    /**
     * 检查是否应该使用交互式组件
     */
    shouldUseInteractive(): boolean;
    /**
     * 检查是否应该使用加载动画
     */
    shouldUseSpinner(): boolean;
    /**
     * 检查是否应该使用进度条
     */
    shouldUseProgressBar(): boolean;
}
export declare const config: InteractiveConfig;

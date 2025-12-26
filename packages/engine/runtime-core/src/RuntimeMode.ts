/**
 * @zh 运行时模式枚举
 * @en Runtime mode enumeration
 *
 * @zh 定义游戏运行时的不同运行模式，每种模式有不同的系统启用策略
 * @en Defines different runtime modes with different system enabling strategies
 */
export enum RuntimeMode {
    /**
     * @zh 编辑器静态模式 - 场景编辑状态
     * @en Editor static mode - scene editing state
     *
     * @zh 特性：
     * - 所有游戏逻辑系统禁用（物理、行为树、动画）
     * - 显示编辑器 UI（Grid、Gizmo、坐标轴）
     * - 组件生命周期回调被延迟（onAwake/onStart 不触发）
     * - 输入系统禁用（避免与编辑器操作冲突）
     *
     * @en Features:
     * - All game logic systems disabled (physics, behavior tree, animation)
     * - Editor UI visible (grid, gizmos, axis indicator)
     * - Component lifecycle callbacks deferred (onAwake/onStart not triggered)
     * - Input system disabled (avoid conflict with editor operations)
     */
    EditorStatic = 'editor-static',

    /**
     * @zh 编辑器预览模式 - 在编辑器中播放游戏
     * @en Editor preview mode - play game within editor
     *
     * @zh 特性：
     * - 游戏逻辑系统启用（物理、行为树、动画）
     * - 可选显示 Gizmo（用于调试）
     * - 组件生命周期回调触发
     * - 输入系统可选启用
     * - 场景快照用于恢复
     *
     * @en Features:
     * - Game logic systems enabled (physics, behavior tree, animation)
     * - Gizmos optionally visible (for debugging)
     * - Component lifecycle callbacks triggered
     * - Input system optionally enabled
     * - Scene snapshot for restoration
     */
    EditorPreview = 'editor-preview',

    /**
     * @zh 独立运行模式 - Web/桌面/小程序完整运行
     * @en Standalone mode - full Web/desktop/mini-program runtime
     *
     * @zh 特性：
     * - 所有系统启用
     * - 无编辑器 UI
     * - 完整的输入处理
     * - 生产环境配置
     *
     * @en Features:
     * - All systems enabled
     * - No editor UI
     * - Full input handling
     * - Production configuration
     */
    Standalone = 'standalone'
}

/**
 * @zh 运行模式配置
 * @en Runtime mode configuration
 */
export interface RuntimeModeConfig {
    /**
     * @zh 是否启用物理系统
     * @en Whether to enable physics system
     */
    enablePhysics: boolean;

    /**
     * @zh 是否启用行为树系统
     * @en Whether to enable behavior tree system
     */
    enableBehaviorTree: boolean;

    /**
     * @zh 是否启用动画系统
     * @en Whether to enable animation system
     */
    enableAnimation: boolean;

    /**
     * @zh 是否启用输入系统
     * @en Whether to enable input system
     */
    enableInput: boolean;

    /**
     * @zh 是否显示网格
     * @en Whether to show grid
     */
    showGrid: boolean;

    /**
     * @zh 是否显示 Gizmo
     * @en Whether to show gizmos
     */
    showGizmos: boolean;

    /**
     * @zh 是否显示坐标轴指示器
     * @en Whether to show axis indicator
     */
    showAxisIndicator: boolean;

    /**
     * @zh 是否触发组件生命周期回调
     * @en Whether to trigger component lifecycle callbacks
     */
    triggerLifecycle: boolean;

    /**
     * @zh 是否为编辑器环境（影响资产加载等）
     * @en Whether in editor environment (affects asset loading, etc.)
     */
    isEditorEnvironment: boolean;
}

/**
 * @zh 获取指定模式的默认配置
 * @en Get default configuration for specified mode
 *
 * @param mode - @zh 运行模式 @en Runtime mode
 * @returns @zh 模式配置 @en Mode configuration
 */
export function getRuntimeModeConfig(mode: RuntimeMode): RuntimeModeConfig {
    switch (mode) {
        case RuntimeMode.EditorStatic:
            return {
                enablePhysics: false,
                enableBehaviorTree: false,
                enableAnimation: false,
                enableInput: false,
                showGrid: true,
                showGizmos: true,
                showAxisIndicator: true,
                triggerLifecycle: false,
                isEditorEnvironment: true
            };

        case RuntimeMode.EditorPreview:
            return {
                enablePhysics: true,
                enableBehaviorTree: true,
                enableAnimation: true,
                enableInput: true,
                showGrid: false,
                showGizmos: false, // 预览时默认隐藏，可通过设置开启
                showAxisIndicator: false,
                triggerLifecycle: true,
                isEditorEnvironment: true
            };

        case RuntimeMode.Standalone:
            return {
                enablePhysics: true,
                enableBehaviorTree: true,
                enableAnimation: true,
                enableInput: true,
                showGrid: false,
                showGizmos: false,
                showAxisIndicator: false,
                triggerLifecycle: true,
                isEditorEnvironment: false
            };
    }
}

/**
 * @zh 检查模式是否为编辑器模式
 * @en Check if mode is an editor mode
 */
export function isEditorMode(mode: RuntimeMode): boolean {
    return mode === RuntimeMode.EditorStatic || mode === RuntimeMode.EditorPreview;
}

/**
 * @zh 检查模式是否应启用游戏逻辑
 * @en Check if mode should enable game logic
 */
export function shouldEnableGameLogic(mode: RuntimeMode): boolean {
    return mode === RuntimeMode.EditorPreview || mode === RuntimeMode.Standalone;
}

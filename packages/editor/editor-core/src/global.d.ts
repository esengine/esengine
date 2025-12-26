/**
 * @zh 全局类型声明
 * @en Global type declarations
 *
 * @zh 扩展 Window 接口以支持编辑器运行时全局变量
 * @en Extend Window interface to support editor runtime global variables
 */

/**
 * @zh SDK 全局对象结构
 * @en SDK global object structure
 */
interface ESEngineSDK {
    Core: typeof import('@esengine/ecs-framework').Core;
    Scene: typeof import('@esengine/ecs-framework').Scene;
    Entity: typeof import('@esengine/ecs-framework').Entity;
    Component: typeof import('@esengine/ecs-framework').Component;
    System: typeof import('@esengine/ecs-framework').System;
    [key: string]: unknown;
}

/**
 * @zh 插件容器结构
 * @en Plugin container structure
 */
interface PluginContainer {
    [pluginName: string]: unknown;
}

/**
 * @zh 用户代码导出结构
 * @en User code exports structure
 */
interface UserExports {
    [name: string]: unknown;
}

declare global {
    interface Window {
        // ESEngine 全局变量（与 EditorConfig.globals 对应）
        // ESEngine globals (matching EditorConfig.globals)
        __ESENGINE_SDK__: ESEngineSDK | undefined;
        __ESENGINE_PLUGINS__: PluginContainer | undefined;
        __USER_RUNTIME_EXPORTS__: UserExports | undefined;
        __USER_EDITOR_EXPORTS__: UserExports | undefined;
    }
}

export {};

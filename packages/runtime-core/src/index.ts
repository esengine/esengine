export {
    RuntimePluginManager,
    runtimePluginManager,
    type SystemContext,
    type ModuleManifest,
    type IRuntimeModule,
    type IRuntimePlugin
} from './PluginManager';

// Plugin Lifecycle State
export {
    PluginLifecycleState,
    VALID_STATE_TRANSITIONS,
    isValidStateTransition,
    isPluginOperable,
    isPluginLoading,
    isPluginAvailable,
    type PluginState,
    type PluginStateChangeEvent,
    type PluginStateChangeListener
} from './PluginState';

export {
    createPlugin,
    registerPlugin,
    initializeRuntime,
    createSystemsForScene,
    resetRuntime,
    type RuntimeConfig
} from './RuntimeBootstrap';

// Plugin Loader
export {
    PluginLoader,
    loadPlugin,
    loadEnabledPlugins,
    registerStaticPlugin,
    getLoadedPlugins,
    resetPluginLoader,
    type PluginLoadState,
    type PluginSourceType,
    type PluginPackageInfo,
    type PluginConfig,
    type ProjectPluginConfig,
    type PluginLoadConfig,
    type PluginLoadInfo,
    type PluginLoaderConfig
} from './PluginLoader';

export {
    BUILTIN_PLUGIN_PACKAGES,
    createDefaultProjectConfig,
    mergeProjectConfig,
    createProjectConfigFromEnabledList,
    convertToPluginLoadConfigs,
    type ProjectConfig,
    type ExtendedPluginPackageInfo
} from './ProjectConfig';

// Platform Adapter
export {
    DefaultPathResolver,
    type IPlatformAdapter,
    type IPathResolver,
    type PlatformCapabilities,
    type PlatformAdapterConfig
} from './IPlatformAdapter';

// Game Runtime
export {
    GameRuntime,
    createGameRuntime,
    type GameRuntimeConfig,
    type RuntimeState
} from './GameRuntime';

// Runtime Mode
export {
    RuntimeMode,
    getRuntimeModeConfig,
    isEditorMode,
    shouldEnableGameLogic,
    type RuntimeModeConfig
} from './RuntimeMode';

// User Code Realm
export {
    UserCodeRealm,
    UserCodeRealmToken,
    type UserCodeRealmConfig,
    type UserSystemInfo,
    type UserComponentInfo
} from './UserCodeRealm';

// ImportMap Generator
export {
    generateImportMap,
    generateImportMapEntries,
    generateImportMapScript,
    extractModuleId,
    getPackageName,
    collectExternalDependencies,
    sortModulesByDependencies,
    type ImportMapMode,
    type ImportMapConfig,
    type ImportMapEntry
} from './ImportMapGenerator';

// Platform Adapters
export {
    BrowserPlatformAdapter,
    BrowserPathResolver,
    type BrowserPlatformConfig,
    type BrowserPathResolveMode,
    EditorPlatformAdapter,
    EditorPathResolver,
    type EditorPlatformConfig
} from './adapters';

// Browser File System Service
export {
    BrowserFileSystemService,
    createBrowserFileSystem,
    type BrowserFileSystemOptions
} from './services/BrowserFileSystemService';

// Runtime Scene Manager
export {
    RuntimeSceneManager,
    RuntimeSceneManagerToken,
    type IRuntimeSceneManager,
    type SceneInfo,
    type SceneLoadOptions,
    type SceneLoader
} from './services/RuntimeSceneManager';

// ============================================================================
// 便捷 Re-exports | Convenience Re-exports
// ============================================================================
// 以下是常用类型的便捷 re-export，让运行时消费者无需添加额外依赖
// These are convenience re-exports for common types, so runtime consumers
// don't need to add extra dependencies

// 输入系统（运行时常用）| Input System (commonly used in runtime)
export {
    Input,
    InputManager,
    InputSystem,
    MouseButton,
    type InputSystemConfig,
    type KeyState,
    type MouseButtonState,
    type KeyboardEventInfo,
    type MouseEventInfo,
    type WheelEventInfo,
    type TouchInfo,
    type TouchEvent
} from '@esengine/engine-core';

// 向量接口（运行时常用）| Vector interfaces (commonly used in runtime)
export type { IVector2, IVector3 } from '@esengine/ecs-framework-math';

// 服务注册基础设施（创建和使用 Token 必需）
// Service registry infrastructure (required for creating and using tokens)
export {
    PluginServiceRegistry,
    createServiceToken,
    type ServiceToken
} from '@esengine/ecs-framework';

// ============================================================================
// 注意：服务 Token 应从其定义模块导入
// Note: Service tokens should be imported from their defining modules
// ============================================================================
// 以下 Token 已移除，请直接从源模块导入：
// The following tokens have been removed, import from source:
//
// - TransformTypeToken     -> @esengine/engine-core
// - RenderSystemToken      -> @esengine/ecs-engine-bindgen
// - EngineIntegrationToken -> @esengine/ecs-engine-bindgen
// - TextureServiceToken    -> @esengine/ecs-engine-bindgen
// - AssetManagerToken      -> @esengine/asset-system
//
// 这遵循 "谁定义接口，谁导出 Token" 原则
// This follows the "whoever defines the interface, exports the token" principle

// Dependency Utils
export {
    // 类型 | Types
    type IDependable,
    type TopologicalSortOptions,
    type TopologicalSortResult,
    type DependencyValidationResult,
    // 依赖 ID 解析 | Dependency ID Resolution
    resolveDependencyId,
    extractShortId,
    getPackageName as getPackageNameFromId,
    // 拓扑排序 | Topological Sort
    topologicalSort,
    // 依赖验证 | Dependency Validation
    validateDependencies as validateItemDependencies,
    getAllDependencies,
    getReverseDependencies
} from './utils/DependencyUtils';

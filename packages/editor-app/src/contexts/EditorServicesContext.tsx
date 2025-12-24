/**
 * @zh 编辑器服务上下文 - 解决 prop drilling 问题
 * @en Editor Services Context - Solves prop drilling issue
 *
 * @zh 提供统一的服务访问入口，避免在组件树中层层传递服务实例
 * @en Provides unified service access, avoiding passing service instances through component tree
 */

import React, { createContext, useContext, useMemo } from 'react';
import type {
    EntityStoreService,
    MessageHub,
    CommandManager,
    InspectorRegistry,
    SceneManagerService,
    ProjectService,
    PluginManager,
    UIRegistry,
    SettingsRegistry,
    BuildService,
    LogService,
    EntityCreationRegistry,
    AssetRegistryService,
} from '@esengine/editor-core';
import type { IDialogExtended } from '../services/TauriDialogService';
import type { INotification } from '@esengine/editor-core';

/**
 * @zh 编辑器核心服务接口
 * @en Editor core services interface
 */
export interface EditorServices {
    // 核心服务 | Core services
    entityStore: EntityStoreService | null;
    messageHub: MessageHub | null;
    commandManager: CommandManager;

    // 场景与项目 | Scene & Project
    sceneManager: SceneManagerService | null;
    projectService: ProjectService | null;

    // 插件与注册表 | Plugin & Registries
    pluginManager: PluginManager | null;
    inspectorRegistry: InspectorRegistry | null;
    uiRegistry: UIRegistry | null;
    settingsRegistry: SettingsRegistry | null;
    entityCreationRegistry?: EntityCreationRegistry | null;
    assetRegistry?: AssetRegistryService | null;

    // 构建与日志 | Build & Logging
    buildService: BuildService | null;
    logService: LogService | null;

    // UI 服务 | UI Services
    notification: INotification | null;
    dialog: IDialogExtended | null;

    // 项目路径 | Project path
    projectPath: string | null;
}

/**
 * @zh 编辑器服务上下文
 * @en Editor services context
 */
const EditorServicesContext = createContext<EditorServices | null>(null);

/**
 * @zh 编辑器服务提供者 Props
 * @en Editor services provider props
 */
export interface EditorServicesProviderProps {
    children: React.ReactNode;
    services: EditorServices;
}

/**
 * @zh 编辑器服务提供者组件
 * @en Editor services provider component
 *
 * @example
 * ```tsx
 * <EditorServicesProvider services={services}>
 *   <SceneHierarchy />
 *   <Inspector />
 * </EditorServicesProvider>
 * ```
 */
export function EditorServicesProvider({ children, services }: EditorServicesProviderProps) {
    const value = useMemo(() => services, [
        services.entityStore,
        services.messageHub,
        services.commandManager,
        services.sceneManager,
        services.projectService,
        services.pluginManager,
        services.inspectorRegistry,
        services.projectPath,
    ]);

    return (
        <EditorServicesContext.Provider value={value}>
            {children}
        </EditorServicesContext.Provider>
    );
}

/**
 * @zh 获取编辑器服务的 Hook
 * @en Hook to get editor services
 *
 * @zh 必须在 EditorServicesProvider 内部使用
 * @en Must be used within EditorServicesProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *     const { entityStore, messageHub, commandManager } = useEditorServices();
 *     // 使用服务...
 * }
 * ```
 */
export function useEditorServices(): EditorServices {
    const context = useContext(EditorServicesContext);
    if (!context) {
        throw new Error(
            'useEditorServices must be used within EditorServicesProvider. ' +
            'Make sure your component is wrapped in <EditorServicesProvider>.'
        );
    }
    return context;
}

/**
 * @zh 可选的编辑器服务 Hook（不抛出错误）
 * @en Optional editor services hook (does not throw)
 *
 * @zh 在 Provider 外部使用时返回 null
 * @en Returns null when used outside Provider
 */
export function useEditorServicesOptional(): EditorServices | null {
    return useContext(EditorServicesContext);
}

/**
 * @zh 获取特定服务的便捷 Hooks
 * @en Convenience hooks for specific services
 */

export function useEntityStore(): EntityStoreService | null {
    return useEditorServices().entityStore;
}

export function useMessageHub(): MessageHub | null {
    return useEditorServices().messageHub;
}

export function useCommandManager(): CommandManager {
    return useEditorServices().commandManager;
}

export function useSceneManager(): SceneManagerService | null {
    return useEditorServices().sceneManager;
}

export function useProjectService(): ProjectService | null {
    return useEditorServices().projectService;
}

export function useInspectorRegistry(): InspectorRegistry | null {
    return useEditorServices().inspectorRegistry;
}

export function useProjectPath(): string | null {
    return useEditorServices().projectPath;
}

export { EditorServicesContext };

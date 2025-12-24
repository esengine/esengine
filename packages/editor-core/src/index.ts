/**
 * @esengine/editor-core
 *
 * Plugin-based editor framework for ECS Framework
 * 基于插件的 ECS 编辑器框架
 */

// ============================================================================
// Service Tokens | 服务令牌 (推荐导入)
// ============================================================================
export * from './tokens';

// ============================================================================
// Plugin System | 插件系统
// ============================================================================
export * from './Config';
export * from './Plugin';

// ============================================================================
// Registry Base | 注册表基类
// ============================================================================
export * from './Services/BaseRegistry';

// ============================================================================
// Core Services | 核心服务
// ============================================================================
export * from './Services/MessageHub';
export * from './Services/LocaleService';
export * from './Services/LogService';
export * from './Services/CommandManager';
export * from './Services/SettingsRegistry';

// ============================================================================
// Entity & Component Services | 实体与组件服务
// ============================================================================
export * from './Services/EntityStoreService';
export * from './Services/ComponentRegistry';
export * from './Services/ComponentDiscoveryService';
export * from './Services/SerializerRegistry';
export * from './Services/PropertyMetadata';

// ============================================================================
// Scene & Project Services | 场景与项目服务
// ============================================================================
export * from './Services/ProjectService';
export * from './Services/SceneManagerService';
export * from './Services/SceneTemplateRegistry';
export * from './Services/PrefabService';

// ============================================================================
// UI & Inspector Services | UI 与检视器服务
// ============================================================================
export * from './Services/UIRegistry';
export * from './Services/InspectorRegistry';
export * from './Services/PropertyRendererRegistry';
export * from './Services/FieldEditorRegistry';
export * from './Services/ComponentInspectorRegistry';
export * from './Services/WindowRegistry';

// ============================================================================
// Asset & File Services | 资产与文件服务
// ============================================================================
export * from './Services/AssetRegistryService';
export * from './Services/FileActionRegistry';
export * from './Services/VirtualNodeRegistry';

// ============================================================================
// Viewport & Gizmo Services | 视口与 Gizmo 服务
// ============================================================================
export * from './Services/IViewportService';
export * from './Services/PreviewSceneService';
export * from './Services/EditorViewportService';
export * from './Services/GizmoInteractionService';
export * from './Gizmos';
export * from './Rendering';

// ============================================================================
// Build & Compile System | 构建与编译系统
// ============================================================================
export * from './Services/Build';
export * from './Services/UserCode';
export * from './Services/CompilerRegistry';

// ============================================================================
// Module System | 模块系统
// ============================================================================
export * from './Services/Module';
export * from './Module/IEventBus';
export * from './Module/ICommandRegistry';
export * from './Module/IPanelRegistry';
export * from './Module/IModuleContext';
export * from './Module/IEditorModule';

// ============================================================================
// Interfaces | 接口定义
// ============================================================================
export * from './Services/ICompiler';
export * from './Services/ICommand';
export * from './Services/BaseCommand';
export * from './Services/IEditorDataStore';
export * from './Services/IFileSystem';
export * from './Services/IDialog';
export * from './Services/INotification';
export * from './Services/IInspectorProvider';
export * from './Services/IPropertyRenderer';
export * from './Services/IFieldEditor';
export * from './Services/ComponentActionRegistry';
export * from './Services/EntityCreationRegistry';
export * from './Types/IFileAPI';
export * from './Types/UITypes';

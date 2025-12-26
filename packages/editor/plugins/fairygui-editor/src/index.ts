/**
 * @esengine/fairygui-editor
 *
 * Editor support for @esengine/fairygui - inspectors, gizmos, and entity templates.
 *
 * FairyGUI 编辑器支持 - 检视器、Gizmo 和实体模板
 */

import type { IEditorPlugin, ModuleManifest } from '@esengine/editor-core';
import { FGUIRuntimeModule } from '@esengine/fairygui';
import { FGUIEditorModule, fguiEditorModule } from './FGUIEditorModule';

// Re-exports
export { FGUIEditorModule, fguiEditorModule } from './FGUIEditorModule';
export { FGUIInspectorContent, FGUIComponentInspector, fguiComponentInspector } from './inspectors';

/**
 * Plugin manifest
 * 插件清单
 */
const manifest: ModuleManifest = {
    id: '@esengine/fairygui',
    name: '@esengine/fairygui',
    displayName: 'FairyGUI',
    version: '1.0.0',
    description: 'FairyGUI UI system for ECS framework with editor support',
    category: 'Other',
    isCore: false,
    defaultEnabled: true,
    isEngineModule: true,
    canContainContent: true,
    dependencies: ['engine-core', 'asset-system'],
    editorPackage: '@esengine/fairygui-editor',
    exports: {
        components: ['FGUIComponent'],
        systems: ['FGUIRenderSystem'],
        loaders: ['FUIAssetLoader']
    },
    assetExtensions: {
        '.fui': 'fui'
    }
};

/**
 * Complete FGUI Plugin (runtime + editor)
 * 完整的 FGUI 插件（运行时 + 编辑器）
 */
export const FGUIPlugin: IEditorPlugin = {
    manifest,
    runtimeModule: new FGUIRuntimeModule(),
    editorModule: fguiEditorModule
};

export default fguiEditorModule;

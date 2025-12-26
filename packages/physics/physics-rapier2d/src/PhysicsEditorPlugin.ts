/**
 * Physics Editor Plugin
 *
 * 编辑器版本的物理插件，不包含 WASM 依赖。
 * Editor version of physics plugin, without WASM dependencies.
 *
 * 使用轻量级 Physics2DComponentsModule 注册组件，
 * 使场景中的物理组件可以正确序列化/反序列化。
 * Uses lightweight Physics2DComponentsModule to register components,
 * enabling proper serialization/deserialization of physics components in scenes.
 */

import type { IRuntimePlugin, ModuleManifest } from '@esengine/engine-core';
import { Physics2DComponentsModule } from './Physics2DComponentsModule';

const manifest: ModuleManifest = {
    id: '@esengine/physics-rapier2d',
    name: '@esengine/physics-rapier2d',
    displayName: 'Physics 2D',
    version: '1.0.0',
    description: 'Deterministic 2D physics with Rapier2D',
    category: 'Physics',
    isCore: false,
    defaultEnabled: false,
    isEngineModule: true,
    canContainContent: false,
    requiresWasm: true,
    dependencies: ['engine-core'],
    exports: {
        components: ['Rigidbody2DComponent', 'BoxCollider2DComponent', 'CircleCollider2DComponent'],
        systems: ['PhysicsSystem']
    }
};

/**
 * 编辑器物理插件（轻量级运行时模块）
 * Editor physics plugin (lightweight runtime module)
 *
 * 使用 Physics2DComponentsModule 注册组件，用于场景反序列化。
 * 不包含 WASM 依赖，不创建物理系统。
 * Uses Physics2DComponentsModule for component registration (scene deserialization).
 * No WASM dependency, no physics system creation.
 */
export const Physics2DPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new Physics2DComponentsModule()
};

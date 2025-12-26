/**
 * @esengine/mesh-3d-editor
 *
 * Editor support for @esengine/mesh-3d - inspectors and entity templates
 * 3D 网格编辑器支持 - 检视器和实体模板
 */

import React from 'react';
import type { Entity, ServiceContainer } from '@esengine/ecs-framework';
import { Core } from '@esengine/ecs-framework';
import type {
    IEditorModuleLoader,
    EntityCreationTemplate,
    IEditorPlugin,
    ModuleManifest,
    PanelDescriptor
} from '@esengine/editor-core';
import {
    EntityStoreService,
    MessageHub,
    EditorComponentRegistry,
    ComponentInspectorRegistry,
    PanelPosition
} from '@esengine/editor-core';
import { TransformComponent } from '@esengine/engine-core';

// Runtime imports from @esengine/mesh-3d
import {
    MeshComponent,
    Animation3DComponent,
    SkeletonComponent,
    Mesh3DRuntimeModule
} from '@esengine/mesh-3d';

// Inspector
import { MeshComponentInspector } from './MeshComponentInspector';

// Panel
import { AnimationPreviewPanel } from './components/AnimationPreviewPanel';

// Export inspector and panel
export { MeshComponentInspector } from './MeshComponentInspector';
export { AnimationPreviewPanel } from './components/AnimationPreviewPanel';

/**
 * 3D 网格编辑器模块
 * Mesh 3D Editor Module
 */
export class Mesh3DEditorModule implements IEditorModuleLoader {
    async install(services: ServiceContainer): Promise<void> {
        // 注册组件检查器 | Register component inspectors
        const componentInspectorRegistry = services.tryResolve(ComponentInspectorRegistry);
        if (componentInspectorRegistry) {
            componentInspectorRegistry.register(new MeshComponentInspector());
        }

        // 注册 Mesh 组件到编辑器组件注册表 | Register Mesh components to editor component registry
        const componentRegistry = services.resolve(EditorComponentRegistry);
        if (componentRegistry) {
            const meshComponents = [
                {
                    name: 'Mesh',
                    type: MeshComponent,
                    category: 'components.category.rendering',
                    description: '3D mesh rendering component',
                    icon: 'Box'
                }
            ];

            for (const comp of meshComponents) {
                componentRegistry.register({
                    name: comp.name,
                    type: comp.type,
                    category: comp.category,
                    description: comp.description,
                    icon: comp.icon
                });
            }

            // Register animation components
            // 注册动画组件
            componentRegistry.register({
                name: 'Animation3D',
                type: Animation3DComponent,
                category: 'components.category.animation',
                description: '3D animation playback component',
                icon: 'Play'
            });

            componentRegistry.register({
                name: 'Skeleton',
                type: SkeletonComponent,
                category: 'components.category.animation',
                description: 'Skeleton component for skinned meshes',
                icon: 'GitBranch'
            });
        }
    }

    async uninstall(): Promise<void> {
        // Nothing to cleanup
    }

    /**
     * 获取面板描述符
     * Get panel descriptors
     */
    getPanels(): PanelDescriptor[] {
        return [
            {
                id: 'animation-preview',
                title: 'Animation Preview',
                titleKey: 'panel.animationPreview',
                icon: 'Play',
                position: PanelPosition.Right,
                component: AnimationPreviewPanel,
                defaultSize: 300,
                resizable: true,
                closable: true,
                order: 150
            }
        ];
    }

    getEntityCreationTemplates(): EntityCreationTemplate[] {
        return [
            // 3D Mesh Entity
            {
                id: 'create-mesh-3d',
                label: '3D Mesh',
                icon: 'Box',
                category: 'rendering',
                order: 200,
                create: (): number => {
                    return this.createMeshEntity('Mesh3D');
                }
            }
        ];
    }

    /**
     * 创建 Mesh 实体的辅助方法
     * Helper method to create Mesh entity
     */
    private createMeshEntity(baseName: string, configure?: (entity: Entity) => void): number {
        const scene = Core.scene;
        if (!scene) {
            throw new Error('Scene not available');
        }

        const entityStore = Core.services.resolve(EntityStoreService);
        const messageHub = Core.services.resolve(MessageHub);

        if (!entityStore || !messageHub) {
            throw new Error('EntityStoreService or MessageHub not available');
        }

        const existingCount = entityStore.getAllEntities()
            .filter((e: Entity) => e.name.startsWith(baseName)).length;
        const entityName = existingCount > 0 ? `${baseName} ${existingCount + 1}` : baseName;

        const entity = scene.createEntity(entityName);

        // Add Transform component
        const transform = new TransformComponent();
        entity.addComponent(transform);

        // Add Mesh component
        const mesh = new MeshComponent();
        entity.addComponent(mesh);

        if (configure) {
            configure(entity);
        }

        entityStore.addEntity(entity);
        messageHub.publish('entity:added', { entity });
        messageHub.publish('scene:modified', {});
        entityStore.selectEntity(entity);

        return entity.id;
    }
}

export const mesh3DEditorModule = new Mesh3DEditorModule();

/**
 * Mesh3D 插件清单
 * Mesh3D Plugin Manifest
 */
const manifest: ModuleManifest = {
    id: '@esengine/mesh-3d',
    name: '@esengine/mesh-3d',
    displayName: 'Mesh 3D',
    version: '1.0.0',
    description: '3D mesh rendering with GLTF/GLB/OBJ/FBX support',
    category: 'Rendering',
    icon: 'Box',
    isCore: false,
    defaultEnabled: true,
    isEngineModule: true,
    canContainContent: true,
    dependencies: ['core', 'math', 'asset-system'],
    exports: {
        components: ['MeshComponent', 'Animation3DComponent', 'SkeletonComponent'],
        systems: ['MeshRenderSystem', 'Animation3DSystem', 'SkeletonBakingSystem']
    },
    requiresWasm: true
};

/**
 * 完整的 Mesh3D 插件（运行时 + 编辑器）
 * Complete Mesh3D Plugin (runtime + editor)
 */
export const Mesh3DPlugin: IEditorPlugin = {
    manifest,
    runtimeModule: new Mesh3DRuntimeModule(),
    editorModule: mesh3DEditorModule
};

export default mesh3DEditorModule;

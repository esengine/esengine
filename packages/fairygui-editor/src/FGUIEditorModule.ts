/**
 * FGUIEditorModule
 *
 * Editor module for FairyGUI integration.
 * Registers components, inspectors, and entity templates.
 *
 * FairyGUI 编辑器模块，注册组件、检视器和实体模板
 */

import type { ServiceContainer, Entity } from '@esengine/ecs-framework';
import { Core } from '@esengine/ecs-framework';
import type { IEditorModuleLoader, EntityCreationTemplate } from '@esengine/editor-core';
import {
    EntityStoreService,
    MessageHub,
    EditorComponentRegistry,
    ComponentInspectorRegistry
} from '@esengine/editor-core';
import { TransformComponent } from '@esengine/engine-core';
import { FGUIComponent } from '@esengine/fairygui';
import { fguiComponentInspector } from './inspectors';

/**
 * FGUIEditorModule
 *
 * Editor module that provides FairyGUI integration.
 *
 * 提供 FairyGUI 集成的编辑器模块
 */
export class FGUIEditorModule implements IEditorModuleLoader {
    /**
     * Install the module
     * 安装模块
     */
    async install(services: ServiceContainer): Promise<void> {
        // Register component
        const componentRegistry = services.resolve(EditorComponentRegistry);
        if (componentRegistry) {
            componentRegistry.register({
                name: 'FGUIComponent',
                type: FGUIComponent,
                category: 'components.category.ui',
                description: 'FairyGUI component for loading and displaying .fui packages',
                icon: 'Layout'
            });
        }

        // Register custom inspector
        const inspectorRegistry = services.resolve(ComponentInspectorRegistry);
        if (inspectorRegistry) {
            inspectorRegistry.register(fguiComponentInspector);
        }
    }

    /**
     * Uninstall the module
     * 卸载模块
     */
    async uninstall(): Promise<void> {
        // Cleanup if needed
    }

    /**
     * Get entity creation templates
     * 获取实体创建模板
     */
    getEntityCreationTemplates(): EntityCreationTemplate[] {
        return [
            {
                id: 'create-fgui-root',
                label: 'FGUI Root',
                icon: 'Layout',
                category: 'ui',
                order: 300,
                create: (): number => this.createFGUIEntity('FGUI Root', { width: 1920, height: 1080 })
            },
            {
                id: 'create-fgui-view',
                label: 'FGUI View',
                icon: 'Image',
                category: 'ui',
                order: 301,
                create: (): number => this.createFGUIEntity('FGUI View')
            }
        ];
    }

    /**
     * Create FGUI entity with optional configuration
     * 创建 FGUI 实体，可选配置
     */
    private createFGUIEntity(baseName: string, config?: { width?: number; height?: number }): number {
        const scene = Core.scene;
        if (!scene) {
            throw new Error('Scene not available');
        }

        const entityStore = Core.services.resolve(EntityStoreService);
        const messageHub = Core.services.resolve(MessageHub);

        if (!entityStore || !messageHub) {
            throw new Error('EntityStoreService or MessageHub not available');
        }

        // Generate unique name
        const existingCount = entityStore.getAllEntities()
            .filter((e: Entity) => e.name.startsWith(baseName)).length;
        const entityName = existingCount > 0 ? `${baseName} ${existingCount + 1}` : baseName;

        // Create entity
        const entity = scene.createEntity(entityName);

        // Add transform component
        entity.addComponent(new TransformComponent());

        // Add FGUI component
        const fguiComponent = new FGUIComponent();
        if (config?.width) fguiComponent.width = config.width;
        if (config?.height) fguiComponent.height = config.height;
        entity.addComponent(fguiComponent);

        // Register and select entity
        entityStore.addEntity(entity);
        messageHub.publish('entity:added', { entity });
        messageHub.publish('scene:modified', {});
        entityStore.selectEntity(entity);

        return entity.id;
    }
}

/**
 * Default FGUI editor module instance
 * 默认 FGUI 编辑器模块实例
 */
export const fguiEditorModule = new FGUIEditorModule();

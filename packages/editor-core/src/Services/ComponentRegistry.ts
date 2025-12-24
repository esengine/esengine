import { Component } from '@esengine/ecs-framework';
import { BaseRegistry, createRegistryToken } from './BaseRegistry';

/**
 * @zh 组件类型信息
 * @en Component type info
 */
export interface ComponentTypeInfo {
    /** @zh 组件名称 @en Component name */
    name: string;
    /** @zh 组件类型 @en Component type */
    type?: new (...args: any[]) => Component;
    /** @zh 分类 @en Category */
    category?: string;
    /** @zh 描述 @en Description */
    description?: string;
    /** @zh 图标 @en Icon */
    icon?: string;
    /** @zh 元数据 @en Metadata */
    metadata?: {
        path?: string;
        fileName?: string;
        [key: string]: any;
    };
}

/**
 * @zh 编辑器组件注册表
 * @en Editor Component Registry
 *
 * @zh 管理编辑器中可用的组件类型元数据（名称、分类、图标等）。
 *     与 ECS 核心的 ComponentRegistry（管理组件位掩码）不同。
 * @en Manages component type metadata (name, category, icon, etc.) for the editor.
 *     Different from the ECS core ComponentRegistry (which manages component bitmasks).
 */
export class EditorComponentRegistry extends BaseRegistry<ComponentTypeInfo> {
    constructor() {
        super('EditorComponentRegistry');
    }

    protected getItemKey(item: ComponentTypeInfo): string {
        return item.name;
    }

    protected override getItemDisplayName(item: ComponentTypeInfo): string {
        return `${item.name}${item.category ? ` [${item.category}]` : ''}`;
    }

    /**
     * @zh 获取组件信息
     * @en Get component info
     */
    getComponent(name: string): ComponentTypeInfo | undefined {
        return this.get(name);
    }

    /**
     * @zh 获取所有组件
     * @en Get all components
     */
    getAllComponents(): ComponentTypeInfo[] {
        return this.getAll();
    }

    /**
     * @zh 按分类获取组件
     * @en Get components by category
     */
    getComponentsByCategory(category: string): ComponentTypeInfo[] {
        return this.filter(c => c.category === category);
    }

    /**
     * @zh 创建组件实例
     * @en Create component instance
     */
    createInstance(name: string, ...args: any[]): Component | null {
        const info = this.get(name);
        if (!info || !info.type) return null;
        return new info.type(...args);
    }
}

/** @zh 编辑器组件注册表服务标识符 @en Editor component registry service identifier */
export const IEditorComponentRegistry = createRegistryToken<EditorComponentRegistry>('EditorComponentRegistry');

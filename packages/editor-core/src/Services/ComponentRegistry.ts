import { Injectable, IService, Component } from '@esengine/ecs-framework';

export interface ComponentTypeInfo {
  name: string;
  type?: new (...args: any[]) => Component;
  category?: string;
  description?: string;
  icon?: string;
  metadata?: {
    path?: string;
    fileName?: string;
    [key: string]: any;
  };
}

/**
 * 编辑器组件注册表
 * Editor Component Registry
 *
 * 管理编辑器中可用的组件类型元数据（名称、分类、图标等）。
 * 与 ECS 核心的 ComponentRegistry（管理组件位掩码）不同。
 *
 * Manages component type metadata (name, category, icon, etc.) for the editor.
 * Different from the ECS core ComponentRegistry (which manages component bitmasks).
 */
@Injectable()
export class EditorComponentRegistry implements IService {
    private components: Map<string, ComponentTypeInfo> = new Map();

    public dispose(): void {
        this.components.clear();
    }

    public register(info: ComponentTypeInfo): void {
        this.components.set(info.name, info);
    }

    public unregister(name: string): void {
        this.components.delete(name);
    }

    public getComponent(name: string): ComponentTypeInfo | undefined {
        return this.components.get(name);
    }

    public getAllComponents(): ComponentTypeInfo[] {
        return Array.from(this.components.values());
    }

    public getComponentsByCategory(category: string): ComponentTypeInfo[] {
        return this.getAllComponents().filter((c) => c.category === category);
    }

    public createInstance(name: string, ...args: any[]): Component | null {
        const info = this.components.get(name);
        if (!info || !info.type) return null;

        return new info.type(...args);
    }
}

import React from 'react';
import { Component } from '@esengine/ecs-framework';
import { PrioritizedRegistry, createRegistryToken, type IPrioritized } from './BaseRegistry';

/**
 * @zh 组件检查器上下文
 * @en Context passed to component inspectors
 */
export interface ComponentInspectorContext {
    /** @zh 被检查的组件 @en The component being inspected */
    component: Component;
    /** @zh 所属实体 @en Owner entity */
    entity: any;
    /** @zh 版本号（用于触发重渲染） @en Version (for triggering re-renders) */
    version?: number;
    /** @zh 属性变更回调 @en Property change callback */
    onChange?: (propertyName: string, value: any) => void;
    /** @zh 动作回调 @en Action callback */
    onAction?: (actionId: string, propertyName: string, component: Component) => void;
}

/**
 * @zh 检查器渲染模式
 * @en Inspector render mode
 */
export type InspectorRenderMode = 'replace' | 'append';

/**
 * @zh 组件检查器接口
 * @en Interface for custom component inspectors
 */
export interface IComponentInspector<T extends Component = Component> extends IPrioritized {
    /** @zh 唯一标识符 @en Unique identifier */
    readonly id: string;
    /** @zh 显示名称 @en Display name */
    readonly name: string;
    /** @zh 目标组件类型名称列表 @en Target component type names */
    readonly targetComponents: string[];
    /**
     * @zh 渲染模式：'replace' 替换默认检查器，'append' 追加到默认检查器后
     * @en Render mode: 'replace' replaces default, 'append' appends after default
     */
    readonly renderMode?: InspectorRenderMode;

    /** @zh 判断是否可以处理该组件 @en Check if can handle the component */
    canHandle(component: Component): component is T;

    /** @zh 渲染组件检查器 @en Render component inspector */
    render(context: ComponentInspectorContext): React.ReactElement;
}

/**
 * @zh 组件检查器注册表
 * @en Registry for custom component inspectors
 */
export class ComponentInspectorRegistry extends PrioritizedRegistry<IComponentInspector> {
    constructor() {
        super('ComponentInspectorRegistry');
    }

    protected getItemKey(item: IComponentInspector): string {
        return item.id;
    }

    protected override getItemDisplayName(item: IComponentInspector): string {
        return `${item.name} (${item.id})`;
    }

    /**
     * @zh 查找可以处理指定组件的检查器（仅 replace 模式）
     * @en Find inspector that can handle the component (replace mode only)
     */
    findInspector(component: Component): IComponentInspector | undefined {
        const sorted = this.getAllSorted().filter(i => i.renderMode !== 'append');
        for (const inspector of sorted) {
            try {
                if (inspector.canHandle(component)) {
                    return inspector;
                }
            } catch (error) {
                this._logger.error(`Error in canHandle for ${inspector.id}:`, error);
            }
        }
        return undefined;
    }

    /**
     * @zh 查找所有追加模式的检查器
     * @en Find all append-mode inspectors for the component
     */
    findAppendInspectors(component: Component): IComponentInspector[] {
        const sorted = this.getAllSorted().filter(i => i.renderMode === 'append');
        const result: IComponentInspector[] = [];
        for (const inspector of sorted) {
            try {
                if (inspector.canHandle(component)) {
                    result.push(inspector);
                }
            } catch (error) {
                this._logger.error(`Error in canHandle for ${inspector.id}:`, error);
            }
        }
        return result;
    }

    /**
     * @zh 检查是否有自定义检查器（replace 模式）
     * @en Check if has custom inspector (replace mode)
     */
    hasInspector(component: Component): boolean {
        return this.findInspector(component) !== undefined;
    }

    /**
     * @zh 检查是否有追加检查器
     * @en Check if has append inspectors
     */
    hasAppendInspectors(component: Component): boolean {
        return this.findAppendInspectors(component).length > 0;
    }

    /**
     * @zh 渲染组件（replace 模式）
     * @en Render component with replace-mode inspector
     */
    render(context: ComponentInspectorContext): React.ReactElement | null {
        const inspector = this.findInspector(context.component);
        if (!inspector) return null;

        try {
            return inspector.render(context);
        } catch (error) {
            this._logger.error(`Error rendering with ${inspector.id}:`, error);
            return React.createElement(
                'span',
                { style: { color: '#f87171', fontStyle: 'italic' } },
                '[Inspector Render Error]'
            );
        }
    }

    /**
     * @zh 渲染追加检查器
     * @en Render append-mode inspectors
     */
    renderAppendInspectors(context: ComponentInspectorContext): React.ReactElement[] {
        const inspectors = this.findAppendInspectors(context.component);
        return inspectors.map(inspector => {
            try {
                return React.createElement(
                    React.Fragment,
                    { key: inspector.id },
                    inspector.render(context)
                );
            } catch (error) {
                this._logger.error(`Error rendering ${inspector.id}:`, error);
                return React.createElement(
                    'span',
                    { key: inspector.id, style: { color: '#f87171', fontStyle: 'italic' } },
                    `[${inspector.name} Error]`
                );
            }
        });
    }

    /**
     * @zh 获取所有注册的检查器
     * @en Get all registered inspectors
     */
    getAllInspectors(): IComponentInspector[] {
        return this.getAll();
    }
}

/** @zh 组件检查器注册表服务标识符 @en Component inspector registry service identifier */
export const IComponentInspectorRegistry = createRegistryToken<ComponentInspectorRegistry>('ComponentInspectorRegistry');

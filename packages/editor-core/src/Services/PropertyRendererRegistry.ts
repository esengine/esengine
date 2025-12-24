/**
 * @zh 属性渲染器注册表
 * @en Property Renderer Registry
 */

import React from 'react';
import { PrioritizedRegistry, createRegistryToken } from './BaseRegistry';
import type { IPropertyRenderer, IPropertyRendererRegistry, PropertyContext } from './IPropertyRenderer';

/**
 * @zh 属性渲染器注册表
 * @en Property Renderer Registry
 */
export class PropertyRendererRegistry
    extends PrioritizedRegistry<IPropertyRenderer>
    implements IPropertyRendererRegistry {

    constructor() {
        super('PropertyRendererRegistry');
    }

    protected getItemKey(item: IPropertyRenderer): string {
        return item.id;
    }

    protected override getItemDisplayName(item: IPropertyRenderer): string {
        return `${item.name} (${item.id})`;
    }

    /**
     * @zh 查找渲染器
     * @en Find renderer
     */
    findRenderer(value: unknown, context: PropertyContext): IPropertyRenderer | undefined {
        return this.findByPriority(renderer => {
            try {
                return renderer.canHandle(value, context);
            } catch (error) {
                this._logger.error(`Error in canHandle for ${renderer.id}:`, error);
                return false;
            }
        });
    }

    /**
     * @zh 渲染属性
     * @en Render property
     */
    render(value: unknown, context: PropertyContext): React.ReactElement | null {
        const renderer = this.findRenderer(value, context);

        if (!renderer) {
            this._logger.debug(`No renderer found for value type: ${typeof value}`);
            return null;
        }

        try {
            return renderer.render(value, context);
        } catch (error) {
            this._logger.error(`Error rendering with ${renderer.id}:`, error);
            return React.createElement(
                'span',
                { style: { color: '#f87171', fontStyle: 'italic' } },
                '[Render Error]'
            );
        }
    }

    /**
     * @zh 获取所有渲染器
     * @en Get all renderers
     */
    getAllRenderers(): IPropertyRenderer[] {
        return this.getAll();
    }

    /**
     * @zh 检查是否有可用渲染器
     * @en Check if renderer is available
     */
    hasRenderer(value: unknown, context: PropertyContext): boolean {
        return this.findRenderer(value, context) !== undefined;
    }
}

/** @zh 属性渲染器注册表服务标识符 @en Property renderer registry service identifier */
export const PropertyRendererRegistryToken = createRegistryToken<PropertyRendererRegistry>('PropertyRendererRegistry');

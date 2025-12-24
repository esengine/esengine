/**
 * @zh Inspector 注册表
 * @en Inspector Registry
 */

import React from 'react';
import { PrioritizedRegistry, createRegistryToken } from './BaseRegistry';
import type { IInspectorProvider, InspectorContext } from './IInspectorProvider';

/**
 * @zh Inspector 注册表
 * @en Inspector Registry
 */
export class InspectorRegistry extends PrioritizedRegistry<IInspectorProvider> {
    constructor() {
        super('InspectorRegistry');
    }

    protected getItemKey(item: IInspectorProvider): string {
        return item.id;
    }

    /**
     * @zh 获取指定 ID 的提供器
     * @en Get provider by ID
     */
    getProvider(providerId: string): IInspectorProvider | undefined {
        return this.get(providerId);
    }

    /**
     * @zh 获取所有提供器
     * @en Get all providers
     */
    getAllProviders(): IInspectorProvider[] {
        return this.getAll();
    }

    /**
     * @zh 查找可以处理指定目标的提供器
     * @en Find provider that can handle the target
     */
    findProvider(target: unknown): IInspectorProvider | undefined {
        return this.findByPriority(provider => provider.canHandle(target));
    }

    /**
     * @zh 渲染 Inspector 内容
     * @en Render inspector content
     */
    render(target: unknown, context: InspectorContext): React.ReactElement | null {
        const provider = this.findProvider(target);
        return provider?.render(target, context) ?? null;
    }
}

/** @zh Inspector 注册表服务标识符 @en Inspector registry service identifier */
export const IInspectorRegistry = createRegistryToken<InspectorRegistry>('InspectorRegistry');

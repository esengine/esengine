/**
 * @zh 组件动作注册表服务
 * @en Component Action Registry Service
 *
 * @zh 管理检视器面板中的组件特定动作
 * @en Manages component-specific actions for the inspector panel
 */

import { createLogger, type ILogger, type IService } from '@esengine/ecs-framework';
import type { ComponentAction } from '../Plugin/EditorModule';
import { createRegistryToken } from './BaseRegistry';

export type { ComponentAction } from '../Plugin/EditorModule';

/**
 * @zh 组件动作注册表
 * @en Component Action Registry
 */
export class ComponentActionRegistry implements IService {
    private readonly _actions = new Map<string, ComponentAction[]>();
    private readonly _logger: ILogger;

    constructor() {
        this._logger = createLogger('ComponentActionRegistry');
    }

    /**
     * @zh 注册组件动作
     * @en Register component action
     */
    register(action: ComponentAction): void {
        const { componentName, id } = action;

        if (!this._actions.has(componentName)) {
            this._actions.set(componentName, []);
        }

        const actions = this._actions.get(componentName)!;
        const existingIndex = actions.findIndex(a => a.id === id);

        if (existingIndex >= 0) {
            this._logger.warn(`Overwriting action: ${id} for ${componentName}`);
            actions[existingIndex] = action;
        } else {
            actions.push(action);
            this._logger.debug(`Registered action: ${id} for ${componentName}`);
        }
    }

    /**
     * @zh 批量注册动作
     * @en Register multiple actions
     */
    registerMany(actions: ComponentAction[]): void {
        for (const action of actions) {
            this.register(action);
        }
    }

    /**
     * @zh 注销动作
     * @en Unregister action
     */
    unregister(componentName: string, actionId: string): boolean {
        const actions = this._actions.get(componentName);
        if (!actions) return false;

        const index = actions.findIndex(a => a.id === actionId);
        if (index < 0) return false;

        actions.splice(index, 1);
        this._logger.debug(`Unregistered action: ${actionId} from ${componentName}`);

        if (actions.length === 0) {
            this._actions.delete(componentName);
        }
        return true;
    }

    /**
     * @zh 获取组件的所有动作（按 order 排序）
     * @en Get all actions for component (sorted by order)
     */
    getActionsForComponent(componentName: string): ComponentAction[] {
        const actions = this._actions.get(componentName);
        if (!actions) return [];
        return [...actions].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    }

    /**
     * @zh 检查组件是否有动作
     * @en Check if component has actions
     */
    hasActions(componentName: string): boolean {
        const actions = this._actions.get(componentName);
        return actions !== undefined && actions.length > 0;
    }

    /** @zh 清空所有动作 @en Clear all actions */
    clear(): void {
        this._actions.clear();
        this._logger.debug('Cleared');
    }

    /** @zh 释放资源 @en Dispose resources */
    dispose(): void {
        this.clear();
    }
}

/** @zh 组件动作注册表服务标识符 @en Component action registry service identifier */
export const IComponentActionRegistry = createRegistryToken<ComponentActionRegistry>('ComponentActionRegistry');

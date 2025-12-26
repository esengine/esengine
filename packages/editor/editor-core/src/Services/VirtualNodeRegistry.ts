/**
 * VirtualNodeRegistry
 *
 * Registry for virtual child nodes in the scene hierarchy.
 * Allows components to expose internal structure as read-only nodes
 * in the hierarchy panel.
 *
 * Uses event-driven architecture for efficient change notification.
 *
 * 场景层级中虚拟子节点的注册表。
 * 允许组件将内部结构作为只读节点暴露在层级面板中。
 * 使用事件驱动架构实现高效的变化通知。
 */

import { createLogger, type Component, type ComponentType, type Entity } from '@esengine/ecs-framework';

const logger = createLogger('VirtualNodeRegistry');

/**
 * Virtual node data
 * 虚拟节点数据
 */
export interface IVirtualNode {
    /** Unique ID within the parent component | 父组件内的唯一 ID */
    id: string;

    /** Display name | 显示名称 */
    name: string;

    /** Node type for icon selection | 节点类型（用于图标选择） */
    type: string;

    /** Child nodes | 子节点 */
    children: IVirtualNode[];

    /** Whether this node is visible | 此节点是否可见 */
    visible: boolean;

    /** Node-specific data for Inspector | Inspector 使用的节点数据 */
    data: Record<string, unknown>;

    /** World X position (for Gizmo) | 世界 X 坐标（用于 Gizmo） */
    x: number;

    /** World Y position (for Gizmo) | 世界 Y 坐标（用于 Gizmo） */
    y: number;

    /** Width (for Gizmo) | 宽度（用于 Gizmo） */
    width: number;

    /** Height (for Gizmo) | 高度（用于 Gizmo） */
    height: number;
}

/**
 * Virtual node provider function
 * 虚拟节点提供者函数
 *
 * Returns an array of virtual nodes for a component instance.
 * 为组件实例返回虚拟节点数组。
 */
export type VirtualNodeProviderFn<T extends Component = Component> = (
    component: T,
    entity: Entity
) => IVirtualNode[];

/**
 * Change event types for virtual nodes
 * 虚拟节点的变化事件类型
 */
export type VirtualNodeChangeType = 'loaded' | 'updated' | 'disposed';

/**
 * Virtual node change event payload
 * 虚拟节点变化事件载荷
 */
export interface VirtualNodeChangeEvent {
    /** Entity ID that changed | 发生变化的实体 ID */
    entityId: number;
    /** Type of change | 变化类型 */
    type: VirtualNodeChangeType;
    /** Component that triggered the change (optional) | 触发变化的组件（可选） */
    component?: Component;
}

/**
 * Change listener function type
 * 变化监听器函数类型
 */
export type VirtualNodeChangeListener = (event: VirtualNodeChangeEvent) => void;

/**
 * VirtualNodeRegistry
 *
 * Manages virtual node providers for different component types.
 * Provides event-driven change notifications for efficient UI updates.
 *
 * 管理不同组件类型的虚拟节点提供者。
 * 提供事件驱动的变化通知以实现高效的 UI 更新。
 */
export class VirtualNodeRegistry {
    private static providers = new Map<ComponentType, VirtualNodeProviderFn>();

    /** Currently selected virtual node info | 当前选中的虚拟节点信息 */
    private static selectedVirtualNodeInfo: {
        entityId: number;
        virtualNodeId: string;
    } | null = null;

    /** Change listeners | 变化监听器 */
    private static changeListeners = new Set<VirtualNodeChangeListener>();

    // ============= Provider Registration | 提供者注册 =============

    /**
     * Register a virtual node provider for a component type
     * 为组件类型注册虚拟节点提供者
     */
    static register<T extends Component>(
        componentType: ComponentType<T>,
        provider: VirtualNodeProviderFn<T>
    ): void {
        this.providers.set(componentType, provider as VirtualNodeProviderFn);
    }

    /**
     * Unregister a virtual node provider
     * 取消注册虚拟节点提供者
     */
    static unregister(componentType: ComponentType): void {
        this.providers.delete(componentType);
    }

    /**
     * Check if a component type has a virtual node provider
     * 检查组件类型是否有虚拟节点提供者
     */
    static hasProvider(componentType: ComponentType): boolean {
        return this.providers.has(componentType);
    }

    // ============= Virtual Node Collection | 虚拟节点收集 =============

    /**
     * Get virtual nodes for a component
     * 获取组件的虚拟节点
     */
    static getVirtualNodes(
        component: Component,
        entity: Entity
    ): IVirtualNode[] {
        const componentType = component.constructor as ComponentType;
        const provider = this.providers.get(componentType);

        if (provider) {
            try {
                return provider(component, entity);
            } catch (e) {
                logger.warn(`Error in provider for ${componentType.name}:`, e);
                return [];
            }
        }

        return [];
    }

    /**
     * Get all virtual nodes for an entity
     * 获取实体的所有虚拟节点
     */
    static getAllVirtualNodesForEntity(entity: Entity): IVirtualNode[] {
        const allNodes: IVirtualNode[] = [];

        for (const component of entity.components) {
            const nodes = this.getVirtualNodes(component, entity);
            allNodes.push(...nodes);
        }

        return allNodes;
    }

    /**
     * Check if an entity has any components with virtual node providers
     * 检查实体是否有任何带有虚拟节点提供者的组件
     */
    static hasAnyVirtualNodeProvider(entity: Entity): boolean {
        for (const component of entity.components) {
            const componentType = component.constructor as ComponentType;
            if (this.providers.has(componentType)) {
                return true;
            }
        }
        return false;
    }

    // ============= Event System | 事件系统 =============

    /**
     * Subscribe to virtual node changes
     * 订阅虚拟节点变化
     *
     * @param listener Callback function for change events
     * @returns Unsubscribe function
     *
     * @example
     * ```typescript
     * const unsubscribe = VirtualNodeRegistry.onChange((event) => {
     *     if (event.entityId === selectedEntityId) {
     *         refreshVirtualNodes();
     *     }
     * });
     *
     * // Later, cleanup
     * unsubscribe();
     * ```
     */
    static onChange(listener: VirtualNodeChangeListener): () => void {
        this.changeListeners.add(listener);
        return () => {
            this.changeListeners.delete(listener);
        };
    }

    /**
     * Notify that an entity's virtual nodes have changed
     * Components should call this when their internal structure changes
     *
     * 通知实体的虚拟节点已更改
     * 组件在内部结构变化时应调用此方法
     *
     * @param entityId The entity ID that changed
     * @param type Type of change ('loaded', 'updated', 'disposed')
     * @param component Optional component reference
     *
     * @example
     * ```typescript
     * // In FGUIComponent after loading completes:
     * VirtualNodeRegistry.notifyChange(this.entity.id, 'loaded', this);
     *
     * // In FGUIComponent when switching component:
     * VirtualNodeRegistry.notifyChange(this.entity.id, 'updated', this);
     * ```
     */
    static notifyChange(
        entityId: number,
        type: VirtualNodeChangeType = 'updated',
        component?: Component
    ): void {
        const event: VirtualNodeChangeEvent = { entityId, type, component };
        for (const listener of this.changeListeners) {
            try {
                listener(event);
            } catch (e) {
                logger.warn('Error in change listener:', e);
            }
        }
    }

    /**
     * Create a React hook-friendly subscription
     * 创建对 React Hook 友好的订阅
     *
     * @param entityIds Set of entity IDs to watch
     * @param callback Callback when any watched entity changes
     * @returns Unsubscribe function
     */
    static watchEntities(
        entityIds: Set<number>,
        callback: () => void
    ): () => void {
        return this.onChange((event) => {
            if (entityIds.has(event.entityId)) {
                callback();
            }
        });
    }

    // ============= Selection State | 选择状态 =============

    /**
     * Set the currently selected virtual node
     * 设置当前选中的虚拟节点
     */
    static setSelectedVirtualNode(entityId: number, virtualNodeId: string): void {
        this.selectedVirtualNodeInfo = { entityId, virtualNodeId };
    }

    /**
     * Clear the virtual node selection
     * 清除虚拟节点选择
     */
    static clearSelectedVirtualNode(): void {
        this.selectedVirtualNodeInfo = null;
    }

    /**
     * Get the currently selected virtual node info
     * 获取当前选中的虚拟节点信息
     */
    static getSelectedVirtualNode(): { entityId: number; virtualNodeId: string } | null {
        return this.selectedVirtualNodeInfo;
    }

    /**
     * Check if a specific virtual node is selected
     * 检查特定虚拟节点是否被选中
     */
    static isVirtualNodeSelected(entityId: number, virtualNodeId: string): boolean {
        return this.selectedVirtualNodeInfo !== null &&
            this.selectedVirtualNodeInfo.entityId === entityId &&
            this.selectedVirtualNodeInfo.virtualNodeId === virtualNodeId;
    }

    // ============= Cleanup | 清理 =============

    /**
     * Clear all registered providers and listeners
     * 清除所有已注册的提供者和监听器
     */
    static clear(): void {
        this.providers.clear();
        this.changeListeners.clear();
        this.selectedVirtualNodeInfo = null;
    }
}
